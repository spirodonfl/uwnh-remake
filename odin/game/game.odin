package game

import "../common"
import "../js"

/*
Interactions
Note: Remember that the game doesn't care about rendering so you have to have the renderer clear a dialogue, for example

Dialogues
- clear_dialogue()
- wait_for_confirmation() -> confirm() -> deny()
-- a is confirm but you can use arrow key to select denial and then a which denies or b just denies

Menu
- Depends on type, some you care about interactions, others not
-- Stats menu does not need interaction aside from clear_menu(), ability to load stats is available for renderer already
-- Inventory menu can have
--- clear_menu()
--- get_menu_inventory_items() - maybe not required?
--- get_details_on_inventory_item() - maybe not required?
--- use_inventory_item() - add a check for only in menu
-- Market + Goods menu could be
--- clear_menu()
--- get_details_on_market_good() - maybe not require because you can do this outside of menu?
--- choose_good_to_purchase_from_market()
---- wait_for_price_confirmation() - "I can sell this to you for X dollars. Does that sound good?"
---- if deny() then "How much would you buy it for?"
---- wait_for_rebuttal_price() - "I can't do that price but I could do..." or "I can sell it for that yes"
---- wait_for_rebuttal_confirmation()
---- wait_for_number_of_goods_to_purchase() - "How many do you want to buy?"
---- wait_for_ship_confirmation() - "Which ship do you want to load this onto?"
---- choose_ship_to_load_goods_into()
---- purchase_goods()
- Item Shop menu could be
--- clear_menu()
--- choose_item_to_purchase_from_shop()
--- wait_for_number_of_items_to_purchase - "How many do you want to buy?"
---- I guess, in some cases, you can only buy one?
--- purchase_item()
- Bank menu could be
--- clear_menu()
--- deposit_money()
--- withdraw_money()
- Ship menu could be
--- clear_menu()
--- wait_for_action_confirmation() - "create new ship, remodel ship, sell ship, buy used ship"
--- wait_for_new_ship_type_confirmation() - "galleon, carrack, etc..."
--- wait_for_new_ship_wood_type_confirmation() - "cedar, etc..."
--- ... same as above but for crew hold, cargo hold, cannon slots, cannon type, masthead, sails etc ...
--- wait_for_cannon_type_remodel_confirmation()
--- wait_for_crew_hold_remodel_confirmation()
--- wait_for_which_ship_to_sell_confirmation()
--- wait_for_which_ship_to_sell_price_confirmation()
--- wait_for_used_ship_to_buy_confirmation()
--- wait_for_used_ship_to_buy_price_confirmation()
--- buy_used_ship()

If you invest in shipyard, in the menu you would add a confirmation dialogue
- wait_for_investment_amount()
- wait_for_investment_amount_confirmation()

something like that

A full interaction is sometimes a single dialog or menu
Other times, like in the shop, it will be dialogues with menus
When you complete something in the interaction, it will move on to something else until the interaction is complete or exited
MINI SCENE

Scenes
Note: These are different from interactions
Scenes will contain a mix of
- menus
- dialogues
- world loading/unloading
- movement of things in the world
- camera movement
- hidden actions like manual adjustment of prices, without any user input, or adding inventory, without user input

Therefore, interactions and scenes could be the same
Further, they will require static code with conditionals built-in
*/

@(export)
layer_type_background :: proc() -> i32 {
    return common.layer_type_background()
}
@(export)
layer_type_anything :: proc() -> i32 {
    return common.layer_type_anything()
}
@(export)
layer_type_ships :: proc() -> i32 {
    return common.layer_type_ships()
}
@(export)
layer_type_npcs :: proc() -> i32 {
    return common.layer_type_npcs()
}

