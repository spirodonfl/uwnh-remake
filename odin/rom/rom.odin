package rom

// --- CORE --- //
import "core:os"
import "core:fmt"
import "core:mem"
import "core:slice"
import "core:reflect"

import "core:strings"
Variable :: struct {
    name: string,
    start_index: u32,
    length: u32,
}
read_variables_from_file :: proc(file_path: string) -> ([]Variable, []u8, bool) {
    data, ok := os.read_entire_file(file_path)
    if !ok {
        fmt.println("Failed to read file:", file_path)
        return nil, nil, false
    }

    variables: [dynamic]Variable
    index: u32 = 0
    file_content := data

    for index < u32(len(file_content)) {
        // Read variable name
        var_name_start := index
        for index < u32(len(file_content)) && file_content[index] != '=' {
            index += 1
        }
        if index + 1 >= u32(len(file_content)) || file_content[index + 1] != '=' {
            fmt.println("Invalid format: expected '=='")
            return nil, nil, false
        }
        var_name := string(file_content[var_name_start:index])
        index += 2  // Skip '=='

        // Read string content
        str_start := index
        for index < u32(len(file_content)) && file_content[index] != '\n' {
            index += 1
        }

        variable := Variable{
            name = var_name,
            start_index = str_start,
            length = index - str_start,
        }
        append(&variables, variable)

        index += 1  // Skip '\n'
    }

    return variables[:], file_content, true
}

dump_array_to_file :: proc(array: []i32, filename: string) -> bool {
    data := make([]byte, len(array) * size_of(i32))
    for &v, i in array {
        mem.copy(
            &data[i*size_of(i32)],
            &v,
            size_of(i32)
        )
    }
    return os.write_entire_file(filename, data)
}
dump_u8_array_to_file :: proc(array: []u8, filename: string) -> bool {
    return os.write_entire_file(filename, array)
}
// --- CORE --- //

