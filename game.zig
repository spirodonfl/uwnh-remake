// ZIG 0.11.0

const std = @import("std");
const ArrayList = std.ArrayList;
// TODO: const renderer = @import("renderer.zig");
var camera_position: [2]u16 = .{ 0, 0 }; // Equivalent to a world offset, more or less
var viewport_size: [2]u16 = .{ 0, 0 };

// TODO: Scripts
// Outer array is script line
// Inner array is command for line (need to create legend for inner array commands)
// if [0] = 0 = moveEntity
// -- [1] = entityIndex
// -- [2] = direction (0 = left, 1 = right, 2 = up, 3 = down) (EXAMPLE)
// script: [2][3]u8 = .{ .{ 0, 0, 0 }, .{ 0, 0, 0 } };
// runScript(scriptIndex: u8)

// Eventually, when we have multiple worlds, we'll want to reference the currently loaded world.
// For now, we'll just use the starter world via test2.zig
// TODO: Create a "worlds.zig" import which imports other worlds
const currentWorld = @import("testworld.zig");
// TODO: Clean this up
const _entities = @import("entities.zig");
const EntityDataEnum = _entities.EntityDataEnum;
const playerEntity = _entities.playerEntity;
const artificialEntity = _entities.artificialEntity;
const currentEntities = _entities.currentEntities;
// TODO: Move diff_list stuff into its own file
var diff_list: ArrayList(u8) = undefined;
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

    pub fn getAsUsize(self: ReturnEnum) usize {
        return @as(usize, @intFromEnum(self));
    }

    pub fn getAsU16(self: ReturnEnum) u16 {
        return @intFromEnum(self);
    }
};

//----------------------------------------
// FUNCTIONS HERE
//----------------------------------------
export fn setViewportSize(width: u16, height: u16) void {
    viewport_size[0] = width;
    viewport_size[1] = height;
}
export fn setCameraPosition(x: u16, y: u16) void {
    camera_position[0] = x;
    camera_position[1] = y;
}
// TODO: Update this function so it returns proper length
// Maybe also update the name to getEntityMemoryLength or something
export fn getEntityLength() u16 { return 3; }
export fn getEntity(entityIndex: u8) *[3]u16 {
    return currentEntities[entityIndex];
}
export fn setEntityPosition(entityIndex: u8, x: u16, y: u16) void {
    currentEntities[entityIndex][1] = x;
    currentEntities[entityIndex][2] = y;
}
// TODO: Turn direction into an enum
// DIRECTIONS LEGEND
// 0 = left
// 1 = right
// 2 = up
// 3 = down
export fn moveEntity(entityIndex: u8, direction: u8) u16 {
    var result: ReturnEnum = ReturnEnum.None;

    // Add entityIndex to diff_list
    diff_list.append(entityIndex) catch unreachable;

    // This emulates the intended direction of the entity
    var intended_x: u16 = currentEntities[entityIndex][1];
    var intended_y: u16 = currentEntities[entityIndex][2];
    switch (direction) {
        0 => intended_x -= 1,
        1 => intended_x += 1,
        2 => intended_y -= 1,
        3 => intended_y += 1,
        else => {},
    }

    // Check if the intended direction is out of bounds
    if (intended_x < 0 or intended_x >= currentWorld.size[0] or intended_y < 0 or intended_y >= currentWorld.size[1]) {
        // TODO: Later on, return an error code of some kind here
        return @intFromEnum(result);
    }

    // Check if the intended direction is blocked
    if (currentWorld.data[1][intended_y][intended_x] != 0) {
        result = ReturnEnum.BlockedCollision;
        return @intFromEnum(result);
    }

    // Check if the intended direction is occupied by another entity
    for (currentEntities) |entity| {
        if (entity[1] == intended_x and entity[2] == intended_y) {
            result = ReturnEnum.AnotherEntityIsThere;
            return @intFromEnum(result);
        }
    }

    switch (direction) {
        0 => currentEntities[entityIndex][1] -= 1,
        1 => currentEntities[entityIndex][1] += 1,
        2 => currentEntities[entityIndex][2] -= 1,
        3 => currentEntities[entityIndex][2] += 1,
        else => {},
    }

    var i: usize = 0;
    while (i < currentWorld.data[2].len) : (i += 1) {
        var j: usize = 0;
        while (j < currentWorld.data[2][i].len) : (j += 1) {
            if (currentWorld.data[2][i][j] == (entityIndex + 1)) {
                currentWorld.data[2][i][j] = 0;
            }
        }
    }
    currentWorld.data[2][currentEntities[entityIndex][2]][currentEntities[entityIndex][1]] = @as(u16, @intCast(entityIndex + 1));

    return @intFromEnum(result);
}
export fn getCurrentWorldData(layer: u8, x: u16, y: u16) u16 {
    var world_layer = currentWorld.layers[layer];
    var offset_x: u16 = x + camera_position[0];
    var offset_y: u16 = y + camera_position[1];
    return currentWorld.data[world_layer][offset_y][offset_x];
}
export fn getCurrentWorldSize() *[2]u16 {
    return &currentWorld.size;
}
export fn attackEntity(attackerEntityIndex: u8, attackeeEntityIndex: u8) u16 {
    var valid_position: bool = false;
    var had_health: bool = false;
    var attacker = currentEntities[attackerEntityIndex];
    var attackee = currentEntities[attackeeEntityIndex];
    // TODO: Update other areas of the code to use enum(s) like this
    if (attackee[EntityDataEnum.getAsUsize(EntityDataEnum.Health)] > 0) {
        had_health = true;
    }
    if (attacker[1] == attackee[1]) {
        if (attacker[2] == attackee[2] - 1 or attacker[2] == attackee[2] + 1) {
            valid_position = true;
        }
    }
    if (attacker[2] == attackee[2]) {
        if (attacker[1] == attackee[1] - 1 or attacker[1] == attackee[1] + 1) {
            valid_position = true;
        }
    }
    if (valid_position and attackee[0] > 0) {
        attackee[0] -= 1;
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
export fn initGame() bool {
    diff_list = ArrayList(u8).init(allocator);

    var i: usize = 0;
    while (i < currentWorld.data[2].len) : (i += 1) {
        var j: usize = 0;
        while (j < currentWorld.data[2][i].len) : (j += 1) {
            if (currentWorld.data[2][i][j] == 1) {
                currentEntities[0][1] = @as(u16, @intCast(j));
                currentEntities[0][2] = @as(u16, @intCast(i));
            } else if (currentWorld.data[2][i][j] == 2) {
                currentEntities[1][1] = @as(u16, @intCast(j));
                currentEntities[1][2] = @as(u16, @intCast(i));
            }
        }
    }

    return true;
}
export fn getDiffList() ?*u8 {
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

export fn getTestMemoryPixelBytes() *[4][4]u8 {
    return &currentWorld.entity_image_bytes;
}
export fn getTestMemoryPixelBytesSize() usize {
    return currentWorld.entity_image_bytes.len * 4;
}

// NOTE: Keeping this for reference
// export fn getEntityDataLength() usize {
//     return @as(usize, @intCast(@sizeOf(playerEntity)));
// }

