var EDITOR = {
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
    memoryToBin: function (memory_length, memory_start, file_name) {
        let data_view = new DataView(_GAME.memory.buffer, 0, _GAME.memory.byteLength);
        let data = [];
        for (let i = 0; i < memory_length; ++i) {
            let current_position = memory_start + (i * 2);
            data.push(data_view.getUint16(current_position, true));
        }
        let blob = this.generateBlob(data);
        console.log(data);

        this.editorDownload(blob);
    },
    generateBlob: function (data) {
        return new Blob([new Uint16Array(data)], {type: 'application/octet-stream'});
    },
};
