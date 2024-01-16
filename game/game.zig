// ZIG 0.11.0

// TODO: Scripts
// Outer array is script line
// Inner array is command for line (need to create legend for inner array commands)
// if [0] = 0 = moveEntity
// -- [1] = entityIndex
// -- [2] = direction (0 = left, 1 = right, 2 = up, 3 = down) (EXAMPLE)
// script: [2][3]u8 = .{ .{ 0, 0, 0 }, .{ 0, 0, 0 } };
// runScript(scriptIndex: u8)

const StringsEnum = enum(u16) {
    Hello = 0,
    World = 1,
};
const EntitiesEnum = enum(u16) {
    Player = 0,
    Enemy = 1,
    NPC = 2,
};
const ImagesEnum = enum(u16) {
    Atlas = 0,
    Player = 1,
};
const WorldsEnum = enum(u16) {
    World1 = 0,
    World2 = 1,
};
const ScriptsEnum = enum(u16) {
    Script1 = 0,
    Script2 = 1,
};

const std = @import("std");
const ArrayList = std.ArrayList;

const helpers = @import("helpers.zig");

const renderer = @import("renderer.zig");

const worlds = @import("worlds.zig");
const current_world = worlds.current_worlds[0];
// TODO: Replace _current_world with current_world when ready
const _current_world = 0;

const entities = @import("entities.zig");

const DiffListEnum = enum(u16) {
    EntityMovement = 0,
    World = 1,
    Collision = 2,
    Viewport = 3,
    EntityUpdate = 4,
};
// TODO: Move diff_list stuff into its own file (?)
// TODO: diff_list should also contain the viewport coordinates (either the coordinates themselves or the index reference to the world data)
var diff_list: ArrayList(u16) = undefined;
var viewport_data: ArrayList(u16) = undefined;

var debug: ArrayList(u16) = undefined;

// Note: Use the GPA because it has some safety built-in and is also reasonably performant
var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();
// const bytes = try allocator.alloc(u8, 100);
// defer allocator.free(bytes);
const ReturnEnum = enum(u16) {
    None = 0,
    MissingField = 1,
    InvalidType = 2,
    EmptyArray = 3,
    BlockedCollision = 4,
    InvalidAttackPosition = 5,
    NoMoreHealth = 6,
    AnotherEntityIsThere = 7,
    OutOfBounds = 8,
    OddError = 9,
};
const DirectionsEnum = enum(u16) {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3,
};

//----------------------------------------
// EDITOR FUNCTIONS HERE
//----------------------------------------
// const editor = @import("editor");
// TODO: To make the above import work, we need to decouple the reference to the viewport_data so that it can be referenced within the editor.zig file
export fn editor_deleteCollision(x: u16, y: u16) void {
    var reference_index = viewport_data.items[(y * renderer.viewport_size[0]) + x];
    // Since indexes in viewport_data actually start at 1 (where 0 = empty), we gotta offset this
    reference_index -= 1;
    var layer_collision = @intFromEnum(worlds.WorldLayersEnum.Collision);
    var layer_offset = (current_world.data[0] * current_world.data[1]) * layer_collision;
    var index = layer_offset + reference_index;
    // To offset the first two elements that contain width & height
    index += 2;
    current_world.data[index] = 0;
    diff_list.append(@intFromEnum(DiffListEnum.Collision)) catch unreachable;
    // TODO: Make these enums. 1 = delete, 0 = add
    diff_list.append(1) catch unreachable;
    diff_list.append(x) catch unreachable;
    diff_list.append(y) catch unreachable;
}
export fn editor_addCollision(x: u16, y: u16) void {
    var reference_index = viewport_data.items[(y * renderer.viewport_size[0]) + x];
    // Since indexes in viewport_data actually start at 1 (where 0 = empty), we gotta offset this
    reference_index -= 1;
    var layer_collision = @intFromEnum(worlds.WorldLayersEnum.Collision);
    var layer_offset = (current_world.data[0] * current_world.data[1]) * layer_collision;
    var index = layer_offset + reference_index;
    // To offset the first two elements that contain width & height
    index += 2;
    current_world.data[index] = 1;
    diff_list.append(@intFromEnum(DiffListEnum.Collision)) catch unreachable;
    diff_list.append(0) catch unreachable;
    diff_list.append(x) catch unreachable;
    diff_list.append(y) catch unreachable;
}

const game_images = @import("images.zig");

//----------------------------------------
// FUNCTIONS HERE
//----------------------------------------
var diff_list_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const diff_list_allocator = diff_list_arena.allocator();
var debug_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const debug_allocator = debug_arena.allocator();
var viewport_data_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const viewport_data_allocator = viewport_data_arena.allocator();

