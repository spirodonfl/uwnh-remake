const std = @import("std");
const ArrayList = std.ArrayList;

const game = @import("game.zig");
const embeds = @import("embeds.zig");
const debug = @import("debug.zig");
const viewport = @import("viewport.zig");
const helpers = @import("helpers.zig");

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
    new_worlds.clearRetainingCapacity();
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
pub fn addRowToWorld(world: u16) void {
    // TODO: Deal with layers
    if (world < embeds.total_worlds) {
        var w = game.getWorldSizeWidth(world);
        var h = game.getWorldSizeHeight(world);
        h += 1;
        var already_edited: bool = false;
        for (new_worlds.items) |*new_world| {
            if (new_world.items[0] == world) {
                new_world.clearRetainingCapacity();
                already_edited = true;
                new_world.append(world) catch unreachable;
                new_world.append(w) catch unreachable;
                new_world.append(h) catch unreachable;
                @memset(new_world.addManyAsSlice(w * h) catch unreachable, 0);
            }
        }
        if (already_edited == false) {
            var new_world = ArrayList(u16).init(arena.allocator());
            new_world.append(world) catch unreachable;
            new_world.append(w) catch unreachable;
            new_world.append(h) catch unreachable;
            @memset(new_world.addManyAsSlice(w * h) catch unreachable, 0);
            new_worlds.append(new_world) catch unreachable;

            // TODO: This sucks for appending the world with the right world index and searching for it
            // var duped_world = ArrayList(ArrayList(u16)).init(arena.allocator());
            // var world_size = ArrayList(u16).init(arena.allocator());
            // world_size.append(w) catch unreachable;
            // world_size.append(h) catch unreachable;
            // duped_world.append(world_size) catch unreachable;
            // for (0..2) |i| {
            //     _ = i;
            //     var layer = ArrayList(u16).init(arena.allocator());
            //     @memset(layer.addManyAsSlice(w * h) catch unreachable, 0);
            //     duped_world.append(layer) catch unreachable;
            // }
            // new_worlds.append(duped_world) catch unreachable;
        }
    }
    viewport.clear();
    // viewport.initializeViewportData();
    game.loadWorld(world);
}
// @wasm
pub fn addColumnToWorld(world: u16) void {
    // TODO: If world exists already in editor.new_worlds, modify it instead of duping
    if (world < embeds.total_worlds) {
        var w = game.getWorldSizeWidth(world);
        var h = game.getWorldSizeHeight(world);
        w += 1;
        var already_edited: bool = false;
        for (new_worlds.items) |*new_world| {
            if (new_world.items[0] == world) {
                new_world.clearRetainingCapacity();
                already_edited = true;
                new_world.append(world) catch unreachable;
                new_world.append(w) catch unreachable;
                new_world.append(h) catch unreachable;
                @memset(new_world.addManyAsSlice(w * h) catch unreachable, 0);
            }
        }
        if (already_edited == false) {
            var new_world = ArrayList(u16).init(arena.allocator());
            new_world.append(world) catch unreachable;
            new_world.append(w) catch unreachable;
            new_world.append(h) catch unreachable;
            @memset(new_world.addManyAsSlice(w * h) catch unreachable, 0);
            new_worlds.append(new_world) catch unreachable;
        }
    }
    // @panic("STOP");
    viewport.clear();
    // viewport.initializeViewportData();
    game.loadWorld(world);
}
// pub fn modifyEntity() ????????

// @wasm
pub fn getWorldMemoryLocation(world: u16) usize {
    if (world < embeds.total_worlds) {
        for (new_worlds.items, 0..) |new_world, i| {
            if (new_world.items[0] == world) {
                return @intFromPtr(&new_worlds.items[i].items[0]);
            }
        }
        const file_index = helpers.getWorlFileIndex(world);
        return @intFromPtr(&embeds.embeds[file_index]);
    }
    @panic("Unhandled world memory check");
}
// @wasm
pub fn getWorldMemoryLength(world: u16) usize {
    if (world < embeds.total_worlds) {
        for (new_worlds.items, 0..) |new_world, i| {
            if (new_world.items[0] == world) {
                return new_worlds.items[i].items.len;
            }
        }
        const file_index = helpers.getWorlFileIndex(world);
        return embeds.embeds[file_index].len;
    }
    @panic("Unhandled world memory check");
}

