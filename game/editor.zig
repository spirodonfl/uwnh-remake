const std = @import("std");
const ArrayList = std.ArrayList;

const game = @import("game.zig");
const embeds = @import("embeds.zig");
const debug = @import("debug.zig");
const viewport = @import("viewport.zig");
const helpers = @import("helpers.zig");
const diff = @import("diff.zig");

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
pub var modified_worlds = ArrayList(*game.WorldDataStruct).init(arena.allocator());
pub var editor_worlds = ArrayList(*game.WorldDataStruct).init(arena.allocator());
// TODO: Replace this with "modified_worlds"
pub var worlds = ArrayList(ArrayList(u16)).init(arena.allocator());
// pub var entities = ArrayList(u16).init(arena.allocator());
// TODO: modified_entities && editor_entities
pub var entities = ArrayList(game.EntityDataStruct).init(arena.allocator());
pub var world_layer = ArrayList(u16).init(arena.allocator());
pub var layers = ArrayList(ArrayList(u16)).init(arena.allocator());
pub var world_modifications = ArrayList(ArrayList(u16)).init(arena.allocator());
// TODO: Eventually consider removing new_worlds in favor of worlds
pub var new_worlds = ArrayList(ArrayList(ArrayList(u16))).init(arena.allocator());
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
pub fn createEntity(entity_type: u16) !void {
    // TODO: Actually implement this
    // entities.append(entity_type) catch unreachable;
    // try game.entities_list.append(game.gpa_allocator.allocator(), .{});
    // TODO: Init an entity with an initial set of data
    // try game.entities_list.at(game.entities_list.len).loadComponents();
    std.log.info("Creating entity of type {d}", .{entity_type});
    // TODO: This is a manual hack. Probably not a good idea
    var data: std.ArrayListUnmanaged(u16) = .{};
    // TODO: Should we really be using the game.gpa_allocator here?
    try data.append(game.gpa_allocator.allocator(), @as(u16, @intCast(entities.items.len + 1)));
    try data.append(game.gpa_allocator.allocator(), 33);
    try data.append(game.gpa_allocator.allocator(), 44);
    var new_entity = game.EntityDataStruct{
        .has_data = true,
        .data = data,
        .type = entity_type,
    };
    try entities.append(new_entity);
    try entities.items[entities.items.len - 1].loadComponents();
}
// @wasm
pub fn getEntityType(entity: u16) u16 {
    return @as(u16, @intCast(entities.items[entity].type));
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
    modified_worlds.clearRetainingCapacity();
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
        for (modified_worlds.items) |n_world| {
            if (n_world.getIndex() == world) {
                try diff.addData(0);
                try n_world.addRow();
                break;
            }
        } else { // not found. get here when loop goes through all items
            try diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).addRow();
            try modified_worlds.append(game.worlds_list.at(world));
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
        for (modified_worlds.items) |n_world| {
            if (n_world.getIndex() == world) {
                try diff.addData(0);
                try n_world.addColumn();
                break;
            }
        } else { // not found. get here when loop goes through all items
            try diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).addColumn();
            try modified_worlds.append(game.worlds_list.at(world));
        }
    } else {
        // TODO: Means that we have stuff in the editor as entirely new world
    }

    viewport.clear();
    // viewport.initializeViewportData();
    game.loadWorld(world);
}
// @wasm
pub fn removeRowFromWorld(world: u16) !void {
    if (world < embeds.total_worlds) {
        for (modified_worlds.items) |n_world| {
            if (n_world.getIndex() == world) {
                try diff.addData(0);
                try n_world.removeRow();
                break;
            }
        } else { // not found. get here when loop goes through all items
            try diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).removeRow();
            try modified_worlds.append(game.worlds_list.at(world));
        }
    } else {
        // TODO: Means that we have stuff in the editor as entirely new world
    }

    viewport.clear();
    // viewport.initializeViewportData();
    game.loadWorld(world);
}
// @wasm
pub fn removeColumnFromWorld(world: u16) !void {
    if (world < embeds.total_worlds) {
        for (modified_worlds.items) |n_world| {
            if (n_world.getIndex() == world) {
                try diff.addData(0);
                try n_world.removeColumn();
                break;
            }
        } else { // not found. get here when loop goes through all items
            try diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).removeColumn();
            try modified_worlds.append(game.worlds_list.at(world));
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
pub fn addLayerToWorld(world: u16) !void {
    if (world < embeds.total_worlds) {
        for (modified_worlds.items) |n_world| {
            if (n_world.getIndex() == world) {
                try diff.addData(0);
                try n_world.addLayer();
                break;
            }
        } else { // not found. get here when loop goes through all items
            try diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).addLayer();
            try modified_worlds.append(game.worlds_list.at(world));
        }
    } else {
        // TODO: Means that we have stuff in the editor as entirely new world
    }
}
// @wasm
pub fn injectLayerToWorldAfter(world: u16, layer_index: u16) !void {
    if (world < embeds.total_worlds) {
        for (modified_worlds.items) |n_world| {
            if (n_world.getIndex() == world) {
                try diff.addData(0);
                try n_world.injectLayerAfter(layer_index);
                break;
            }
        } else { // not found. get here when loop goes through all items
            try diff.addData(0);
            try game.worlds_list.at(world).readDataFromEmbedded();
            try game.worlds_list.at(world).injectLayerAfter(layer_index);
            try modified_worlds.append(game.worlds_list.at(world));
        }
    } else {
        // TODO: Means that we have stuff in the editor as entirely new world
    }
}

// @wasm
pub fn getWorldMemoryLocation(world: u16) !*u16 {
    if (world < embeds.total_worlds) {
        for (modified_worlds.items) |new_world| {
            if (new_world.getIndex() == world) {
                if (new_world.has_data) {
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
         for (modified_worlds.items) |new_world| {
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

// @wasm
pub fn getEntityMemoryLocation(entity: u16) !*u16 {
    if (entity < embeds.total_entities) {
        for (entities.items) |*editor_entity| {
            if (editor_entity.getIndex() == entity) {
                if (editor_entity.has_data) {
                    return &editor_entity.data.items[0];
                }
            }
        }
        if (game.entities_list.at(entity).has_data == false) {
            try game.entities_list.at(entity).readDataFromEmbedded();
        }
        return &game.entities_list.at(entity).data.items[0];
    }
    @panic("Unhandled world memory check");
}
// @wasm
pub fn getEntityMemoryLength(entity: u16) !usize {
    if (entity < embeds.total_entities) {
         for (entities.items) |*editor_entity| {
            if (editor_entity.getIndex() == entity) {
                return editor_entity.data.items.len;
            }
        }
        if (game.entities_list.at(entity).has_data == false) {
            try game.entities_list.at(entity).readDataFromEmbedded();
        }
        return game.entities_list.at(entity).data.items.len;
    }
    @panic("Unhandled world memory check");
}