export fn initGame() bool {
    game_images.init();
    diff_list = ArrayList(u16).init(diff_list_allocator);
    viewport_data = ArrayList(u16).init(viewport_data_allocator);
    debug = ArrayList(u16).init(debug_allocator);
    //current_world.init(allocator);

    var layer_entities = @intFromEnum(worlds.WorldLayersEnum.Entities);
    var i_position_x = @intFromEnum(entities.EntityDataEnum.PositionX);
    var i_position_y = @intFromEnum(entities.EntityDataEnum.PositionY);
    var i_width = @intFromEnum(worlds.WorldDataEnum.Width);
    // TODO: See if there's a better way to write this code
    var subtract_count: u16 = 0;
    for (current_world.data, 0..) |value, i| {
        // TODO: Set a maximum here so we don't go over the size of the world
        if (i >= getCurrentWorldIndex(layer_entities, 0, 0)) {
            if (value > 0) {
                var entity_index = @as(u16, @intCast(value));
                entity_index -= 1;
                var entity = entities.current_entities[entity_index];
                entity[i_position_x] = @as(u16, @intCast((i - subtract_count) % current_world.data[i_width]));
                entity[i_position_y] = @as(u16, @intCast((i - subtract_count) / current_world.data[i_width]));
            }
        } else {
            subtract_count += 1;
        }
    }

    updateViewportData();

    return true;
}
fn appendLayerData(layerIndex: u16) void {
    var column: u16 = 0;
    var row: u16 = 0;
    var layerStart = getCurrentWorldIndex(layerIndex, 0, 0);
    
    for (current_world.data, 0..) |value, i| {
        if (i < layerStart) { continue; }
        if (column >= renderer.camera_position[0] and column < renderer.camera_position[0] + renderer.viewport_size[0]) {
            viewport_data.append(value) catch unreachable;
        }
        column += 1;
        
        if (column >= current_world.data[0]) {
            column = 0;
            row += 1;
        }
        
        if (row >= current_world.data[1]) {
            break;
        }
    }
}
export fn updateEditorViewportData(width: u16, height: u16) void {
    viewport_data.items.len = 0;

    var vp_padding_width: u16 = 0;
    var vp_padding_height: u16 = 0;
    if (renderer.viewport_size[0] > width) {
        vp_padding_width = renderer.viewport_size[0] - width;
    }
    if (renderer.viewport_size[1] > height) {
        vp_padding_height = renderer.viewport_size[1] - height;
    }
    var vp_padding_width_left: u16 = 0;
    var vp_padding_width_right: u16 = 0;
    var vp_padding_height_top = vp_padding_height / 2;
    var vp_padding_height_bottom = vp_padding_height / 2;
    if (vp_padding_width > 0) {
        if (vp_padding_width % 2 == 1) {
            vp_padding_width_left = (vp_padding_width - 1) / 2;
            vp_padding_width_right = (vp_padding_width + 1) / 2;
        } else {
            vp_padding_width_left = vp_padding_width / 2;
            vp_padding_width_right = vp_padding_width / 2;
        }
    }
    if (vp_padding_height > 0) {
        if (vp_padding_height % 2 == 1) {
            vp_padding_height_top = (vp_padding_height - 1) / 2;
            vp_padding_height_bottom = (vp_padding_height + 1) / 2;
        } else {
            vp_padding_height_top = vp_padding_height / 2;
            vp_padding_height_bottom = vp_padding_height / 2;
        }
    }

    var index: u16 = 1;
    var index_row: u16 = 1;
    for (0..renderer.viewport_size[1]) |row| {
        for (0..renderer.viewport_size[0]) |column| {
            if (
                column >= vp_padding_width_left and
                column < (renderer.viewport_size[0] - vp_padding_width_right) and
                row >= vp_padding_height_top and
                row < (renderer.viewport_size[1] - vp_padding_height_bottom)
            ) {
                var offset_index: u16 = index;
                offset_index += renderer.camera_position[0];
                offset_index += renderer.camera_position[1] * width;
                viewport_data.append(offset_index) catch unreachable;
                index += 1;
            } else {
                viewport_data.append(0) catch unreachable;
            }
        }
        if (row >= vp_padding_height_top and row < (renderer.viewport_size[1] - vp_padding_height_bottom)) {
            if (width > renderer.viewport_size[0]) {
                index += width - renderer.viewport_size[0];
            }
            index_row += 1;
        }
    }
}
export fn updateViewportData() void {
    viewport_data.items.len = 0;

    var vp_padding_width: u16 = 0;
    var vp_padding_height: u16 = 0;
    if (renderer.viewport_size[0] > current_world.data[0]) {
        vp_padding_width = renderer.viewport_size[0] - current_world.data[0];
    }
    if (renderer.viewport_size[1] > current_world.data[1]) {
        vp_padding_height = renderer.viewport_size[1] - current_world.data[1];
    }
    var vp_padding_width_left: u16 = 0;
    var vp_padding_width_right: u16 = 0;
    var vp_padding_height_top = vp_padding_height / 2;
    var vp_padding_height_bottom = vp_padding_height / 2;
    if (vp_padding_width > 0) {
        if (vp_padding_width % 2 == 1) {
            vp_padding_width_left = (vp_padding_width - 1) / 2;
            vp_padding_width_right = (vp_padding_width + 1) / 2;
        } else {
            vp_padding_width_left = vp_padding_width / 2;
            vp_padding_width_right = vp_padding_width / 2;
        }
    }
    if (vp_padding_height > 0) {
        if (vp_padding_height % 2 == 1) {
            vp_padding_height_top = (vp_padding_height - 1) / 2;
            vp_padding_height_bottom = (vp_padding_height + 1) / 2;
        } else {
            vp_padding_height_top = vp_padding_height / 2;
            vp_padding_height_bottom = vp_padding_height / 2;
        }
    }

    var index: u16 = 1;
    var index_row: u16 = 1;
    for (0..renderer.viewport_size[1]) |row| {
        for (0..renderer.viewport_size[0]) |column| {
            if (
                column >= vp_padding_width_left and
                column < (renderer.viewport_size[0] - vp_padding_width_right) and
                row >= vp_padding_height_top and
                row < (renderer.viewport_size[1] - vp_padding_height_bottom)
            ) {
                var offset_index: u16 = index;
                offset_index += renderer.camera_position[0];
                offset_index += renderer.camera_position[1] * current_world.data[0];
                viewport_data.append(offset_index) catch unreachable;
                index += 1;
            } else {
                viewport_data.append(0) catch unreachable;
            }
        }
        if (row >= vp_padding_height_top and row < (renderer.viewport_size[1] - vp_padding_height_bottom)) {
            if (current_world.data[0] > renderer.viewport_size[0]) {
                index += current_world.data[0] - renderer.viewport_size[0];
            }
            index_row += 1;
        }
    }
}
export fn getViewportData() ?*u16 {
    return if (viewport_data.items.len > 0) &viewport_data.items[0] else null;
}
export fn getViewportDataLen() usize {
    return viewport_data.items.len;
}
// Call this function to properly release resources
// export fn deinitViewportData() void {
//     viewport_data.deinit();
// }
export fn getCurrentWorldIndex(layer: u16, x: u16, y: u16) u16 {
    var offset: u16 = 2; // To account for width & height which take up position 0 and 1
    var i_width = @intFromEnum(worlds.WorldDataEnum.Width);
    var i_height = @intFromEnum(worlds.WorldDataEnum.Height);
    var index = (layer * current_world.data[i_width] * current_world.data[i_height]) + (y * current_world.data[i_width]) + x + offset;
    return index;
}
export fn setViewportSize(width: u16, height: u16) void {
    renderer.viewport_size[0] = width;
    renderer.viewport_size[1] = height;
}
export fn setCameraPosition(direction: u16) void {
    var cp_x: u16 = renderer.camera_position[0];
    var cp_y: u16 = renderer.camera_position[1];
    if (cp_x >= 0) {
        if (direction == @intFromEnum(DirectionsEnum.Left)) {
            if (cp_x > 0) {
                cp_x -= 1;
            }
        } else if (direction == @intFromEnum(DirectionsEnum.Right)) {
            cp_x += 1;
        }
    }
    if (cp_y >= 0) {
        if (direction == @intFromEnum(DirectionsEnum.Up)) {
            if (cp_y > 0) {
                cp_y -= 1;
            }
        } else if (direction == @intFromEnum(DirectionsEnum.Down)) {
            cp_y += 1;
        }
    }
    var i_width = @intFromEnum(worlds.WorldDataEnum.Width);
    var i_height = @intFromEnum(worlds.WorldDataEnum.Height);
    if (current_world.data[i_width] > renderer.viewport_size[0]) {
        if ((cp_x + renderer.viewport_size[0]) > current_world.data[i_width]) {
            cp_x -= 1;
        }
    } else {
        cp_x = 0;
    }
    if (current_world.data[i_height] > renderer.viewport_size[1]) {
        if ((cp_y + renderer.viewport_size[1]) > current_world.data[i_height]) {
            cp_y -= 1;
        }
    } else {
        cp_y = 0;
    }
}
export fn getCameraPosition() *[2]u16 {
    return &renderer.camera_position;
}
export fn getEntityLength(entityIndex: u16) u16 {
    return @as(u16, @intCast(entities.current_entities[entityIndex].len));
}
export fn getEntity(entityIndex: u16) *[3]u16 {
    // Note: Technically this already an array of pointers so we only to return the pointer from this array
    return entities.current_entities[entityIndex];
}
// ALTERNATE WAY OF DOING THIS
// export fn getEntity(entityIndex: u8) *const u16 {
//     return &current_entities[entityIndex][0];
// }
export fn setEntityPosition(entityIndex: u16, x: u16, y: u16) void {
    var i_position_x = @intFromEnum(entities.EntityDataEnum.PositionX);
    var i_position_y = @intFromEnum(entities.EntityDataEnum.PositionY);
    entities.current_entities[entityIndex][i_position_x] = x;
    entities.current_entities[entityIndex][i_position_y] = y;
}
export fn moveEntity(entityIndex: u16, direction: u16) u16 {
    // TODO: Are we not adding this twice in this function?
    // Add entityIndex to diff_list
    diff_list.append(@intFromEnum(DiffListEnum.EntityMovement)) catch unreachable;
    diff_list.append(entityIndex) catch unreachable;

    var i_position_x = @intFromEnum(entities.EntityDataEnum.PositionX);
    var i_position_y = @intFromEnum(entities.EntityDataEnum.PositionY);
    // This emulates the intended direction of the entity
    var intended_x: u16 = entities.current_entities[entityIndex][i_position_x];
    var intended_y: u16 = entities.current_entities[entityIndex][i_position_y];
    var previous_x: u16 = entities.current_entities[entityIndex][i_position_x];
    var previous_y: u16 = entities.current_entities[entityIndex][i_position_y];
    switch (direction) {
        @intFromEnum(DirectionsEnum.Left) => intended_x -= 1,
        @intFromEnum(DirectionsEnum.Right) => intended_x += 1,
        @intFromEnum(DirectionsEnum.Up) => intended_y -= 1,
        @intFromEnum(DirectionsEnum.Down) => intended_y += 1,
        else => {
            return @intFromEnum(ReturnEnum.OddError);
        },
    }

    // Check if the intended direction is out of bounds
    var i_width = @intFromEnum(worlds.WorldDataEnum.Width);
    var i_height = @intFromEnum(worlds.WorldDataEnum.Height);
    if (intended_x < 0 or intended_x >= current_world.data[i_width] or intended_y < 0 or intended_y >= current_world.data[i_height]) {
        return @intFromEnum(ReturnEnum.OutOfBounds);
    }

    // Check if the intended direction is blocked
    if (current_world.data[getCurrentWorldIndex(1, intended_x, intended_y)] != 0) {
        return @intFromEnum(ReturnEnum.BlockedCollision);
    }

    // Check if the intended direction is occupied by another entity
    for (entities.current_entities) |entity| {
        if (entity[i_position_x] == intended_x and entity[i_position_y] == intended_y) {
            return @intFromEnum(ReturnEnum.AnotherEntityIsThere);
        }
    }

    switch (direction) {
        @intFromEnum(DirectionsEnum.Left) => entities.current_entities[entityIndex][i_position_x] -= 1,
        @intFromEnum(DirectionsEnum.Right) => entities.current_entities[entityIndex][i_position_x] += 1,
        @intFromEnum(DirectionsEnum.Up) => entities.current_entities[entityIndex][i_position_y] -= 1,
        @intFromEnum(DirectionsEnum.Down) => entities.current_entities[entityIndex][i_position_y] += 1,
        else => {
            return helpers.enumToU16(ReturnEnum, ReturnEnum.OddError);
        },
    }

    // Add viewport_data coordinate where entity was to diff_list
    // Add viewport_data coordinate where entity IS to diff_list
    var previous_world_index: u16 = ((previous_y * current_world.data[0]) + previous_x + 2);
    previous_world_index = getCurrentWorldIndex(0, previous_x, previous_y);
    var current_world_index: u16 = ((intended_y * current_world.data[0]) + intended_x + 2);
    current_world_index = getCurrentWorldIndex(0, intended_x, intended_y);
    // TODO: Why do you need this -1 here
    previous_world_index -= 1;
    current_world_index -= 1;
    var vp_row: u16 = 0;
    var vp_column: u16 = 0;
    diff_list.append(@intFromEnum(DiffListEnum.Viewport)) catch unreachable;
    diff_list.append(@intFromEnum(DiffListEnum.EntityMovement)) catch unreachable;
    for (viewport_data.items) |value| {
        if (value == previous_world_index) {
            diff_list.append(0) catch unreachable;
            diff_list.append(vp_column) catch unreachable;
            diff_list.append(vp_row) catch unreachable;
        } else if (value == current_world_index) {
            diff_list.append(1) catch unreachable;
            diff_list.append(vp_column) catch unreachable;
            diff_list.append(vp_row) catch unreachable;
        }
        vp_column += 1;
        if (vp_column >= renderer.viewport_size[0]) {
            vp_column = 0;
            vp_row += 1;
        }
    }

    var layer_entities = @intFromEnum(worlds.WorldLayersEnum.Entities);
    var entity_index_to_record = @as(u16, @intCast(entityIndex));
    entity_index_to_record += 1;
    var previous_index = getCurrentWorldIndex(layer_entities, previous_x, previous_y);
    current_world.data[previous_index] = 0;
    var current_index = getCurrentWorldIndex(layer_entities, intended_x, intended_y);
    current_world.data[current_index] = entity_index_to_record;

    return helpers.enumToU16(ReturnEnum, ReturnEnum.None);
}
// TODO: Update this function *without* camera position offset and create a new function that returns WITH camera position offset
export fn getCurrentWorldData(layer: u16, x: u16, y: u16) u16 {
    var offset_x: u16 = x + renderer.camera_position[0];
    var offset_y: u16 = y + renderer.camera_position[1];
    if (offset_x < 0) {
        offset_x = 0;
    }
    if (offset_y < 0) {
        offset_y = 0;
    }
    if (offset_x > current_world.data[@intFromEnum(worlds.WorldDataEnum.Width)] - 1) {
        offset_x = current_world.data[@intFromEnum(worlds.WorldDataEnum.Width)];
    }
    if (offset_y > current_world.data[@intFromEnum(worlds.WorldDataEnum.Height)] - 1) {
        offset_y = current_world.data[@intFromEnum(worlds.WorldDataEnum.Height)];
    }
    var index = getCurrentWorldIndex(layer, offset_x, offset_y);
    // index = getCurrentWorldIndex(layer, x, y);
    return current_world.data[index];
}
export fn getCurrentWorldSize() *const u16 {
    var i_width = @intFromEnum(worlds.WorldDataEnum.Width);
    return &current_world.data[i_width];
}
export fn getWorld() *const u16 {
    // TODO: Currently we know the offset is two because width & height take positions 0&1 but we should have a way to reference this dynamically in case this changes
    return &current_world.data[2];
}
export fn attackEntity(attackerEntityIndex: u16, attackeeEntityIndex: u16) u16 {
    var valid_position: bool = false;
    var had_health: bool = false;
    var attacker = entities.current_entities[attackerEntityIndex];
    var attackee = entities.current_entities[attackeeEntityIndex];
    var i_health = @intFromEnum(entities.EntityDataEnum.Health);
    var i_position_x = @intFromEnum(entities.EntityDataEnum.PositionX);
    var i_position_y = @intFromEnum(entities.EntityDataEnum.PositionY);
    if (attackee[i_health] > 0) {
        had_health = true;
    }
    // TODO: Pull out "adjacent" into its own function
    if (attacker[i_position_x] == attackee[i_position_x]) {
        if (attacker[i_position_y] == attackee[i_position_y] - 1 or attacker[i_position_y] == attackee[i_position_y] + 1) {
            valid_position = true;
        }
    }
    if (attacker[i_position_y] == attackee[i_position_y]) {
        if (attacker[i_position_x] == attackee[i_position_x] - 1 or attacker[i_position_x] == attackee[i_position_x] + 1) {
            valid_position = true;
        }
    }
    if (valid_position and attackee[i_health] > 0) {
        attackee[i_health] -= 1;
        diff_list.append(@intFromEnum(DiffListEnum.EntityUpdate)) catch unreachable;
        diff_list.append(attackeeEntityIndex) catch unreachable;
    }

    if (valid_position and had_health) {
        return @intFromEnum(ReturnEnum.None);
    } else if (!had_health) {
        return @intFromEnum(ReturnEnum.NoMoreHealth);
    } else {
        return @intFromEnum(ReturnEnum.InvalidAttackPosition);
    }
}
export fn getDiffList() ?*u16 {
    return if (diff_list.items.len > 0) &diff_list.items[0] else null;
}
export fn getDiffListLen() usize {
    return diff_list.items.len;
}
export fn clearDiffList() bool {
    // diff_list.items.len = 0;
    // diff_list.deinit();
    diff_list.clearRetainingCapacity();
    _ = diff_list_arena.reset(.retain_capacity);
    // or arena.reset()
    return true;
}

