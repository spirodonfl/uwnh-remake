package game

import "../common"
import "../js"

SHOULD_REDRAW :: common.SHOULD_REDRAW
should_redraw := common.should_redraw

@(export)
set_viewport_size :: proc(width: i32, height: i32) {
    common.set_viewport_size(width, height)
}

@(export)
get_viewport_size_width :: proc() -> i32 {
    return common.get_viewport_size_width()
}

@(export)
get_viewport_size_height :: proc() -> i32 {
    return common.get_viewport_size_height()
}

@(export)
move_camera_down :: proc() {
    common.move_camera_down()
}

@(export)
move_camera_right :: proc() {
    common.move_camera_right()
}

@(export)
move_camera_up :: proc() {
    common.move_camera_up()
}

@(export)
move_camera_left :: proc() {
    common.move_camera_down()
}

@(export)
get_viewport_value_at_coordinates :: proc(layer_id: i32, x: i32, y: i32) -> i32 {
    return common.get_viewport_value_at_coordinates(layer_id, x, y)
}

@(export)
is_map_coordinate_in_viewport :: proc(x: i32, y: i32) -> bool {
    return common.is_map_coordinate_in_viewport(x, y)
}

@(export)
is_map_coordinate_halfway_of_viewport :: proc(x: i32, y: i32) -> (bool, bool, bool, bool) {
    return common.is_map_coordinate_halfway_of_viewport(x, y)
}