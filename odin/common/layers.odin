package common

import "../js"

EnumLayerType :: enum i32 {
    Background,
    Anything,
    Player,
    Ships,
    NPCs,
    Ports,
    Foreground,
    Block,
}
layer_type_background :: proc() -> i32 {
    return i32(EnumLayerType.Background)
}
layer_type_ships :: proc() -> i32 {
    return i32(EnumLayerType.Ships)
}
layer_type_anything :: proc() -> i32 {
    return i32(EnumLayerType.Anything)
}
layer_type_npcs :: proc() -> i32 {
    return i32(EnumLayerType.NPCs)
}
layer_type_block :: proc() -> i32 {
    return i32(EnumLayerType.Block)
}

EnumLayer :: enum i32 {
    Name,
    ID,
    MapID,
    Type,
}

get_layer_by_type :: proc(layer_type: i32) -> i32 {
    for i in 0..<len(lookup_data_layers) {
        layer_id := lookup_data_layers[i32(i) * i32(len(EnumLookup)) + i32(EnumLookup.ID)]
        start := lookup_data_layers[i32(i) * i32(len(EnumLookup)) + i32(EnumLookup.Start)]
        layer_type_value := all_data[start + i32(EnumLayer.Type)]
        if layer_type_value == layer_type {
            return layer_id
        }
    }
    return -1
}

set_layer_name :: proc(layer_id: i32, string_id: i32) {
    lookup_index := get_layer_by_id(layer_id)
    all_data[lookup_index + i32(EnumLayer.Name)] = string_id
}
get_layer_name :: proc(layer_id: i32) -> i32 {
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.Name)]
}
get_layer_id_by_name :: proc(name: string) -> i32 {
    for i in 0..<len(lookup_data_layers) {
        layer_id := lookup_data_layers[i32(i) * i32(len(EnumLookup)) + i32(EnumLookup.ID)]
        name_index := get_layer_name(layer_id)
        if get_string_by_id(name_index) == name {
            return layer_id
        }
    }
    return -1
}
get_layer_by_id :: proc(id: i32) -> i32 {
    found, lookup_data := find_in_lookup_by_id(lookup_data_layers[:], id)
    start := lookup_data[i32(EnumLookup.Start)]
    if !found {
        js.console_log("[2]Could not find layer")
        return -1
    }
    return start
}
// Pass via slices and it creates a view into memory, very efficient, lookup[:], data[:], etc...
set_layer_map_id :: proc(layer_id: i32, value: i32) {
    lookup_index := get_layer_by_id(layer_id)
    all_data[lookup_index + i32(EnumLayer.MapID)] = value
}
get_layer_map_id :: proc(layer_id: i32) -> i32 {
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.MapID)]
}

set_layer_type_background :: proc(layer_id: i32) {
    lookup_index := get_layer_by_id(layer_id)
    all_data[lookup_index + i32(EnumLayer.Type)] = i32(EnumLayerType.Background)
}
is_layer_type_background :: proc(layer_id: i32) -> bool {
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.Type)] == i32(EnumLayerType.Background)
}

set_layer_type_anything :: proc(layer_id: i32) {
    lookup_index := get_layer_by_id(layer_id)
    all_data[lookup_index + i32(EnumLayer.Type)] = i32(EnumLayerType.Anything)
}
is_layer_type_anything :: proc(layer_id: i32) -> bool {
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.Type)] == i32(EnumLayerType.Anything)
}

set_layer_type_ships :: proc(layer_id: i32) {
    lookup_index := get_layer_by_id(layer_id)
    all_data[lookup_index + i32(EnumLayer.Type)] = i32(EnumLayerType.Ships)
}
is_layer_type_ships :: proc(layer_id: i32) -> bool {
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.Type)] == i32(EnumLayerType.Ships)
}