export fn getDebug() ?*u16 {
    return if (debug.items.len > 0) &debug.items[0] else null;
}
export fn getDebugLen() usize {
    return debug.items.len;
}
export fn clearDebug() bool {
    // debug.items.len = 0;
    // debug.deinit()
    debug.clearRetainingCapacity();
    _ = debug_arena.reset(.retain_capacity);
    return true;
}

// ------------------------------------------------------------------------------------------
// ------ NEW FUNCTIONS
export fn debug_get_data(index: u16) u16 {
    return debug.items[index];
}
export fn debug_get_length() u16 {
    return @as(u16, @intCast(debug.items.len));
}
export fn debug_clear_all() void {
    debug.clearRetainingCapacity();
    _ = debug_arena.reset(.retain_capacity);
}
test "test_debug_stuff" {
    debug = ArrayList(u16).init(debug_allocator);
    debug.append(1) catch unreachable;
    try std.testing.expect(debug_get_length() == 1);
    try std.testing.expect(debug_get_data(0) == 1);
    debug_clear_all();
    try std.testing.expect(debug_get_length() == 0);
    // try std.testing.expect(debug_get_data(0) == 0);
}

export fn diff_list_get_data(index: u16) u16 {
    return diff_list.items[index];
}
export fn diff_list_get_length() u16 {
    return @as(u16, @intCast(diff_list.items.len));
}
export fn diff_list_clear_all() void {
    diff_list.clearRetainingCapacity();
    _ = diff_list_arena.reset(.retain_capacity);
}
test "test_diff_list_stuff" {
    diff_list = ArrayList(u16).init(diff_list_allocator);
    diff_list.append(1) catch unreachable;
    try std.testing.expect(diff_list_get_length() == 1);
    try std.testing.expect(diff_list_get_data(0) == 1);
    diff_list_clear_all();
    try std.testing.expect(diff_list_get_length() == 0);
    // try std.testing.expect(diff_list_get_data(0) == 0);
}

