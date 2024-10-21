package game

import "../common"
import "../js"

// TODO: These should all be in "common" and then exported here

@(export)
are_coordinates_occupied_by_npc :: proc(map_id: i32, x: i32, y: i32) -> bool {
    found, found_id := common.get_all_layers_in_map_by_type(map_id, common.layer_type_npcs(), 0)
    if found > 0 {
        layer_value := common.get_layer_value_at_coordinates(found_id, x, y)
        if layer_value > 0 {
            return true
        }
    }

    return false
}

find_npc_in_current_map :: proc(npc_id: i32) -> (bool, i32, i32) {
    map_width := common.get_map_width(current_map_id)
    map_height := common.get_map_height(current_map_id)
    for x in 0..<map_width {
        for y in 0..<map_height {
            npc_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            npc_layer_value := common.get_layer_value_at_coordinates(npc_layer_id, x, y)
            if npc_layer_value == npc_id {
                return true, x, y
            }
        }
    }

    return false, 0, 0
}

@(export)
find_npc_in_current_map_x :: proc(npc_id: i32) -> i32 {
    found, x, y := find_npc_in_current_map(npc_id)
    if found {
        return x
    }

    return -1
}
@(export)
find_npc_in_current_map_y :: proc(npc_id: i32) -> i32 {
    found, x, y := find_npc_in_current_map(npc_id)
    if found {
        return y
    }

    return -1
}

@(export)
move_npc_down :: proc(npc_id: i32) -> bool {
    found, current_x, current_y := find_npc_in_current_map(npc_id)

    if found {
        intended_x: i32 = current_x
        intended_y: i32 = current_y + 1

        within_map := intended_y < get_current_map_height()
        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_npc_direction_south(npc_id)
        if within_map && !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.npcs)
            npc_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(npc_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(npc_layer_id, intended_x, intended_y, npc_id)
        }
    }

    return false
}
@(export)
move_npc_right :: proc(npc_id: i32) -> bool {
    found, current_x, current_y := find_npc_in_current_map(npc_id)

    if found {
        intended_x: i32 = current_x + 1
        intended_y: i32 = current_y

        within_map := intended_x < get_current_map_width()
        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_npc_direction_east(npc_id)
        if within_map && !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.npcs)
            npc_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(npc_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(npc_layer_id, intended_x, intended_y, npc_id)
        }
    }

    return false
}
@(export)
move_npc_up :: proc(npc_id: i32) -> bool {
    found, current_x, current_y := find_npc_in_current_map(npc_id)

    if found && current_y > 0 {
        intended_x: i32 = current_x
        intended_y: i32 = current_y - 1

        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_npc_direction_north(npc_id)
        if !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.npcs)
            npc_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(npc_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(npc_layer_id, intended_x, intended_y, npc_id)
        }
    }

    return false
}
@(export)
move_npc_left :: proc(npc_id: i32) -> bool {
    found, current_x, current_y := find_npc_in_current_map(npc_id)

    if found && current_x > 0 {
        intended_x: i32 = current_x - 1
        intended_y: i32 = current_y

        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_npc_direction_west(npc_id)
        if !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.npcs)
            npc_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(npc_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(npc_layer_id, intended_x, intended_y, npc_id)
        }
    }

    return false
}

// TODO: Create these for others (layers, maps, ships, strings, etc...)
@(export)
get_npc_hp :: proc(npc_id: i32) -> i32 {
    return common.get_npc_hp(npc_id)
}