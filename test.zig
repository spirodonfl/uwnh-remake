// ZIG 0.11.0

const std = @import("std");
const ArrayList = std.ArrayList;

// TODO: Rendering
// Camera
// Viewport
// World
// Render only the portion of the world that fits the viewport
// Add camera offset to viewport in order to render world (something like that)
// Camera position
// Viewport size
// TODO: const renderer = @import("renderer.zig");
var camera_position: [2]u16 = .{ 0, 0 }; // Equivalent to a world offset, more or less
var viewport_size: [2]u16 = .{ 0, 0 };
// Math of camera position and viewport size
// Renderable area would be viewport size of world at 0,0 but then world 0,0 would be offset by camera position where camera position always has positive values
// getRenderableArea() -> return all world coordinates that are within the viewport (plus camera offset) grid space x/y coords + actual data?

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
    var result: GameDataError = GameDataError.None;

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
        result = GameDataError.BlockedCollision;
        return @intFromEnum(result);
    }

    // Check if the intended direction is occupied by another entity
    for (currentEntities) |entity| {
        if (entity[1] == intended_x and entity[2] == intended_y) {
            // TODO: Later on, return an error code of some kind here
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
            currentWorld.data[2][i][j] = 0;
        }
    }
    for (currentEntities) |entity| {
        // TODO: Can we write a wrapper function for this? Like, toUsize() or something? For entities?
        const x = @as(usize, @intCast(entity[1])); // Assuming entity[1] is the x-coordinate
        const y = @as(usize, @intCast(entity[2])); // Assuming entity[2] is the y-coordinate

        // Check if indices are within the bounds of the array
        if (x < currentWorld.data[2].len and y < currentWorld.data[2][y].len) {
            currentWorld.data[2][y][x] = 2;
        }
    }

    return @intFromEnum(result);
}
export fn getCurrentWorldData(layer: u8, x: u16, y: u16) u16 {
    var world_layer = currentWorld.layers[layer];
    return currentWorld.data[world_layer][y][x];
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
        return @intFromEnum(GameDataError.None);
    } else if (!had_health) {
        return @intFromEnum(GameDataError.NoMoreHealth);
    } else {
        return @intFromEnum(GameDataError.InvalidAttackPosition);
    }
}

// TODO: Move diff_list stuff into its own file
var diff_list: ArrayList(u8) = undefined;

// Note: Use the GPA because it has some safety built-in and is also reasonably performant
var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();
// const bytes = try allocator.alloc(u8, 100);
// defer allocator.free(bytes);

export fn initGame() bool {
    diff_list = ArrayList(u8).init(allocator);

    return true;
}
const GameDataError = enum(u16) {
    None = 0,
    MissingField = 1,
    InvalidType = 2,
    EmptyArray = 3,
    BlockedCollision = 4,
    InvalidAttackPosition = 5,
    NoMoreHealth = 6,
};
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

