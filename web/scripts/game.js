// https://jsdoc.app/about-getting-started
LOADER.addRequired('wasm');

const importObject = {
    imports: _WASM_IMPORTS,
};
let _GAME = null;
WebAssembly.instantiateStreaming(fetch("/wasm/game.wasm"), importObject).then(
    (results) => {
        _GAME = results.instance.exports;
        LOADER.loaded('wasm');
    },
);

let GAME = {
    setViewportSize(width, height) {
        _GAME.viewport_setSize(width, height);
    },
    initializeGame() {
        _GAME.game_initializeGame();
    },
};
