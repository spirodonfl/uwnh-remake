const std = @import("std");
const ArrayList = std.ArrayList;

const game = @import("game.zig");
const embeds = @import("embeds.zig");
const debug = @import("debug.zig");
const viewport = @import("viewport.zig");

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
pub var worlds = ArrayList(ArrayList(u16)).init(arena.allocator());
pub var entities = ArrayList(u16).init(arena.allocator());
pub var world_layer = ArrayList(u16).init(arena.allocator());
pub var layers = ArrayList(ArrayList(u16)).init(arena.allocator());
pub var world_modifications = ArrayList(ArrayList(u16)).init(arena.allocator());
// TODO: Eventually consider removing new_worlds in favor of worlds
pub var new_worlds = ArrayList(ArrayList(u16)).init(arena.allocator());
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
pub fn totalWorlds() u16 {
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
// TODO: Fix an issue where adding two many expansions breaks the render
// @wasm
pub fn addRowToWorld(world: u16) void {
    // TODO: If world exists already in editor.new_worlds, modify it instead of duping
    if (world < embeds.total_worlds) {
        var w = game.getWorldSizeWidth(world);
        var h = game.getWorldSizeHeight(world);
        var size = w * h;
        var new_world = ArrayList(u16).init(arena.allocator());
        new_world.append(world) catch unreachable;
        new_world.append(game.getWorldSizeWidth(world)) catch unreachable;
        new_world.append(game.getWorldSizeHeight(world) + 1) catch unreachable;
        for (0..size) |i| {
            var x = @as(u16, @intCast(i % w));
            var y = @as(u16, @intCast(i / w));

            new_world.append(game.getWorldData(world, 0, x, y)) catch unreachable;
        }
        for (0..w) |i| {
            _ = i;
            new_world.append(0) catch unreachable;
        }
        new_worlds.append(new_world) catch unreachable;
    }
    viewport.clear();
    viewport.initializeViewportData();
    game.loadWorld(world);
}
// @wasm
pub fn addColumnToWorld(world: u16) void {
    // TODO: If world exists already in editor.new_worlds, modify it instead of duping
    if (world < embeds.total_worlds) {
        var w = game.getWorldSizeWidth(world);
        var h = game.getWorldSizeHeight(world);
        var new_world = ArrayList(u16).init(arena.allocator());
        new_world.append(world) catch unreachable;
        new_world.append(game.getWorldSizeWidth(world) + 1) catch unreachable;
        new_world.append(game.getWorldSizeHeight(world)) catch unreachable;
        for (0..h) |hi| {
            _ = hi;
            for (0..w) |wi| {
                _ = wi;
                new_world.append(0) catch unreachable;
            }
            new_world.append(0) catch unreachable;
        }
        new_worlds.append(new_world) catch unreachable;
    }
    viewport.clear();
    viewport.initializeViewportData();
    game.loadWorld(world);
}
// pub fn modifyEntity() ????????