export fn viewport_update() void {}
export fn viewport_get_data(x: u16, y: u16) u16 {
    var index = (y * x) + x;
    return viewport_data.items[index];
}
export fn viewport_get_length() u16 {
    return @as(u16, @intCast(viewport_data.items.len));
}
export fn viewport_clear() void {
    viewport_data.clearRetainingCapacity();
    _ = viewport_data_arena.reset(.retain_capacity);
}
test "test_viewport_stuff" {
    viewport_data = ArrayList(u16).init(viewport_data_allocator);
    viewport_data.append(0) catch unreachable;
    viewport_data.append(1) catch unreachable;
    // TODO: how would I test viewport_update ?
    try std.testing.expect(viewport_get_data(1, 0) == 1);
    try std.testing.expect(viewport_get_length() == 2);
    viewport_clear();
    try std.testing.expect(viewport_get_length() == 0);
}

// FUNCTION START
// name: world_get_data
// @param world: u16
// FUNCTION END
export fn world_get_data(world: u16, layer: u16, x: u16, y: u16) u16 {
    var index: u16 = worlds.world_indexes[world];
    var size: u16 = worlds.world_sizes[world];
    var width: u16 = worlds.world_dimensions[(world * 2)];
    index = index + (size * layer);
    index = index + ((y * width) + x);
    return worlds.all_worlds[index];
}
export fn world_get_width(world: u16) u16 {
    return worlds.world_dimensions[(world * 2)];
}
export fn world_get_height(world: u16) u16 {
    return worlds.world_dimensions[(world * 2) + 1];
}
export fn current_world_get_data(layer: u16, x: u16, y: u16) u16 {
    var index: u16 = worlds.world_indexes[_current_world];
    var size: u16 = worlds.world_sizes[_current_world];
    var width: u16 = worlds.world_dimensions[(_current_world * 2)];
    index = index + (size * layer);
    index = index + ((y * width) + x);
    return worlds.all_worlds[index];
}
export fn current_world_get_width() u16 {
    return worlds.world_dimensions[(_current_world * 2)];
}
export fn current_world_get_height() u16 {
    return worlds.world_dimensions[(_current_world * 2) + 1];
}
test "test_world_data" {
    try std.testing.expect(world_get_data(1, 0, 2, 1) == 99);
    try std.testing.expect(world_get_width(1) == 3);
    try std.testing.expect(world_get_height(1) == 3);
    try std.testing.expect(current_world_get_data(1, 1, 1) == 98);
    try std.testing.expect(current_world_get_width() == 2);
    try std.testing.expect(current_world_get_height() == 2);
}

