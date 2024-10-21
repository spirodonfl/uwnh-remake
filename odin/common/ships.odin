package common

import "../js"

EnumEntityShip :: enum i32 {
    Name,
    Direction,
    HP,
    Speed,
}

set_ship_name :: proc(ship_id: i32, string_id: i32) {
    lookup_index := get_ship_by_id(ship_id)
    all_data[lookup_index + i32(EnumEntityShip.Name)] = string_id
}
get_ship_name :: proc(ship_id: i32) -> i32 {
    lookup_index := get_ship_by_id(ship_id)
    return all_data[lookup_index + i32(EnumEntityShip.Name)]
}
get_ship_id_by_name :: proc(name: string) -> i32 {
    for i in 0..<len(lookup_data_ships) {
        ship_id := lookup_data_ships[i32(i) * i32(len(EnumLookup)) + i32(EnumLookup.ID)]
        name_index := get_ship_name(ship_id)
        if get_string_by_id(name_index) == name {
            return ship_id
        }
    }
    return -1
}
get_ship_by_id :: proc(id: i32) -> i32 {
    found, lookup_data := find_in_lookup_by_id(lookup_data_ships[:], id)
    start := lookup_data[i32(EnumLookup.Start)]
    if !found {
        js.console_log("[2]Could not find ship")
        return -1
    }
    return start
}
set_ship_hp :: proc(ship_id: i32, hp: i32) {
    lookup_index := get_ship_by_id(ship_id)
    all_data[lookup_index + i32(EnumEntityShip.HP)] = hp
}
get_ship_hp :: proc(ship_id: i32) -> i32 {
    lookup_index := get_ship_by_id(ship_id)
    return all_data[lookup_index + i32(EnumEntityShip.HP)]
}
set_ship_direction_north :: proc(ship_id: i32) {
    lookup_index := get_ship_by_id(ship_id)
    all_data[lookup_index + i32(EnumEntityShip.Direction)] = direction_north()
}
set_ship_direction_south :: proc(ship_id: i32) {
    lookup_index := get_ship_by_id(ship_id)
    all_data[lookup_index + i32(EnumEntityShip.Direction)] = direction_south()
}
set_ship_direction_west :: proc(ship_id: i32) {
    lookup_index := get_ship_by_id(ship_id)
    all_data[lookup_index + i32(EnumEntityShip.Direction)] = direction_west()
}
set_ship_direction_east :: proc(ship_id: i32) {
    lookup_index := get_ship_by_id(ship_id)
    all_data[lookup_index + i32(EnumEntityShip.Direction)] = direction_east()
}