var EDITOR = {
    last_clicked_coordinates: [0, 0],
    last_npc_selected: 0,
    removeNPC: function () {
        var x = EDITOR.last_clicked_coordinates[0] - _GAME.viewport_getPaddingLeft();
        var y = EDITOR.last_clicked_coordinates[1] - _GAME.viewport_getPaddingTop();
        var current_value = _GAME.game_getWorldData(0, 1, x, y);
        if (current_value > 0) {
            this.last_npc_selected = current_value;
            _GAME.game_setWorldData(0, 1, x, y, 0);
        }
    },
    addNPC: function (npc_id) {
        var x = EDITOR.last_clicked_coordinates[0] - _GAME.viewport_getPaddingLeft();
        var y = EDITOR.last_clicked_coordinates[1] - _GAME.viewport_getPaddingTop();
        var current_value = _GAME.game_getWorldData(0, 1, x, y);
        if (npc_id !== null && npc_id !== undefined) {
            this.last_npc_selected = npc_id;
        }
        if (current_value == 0 && this.last_npc_selected > 0) {
            _GAME.game_setWorldData(0, 1, x, y, this.last_npc_selected);
        }
    },
    addCollision: function () {
        // this.last_clicked_coordinates
        // _GAME.editor_addCollisionToWorld(this.last_clicked_coordinates[0], this.last_clicked_coordinates[1]);
        var translated_x = _GAME.game_translateViewportXToWorldX(this.last_clicked_coordinates[0]);
        var translated_y = _GAME.game_translateViewportYToWorldY(this.last_clicked_coordinates[1]);
        _GAME.game_setWorldData(0, 2, translated_x, translated_y, 1);
    },
    removeCollision: function () {
        // TODO: Detect if there's already a collision here because we don't want the zig functions underneath to execute things like readdatafromembedded every time we run this
        var translated_x = _GAME.game_translateViewportXToWorldX(this.last_clicked_coordinates[0]);
        var translated_y = _GAME.game_translateViewportYToWorldY(this.last_clicked_coordinates[1]);
        _GAME.game_setWorldData(0, 2, translated_x, translated_y, 0);
    },
    addLog: function (msg) {
        var log = document.getElementById('editor_console');
        // log.innerHTML += msg + '\n';
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
    updateEntityName: function (entity_id, new_name) {
        var entity_name = document.getElementById('entity_name_' + entity_id);
        console.log('EDITOR: ', entity_name);
        entity_name.innerHTML = new_name;
    },
    updateShipEditorName: function (entity_id, name) {
        var ship_editor_name = document.getElementById('ship_' + entity_id);
        console.log('EDITOR: ', ship_editor_name);
        ship_editor_name.innerHTML = name;
    }
};
