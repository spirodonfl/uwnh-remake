import { _WASM_IMPORTS } from "./injector_wasm_imports.js";

const wasmPath = import.meta.resolve("/wasm/game.wasm");

var global_current_log = "";

function readStr(buffer, ptr, len) {
    const array = new Uint8Array(buffer, ptr, len);
    const decoder = new TextDecoder();
    return decoder.decode(array);
}

const importObject = {
    imports: _WASM_IMPORTS,
    env: {
        console_log_write: function console_log_write(ptr, len) {
            global_current_log += readStr(wasm.instance.exports.memory.buffer, ptr, len);
        },
        console_log_flush: function() {
            console.log('WASM LOG:', global_current_log);
            global_current_log = "";
        },
    }
};
const wasm = await WebAssembly.instantiateStreaming(fetch(wasmPath), importObject);
export { wasm };
// export const injectWASM = () => WebAssembly.instantiateStreaming(fetch(wasmPath), importObject);
