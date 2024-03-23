import { wasm } from './injector_wasm.js';
import './webcomponents/entity.js';
import './webcomponents/collision-entity.js';
import './webcomponents/viewport-entity.js';
import { globals, possibleKrakenImages } from './globals.js';
import '../components/draggable.js';
import { globalStyles } from "./global-styles.js";
import { FRAMES } from './frames.js';
import { getRandomKey } from './helpers.js';
import { Inputs } from './inputs.js';
import { Editor } from './editor.js';

export class Game extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();

        FRAMES.requestAnimationFrame();

        globals.EVENTBUS.addEventListener('event', (e) => {
            console.log('GAME EVENT', e);
        });

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

        FRAMES.addRunOnFrames(10, false, () => {
            let entity_components = this.shadowRoot.querySelectorAll('entity-component');
            for (let e = 0; e < entity_components.length; ++e) {
                if (entity_components[e].auto_animate) {
                    entity_components[e].updateAnimationFrame();
                }
            }
        });
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
            // TODO: Eventually replace this with triggerEvent
            globals.EVENTBUS.triggerNamedEvent('viewport-size', {
                width: this.width,
                height: this.height,
                x_padding: this.x_padding,
                y_padding: this.y_padding
            });
            globals.EVENTBUS.triggerEvent({
                event_id: 'viewport-size',
                event: {
                    width: this.width,
                    height: this.height,
                    x_padding: this.x_padding,
                    y_padding: this.y_padding
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
        // TODO: Should run this on mode_change event
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
        // TODO: Clean this up, lots of repetitious code
        let x_padding = (full_width - (x * (globals.SIZE * globals.SCALE))) / 2;
        let y_padding = (full_height - (y * (globals.SIZE * globals.SCALE))) / 2;
        this.shadowRoot.getElementById('view').style.margin = y_padding + 'px ' + x_padding + 'px';
        this.shadowRoot.getElementById('view').style.width = (x * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('view').style.height = (y * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.width = (x * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.height = (y * (globals.SIZE * globals.SCALE)) + 'px';
        // TODO: Update the main game class, no this component
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
    }
}
customElements.define('game-component', Game)
