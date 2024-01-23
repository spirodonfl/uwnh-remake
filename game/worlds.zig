pub const WorldLayersEnum = enum(u16) {
    Base = 0,
    Collision = 1,
    Entities = 2,
};
pub const WorldDataEnum = enum(u16) {
    Width = 0,
    Height = 1,
};
pub const test_world = @import("testworld.zig");
pub const current_worlds = .{&test_world};

const ImagesEnum = @import("enums.zig").ImagesEnum;
const enumToU16 = @import("helpers.zig").enumToU16;
pub const world_indexes: [2]u16 = .{0, 12};
pub const world_sizes: [2]u16 = .{4, 9};
pub const world_dimensions: [4]u16 = .{2, 2, 3, 3};
const ocean_bg_image = enumToU16(ImagesEnum, ImagesEnum.OceanBGImage);
pub const world_layer_base: [2]u16 = .{ocean_bg_image, ocean_bg_image};
pub const world_layer_collision: [2]u16 = .{0, 1};
pub const world_layer_npc: [2]u16 = .{1, 2};
pub const __layers: [2][2]u16 = .{
    .{0, 99},
    .{0, 0},
};

// index = world * layer * (x * y) + x = fn getworldlayerdata(world, layer, x, y)
// when exporting a single world layer -> call function etc... take the array and save it as a new file
// call function to get some array (return starting pointer of memory block + length)
// save to file, prefix with "const [" postfix with "];"
// -> return binary
// -> .bin
// editor takes numbers and converts to binary
// -> EDITOR_FUNCTION converts INTERNAL data to binary as 0's and 1's array returns a big block of that

// const world struct {
//     layers: [2]u16,
//     id: []u8,
//     active: bool,
// };
// 
// const world struct {
//     collision: [2]u16,
//     base: [2]u16,
//     npc: [2]u16,
// };
// 
// // @wasm
// export fn getworldlayerdata(world, layer, x, y) {
//     return specific value;
// }

// test "__worlds" {
//     try std.testing.expect(__worlds[0][1] == 99);
// }
// // if layer_index == 0 -> world_layer_base
// // On editor new layer -> create a new array when you export with name
// pub const all_worlds: [39]u16 = .{
//     // Layer 1 (background)
//     ocean_bg_image, ocean_bg_image,
//     ocean_bg_image, ocean_bg_image,
//     // Layer 2 (collision)
//     0, 0,
//     0, 98,
//     // Layer 3 (NPC)
//     0, 0,
//     0, 0,
// 
//     // layer 1
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     // layer 2
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     // layer 3
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
// };
// 
// const std = @import("std");
// const current_world = current_worlds[0];
// var current_world_i: u16 = 0;
// // @wasm
// pub fn getData(world: u16, layer: u16, x: u16, y: u16) u16 {
//     var index: u16 = world_indexes[world];
//     var size: u16 = world_sizes[world];
//     var width: u16 = world_dimensions[(world * 2)];
//     index = index + (size * layer);
//     index = index + ((y * width) + x);
//     return all_worlds[index];
// }
// // @wasm
// pub fn getWidth(world: u16) u16 {
//     return world_dimensions[(world * 2)];
// }
// // @wasm
// pub fn getHeight(world: u16) u16 {
//     return world_dimensions[(world * 2) + 1];
// }
// // @wasm
// pub fn currentGetData(layer: u16, x: u16, y: u16) u16 {
//     var index: u16 = world_indexes[current_world_i];
//     var size: u16 = world_sizes[current_world_i];
//     var width: u16 = world_dimensions[(current_world_i * 2)];
//     index = index + (size * layer);
//     index = index + ((y * width) + x);
//     return all_worlds[index];
// }
// // @wasm
// pub fn currentGetWidth() u16 {
//     return world_dimensions[(current_world_i * 2)];
// }
// // @wasm
// pub fn currentGetHeight() u16 {
//     return world_dimensions[(current_world_i * 2) + 1];
// }
// test "test_world_data" {
//     // try std.testing.expect(getData(1, 0, 2, 1) == 99);
//     // try std.testing.expect(getWidth(1) == 3);
//     // try std.testing.expect(getHeight(1) == 3);
//     // try std.testing.expect(currentGetData(1, 1, 1) == 98);
//     // try std.testing.expect(currentGetWidth() == 2);
//     // try std.testing.expect(currentGetHeight() == 2);
// }