current_map_id: i32 = 2
@(export)
set_current_map_id :: proc(map_id: i32) {
    current_map_id = map_id
}
@(export)
get_layer_in_current_map_id :: proc(which: i32) -> i32 {
    // Returns an id of the layer you want to find which means common.get_layer_by_id
    found, found_id := common.get_all_layers_by_map_id(current_map_id, which)
    if found > 0 {
        return found_id
    }

    return -1
}
@(export)
get_layer_in_current_map_id_by_type :: proc(type: i32, which: i32) -> i32 {
    // Returns an id of the layer you want to find which means common.get_layer_by_id
    found, found_id := common.get_all_layers_in_map_by_type(current_map_id, type, which)
    if found > 0 {
        return found_id
    }

    return -1
}
@(export)
are_coordinates_blocked :: proc(map_id: i32, x: i32, y: i32) -> bool {
    found, found_id := common.get_all_layers_in_map_by_type(map_id, common.layer_type_block(), 0)
    if found > 0 {
        layer_value := common.get_layer_value_at_coordinates(found_id, x, y)
        if layer_value > 0 {
            return true
        }
    }

    return false
}

@(export)
is_coordinate_in_range_of_coordinate :: proc(a_x: i32, a_y: i32, b_x: i32, b_y: i32, range: i32) -> bool {
    return distance_between_coordinates(a_x, a_y, b_x, b_y, range) <= range
}
@(export)
distance_between_coordinates :: proc(a_x: i32, a_y: i32, b_x: i32, b_y: i32, range: i32) -> i32 {
    dx := abs(b_x - a_x)
    dy := abs(b_y - a_y)
    manhattan_distance := dx + dy
    return manhattan_distance
}

@(export)
get_current_map_height :: proc() -> i32 {
    return common.get_map_height(current_map_id)
}
@(export)
get_current_map_width :: proc() -> i32 {
    return common.get_map_width(current_map_id)
}

block_all_movements: bool = false
@(export)
game_init :: proc() {
    common.lookup_data = #load("lookup.bin", []i32)
    common.lookup_data_maps = #load("lookup_maps.bin", []i32)
    common.lookup_data_entities = #load("lookup_entities.bin", []i32)
    common.lookup_data_layers = #load("lookup_layers.bin", []i32)
    common.lookup_data_ships = #load("lookup_ships.bin", []i32)
    common.lookup_data_npcs = #load("lookup_npcs.bin", []i32)
    common.lookup_data_strings = #load("lookup_strings.bin", []i32)
    common.all_data = #load("data.bin", []i32)

    set_current_game_mode_to_in_game_port()
}
@(export)
get_ptr_to_raw_data :: proc() -> rawptr {
    return &common.all_data[0]
}


@(export)
tick :: proc() {
    // ...
}

// // TODO: Might have to put this into data .bin file!
// Wind :: struct {
//     speed: i32,
//     direction: i32,
// }

// // TODO: If player direction is facing interactable entity (direction + 1) and "interact" function is called, begin interaction
// // interaction could be scene or dialog or menu and sometimes it's dialog+menu+dialog
// // pause the game
// // put state of game to "IN SCENE"
// // must iterate through scene
// // SCENE
// // -- interaction type [dialog, menu, movement]
// // -- if dialog -> dialog id
// // -- if menu -> menu id
// // -- if move -> entity in current map, move to (or additive move like move_up or +1 or whatever)
// map_wind := Wind{8, i32(DIRECTIONS.west)}
// // TODO: Have to globalize these somewhere I guess and it has to be per ship too
// ticks_before_move: i32 = 0
// ticks_before_move_trigger: i32 = 40
// player_is_anchored: bool = true
// @(export)
// toggle_player_is_anchored :: proc() {
//     player_is_anchored = !player_is_anchored
// }
// // TODO: Properly deal with game pause
// game_is_paused: bool = false
// @(export)
// toggle_game_paused :: proc() {
//     game_is_paused = !game_is_paused
// }
// @(export)
// tick :: proc() {
//     if game_is_paused { return }
//     if get_current_game_mode() == i32(GAME_MODES.In_Game_Ocean) {
//         if !player_is_anchored {
//             addon_ticks: i32 = 0
//             if map_wind.speed > get_ship_speed() && map_wind.direction == common.get_entity_direction(1) {
//                 addon_ticks += 20
//             }
//             if ticks_before_move >= (ticks_before_move_trigger + addon_ticks) {
//                 block_all_movements = false
//                 if common.get_entity_direction(1) == i32(DIRECTIONS.north) {
//                     move_ship_up(1)
//                 }
//                 if common.get_entity_direction(1) == i32(DIRECTIONS.south) {
//                     move_ship_down(1)
//                 }
//                 if common.get_entity_direction(1) == i32(DIRECTIONS.east) {
//                     move_ship_right(1)
//                 }
//                 if common.get_entity_direction(1) == i32(DIRECTIONS.west) {
//                     move_ship_left(1)
//                 }
//                 block_all_movements = true
//                 ticks_before_move = 0
//                 ship_x, ship_y, ship_found := find_ship_in_current_map(1)
//                 if ship_found {
//                     more_than_halfway_x, more_than_halfway_y, less_than_halfway_x, less_than_halfway_y := is_map_coordinate_halfway_of_viewport(ship_x, ship_y)
//                     if more_than_halfway_x {
//                         move_camera_right()
//                     } else if less_than_halfway_x {
//                         move_camera_left()
//                     } else {
//                         // TODO: Maybe still move camera right?
//                     }
//                     if more_than_halfway_y {
//                         move_camera_down()
//                     } else if less_than_halfway_y {
//                         move_camera_up()
//                     } else {
//                         // TODO: Maybe still move camera down?
//                     }
//                 }
//             }
//             ticks_before_move += 1
//         }
//     } else if get_current_game_mode() == i32(GAME_MODES.In_Game_Port) {
//         // js.console_log("IN PORT")
//     }
// }




