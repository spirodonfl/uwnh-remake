var importObject = {
    env: {
        memory: new WebAssembly.Memory({
            initial: 512,     // 200 pages = ~12.8MB
            maximum: 2048     // 1000 pages = ~64MB
        }),
        js_console_log: function(ptr, len)
        {
            var bytes = new Uint8Array(
                wasm.exports.memory.buffer,
                ptr,
                len
            );
            var message = new TextDecoder('utf-8').decode(bytes);
            if (message.startsWith("STRUCT_"))
            {
                var data = message.substring(
                    message.indexOf('{'),
                    message.indexOf('}') + 1
                );
                console.log(data, JSON.parse(data));
            }
            console.log(message);
        },
    }
};