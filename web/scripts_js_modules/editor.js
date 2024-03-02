import { Draggable } from './draggable.js';
import { wasm } from './injector_wasm.js';
var _GAME = wasm.instance.exports;

export class Editor extends HTMLElement {
    constructor() {
        super();
        this.current_layer = 0;
        this.current_data_id = 0;
        this.last_click = {x: 0, y: 0};
        this.last_atlas_click = {x: 0, y: 0};
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        Draggable(this.shadowRoot.querySelector('#editor'));
        Draggable(this.shadowRoot.querySelector('#atlas'));
        // Listen to game-component for custom event called 'viewport-size'
        var game_component = document.querySelector('game-component');
        GLOBALS.EVENTBUS.addEventListener('viewport-size', (e) => {
            this.onViewportSize(e);
        });
        GLOBALS.EVENTBUS.addEventListener('editor-input', (e) => {
            if (e.code === 'KeyL') {
                ++this.current_layer;
                if (this.current_layer >= _GAME.game_getCurrentWorldTotalLayers()) {
                    this.current_layer = 0;
                }
                this.shadowRoot.getElementById('current_layer_id').value = this.current_layer;
                // TODO: Ideally, only update existing elements, don't remove & add them over and over
                this.renderViewportData();
            } else if (e.code === 'KeyA') {
                this.shadowRoot.getElementById('atlas').classList.toggle('hidden');
            } else if (e.code === 'KeyP') {
                this.shadowRoot.getElementById('editor').classList.toggle('hidden');
            }
        });
        this.shadowRoot.getElementById('clickable_view').addEventListener('click', (e) => {
            // TODO: Holy crap this code is weird
            var game_component = document.querySelector('game-component');
            var x = e.clientX - game_component.x_padding;
            var y = e.clientY - game_component.y_padding;
            x = Math.floor(x / (GLOBALS.SIZE * GLOBALS.SCALE));
            y = Math.floor(y / (GLOBALS.SIZE * GLOBALS.SCALE));
            this.last_click.x = x;
            this.last_click.y = y;
            var clicked_view = this.shadowRoot.getElementById('clicked_view');
            clicked_view.style.display = 'block';
            clicked_view.style.width = (GLOBALS.SIZE * GLOBALS.SCALE) + 'px';
            clicked_view.style.height = (GLOBALS.SIZE * GLOBALS.SCALE) + 'px';
            clicked_view.style.left = game_component.x_padding + (x * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
            clicked_view.style.top = game_component.y_padding + (y * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
            if (_GAME.viewport_getData(x, y)) {
                var data_id = _GAME.game_getWorldDataAtViewportCoordinate(this.current_layer, x, y);
                this.shadowRoot.getElementById('current_data_id').value = data_id;
            }
        });
        this.shadowRoot.getElementById('atlas_img').addEventListener('click', (e) => {
            var original_x = e.offsetX;
            var original_y = e.offsetY;
            var x = Math.floor(original_x / 64);
            var y = Math.floor(original_y / 64);
            // console.log({offsetX: e.offsetX, offsetY: e.offsetY, x, y});
            this.last_atlas_click.x = x;
            this.last_atlas_click.y = y;
            var selected_atlas_image = this.shadowRoot.getElementById('current_selected_atlas_img');
            selected_atlas_image.style.width = '64px';
            selected_atlas_image.style.height = '64px';
            selected_atlas_image.style.backgroundImage = `url("${GLOBALS.ATLAS_PNG_FILENAME}")`;
            selected_atlas_image.style.backgroundPosition = '-' + (x * 64) + 'px -' + (y * 64) + 'px';
        });
        this.shadowRoot.getElementById('apply_image_to_layer_id_input').addEventListener('click', (e) => {
            var layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
            var data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
            var x = this.last_atlas_click.x;
            var y = this.last_atlas_click.y;
            // TODO: What about animations?
            GLOBALS.LAYER_ID_TO_IMAGE[layer_id][data_id] = [
                [x * (GLOBALS.SIZE * GLOBALS.SCALE), y * (GLOBALS.SIZE * GLOBALS.SCALE)]
            ];
            var game_component = document.querySelector('game-component');
            game_component.renderGame();
        });
        this.shadowRoot.getElementById('apply_data_value_to_layer_coordinate_input').addEventListener('click', (e) => {
            var layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
            var data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
            var x = _GAME.game_translateViewportXToWorldX(this.last_click.x);
            var y = _GAME.game_translateViewportYToWorldY(this.last_click.y);
            // TODO: Pull the actual current world as the first parameter
            _GAME.editor_setWorldLayerCoordinateData(0, layer_id, x, y, data_id);
            this.renderViewportData();
            var game_component = document.querySelector('game-component');
            game_component.renderGame();
        });
    }

    renderViewportData() {
        var game_component = document.querySelector('game-component');
        var viewport_entity_components = game_component.shadowRoot.getElementById('view').querySelectorAll('viewport-entity-component');
        for (var i = 0; i < viewport_entity_components.length; ++i) {
            viewport_entity_components[i].remove();
        }
        var collision_entity_components = game_component.shadowRoot.getElementById('view').querySelectorAll('collision-entity-component');
        for (var i = 0; i < collision_entity_components.length; ++i) {
            collision_entity_components[i].remove();
        }
        var y = 0;
        var x = 0;
        for (var i = 0; i < (game_component.width * game_component.height); ++i) {
            var viewport_y = Math.floor(i / game_component.width);
            var viewport_x = i % game_component.width;

            if (_GAME.viewport_getData(viewport_x, viewport_y)) {
                // TODO: this.renderCollisionData();
                // TODO: Should pull COLLISION_LAYER from the wasm file
                // var COLLISION_LAYER = 3;
                // var collision = _GAME.game_getWorldDataAtViewportCoordinate(COLLISION_LAYER, viewport_x, viewport_y);
                // if (collision === 1) {
                //     var collision_entity = document.createElement('collision-entity-component');
                //     collision_entity.updateSize();
                //     collision_entity.setViewportXY(viewport_x, viewport_y);
                //     collision_entity.setLayer(COLLISION_LAYER);
                //     game_component.shadowRoot.getElementById('view').appendChild(collision_entity);
                // }

                var viewport_entity = document.createElement('viewport-entity-component');
                viewport_entity.updateSize();
                viewport_entity.setViewportXY(viewport_x, viewport_y);
                viewport_entity.setLayer(90);
                // TODO: It's weird to set the entity id to the index of the viewport
                viewport_entity.setEntityId(_GAME.game_getWorldDataAtViewportCoordinate(this.current_layer, viewport_x, viewport_y));
                game_component.shadowRoot.getElementById('view').appendChild(viewport_entity);
            }
        }
    }

    onViewportSize(e) {
        var viewport_size = e;
        // TODO: clickable_view should be a separate component
        this.shadowRoot.getElementById('clickable_view').style.width = (viewport_size.width * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.height = (viewport_size.height * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
        // TODO: consider updating top && left instead of margin
        this.shadowRoot.getElementById('clickable_view').style.margin = viewport_size.y_padding + 'px ' + viewport_size.x_padding + 'px';
        this.renderViewportData();
        // TODO: this.renderCollisionData();
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

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
            #editor, #atlas {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 400px;
                height: 400px;
                z-index: 1000001;
                background-color: rgba(0, 0, 0, 0.96);
                color: white;
                border: 2px solid orange;
                border-radius: 8px;
            }
            #editor {
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
            #editor input {
                border: 1px solid rgb(158 158 158);
                padding: 0.8em;
                padding-top: 0.5em;
                padding-bottom: 0.5em;
                width: 100%;
                background-color: transparent;
                color: white;
                border-radius: 4px;
            }
            #editor input[type="button"] {
                cursor: pointer;
            }
            #clickable_view {
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 99999;
            }
            #clicked_view {
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 100000;
                display: none;
                border: 1px solid red;
            }
            </style>
            <div id="clickable_view"></div>
            <div id="clicked_view"></div>
            <div class="hidden" id="editor">
                <div class="draggable-header"></div>
                <div class="title">EDITOR</div>
                <div id="current_asset"><div id="current_asset_img" src=""></div></div>
                <div class="two-column-grid" id="current_layer">
                    <div class="input_title">Current Layer</div><input type="text" id="current_layer_id" value="0" />
                </div>
                <div class="two-column-grid" id="current_data">
                    <div class="input_title">Current Data Value</div><input type="text" id="current_data_id" value="0" />
                </div>
                <div id="apply_data_value_to_layer_coordinate">
                    <input type="button" id="apply_data_value_to_layer_coordinate_input" value="Apply Data Value to Selected World & Layer Coordinate" />
                </div>
                <div id="current_selected_atlas"><div id="current_selected_atlas_img" src=""></div></div>
                <div id="apply_image_to_layer_id">
                    <input type="button" id="apply_image_to_layer_id_input" value="Apply Image to Data" />
                </div>
                <div id="current_editor_mode"></div>
            </div>
            <div class="hidden" id="atlas">
                <div class="draggable-header"></div>
                <div style="overflow: scroll; width: 100%; height: 100%; background: black;">
                    <img id="atlas_img" src="${GLOBALS.ATLAS_PNG_FILENAME}" />
                </div>
            </div>
        `;
    }

    test_updateWorldLayerData() {
        _GAME.editor_setWorldLayerCoordinateData(0, 0, 0, 0, 23);
        this.renderViewportData();
    }
    test_clearWorldLayerData() {
        _GAME.game_resetWorldLayerData(0, 0);
        this.renderViewportData();
    }
    test_addRowToWorld() {
        _GAME.editor_addRowToWorld(0);
        _GAME.game_loadWorld(0);
        console.log([_GAME.game_getCurrentWorldWidth(), _GAME.game_getCurrentWorldHeight()]);
        document.querySelector('game-component').renderGame();
        document.querySelector('editor-component').renderViewportData();
    }
    test_addRowsToWorld() {
        for (var i = 0; i < 20; ++i) {
            _GAME.editor_addRowToWorld(0);
            _GAME.game_loadWorld(0);
            console.log([_GAME.game_getCurrentWorldWidth(), _GAME.game_getCurrentWorldHeight()]);
            document.querySelector('game-component').renderGame();
            document.querySelector('editor-component').renderViewportData();
        }
    }
}