// // Ship_Action :: enum {
// //     None,
// //     Move,
// //     Attack,
// //     Both,
// // }

// // Turn_Info :: struct {
// //     ship_id: i32,
// //     action_taken: Ship_Action
// // }

// // current_turn: Turn_Info
// // turn_order: [6]i32
// // current_turn_index: int

// // @(export)
// // get_current_ship_id :: proc() -> i32 {
// //     return current_turn.ship_id
// // }

// // @(export)
// // get_current_ship_action :: proc() -> Ship_Action {
// //     return current_turn.action_taken
// // }

// // @(export)
// // end_turn :: proc() {
// //     current_turn_index = (current_turn_index + 1) % len(turn_order)
// //     current_turn = Turn_Info{ship_id = turn_order[current_turn_index], action_taken = .None}
// //     if current_turn.ship_id == 6 {
// //         // Kraken. Automate turn
// //         // Random direction and attack anything in range
// //         kraken_move()
// //         kraken_move()
// //         kraken_attack()
// //         end_turn()
// //     }
// // }

// // @(export)
// // kraken_move :: proc() {
// //     // try to move in a random direction
// //     if (move_ship_up(current_turn.ship_id)) {
// //         return
// //     }
// //     if (move_ship_down(current_turn.ship_id)) {
// //         return
// //     }
// //     if (move_ship_left(current_turn.ship_id)) {
// //         return
// //     }
// //     if (move_ship_right(current_turn.ship_id)) {
// //         return
// //     }
// // }

// // @(export)
// // kraken_attack :: proc() {
// //     // try to attack a random target
// //     if (ship_attack(current_turn.ship_id, 1)) {
// //         return
// //     }
// //     if (ship_attack(current_turn.ship_id, 2)) {
// //         return
// //     }
// //     if (ship_attack(current_turn.ship_id, 3)) {
// //         return
// //     }
// //     if (ship_attack(current_turn.ship_id, 4)) {
// //         return
// //     }
// //     if (ship_attack(current_turn.ship_id, 5)) {
// //         return
// //     }
// // }

// // @(export)
// // skip_turn :: proc() {
// //     end_turn()
// // }

// // attack_range: i32 = 2
// // movement_range: i32 = 2

// // @(export)
// // get_movement_range :: proc() -> i32 {
// //     return movement_range
// // }

// // @(export)
// // set_movement_range :: proc(range: i32) {
// //     movement_range = range
// // }

// // @(export)
// // set_attack_range :: proc(range: i32) {
// //     attack_range = range
// // }

// // calculate_damage :: proc(base_damage: i32, distance: i32) -> i32 {
// //     if distance > attack_range / 2 {
// //         return base_damage / 2
// //     }
// //     return base_damage
// // }

// // @(export)
// // ship_attack :: proc(attacker_id: i32, target_id: i32) -> bool {
// //     if attacker_id != current_turn.ship_id || current_turn.action_taken == .Attack || current_turn.action_taken == .Both {
// //         return false
// //     }
    
