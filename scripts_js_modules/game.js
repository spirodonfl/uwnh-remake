import { wasm } from './injector_wasm.js';
import './entity.js';
import './collision-entity.js';
import './viewport-entity.js';
import { globals } from './globals.js';
import '../components/draggable.js';

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
        updateStats();

        wasm.game_processTick();

        if (wasm.diff_getLength() > 0) {
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

    /**
     *  
var entity_type = 99; // 99, 98, 1, 3(x4)
var entity_id = 1;
wasm.editor_createEntity(entity_type, entity_id);
var start = wasm.editor_getEntityMemoryLocation(entity_id);
var length = wasm.editor_getEntityMemoryLength(entity_id);
var entity_data = extractMemory(start, length);
var entity_data_as_blob = generateBlob(entity_data);
editorDownload(entity_data_as_blob, 'entity_' + (entity_id - 1) + '.bin');
     */
}
window.memoryToBin = function (memory_start, memory_length, file_name) {
    let blob = generateBlob(extractMemory(memory_start, memory_length));
    editorDownload(blob, file_name);
};
window.generateBlob = function (data) {
    return new Blob([new Uint16Array(data)], {type: 'application/octet-stream'});
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

        this.inputs = [
            {
                description: 'Toggle the main menu',
                context: globals.MODES.indexOf('ALL'),
                code: 'KeyX',
                friendlyCode: 'X',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.toggleMainMenuDisplay();
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
                description: 'Connect to multiplayer',
                context: globals.MODES.indexOf('ALL'),
                code: 'KeyC',
                friendlyCode: 'C',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    console.log('Connect to multiplayer');
                }
            }
        ];
    }

    connectedCallback() {
        this.render();
        globals.INPUTS = globals.INPUTS.concat(this.inputs);
        this.shadowRoot.getElementById('mode').innerText = globals.MODES[globals.MODE];

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
            for (var i = 0; i < this.inputs.length; ++i) {
                let input = this.inputs[i];
                if (e.code === input.code && e.shiftKey === input.shiftKey && e.ctrlKey === input.ctrlKey) {
                    if (input.context === globals.MODES.indexOf('ALL') || input.context === globals.MODE) {
                        input.callback();
                    }
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

    renderGame() {
        // TODO: Be smart. Only remove components you need and update existing ones
        var entity_components = this.shadowRoot.getElementById('view').querySelectorAll('entity-component');
        for (var i = 0; i < entity_components.length; ++i) {
            entity_components[i].remove();
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
                    if (layer === wasm.game_getCurrentWorldEntityLayer()) {
                        // TODO: Deal with entities properly here
                        // TODO: Some IDs are not showing up, probably because they don't have data. Show them anyways
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
                            this.shadowRoot.getElementById('view').appendChild(new_entity);
                        }
                    }
                }
            }
        }
    }

    watchResize() {
        console.log('watching resize');
        const resizeObserver = new ResizeObserver((entries) => {
            // console.log('resize observed');
            const entry = entries[0];
            // entry.contentRect
            this.sizeView();
            wasm.viewport_setSize(this.width, this.height);
            wasm.game_loadWorld(wasm.game_getCurrentWorldIndex());
            // Dispatch an event to let the editor know the
            // size of the viewport
            // NOTE: If you move this into "sizeView" function,
            // it borks the rendering order and causes a panic/out
            // of bounds error in WASM/ZIG
            globals.EVENTBUS.triggerEvent('viewport-size', [
                {
                    width: this.width,
                    height: this.height,
                    x_padding: this.x_padding,
                    y_padding: this.y_padding
                }
            ]);
            this.renderGame();
        });
        resizeObserver.observe(document.body);
    }

    loaded(e) {
        // TODO: Maybe put a loader component here and let that load first so
        // you can separate out the logic, then the component can dispatch an
        // event when it's done
        if (this.atlas_loaded && this.layer_id_to_image_loaded) {
            console.log('Loaded');
            // this.sizeView();
            wasm.game_initializeGame();
            this.watchResize();
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


    updateFPS(value) {
        this.shadowRoot.getElementById('fps_value').innerText = value;
    }

    updateElementCount() {
        let value = 0;
        value += this.shadowRoot.querySelectorAll('*').length;
        this.shadowRoot.getElementById('els_value').innerText = value;
    }

    toggleMainMenuDisplay() {
        this.shadowRoot.getElementById('main_menu').classList.toggle('hidden');
    }

    sizeView () {
        // Full height, including the scroll part
        const full_height = Math.max(
            // document.body.scrollHeight,
            // document.documentElement.scrollHeight,
            // document.body.offsetHeight,
            // document.documentElement.offsetHeight,
            document.body.clientHeight,
            // document.documentElement.clientHeight
        );
        // Full width, including the scroll part
        const full_width = Math.max(
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
            <style>
            .two-column-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-gap: 1em 0em;
                align-items: center;
            }
            .title {
                text-align: center;
                font-size: 1.5em;
            }
            .hidden {
                display: none !important;
            }
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
            .draggable-header {
                width: 100%;
                height: 2em;
                background-color: orange;
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