Lookup_Array :: ^[dynamic]i32
all_data := make([dynamic]i32)
lookup := make([dynamic]i32)
lookup_maps := make([dynamic]i32)
existing_lookup_map_ids: map[i32]bool
lookup_entities := make([dynamic]i32)
existing_lookup_entity_ids: map[i32]bool
lookup_ships := make([dynamic]i32)
existing_lookup_ship_ids: map[i32]bool
lookup_npcs := make([dynamic]i32)
existing_lookup_npc_ids: map[i32]bool
lookup_layers := make([dynamic]i32)
existing_lookup_layer_ids: map[i32]bool
lookup_strings := make([dynamic]i32)
existing_lookup_string_ids: map[i32]bool
lookup_markets := make([dynamic]i32)
existing_lookup_market_ids: map[i32]bool
lookup_start: i32 = 0
existing_lookup_ids: map[i32]bool
create_game_array :: proc(length: i32, type: i32, id: i32) -> []i32 {
    if existing_lookup_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_ids[id] = true

    game_array := make([]i32, length)

    for i in 0..<len(common.EnumLookup) {
        switch i32(i) {
            case i32(common.EnumLookup.ID):
                append(&lookup, id)
            case i32(common.EnumLookup.Type):
                append(&lookup, type)
            case i32(common.EnumLookup.Start):
                append(&lookup, lookup_start)
            case i32(common.EnumLookup.Length):
                append(&lookup, length)
        }
    }
    lookup_start += length

    // defer delete(game_array)

    return game_array
}
create_game_array_via :: proc(target_array: Lookup_Array, length: i32, type: i32, id: i32) -> []i32 {
    game_array := make([]i32, length)

    for i in 0..<len(common.EnumLookup) {
        switch i32(i) {
            case i32(common.EnumLookup.ID):
                append(target_array, id)
            case i32(common.EnumLookup.Type):
                append(target_array, type)
            case i32(common.EnumLookup.Start):
                append(target_array, lookup_start)
            case i32(common.EnumLookup.Length):
                append(target_array, length)
        }
    }
    lookup_start += length

    // defer delete(game_array)

    return game_array
}
create_a_layer :: proc(id: i32, extra_length: i32 = 0) -> []i32 {
    if existing_lookup_layer_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_layer_ids[id] = true

    final_length := i32(len(common.EnumLayer))
    if extra_length > 0 {
        final_length += extra_length
    }

    game_array := create_game_array_via(&lookup_layers, final_length, i32(common.EnumLookupTypes.Layer), id)
    common.lookup_data_layers = lookup_layers[:]

    // defer delete(game_array)
    return game_array
}
create_a_layer_into_all :: proc(id: i32, extra_length: i32 = 0) {
    data_array := create_a_layer(id, extra_length)
    append_to_all_data(data_array)
}
create_a_map :: proc(id: i32, extra_length: i32 = 0) -> []i32 {
    if existing_lookup_map_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_map_ids[id] = true

    final_length := i32(len(common.EnumMap))
    if extra_length > 0 {
        final_length += extra_length
    }

    game_array := create_game_array_via(&lookup_maps, final_length, i32(common.EnumLookupTypes.Map), id)
    common.lookup_data_maps = lookup_maps[:]

    return game_array
}
create_a_map_into_all :: proc(id: i32, extra_length: i32 = 0) {
    data_array := create_a_map(id, extra_length)
    append_to_all_data(data_array)
}
create_an_entity :: proc(id: i32, extra_length: i32 = 0) -> []i32 {
    if existing_lookup_entity_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_entity_ids[id] = true

    final_length := i32(len(common.EnumEntity))
    if extra_length > 0 {
        final_length += extra_length
    }
    
    game_array := create_game_array_via(&lookup_entities, final_length, i32(common.EnumLookupTypes.Entity), id)
    common.lookup_data_entities = lookup_entities[:]

    return game_array
}
create_an_entity_into_all :: proc(id: i32, extra_length: i32 = 0) {
    data_array := create_an_entity(id, extra_length)
    append_to_all_data(data_array)
}
create_a_ship :: proc(id: i32, extra_length: i32 = 0) -> []i32 {
    if existing_lookup_ship_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_ship_ids[id] = true

    final_length := i32(len(common.EnumEntity))
    if extra_length > 0 {
        final_length += extra_length
    }
    
    game_array := create_game_array_via(&lookup_ships, final_length, i32(common.EnumLookupTypes.Ship), id)
    common.lookup_data_ships = lookup_ships[:]

    return game_array
}
create_a_ship_into_all :: proc(id: i32, extra_length: i32 = 0) {
    data_array := create_a_ship(id, extra_length)
    append_to_all_data(data_array)
}
create_an_npc :: proc(id: i32, extra_length: i32 = 0) -> []i32 {
    if existing_lookup_npc_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_npc_ids[id] = true

    final_length := i32(len(common.EnumEntity))
    if extra_length > 0 {
        final_length += extra_length
    }

    game_array := create_game_array_via(&lookup_npcs, final_length, i32(common.EnumLookupTypes.NPC), id)
    common.lookup_data_npcs = lookup_npcs[:]

    return game_array
}
create_an_npc_into_all :: proc(id: i32, extra_length: i32 = 0) {
    data_array := create_an_npc(id, extra_length)
    append_to_all_data(data_array)
}
create_a_string :: proc(id: i32, the_string: string) -> []i32 {
    if existing_lookup_string_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_string_ids[id] = true

    // Convert string to []i32, each i32 containing up to 4 bytes
    i32_array := make([]i32, (len(the_string) + 3) / 4)
    for i := 0; i < len(the_string); i += 4 {
        value: i32 = 0
        for j := 0; j < 4 && i+j < len(the_string); j += 1 {
            value |= i32(the_string[i+j]) << u32(j * 8)
        }
        i32_array[i/4] = value
    }
    
    game_array := create_game_array_via(&lookup_strings, i32(len(i32_array)), i32(common.EnumLookupTypes.String), current_string_id)
    common.lookup_data_strings = lookup_strings[:]
    return i32_array
}
create_a_string_into_all :: proc(id: i32, the_string: string) {
    data_array := create_a_string(id, the_string)
    append_to_all_data(data_array)
}
create_a_market :: proc(id: i32, extra_length: i32 = 0) -> []i32 {
    if existing_lookup_market_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_market_ids[id] = true

    final_length := common.rom_total_market_array_size()
    if extra_length > 0 {
        final_length += extra_length
    }
    
    game_array := create_game_array_via(&lookup_markets, final_length, i32(common.EnumLookupTypes.Market), id)
    common.lookup_data_markets = lookup_markets[:]

    return game_array
}
create_a_market_into_all :: proc(id: i32, extra_length: i32 = 0) {
    data_array := create_a_market(id, extra_length)
    append_to_all_data(data_array)
}

