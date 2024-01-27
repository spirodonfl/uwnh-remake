// https://jsdoc.app/about-getting-started
LOADER.addRequired('wasm');

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
            global_current_log += readStr(_GAME.memory.buffer, ptr, len);
        },
        console_log_flush: function() {
            console.log(global_current_log);
            global_current_log = "";
        },
    }
};
WebAssembly.instantiateStreaming(fetch("/wasm/game.wasm"), importObject).then(
    (results) => {
        _GAME = results.instance.exports;
        LOADER.loaded('wasm');
    },
);
