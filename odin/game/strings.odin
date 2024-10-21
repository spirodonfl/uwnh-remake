package game

import "../common"
import "../js"

MAX_STRING_LENGTH :: 128
MAX_BUFFERS :: 10

input_string_buffers: [MAX_BUFFERS][MAX_STRING_LENGTH]u8
input_string_buffer_indices: [MAX_BUFFERS]int
input_final_strings: [MAX_BUFFERS]string

@(export)
new_string :: proc(buffer_id: int) {
    if buffer_id < 0 || buffer_id >= MAX_BUFFERS {
        js.console_log("Invalid buffer ID")
        return
    }
    for i in 0..<MAX_STRING_LENGTH {
        input_string_buffers[buffer_id][i] = 0
    }
    input_string_buffer_indices[buffer_id] = 0
}

@(export)
append_char :: proc(buffer_id: int, char: u8) {
    if buffer_id < 0 || buffer_id >= MAX_BUFFERS {
        js.console_log("Invalid buffer ID")
        return
    }
    if input_string_buffer_indices[buffer_id] >= MAX_STRING_LENGTH {
        js.console_log("Buffer overflow, ignoring input")
        return
    }

    input_string_buffers[buffer_id][input_string_buffer_indices[buffer_id]] = char
    input_string_buffer_indices[buffer_id] += 1
}

convert_buffer_to_string :: proc(buffer_id: int) -> string {
    if buffer_id < 0 || buffer_id >= MAX_BUFFERS {
        return ""
    }
    return string(input_string_buffers[buffer_id][:input_string_buffer_indices[buffer_id]])
}

@(export)
finish_string_input :: proc(buffer_id: int) {
    if buffer_id < 0 || buffer_id >= MAX_BUFFERS {
        js.console_log("Invalid buffer ID")
        return
    }
    input_final_strings[buffer_id] = convert_buffer_to_string(buffer_id)
}

@(export)
current_buffer_to_console :: proc(buffer_id: int) {
    if buffer_id < 0 || buffer_id >= MAX_BUFFERS {
        js.console_log("Invalid buffer ID")
        return
    }
    js.console_log(convert_buffer_to_string(buffer_id))
}


/*
function sendStringToOdin(str, bufferId, isNewString = true) {
    if (isNewString) {
        // Clear the buffer in Odin if this is a new string
        wasm.exports.new_string(bufferId);
    }

    // Convert each character to its ASCII code and send it to Odin
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (charCode > 255) {
            console.warn(`Character '${str[i]}' is not a single byte. Skipping.`);
            continue;
        }
        wasm.exports.append_char(bufferId, charCode);
    }

    // Finish processing the input
    wasm.exports.finish_string_input(bufferId);
}

// Example usage
sendStringToOdin("Hello, ", 0); // This will clear buffer 0 before starting
sendStringToOdin("Odin!", 0, false); // This will append to buffer 0
sendStringToOdin("This is a new string.", 1); // This will use buffer 1
*/


// TODO: #load("strings.bin", []u8)
// load up a string into "current_string_to_read", internally in the wasm execution, based on what's going on in the game
// for example, running dialogue("a_dialogue_var_name") would search for "a_dialogue_var_name" in the lookup table and store the text it finds in "current_string_to_read"