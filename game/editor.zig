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
}

// @wasm
pub fn setWorldLayerCoordinateData(world_id: u16, layer_index: u16, x: u16, y: u16, value: u16) !void {
    for (0..game.worlds_list.len) |i| {
        var world = game.worlds_list.at(i);
        if (world.embedded_data.readData(enums.WorldDataEnum.ID.int(), .Little) == world_id) {
            if (layer_index == world.embedded_data.readData(enums.WorldDataEnum.EntityLayer.int(), .Little)) {
                try world.addEntity(value, x, y);
            }
            try world.embedded_layers.items[layer_index].readToRawData();
            var index = (y * world.getWidth()) + x;
            // std.log.info("Setting world layer coordinate data: {d} {d}", .{index, value});
            world.embedded_layers.items[layer_index].raw_data.items[index] = value;
        }
    }
}
// @wasm
pub fn addRowToWorld(world_index: u16) !void {
    var world = game.worlds_list.at(world_index);
    var new_height = world.getHeight() + 1;

    var i: usize = 0;
    while (i < world.embedded_layers.items.len) {
        try world.embedded_layers.items[i].readToRawData();
        try world.embedded_layers.items[i].raw_data.appendNTimes(game.allocator, 0, world.getWidth());
        i += 1;
    }

    try world.embedded_data.readToRawData();
    world.embedded_data.raw_data.items[enums.WorldDataEnum.Height.int()] = new_height;
}
// @wasm
pub fn removeRowFromWorld(world_index: u16) !void {
    var world = game.worlds_list.at(world_index);
    var new_height = world.getHeight() - 1;

    var i: usize = 0;
    while (i < world.embedded_layers.items.len) {
        try world.embedded_layers.items[i].readToRawData();
        // TODO: does resize actually release the memory. Maybe use clearAndFree?
        try world.embedded_layers.items[i].raw_data.resize(game.allocator, world.getWidth() * new_height);
        i += 1;
    }

    try world.embedded_data.readToRawData();
    world.embedded_data.raw_data.items[enums.WorldDataEnum.Height.int()] = new_height;
}
// @wasm
pub fn addColumnToWorld(world_index: u16) !void {
    var world = game.worlds_list.at(world_index);
    var new_width = world.getWidth() + 1;

    var i: usize = 0;
    while (i < world.embedded_layers.items.len) {
        try world.embedded_layers.items[i].readToRawData();
        var new_raw_data: std.ArrayListUnmanaged(u16) = .{};
        var j: usize = 0;
        while (j < world.getHeight()) {
            var start = j * world.getWidth();
            var end = start + world.getWidth();
            // try new_raw_data.appendArray(world.embedded_layers.items[i].raw_data.items[start..end]);
            try new_raw_data.appendUnalignedSlice(game.allocator, world.embedded_layers.items[i].raw_data.items[start..end]);
            try new_raw_data.appendNTimes(game.allocator, 0, 1);
            j += 1;
        }
        world.embedded_layers.items[i].raw_data = new_raw_data;
        i += 1;
    }

    try world.embedded_data.readToRawData();
    world.embedded_data.raw_data.items[enums.WorldDataEnum.Width.int()] = new_width;
}
// @wasm
pub fn removeColumnFromWorld(world_index: u16) !void {
    var world = game.worlds_list.at(world_index);
    var new_width = world.getWidth() - 1;

    var i: usize = 0;
    while (i < world.embedded_layers.items.len) {
        try world.embedded_layers.items[i].readToRawData();
        var new_raw_data: std.ArrayListUnmanaged(u16) = .{};
        var j: usize = 0;
        while (j < world.getHeight()) {
            var start = j * world.getWidth();
            var end = start + new_width;
            // try new_raw_data.appendArray(world.embedded_layers.items[i].raw_data.items[start..end]);
            try new_raw_data.appendUnalignedSlice(game.allocator, world.embedded_layers.items[i].raw_data.items[start..end]);
            j += 1;
        }
        world.embedded_layers.items[i].raw_data = new_raw_data;
        i += 1;
    }

    try world.embedded_data.readToRawData();
    world.embedded_data.raw_data.items[enums.WorldDataEnum.Width.int()] = new_width;
}

