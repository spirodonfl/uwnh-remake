import { wasm } from './injector_wasm.js';
import './entity.js';
import './collision-entity.js';
import './viewport-entity.js';
import { globals, possibleKrakenImages } from './globals.js';
import '../components/draggable.js';
import { Multiplayer } from './multiplayer.js';
import { MultiplayerHost } from './multiplayer_host.js';
import { globalStyles } from "./global-styles.js";
import { FRAMES } from './frames.js';
import { getRandomKey } from './helpers.js';
import { Inputs } from './inputs.js';

let current_time_stamp = new Date().getTime();
let previous_time_stamp = 0;
let frames_this_second = 0;
let elapsed_ms = 0;
let current_fps = 0;
let then = performance.now();
const interval = 1000 / 30; // Frames per second
let delta = 0;
function updateStats() {
    ++frames_this_second;

    previous_time_stamp = current_time_stamp;
    current_time_stamp = new Date().getTime();
    elapsed_ms += current_time_stamp - previous_time_stamp;
    current_fps = 1000 / (current_time_stamp - previous_time_stamp);

    // Update every second
    if (elapsed_ms >= 1000)
    {
        var game_component = document.querySelector('game-component');
        game_component.updateFPS(frames_this_second);
        elapsed_ms -= 1000;
        frames_this_second = 0;
        game_component.updateElementCount();
    }
}
function tick() {
    let now = performance.now();
    if (now - then >= interval - delta) {
        delta = Math.min(interval, delta + now - then - interval);
        then = now;
        FRAMES.runOnFrames();
        updateStats();

        wasm.game_processTick();

        if (wasm.diff_getLength() > 0) {
            var length = wasm.diff_getLength();
            for (var l = 0; l < length; ++l) {
                var diff = wasm.diff_getData(l);
                // TODO: Fix magic number here. This is also on Zig side
                if (diff === 69) {
                    var attacker_entity_id = wasm.diff_getData((l + 1));
                    var attacker_entity_type = wasm.game_entityGetType(attacker_entity_id);
                    var attackee_entity_id = wasm.diff_getData((l + 2));
                    // TODO: referencing multiplayer-host-component stuff is weird here. global events maybe?
                    if (attacker_entity_type < 3) {
                        var multiplayer_host_element = document.querySelector('multiplayer-host-component');
                        if (multiplayer_host_element) {
                            multiplayer_host_element.incrementLeaderboard(attacker_entity_id, attackee_entity_id);
                            if (attackee_entity_id === 7) {
                                multiplayer_host_element.disableKraken();
                            }
                        }
                    } else if (attacker_entity_type == 99) {                        
                        var health = wasm.game_entityGetHealth(attackee_entity_id);
                        if (health === 0) {
                            var multiplayer_host_element = document.querySelector('multiplayer-host-component');
                            if (multiplayer_host_element) {
                                multiplayer_host_element.despawnUser(attackee_entity_id);
                            }
                        }
                    }
                    l += 2;
                }
            }
            document.querySelector('game-component').renderGame();
            document.querySelector('editor-component').renderViewportData();
            wasm.diff_clearAll();
        }
    }
    requestAnimationFrame(tick);
}