// //     attacker_x, attacker_y, attacker_found := find_ship_position(attacker_id)
// //     target_x, target_y, target_found := find_ship_position(target_id)
    
// //     if !attacker_found || !target_found {
// //         return false
// //     }
    
// //     dx := abs(target_x - attacker_x)
// //     dy := abs(target_y - attacker_y)
// //     distance := dx + dy
    
// //     if distance > attack_range {
// //         return false
// //     }
    
// //     // Implement your attack logic here
// //     base_damage := i32(2) // You can adjust this or make it a parameter
// //     actual_damage := calculate_damage(base_damage, distance)
    
// //     target_hp := get_ship_hp(target_id)
// //     new_hp := max(0, target_hp - actual_damage)
// //     // You'll need to implement a set_ship_hp function
// //     set_ship_hp(target_id, new_hp)
    
// //     if current_turn.action_taken == .None {
// //         current_turn.action_taken = .Attack
// //     } else if current_turn.action_taken == .Move {
// //         current_turn.action_taken = .Both
// //         end_turn()
// //     }
    
// //     return true
// // }

// // @(export)
// // is_valid_attack_target :: proc(attacker_id: i32, target_id: i32) -> bool {
// //     attacker_x, attacker_y, attacker_found := find_ship_position(attacker_id)
// //     target_x, target_y, target_found := find_ship_position(target_id)
    
// //     if !attacker_found || !target_found {
// //         return false
// //     }
    
// //     return is_target_in_attack_range(attacker_x, attacker_y, target_x, target_y)
// // }

// // @(export)
// // set_turn_order :: proc(new_turn_order: [6]i32) {
// //     turn_order = new_turn_order
// //     // js.console_log("set_turn_order", turn_order)
// //     current_turn_index = 0
// //     if len(turn_order) > 0 {
// //         current_turn = Turn_Info{ship_id = turn_order[0], action_taken = .None}
// //     }
// // }


// //     set_turn_order([6]i32{1, 2, 3, 4, 5, 6})

// // @(export)
// // find_id_in_turn_order :: proc(id: i32) -> i32 {
// //     for i in 0..<i32(len(turn_order)) {
// //         // js.console_log("find_id_in_turn_order", turn_order[i], id, i32(i))
// //         if turn_order[i] == id {
// //             return i32(i)
// //         }
// //     }
// //     return -1
// // }

// // @(export)
// // get_relative_turn_order :: proc(ship_id: i32) -> i32 {
// //     current_index := find_id_in_turn_order(current_turn.ship_id)
// //     ship_index := find_id_in_turn_order(ship_id)
    
// //     if current_index == -1 || ship_index == -1 {
// //         return -1
// //     }
    
// //     relative_order := (ship_index - current_index + len(turn_order)) % len(turn_order)
    
// //     // If it's the current ship, return 0 (or -1 if you prefer not to display anything)
// //     if relative_order == 0 {
// //         return -1 // or return 0 if you want to display 0 for the current ship
// //     }
    
// //     return relative_order
// // }

// // @(export)
// // get_attack_range :: proc() -> i32 {
// //     return attack_range
// // }

// // player_controlled_ship_id: i32 = 1  // Default to the first ship

// // @(export)
// // set_player_controlled_ship :: proc(ship_id: i32) {
// //     player_controlled_ship_id = ship_id
// // }

// // @(export)
// // get_player_controlled_ship :: proc() -> i32 {
// //     return player_controlled_ship_id
// // }

// // @(export)
// // is_player_turn :: proc() -> bool {
// //     return current_turn.ship_id == player_controlled_ship_id
// // }

// // @(export)
// // move_ship :: proc(ship_id: i32, target_x: i32, target_y: i32) -> bool {
// //     if ship_id != current_turn.ship_id || current_turn.action_taken == .Move || current_turn.action_taken == .Both {
// //         return false
// //     }

// //     total_layers := i32(len(game_layers_array) / len(common.Layer))
    
// //     ships_layer_index := find_ships_layer_index()
// //     block_layer_index: i32 = -1
    
