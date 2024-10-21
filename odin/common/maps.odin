package common

// TODO: Consider batch operations/functions so you don't have to call individual functions many times

import "../js"

EnumMap :: enum i32 {
    Name,
    ID,
    Width,
    Height,
}

get_map_by_id :: proc(id: i32) -> i32 {
    found, lookup_data := find_in_lookup_by_id(lookup_data_maps[:], id)
    start := lookup_data[i32(EnumLookup.Start)]
    if !found {
        js.console_log("[2]Could not find layer")
        return -1
    }
    return start
}
set_map_name :: proc(map_id: i32, string_id: i32) {
    lookup_index := get_map_by_id(map_id)
    all_data[lookup_index + i32(EnumMap.Name)] = string_id
}
get_map_name :: proc(map_id: i32) -> i32 {
    lookup_index := get_map_by_id(map_id)
    return all_data[lookup_index + i32(EnumMap.Name)]
}
get_map_id_by_name :: proc(name: string) -> i32 {
    for i in 0..<len(lookup_data_maps) {
        map_id := lookup_data_maps[i32(i) * i32(len(EnumLookup)) + i32(EnumLookup.ID)]
        name_index := get_map_name(map_id)
        if get_string_by_id(name_index) == name {
            return map_id
        }
    }
    return -1
}
set_map_height :: proc(map_id: i32, value: i32) {
    lookup_index := get_map_by_id(map_id)
    all_data[lookup_index + i32(EnumMap.Height)] = value
}
get_map_height :: proc(map_id: i32) -> i32 {
    lookup_index := get_map_by_id(map_id)
    return all_data[lookup_index + i32(EnumMap.Height)]
}
set_map_width :: proc(map_id: i32, value: i32) {
    lookup_index := get_map_by_id(map_id)
    all_data[lookup_index + i32(EnumMap.Width)] = value
}
get_map_width :: proc(map_id: i32) -> i32 {
    lookup_index := get_map_by_id(map_id)
    return all_data[lookup_index + i32(EnumMap.Width)]
}