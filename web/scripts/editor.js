var EDITOR = {
    addLog: function (msg) {
        var log = document.getElementById('editor_console');
        log.innerHTML += msg + '\n';
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
        let blob = this.generateBlob(this.extractMemory(memory_length, memory_start));

        this.editorDownload(blob);
    },
    generateBlob: function (data) {
        return new Blob([new Uint16Array(data)], {type: 'application/octet-stream'});
    },
    __tests: function (which) {
        if (which == 0) {
            _GAME.editor_addColumnToWorld(0);
            DOM.rendered = false;
            var __location = _GAME.editor_getWorldMemoryLocation(0);
            var __length = _GAME.editor_getWorldMemoryLength(0);
            var __memory = EDITOR.extractMemory(__location, __length);
            var sub_memory = __memory.slice(3, __memory.length);
            var blob_memory = EDITOR.generateBlob(sub_memory);
            EDITOR.editorDownload(blob_memory, "world_0_layer_0.bin");
            EDITOR.editorDownload(blob_memory, "world_0_layer_1.bin");
            EDITOR.editorDownload(blob_memory, "world_0_layer_2.bin");
            var size_blob = EDITOR.generateBlob([__memory[1], __memory[2]]);
            EDITOR.editorDownload(size_blob, "world_0_size.bin");
        }
    }
};
