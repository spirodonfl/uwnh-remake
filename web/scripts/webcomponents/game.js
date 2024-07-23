import { wasm } from '../injector_wasm.js';
import './entity.js';
import './collision-entity.js';
import './viewport-entity.js';
import { globals, possibleKrakenImages } from '../globals.js';
import './draggable.js';
import { globalStyles } from "../global-styles.js";
import { FRAMES } from '../frames.js';
import { getRandomKey } from '../helpers.js';
import { Inputs } from '../inputs.js';
import { Editor } from '../editor.js';
import { Game } from '../game.js';
import { EVENTBUS } from '../eventbus.js';
import { Debug } from '../debug.js';

export class ComponentGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        this.watchResize();

        FRAMES.requestAnimationFrame();

        globals.EVENTBUS.addEventListener('event', (e) => {
            // Debug.log({message: 'game-component event', event: e});
            switch (e.input.event_id) {
                case 'assets_loaded':
                    wasm.game_initializeGame();
                    this.watchResize();
                    break;
                case 'toggle_main_menu':
                    this.toggleMainMenuDisplay();
                    break;
                case 'move_up':
                    Game.mainPlayerMoveUp();
                    break;
                case 'move_down':
                    Game.mainPlayerMoveDown();
                    break;
                case 'move_left':
                    Game.mainPlayerMoveLeft();
                    break;
                case 'move_right':
                    Game.mainPlayerMoveRight();
                    break;
                case 'move_camera_up':
                    Game.moveCameraUp();
                    break;
                case 'move_camera_down':
                    Game.moveCameraDown();
                    break;
                case 'move_camera_left':
                    Game.moveCameraLeft();
                    break;
                case 'move_camera_right':
                    Game.moveCameraRight();
                    break;
                case 'mode_change':
                    ++globals.MODE;
                    if (globals.MODE >= globals.MODES.length) {
                        globals.MODE = 0;
                    }
                    this.updateMode();
                    break;
                case 'attack':
                    Game.mainPlayerAttack();
                    break;
                case 'connect_to_multiplayer':
                    var multiplayer_element = document.querySelector('multiplayer-component');
                    if (!multiplayer_element) {
                        multiplayer_element = document.createElement('multiplayer-component');
                        document.body.appendChild(multiplayer_element);
                    }
                    break;
                case 'connect_to_multiplayer_as_host':
                    var multiplayer_host_element = document.querySelector('multiplayer-host-component');
                    if (!multiplayer_host_element) {
                        multiplayer_host_element = document.createElement('multiplayer-host-component');
                        document.body.appendChild(multiplayer_host_element);
                    }
                    break;
                case 'pause':
                    FRAMES.pause();
                    this.updatePaused();
                    break;
                case 'end_turn':
                    // TODO: Instead of reaching into WASM to get the current entity
                    // you should get current entity by some kind of local store
                    // since, in multiplayer mode, each player is going to have their own
                    // entity ID to pass along here
                    wasm.events_endTurn(wasm.game_getEntityTurn());
                    break;
            }
        });
        
        this.checkMultiplayer();

        this.updateMode();

        this.updatePaused();

        this.updateCurrentEntityTurn();

        FRAMES.addRunOnFrames(10, false, () => {
            let entity_components = this.shadowRoot.querySelectorAll('entity-component');
            for (let e = 0; e < entity_components.length; ++e) {
                if (entity_components[e].auto_animate) {
                    entity_components[e].updateAnimationFrame();
                }
                if (entity_components[e].entity_id == wasm.game_getEntityTurn()) {
                    entity_components[e].showRange();
                } else {
                    entity_components[e].hideRanges();
                }
            }
        });
        FRAMES.addRunOnFrames(1, false, () => {
            this.updateCurrentEntityTurn();
            wasm.game_setGlobalSeed(BigInt(Date.now()));
        });

        wasm.game_setEntityPlayerDriven(1, true);

        this.shadowRoot.querySelector('#main_player_end_turn').addEventListener('click', function () {
            globals.EVENTBUS.triggerEvent({event_id: 'end_turn'});
        });
        this.shadowRoot.querySelector('#main_player_attack').addEventListener('click', function () {
            globals.EVENTBUS.triggerEvent({event_id: 'attack'});
        });
        this.shadowRoot.querySelector('#main_player_move_up').addEventListener('click', function () {
            globals.EVENTBUS.triggerEvent({event_id: 'move_up'});
        });
        this.shadowRoot.querySelector('#main_player_move_down').addEventListener('click', function () {
            globals.EVENTBUS.triggerEvent({event_id: 'move_down'});
        });
        this.shadowRoot.querySelector('#main_player_move_left').addEventListener('click', function () {
            globals.EVENTBUS.triggerEvent({event_id: 'move_left'});
        });
        this.shadowRoot.querySelector('#main_player_move_right').addEventListener('click', function () {
            globals.EVENTBUS.triggerEvent({event_id: 'move_right'});
        });
    }

    checkMultiplayer() {
        if (window.USER) {
            var multiplayer_element = document.querySelector('multiplayer-component');
            if (!multiplayer_element) {
                multiplayer_element = document.createElement('multiplayer-component');
                document.body.appendChild(multiplayer_element);
            }
            globals.MODE = globals.MODES.indexOf('MULTIPLAYER');
            EVENTBUS.triggerEvent({
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
            globals.MODE = globals.MODES.indexOf('MULTIPLAYER_HOST');
            EVENTBUS.triggerEvent({
                event_id: 'mode_change',
                mode: globals.MODES[globals.MODE]
            });
        }
    }

    renderGame() {
        // TODO: Be smart. Only remove components you need and update existing ones
        let entity_components = this.shadowRoot.getElementById('view').querySelectorAll('entity-component');
        for (var i = 0; i < entity_components.length; ++i) {
            entity_components[i].remove();
        }

        let world_index = wasm.game_getCurrentWorldIndex();
        let world_layers = Game.static_layers[world_index];
        for (let i = 0; i < world_layers.length; ++i) {
            if (world_layers[i] !== null && world_layers[i].should_render === true) {
                let static_layer = this.shadowRoot.getElementById('static-layer-' + i);
                if (static_layer) {
                    let camera_x = wasm.viewport_getCameraX();
                    let camera_y = wasm.viewport_getCameraY();
                    static_layer.style.backgroundPosition = '-' + (camera_x * 64) + 'px -' + (camera_y * 64) + 'px';
                    static_layer.style.width = (wasm.viewport_getSizeWidth() * 64) + 'px';
                    static_layer.style.height = (wasm.viewport_getSizeHeight() * 64) + 'px';
                } else {
                    world_layers[i].rendered = true;
                    static_layer = Game.createStaticLayer(i, world_layers[i].image_path);
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
        for (var i = 0; i < (Game.width * Game.height); ++i) {
            var viewport_y = Math.floor(i / Game.width);
            var viewport_x = i % Game.width;
            if (wasm.viewport_getData(viewport_x, viewport_y)) {
                var total_layers = wasm.game_getCurrentWorldTotalLayers();
                for (var layer = 0; layer < total_layers; ++layer) {
                    if (layer === wasm.game_getCurrentWorldCollisionLayer()) { continue; } 

                    if (world_layers[layer] && world_layers[layer].rendered === true) { continue; }

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
            wasm.viewport_setSize(Game.width, Game.height)
            wasm.game_loadWorld(wasm.game_getCurrentWorldIndex());
            // Dispatch an event to let the editor know the
            // size of the viewport
            // NOTE: If you move this into "sizeView" function,
            // it borks the rendering order and causes a panic/out
            // of bounds error in WASM/ZIG
            globals.EVENTBUS.triggerEvent({
                event_id: 'viewport_size',
                event: {
                    width: Game.width,
                    height: Game.height,
                    x_padding: Game.x_padding,
                    y_padding: Game.y_padding
                }
            });
            this.renderGame();
        // });
        // resizeObserver.observe(document.body);
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    updateMode() {
        this.shadowRoot.getElementById('mode').innerText = globals.MODES[globals.MODE];
    }

    updateFPS(value) {
        this.shadowRoot.getElementById('fps_value').innerText = value;
    }

    updateElementCount() {
        let value = 0;
        value += this.shadowRoot.getElementById('view').querySelectorAll('*').length;
        this.shadowRoot.getElementById('els_value').innerText = value;
    }

    updatePaused() {
        this.shadowRoot.getElementById('paused').innerText = FRAMES.getPaused();
    }

    updateCurrentEntityTurn() {
        this.shadowRoot.getElementById('current_entity_turn').innerText = wasm.game_getEntityTurn();
    }

    toggleMainMenuDisplay() {
        // TODO: Use the draggable visible toggle thing
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
        
        let scaled_size = globals.SIZE * globals.SCALE;

        let x = Math.floor(full_width / scaled_size);
        let y = Math.floor(full_height / scaled_size);
        // TODO: What is this magic number 6?
        if (x > 6)
        {
            --x;
        }
        if (y > 6)
        {
            --y;
        }
        // TODO: Eventually replace this with a dynamic limit for docked panels (left or right)
        if (x > 12) {
            x = 12;
        }
        let x_scaled_size = x * scaled_size;
        let y_scaled_size = y * scaled_size;
        let x_padding = (full_width - x_scaled_size) / 2;
        // TODO: Eventually replace this with a dynamic limit for docked panels (left or right)
        x_padding = 0;
        let y_padding = (full_height - y_scaled_size) / 2;
        this.shadowRoot.getElementById('view').style.margin = y_padding + 'px ' + x_padding + 'px';
        this.shadowRoot.getElementById('view').style.width = x_scaled_size + 'px';
        this.shadowRoot.getElementById('view').style.height = y_scaled_size + 'px';
        this.shadowRoot.getElementById('clickable_view').style.width = x_scaled_size + 'px';
        this.shadowRoot.getElementById('clickable_view').style.height = y_scaled_size + 'px';
        Game.width = x;
        Game.height = y;
        Game.x_padding = x_padding;
        Game.y_padding = y_padding;
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
                    <div class="two-column-grid">
                        <div>Paused</div><div id="paused">XXX</div>
                    </div>
                    <div class="two-column-grid">
                        <div>Current Entity Turn</div><div id="current_entity_turn">XXX</div>
                    </div>
                </div>
            </x-draggable>
            <!-- TODO: Finish this -->
            <x-draggable>
                GAME MENU
                <button id="main_player_attack">Attack</button>
                <button id="main_player_end_turn">End Turn</button>
                <button id="main_player_move">Move</button>
                <button id="main_player_move_up">Move Up</button>
                <button id="main_player_move_down">Move Down</button>
                <button id="main_player_move_left">Move Left</button>
                <button id="main_player_move_right">Move Right</button>
            </x-draggable>
            <div id="clickable_view" event-id="clickable_view_clicked"></div>
            <div id="view"></div>
        `;
    }
}
customElements.define('game-component', ComponentGame)
