package common

import "../js"

// TODO: Actually do these functions
get_current_map_height :: proc() -> i32 {
    return 22
}
get_current_map_width :: proc() -> i32 {
    return 33
}

SHOULD_REDRAW :: enum i32 {
    nothing,
    everything,
    ships,
    npcs,
}

should_redraw: i32 = 0

renderer_should_redraw :: proc() -> bool {
    if should_redraw > 0 {
        should_redraw = i32(SHOULD_REDRAW.nothing)
        return true
    }

    return false
}

viewport_width: i32 = 8
viewport_height: i32 = 8

set_viewport_size :: proc(width: i32, height: i32) {
    viewport_width = width
    viewport_height = height
}

get_viewport_size_width :: proc() -> i32 {
    return viewport_width
}

get_viewport_size_height :: proc() -> i32 {
    return viewport_height
}

camera_offset_x: i32 = 0
camera_offset_y: i32 = 0

move_camera_down :: proc() {
    map_height := get_current_map_height()
    
    // Calculate the maximum allowed camera offset
    max_camera_offset_y := max(0, map_height - viewport_height)
    
    // Check if moving down would exceed the map bounds
    if camera_offset_y < max_camera_offset_y {
        camera_offset_y += 1
        should_redraw = i32(SHOULD_REDRAW.ships)
    }
}

move_camera_right :: proc() {
    map_width := get_current_map_width()
    
    // Calculate the maximum allowed camera offset
    max_camera_offset_x := max(0, map_width - viewport_width)
    
    // Check if moving right would exceed the map bounds
    if camera_offset_x < max_camera_offset_x {
        camera_offset_x += 1
        should_redraw = i32(SHOULD_REDRAW.ships)
    }
}

move_camera_up :: proc() {
    if camera_offset_y > 0 {
        camera_offset_y -= 1
        should_redraw = i32(SHOULD_REDRAW.ships)
    }
}

move_camera_left :: proc() {
    if camera_offset_x > 0 {
        camera_offset_x -= 1
        should_redraw = i32(SHOULD_REDRAW.ships)
    }
}

get_viewport_value_at_coordinates :: proc(layer_id: i32, x: i32, y: i32) -> i32 {
    map_width: i32 = get_current_map_width()
    map_height: i32 = get_current_map_height()
    x_padding: i32 = 0
    y_padding: i32 = 0
    if viewport_width > map_width {
        x_padding = (viewport_width - map_width) / 2
    }
    if viewport_height > map_height {
        y_padding = (viewport_height - map_height) / 2
    }
    x_offset := x - x_padding
    y_offset := y - y_padding
    x_offset += camera_offset_x
    y_offset += camera_offset_y
    if x_offset < 0 || y_offset < 0 || x_offset >= map_width || y_offset >= map_height {
        return -1
    }
    layer_value := get_layer_value_at_coordinates(layer_id, x_offset, y_offset)
    return layer_value
}

is_map_coordinate_in_viewport :: proc(x: i32, y: i32) -> bool {
    return x >= camera_offset_x && x < camera_offset_x + viewport_width &&
           y >= camera_offset_y && y < camera_offset_y + viewport_height
}

is_map_coordinate_halfway_of_viewport :: proc(x: i32, y: i32) -> (bool, bool, bool, bool) {
    halfway_x := camera_offset_x + viewport_width / 2
    halfway_y := camera_offset_y + viewport_height / 2
    
    more_than_halfway_x := x > halfway_x
    more_than_halfway_y := y > halfway_y
    less_than_halfway_x := x < halfway_x
    less_than_halfway_y := y < halfway_y
    
    return more_than_halfway_x, more_than_halfway_y, less_than_halfway_x, less_than_halfway_y
}