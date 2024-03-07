// TODO: Remove this, not required UNLESS you
// automatically generate jsdoc typing for easier referencing
// import { _WASM_IMPORTS } from "./injector_wasm_imports.js";

const wasmPath = import.meta.resolve("../wasm/game.wasm");

var global_current_log = "";

function readStr(buffer, ptr, len) {
    const array = new Uint8Array(buffer, ptr, len);
    const decoder = new TextDecoder();
    return decoder.decode(array);
}

const importObject = {
    imports: {},
    env: {
        console_log_write: function console_log_write(ptr, len) {
            global_current_log += readStr(wasm.memory.buffer, ptr, len);
        },
        console_log_flush: function() {
            console.log('WASM LOG:', global_current_log);
            global_current_log = "";
        },
    }
};
const game = await WebAssembly.instantiateStreaming(fetch(wasmPath), importObject);
export const wasm = game.instance.exports;
// export const injectWASM = () => WebAssembly.instantiateStreaming(fetch(wasmPath), importObject);
