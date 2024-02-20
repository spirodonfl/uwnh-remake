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

var GAME = {
    init: function () {},
    handleInput: function (inputEvent) {
        if (inputEvent.code === 'KeyW') {
            // UP
            _GAME.inputs_inputUp(0);
        } else if (inputEvent.code === 'KeyS') {
            // DOWN
            _GAME.inputs_inputDown(0);
        } else if (inputEvent.code === 'KeyA') {
            // LEFT
            _GAME.inputs_inputLeft(0);
        } else if (inputEvent.code === 'KeyD') {
            // RIGHT
            _GAME.inputs_inputRight(0);
        } else if (inputEvent.code === 'Space') {
            // ATTACK
            _GAME.game_entityAttack(0, 8);
                if (_GAME.game_entityGetHealth((9-1)) <= 0) {
                    DISABLE_KRAKEN();
                }

        } else if (inputEvent.code === 'KeyQ') {
            // FULL SCREEN MENU
        } else if (inputEvent.code === 'ArrowUp') {
            // UPDATE CAMERA AND RE-RENDER VIEWPORT
        } else if (inputEvent.code === 'ArrowDown') {
            // UPDATE CAMERA AND RE-RENDER VIEWPORT
        } else if (inputEvent.code === 'ArrowLeft') {
            // UPDATE CAMERA AND RE-RENDER VIEWPORT
        } else if (inputEvent.code === 'ArrowRight') {
            // UPDATE CAMERA AND RE-RENDER VIEWPORT
        }
    },
};