// TODO: THIS IS ALL FOR TESTING, REMOVE THIS SOON
window._GAME = wasm;
window.extractMemory = function (memory_start, memory_length) {
    let data_view = new DataView(wasm.memory.buffer, 0, wasm.memory.byteLength);
    let data = [];
    for (let i = 0; i < memory_length; ++i) {
        let current_position = memory_start + (i * 2);
        data.push(data_view.getUint16(current_position, true));
    }
    return data;
}
window.memoryToBin = function (memory_start, memory_length, file_name) {
    let blob = generateBlob(extractMemory(memory_start, memory_length));
    editorDownload(blob, file_name);
};
window.generateBlob = function (data) {
    return new Blob([new Uint16Array(data)], {type: 'application/octet-stream'});
};
window.generateBlobFromJsonString = function (data) {
    return new Blob([data], {type: 'application/json'});
};
window.editorDownload = function (data, file_name) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(data);

    link.href = url;
    link.download = file_name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export class Game extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        this.width = 0;
        this.height = 0;
        this.x_padding = 0;
        this.y_padding = 0;
        this.atlas = null;
        
        // TODO: Put this in a loader sub object/component
        this.atlas_loaded = false;
        this.layer_id_to_image_loaded = false;

        this.static_layers = [
            [
                [
                    1, // Should be staticized (bool)
                    0, // already rendered
                    import.meta.resolve('../images/world_0_layer_0_frame_0.png'),
                ],
                [
                    1, // Should be staticized (bool)
                    0, // already rendered
                    import.meta.resolve('../images/world_0_layer_1_frame_0.png'),
                ],
                [
                    1, // Should be staticized (bool)
                    0, // already rendered
                    import.meta.resolve('../images/world_0_layer_2_frame_0.png'),
                ],
                null
            ]
        ];

        this.inputs = [
            {
                description: 'Toggle the main menu',
                context: globals.MODES.indexOf('ALL'),
                code: 'KeyX',
                friendlyCode: 'X',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.shadowRoot.getElementById('main_menu').toggleVisibility();
                }
            },
            {
                description: 'Move camera up',
                context: globals.MODES.indexOf('GAME'),
                code: 'ArrowUp',
                friendlyCode: '↑',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveCameraUp();
                }
            },
            {
                description: 'Move camera down',
                context: globals.MODES.indexOf('GAME'),
                code: 'ArrowDown',
                friendlyCode: '↓',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveCameraDown();
                }
            },
            {
                description: 'Move camera left',
                context: globals.MODES.indexOf('GAME'),
                code: 'ArrowLeft',
                friendlyCode: '←',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveCameraLeft();
                }
            },
            {
                description: 'Move camera right',
                context: globals.MODES.indexOf('GAME'),
                code: 'ArrowRight',
                friendlyCode: '→',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveCameraRight();
                }
            },
            {
                description: 'Change Modes',
                context: globals.MODES.indexOf('ALL'),
                code: 'KeyM',
                friendlyCode: 'SHIFT+M',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.changeMode();
                }
            },
            {
                description: 'Move Up',
                context: globals.MODES.indexOf('GAME'),
                code: 'KeyI',
                friendlyCode: 'I',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveMainPlayerUp();
                }
            },
            {
                description: 'Move Down',
                context: globals.MODES.indexOf('GAME'),
                code: 'KeyK',
                friendlyCode: 'K',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveMainPlayerDown();
                }
            },
            {
                description: 'Move Left',
                context: globals.MODES.indexOf('GAME'),
                code: 'KeyJ',
                friendlyCode: 'J',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveMainPlayerLeft();
                }
            },
            {
                description: 'Move Right',
                context: globals.MODES.indexOf('GAME'),
                code: 'KeyL',
                friendlyCode: 'L',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.moveMainPlayerRight();
                }
            },
            {
                description: 'Attack',
                context: globals.MODES.indexOf('GAME'),
                code: 'Space',
                friendlyCode: 'Space',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.mainPlayerAttack();
                }
            },
            {
                description: 'Connect to multiplayer',
                context: globals.MODES.indexOf('ALL'),
                code: 'Digit7',
                friendlyCode: 'Shift+7',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    var multiplayer_element = document.querySelector('multiplayer-component');
                    if (!multiplayer_element) {
                        multiplayer_element = document.createElement('multiplayer-component');
                        document.body.appendChild(multiplayer_element);
                    }
                }
            },
            {
                description: 'Connect to multiplayer (as host)',
                context: globals.MODES.indexOf('ALL'),
                code: 'Digit8',
                friendlyCode: 'Shift+8',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    var multiplayer_host_element = document.querySelector('multiplayer-host-component');
                    if (!multiplayer_host_element) {
                        multiplayer_host_element = document.createElement('multiplayer-host-component');
                        document.body.appendChild(multiplayer_host_element);
                    }
                }
            }
        ];
    }

    connectedCallback() {
        this.render();

        globals.EVENTBUS.addEventListener('event', (e) => {
            console.log('GAME EVENT', e);
            for (var i = 0; i < Inputs.ALL.length; ++i) {
                let input = Inputs.ALL[i];
                if (e.input.input.event_id === input.event_id) {
                    input.callback();
                }
            }
        });

        globals.INPUTS = globals.INPUTS.concat(this.inputs);
        this.shadowRoot.getElementById('mode').innerText = globals.MODES[globals.MODE];

        // TODO: This is kinda weird to put here, it's not the multiplayer file, but we need it here otherwise nothing initializes
        if (window.USER) {
            var multiplayer_element = document.querySelector('multiplayer-component');
            if (!multiplayer_element) {
                multiplayer_element = document.createElement('multiplayer-component');
                document.body.appendChild(multiplayer_element);
            }
            // TODO: functionize this better than what current changeMode is
            globals.MODE = globals.MODES.indexOf('MULTIPLAYER');
            globals.EVENTBUS.triggerEvent({
                event_id: 'mode_change',
                mode: globals.MODES[globals.MODE]
            });
        }
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        if (params.host === 'true') {
            var multiplayer_host_element = document.querySelector('multiplayer-host-component');
            if (!multiplayer_host_element) {
                multiplayer_host_element = document.createElement('multiplayer-host-component');
                document.body.appendChild(multiplayer_host_element);
            }
            // TODO: functionize this better than what current changeMode is
            globals.MODE = globals.MODES.indexOf('MULTIPLAYER_HOST');
            globals.EVENTBUS.triggerEvent({
                event_id: 'mode_change',
                mode: globals.MODES[globals.MODE]
            });
        }

        var atlas = new Image();
        atlas.onload = () => {
            this.atlas_loaded = true;
            this.atlas = atlas;
            this.loaded();
        }
        atlas.src = globals.ATLAS_PNG_FILENAME;
        this.loadJsonFile(globals.IMAGE_DATA, (data) => {
            if (data) {
                globals.IMAGE_DATA = data;
                this.layer_id_to_image_loaded = true;
                this.loaded();
            }
        });

        // TODO: A better way to not repeat our input functionality here
        document.addEventListener('keydown', (e) => {
            console.log('GAME JS KEYDOWN', e);
            for (var i = 0; i < this.inputs.length; ++i) {
                let input = this.inputs[i];
                if (e.code === input.code && e.shiftKey === input.shiftKey && e.ctrlKey === input.ctrlKey) {
                    if (input.context === globals.MODES.indexOf('ALL') || input.context === globals.MODE) {
                        input.callback();
                    }
                }
            }
        });

        FRAMES.addRunOnFrames(10, false, () => {
            let entity_components = this.shadowRoot.querySelectorAll('entity-component');
            for (let e = 0; e < entity_components.length; ++e) {
                if (entity_components[e].auto_animate) {
                    entity_components[e].updateAnimationFrame();
                }
            }
        });
    }

    loadJsonFile(file_path, callback) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('GET', file_path, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var json_data;
                try {
                    json_data = JSON.parse(xhr.responseText);
                } catch (error) {
                    console.error('Error parsing JSON:', error.message);
                }
                callback(json_data);
            } else {
                console.error('Failed to fetch JSON file (' + xhr.status + ' ' + xhr.statusText + ')');
                callback(null);
            }
        }
        };

        xhr.send();
    }

    createStaticLayer(layer_id, image_path) {
        let camera_x = wasm.viewport_getCameraX();
        let camera_y = wasm.viewport_getCameraY();
        let static_layer = document.createElement('div');
        static_layer.id = 'static-layer-' + layer_id;
        static_layer.style.position = 'absolute';
        static_layer.style.width = (wasm.viewport_getSizeWidth() * 64) + 'px';
        static_layer.style.height = (wasm.viewport_getSizeHeight() * 64) + 'px';
        static_layer.style.backgroundImage = 'url(' + image_path + ')';
        // static_layer.style.backgroundSize = '100% 100%';
        // static_layer.style.backgroundRepeat = 'no-repeat';
        static_layer.style.backgroundPosition = '-' + (camera_x * 64) + 'px -' + (camera_y * 64) + 'px';
        static_layer.style.left = '0';
        static_layer.style.top = '0';
        return static_layer;
    }

    randomizeKraken() {
        let kraken_entity_id = 7;
        let entity_layer = wasm.game_getCurrentWorldEntityLayer();
        let random_kraken_image = getRandomKey(possibleKrakenImages);
        this.current_kraken_image = random_kraken_image;
        let image_data = globals.IMAGE_DATA[0][entity_layer][kraken_entity_id];
        if (image_data) {
            image_data[0][0] = possibleKrakenImages[random_kraken_image].x * 64;
            image_data[0][1] = possibleKrakenImages[random_kraken_image].y * 64;
        }
    }

    renderGame() {
        // TODO: Be smart. Only remove components you need and update existing ones
        var entity_components = this.shadowRoot.getElementById('view').querySelectorAll('entity-component');
        for (var i = 0; i < entity_components.length; ++i) {
            entity_components[i].remove();
        }

        for (let i = 0; i < this.static_layers[0].length; ++i) {
            if (this.static_layers[0][i] !== null && this.static_layers[0][i][0] === 1) {
                let static_layer = this.shadowRoot.getElementById('static-layer-' + i);
                if (static_layer) {
                    let camera_x = wasm.viewport_getCameraX();
                    let camera_y = wasm.viewport_getCameraY();
                    static_layer.style.backgroundPosition = '-' + (camera_x * 64) + 'px -' + (camera_y * 64) + 'px';
                    static_layer.style.width = (wasm.viewport_getSizeWidth() * 64) + 'px';
                    static_layer.style.height = (wasm.viewport_getSizeHeight() * 64) + 'px';
                } else {
                    this.static_layers[0][i][1] = 1;
                    static_layer = this.createStaticLayer(i, this.static_layers[0][i][2]);
                    static_layer.style.width = (wasm.viewport_getSizeWidth() * 64) + 'px';
                    static_layer.style.height = (wasm.viewport_getSizeHeight() * 64) + 'px';
                    this.shadowRoot.getElementById('view').appendChild(static_layer);
                }
            }
        }

        var y = 0;
        var x = 0;
        // var cwi = wasm.game_getCurrentWorldIndex();
        // if (DOM.width * DOM.height) !== wasm.viewport_getLength() // panic
        for (var i = 0; i < (this.width * this.height); ++i) {
            var viewport_y = Math.floor(i / this.width);
            var viewport_x = i % this.width;
            if (wasm.viewport_getData(viewport_x, viewport_y)) {
                var total_layers = wasm.game_getCurrentWorldTotalLayers();
                for (var layer = 0; layer < total_layers; ++layer) {
                    if (layer === wasm.game_getCurrentWorldCollisionLayer()) { continue; } 

                    if (this.static_layers[0][layer] && this.static_layers[0][layer][1] === 1) { continue; }

                    if (layer === wasm.game_getCurrentWorldEntityLayer()) {
                        // TODO: Deal with entities properly here
                        var entity_id = wasm.game_getWorldDataAtViewportCoordinate(layer, viewport_x, viewport_y);
                        if (entity_id > 0) {
                            var new_entity = document.createElement('entity-component');
                            new_entity.updateSize();
                            new_entity.setViewportXY(viewport_x, viewport_y);
                            new_entity.setLayer(layer);
                            new_entity.setEntityId(entity_id);
                            this.shadowRoot.getElementById('view').appendChild(new_entity);
                        }
                    } else {
                        var tile_id = wasm.game_getWorldDataAtViewportCoordinate(layer, viewport_x, viewport_y);
                        if (tile_id >= 0) {
                            var new_entity = document.createElement('entity-component');
                            new_entity.updateSize();
                            new_entity.setViewportXY(viewport_x, viewport_y);
                            new_entity.setLayer(layer);
                            new_entity.setEntityId(tile_id);
                            if (layer === 0) {
                                new_entity.setAnimationProperties();
                            }
                            this.shadowRoot.getElementById('view').appendChild(new_entity);
                        }
                    }
                }
            }
        }
        globals.EVENTBUS.triggerEvent({event_id: 'game_rendered'});
    }

    watchResize() {
        // TODO: When you enable resize observer you get... all kinds of weird stuff.
        // Might need to implement a manual process, unfortunately.
        // console.log('watching resize');
        // const resizeObserver = new ResizeObserver((entries) => {
            // console.log('resize observed');
            // const entry = entries[0];
            // console.log(entry.contentRect);
            this.sizeView();
            wasm.viewport_setSize(this.width, this.height);
            wasm.game_loadWorld(wasm.game_getCurrentWorldIndex());
            // Dispatch an event to let the editor know the
            // size of the viewport
            // NOTE: If you move this into "sizeView" function,
            // it borks the rendering order and causes a panic/out
            // of bounds error in WASM/ZIG
            globals.EVENTBUS.triggerNamedEvent('viewport-size', {
                width: this.width,
                height: this.height,
                x_padding: this.x_padding,
                y_padding: this.y_padding
            });
            this.renderGame();
        // });
        // resizeObserver.observe(document.body);
    }

    loaded(e) {
        // TODO: Maybe put a loader component here and let that load first so
        // you can separate out the logic, then the component can dispatch an
        // event when it's done
        if (this.atlas_loaded && this.layer_id_to_image_loaded) {
            console.log('Loaded');
            // this.sizeView();
            if (wasm.game_initializeGame()) {
                this.watchResize();
            }
        }
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    changeMode() {
        ++globals.MODE;
        if (globals.MODE >= globals.MODES.length) {
            globals.MODE = 0;
        }
        this.shadowRoot.getElementById('mode').innerText = globals.MODES[globals.MODE];

        globals.EVENTBUS.triggerEvent({
            event_id: 'mode_change',
            mode: globals.MODES[globals.MODE]
        });
    }

    moveCameraUp() {
        wasm.viewport_moveCameraUp();
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }
    moveCameraDown() {
        wasm.viewport_moveCameraDown();
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }
    moveCameraLeft() {
        wasm.viewport_moveCameraLeft();
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }
    moveCameraRight() {
        wasm.viewport_moveCameraRight();
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }

    moveMainPlayerUp() {
        wasm.messages_moveUp(1, 0);
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }
    moveMainPlayerDown() {
        wasm.messages_moveDown(1, 0);
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }
    moveMainPlayerLeft() {
        wasm.messages_moveLeft(1, 0);
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }
    moveMainPlayerRight() {
        wasm.messages_moveRight(1, 0);
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }
    mainPlayerAttack() {
        wasm.messages_attack(1, 0);
        // TODO: Use the GLOBAL eventbus instead of directly calling these
        document.querySelector('editor-component').renderViewportData();
    }


    updateFPS(value) {
        this.shadowRoot.getElementById('fps_value').innerText = value;
    }

    updateElementCount() {
        let value = 0;
        value += this.shadowRoot.getElementById('view').querySelectorAll('*').length;
        this.shadowRoot.getElementById('els_value').innerText = value;
    }

    toggleMainMenuDisplay() {
        this.shadowRoot.getElementById('main_menu').classList.toggle('hidden');
    }

    sizeView () {
        // Full height, including the scroll part
        var full_height = Math.max(
            // document.body.scrollHeight,
            // document.documentElement.scrollHeight,
            // document.body.offsetHeight,
            // document.documentElement.offsetHeight,
            document.body.clientHeight,
            // document.documentElement.clientHeight
        );
        // Full width, including the scroll part
        var full_width = Math.max(
            // document.body.scrollWidth,
            // document.documentElement.scrollWidth,
            // document.body.offsetWidth,
            // document.documentElement.offsetWidth,
            document.body.clientWidth,
            // document.documentElement.clientWidth
        );

        const root = document.documentElement;
        root.style.setProperty('--scale', globals.SCALE);

        // console.trace({full_width, full_height});

        let x = Math.floor(full_width / (globals.SIZE * globals.SCALE));
        let y = Math.floor(full_height / (globals.SIZE * globals.SCALE));
        // TODO: What is this magic number 6?
        if (x > 6)
        {
            --x;
        }
        if (y > 6)
        {
            --y;
        }
        let x_padding = (full_width - (x * (globals.SIZE * globals.SCALE))) / 2;
        let y_padding = (full_height - (y * (globals.SIZE * globals.SCALE))) / 2;
        this.shadowRoot.getElementById('view').style.margin = y_padding + 'px ' + x_padding + 'px';
        this.shadowRoot.getElementById('view').style.width = (x * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('view').style.height = (y * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.width = (x * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.height = (y * (globals.SIZE * globals.SCALE)) + 'px';
        this.width = x;
        this.height = y;
        this.x_padding = x_padding;
        this.y_padding = y_padding;
    }

    render() {
        this.shadowRoot.innerHTML = `
            ${globalStyles}
            <style>
            #clickable_view {
                width: 100%;
                height: 100vh;
                position: absolute;
                z-index: 1000;
            }
            #view {
                width: 100%;
                height: 100vh;
                /*display: flex;
                align-items: center;
                justify-content: center;*/
                background-image: 
                    linear-gradient(rgba(0, 255, 0, .7) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 255, 0, .7) 1px, transparent 1px);
                background-size: var(--scaled-size-px) var(--scaled-size-px);
                background-position: -1px -1px;
                position: relative;
            }
            #main-menu-container {
                color: white;

                padding: 0.6em;
                display: grid;
                grid-auto-flow: row;
                overflow-y: auto;
            }
            </style>
            <x-draggable name="main_menu" id="main_menu">
                <div id="main-menu-container" style="padding: 1rem">
                    <div class="title">Main Menu</div>
                    <div class="two-column-grid">
                        <div>FPS</div><div id="fps_value">XXX</div>
                    </div>
                    <div class="two-column-grid">
                        <div>Elements</div><div id="els_value">XXX</div>
                    </div>
                    <div class="two-column-grid">
                        <div>Mode</div><div id="mode">XXX</div>
                    </div>
                    <div>
                        Press 'H' for help
                    </div>
                    <div>
                        Press 'X' to hide/show this
                    </div>
                </div>
            </x-draggable>
            <div id="clickable_view"></div>
            <div id="view"></div>
        `;

        requestAnimationFrame(tick);
    }
}
customElements.define('game-component', Game);
