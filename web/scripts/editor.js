import { wasm } from './injector_wasm.js';

// TODO: Create UI for state management system (FSM)
// TODO: Finish UI for entities

class ClassEditor {
    constructor() {
        if (ClassEditor.instance) {
            return Editor.instance;
        }
        ClassEditor.instance = this;
    }
    createNewEntity(entity_type, entity_id) {
        if (entity_type === undefined) {
            console.error('entity_type is undefined');
            return;
        }
        if (entity_id === undefined) {
            console.error('entity_id is undefined');
            return;
        }
        let entity_index = wasm.editor_createEntity(entity_type, entity_id);
        let start = wasm.editor_getEntityMemoryLocationByIndex(entity_index);
        let length = wasm.editor_getEntityMemoryLengthByIndex(entity_index);
        let memory = this.extractMemory(start, length);
        if (memory.length > 0) {
            // TODO: We probably don't want to download the entity here.
            // The function name is pretty specific in its intent.
            let entity_blob = this.generateBlob(memory);
            this.editorDownload(entity_blob, 'entity_' + entity_id + '.bin');
        } else {
            console.error('Memory length of 0 when extracting entity!');
        }
    }
    extractMemory (memory_start, memory_length) {
        let data_view = new DataView(wasm.memory.buffer, 0, wasm.memory.byteLength);
        let data = [];
        for (let i = 0; i < memory_length; ++i) {
            let current_position = memory_start + (i * 2);
            data.push(data_view.getUint16(current_position, true));
        }
        return data;
    }
    memoryToBin (memory_start, memory_length, file_name) {
        let blob = this.generateBlob(this.extractMemory(memory_start, memory_length));
        this.editorDownload(blob, file_name);
    }
    generateBlob (data) {
        return new Blob([new Uint16Array(data)], {type: 'application/octet-stream'});
    }
    generateBlobFromJsonString (data) {
        return new Blob([data], {type: 'application/json'});
    }
    editorDownload (data, file_name) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(data);

        link.href = url;
        link.download = file_name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
const Editor = new ClassEditor();
export { Editor };