append_to_all_data :: proc(array: []i32) {
    append_elems(&all_data, ..array)
    common.all_data = all_data[:]
}

current_ship_id: i32 = 1
create_new_ship :: proc(extra_length: i32 = 0) -> i32 {
    create_a_ship_into_all(current_ship_id, extra_length)
    current_ship_id += 1
    return current_ship_id - 1
}
current_npc_id: i32 = 1
create_new_npc :: proc(extra_length: i32 = 0) -> i32 {
    create_an_npc_into_all(current_npc_id, extra_length)
    current_npc_id += 1
    return current_npc_id - 1
}
current_map_id: i32 = 1
create_new_map :: proc(extra_length: i32 = 0) -> i32 {
    create_a_map_into_all(current_map_id, extra_length)
    current_map_id += 1
    return current_map_id - 1
}
current_layer_id: i32 = 1
create_new_layer :: proc(extra_length: i32 = 0) -> i32 {
    create_a_layer_into_all(current_layer_id, extra_length)
    current_layer_id += 1
    return current_layer_id - 1
}
current_string_id: i32 = 1
create_new_string :: proc(new_string: string) -> i32 {
    create_a_string_into_all(current_string_id, new_string)
    current_string_id += 1
    return current_string_id - 1
}
current_market_id: i32 = 1
create_new_market :: proc(extra_length: i32 = 0) -> i32 {
    create_a_market_into_all(current_market_id, extra_length)
    current_market_id += 1
    return current_market_id
}
// --- GAME SPECIFIC --- //
import "../common"

