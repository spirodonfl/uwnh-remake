package rom_dump

import "core:os"
import "core:mem"
import "core:fmt"

import "shared"

ALL_DATA: [dynamic]u32
ALL_STRINGS: [dynamic]u8

main :: proc() {
    write_text: bool = true
    file: os.Handle
    err: os.Errno

    shared.setup_strings()
    file, err = os.open("text_data.bin", os.O_CREATE|os.O_WRONLY)
    if err != nil {
        return
    }
    defer os.close(file)

    current_position: u32 = 0
    for i: u32 = 0; i < shared.MAX_STRINGS; i += 1 {
        current_string := shared.STRINGS[i]
        if len(current_string.data) > 0 {
            str_bytes := transmute([]u8)current_string.data
            length := u32(len(str_bytes))
            current_string.start = current_position
            current_string.length = length

            os.write_ptr(file, raw_data(str_bytes), int(length))

            current_position += length
            fmt.println("Test ->", current_position)
        }
    }

    // ship: [shared.SHIP_DATA_LENGTH]u32
    // ship = shared.create_base_ship()
    // shared.ship_set_name(&ship, u32(shared.Strings.Balsa))
    // shared.ship_set_internal_id(&ship, 1)
    // shared.add_ship(ship)
    // file, err = os.open("ship_data.bin", os.O_CREATE|os.O_WRONLY)
    // if err != nil {
    //     return
    // }
    // defer os.close(file)
    // // Write the entire array as raw bytes
    // os.write_ptr(file, raw_data(shared.ALL_SHIPS[:]), size_of(shared.ALL_SHIPS))

    append(&ALL_DATA, 32)
    // y: [dynamic]int
    // append(&y, ..x[:]) // append a slice
    // RESIZE ARRAY WHILE INJECTING INTO WHEREVER
    // x := make([dynamic]int, 0, 16)
    // inject_at(&x, 0, 10)
    // inject_at(&x, 3, 10) // resizes till length
    // fmt.eprintln(x[:], len(x), cap(x)) // [10, 0, 0, 10] 4 16
    // ORDERED REMOVE - KEEP ORDER
    // x: [dynamic]int
    // append(&x, 1, 2, 3, 4, 5) // [1, 2, 3, 4, 5]
    // ordered_remove(&x, 0) // [2, 3, 4]
    fmt.println("TTEST", ALL_DATA[0])
    file, err = os.open("all_data.bin", os.O_CREATE|os.O_WRONLY)
    if err != nil {
        return
    }
    defer os.close(file)

    // TODO: layer_data.bin
    // TODO: world_data.bin

    // TODO: Scenes


}