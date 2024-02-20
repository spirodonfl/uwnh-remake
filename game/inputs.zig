const std = @import("std");

const game = @import("game.zig");
const diff = @import("diff.zig");

// TODO: Wrap up repeated code into a function
fn inputMovePlayer(operation: u16) !void {
    var world = game.worlds_list.at(game.current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        var value = game.getWorldData(game.current_world_index, 2, x, y);
        if (value == 1) {
            var intended_x = x;
            var intended_y = y;
            if (operation == 0 and y > 0) {
                intended_y -= 1;
            } else if (operation == 1 and y < h - 1) {
                intended_y += 1;
            } else if (operation == 2 and x > 0) {
                intended_x -= 1;
            } else if (operation == 3 and x < w - 1) {
                intended_x += 1;
            }
            var intended_index = intended_y * w + intended_x;
            _ = intended_index;
            var intended_value = game.getWorldData(game.current_world_index, 2, intended_x, intended_y);
            var intended_collision_value = game.getWorldData(game.current_world_index, 3, intended_x, intended_y);
            if (intended_value == 99) {
                try game.setWorldData(game.current_world_index, 2, x, y, 0);
                game.entities_list.at(0).health.setHealth(8);
                intended_collision_value = 0;
                intended_value = 0;
            }
            if (intended_value == 0 and intended_collision_value == 0) {
                // TODO: Cannot be reading in data from embed && updating duplicate data. Way too memory intensive. Should be editing a different set of data like the original entity struct. That means loading the entities with their initial positions and then updating the positions in the entity struct.
                // Options:
                // - Duplicate the layer?
                // -- Duplicate npc/player layer and then keep the copy as "active"
                // -- worlddatastruct -> add active layer for npc/player
                // -- any time getworlddata references layer 1 (aka: player/npc layer), return "active" layer
                try game.setWorldData(game.current_world_index, 2, x, y, 0);
                try game.setWorldData(game.current_world_index, 2, intended_x, intended_y, 1);
            }
            try diff.addData(0);
            break;
        }
    }
}

fn inputMoveEntity(entity: u16, operation: u16) !void {
    var world = game.worlds_list.at(game.current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        var value = game.getWorldData(game.current_world_index, 2, x, y);
        if (value == (entity + 1)) {
            var intended_x = x;
            var intended_y = y;
            if (operation == 0 and y > 0) {
                intended_y -= 1;
            } else if (operation == 1 and y < h - 1) {
                intended_y += 1;
            } else if (operation == 2 and x > 0) {
                intended_x -= 1;
            } else if (operation == 3 and x < w - 1) {
                intended_x += 1;
            }
            var intended_index = intended_y * w + intended_x;
            _ = intended_index;
            var intended_value = game.getWorldData(game.current_world_index, 2, intended_x, intended_y);
            var intended_collision_value = game.getWorldData(game.current_world_index, 3, intended_x, intended_y);
            if (intended_value == 99) {
                try game.setWorldData(game.current_world_index, 2, x, y, 0);
                game.entities_list.at(0).health.setHealth(8);
                intended_collision_value = 0;
                intended_value = 0;
            }
            if (intended_value == 0 and intended_collision_value == 0) {
                // TODO: Cannot be reading in data from embed && updating duplicate data. Way too memory intensive. Should be editing a different set of data like the original entity struct. That means loading the entities with their initial positions and then updating the positions in the entity struct.
                // Options:
                // - Duplicate the layer?
                // -- Duplicate npc/player layer and then keep the copy as "active"
                // -- worlddatastruct -> add active layer for npc/player
                // -- any time getworlddata references layer 1 (aka: player/npc layer), return "active" layer
                try game.setWorldData(game.current_world_index, 2, x, y, 0);
                try game.setWorldData(game.current_world_index, 2, intended_x, intended_y, (entity + 1));
            }
            try diff.addData(0);
            break;
        }
    }
}


// @wasm
pub fn inputUp(entity: u16) !void {
    std.log.info("inputUp", .{});
    if (entity == 0) {
        try inputMovePlayer(0);
    } else {
        try inputMoveEntity(entity, 0);
    }
}
// @wasm
pub fn inputDown(entity: u16) !void {
    std.log.info("inputDown", .{});
    if (entity == 0) {
        try inputMovePlayer(1);
    } else {
        try inputMoveEntity(entity, 1);
    }
}
// @wasm
pub fn inputLeft(entity: u16) !void {
    std.log.info("inputLeft", .{});
    if (entity == 0) {
        try inputMovePlayer(2);
    } else {
        try inputMoveEntity(entity, 2);
    }
}
// @wasm
pub fn inputRight(entity: u16) !void {
    std.log.info("inputRight", .{});
    if (entity == 0) {
        try inputMovePlayer(3);
    } else {
        try inputMoveEntity(entity, 3);
    }
}
