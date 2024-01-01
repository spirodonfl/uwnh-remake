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
// TODO: const renderer = @import("renderer.zig");
var camera_position: [2]u16 = .{ 0, 0 }; // Equivalent to a world offset, more or less
var viewport_size: [2]u16 = .{ 0, 0 };

const worlds = @import("worlds.zig");
const WorldDataEnum = worlds.WorldDataEnum;
const WorldLayersEnum = worlds.WorldLayersEnum;
const current_world = worlds.current_worlds[0];
pub const test_world = @import("testworld.zig");

const _entities = @import("entities.zig");
const EntityDataEnum = _entities.EntityDataEnum;
const current_entities = _entities.current_entities;

const DiffListEnum = enum(u16) {
    Entity = 0,
    World = 1,
    Collision = 2,
};
// TODO: Move diff_list stuff into its own file (?)
var diff_list: ArrayList(u16) = undefined;
var viewport_data: ArrayList(u16) = undefined;

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

    // TODO: Remove these in favor of enumToU16&&enumToUsize functions
    pub fn getAsUsize(self: ReturnEnum) usize {
        return @as(usize, @intFromEnum(self));
    }

    pub fn getAsU16(self: ReturnEnum) u16 {
        return @intFromEnum(self);
    }
};
const DirectionsEnum = enum(u16) {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3,
};
// TODO: Replace all enum functions with just this. Much more generalized this way
fn enumToUsize(comptime E: type, value: E) usize {
    return @as(usize, @intFromEnum(value));
}
fn enumToU16(comptime E: type, value: E) u16 {
    return @intFromEnum(value);
}

//----------------------------------------
// EDITOR FUNCTIONS HERE
//----------------------------------------
export fn editor_deleteCollision(x: u16, y: u16) void {
    var reference_index = viewport_data.items[(y * viewport_size[0]) + x];
    // Since indexes in viewport_data actually start at 1 (where 0 = empty), we gotta offset this
    reference_index -= 1;
    var layer_collision = WorldLayersEnum.getAsU16(WorldLayersEnum.Collision);
    var layer_offset = (current_world.data.items[0] * current_world.data.items[1]) * layer_collision;
    var index = layer_offset + reference_index;
    // To offset the first two elements that contain width & height
    index += 2;
    current_world.data.items[index] = 0;
    diff_list.append(enumToU16(DiffListEnum, DiffListEnum.Collision)) catch unreachable;
    diff_list.append(1) catch unreachable;
    diff_list.append(x) catch unreachable;
    diff_list.append(y) catch unreachable;
}
export fn editor_addCollision(x: u16, y: u16) void {
    var reference_index = viewport_data.items[(y * viewport_size[0]) + x];
    // Since indexes in viewport_data actually start at 1 (where 0 = empty), we gotta offset this
    reference_index -= 1;
    var layer_collision = WorldLayersEnum.getAsU16(WorldLayersEnum.Collision);
    var layer_offset = (current_world.data.items[0] * current_world.data.items[1]) * layer_collision;
    var index = layer_offset + reference_index;
    // To offset the first two elements that contain width & height
    index += 2;
    current_world.data.items[index] = 1;
    diff_list.append(enumToU16(DiffListEnum, DiffListEnum.Collision)) catch unreachable;
    diff_list.append(0) catch unreachable;
    diff_list.append(x) catch unreachable;
    diff_list.append(y) catch unreachable;
}

