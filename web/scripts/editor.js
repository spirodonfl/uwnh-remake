import { wasm } from './injector_wasm.js';

class ClassEditor {
    constructor() {
        // TODO: Use singleton pattern everywhere else too
        if (ClassEditor.instance) {
            return Editor.instance;
        }
        ClassEditor.instance = this;
    }
    change() {
        this.mutableProperty = 22;
    }
    test() {
        console.log('Editor.test');
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
        let memory = extractMemory(start, length);
        if (memory.length > 0) {
            let entity_blob = generateBlob(memory);
            editorDownload(entity_blob, 'entity_' + entity_id + '.bin');
        } else {
            console.error('Memory length of 0 when extracting entity!');
        }
    }
}
const Editor = new ClassEditor();
export { Editor };
