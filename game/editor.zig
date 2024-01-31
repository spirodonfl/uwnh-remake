const std = @import("std");
const ArrayList = std.ArrayList;

const game = @import("game.zig");
const embeds = @import("embeds.zig");
const debug = @import("debug.zig");
const viewport = @import("viewport.zig");
const helpers = @import("helpers.zig");
const diff = @import("diff.zig");

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
pub var worlds = ArrayList(ArrayList(u16)).init(arena.allocator());
pub var entities = ArrayList(u16).init(arena.allocator());
pub var world_layer = ArrayList(u16).init(arena.allocator());
pub var layers = ArrayList(ArrayList(u16)).init(arena.allocator());
pub var world_modifications = ArrayList(ArrayList(u16)).init(arena.allocator());
// TODO: Eventually consider removing new_worlds in favor of worlds
pub var new_worlds = ArrayList(ArrayList(ArrayList(u16))).init(arena.allocator());
pub var new_new_worlds = ArrayList(*game.WorldDataStruct).init(arena.allocator());
// @wasm
pub fn createLayer(width: u16, height: u16, layer_type: u16) void {
    var total_size: u16 = width * height;
    var total_size_iteration: u16 = 0;
    var new_layer = ArrayList(u16).init(arena.allocator());
    new_layer.append(layer_type) catch unreachable;
    while (total_size_iteration < total_size) {
        new_layer.append(0) catch unreachable;
        total_size += 1;
    }
    layers.append(new_layer) catch unreachable;
}
// @wasm
pub fn attachLayerToWorld(world_index: u16, layer_index: u16) void {
    world_layer.append(world_index) catch unreachable;
    world_layer.append(layer_index) catch unreachable;
}
// @wasm
pub fn createWorld(width: u16, height: u16) void {
    var new_world = ArrayList(u16).init(arena.allocator());
    new_world.append(width) catch unreachable;
    new_world.append(height) catch unreachable;
    worlds.append(new_world) catch unreachable;
}
// @wasm
pub fn totalWorlds() !u16 {
    return @as(u16, @intCast(worlds.items.len));
}
// @wasm
pub fn totalLayers() u16 {
    return @as(u16, @intCast(layers.items.len));
}
// @wasm
pub fn totalEntities() u16 {
    return @as(u16, @intCast(entities.items.len));
}
// @wasm
pub fn createEntity(entity_type: u16) void {
    entities.append(entity_type) catch unreachable;
}
// @wasm
pub fn clearWorlds() void {
    worlds.deinit();
}
// @wasm
pub fn clearEntities() void {
    entities.deinit();
}
// @wasm
pub fn clearAll() void {
    worlds.clearRetainingCapacity();
    entities.clearRetainingCapacity();
    world_layer.clearRetainingCapacity();
    layers.clearRetainingCapacity();
    new_worlds.clearRetainingCapacity();
    new_new_worlds.clearRetainingCapacity();
    _ = arena.reset(.retain_capacity);
}
// @wasm
pub fn modifyWorldData(world: u16, layer: u16, x: u16, y: u16, new_value: u16) void {
    _ = new_value;
    _ = y;
    _ = x;
    _ = layer;
    _ = world;
    // TODO:
    // if editor world, just direct mod
    // else dupe world and mod
}
// @wasm
pub fn resizeWorld(world: u16, width: u16, height: u16) void {
    _ = height;
    _ = width;
    _ = world;
}
// @wasm
pub fn addRowToWorld(world: u16) !void {
    if (world < embeds.total_worlds) {
        var is_already_in: bool = false;
        if (new_new_worlds.items.len > 0) {
            for (new_new_worlds.items) |n_world| {
                if (n_world.getIndex() == world) {
                    diff.addData(0);
                    try n_world.addRow();
                    is_already_in = true;
                    break;
                }
            }
        }
        if (is_already_in == false) {
            diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).addRow();
            try new_new_worlds.append(game.worlds_list.at(world));
        }
    } else {
        // TODO: Means that we have stuff in the editor as entirely new world
    }
    viewport.clear();
    game.loadWorld(world);
}
// @wasm
pub fn addColumnToWorld(world: u16) !void {
    if (world < embeds.total_worlds) {
        var is_already_in: bool = false;
        if (new_new_worlds.items.len > 0) {
            for (new_new_worlds.items) |n_world| {
                if (n_world.getIndex() == world) {
                    diff.addData(0);
                    try n_world.addColumn();
                    is_already_in = true;
                    break;
                }
            }
        }
        if (is_already_in == false) {
            diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).addColumn();
            try new_new_worlds.append(game.worlds_list.at(world));
        }
    } else {
        // TODO: Means that we have stuff in the editor as entirely new world
    }

    viewport.clear();
    // viewport.initializeViewportData();
    game.loadWorld(world);
}
// pub fn modifyEntity() ????????

// @wasm
pub fn getWorldMemoryLocation(world: u16) !*u16 {
    if (world < embeds.total_worlds) {
        for (new_new_worlds.items) |new_world| {
            if (new_world.getIndex() == world) {
                if (new_world.has_data == true) {
                    return &new_world.data.items[0];
                }
            }
        }
        if (game.worlds_list.at(world).has_data == false) {
            try game.worlds_list.at(world).readDataFromEmbedded();
        }
        return &game.worlds_list.at(world).data.items[0];
        // const file_index = helpers.getWorldFileIndex(world);
        // return @intFromPtr(&embeds.embeds[file_index]);
    }
    @panic("Unhandled world memory check");
}
// @wasm
pub fn getWorldMemoryLength(world: u16) !usize {
    if (world < embeds.total_worlds) {
         for (new_new_worlds.items) |new_world| {
            if (new_world.getIndex() == world) {
                return new_world.data.items.len;
            }
        }
        if (game.worlds_list.at(world).has_data == false) {
            try game.worlds_list.at(world).readDataFromEmbedded();
        }
        return game.worlds_list.at(world).data.items.len;
        // const file_index = helpers.getWorldFileIndex(world);
        // return embeds.embeds[file_index].len;
    }
    @panic("Unhandled world memory check");
}


test "nested_arraylist_tests" {
    var duped_world = ArrayList(ArrayList(u16)).init(arena.allocator());
    var world_size = ArrayList(u16).init(arena.allocator());
    try world_size.append(0);
    try world_size.append(1);
    var layer_one = ArrayList(u16).init(arena.allocator());
    try layer_one.append(2);
    try layer_one.append(3);
    try duped_world.append(world_size);
    try duped_world.append(layer_one);
    try std.testing.expect(duped_world.items.len == 2);
    try std.testing.expect(duped_world.items[1].items[0] == 2);
    var layer_two = ArrayList(u16).init(arena.allocator());
    try layer_two.append(4);
    try layer_two.append(5);
    try duped_world.append(layer_two);
    // ---------
    duped_world.items[1].clearAndFree();
    // layer_two.clearAndFree();
    _ = duped_world.orderedRemove(1);
    // ---------
    var layer_three = ArrayList(u16).init(arena.allocator());
    try layer_three.append(6);
    try layer_three.append(7);
    // ---------
    try duped_world.insert(1, layer_three);
}