set_layer_type_block :: proc(layer_id: i32) {
    lookup_index := get_layer_by_id(layer_id)
    all_data[lookup_index + i32(EnumLayer.Type)] = i32(EnumLayerType.Block)
}
is_layer_type_block :: proc(layer_id: i32) -> bool {
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.Type)] == i32(EnumLayerType.Block)
}

set_layer_type_npcs :: proc(layer_id: i32) {
    lookup_index := get_layer_by_id(layer_id)
    all_data[lookup_index + i32(EnumLayer.Type)] = i32(EnumLayerType.NPCs)
}
is_layer_type_npcs :: proc(layer_id: i32) -> bool {
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.Type)] == i32(EnumLayerType.NPCs)
}

get_layer_type :: proc(layer_id: i32) -> i32 { 
    lookup_index := get_layer_by_id(layer_id)
    return all_data[lookup_index + i32(EnumLayer.Type)]
}

set_layer_value_at_coordinates :: proc(layer_id: i32, x: i32, y: i32, value: i32) {
    layer_lookup_index := get_layer_by_id(layer_id)
    map_id := all_data[layer_lookup_index + i32(EnumLayer.MapID)]

    coordinate_index: i32 = 0
    if x > 0 && y > 0 {
        coordinate_index = y * get_map_width(map_id) + x
    } else if y > 0 {
        coordinate_index = y * get_map_width(map_id)
    } else if x > 0 {
        coordinate_index = x
    }

    offset_start: i32 = layer_lookup_index + i32(len(EnumLayer))
    if coordinate_index > 0 {
        offset_start += coordinate_index
    }
    all_data[offset_start] = value
}
get_layer_value_at_coordinates :: proc(layer_id: i32, x: i32, y: i32) -> i32 {
    layer_lookup_index := get_layer_by_id(layer_id)
    map_id := all_data[layer_lookup_index + i32(EnumLayer.MapID)]

    coordinate_index: i32 = 0
    if x > 0 && y > 0 {
        coordinate_index = y * get_map_width(map_id) + x
    } else if y > 0 {
        coordinate_index = y * get_map_width(map_id)
    } else if x > 0 {
        coordinate_index = x
    }

    offset_start: i32 = layer_lookup_index + i32(len(EnumLayer))
    if coordinate_index > 0 {
        offset_start += coordinate_index
    }
    return all_data[offset_start]
}

// Note: you tried make([]i32, length) for WASM but it doesn't work, causes weird issues
get_all_layers_by_map_id :: proc(map_id: i32, which: i32) -> (i32, i32) {
    total_layers: i32 = i32(len(lookup_data_layers)) / i32(len(EnumLookup))
    found_layer_id: i32 = 0
    current_layer_found: i32 = 0
    layers_found: i32 = 0
    for i in 0..<total_layers {
        index := i * len(EnumLookup)
        layer_id: i32 = lookup_data_layers[index + i32(EnumLookup.ID)]
        layer_map_id := get_layer_map_id(layer_id)
        if map_id == layer_map_id {
            layers_found += 1
            if current_layer_found == which {
                found_layer_id = layer_id
            }
            current_layer_found += 1
        }
    }
    return layers_found, found_layer_id
}
get_all_layers_in_map_by_type :: proc(map_id: i32, type: i32, which: i32) -> (i32, i32) {
    total_layers: i32 = i32(len(lookup_data_layers)) / i32(len(EnumLookup))
    found_layer_id: i32 = 0
    current_layer_found: i32 = 0
    layers_found: i32 = 0
    for i in 0..<total_layers {
        index := i * len(EnumLookup)
        layer_id: i32 = lookup_data_layers[index + i32(EnumLookup.ID)]
        layer_map_id := get_layer_map_id(layer_id)
        layer_type := get_layer_type(layer_id)
        if map_id == layer_map_id && type == layer_type {
            layers_found += 1
            if current_layer_found == which {
                found_layer_id = layer_id
            }
            current_layer_found += 1
        }
    }
    return layers_found, found_layer_id
}