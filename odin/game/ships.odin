package game

import "../common"

// TODO: These should all be in "common" and then exported here

@(export)
are_coordinates_occupied_by_ship :: proc(map_id: i32, x: i32, y: i32) -> bool {
    found, found_id := common.get_all_layers_in_map_by_type(map_id, common.layer_type_ships(), 0)
    if found > 0 {
        layer_value := common.get_layer_value_at_coordinates(found_id, x, y)
        if layer_value > 0 {
            return true
        }
    }

    return false
}

find_ship_in_current_map :: proc(ship_id: i32) -> (bool, i32, i32) {
    map_width := common.get_map_width(current_map_id)
    map_height := common.get_map_height(current_map_id)
    for x in 0..<map_width {
        for y in 0..<map_height {
            ship_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_ships(), 0)
            ship_layer_value := common.get_layer_value_at_coordinates(ship_layer_id, x, y)
            if ship_layer_value == ship_id {
                return true, x, y
            }
        }
    }

    return false, 0, 0
}
@(export)
find_ship_in_current_map_x :: proc(ship_id: i32) -> i32 {
    found, x, y := find_ship_in_current_map(ship_id)
    if found {
        return x
    }

    return -1
}
@(export)
find_ship_in_current_map_y :: proc(ship_id: i32) -> i32 {
    found, x, y := find_ship_in_current_map(ship_id)
    if found {
        return y
    }

    return -1
}

@(export)
move_ship_down :: proc(ship_id: i32) -> bool {
    found, current_x, current_y := find_ship_in_current_map(ship_id)

    if found {
        intended_x: i32 = current_x
        intended_y: i32 = current_y + 1

        within_map := intended_y < get_current_map_height()
        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_npc_direction_south(ship_id)
        if within_map && !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.ships)
            ship_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(ship_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(ship_layer_id, intended_x, intended_y, ship_id)
        }
    }

    return false
}
@(export)
move_ship_right :: proc(ship_id: i32) -> bool {
    found, current_x, current_y := find_ship_in_current_map(ship_id)

    if found {
        intended_x: i32 = current_x + 1
        intended_y: i32 = current_y

        within_map := intended_x < get_current_map_width()
        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_ship_direction_east(ship_id)
        if within_map && !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.ships)
            ship_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(ship_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(ship_layer_id, intended_x, intended_y, ship_id)
        }
    }

    return false
}
@(export)
move_ship_up :: proc(ship_id: i32) -> bool {
    found, current_x, current_y := find_ship_in_current_map(ship_id)

    if found && current_y > 0 {
        intended_x: i32 = current_x
        intended_y: i32 = current_y - 1

        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_ship_direction_north(ship_id)
        if !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.ships)
            ship_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(ship_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(ship_layer_id, intended_x, intended_y, ship_id)
        }
    }

    return false
}
@(export)
move_ship_left :: proc(ship_id: i32) -> bool {
    found, current_x, current_y := find_ship_in_current_map(ship_id)

    if found && current_x > 0 {
        intended_x: i32 = current_x - 1
        intended_y: i32 = current_y

        coordinates_blocked := are_coordinates_blocked(current_map_id, intended_x, intended_y)
        coordinates_occupied := are_coordinates_occupied_by_npc(current_map_id, intended_x, intended_y)

        common.set_ship_direction_west(ship_id)
        if !coordinates_blocked && !coordinates_occupied && !block_all_movements {
            should_redraw = i32(SHOULD_REDRAW.ships)
            ship_layer_id := get_layer_in_current_map_id_by_type(common.layer_type_npcs(), 0)
            common.set_layer_value_at_coordinates(ship_layer_id, current_x, current_y, 0)
            common.set_layer_value_at_coordinates(ship_layer_id, intended_x, intended_y, ship_id)
        }
    }

    return false
}