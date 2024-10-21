package common

import "../js"

MAX_STRING_LENGTH :: 256

get_string_by_id :: proc(id: i32) -> string {
    found, indices := find_in_lookup_by_id(lookup_data_strings, id)
    if !found {
        js.console_log("String not found for id %d", id)
        return ""
    }
    
    start := i32(indices[i32(EnumLookup.Start)])
    length := i32(indices[i32(EnumLookup.Length)])

    string_data := all_data[start:start+length]

    // Convert []i32 back to string
    bytes: [MAX_STRING_LENGTH]byte
    byte_count := 0
    
    for value in string_data {
        for j := 0; j < 4; j += 1 {
            if byte_count >= MAX_STRING_LENGTH {
                break
            }
            char := byte(value >> u32(j * 8) & 0xFF)
            if char != 0 {
                bytes[byte_count] = char
                byte_count += 1
            }
        }
        if byte_count >= MAX_STRING_LENGTH {
            break
        }
    }
    
    result := string(bytes[:byte_count])
    return result
}