var EDITOR = {
    last_clicked_coordinates: [0, 0],
    current_world_id: 0,
    current_layer_id: 0,
    current_data_id: 0,
    // TODO: Do not hard code this. Include it in the world data.
    collision_layer_id: 3,
    last_npc_selected: 0,
    // 0 = normal, 1 = auto-pull-value, 2 = show layer value on top each tile
    mode: 0,
    mode_as_string: ['Normal', 'Auto Pull Value', 'Show All Values'],
    current_asset_coords: [0, 0],
    last_clicked_element: null,
    init: function () {
        this.updateEditorModeDisplay();

        this.current_data_id_el = document.getElementById('current_data_id');
        this.current_data_id_el.addEventListener('keyup', function () {
            EDITOR.current_data_id = EDITOR.current_data_id_el.value;
        });
        this.current_layer_id_el = document.getElementById('current_layer_id');
        this.current_layer_id_el.addEventListener('keyup', function () {
            EDITOR.current_layer_id = EDITOR.current_layer_id_el.value;
        });

        this.current_asset_img_el = document.getElementById('current_asset_img');
        this.current_asset_img_el.style.width = (SIZE * SCALE) + 'px';
        this.current_asset_img_el.style.height = (SIZE * SCALE) + 'px';
        this.current_asset_img_el.style.border = '1px solid red';
        this.current_asset_img_el.style.backgroundImage = 'url("' + ATLAS_PNG_FILENAME + '")';
        this.updateCurrentAssetImg();

        this.last_clicked_element = document.createElement('div');
        this.last_clicked_element.classList.add('hide');
        this.last_clicked_element.style.width = (SIZE * SCALE) + 'px';
        this.last_clicked_element.style.height = (SIZE * SCALE) + 'px';
        this.last_clicked_element.style.position = 'absolute';
        this.last_clicked_element.style.border = '2px solid red';
        // TODO: Is there a better way to track & set this?
        this.last_clicked_element.style.zIndex = 99999;
        document.getElementById('view').appendChild(this.last_clicked_element);

        var element_view = document.getElementById('view');
        var element_clickable_view = document.getElementById('clickable_view');
        element_clickable_view.addEventListener('click', function (e) {
            let x = Math.floor(e.offsetX / (SIZE * SCALE));
            let y = Math.floor(e.offsetY / (SIZE * SCALE));
            EDITOR.last_clicked_coordinates = [x, y];
            if (EDITOR.mode === 1) {
                EDITOR.getWorldData();
            }
            // TODO: Better than this, generate a border div element with z-index over top of everything
            // TODO: if you move the camera around after you clicked, you need to re-click or update coordinates
            EDITOR.last_clicked_element.classList.remove('hide');
            EDITOR.last_clicked_element.style.left = (x * (SIZE * SCALE)) + 'px';
            EDITOR.last_clicked_element.style.top = (y * (SIZE * SCALE)) + 'px';
        });
    },
    updateCurrentAssetImg() {
        this.current_asset_img_el.style.backgroundPosition = '-' + this.current_asset_coords[0] + 'px ' + ' -' + this.current_asset_coords[1] + 'px';
    },
    setWorldData() {
        var translated_x = _GAME.game_translateViewportXToWorldX(this.last_clicked_coordinates[0]);
        var translated_y = _GAME.game_translateViewportYToWorldY(this.last_clicked_coordinates[1]);
        _GAME.game_setWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, translated_x, translated_y, this.current_data_id);
    },
    setWorldDataToZero() {
        var translated_x = _GAME.game_translateViewportXToWorldX(this.last_clicked_coordinates[0]);
        var translated_y = _GAME.game_translateViewportYToWorldY(this.last_clicked_coordinates[1]);
        _GAME.game_setWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, translated_x, translated_y, 0);
    },
    getWorldData() {
        var translated_x = _GAME.game_translateViewportXToWorldX(this.last_clicked_coordinates[0]);
        var translated_y = _GAME.game_translateViewportYToWorldY(this.last_clicked_coordinates[1]);
        var data_id = _GAME.game_getWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, translated_x, translated_y);
        EDITOR.current_data_id_el.value = data_id;
        EDITOR.current_data_id = data_id;
    },
    incrementCurrentLayer() {
        // TODO: We shouldn't rely on magic hardcoded value here
        ++this.current_layer_id;
        if (this.current_layer_id > 3) {
            this.current_layer_id = 0;
        }
        this.current_layer_id_el.value = this.current_layer_id;
        if (EDITOR.mode === 2) {
            EDITOR.showAllTileValues();
        }
    },
    removeNPC: function () {
        var x = EDITOR.last_clicked_coordinates[0] - _GAME.viewport_getPaddingLeft();
        var y = EDITOR.last_clicked_coordinates[1] - _GAME.viewport_getPaddingTop();
        var current_value = _GAME.game_getWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, x, y);
        if (current_value > 0) {
            this.last_npc_selected = current_value;
            _GAME.game_setWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, x, y, 0);
        }
    },
    addNPC: function (npc_id) {
        var x = EDITOR.last_clicked_coordinates[0] - _GAME.viewport_getPaddingLeft();
        var y = EDITOR.last_clicked_coordinates[1] - _GAME.viewport_getPaddingTop();
        var current_value = _GAME.game_getWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, x, y);
        if (npc_id !== null && npc_id !== undefined) {
            this.last_npc_selected = npc_id;
        }
        if (current_value == 0 && this.last_npc_selected > 0) {
            _GAME.game_setWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, x, y, this.last_npc_selected);
        }
    },
    addCollision: function () {
        // this.last_clicked_coordinates
        // _GAME.editor_addCollisionToWorld(this.last_clicked_coordinates[0], this.last_clicked_coordinates[1]);
        var translated_x = _GAME.game_translateViewportXToWorldX(this.last_clicked_coordinates[0]);
        var translated_y = _GAME.game_translateViewportYToWorldY(this.last_clicked_coordinates[1]);
        _GAME.game_setWorldData(EDITOR.current_world_id, EDITOR.collision_layer_id, translated_x, translated_y, 1);
    },
    removeCollision: function () {
        // TODO: Detect if there's already a collision here because we don't want the zig functions underneath to execute things like readdatafromembedded every time we run this
        var translated_x = _GAME.game_translateViewportXToWorldX(this.last_clicked_coordinates[0]);
        var translated_y = _GAME.game_translateViewportYToWorldY(this.last_clicked_coordinates[1]);
        _GAME.game_setWorldData(EDITOR.current_world_id, EDITOR.collision_layer_id, translated_x, translated_y, 0);
    },
    addLog: function (msg) {
        var log = document.getElementById('editor_console');
        // log.innerHTML += msg + '\n';
    },
    convertArrayToBlob: function (array) {
        const json_string = JSON.stringify(array, null, 2);
        const blob = new Blob([json_string], { type: 'application/json' });
        return blob;
    },
    editorDownload: function (data, file_name) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(data);

        link.href = url;
        link.download = file_name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
    extractMemory: function (memory_start, memory_length) {
        let data_view = new DataView(_GAME.memory.buffer, 0, _GAME.memory.byteLength);
        let data = [];
        for (let i = 0; i < memory_length; ++i) {
            let current_position = memory_start + (i * 2);
            data.push(data_view.getUint16(current_position, true));
        }
        return data;
    },
    memoryToBin: function (memory_start, memory_length, file_name) {
        let blob = this.generateBlob(this.extractMemory(memory_start, memory_length));

        this.editorDownload(blob, file_name);
    },
    generateBlob: function (data) {
        return new Blob([new Uint16Array(data)], {type: 'application/octet-stream'});
    },
    __tests: function (which) {
        if (which === 1) {
            EDITOR.memoryToBin(_GAME.editor_getEntityMemoryLocation(0), _GAME.editor_getEntityMemoryLength(0), "entity_1.bin");
        } else if (which === 0) {
            EDITOR.memoryToBin(_GAME.editor_getWorldMemoryLocation(0), _GAME.editor_getWorldMemoryLength(0), "world_0.bin");
        }
    },
    updateInputMode: function () {
        // This is actually inside of the twitch panel
        if (INPUT.MODE !== 1) {
            var collisions = document.querySelectorAll('.collision');
            for (var i = 0; i < collisions.length; ++i) {
                collisions[i].remove();
            }
        } else {
            _GAME.diff_addData(0);
        }
        // TODO: Create input_mode as a CLASS so you can put it multiple panels
        var input_mode = document.getElementById('input_mode');
        input_mode.innerHTML = INPUT.MODES[INPUT.MODE];
    },
    updateEditorModeDisplay: function () {
        var editor_mode_el = document.getElementById('current_editor_mode');
        editor_mode_el.innerHTML = EDITOR.mode_as_string[EDITOR.mode];
    },
    handleInput: function (inputEvent) {
        if (inputEvent.shiftKey === true) {
            if (inputEvent.code === 'KeyD') {
                // DELETE COLLISION BLOCK
                EDITOR.removeCollision();
            } else if (inputEvent.code === 'KeyA') {
                // ADD COLLISION BLOCK
                EDITOR.addCollision();
            } else if (inputEvent.code === 'KeyE') {
                var editor_panel = document.getElementById('editor_panel');
                editor_panel.classList.toggle('hide');
            } else if (inputEvent.code === 'KeyO') {
                EDITOR.getWorldData();
            } else if (inputEvent.code === 'KeyI') {
                EDITOR.setWorldData();
            } else if (inputEvent.code === 'KeyZ') {
                EDITOR.setWorldDataToZero();
            } else if (inputEvent.code === 'KeyL') {
                EDITOR.incrementCurrentLayer();
            } else if (inputEvent.code === 'KeyJ') {
                ++EDITOR.mode;
                if (EDITOR.mode === 2) {
                    EDITOR.showAllTileValues();
                } else {
                    EDITOR.hideAllTileValues();
                }
                if (EDITOR.mode > 2) {
                    EDITOR.mode = 0;
                }
                EDITOR.updateEditorModeDisplay();
            } else if (inputEvent.code === 'BracketLeft') {
                this.current_asset_coords[0] -= 64;
                if (this.current_asset_coords[0] < 0 && this.current_asset_coords[1] > 0) {
                    this.current_asset_coords[1] -= 64;
                }
                if (this.current_asset_coords[0] < 0) {
                    this.current_asset_coords[0] = (ATLAS_PNG_FILESIZE[0] - 64);
                }
                this.updateCurrentAssetImg();
            } else if (inputEvent.code === 'BracketRight') {
                this.current_asset_coords[0] += 64;
                if (this.current_asset_coords[0] >= ATLAS_PNG_FILESIZE[0]) {
                    this.current_asset_coords[0] = 0;
                    this.current_asset_coords[1] += 64;
                }
                if (this.current_asset_coords[1] >= ATLAS_PNG_FILESIZE[1]) {
                    this.current_asset_coords[1] = 0;
                }
                this.updateCurrentAssetImg();
            } else if (inputEvent.code === 'Period') {
                // TODO: # of frames, maybe as an input in the editor UI
                LAYER_ID_TO_IMAGE.setImageCoords(EDITOR.current_layer_id, EDITOR.current_data_id, EDITOR.current_asset_coords[0], EDITOR.current_asset_coords[1], 1);
                _GAME.diff_addData(0);
            }
        }
    },
    showAllTileValues: function () {
        EDITOR.hideAllTileValues();
        if (EDITOR.mode === 2) {
            for (var i = 0; i < (DOM.width * DOM.height); ++i) {
                var viewport_y = Math.floor(i / DOM.width);
                var viewport_x = i % DOM.width;
                var translated_x = _GAME.game_translateViewportXToWorldX(viewport_x);
                var translated_y = _GAME.game_translateViewportYToWorldY(viewport_y);
                var data = _GAME.game_getWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, translated_x, translated_y);
                var value_element = DOM.generateTileDiv(viewport_x, viewport_y);
                value_element.classList.add('tile-value');
                value_element.style.zIndex = 100;
                value_element.innerHTML = data;
                value_element.style.fontSize = '20px';
                value_element.style.fontWeight = 'bold';
                value_element.style.color = 'white';
                value_element.style.textShadow = '0px 0px 2px black, 0px 0px 2px black, 0px 0px 2px black, 0px 0px 2px black';
                document.getElementById('view').appendChild(value_element);
            }
        }
    },
    hideAllTileValues: function () {
        for (var i = 0; i < (DOM.width * DOM.height); ++i) {
            var viewport_y = Math.floor(i / DOM.width);
            var viewport_x = i % DOM.width;
            var translated_x = _GAME.game_translateViewportXToWorldX(viewport_x);
            var translated_y = _GAME.game_translateViewportYToWorldY(viewport_y);
            var data = _GAME.game_getWorldData(EDITOR.current_world_id, EDITOR.current_layer_id, translated_x, translated_y);
            var elements = document.querySelectorAll('div.tile-value');
            for (var e = 0; e < elements.length; ++e) {
                if (elements[e] instanceof HTMLElement) {
                    elements[e].remove();
                }
            }
        }
    },

    // TWITCH EDITOR STUFF
    // TODO: Should probably move this out to a twitch file of some kind
    updateEntityName: function (entity_id, new_name) {
        var entity_name = document.getElementById('entity_name_' + entity_id);
        console.log('EDITOR: ', entity_name);
        entity_name.innerHTML = new_name;
    },
    updateShipEditorName: function (entity_id, name) {
        var ship_editor_name = document.getElementById('ship_' + entity_id);
        console.log('EDITOR: ', ship_editor_name);
        var player_index = TWITCH.SHIPS_TO_PLAYER.indexOf(name);
        if (player_index !== -1) {
            console.trace('EDITOR: ', TWITCH.SHIPS_TO_PLAYER_COLORCODE[player_index]);
            ship_editor_name.innerHTML = '<span style="color: ' + TWITCH.SHIPS_TO_PLAYER_COLORCODE[player_index] + '">' + name + '</span>';
        } else {
            console.trace('EDITOR: NOT FOUND - ', name);
            ship_editor_name.innerHTML = name;
        }
    },
    updateGameMode: function () {
        var game_mode = document.getElementById('game_mode');
        if (TWITCH.GAME_MODE === 0) {
            game_mode.innerHTML = 'Real Time';
        } else if (TWITCH.GAME_MODE === 1) {
            game_mode.innerHTML = 'Turn Based';
        }
    },
};