export fn entity_set_position(entity: u16, x: u16, y: u16) void {
    _ = y;
    _ = x;
    _ = entity;
    // TODO: Both in entity array data AND in world npc layer data
    // TODO: Check if entity even belongs in world??

}
export fn entity_move(index: u16) void {
    // TODO: up down left right
    _ = index;
}
export fn entity_attack(index: u16, entity_attacked_index: u16) void {
    _ = index;
    _ = entity_attacked_index;
}
export fn entity_get_health(entity: u16) u16 {
    // TODO: Check if editor_entities length > 0
    // If so, find entity_index (in parameter) and check if modification includes 0, new_health_modified_value
    // return that instead of original
    return entities.entities[entities.entity_indexes[entity]]; 
}
export fn entity_get_position_x(entity: u16) u16 {
    return entities.entities[entities.entity_indexes[entity] + 1];
}
export fn entity_get_position_y(entity: u16) u16 {
    return entities.entities[entities.entity_indexes[entity] + 2];
}
export fn entity_set_health(entity: u16, health: u16) void {
    entities.entities[entities.entity_indexes[entity]] = health; 
}
test "test_entities" {
    try std.testing.expect(entity_get_health(0) == 10);
    entity_set_health(0, 11);
    try std.testing.expect(entity_get_health(0) == 11);
    try std.testing.expect(entity_get_position_x(0) == 0);
    try std.testing.expect(entity_get_position_y(0) == 0);
}

