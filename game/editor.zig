const std = @import("std");
const ArrayList = std.ArrayList;

const enums = @import("enums.zig");
const game = @import("game.zig");
const embeds = @import("embeds.zig");
const diff = @import("diff.zig");

// --- MEMORY SETUP ---
var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
pub var layers = ArrayList(game.EmbeddedDataStruct).init(arena.allocator());

// --- EDITOR FUNCTIONS ---
pub fn getTotalLayers() u16 {
    return layers.items.len;
}
// @wasm
pub fn attachLayerToWorld(layer_index: u16, world_index: u16) !void {
    try game.worlds_list.at(world_index).addEmbeddedLayer(layers.items[layer_index]);
    // TODO: Update total game layers
}

// TODO: Finish this function
// setWorldTotalLayers(world_index: u16, total_layers: u16)
// world.readToRawData()
// world.raw_data[enums.WorldDataEnum.TotalLayers.int()] = total_layers

// @wasm
pub fn setWorldLayerCoordinateData(world_index: u16, layer_index: u16, x: u16, y: u16, value: u16) !void {
    var world = game.worlds_list.at(world_index);
    try world.embedded_layers.items[layer_index].readToRawData();
    // std.log.info("World width: {d}", .{world.getWidth()});
    var index = (y * world.getWidth()) + x;
    // std.log.info("Setting index: {d}", .{index});
    world.embedded_layers.items[layer_index].raw_data.items[index] = value;
}
// @wasm
pub fn addRowToWorld(world_index: u16) !void {
    // Iterate all layers in world
    // Add row to each layer
    // Update world height
    var world = game.worlds_list.at(world_index);
    var new_height = world.getHeight() + 1;

    var i: usize = 0;
    while (i < world.embedded_layers.items.len) {
        try world.embedded_layers.items[i].readToRawData();
        std.log.info("Layer length before: {d}", .{try world.embedded_layers.items[i].raw_data});
        try world.embedded_layers.items[i].raw_data.appendNTimes(game.allocator, 0, world.getWidth());
        std.log.info("Layer length after: {d}", .{try world.embedded_layers.items[i].raw_data});
        i += 1;
    }

    try world.embedded_data.readToRawData();
    world.embedded_data.raw_data.items[enums.WorldDataEnum.Height.int()] = new_height;
}

// TODO: Finish this function
// removeRowFromWorldLayer(world_index: u16, layer: u16)
// world.embedded_layers[layer].readToRawData()
// ...

// TODO: Finish this function
// addColumnToWorldLayer(world_index: u16, layer: u16)
// world.embedded_layers[layer].readToRawData()
// ...

// TODO: Finish this function
// removeColumnToWorldLayer(world_index: u16, layer: u16)
// world.embedded_layers[layer].readToRawData()
// ...

// TODO: Restructure layer order (maybe)
// TODO: Alternative to above, injectLayerAfter / injectLayerBefore

// --- CREATION ---
// @wasm
pub fn createLayer(width: u16, height: u16) !u16 {
    var new_layer = game.EmbeddedDataStruct{};
    try new_layer.raw_data.appendNTimes(arena.allocator(), 0, (width * height));
    try layers.append(new_layer);
    return @as(u16, @intCast(layers.items.len - 1));
}
// @wasm
pub fn createWorld(width: u16, height: u16) !void {
    var new_world_data = game.EmbeddedDataStruct{};
    var i: usize = 0;
    while (i < enums.WorldDataEnum.length()) {
        if (i == enums.WorldDataEnum.ID.int()) {
            var new_id = game.worlds_list.len;
            try new_world_data.appendToRawData(@as(u16, @intCast(new_id)));
        } else if (i == enums.WorldDataEnum.Width.int()) {
            try new_world_data.appendToRawData(width);
        } else if (i == enums.WorldDataEnum.Height.int()) {
            try new_world_data.appendToRawData(height);
        } else if (i == enums.WorldDataEnum.TotalLayers.int()) {
            try new_world_data.appendToRawData(0);
        } else if (i == enums.WorldDataEnum.EntityLayer.int()) {
            try new_world_data.appendToRawData(0);
        } else if (i == enums.WorldDataEnum.CollisionLayer.int()) {
            try new_world_data.appendToRawData(0);
        }
        i += 1;
    }

    var new_world = game.WorldDataStruct{};
    new_world.setEmbeddedData(new_world_data);

    try game.worlds_list.append(arena.allocator(), .{});
    var new_world_index = game.worlds_list.len - 1;
    game.worlds_list.at(new_world_index).setEmbeddedData(new_world_data);
}
// @wasm
pub fn createEntity(entity_type: u16) !void {
    var new_entity_data = game.EmbeddedDataStruct{};
    var i: usize = 0;
    while (i < enums.EntityDataEnum.length()) {
        if (i == enums.EntityDataEnum.ID.int()) {
            try new_entity_data.appendToRawData(@as(u16, @intCast(game.entities_list.len + 1)));
        } else if (i == enums.EntityDataEnum.ComponentHealth.int()) {
            try new_entity_data.appendToRawData(1);
        } else if (i == enums.EntityDataEnum.ComponentHealthDefaultValue.int()) {
            // TODO: Enum-ize or otherwise standardize this
            if (entity_type == 99 or entity_type == 98) {
                try new_entity_data.appendToRawData(44);
            } else {
                try new_entity_data.appendToRawData(10);
            }
        }
        i += 1;
    }
    var new_entity = game.EntityDataStruct{};
    new_entity.setEmbedded(new_entity_data);

    try game.entities_list.append(arena.allocator(), .{});
    var new_entity_index = game.entities_list.len - 1;
    game.entities_list.at(new_entity_index).setEmbedded(new_entity_data);
}

// --- MEMORY CLEARING ---
// @wasm
pub fn clearLayers() void {
    layers.deinit();
}
// @wasm
pub fn clearAll() void {
    layers.clearRetainingCapacity();
    _ = arena.reset(.retain_capacity);
}

// --- MEMORY RETRIEVAL ---
// @wasm
pub fn getWorldMemoryLocation(world: u16) !*u16 {
    return game.worlds_list.at(world).embedded_data.firstMemoryLocation();
}
// @wasm
pub fn getWorldMemoryLength(world: u16) !usize {
    return game.worlds_list.at(world).embedded_data.getLength();
}
// @wasm
pub fn getEntityMemoryLocation(entity: u16) !*u16 {
    return game.entities_list.at(entity).embedded.firstMemoryLocation();
}
// @wasm
pub fn getEntityMemoryLength(entity: u16) !usize {
    return game.entities_list.at(entity).embedded.getLength();
}
// @wasm
pub fn getLayerMemoryLocation(layer: u16) !*u16 {
    // TODO: Consider if we need to filter this by world or not. Most likely yes
    return try layers.items[layer].firstMemoryLocation();
}
// @wasm
pub fn getLayerMemoryLength(layer: u16) !usize {
    // TODO: Consider if we need to filter this by world or not. Most likely yes
    return layers.items[layer].getLength();
}