// //     for layer_index in 0..<total_layers {
// //         if common.get_layer_map_id(game_layers_array, layer_index) == active_map_id &&
// //            common.get_layer_type(game_layers_array, layer_index) == i32(common.Layer_Type.block) {
// //             block_layer_index = layer_index
// //             break
// //         }
// //     }
    
// //     if ships_layer_index == -1 || block_layer_index == -1 {
// //         return false
// //     }
    
// //     ship_x, ship_y, found := find_ship_position(ship_id)
// //     if !found {
// //         return false
// //     }
    
// //     // Check if the target position is within the movement range
// //     if !is_target_in_movement_range(ship_x, ship_y, target_x, target_y) {
// //         return false
// //     }
    
// //     // Check if the target position is blocked or occupied
// //     is_blocked := common.get_layer_data(game_layers_data_array, game_layers_array, game_maps_array, block_layer_index, target_x, target_y) == 1
// //     is_occupied := common.get_layer_data(game_layers_data_array, game_layers_array, game_maps_array, ships_layer_index, target_x, target_y) != 0
    
// //     if is_blocked || is_occupied {
// //         return false
// //     }
    
// //     // Move the ship
// //     common.set_layer_data(game_layers_data_array, game_layers_array, game_maps_array, ships_layer_index, ship_x, ship_y, 0)
// //     common.set_layer_data(game_layers_data_array, game_layers_array, game_maps_array, ships_layer_index, target_x, target_y, ship_id)
    
// //     if current_turn.action_taken == .None {
// //         current_turn.action_taken = .Move
// //     } else if current_turn.action_taken == .Attack {
// //         current_turn.action_taken = .Both
// //         end_turn()
// //     }
    
// //     return true
// // }

// // @(export)
// // get_player_controlled_ship_x :: proc() -> i32 {
// //     player_ship_id := get_player_controlled_ship()
// //     player_ship_x, player_ship_y, player_ship_found := find_ship_position(player_ship_id)
// //     return player_ship_x
// // }

// // @(export)
// // get_player_controlled_ship_y :: proc() -> i32 {
// //     player_ship_id := get_player_controlled_ship()
// //     player_ship_x, player_ship_y, player_ship_found := find_ship_position(player_ship_id)
// //     return player_ship_y
// // }

// // @(export)
// // update_ship_position :: proc(ship_id: i32, new_x: i32, new_y: i32) -> bool {
// //     ships_layer_index := find_ships_layer_index()
// //     if ships_layer_index == -1 {
// //         return false
// //     }

// //     map_width := get_current_map_width()
// //     map_height := get_current_map_height()

// //     // First, find the current position of the ship
// //     old_x, old_y: i32 = -1, -1
// //     for x in 0..<map_width {
// //         for y in 0..<map_height {
// //             if common.get_layer_data(game_layers_data_array, game_layers_array, game_maps_array, ships_layer_index, x, y) == ship_id {
// //                 old_x, old_y = x, y
// //                 break
// //             }
// //         }
// //         if old_x != -1 {
// //             break
// //         }
// //     }

// //     // If the ship wasn't found, return false
// //     if old_x == -1 || old_y == -1 {
// //         return false
// //     }

// //     // Check if the new position is within the map bounds
// //     if new_x < 0 || new_x >= map_width || new_y < 0 || new_y >= map_height {
// //         return false
// //     }

// //     // Check if the new position is already occupied by another ship
// //     if common.get_layer_data(game_layers_data_array, game_layers_array, game_maps_array, ships_layer_index, new_x, new_y) != 0 {
// //         return false
// //     }

// //     // Update the ship's position
// //     common.set_layer_data(game_layers_data_array, game_layers_array, game_maps_array, ships_layer_index, old_x, old_y, 0)
// //     common.set_layer_data(game_layers_data_array, game_layers_array, game_maps_array, ships_layer_index, new_x, new_y, ship_id)

// //     return true
// // }

// // @(export)
// // set_current_turn :: proc(ship_id: i32) {
// //     current_turn_index = 0
// //     for i in 0..<len(turn_order) {
// //         if turn_order[i] == ship_id {
// //             current_turn_index = i
// //             break
// //         }
// //     }
// //     current_turn = Turn_Info{ship_id = ship_id, action_taken = .None}
// // }