export fn image_get_data(image: u16, cursor: u16) u16 {
    var index = game_images.image_indexes[image];
    index = index + cursor;
    return game_images.image_atlas[index];
}
export fn image_get_size(image: u16) u16 {
    return game_images.image_sizes[image];
}
export fn image_get_width(image: u16) u16 {
    return game_images.image_dimensions[(image * 2)];
}
export fn image_get_height(image: u16) u16 {
    return game_images.image_dimensions[(image * 2) + 1];
}
test "test_images" {
    try std.testing.expect(image_get_data(0, 3) == 255);
    try std.testing.expect(image_get_size(0) == 16);
    try std.testing.expect(image_get_width(0) == 2);
    try std.testing.expect(image_get_height(0) == 2);
}

export fn camera_get_position_x() u16 {
    return renderer.camera_position[0];
}
export fn camera_get_position_y() u16 {
    return renderer.camera_position[1];
}
export fn camera_set_position(x: u16, y: u16) void {
    renderer.camera_position[0] = x;
    renderer.camera_position[1] = y;
}
test "test_camera" {
    try std.testing.expect(camera_get_position_x() == 0);
    camera_set_position(0, 3);
    try std.testing.expect(camera_get_position_y() == 3);
}

var editor_entities_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const editor_entities_allocator = editor_entities_arena.allocator();
var editor_entities: ArrayList(u32) = undefined;
export fn initEditor() void {
    editor_entities = ArrayList(u32).init(editor_entities_allocator);
}
export fn editor_modifyEntityHealth(entity: u16, health: u16) void {
    _ = health;
    _ = entity;
    // TODO: Make sure entity being referenced is not a NEW entity, only in existence within editor, as opposed to modifying original
    // editor_entities.append(entity);
    // editor_entities.append(1);
    // editor_entities.append(0); // health array index, TODO: use enum
    // editor_entities.append(health);
    // TODO: What if this entity already has modifications, how do you append to existing modifications or remove modifications previously done for the same data/attribute?
    // Answer: Possibly break this out into multiple arrays, one for entity_index+#_of_modified_entries, one for modified_indexes and values
    // MAYBE

    // Lookup arrays
    // modified_things = [indexes, modified_attributes_index(optional), #of_modified_attributes]
    // modified_attributes = [0:health, ...] // Does attribute index match an enum
    // modified_values = [] // modified_attributes array index would just match modified_values
    // every time we edit an attribute
    // -> [thing_index, which_attribute, modified_value]

    // var entity_index: u16 = 0;
    // var have_modification: bool = false;
    // for (editor_entities, 0..) |value, i| {
    //     if (i == entity_index + 1) {
    //         // attribute
    //         if (value == 0) {
    //             // matches health enum
    //             // modify value on next i
    //             have_modification = true;
    //         } 
    //     }
    //     else if (i == entity_index + 2) {
    //         // value
    //         if (have_modification) {
    //             value = health;
    //         }
    //     }
    //     else {
    //         entity_index = i;
    //         if (value == entity) {
    //             // HIT
    //         }
    //     }
    // }
    // We did not find attribute modification, we must insert it
}
test "test_array_skippage" {
    var test_array: [8]u16 = .{0, 1, 2, 3, 4, 5, 6, 7};
    var _value: u16 = 0;
    for (test_array, 0..) |value, i| {
        if (i < 6) {
            continue;
        }
        if (i >= 6) {
            _value = value;
        }
    }
    try std.testing.expect(_value == 7);
}
// TODO: EDITOR FUNCTIONS
// Copy editor_addCollision and editor_removeCollision
// - Collision Management
// - Entity Management
// -- NPC
// --- Edit && Create
// -- Item
// --- Armor
// --- Weapons
// --- Ship stuff (like lime juice)
// -- Ship
// - World Management
// -- Edit && Create World
// -- Starting locations of entit(ies)
// -- Layers (?)
// - Port Management
// -- Name
// -- Location in world?
// - World Management
// -- Layers
// -- NPCs
// -- Collisions
// -- Backgound
// -- Foreground
// -- Extra in between????
// - Images
// -- Create New Image
// -- Edit Existing Image

