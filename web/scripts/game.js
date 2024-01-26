// https://jsdoc.app/about-getting-started
LOADER.addRequired('wasm');

const importObject = {
    imports: _WASM_IMPORTS,
};
WebAssembly.instantiateStreaming(fetch("/wasm/game.wasm"), importObject).then(
    (results) => {
        _GAME = results.instance.exports;
        LOADER.loaded('wasm');
    },
);