main :: proc() {
    defer delete(lookup)
    defer delete(lookup_maps)
    defer delete(lookup_layers)
    defer delete(lookup_entities)
    defer delete(lookup_ships)
    defer delete(lookup_npcs)
    defer delete(lookup_strings)
    defer delete(lookup_markets)
    defer delete(lookup_goods)
    defer delete(all_data)

    variables, file_content, success := read_variables_from_file("strings.txt")
    if !success {
        fmt.println("Failed to process the file")
        return
    }

    for variable in variables {
        fmt.printf("Variable: %s, Start Index: %d, Length: %d\n", 
                   variable.name, variable.start_index, variable.length)
        string_content := string(file_content[variable.start_index:variable.start_index+variable.length])
        fmt.printf("String content: %s\n\n", string_content)
    }

    fmt.println("--- INITIALIZING")
    
    common.set_npc_name(create_new_npc(), create_new_string("npc1"))
    common.set_npc_hp(common.get_npc_id_by_name("npc1"), 33)

    common.set_npc_name(create_new_npc(), create_new_string("npc2"))
    common.set_npc_hp(common.get_npc_id_by_name("npc2"), 66)

    common.set_ship_name(create_new_ship(), create_new_string("ship1"))
    common.set_ship_hp(common.get_ship_id_by_name("ship1"), 34)

    common.set_ship_name(create_new_ship(), create_new_string("ship2"))
    common.set_ship_hp(common.get_ship_id_by_name("ship2"), 67)

    // --- FIRST MAP
    last_map_width: i32 = 16
    last_map_height: i32 = 16
    last_map_total: i32 = (last_map_width * last_map_height)
    last_map_id: i32 = create_new_map()
    common.set_map_width(last_map_id, last_map_width)
    common.set_map_height(last_map_id, last_map_height)

    last_layer_id: i32 = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_background(last_layer_id)

    last_layer_id = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_ships(last_layer_id)
    common.set_layer_value_at_coordinates(last_layer_id, 0, 0, common.get_ship_id_by_name("ship1"))
    common.set_layer_value_at_coordinates(last_layer_id, 2, 2, common.get_ship_id_by_name("ship2"))

    last_layer_id = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_anything(last_layer_id)
    common.set_layer_value_at_coordinates(last_layer_id, 3, 3, 1)
    common.set_layer_value_at_coordinates(last_layer_id, 9, 9, 1)
    common.set_layer_value_at_coordinates(last_layer_id, 10, 9, 10)
    common.set_layer_value_at_coordinates(last_layer_id, 11, 9, 11)
    common.set_layer_value_at_coordinates(last_layer_id, 12, 9, 11)
    common.set_layer_value_at_coordinates(last_layer_id, 13, 9, 12)
    
    last_layer_id = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_block(last_layer_id)
    common.set_layer_value_at_coordinates(last_layer_id, 3, 3, 1)
    common.set_layer_value_at_coordinates(last_layer_id, 9, 9, 1)

    // --- SECOND MAP
    last_map_width = 8
    last_map_height = 8
    last_map_total = (last_map_width * last_map_height)
    last_map_id = create_new_map()
    common.set_map_width(last_map_id, last_map_width)
    common.set_map_height(last_map_id, last_map_height)
    
    last_layer_id = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_background(last_layer_id)

    last_layer_id = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_npcs(last_layer_id)
    common.set_layer_value_at_coordinates(last_layer_id, 0, 0, common.get_npc_id_by_name("npc1"))
    common.set_layer_value_at_coordinates(last_layer_id, 2, 2, common.get_npc_id_by_name("npc2"))

    last_layer_id = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_anything(last_layer_id)
    common.set_layer_value_at_coordinates(last_layer_id, 2, 3, 1)
    common.set_layer_value_at_coordinates(last_layer_id, 4, 1, 1)

    last_layer_id = create_new_layer(last_map_total)
    common.set_layer_map_id(last_layer_id, last_map_id)
    common.set_layer_type_block(last_layer_id)
    common.set_layer_value_at_coordinates(last_layer_id, 3, 3, 1)

    // found, indices := common.get_all_layers_by_map_id(1)
    // fmt.println("Total layers in map1", found)
    // found, indices = common.get_all_layers_in_map_by_type(2, i32(common.EnumLayerType.NPCs))
    // fmt.println("Total block layers in map2", found)
    // found, indices := common.get_all_layers_in_map_by_type(1, i32(common.EnumLayerType.Block))

    fmt.println("--- Dumping all data")
    dump_array_to_file(all_data[:], "game/data.bin")
    fmt.println("--- Dumping lookup")
    dump_array_to_file(lookup[:], "game/lookup.bin")
    fmt.println("--- Dumping lookup_maps")
    dump_array_to_file(lookup_maps[:], "game/lookup_maps.bin")
    fmt.println("--- Dumping lookup_entities")
    dump_array_to_file(lookup_entities[:], "game/lookup_entities.bin")
    fmt.println("--- Dumping lookup_layers")
    dump_array_to_file(lookup_layers[:], "game/lookup_layers.bin")
    fmt.println("--- Dumping lookup_ships")
    dump_array_to_file(lookup_ships[:], "game/lookup_ships.bin")
    fmt.println("--- Dumping lookup_npcs")
    dump_array_to_file(lookup_npcs[:], "game/lookup_npcs.bin")
    fmt.println("--- Dumping lookup_strings")
    dump_array_to_file(lookup_strings[:], "game/lookup_strings.bin")

    fmt.println("--- EXITING")
    // os.exit(0)
}