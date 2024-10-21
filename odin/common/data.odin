package common

import "core:mem"

read_file_int_at_index :: proc(file: []i32, index: i32) -> i32 {
    if index < 0 || index > i32(len(file)) {
        return 0
    }

    return file[index]
}

write_file_int_at_index :: proc(file: []i32, index: i32, value: i32) -> i32 {
    if index < 0 || index > i32(len(file)) {
        return 0
    }

    file[index] = i32(value)

    return file[index]
}

EnumLookupTypes :: enum {
    Layer,
    Map,
    Entity,
    String,
    Ship,
    NPC,
    Kraken,
    Market,
    Good,
}
EnumLookup :: enum {
    ID,
    Type,
    Start,
    Length,
}

lookup_data: []i32
lookup_data_maps: []i32
lookup_data_entities: []i32
lookup_data_layers: []i32
lookup_data_ships: []i32
lookup_data_npcs: []i32
lookup_data_strings: []i32
lookup_data_markets: []i32
lookup_data_goods: []i32
all_data: []i32

find_in_lookup_by_id :: proc(lookup_reference_data: []i32, id: i32) -> (bool, [len(EnumLookup)]i32) {
    total: i32 = i32(len(lookup_reference_data)) / len(EnumLookup)
    for i in 0..<total {
        lookup_id: i32 = lookup_reference_data[i * len(EnumLookup)]
        if lookup_id == id {
            lookup_found: [len(EnumLookup)]i32
            lookup_found[i32(EnumLookup.ID)] = lookup_reference_data[i * len(EnumLookup) + i32(EnumLookup.ID)]
            lookup_found[i32(EnumLookup.Type)] = lookup_reference_data[i * len(EnumLookup) + i32(EnumLookup.Type)]
            lookup_found[i32(EnumLookup.Start)] = lookup_reference_data[i * len(EnumLookup) + i32(EnumLookup.Start)]
            lookup_found[i32(EnumLookup.Length)] = lookup_reference_data[i * len(EnumLookup) + i32(EnumLookup.Length)]
            return true, lookup_found
        }
    }

    return false, [len(EnumLookup)]i32{}
}