//----------------------------------------
// FUNCTIONS HERE
//----------------------------------------
export fn initGame() bool {
    diff_list = ArrayList(u16).init(allocator);
    viewport_data = ArrayList(u16).init(allocator);
    current_world.init(allocator);

    var layer_entities = WorldLayersEnum.getAsU16(WorldLayersEnum.Entities);
    var i_position_x = EntityDataEnum.getAsUsize(EntityDataEnum.PositionX);
    var i_position_y = EntityDataEnum.getAsUsize(EntityDataEnum.PositionY);
    var i_width = WorldDataEnum.getAsUsize(WorldDataEnum.Width);
    // TODO: See if there's a better way to write this code
    var subtract_count: u16 = 0;
    for (current_world.data.items, 0..) |value, i| {
        // TODO: Set a maximum here so we don't go over the size of the world
        if (i >= getCurrentWorldIndex(layer_entities, 0, 0)) {
            if (value > 0) {
                var entity_index = @as(u16, @intCast(value));
                entity_index -= 1;
                var entity = current_entities[entity_index];
                entity[i_position_x] = @as(u16, @intCast((i - subtract_count) % current_world.data.items[i_width]));
                entity[i_position_y] = @as(u16, @intCast((i - subtract_count) / current_world.data.items[i_width]));
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
    
    for (current_world.data.items, 0..) |value, i| {
        if (i < layerStart) { continue; }
        if (column >= camera_position[0] and column < camera_position[0] + viewport_size[0]) {
            viewport_data.append(value) catch unreachable;
        }
        column += 1;
        
        if (column >= current_world.data.items[0]) {
            column = 0;
            row += 1;
        }
        
        if (row >= current_world.data.items[1]) {
            break;
        }
    }
}
// TODO: Add row to world
// fn insertSlice(self: *Self, i: usize, items: []const T) Allocator.Error!void
// Insert slice items at index i by moving list[i .. list.len] to make room. …
// TODO: Remove row from world
// ??
// TODO: Add column to world
// fn insert(self: *Self, n: usize, item: T) Allocator.Error!void
// Insert item at index n. Moves list[n .. list.len] to higher indices to mak…
// TODO: Remove column from world
// fn orderedRemove(self: *Self, i: usize) T
// Remove the element at index i, shift elements after index i forward, and re…
// TODO: Clear current world
// TODO: Set data for current world at specific index + layer
// TODO: Set size of current world and adjust rows & columns automatically (remove or add accordingly)
export fn updateViewportData() void {
    viewport_data.items.len = 0;

    var vp_padding_width: u16 = 0;
    var vp_padding_height: u16 = 0;
    if (viewport_size[0] > current_world.data.items[0]) {
        vp_padding_width = viewport_size[0] - current_world.data.items[0];
    }
    if (viewport_size[1] > current_world.data.items[1]) {
        vp_padding_height = viewport_size[1] - current_world.data.items[1];
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
    for (0..viewport_size[1]) |row| {
        for (0..viewport_size[0]) |column| {
            if (
                column >= vp_padding_width_left and
                column < (viewport_size[0] - vp_padding_width_right) and
                row >= vp_padding_height_top and
                row < (viewport_size[1] - vp_padding_height_bottom)
            ) {
                var offset_index: u16 = index;
                offset_index += camera_position[0];
                offset_index += camera_position[1] * current_world.data.items[0];
                viewport_data.append(offset_index) catch unreachable;
                index += 1;
            } else {
                viewport_data.append(0) catch unreachable;
            }
        }
        if (row >= vp_padding_height_top and row < (viewport_size[1] - vp_padding_height_bottom)) {
            if (current_world.data.items[0] > viewport_size[0]) {
                index += current_world.data.items[0] - viewport_size[0];
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
    var i_width = WorldDataEnum.getAsU16(WorldDataEnum.Width);
    var i_height = WorldDataEnum.getAsU16(WorldDataEnum.Height);
    var index = (layer * current_world.data.items[i_width] * current_world.data.items[i_height]) + (y * current_world.data.items[i_width]) + x + offset;
    return index;
}
export fn setViewportSize(width: u16, height: u16) void {
    viewport_size[0] = width;
    viewport_size[1] = height;
}
// TODO: This needs a LOT of cleanup
export fn setCameraPosition(direction: u16) void {
    if (camera_position[0] >= 0) {
        if (direction == 2) {
            if (camera_position[0] > 0) {
                camera_position[0] -= 1;
            }
        } else if (direction == 3) {
            camera_position[0] += 1;
        }
    }
    if (camera_position[1] >= 0) {
        if (direction == 0) {
            if (camera_position[1] > 0) {
                camera_position[1] -= 1;
            }
        } else if (direction == 1) {
            camera_position[1] += 1;
        }
    }
    var i_width = WorldDataEnum.getAsU16(WorldDataEnum.Width);
    var i_height = WorldDataEnum.getAsU16(WorldDataEnum.Height);
    if (current_world.data.items[i_width] > viewport_size[0]) {
        if ((camera_position[0] + viewport_size[0]) > current_world.data.items[i_width]) {
            camera_position[0] -= 1;
        }
    } else {
        camera_position[0] = 0;
    }
    if (current_world.data.items[i_height] > viewport_size[1]) {
        if ((camera_position[1] + viewport_size[1]) > current_world.data.items[i_height]) {
            camera_position[1] -= 1;
        }
    } else {
        camera_position[1] = 0;
    }
}
export fn getCameraPosition() *[2]u16 {
    return &camera_position;
}
export fn getEntityLength(entityIndex: u16) u16 {
    return @as(u16, @intCast(current_entities[entityIndex].len));
}
export fn getEntity(entityIndex: u16) *[3]u16 {
    // Note: Technically this already an array of pointers so we only to return the pointer from this array
    return current_entities[entityIndex];
}
// ALTERNATE WAY OF DOING THIS
// export fn getEntity(entityIndex: u8) *const u16 {
//     return &current_entities[entityIndex][0];
// }
export fn setEntityPosition(entityIndex: u16, x: u16, y: u16) void {
    var i_position_x = EntityDataEnum.getAsUsize(EntityDataEnum.PositionX);
    var i_position_y = EntityDataEnum.getAsUsize(EntityDataEnum.PositionY);
    current_entities[entityIndex][i_position_x] = x;
    current_entities[entityIndex][i_position_y] = y;
}
export fn moveEntity(entityIndex: u16, direction: u16) u16 {
    // Add entityIndex to diff_list
    diff_list.append(enumToU16(DiffListEnum, DiffListEnum.Entity)) catch unreachable;
    diff_list.append(entityIndex) catch unreachable;

    var i_position_x = EntityDataEnum.getAsU16(EntityDataEnum.PositionX);
    var i_position_y = EntityDataEnum.getAsU16(EntityDataEnum.PositionY);
    // This emulates the intended direction of the entity
    var intended_x: u16 = current_entities[entityIndex][i_position_x];
    var intended_y: u16 = current_entities[entityIndex][i_position_y];
    var previous_x: u16 = current_entities[entityIndex][i_position_x];
    var previous_y: u16 = current_entities[entityIndex][i_position_y];
    switch (direction) {
        enumToU16(DirectionsEnum, DirectionsEnum.Left) => intended_x -= 1,
        enumToU16(DirectionsEnum, DirectionsEnum.Right) => intended_x += 1,
        enumToU16(DirectionsEnum, DirectionsEnum.Up) => intended_y -= 1,
        enumToU16(DirectionsEnum, DirectionsEnum.Down) => intended_y += 1,
        else => {
            return ReturnEnum.getAsU16(ReturnEnum.OddError);
        },
    }

    // Check if the intended direction is out of bounds
    var i_width = WorldDataEnum.getAsU16(WorldDataEnum.Width);
    var i_height = WorldDataEnum.getAsU16(WorldDataEnum.Height);
    if (intended_x < 0 or intended_x >= current_world.data.items[i_width] or intended_y < 0 or intended_y >= current_world.data.items[i_height]) {
        return ReturnEnum.getAsU16(ReturnEnum.OutOfBounds);
    }

    // Check if the intended direction is blocked
    if (current_world.data.items[getCurrentWorldIndex(1, intended_x, intended_y)] != 0) {
        return ReturnEnum.getAsU16(ReturnEnum.BlockedCollision);
    }

    // Check if the intended direction is occupied by another entity
    for (current_entities) |entity| {
        if (entity[i_position_x] == intended_x and entity[i_position_y] == intended_y) {
            return ReturnEnum.getAsU16(ReturnEnum.AnotherEntityIsThere);
        }
    }

    switch (direction) {
        enumToU16(DirectionsEnum, DirectionsEnum.Left) => current_entities[entityIndex][i_position_x] -= 1,
        enumToU16(DirectionsEnum, DirectionsEnum.Right) => current_entities[entityIndex][i_position_x] += 1,
        enumToU16(DirectionsEnum, DirectionsEnum.Up) => current_entities[entityIndex][i_position_y] -= 1,
        enumToU16(DirectionsEnum, DirectionsEnum.Down) => current_entities[entityIndex][i_position_y] += 1,
        else => {
            return ReturnEnum.getAsU16(ReturnEnum.OddError);
        },
    }

    var layer_entities = WorldLayersEnum.getAsU16(WorldLayersEnum.Entities);
    var entity_index_to_record = @as(u16, @intCast(entityIndex));
    entity_index_to_record += 1;
    var previous_index = getCurrentWorldIndex(layer_entities, previous_x, previous_y);
    current_world.data.items[previous_index] = 0;
    var current_index = getCurrentWorldIndex(layer_entities, intended_x, intended_y);
    current_world.data.items[current_index] = entity_index_to_record;

    return ReturnEnum.getAsU16(ReturnEnum.None);
}
// TODO: Update this function *without* camera position offset and create a new function that returns WITH camera position offset
export fn getCurrentWorldData(layer: u16, x: u16, y: u16) u16 {
    var offset_x: u16 = x + camera_position[0];
    var offset_y: u16 = y + camera_position[1];
    if (offset_x < 0) {
        offset_x = 0;
    }
    if (offset_y < 0) {
        offset_y = 0;
    }
    if (offset_x > current_world.data.items[WorldDataEnum.getAsUsize(WorldDataEnum.Width)] - 1) {
        offset_x = current_world.data.items[WorldDataEnum.getAsUsize(WorldDataEnum.Width)];
    }
    if (offset_y > current_world.data.items[WorldDataEnum.getAsUsize(WorldDataEnum.Height)] - 1) {
        offset_y = current_world.data.items[WorldDataEnum.getAsUsize(WorldDataEnum.Height)];
    }
    var index = getCurrentWorldIndex(layer, offset_x, offset_y);
    // index = getCurrentWorldIndex(layer, x, y);
    return current_world.data.items[index];
}
export fn getCurrentWorldSize() *const u16 {
    var i_width = WorldDataEnum.getAsUsize(WorldDataEnum.Width);
    return &current_world.data.items[i_width];
}
export fn getWorld() *const u16 {
    // TODO: Currently we know the offset is two because width & height take positions 0&1 but we should have a way to reference this dynamically in case this changes
    return &current_world.data.items[2];
}
export fn attackEntity(attackerEntityIndex: u16, attackeeEntityIndex: u16) u16 {
    var valid_position: bool = false;
    var had_health: bool = false;
    var attacker = current_entities[attackerEntityIndex];
    var attackee = current_entities[attackeeEntityIndex];
    var i_health = EntityDataEnum.getAsUsize(EntityDataEnum.Health);
    var i_position_x = EntityDataEnum.getAsUsize(EntityDataEnum.PositionX);
    var i_position_y = EntityDataEnum.getAsUsize(EntityDataEnum.PositionY);
    if (attackee[i_health] > 0) {
        had_health = true;
    }
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
        diff_list.append(enumToU16(DiffListEnum, DiffListEnum.Entity)) catch unreachable;
        diff_list.append(attackeeEntityIndex) catch unreachable;
    }

    if (valid_position and had_health) {
        return ReturnEnum.getAsU16(ReturnEnum.None);
    } else if (!had_health) {
        return ReturnEnum.getAsU16(ReturnEnum.NoMoreHealth);
    } else {
        return ReturnEnum.getAsU16(ReturnEnum.InvalidAttackPosition);
    }
}
export fn getDiffList() ?*u16 {
    // Returning a pointer to diff_list.items just points to an ambiguous memory location
    // Returning a pointer to the first item in diff_list, however, gives you the memory position of the first item + then coupled with the length function, you get the rest
    return if (diff_list.items.len > 0) &diff_list.items[0] else null;
}
export fn getDiffListLen() usize {
    return diff_list.items.len;
}
export fn clearDiffList() bool {
    diff_list.items.len = 0;
    return true;
}

var entity_image_bytes: [4][4]u8 = .{
    .{ 200, 200, 200, 255 },
    .{ 200, 200, 200, 255 },
    .{ 200, 200, 200, 255 },
    .{ 200, 200, 200, 255 },
};
export fn getTestMemoryPixelBytes() *[4][4]u8 {
    return &entity_image_bytes;
}
export fn getTestMemoryPixelBytesSize() usize {
    return entity_image_bytes.len * 4;
}

// NOTE: Keeping this for reference
// export fn getEntityDataLength() usize {
//     return @as(usize, @intCast(@sizeOf(playerEntity)));
// }