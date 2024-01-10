// ZIG 0.11.0

// TODO: Scripts
// Outer array is script line
// Inner array is command for line (need to create legend for inner array commands)
// if [0] = 0 = moveEntity
// -- [1] = entityIndex
// -- [2] = direction (0 = left, 1 = right, 2 = up, 3 = down) (EXAMPLE)
// script: [2][3]u8 = .{ .{ 0, 0, 0 }, .{ 0, 0, 0 } };
// runScript(scriptIndex: u8)

const std = @import("std");
const ArrayList = std.ArrayList;

const helpers = @import("helpers.zig");

const renderer = @import("renderer.zig");

const worlds = @import("worlds.zig");
const current_world = worlds.current_worlds[0];

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
    diff_list.append(helpers.enumToU16(DiffListEnum, DiffListEnum.Collision)) catch unreachable;
    // TODO: Make these enums. 1 = delete, 0 = add
    diff_list.append(1) catch unreachable;
    diff_list.append(x) catch unreachable;
    diff_list.append(y) catch unreachable;
}
export fn editor_addCollision(x: u16, y: u16) void {
    var reference_index = viewport_data.items[(y * renderer.viewport_size[0]) + x];
    // Since indexes in viewport_data actually start at 1 (where 0 = empty), we gotta offset this
    reference_index -= 1;
    var layer_collision = helpers.enumToU16(worlds.WorldLayersEnum, worlds.WorldLayersEnum.Collision);
    var layer_offset = (current_world.data[0] * current_world.data[1]) * layer_collision;
    var index = layer_offset + reference_index;
    // To offset the first two elements that contain width & height
    index += 2;
    current_world.data[index] = 1;
    diff_list.append(helpers.enumToU16(DiffListEnum, DiffListEnum.Collision)) catch unreachable;
    diff_list.append(0) catch unreachable;
    diff_list.append(x) catch unreachable;
    diff_list.append(y) catch unreachable;
}

const game_images = @import("images.zig");