export fn editor_create_entity_npc(health: u16) void {
    _ = health;

    // entities.entities
    // append new record (array) to entities.entities
    // add new index to entities.entity_index (currently 0, 3, 6)
    // we have to find a way to resize the existing arrays to include the new entries especially because we've hard coded their initial array sizes
    // WAYS YOU COULD DO THIS
    // - Create a new array with original array length + new size
    // - Iterate over previous array, append to new array, then add new data to new array
    // ANOTHER WAY
    // - Hold a dynamic array for editor purposes (ArrayList)
    // - Store all editor data in dynamic array
    // - When you call functions like "get_entity" for the renderer, you have to make sure you also pass along / check the editor arrays
    // - BENEFIT: you can dump your editor modifications and go back to original + you can export your editor data via the front-end (js_convert_to_zig.js) and then re-compile with new data
    // ANOTHER WAY
    // - Resize existing statically compiled arrays on the fly
    // - Update data
    // - BENEFIT: no separate/duplicate/extra editor memory is required
    //
    // Chosen to do -> editor arrays as add-ons to original arrays
    // When editor passes an index/reference to entity (or other item) you want to reference, you simply check length of original game array and, if greater than that, assume it must be editor, check editor array offset by original (index - original_array_length = editor_array_index)
    // BOOM EMERIL
    // 
    // LAST STEP -> figure out what kind of data we want to be using for editor
    // DECISION: ArrayList
    // var editor_entities_array = std.ArrayList(u32).init(allocator);
    // init_editor function ??
    // deinit_editor -> for when you decide to reset all your data
    // individual deinit_editor_functions -> for when you decide to remove stuff you've created like new entities and whatnot (individual editor denits)
    //
    // Store indexes like entities_indexes against where entities live in a big flat array
    //
    // What if, in editor, you make a change to an original game entity/world/other data and then you want to restore it without reloading the whole game??
    // Two options
    // - diff
    // -- Keep track of original data I've diffed
    // -- store diffs in some kind of array
    // -- reference diffs every time you ask for original data
    // -- [health, x, y] -> in editor, you only changed health -> editor_diff_array -> [entity_index, how_many_things_have_you_diffed, index_of_original_diff_value(i.e: 0 for health), diffed_value(i.e: 10)]
    // - dupe
    // -- dupe original, keep original in dupe, modify original (PREFERRED)
    // -- dupe original, keep original as original, return duped modified when asking for data
    //
    // Chosen to do -> diff
    // because you will only ever have functions return a single value for any piece of original data you're asking for which means your editor can just check for available diff values given entity/item/image/whatever and against the array index and return the diff value instead of original
    // Then you also don't have to duplicate large arrays for only one or two changes, for example
    //
    // DIFF STRUCTURE
    // ArrayList per data (editor_worlds, editor_entities, editor_images)
    // [index_of_thing_being_diffed, #_of_diffs, array_index, diff_value, ...end_of_#_of_diffs, index_of_thing_being_diffed]
}
export fn editor_edit_entity_npc_health(entity: u16, health: u16) void {
    _ = health;
    _ = entity;
}
// export fn editor_editNpcStat(entity: u16, stat: u16) void {}
export fn editor_duplicate_entity_npc(entity: u16) void {
    _ = entity;
}

test "detect leak" {
    var list = std.ArrayList(u21).init(std.testing.allocator);
    // missing `defer list.deinit();`
    try list.append('☔');
    // list.items.len = 0;
    defer list.deinit();

    try std.testing.expect(list.items.len == 1);
}
