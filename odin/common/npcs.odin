package common

import "../js"

EnumEntityNpc :: enum i32 {
    Name,
    Direction,
    HP,
}

set_npc_name :: proc(npc_id: i32, string_id: i32) {
    lookup_index := get_npc_by_id(npc_id)
    all_data[lookup_index + i32(EnumEntityNpc.Name)] = string_id
}
get_npc_name :: proc(npc_id: i32) -> string {
    lookup_index := get_npc_by_id(npc_id)
    return get_string_by_id(all_data[lookup_index + i32(EnumEntityNpc.Name)])
}
get_npc_id_by_name :: proc(name: string) -> i32 {
    total_npcs := i32(len(lookup_data_npcs)) / i32(len(EnumLookup))
    for i in 0..<total_npcs {
        // We try to avoid repeated loops over lookup and all_data
        npc_id := lookup_data_npcs[i32(i) * i32(len(EnumLookup)) + i32(EnumLookup.ID)]
        start := lookup_data_npcs[i32(i) * i32(len(EnumLookup)) + i32(EnumLookup.Start)]
        string_id := all_data[start + i32(EnumEntityNpc.Name)]
        if string_id > 0 && get_string_by_id(string_id) == name {
            sss: string = get_string_by_id(string_id)
            return npc_id
        }
    }
    return -1
}
get_npc_by_id :: proc(id: i32) -> i32 {
    found, lookup_data := find_in_lookup_by_id(lookup_data_npcs[:], id)
    start := lookup_data[i32(EnumLookup.Start)]
    if !found {
        js.console_log("[2]Could not find npc", id)
        return -1
    }
    return start
}
set_npc_hp :: proc(npc_id: i32, hp: i32) {
    lookup_index := get_npc_by_id(npc_id)
    all_data[lookup_index + i32(EnumEntityNpc.HP)] = hp
}
get_npc_hp :: proc(npc_id: i32) -> i32 {
    lookup_index := get_npc_by_id(npc_id)
    return all_data[lookup_index + i32(EnumEntityNpc.HP)]
}
set_npc_direction_north :: proc(npc_id: i32) {
    lookup_index := get_npc_by_id(npc_id)
    all_data[lookup_index + i32(EnumEntityNpc.Direction)] = direction_north()
}
set_npc_direction_south :: proc(npc_id: i32) {
    lookup_index := get_npc_by_id(npc_id)
    all_data[lookup_index + i32(EnumEntityNpc.Direction)] = direction_south()
}
set_npc_direction_west :: proc(npc_id: i32) {
    lookup_index := get_npc_by_id(npc_id)
    all_data[lookup_index + i32(EnumEntityNpc.Direction)] = direction_west()
}
set_npc_direction_east :: proc(npc_id: i32) {
    lookup_index := get_npc_by_id(npc_id)
    all_data[lookup_index + i32(EnumEntityNpc.Direction)] = direction_east()
}