// @wasm
pub fn moveLayer(world_index: u16, layer_index: u16, new_index: u16) !void {
    var world = game.worlds_list.at(world_index);

    std.log.info("Moving layer from {d} to {d}", .{layer_index, new_index});
    std.log.info("Layer count: {d}", .{world.embedded_layers.items.len});
    std.log.info("Current entity & collision layers {d} {d}", .{world.getEntityLayer(), world.getCollisionLayer()});
    // Check if the indices are valid
    if (layer_index >= world.embedded_layers.items.len or new_index >= world.embedded_layers.items.len) {
        // TODO: THIS WORKS you should use this more often when you're not pumping out WASM functions...
        return error.InvalidIndex;
    }

    // // Temporarily store the element at layer_index
    // const current_layer_value = world.embedded_layers.items[layer_index];
    // // Temporarily store the element at new_index
    // const target_layer_value = world.embedded_layers.items[new_index];

    // Directly swap the values at the specified indices
    const temp = world.embedded_layers.items[layer_index];
    world.embedded_layers.items[layer_index] = world.embedded_layers.items[new_index];
    world.embedded_layers.items[new_index] = temp;

    if (layer_index == world.getCollisionLayer()) {
        try world.setCollisionLayer(new_index);
    } else if (layer_index == world.getEntityLayer()) {
        // std.log.info("setting new entity layer", .{});
        try world.setEntityLayer(new_index);
    } else if (new_index == world.getCollisionLayer()) {
        try world.setCollisionLayer(layer_index);
    } else if (new_index == world.getEntityLayer()) {
        try world.setEntityLayer(layer_index);
    }

    // // Remove the elements at layer_index and new_index
    // _ = world.embedded_layers.swapRemove(layer_index);
    // _ = world.embedded_layers.swapRemove(new_index);

    // // Insert the elements back in their new positions
    // // First, insert the element that was originally at layer_index to new_index
    // try world.embedded_layers.insert(game.allocator, new_index, current_layer_value);
    // // Then, insert the element that was originally at new_index to layer_index
    // try world.embedded_layers.insert(game.allocator, layer_index, target_layer_value);
}

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
pub fn createEntity(entity_type: u16, entity_id: u16) !usize {
    var new_entity_data = game.EmbeddedDataStruct{};
    var i: usize = 0;
    std.log.info("EntityDataEnum->length() {d}", .{enums.EntityDataEnum.length()});
    // TODO: Allow updating some of these values
    while (i < enums.EntityDataEnum.length()) {
        if (i == enums.EntityDataEnum.ID.int()) {
            try new_entity_data.appendToRawData(entity_id);
        } else if (i == enums.EntityDataEnum.Type.int()) {
            try new_entity_data.appendToRawData(entity_type);
        } else if (i == enums.EntityDataEnum.IsCollision.int()) {
            try new_entity_data.appendToRawData(1);
        } else if (i == enums.EntityDataEnum.ComponentHealth.int()) {
            try new_entity_data.appendToRawData(1);
        } else if (i == enums.EntityDataEnum.ComponentAttack.int()) {
            try new_entity_data.appendToRawData(1);
        } else if (i == enums.EntityDataEnum.ComponentHealthDefaultValue.int()) {
            // TODO: Enum-ize or otherwise standardize this
            if (entity_type == 99 or entity_type == 98) {
                try new_entity_data.appendToRawData(44);
            } else {
                try new_entity_data.appendToRawData(10);
            }
        } else if (i == enums.EntityDataEnum.ComponentMovement.int()) {
            try new_entity_data.appendToRawData(1);
        } else {
            std.log.info("Unhandled enum on createEntity: {d}", .{i});
        }
        i += 1;
    }
    // Adding extra data just in case we need it
    try new_entity_data.appendToRawData(0);
    try new_entity_data.appendToRawData(0);
    try new_entity_data.appendToRawData(0);
    try new_entity_data.appendToRawData(0);

    // var new_entity = game.EntityDataStruct{};
    // new_entity.setEmbedded(new_entity_data);

    try game.entities_list.append(arena.allocator(), .{});
    var new_entity_index = game.entities_list.len - 1;
    game.entities_list.at(new_entity_index).setEmbedded(new_entity_data);
    try game.entities_list.at(new_entity_index).init();
    return new_entity_index;
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
pub fn getWorldMemoryLocation(world_id: u16) !*u16 {
    // return game.worlds_list.at(world_index).embedded_data.firstMemoryLocation();
    var location: *u16 = undefined;
    for (0..game.worlds_list.len) |i| {
        var world = game.worlds_list.at(i);
        if (world.embedded_data.readData(enums.WorldDataEnum.ID.int(), .Little) == world_id) {
            location = try world.embedded_data.firstMemoryLocation();
        }
    }
    return location;
}
// @wasm
pub fn getWorldMemoryLength(world_id: u16) !usize {
    // return game.worlds_list.at(world_index).embedded_data.getLength();
    var size: u16 = 0;
    for (0..game.worlds_list.len) |i| {
        var world = game.worlds_list.at(i);
        if (world.embedded_data.readData(enums.WorldDataEnum.ID.int(), .Little) == world_id) {
            size = world.embedded_data.getLength();
        }
    }
    return size;
}
// @wasm
pub fn getEntityMemoryLocation(entity_id: u16) !*u16 {
    var location: *u16 = undefined;
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        if (entity.embedded.readData(enums.EntityDataEnum.ID.int(), .Little) == entity_id) {
            location = try entity.embedded.firstMemoryLocation();
        }
    }
    return location;
}
// @wasm
pub fn getEntityMemoryLength(entity_id: u16) !u16 {
    var size: u16 = 0;
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        if (entity.embedded.readData(enums.EntityDataEnum.ID.int(), .Little) == entity_id) {
            size = entity.embedded.getLength();
        }
    }
    return size;
}
// @wasm
pub fn getEntityMemoryLocationByIndex(entity_index: u16) !*u16 {
    var location: *u16 = undefined;
    for (0..game.entities_list.len) |i| {
        if (entity_index == i) {
            var entity = game.entities_list.at(i);
            location = try entity.embedded.firstMemoryLocation();
        }
    }
    return location;
}
// @wasm
pub fn getEntityMemoryLengthByIndex(entity_index: u16) !u16 {
    var size: u16 = 0;
    for (0..game.entities_list.len) |i| {
        if (entity_index == i) {
            var entity = game.entities_list.at(i);
            size = entity.embedded.getLength();
        }
    }
    return size;
}
// @wasm
pub fn getWorldLayerMemoryLocation(world_id: u16, layer_index: u16) !*u16 {
    // return game.worlds_list.at(world_index).embedded_layers.items[layer_index].firstMemoryLocation();
    var location: *u16 = undefined;
    for (0..game.worlds_list.len) |i| {
        var world = game.worlds_list.at(i);
        if (world.embedded_data.readData(enums.WorldDataEnum.ID.int(), .Little) == world_id) {
            location = try world.embedded_layers.items[layer_index].firstMemoryLocation();
        }
    }
    return location;
}
// @wasm
pub fn getWorldLayerMemoryLength(world_id: u16, layer_index: u16) !usize {
    // return game.worlds_list.at(world_index).embedded_layers.items[layer_index].getLength();
    var size: u16 = 0;
    for (0..game.worlds_list.len) |i| {
        var world = game.worlds_list.at(i);
        if (world.embedded_data.readData(enums.WorldDataEnum.ID.int(), .Little) == world_id) {
            size = world.embedded_layers.items[layer_index].getLength();
        }
    }
    return size;
}
// @wasm
pub fn getLayerMemoryLocation(layer_index: u16) !*u16 {
    return try layers.items[layer_index].firstMemoryLocation();
}
// @wasm
pub fn getLayerMemoryLength(layer_index: u16) !usize {
    return layers.items[layer_index].getLength();
}
