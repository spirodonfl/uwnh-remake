const std = @import("std");
const ArrayList = std.ArrayList;

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
pub var worlds = ArrayList(ArrayList(u16)).init(arena.allocator());
pub var entities = ArrayList(u16).init(arena.allocator());
pub var world_layer = ArrayList(u16).init(arena.allocator());
pub var layers = ArrayList(ArrayList(u16)).init(arena.allocator());
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

// pub fn modifyWorld(world: u16, layer: u16, x: u16, y: u16, value: u16) {}
// pub fn modifyEntity() ????????





// const game = @import("game.zig");
// const helpers = @import("helpers.zig");
// const entities = game.entities;
// 
// // TODO: Store arrays for modifications of original data
// // TODO: Store arrays for NEW data that only exists in editor
// // TODO: functions that generate new merged enums and/or other appropriate data so they can be re-compiled or baked back into the game
// 
// const std = @import("std");
// const ArrayList = std.ArrayList;
// 
// var editor_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
// var editor_entities = ArrayList(u16).init(editor_arena.allocator());
// var editor_entities_modifications_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
// const editor_entities_modifications_allocator = editor_entities_modifications_arena.allocator();
// var editor_entities_modifications: ArrayList(u16) = undefined;
// pub fn init() void {
//     editor_entities_modifications = ArrayList(u16).init(editor_entities_modifications_allocator);
// }
// pub fn deinit() void {
//     editor_arena.clearRetainingCapacity();
//     _ = editor_arena.reset(.retain_capacity);
// 
// }
// export fn modifyEntityHealth(entity: u16, health: u16) void {
//     // if entity <= world.entities length then we are manipulating
//     // an existing/precompiled entity, so we store modification of that entity here
//     // else if entity > world.entities, it means we are trying to reference an editor
//     // entity (ephemeral) so simply modify that original set of data
// 
//     if (entity >= entities.entity_indexes.len) {
//         var offset: u16 = entity - @as(u16, @intCast(entities.entity_indexes.len));
//         offset = offset * 3;
//         offset = offset + helpers.enumToU16(entities.EntityDataEnum, entities.EntityDataEnum.Health); 
//         editor_entities.items[offset] = health;
//     } else {
//         var i: usize = 0;
//         var have_modification: bool = false;
//         while (i < editor_entities_modifications.items.len) {
//             if (i == entity) {
//                 var value = editor_entities_modifications.items[(i + 1)];
//                 if (value == helpers.enumToU16(entities.EntityDataEnum, entities.EntityDataEnum.Health)) {
//                     // Matches health enum
//                     editor_entities_modifications.items[(i + 2)] = health;
//                     have_modification = true;
//                 }
//             }
//             i += 2; // default # to skip because entity_i = [attribute, modified_value]
//         }
//         if (!have_modification) {
//             editor_entities_modifications.append(entity) catch unreachable;
//             editor_entities_modifications.append(helpers.enumToU16(entities.EntityDataEnum, entities.EntityDataEnum.Health)) catch unreachable;
//             editor_entities_modifications.append(health) catch unreachable;
//         }
//     }
// }
// export fn editor_modifyEntityImage(entity: u16, image_index: u16) void {
//     // TODO: editor entities and all that
//     entities.entities[entities.entity_indexes[entity] + 3] = image_index;
// }
// export fn editor_createEntityNpc(health: u16) void {
//     // TODO: Iterate enum cases to fill this out instead of hard coding
//     editor_entities.append(health) catch unreachable; // health
//     editor_entities.append(0) catch unreachable; // x
//     editor_entities.append(1) catch unreachable; // y
// }
// export fn editor_duplicateEntityNpc(entity: u16) void {
//     _ = entity;
// 
//     // TODO: Get values from either entities.entities (if entity <= entities.entities.len)
//     // otherwise
//     // Get values from editor_entities
//     // iterate values
//     // append to editor_entities
// }
// test "test_editor_entity_stuff" {
//     initEditor();
//     editor_createEntityNpc(33);
//     try std.testing.expect(editor_entities.items[0] == 33);
//     try std.testing.expect(editor_entities.items.len == 3);
//     editor_modifyEntityHealth(2, 39);
//     // NOTE: This is how you debug print. Note the \n at the end otherwise no print happens
//     // If only Zig would test its own debug output tester thing
//     // std.debug.print("-- {d} \n", .{editor_entities.items[0]});
//     // std.
//     try std.testing.expect(editor_entities.items[0] == 39);
//     editor_modifyEntityHealth(0, 40);
//     try std.testing.expect(editor_entities_modifications.items.len == 3);
//     try std.testing.expect(editor_entities_modifications.items[2] == 40);
// }
// 
