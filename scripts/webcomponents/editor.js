import { wasm } from '../injector_wasm.js';
import '../../components/draggable.js';
import { globals } from '../globals.js';
import { globalStyles } from '../global-styles.js';
import { addEventListenerWithRemoval, removeAndReorder, swapElements } from '../helpers.js';
import { Editor } from '../editor.js';

export class ComponentEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        this.current_layer = 0;
        this.current_data_id = 0;
        this.last_click = {x: 0, y: 0};
        this.last_atlas_click = {x: 0, y: 0};
        this.wasm = wasm;
    }

    initializeInput(e) {
        // NOTE: This is important for listening to keydown/keyup events
        // in a webcomponent
        this.setAttribute('tabindex', '-1');
        this.addEventListener('keydown', (e) => {
            // this.handleInput(e);
        });
        // Note: this is great and all but what if you're NOT in the editor-component
        // but you ARE in editor mode? You'd still want to listen to these events
        // not even document.querySelector('editor-component').focus() fixes this

        console.log('editor: handleInput');
    }

    connectedCallback() {
        this.render();
        globals.EVENTBUS.addEventListener('input', (e) => {
            console.log('editor: input', e);

            if (e.input.input_id === 'toggle_editor') {
                this.shadowRoot.getElementById('editor').toggleVisibility();
            }
            if (e.input.input_id === 'toggle_atlas') {
                this.shadowRoot.getElementById('atlas').toggleVisibility();
            }
            if (e.input.input_id === 'toggle_entity_editor') {
                this.shadowRoot.getElementById('entity-editor').toggleVisibility();
            }
            if (e.input.input_id === 'change_layer') {
                this.incrementLayer();
            }
            if (e.input.input_id === 'add_collision') {
                this.addCollisionToCurrentWorld();
            }
            if (e.input.input_id === 'delete_collision') {
                this.removeCollisionFromCurrentWorld();
            }
            if (e.input.input_id === 'apply_data_value_to_layer_coordinate') {
                this.applyDataValueToLayerCoordinate();
            }
            if (e.input.input_id === 'apply_data_zero_to_layer_coordinate') {
                this.applyDataZeroToLayerCoordinate();
            }
            if (e.input.input_id === 'extract_data_from_selected_coord') {
                this.extractDataFromSelectedCoord();
            }
            if (e.input.input_id === 'extract_image_from_data') {
                this.extractImageFromData();
            }
        });
        globals.EVENTBUS.addEventListener('click', (e) => {
            console.log('editor: click', e);
            if (e.input.input_id === 'create_new_entity') {
                this.createNewEntity();
            }
        });
        globals.EVENTBUS.addEventListener('mode-change', (e) => {
            if (globals.MODES.indexOf('EDITOR') === globals.MODE) {
                this.showLayerValues();
            } else {
                this.hideLayerValues();
            }
        });
        globals.EVENTBUS.addEventListener('viewport-size', (e) => {
            this.onViewportSize(e);

            this.updateEntitiesList();

            // Make sure IMAGE_DATA has an entry for each layer in the world
            if (!globals.IMAGE_DATA[wasm.game_getCurrentWorldIndex()]) {
                globals.IMAGE_DATA[wasm.game_getCurrentWorldIndex()] = [];
            }
            let total_layers = wasm.game_getCurrentWorldTotalLayers();
            for (let i = 0; i < total_layers; ++i) {
                if (!globals.IMAGE_DATA[wasm.game_getCurrentWorldIndex()][i]) {
                    globals.IMAGE_DATA[wasm.game_getCurrentWorldIndex()][i] = [];
                }
            }
        });
        // TODO: How do we convert this to an event + individual functions?
        this.shadowRoot.getElementById('extract_current_entity').addEventListener('click', (e) => {
            let entity_id = parseInt(this.shadowRoot.getElementById('wasm_entity_id').value);
            // TODO: START OF NEW FUNCTION PORTION
            let start = wasm.editor_getEntityMemoryLocation(entity_id);
            let length = wasm.editor_getEntityMemoryLength(entity_id);
            let memory = extractMemory(start, length);
            // TODO: END OF NEW FUNCTION PORTION
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
            console.log('clickable_view_click', e);
            let game_component = document.querySelector('game-component');
            let x = e.clientX - game_component.x_padding;
            let y = e.clientY - game_component.y_padding;

            let size = (globals.SIZE * globals.SCALE);

            x = Math.floor(x / size);
            y = Math.floor(y / size);

            this.last_click.x = x;
            this.last_click.y = y;

            let clicked_view = this.shadowRoot.getElementById('clicked_view');
            clicked_view.style.display = 'block';
            clicked_view.style.width = size + 'px';
            clicked_view.style.height = size + 'px';
            clicked_view.style.left = game_component.x_padding + (x * size) + 'px';
            clicked_view.style.top = game_component.y_padding + (y * size) + 'px';
        });
        this.shadowRoot.getElementById('atlas_img').addEventListener('click', (e) => {
            let original_x = e.offsetX;
            let original_y = e.offsetY;
            let x = Math.floor(original_x / 64);
            let y = Math.floor(original_y / 64);
            // console.log({offsetX: e.offsetX, offsetY: e.offsetY, x, y});
            this.last_atlas_click.x = x;
            this.last_atlas_click.y = y;
            let selected_atlas_image = this.shadowRoot.getElementById('current_selected_atlas_img');
            selected_atlas_image.style.width = '64px';
            selected_atlas_image.style.height = '64px';
            selected_atlas_image.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
            selected_atlas_image.style.backgroundPosition = '-' + (x * 64) + 'px -' + (y * 64) + 'px';
        });
        this.shadowRoot.getElementById('apply_image_data').addEventListener('click', (e) => {
            let layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
            let data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
            let x = this.last_atlas_click.x;
            let y = this.last_atlas_click.y;
            let current_world_index = wasm.game_getCurrentWorldIndex();
            if (!globals.IMAGE_DATA[current_world_index]) {
                globals.IMAGE_DATA[current_world_index] = [];
            }
            if (!globals.IMAGE_DATA[current_world_index][layer_id]) {
                globals.IMAGE_DATA[current_world_index][layer_id] = [];
            }
            globals.IMAGE_DATA[current_world_index][layer_id][data_id] = [
                // TODO: Actually only store the x/y coords, not the translated
                [x * 64, y * 64]
            ];
            // TODO: Send an event instead
            let game_component = document.querySelector('game-component');
            game_component.renderGame();
        });
        this.shadowRoot.getElementById('apply_data_value_to_layer_coordinate_input').addEventListener('click', (e) => {
            this.applyDataValueToLayerCoordinate();
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
        this.shadowRoot.getElementById('add_frame').addEventListener('click', (e) => {
            this.addFrame();
        });
    }

    renderViewportData() {
        if (globals.MODES.indexOf('EDITOR') === globals.MODE) {
            let game_component = document.querySelector('game-component');
            let viewport_entity_components = game_component.shadowRoot.getElementById('view').querySelectorAll('viewport-entity-component');
            for (let i = 0; i < viewport_entity_components.length; ++i) {
                viewport_entity_components[i].remove();
            }
            let collision_entity_components = game_component.shadowRoot.getElementById('view').querySelectorAll('collision-entity-component');
            for (let i = 0; i < collision_entity_components.length; ++i) {
                collision_entity_components[i].remove();
            }
            let y = 0;
            let x = 0;
            for (let i = 0; i < (game_component.width * game_component.height); ++i) {
                let viewport_y = Math.floor(i / game_component.width);
                let viewport_x = i % game_component.width;

                if (wasm.viewport_getData(viewport_x, viewport_y)) {
                    // TODO: this.renderCollisionData();
                    let COLLISION_LAYER = wasm.game_getCurrentWorldCollisionLayer();
                    let collision = wasm.game_getWorldDataAtViewportCoordinate(COLLISION_LAYER, viewport_x, viewport_y);
                    if (collision === 1) {
                        let collision_entity = document.createElement('collision-entity-component');
                        collision_entity.updateSize();
                        collision_entity.setViewportXY(viewport_x, viewport_y);
                        collision_entity.setLayer(COLLISION_LAYER);
                        game_component.shadowRoot.getElementById('view').appendChild(collision_entity);
                    }

                    let viewport_entity = document.createElement('viewport-entity-component');
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

    createNewEntity() {
        let entity_id = parseInt(this.shadowRoot.getElementById('wasm_entity_id').value);
        let entity_type = parseInt(this.shadowRoot.getElementById('wasm_entity_type').value);
        Editor.createNewEntity(entity_type, entity_id);
    }


    onViewportSize(e) {
        console.log('onViewportSize', e);
        let viewport_size = e;
        // TODO: clickable_view should be a separate component
        this.shadowRoot.getElementById('clickable_view').style.width = (viewport_size.width * (globals.SIZE * globals.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.height = (viewport_size.height * (globals.SIZE * globals.SCALE)) + 'px';
        // TODO: consider updating top && left instead of margin
        this.shadowRoot.getElementById('clickable_view').style.margin = viewport_size.y_padding + 'px ' + viewport_size.x_padding + 'px';
        this.renderViewportData();
        // TODO: this.renderCollisionData();
        this.listWorldLayers();
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    updateEntitiesList() {
        let entities = wasm.game_getEntitiesLength();
        console.log('updateEntitiesList->count', entities);
        for (let i = 0; i < entities; ++i) {
            let entity_id = wasm.game_getEntityIdByIndex(i);
            if (!this.shadowRoot.getElementById("entity_id_" + entity_id)) {
                this.shadowRoot.getElementById('entity_id').innerHTML += `<option id="entity_id_${entity_id}" value="${entity_id}">${entity_id}</option>`;
            }
        }
    }

    staticizeLayer() {
        let canvas = document.createElement('canvas');
        canvas.width = wasm.game_getCurrentWorldWidth() * 64;
        canvas.height = wasm.game_getCurrentWorldHeight() * 64;
        let ctx = canvas.getContext('2d');
        let current_layer = this.current_layer;
        let y = 0;
        let x = 0;
        let atlas_image = new Image();
        atlas_image.src = globals.ATLAS_PNG_FILENAME;
        atlas_image.onload = () => {
            for (let i = 0; i < (wasm.game_getCurrentWorldWidth() * wasm.game_getCurrentWorldHeight()); ++i) {
                let x = i % wasm.game_getCurrentWorldWidth();
                let y = Math.floor(i / wasm.game_getCurrentWorldWidth());
                let data = wasm.game_getWorldData(wasm.game_getCurrentWorldIndex(), current_layer, x, y);
                let entity_image_data = globals.IMAGE_DATA[wasm.game_getCurrentWorldIndex()][current_layer][data];
                if (entity_image_data) {
                    ctx.drawImage(
                        atlas_image,
                        entity_image_data[0][0],
                        entity_image_data[0][1],
                        64,
                        64,
                        x * 64,
                        y * 64,
                        64,
                        64
                    );
                }
            }
            let staticized_layer = canvas.toDataURL('image/png');
            let staticized_layer_image = new Image();
            staticized_layer_image.src = staticized_layer;
            // download image as a file
            let a = document.createElement('a');
            a.href = staticized_layer;
            a.download = 'staticized_layer.png';
            a.click();
        };
    }

    extractDataFromSelectedCoord() {
        if (wasm.viewport_getData(this.last_click.x, this.last_click.y)) {
            let data_id = wasm.game_getWorldDataAtViewportCoordinate(this.current_layer, this.last_click.x, this.last_click.y);
            this.shadowRoot.getElementById('current_data_id').value = data_id;
        }
    }

    extractImageFromData() {
        this.last_image_data = null;
        let layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
        let data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
        let current_world_index = wasm.game_getCurrentWorldIndex();
        if (globals.IMAGE_DATA[current_world_index]) {
            if (globals.IMAGE_DATA[current_world_index][layer_id]) {
                if (globals.IMAGE_DATA[current_world_index][layer_id][data_id]) {
                    this.last_image_data = globals.IMAGE_DATA[current_world_index][layer_id][data_id];
                    let frames = Object.keys(this.last_image_data).length;
                    let selected_atlas_image = this.shadowRoot.getElementById('current_selected_atlas_img');
                    selected_atlas_image.style.width = '64px';
                    selected_atlas_image.style.height = '64px';
                    selected_atlas_image.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
                    selected_atlas_image.style.backgroundPosition = '-' + this.last_image_data[0][0] + 'px -' + this.last_image_data[0][1] + 'px';
                    this.shadowRoot.getElementById('total_frames').innerHTML = 'Total Frames: ' + frames;
                    if (frames > 0) {
                        let frames_list = this.shadowRoot.getElementById('frames_list');
                        // TODO: DRY repetitious. Find a better way to implement this
                        // Use <tamplate/>
                        while (frames_list.firstChild) {
                            let auto_cols_element = frames_list.firstChild;
                            while (auto_cols_element.firstChild) {
                                if (auto_cols_element.firstChild.removeListener) {
                                    auto_cols_element.firstChild.removeListener();
                                }
                                auto_cols_element.removeChild(auto_cols_element.firstChild);
                            }
                            frames_list.removeChild(frames_list.firstChild);
                        }
                        for (let f = 0; f < frames; ++f) {
                            let auto_cols_element = document.createElement('div');
                            auto_cols_element.classList.add('auto-cols');
                            
                            let frame_atlas_image = document.createElement('div');
                            frame_atlas_image.classList.add('frame_atlas_img');
                            frame_atlas_image.setAttribute('frame-id', f);
                            frame_atlas_image.style.width = '64px';
                            frame_atlas_image.style.height = '64px';
                            frame_atlas_image.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
                            frame_atlas_image.style.backgroundPosition = '-' + this.last_image_data[f][0] + 'px -' + this.last_image_data[f][1] + 'px';

                            let frame_name = document.createElement('div');
                            frame_name.innerHTML = 'Frame ' + f;

                            let remove_frame = document.createElement('div');
                            remove_frame.classList.add('small-button');
                            remove_frame.innerHTML = 'Remove Frame';
                            remove_frame.setAttribute('frame-id', f);
                            remove_frame.removeListener = addEventListenerWithRemoval(remove_frame, 'click', (e) => {
                                let frame_id = parseInt(e.target.getAttribute('frame-id'));
                                this.last_image_data.splice(frame_id, 1);
                                this.shadowRoot.getElementById('total_frames').innerHTML = 'Total Frames: ' + Object.keys(this.last_image_data).length;
                                this.extractImageFromData();
                            });

                            let update_frame = document.createElement('div');
                            update_frame.classList.add('small-button');
                            update_frame.innerHTML = 'Update Frame';
                            update_frame.setAttribute('frame-id', f);
                            update_frame.removeListener = addEventListenerWithRemoval(update_frame, 'click', (e) => {
                                let frame_id = parseInt(e.target.getAttribute('frame-id'));
                                let frame_atlas_image = this.shadowRoot.querySelector('.frame_atlas_img[frame-id="' + frame_id + '"]');
                                if (frame_atlas_image) {
                                    frame_atlas_image.style.backgroundPosition = '-' + (this.last_atlas_click.x * 64) + 'px -' + (this.last_atlas_click.y * 64) + 'px';
                                    this.last_image_data[frame_id] = [this.last_atlas_click.x * 64, this.last_atlas_click.y * 64];
                                }
                            });

                            auto_cols_element.appendChild(frame_atlas_image);
                            auto_cols_element.appendChild(frame_name);
                            auto_cols_element.appendChild(remove_frame);
                            auto_cols_element.appendChild(update_frame);

                            frames_list.appendChild(auto_cols_element);
                        }
                    }
                }
            }
        }
    }
    addFrame() {
        if (this.last_image_data !== null) {
            let frames = Object.keys(this.last_image_data).length;
            console.log('last_image_data->frames', [this.last_image_data, frames]);
            this.last_image_data[frames] = [this.last_image_data[0][0], this.last_image_data[0][1]];
            console.log('last_image_data->frames', [this.last_image_data, frames]);

            let f = frames;
            // TODO: DRY
            // use <template/>
            let frames_list = this.shadowRoot.getElementById('frames_list');
            let auto_cols_element = document.createElement('div');
            auto_cols_element.classList.add('auto-cols');
            
            let frame_atlas_image = document.createElement('div');
            frame_atlas_image.classList.add('frame_atlas_img');
            frame_atlas_image.setAttribute('frame-id', f);
            frame_atlas_image.style.width = '64px';
            frame_atlas_image.style.height = '64px';
            frame_atlas_image.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
            frame_atlas_image.style.backgroundPosition = '-' + this.last_image_data[f][0] + 'px -' + this.last_image_data[f][1] + 'px';

            let frame_name = document.createElement('div');
            frame_name.innerHTML = 'Frame ' + f;

            let remove_frame = document.createElement('div');
            remove_frame.classList.add('small-button');
            remove_frame.innerHTML = 'Remove Frame';
            remove_frame.setAttribute('frame-id', f);
            remove_frame.removeListener = addEventListenerWithRemoval(remove_frame, 'click', (e) => {
                // TODO: DRY
                let frame_id = parseInt(e.target.getAttribute('frame-id'));
                this.last_image_data.splice(frame_id, 1);
                this.shadowRoot.getElementById('total_frames').innerHTML = 'Total Frames: ' + Object.keys(this.last_image_data).length;
                this.extractImageFromData();
            });

            let update_frame = document.createElement('div');
            update_frame.classList.add('small-button');
            update_frame.innerHTML = 'Update Frame';
            update_frame.setAttribute('frame-id', f);
            update_frame.removeListener = addEventListenerWithRemoval(update_frame, 'click', (e) => {
                let frame_id = parseInt(e.target.getAttribute('frame-id'));
                let frame_atlas_image = this.shadowRoot.querySelector('.frame_atlas_img[frame-id="' + frame_id + '"]');
                if (frame_atlas_image) {
                    frame_atlas_image.style.backgroundPosition = '-' + (this.last_atlas_click.x * 64) + 'px -' + (this.last_atlas_click.y * 64) + 'px';
                    this.last_image_data[frame_id] = [this.last_atlas_click.x * 64, this.last_atlas_click.y * 64];
                }
            });

            auto_cols_element.appendChild(frame_atlas_image);
            auto_cols_element.appendChild(frame_name);
            auto_cols_element.appendChild(remove_frame);
            auto_cols_element.appendChild(update_frame);

            frames_list.appendChild(auto_cols_element);
        }
    }
    getImageData() {
        return globals.IMAGE_DATA;
    }

    applyDataValueToLayerCoordinate() {
        let layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
        let data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
        let x = wasm.game_translateViewportXToWorldX(this.last_click.x);
        let y = wasm.game_translateViewportYToWorldY(this.last_click.y);
        let current_world_index = wasm.game_getCurrentWorldIndex();
        wasm.editor_setWorldLayerCoordinateData(0, layer_id, x, y, data_id);
        this.renderViewportData();
        document.querySelector('game-component').renderGame();
        if (layer_id == wasm.game_getCurrentWorldEntityLayer()) {
            this.updateEntitiesList();
        }
    }
    applyDataZeroToLayerCoordinate() {
        let layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
        let data_id = 0;
        let x = wasm.game_translateViewportXToWorldX(this.last_click.x);
        let y = wasm.game_translateViewportYToWorldY(this.last_click.y);
        // TODO: Pull the actual current world as the first parameter
        wasm.editor_setWorldLayerCoordinateData(0, layer_id, x, y, data_id);
        this.renderViewportData();
        let game_component = document.querySelector('game-component');
        game_component.renderGame();
    }

    showLayerValues() {
        console.log('showLayerValues');
        let components = document.querySelector('game-component').shadowRoot.querySelectorAll('viewport-entity-component');
        for (let e = 0; e < components.length; ++e) {
            components[e].showValue();
        }
        components = document.querySelector('game-component').shadowRoot.querySelectorAll('collision-entity-component');
        for (let c = 0; c < components.length; ++c) {
            components[c].style.display = 'block';
        }
    }
    hideLayerValues() {
        console.log('hideLayerValues');
        let components = document.querySelector('game-component').shadowRoot.querySelectorAll('viewport-entity-component');
        for (let e = 0; e < components.length; ++e) {
            components[e].hideValue();
        }
        components = document.querySelector('game-component').shadowRoot.querySelectorAll('collision-entity-component');
        for (let c = 0; c < components.length; ++c) {
            components[c].style.display = 'none';
        }
    }

    listWorldLayers() {
        console.log('listWorldLayers');
        let total_layers = wasm.game_getCurrentWorldTotalLayers();
        let world_layers_list = this.shadowRoot.getElementById('world_layers_list');
        // TODO: Implement this listener method everywhere else
        while (world_layers_list.firstChild) {
            let auto_cols_element = world_layers_list.firstChild;
            while (auto_cols_element.firstChild) {
                if (auto_cols_element.firstChild.removeListener) {
                    auto_cols_element.firstChild.removeListener();
                }
                auto_cols_element.removeChild(auto_cols_element.firstChild);
            }
            world_layers_list.removeChild(world_layers_list.firstChild);
        }
        // TODO: We are doing this custom element stuff because of eventlisteners
        // BUT if we're going to listen to inputs at a global level or at the
        // webcomponent level then we don't have to do this and we can even
        // use templates
        for (let i = 0; i < total_layers; ++i) {
            let layer_type = 'G';
            let is_entity_layer = false;
            let is_collision_layer = false;
            console.log('Current entity layer', wasm.game_getCurrentWorldEntityLayer());
            if (i === wasm.game_getCurrentWorldEntityLayer()) {
                is_entity_layer = true;
                layer_type = 'E';
            }
            if (i === wasm.game_getCurrentWorldCollisionLayer()) {
                is_collision_layer = true;
                layer_type = 'C';
            }
            let auto_cols_element = document.createElement('div');
            auto_cols_element.classList.add('auto-cols');
            let layer_id_element = document.createElement('div');
            layer_id_element.innerHTML = 'Layer ' + i + '[' + layer_type + ']';
            auto_cols_element.appendChild(layer_id_element);
            let buttons = [
                'layer_list_view',
                'view',
                'layer_list_move_up',
                'move up',
                'layer_list_move_down',
                'move down',
                'layer_list_set_as_collision_layer',
                'set as collision layer',
                'layer_list_set_as_entity_layer',
                'set as entity layer',
            ];
            for (let b = 0; b < buttons.length; b += 2) {
                let button = document.createElement('div');
                button.classList.add('small-button');
                button.setAttribute('id', buttons[b]);
                button.setAttribute('layer-id', i);
                button.innerHTML = buttons[(b + 1)];
                let listener = null;
                if (buttons[b] === 'layer_list_view') {
                    listener = addEventListenerWithRemoval(button, 'click', (e) => {
                        this.gotoLayer(e.target.getAttribute('layer-id'));
                    });
                } else if (buttons[b] === 'layer_list_move_up') {
                    listener = addEventListenerWithRemoval(button, 'click', (e) => {
                        let current_layer = parseInt(e.target.getAttribute('layer-id'));
                        console.log('layer_list_move_up, current_layer', current_layer);
                        if (current_layer > 0) {
                            wasm.editor_moveLayer(0, current_layer, (current_layer - 1));
                            swapElements(globals.IMAGE_DATA[0], current_layer, current_layer - 1);
                            wasm.diff_addData(0);
                            this.listWorldLayers();
                            this.renderViewportData();
                        }
                    });
                } else if (buttons[b] === 'layer_list_move_down') {
                    listener = addEventListenerWithRemoval(button, 'click', (e) => {
                        let current_layer = parseInt(e.target.getAttribute('layer-id'));
                        console.log('layer_list_move_down, current_layer', current_layer);
                        // TODO: Ideally we keep total_layers contained within this function
                        if (current_layer < (total_layers - 1)) {
                            wasm.editor_moveLayer(0, current_layer, (current_layer + 1));
                            swapElements(globals.IMAGE_DATA[0], current_layer, current_layer + 1);
                            wasm.diff_addData(0);
                            this.listWorldLayers();
                            this.renderViewportData();
                        }
                    });
                } else if (buttons[b] === 'layer_list_set_as_collision_layer') {
                    listener = addEventListenerWithRemoval(button, 'click', (e) => {
                        let current_layer = parseInt(e.target.getAttribute('layer-id'));
                        console.log('layer_list_set_as_collision_layer, current_layer', current_layer);
                        wasm.game_setCurrentWorldCollisionLayer(current_layer);
                        this.listWorldLayers();
                        this.renderViewportData();
                    });
                } else if (buttons[b] === 'layer_list_set_as_entity_layer') {
                    listener = addEventListenerWithRemoval(button, 'click', (e) => {
                        let current_layer = parseInt(e.target.getAttribute('layer-id'));
                        console.log('layer_list_set_as_entity_layer, current_layer', current_layer);
                        wasm.game_setCurrentWorldEntityLayer(current_layer);
                        this.listWorldLayers();
                        this.renderViewportData();
                    });
                } else {
                    listener = addEventListenerWithRemoval(button, 'click', (e) => {});
                }
                button.removeListener = listener;
                auto_cols_element.appendChild(button);
            }
            world_layers_list.appendChild(auto_cols_element);
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
    gotoLayer(layer_index) {
        if (layer_index >= wasm.game_getCurrentWorldTotalLayers()) {
            layer_index = 0;
        }
        this.current_layer = layer_index;
        this.shadowRoot.getElementById('current_layer_id').value = this.current_layer;
        this.shadowRoot.getElementById('current_layer_id').value = this.current_layer;
        this.shadowRoot.getElementById('current_world_layer_extract_filename').innerHTML = 'world_0_layer_' + this.current_layer + '.bin';
        // TODO: Ideally, only update existing elements, don't remove & add them over and over
        this.renderViewportData();
    }

    extractCurrentWorldMemory() {
        let current_world_index = wasm.game_getCurrentWorldIndex();
        let start = wasm.editor_getWorldMemoryLocation(current_world_index);
        let length = wasm.editor_getWorldMemoryLength(current_world_index);
        return extractMemory(start, length);
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
                    <div><input type="button" input-id="extract_current_entity" id="extract_current_entity" value="Extract Current Entity" /></div>
                    <div><input type="button" input-id="create_new_entity" id="create_new_entity" value="Create New Entity" /></div>
                </div>
            </x-draggable>
            <x-draggable name="editor" id="editor" visible="false">
                <div id="editor-container">
                    <div class="draggable-header"></div>
                    <div class="title">EDITOR</div>
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
                    <div id="apply_image_data_wrapper">
                        <input type="button" id="apply_image_data" value="Apply Image to Data" />
                        <div id="total_frames">0</div>
                        <div id="frames_list_wrapper">
                            <div>Frames List</div>
                            <div id="frames_list"></div>
                            <input type="button" id="add_frame" value="Add Frame" />
                        </div>
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
                    <div id="extract_current_world_data">
                        <div id="current_world_extract_filename">world_0_data.bin</div>
                        <input type="button" id="extract_current_world_data_input" value="Extract Current World Data" />
                    </div>
                    <div id="extract_current_world_layer_data">
                        <div id="current_world_layer_extract_filename">world_0_layer_0.bin</div>
                        <input type="button" id="extract_current_world_layer_data_input" value="Extract Current World Layer Data" />
                    </div>
                    <div id="world_layers_list_wrapper">
                        <div>World Layers</div>
                        <div id="world_layers_list"></div>
                    </div>
                </div>
            </x-draggable>
            <x-draggable visible="false" name="atlas" id="atlas">
                <div id="atlas-container">
                    <img id="atlas_img" src="${globals.ATLAS_PNG_FILENAME}" />
                </div>
            </x-draggable>
        `;
    }
}
customElements.define('editor-component', ComponentEditor);
