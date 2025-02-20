function start_game()
{
    console.log('Starting game here');

    VIEWPORT.width = 12;
    VIEWPORT.height = 12;
    uih.updateRootProperties();
    wasm.exports.initialize_game();
    console.log("Current memory:", formatMemorySize(wasm.exports.memory.buffer.byteLength));
    gh.initialize();
    if (gh.current.game_mode == GAME_STRINGS.indexOf("GAME_MODE_EMPTY"))
    {
        uih.initialize();
        console.log("GAME IS EMPTY. STARTING RAF");
        requestAnimationFrame(RAF.animate);
    }

    var ctrl_down = false;
    document.addEventListener('mousemove', function (e)
    {
        if (should3d && ctrl_down)
        {
            degx += e.movementX;
            degy += e.movementY;
        }
    });

    document.addEventListener('keydown', function (e)
    {
        switch (e.code)
        {
            case "ControlLeft":
                ctrl_down = true;
                break;
            case "KeyA":
                wasm.exports.user_input_left();
                break;
            case "KeyD":
                wasm.exports.user_input_right();
                break;
            case "KeyW":
                wasm.exports.user_input_up();
                break;
            case "KeyS":
                wasm.exports.user_input_down();
                break;
        }
    });

    document.addEventListener('keyup', function (e)
    {
        if (IS_MULTIPLAYER && e.target.matches("#multiplayer-chat-message-input"))
        {
            ctrl_down = false;
            return;
        }
        var should_redraw = true;
        switch (e.code)
        {
            case "ControlLeft":
                ctrl_down = false;
                should_redraw = false;
                break;
            case "KeyZ":
                wasm.exports.user_input_a();
                break;
            case "KeyX":
                wasm.exports.user_input_b();
                break;
            case "KeyC":
                wasm.exports.user_input_x();
                break;
            case "KeyV":
                wasm.exports.user_input_y();
                break;
            case "KeyQ":
                wasm.exports.user_input_left_bumper();
                break;
            case "KeyE":
                wasm.exports.user_input_right_bumper();
                break;
            case "KeyT":
                wasm.exports.user_input_start();
                break;
            case "KeyG":
                wasm.exports.user_input_select();
                break;
            case "KeyI":
                // TODO: These won't work because we update the viewport every frame
                // Do a forced camera move and then add a reset button of some kind
                CAMERA.moveUp();
                break;
            case "KeyK":
                CAMERA.moveDown();
                break;
            case "KeyJ":
                CAMERA.moveLeft();
                break;
            case "KeyL":
                CAMERA.moveRight();
                break;
            case "KeyP":
                RAF.togglePause();
                break;
            default:
                should_redraw = false;
                break;
        }
        if (should_redraw)
        {
            gh.shouldRedrawEverything();
        }
    })
}

window.addEventListener("load", function ()
{
    RAF.initialize();
    var multiplayer = URLPARAMS.get('is_multiplayer');
    if (multiplayer === 1 || multiplayer === true || multiplayer === "true" || multiplayer === "1")
    {
        // TODO: This
    }

    var base64 = false;
    var u8 = true;
    if (base64)
    {
        var bytes = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
        WebAssembly.instantiate(bytes, importObject).then(results => {
            var instance = results.instance;
            wasm = instance;

            // NOTE: This is how you call a function that's not exported. JS calls WASM functions through the indirect function table.
            // console.log(wasm);
            // console.log(wasm.exports.__indirect_function_table);
            // console.log(wasm.exports.__indirect_function_table.get(1)());

            console.log("Starting memory:", formatMemorySize(wasm.exports.memory.buffer.byteLength));
            console.log("Pages:", wasm.exports.memory.buffer.byteLength / 65536);

            start_game();
        });
    }
    if (u8)
    {
        var wasmBytes = new Uint8Array(wasmU8);
        var wasmModule = new WebAssembly.Module(wasmBytes);
        wasm = new WebAssembly.Instance(wasmModule, importObject);
        console.log("Starting memory:", formatMemorySize(wasm.exports.memory.buffer.byteLength));
        console.log("Pages:", wasm.exports.memory.buffer.byteLength / 65536);

        start_game();
    }
    else
    {
        fetch('wasm_game.wasm')
            .then(function(response) { return response.arrayBuffer() })
            .then(function(bytes) { return WebAssembly.instantiate(bytes, importObject) })
            .then(function(results) {
                var instance = results.instance;
                wasm = instance;

                console.log("Starting memory:", formatMemorySize(wasm.exports.memory.buffer.byteLength));
                console.log("Pages:", wasm.exports.memory.buffer.byteLength / 65536);

                start_game();
            });
    }
});