const std = @import("std");

const game = @import("game.zig");
const diff = @import("diff.zig");

// TODO: Wrap up repeated code into a function

// @wasm
pub fn inputUp() !void {
    std.log.info("inputUp", .{});
    var world = game.worlds_list.at(game.current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        var value = game.getWorldData(game.current_world_index, 1, x, y);
        if (value == 1) {
            std.log.info("Found player at ({}, {})", .{x, y});
            var intended_x = x;
            var intended_y = y;
            if (y > 0) {
                intended_y -= 1;
            }
            var intended_index = intended_y * w + intended_x;
            _ = intended_index;
            var intended_value = game.getWorldData(game.current_world_index, 1, intended_x, intended_y);
            var intended_collision_value = game.getWorldData(game.current_world_index, 2, intended_x, intended_y);
            if (intended_value == 0 and intended_collision_value == 0) {
                // TODO: Cannot be reading in data from embed && updating duplicate data. Way too memory intensive. Should be editing a different set of data like the original entity struct. That means loading the entities with their initial positions and then updating the positions in the entity struct.
                try game.setWorldData(game.current_world_index, 1, x, y, 0);
                try game.setWorldData(game.current_world_index, 1, intended_x, intended_y, 1);
            }
            diff.addData(0);
            break;
        }
    }
}
// @wasm
pub fn inputDown() !void {
    std.log.info("inputDown", .{});
    var world = game.worlds_list.at(game.current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        var value = game.getWorldData(game.current_world_index, 1, x, y);
        if (value == 1) {
            std.log.info("Found player at ({}, {})", .{x, y});
            var intended_x = x;
            var intended_y = y;
            if (y < h - 1) {
                intended_y += 1;
            }
            var intended_index = intended_y * w + intended_x;
            _ = intended_index;
            var intended_value = game.getWorldData(game.current_world_index, 1, intended_x, intended_y);
            var intended_collision_value = game.getWorldData(game.current_world_index, 2, intended_x, intended_y);
            if (intended_value == 0 and intended_collision_value == 0) {
                try game.setWorldData(game.current_world_index, 1, x, y, 0);
                try game.setWorldData(game.current_world_index, 1, intended_x, intended_y, 1);
            }
            diff.addData(0);
            break;
        }
    }
}
// @wasm
pub fn inputLeft() !void {
    std.log.info("inputLeft", .{});
    var world = game.worlds_list.at(game.current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        var value = game.getWorldData(game.current_world_index, 1, x, y);
        if (value == 1) {
            std.log.info("Found player at ({}, {})", .{x, y});
            var intended_x = x;
            var intended_y = y;
            if (x > 0) {
                intended_x -= 1;
            }
            var intended_index = intended_y * w + intended_x;
            _ = intended_index;
            var intended_value = game.getWorldData(game.current_world_index, 1, intended_x, intended_y);
            var intended_collision_value = game.getWorldData(game.current_world_index, 2, intended_x, intended_y);
            if (intended_value == 0 and intended_collision_value == 0) {
                try game.setWorldData(game.current_world_index, 1, x, y, 0);
                try game.setWorldData(game.current_world_index, 1, intended_x, intended_y, 1);
            }
            diff.addData(0);
            break;
        }
    }
}
// @wasm
pub fn inputRight() !void {
    std.log.info("inputRight", .{});
    var world = game.worlds_list.at(game.current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        var value = game.getWorldData(game.current_world_index, 1, x, y);
        if (value == 1) {
            std.log.info("Found player at ({}, {})", .{x, y});
            var intended_x = x;
            var intended_y = y;
            if (x < w - 1) {
                intended_x += 1;
            }
            var intended_index = intended_y * w + intended_x;
            _ = intended_index;
            var intended_value = game.getWorldData(game.current_world_index, 1, intended_x, intended_y);
            var intended_collision_value = game.getWorldData(game.current_world_index, 2, intended_x, intended_y);
            if (intended_value == 0 and intended_collision_value == 0) {
                try game.setWorldData(game.current_world_index, 1, x, y, 0);
                try game.setWorldData(game.current_world_index, 1, intended_x, intended_y, 1);
            }
            diff.addData(0);
            break;
        }
    }
}
