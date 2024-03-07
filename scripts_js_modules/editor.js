import { wasm } from './injector_wasm.js';
import '../components/draggable.js';
import { globals } from './globals.js';
import { globalStyles } from './global-styles.js';

export class Editor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        this.current_layer = 0;
        this.current_data_id = 0;
        this.last_click = {x: 0, y: 0};
        this.last_atlas_click = {x: 0, y: 0};

        this.inputs = [
            {
                description: 'Toggle Editor',
                context: globals.MODES.indexOf('EDITOR'),
                code: 'KeyP',
                friendlyCode: 'P',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.shadowRoot.getElementById('editor').toggleVisibility();
                }
            },
            {
                description: 'Toggle Atlas',
                context: globals.MODES.indexOf('EDITOR'),
                code: 'KeyA',
                friendlyCode: 'A',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.shadowRoot.getElementById('atlas').toggleVisibility();
                }
            },
            {
                description: 'Toggle Entity Editor',
                context: globals.MODES.indexOf('EDITOR'),
                code: 'KeyE',
                friendlyCode: 'E',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.shadowRoot.getElementById('entity-editor').toggleVisibility();
                }
            },
            {
                description: 'Change Layer',
                context: globals.MODES.indexOf('EDITOR'),
                code: 'KeyL',
                friendlyCode: 'L',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.incrementLayer();
                }
            },
            {
                description: 'Add Collision',
                context: globals.MODES.indexOf('EDITOR'),
                code: 'KeyA',
                friendlyCode: 'SHIFT+A',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.addCollisionToCurrentWorld();
                }
            },
            {
                description: 'Delete Collision',
                context: globals.MODES.indexOf('EDITOR'),
                code: 'KeyD',
                friendlyCode: 'SHIFT+D',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.removeCollisionFromCurrentWorld();
                }
            },
        ];
    }

    connectedCallback() {
        this.render();
        globals.INPUTS = globals.INPUTS.concat(this.inputs);
        // Listen to game-component for custom event called 'viewport-size'
        var game_component = document.querySelector('game-component');
        globals.EVENTBUS.addEventListener('mode-change', (e) => {
            console.log('editor: mode-change');
            if (globals.MODES.indexOf('EDITOR') === globals.MODE) {
                this.showLayerValues();
            } else {
                this.hideLayerValues();
            }
        });
        globals.EVENTBUS.addEventListener('viewport-size', (e) => {
            this.onViewportSize(e);

            // TODO: Move this to a more global area. What if you add an entity on the fly?
            let entities = wasm.game_getEntitiesLength();
            for (var i = 0; i < entities; ++i) {
                let entity_id = wasm.game_getEntityIdByIndex(i);
                if (!this.shadowRoot.getElementById("entity_id_" + entity_id)) {
                    this.shadowRoot.getElementById('entity_id').innerHTML += `<option id="entity_id_${entity_id}" value="${entity_id}">${entity_id}</option>`;
                }
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
        this.shadowRoot.getElementById('extract_current_entity').addEventListener('click', (e) => {
            let entity_id = parseInt(this.shadowRoot.getElementById('wasm_entity_id').value);
            let start = wasm.editor_getEntityMemoryLocation(entity_id);
            let length = wasm.editor_getEntityMemoryLength(entity_id);
            let memory = extractMemory(start, length);
            memory[0] = parseInt(this.shadowRoot.getElementById('wasm_entity_id').value);
            memory[1] = parseInt(this.shadowRoot.getElementById('wasm_entity_type').value);
            memory[2] = parseInt(this.shadowRoot.getElementById('wasm_entity_is_collision').value);
            memory[3] = parseInt(this.shadowRoot.getElementById('wasm_entity_health_component_on_off').value);
            memory[4] = parseInt(this.shadowRoot.getElementById('wasm_entity_health_component_default_value').value);
            memory[5] = parseInt(this.shadowRoot.getElementById('wasm_entity_movement_component_on_off').value);
            memory[6] = parseInt(this.shadowRoot.getElementById('wasm_entity_attack_component_on_off').value);
            if (memory.length > 0) {
                let entity_blob = generateBlob(memory);
                editorDownload(entity_blob, 'entity_' + entity_id + '.bin');
            } else {
                console.error('Memory length of 0 when extracting entity!');
            }
        });
        this.shadowRoot.getElementById('create_new_entity').addEventListener('click', (e) => {
            let entity_id = parseInt(this.shadowRoot.getElementById('wasm_entity_id').value);
            let entity_type = parseInt(this.shadowRoot.getElementById('wasm_entity_type').value);
            let entity_index = wasm.editor_createEntity(entity_type, entity_id);
            let start = wasm.editor_getEntityMemoryLocationByIndex(entity_index);
            let length = wasm.editor_getEntityMemoryLengthByIndex(entity_index);
            let memory = extractMemory(start, length);
            if (memory.length > 0) {
                let entity_blob = generateBlob(memory);
                editorDownload(entity_blob, 'entity_' + entity_id + '.bin');
            } else {
                console.error('Memory length of 0 when extracting entity!');
            }
        });
        this.shadowRoot.getElementById('entity_id').addEventListener('change', (e) => {
            // console.log('entity_id chosen', e);
            // console.log('chosen value', e.target.value);
            let start = wasm.editor_getEntityMemoryLocation(e.target.value);
            let length = wasm.editor_getEntityMemoryLength(e.target.value);
            let memory = extractMemory(start, length);
            this.shadowRoot.getElementById('wasm_entity_id').value = memory[0];
            this.shadowRoot.getElementById('wasm_entity_type').value = memory[1];
            this.shadowRoot.getElementById('wasm_entity_is_collision').value = memory[2];
            this.shadowRoot.getElementById('wasm_entity_health_component_on_off').value = memory[3];
            this.shadowRoot.getElementById('wasm_entity_health_component_default_value').value = memory[4];
            this.shadowRoot.getElementById('wasm_entity_movement_component_on_off').value = memory[5];
            this.shadowRoot.getElementById('wasm_entity_attack_component_on_off').value = memory[6];
        });
        this.shadowRoot.getElementById('clickable_view').addEventListener('click', (e) => {
            // TODO: Holy crap this code is weird
            var game_component = document.querySelector('game-component');
            var x = e.clientX - game_component.x_padding;
            var y = e.clientY - game_component.y_padding;
            x = Math.floor(x / (globals.SIZE * globals.SCALE));
            y = Math.floor(y / (globals.SIZE * globals.SCALE));
            this.last_click.x = x;
            this.last_click.y = y;
            var clicked_view = this.shadowRoot.getElementById('clicked_view');
            clicked_view.style.display = 'block';
            clicked_view.style.width = (globals.SIZE * globals.SCALE) + 'px';
            clicked_view.style.height = (globals.SIZE * globals.SCALE) + 'px';
            clicked_view.style.left = game_component.x_padding + (x * (globals.SIZE * globals.SCALE)) + 'px';
            clicked_view.style.top = game_component.y_padding + (y * (globals.SIZE * globals.SCALE)) + 'px';
            if (wasm.viewport_getData(x, y)) {
                var data_id = wasm.game_getWorldDataAtViewportCoordinate(this.current_layer, x, y);
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
            selected_atlas_image.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
            selected_atlas_image.style.backgroundPosition = '-' + (x * 64) + 'px -' + (y * 64) + 'px';
        });
        this.shadowRoot.getElementById('apply_image_data').addEventListener('click', (e) => {
            var layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
            var data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
            var x = this.last_atlas_click.x;
            var y = this.last_atlas_click.y;
            // TODO: What about animations?
            var current_world_index = wasm.game_getCurrentWorldIndex();
            if (!globals.IMAGE_DATA[current_world_index]) {
                globals.IMAGE_DATA[current_world_index] = {};
            }
            if (!globals.IMAGE_DATA[current_world_index][layer_id]) {
                globals.IMAGE_DATA[current_world_index][layer_id] = {};
            }
            globals.IMAGE_DATA[current_world_index][layer_id][data_id] = [
                [x * (globals.SIZE * globals.SCALE), y * (globals.SIZE * globals.SCALE)]
            ];
            var game_component = document.querySelector('game-component');
            game_component.renderGame();
        });
        this.shadowRoot.getElementById('apply_data_value_to_layer_coordinate_input').addEventListener('click', (e) => {
            var layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
            var data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
            var x = wasm.game_translateViewportXToWorldX(this.last_click.x);
            var y = wasm.game_translateViewportYToWorldY(this.last_click.y);
            // TODO: Pull the actual current world as the first parameter
            wasm.editor_setWorldLayerCoordinateData(0, layer_id, x, y, data_id);
            this.renderViewportData();
            var game_component = document.querySelector('game-component');
            game_component.renderGame();
        });

        this.shadowRoot.getElementById('add_row_input').addEventListener('click', (e) => {
            this.addRowToWorld();
        });
        this.shadowRoot.getElementById('remove_row_input').addEventListener('click', (e) => {
            this.removeRowFromWorld();
        });
        this.shadowRoot.getElementById('add_column_input').addEventListener('click', (e) => {
            this.addColumnToWorld();
        });
        this.shadowRoot.getElementById('remove_column_input').addEventListener('click', (e) => {
            this.removeColumnFromWorld();
        });
        this.shadowRoot.getElementById('extract_current_world_data_input').addEventListener('click', (e) => {
            this.extractCurrentWorldData();
        });
        this.shadowRoot.getElementById('extract_current_world_layer_data_input').addEventListener('click', (e) => {
            this.extractCurrentWorldLayerData();
        });
        this.shadowRoot.getElementById('extract_image_data').addEventListener('click', (e) => {
            this.extractImageData();
        });
    }

    renderViewportData() {
        if (globals.MODES.indexOf('EDITOR') === globals.MODE) {
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

                if (wasm.viewport_getData(viewport_x, viewport_y)) {
                    // TODO: this.renderCollisionData();
                    var COLLISION_LAYER = wasm.game_getCurrentWorldCollisionLayer();
                    var collision = wasm.game_getWorldDataAtViewportCoordinate(COLLISION_LAYER, viewport_x, viewport_y);
                    if (collision === 1) {
                        var collision_entity = document.createElement('collision-entity-component');
                        collision_entity.updateSize();
                        collision_entity.setViewportXY(viewport_x, viewport_y);
                        collision_entity.setLayer(COLLISION_LAYER);
                        game_component.shadowRoot.getElementById('view').appendChild(collision_entity);
                    }

                    var viewport_entity = document.createElement('viewport-entity-component');
                    viewport_entity.updateSize();
                    viewport_entity.setViewportXY(viewport_x, viewport_y);
                    viewport_entity.setLayer(90);
                    // TODO: It's weird to set the entity id to the index of the viewport
                    viewport_entity.setEntityId(wasm.game_getWorldDataAtViewportCoordinate(this.current_layer, viewport_x, viewport_y));
                    game_component.shadowRoot.getElementById('view').appendChild(viewport_entity);
                }
            }
        }
    }

    onViewportSize(e) {
        var viewport_size = e;
        // TODO: clickable_view should be a separate component
        this.shadowRoot.getElementById('clickable_view').style.width = (viewport_size.width * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.height = (viewport_size.height * (globals.SIZE * globals.SCALE)) + 'px';
        // TODO: consider updating top && left instead of margin
        this.shadowRoot.getElementById('clickable_view').style.margin = viewport_size.y_padding + 'px ' + viewport_size.x_padding + 'px';
        this.renderViewportData();
        // TODO: this.renderCollisionData();
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    showLayerValues() {
        console.log('showLayerValues');
        var components = document.querySelector('game-component').shadowRoot.querySelectorAll('viewport-entity-component');
        for (var e = 0; e < components.length; ++e) {
            components[e].showValue();
        }
        components = document.querySelector('game-component').shadowRoot.querySelectorAll('collision-entity-component');
        for (var c = 0; c < components.length; ++c) {
            components[c].style.display = 'block';
        }
    }
    hideLayerValues() {
        console.log('hideLayerValues');
        var components = document.querySelector('game-component').shadowRoot.querySelectorAll('viewport-entity-component');
        for (var e = 0; e < components.length; ++e) {
            components[e].hideValue();
        }
        components = document.querySelector('game-component').shadowRoot.querySelectorAll('collision-entity-component');
        for (var c = 0; c < components.length; ++c) {
            components[c].style.display = 'none';
        }
    }

    addRowToWorld() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        wasm.editor_addRowToWorld(current_world_index);
        wasm.game_loadWorld(current_world_index);
        // TODO: Clean this up. Not necessarily a good thing to
        // be referencing the components as HTML elements here
        // USE GLOBAL EVENT LISTENER BUS!
        document.querySelector('game-component').renderGame();
        document.querySelector('editor-component').renderViewportData();
    }
    removeRowFromWorld() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        wasm.editor_removeRowFromWorld(current_world_index);
        wasm.game_loadWorld(current_world_index);
        // TODO: Clean this up. Not necessarily a good thing to
        // be referencing the components as HTML elements here
        // USE GLOBAL EVENT LISTENER BUS!
        document.querySelector('game-component').renderGame();
        document.querySelector('editor-component').renderViewportData();
    }
    addColumnToWorld() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        wasm.editor_addColumnToWorld(current_world_index);
        wasm.game_loadWorld(current_world_index);
        // TODO: Clean this up. Not necessarily a good thing to
        // be referencing the components as HTML elements here
        // USE GLOBAL EVENT LISTENER BUS!
        document.querySelector('game-component').renderGame();
        document.querySelector('editor-component').renderViewportData();
    }
    removeColumnFromWorld() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        wasm.editor_removeColumnFromWorld(current_world_index);
        wasm.game_loadWorld(current_world_index);
        // TODO: Clean this up. Not necessarily a good thing to
        // be referencing the components as HTML elements here
        // USE GLOBAL EVENT LISTENER BUS!
        document.querySelector('game-component').renderGame();
        document.querySelector('editor-component').renderViewportData();
    }

    incrementLayer() {
        ++this.current_layer;
        if (this.current_layer >= wasm.game_getCurrentWorldTotalLayers()) {
            this.current_layer = 0;
        }
        this.shadowRoot.getElementById('current_layer_id').value = this.current_layer;
        this.shadowRoot.getElementById('current_layer_id').value = this.current_layer;
        this.shadowRoot.getElementById('current_world_layer_extract_filename').innerHTML = 'world_0_layer_' + this.current_layer + '.bin';
        // TODO: Ideally, only update existing elements, don't remove & add them over and over
        this.renderViewportData();
    }

    extractCurrentWorldData() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        let start = wasm.editor_getWorldMemoryLocation(current_world_index);
        let length = wasm.editor_getWorldMemoryLength(current_world_index);
        let world_data = extractMemory(start, length);
        let world_data_as_blob = generateBlob(world_data);
        editorDownload(world_data_as_blob, 'world_' + current_world_index + '_data.bin');
    }
    extractCurrentWorldLayerData() {
        let layer_id = this.current_layer;
        let current_world_index = wasm.game_getCurrentWorldIndex();
        let start = wasm.editor_getWorldLayerMemoryLocation(current_world_index, layer_id);
        let length = wasm.editor_getWorldLayerMemoryLength(current_world_index, layer_id);
        let layer_data = extractMemory(start, length);
        let layer_data_as_blob = generateBlob(layer_data);
        editorDownload(layer_data_as_blob, 'world_' + current_world_index + '_layer_' + layer_id + '.bin');
    }
    extractImageData() {
        // TODO: Later on, implement image data per world so it's not a crazy big JSON file
        // let current_world_index = wasm.game_getCurrentWorldIndex();
        // let image_data = JSON.stringify(GLOBALS.IMAGE_DATA[current_world_index]);
        let image_data = JSON.stringify(globals.IMAGE_DATA);
        let image_data_as_blob = new Blob([image_data], {type: 'application/json'});
        editorDownload(image_data_as_blob, 'image_data.json');
    }

    addCollisionToCurrentWorld() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        let x = wasm.game_translateViewportXToWorldX(this.last_click.x);
        let y = wasm.game_translateViewportYToWorldY(this.last_click.y);
        let collision_layer = wasm.game_getCurrentWorldCollisionLayer();
        wasm.editor_setWorldLayerCoordinateData(current_world_index, collision_layer, x, y, 1);
        this.renderViewportData();
    }
    removeCollisionFromCurrentWorld() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        let x = wasm.game_translateViewportXToWorldX(this.last_click.x);
        let y = wasm.game_translateViewportYToWorldY(this.last_click.y);
        let collision_layer = wasm.game_getCurrentWorldCollisionLayer();
        wasm.editor_setWorldLayerCoordinateData(current_world_index, collision_layer, x, y, 0);
        this.renderViewportData();
    }

    render() {
        this.shadowRoot.innerHTML = `
            ${globalStyles}
            <style>
            #editor-container {
                padding: 0.6em;
                display: grid;
                grid-auto-flow: row;
                overflow-y: auto;
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
            <x-draggable name="entity-editor" id="entity-editor" visible="false">
                <div id="editor-container">
                    <div class="title">Entity</div>
                    <div><select id="entity_id"></select></div>
                    <div>Entity ID: <input type="text" id="wasm_entity_id" /></div>
                    <div>Entity Type: <input type="text" id="wasm_entity_type" /></div>
                    <div>Entity Is Collision: <input type="text" id="wasm_entity_is_collision" /></div>
                    <div>Entity Health Component: <input type="text" id="wasm_entity_health_component_on_off" /></div>
                    <div>Entity Health Component Default Value:<input type="text" id="wasm_entity_health_component_default_value" /></div>
                    <div>Entity Movement Component: <input type="text" id="wasm_entity_movement_component_on_off" /></div>
                    <div>Entity Attack Component: <input type="text" id="wasm_entity_attack_component_on_off" /></div>
                    <div><input type="button" id="extract_current_entity" value="Extract Current Entity" /></div>
                    <div><input type="button" id="create_new_entity" value="Create New Entity" /></div>
                </div>
            </x-draggable>
            <x-draggable name="editor" id="editor" visible="false">
                <div id="editor-container">
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
                    <div id="apply_image_data">
                        <input type="button" id="apply_image_data" value="Apply Image to Data" />
                        <div>[SET ANIMATION FRAME (default 0)]</div>
                        <input type="button" id="extract_image_data" value="Extract Image to Data" />
                    </div>
                    <div id="add_remove_row">
                        <input type="button" id="add_row_input" value="Add Row to World" />
                        <input type="button" id="remove_row_input" value="Remove Row from World" />
                    </div>
                    <div id="add_remove_column">
                        <input type="button" id="add_column_input" value="Add Column to World" />
                        <input type="button" id="remove_column_input" value="Remove Column from World" />
                    </div>
                    <div id="current_editor_mode">[CURRENT EDITOR MODE HERE]</div>
                    <div id="extract_current_world_data">
                        <div id="current_world_extract_filename">world_0_data.bin</div>
                        <input type="button" id="extract_current_world_data_input" value="Extract Current World Data" />
                    </div>
                    <div id="extract_current_world_layer_data">
                        <div id="current_world_layer_extract_filename">world_0_layer_0.bin</div>
                        <input type="button" id="extract_current_world_layer_data_input" value="Extract Current World Layer Data" />
                    </div>
                    <div id="edit_entity">[EDIT ENTITY HERE]</div>
                    <div id="extract_entity">[EXTRACT ENTITY HERE] entity_0.bin</div>
                    <div id="list_world_layers">[LIST WORLD LAYERS HERE]</div>
                    <div id="change_world_entity_layer">[CHANGE WORLD ENTITY LAYER HERE]</div>
                    <div id="change_world_collisions_layer">[CHANGE WORLD COLLISIONS LAYER HERE]</div>
                </div>
            </x-draggable>
            <x-draggable visible="false" name="atlas" id="atlas">
                <div id="atlas-container">
                    <img id="atlas_img" src="${globals.ATLAS_PNG_FILENAME}" />
                </div>
            </x-draggable>
        `;
    }

    test_updateWorldLayerData() {
        wasm.editor_setWorldLayerCoordinateData(0, 0, 0, 0, 23);
        this.renderViewportData();
    }
    test_clearWorldLayerData() {
        wasm.game_resetWorldLayerData(0, 0);
        this.renderViewportData();
    }
    test_addRowToWorld() {
        wasm.editor_addRowToWorld(0);
        wasm.game_loadWorld(0);
        console.log([wasm.game_getCurrentWorldWidth(), wasm.game_getCurrentWorldHeight()]);
        document.querySelector('game-component').renderGame();
        document.querySelector('editor-component').renderViewportData();
    }
    test_addRowsToWorld() {
        for (var i = 0; i < 20; ++i) {
            wasm.editor_addRowToWorld(0);
            wasm.game_loadWorld(0);
            console.log([wasm.game_getCurrentWorldWidth(), wasm.game_getCurrentWorldHeight()]);
            document.querySelector('game-component').renderGame();
            document.querySelector('editor-component').renderViewportData();
        }
    }
}
customElements.define('editor-component', Editor);
