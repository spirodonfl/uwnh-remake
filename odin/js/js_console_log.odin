package js

import "core:fmt"

USE_JS :: #config(USE_JS, false)

when USE_JS {
    foreign import env "env"

    @(default_calling_convention="contextless")
    foreign env {
        js_console_log :: proc(ptr: rawptr, len: i32) ---
    }

    buffer: [4096]u8
    console_log :: proc(message: string, args: ..any) {
        if len(args) == 0 {
            js_console_log(raw_data(message), i32(len(message)))
        } else {
            formatted := fmt.bprintf(buffer[:], message, ..args)
            js_console_log(raw_data(formatted), i32(len(formatted)))
        }
    }
} else {
    buffer: [4096]u8
    console_log :: proc(message: string, args: ..any) {
        if len(args) == 0 {
            fmt.println(message)
        } else {
            fmt.printf(message, ..args)
            fmt.println()
        }
    }
}

/*const importObject = {
    env: {
        js_console_log: function(ptr, len) {
            const bytes = new Uint8Array(wasm.exports.memory.buffer, ptr, len);
            const message = new TextDecoder('utf-8').decode(bytes);
            console.log(message);
        }
    }
};*/