//----------------------------------------
// FUNCTIONS HERE
//----------------------------------------
export fn initGame() bool {
    game_images.init();
    diff_list = ArrayList(u16).init(allocator);
    viewport_data = ArrayList(u16).init(allocator);
    debug = ArrayList(u16).init(allocator);
    //current_world.init(allocator);

    var layer_entities = helpers.enumToU16(worlds.WorldLayersEnum, worlds.WorldLayersEnum.Entities);
    var i_position_x = helpers.enumToUsize(entities.EntityDataEnum, entities.EntityDataEnum.PositionX);
    var i_position_y = helpers.enumToUsize(entities.EntityDataEnum, entities.EntityDataEnum.PositionY);
    var i_width = helpers.enumToUsize(worlds.WorldDataEnum, worlds.WorldDataEnum.Width);
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
    var i_width = helpers.enumToU16(worlds.WorldDataEnum, worlds.WorldDataEnum.Width);
    var i_height = helpers.enumToU16(worlds.WorldDataEnum, worlds.WorldDataEnum.Height);
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
        if (direction == helpers.enumToU16(DirectionsEnum, DirectionsEnum.Left)) {
            if (cp_x > 0) {
                cp_x -= 1;
            }
        } else if (direction == helpers.enumToU16(DirectionsEnum, DirectionsEnum.Right)) {
            cp_x += 1;
        }
    }
    if (cp_y >= 0) {
        if (direction == helpers.enumToU16(DirectionsEnum, DirectionsEnum.Up)) {
            if (cp_y > 0) {
                cp_y -= 1;
            }
        } else if (direction == helpers.enumToU16(DirectionsEnum, DirectionsEnum.Down)) {
            cp_y += 1;
        }
    }
    var i_width = helpers.enumToU16(worlds.WorldDataEnum, worlds.WorldDataEnum.Width);
    var i_height = helpers.enumToU16(worlds.WorldDataEnum, worlds.WorldDataEnum.Height);
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
    var i_position_x = helpers.enumToUsize(entities.EntityDataEnum, entities.EntityDataEnum.PositionX);
    var i_position_y = helpers.enumToUsize(entities.EntityDataEnum, entities.EntityDataEnum.PositionY);
    entities.current_entities[entityIndex][i_position_x] = x;
    entities.current_entities[entityIndex][i_position_y] = y;
}
export fn moveEntity(entityIndex: u16, direction: u16) u16 {
    // TODO: Are we not adding this twice in this function?
    // Add entityIndex to diff_list
    diff_list.append(helpers.enumToU16(DiffListEnum, DiffListEnum.EntityMovement)) catch unreachable;
    diff_list.append(entityIndex) catch unreachable;

    var i_position_x = helpers.enumToU16(entities.EntityDataEnum, entities.EntityDataEnum.PositionX);
    var i_position_y = helpers.enumToU16(entities.EntityDataEnum, entities.EntityDataEnum.PositionY);
    // This emulates the intended direction of the entity
    var intended_x: u16 = entities.current_entities[entityIndex][i_position_x];
    var intended_y: u16 = entities.current_entities[entityIndex][i_position_y];
    var previous_x: u16 = entities.current_entities[entityIndex][i_position_x];
    var previous_y: u16 = entities.current_entities[entityIndex][i_position_y];
    switch (direction) {
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Left) => intended_x -= 1,
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Right) => intended_x += 1,
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Up) => intended_y -= 1,
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Down) => intended_y += 1,
        else => {
            return helpers.enumToU16(ReturnEnum, ReturnEnum.OddError);
        },
    }

    // Check if the intended direction is out of bounds
    var i_width = helpers.enumToU16(worlds.WorldDataEnum, worlds.WorldDataEnum.Width);
    var i_height = helpers.enumToU16(worlds.WorldDataEnum, worlds.WorldDataEnum.Height);
    if (intended_x < 0 or intended_x >= current_world.data[i_width] or intended_y < 0 or intended_y >= current_world.data[i_height]) {
        return helpers.enumToU16(ReturnEnum, ReturnEnum.OutOfBounds);
    }

    // Check if the intended direction is blocked
    if (current_world.data[getCurrentWorldIndex(1, intended_x, intended_y)] != 0) {
        return helpers.enumToU16(ReturnEnum, ReturnEnum.BlockedCollision);
    }

    // Check if the intended direction is occupied by another entity
    for (entities.current_entities) |entity| {
        if (entity[i_position_x] == intended_x and entity[i_position_y] == intended_y) {
            return helpers.enumToU16(ReturnEnum, ReturnEnum.AnotherEntityIsThere);
        }
    }

    switch (direction) {
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Left) => entities.current_entities[entityIndex][i_position_x] -= 1,
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Right) => entities.current_entities[entityIndex][i_position_x] += 1,
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Up) => entities.current_entities[entityIndex][i_position_y] -= 1,
        helpers.enumToU16(DirectionsEnum, DirectionsEnum.Down) => entities.current_entities[entityIndex][i_position_y] += 1,
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
    diff_list.append(helpers.enumToU16(DiffListEnum, DiffListEnum.Viewport)) catch unreachable;
    diff_list.append(helpers.enumToU16(DiffListEnum, DiffListEnum.EntityMovement)) catch unreachable;
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

    var layer_entities = helpers.enumToU16(worlds.WorldLayersEnum, worlds.WorldLayersEnum.Entities);
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
    if (offset_x > current_world.data[helpers.enumToUsize(worlds.WorldDataEnum, worlds.WorldDataEnum.Width)] - 1) {
        offset_x = current_world.data[helpers.enumToUsize(worlds.WorldDataEnum, worlds.WorldDataEnum.Width)];
    }
    if (offset_y > current_world.data[helpers.enumToUsize(worlds.WorldDataEnum, worlds.WorldDataEnum.Height)] - 1) {
        offset_y = current_world.data[helpers.enumToUsize(worlds.WorldDataEnum, worlds.WorldDataEnum.Height)];
    }
    var index = getCurrentWorldIndex(layer, offset_x, offset_y);
    // index = getCurrentWorldIndex(layer, x, y);
    return current_world.data[index];
}
export fn getCurrentWorldSize() *const u16 {
    var i_width = helpers.enumToUsize(worlds.WorldDataEnum, worlds.WorldDataEnum.Width);
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
    var i_health = helpers.enumToUsize(entities.EntityDataEnum, entities.EntityDataEnum.Health);
    var i_position_x = helpers.enumToUsize(entities.EntityDataEnum, entities.EntityDataEnum.PositionX);
    var i_position_y = helpers.enumToUsize(entities.EntityDataEnum, entities.EntityDataEnum.PositionY);
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
        diff_list.append(helpers.enumToU16(DiffListEnum, DiffListEnum.EntityUpdate)) catch unreachable;
        diff_list.append(attackeeEntityIndex) catch unreachable;
    }

    if (valid_position and had_health) {
        return helpers.enumToU16(ReturnEnum, ReturnEnum.None);
    } else if (!had_health) {
        return helpers.enumToU16(ReturnEnum, ReturnEnum.NoMoreHealth);
    } else {
        return helpers.enumToU16(ReturnEnum, ReturnEnum.InvalidAttackPosition);
    }
}
export fn getDiffList() ?*u16 {
    return if (diff_list.items.len > 0) &diff_list.items[0] else null;
}
export fn getDiffListLen() usize {
    return diff_list.items.len;
}
export fn clearDiffList() bool {
    diff_list.items.len = 0;
    return true;
}

export fn getDebug() ?*u16 {
    return if (debug.items.len > 0) &debug.items[0] else null;
}
export fn getDebugLen() usize {
    return debug.items.len;
}
export fn clearDebug() bool {
    debug.items.len = 0;
    return true;
}

const Suit = enum(u16) {
    clubs = 0,
    spades = 1,
    diamonds = 2,
    hearts = 3,
    data = 33,
    pub fn isClubs(self: Suit) bool {
        return self == Suit.clubs;
    }
};

test "enum method" {
    try std.testing.expect(@intFromEnum(Suit.data) == 33);
    try std.testing.expect(Suit.spades.isClubs() == Suit.isClubs(.spades));
    try std.testing.expect(Suit.diamonds.isClubs() == Suit.isClubs(.diamonds));
    try std.testing.expect(Suit.hearts.isClubs() == Suit.isClubs(.hearts));
    try std.testing.expect(Suit.spades.isClubs() == Suit.isClubs(.clubs));
}

