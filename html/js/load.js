function start_game()
{
    console.log('Starting game here');

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

    document.addEventListener('mousemove', function (e)
    {
        if (should3d && ctrl_down)
        {
            degx += e.movementX;
            degy += e.movementY;
        }
    });
    
    INPUT_SERVER.listen();
    INPUT_KEYBOARD.listen();
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
    else if (u8)
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
        fetch('file:///C:/Users/spiro/D/uwnh-remake/c/wasm_game.wasm')
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