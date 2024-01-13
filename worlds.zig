// TODO: Do we need to export these?
// TODO: Are these automatically publically available to game.zig since they're pubs?
// TODO: Is there a way to read files from a folder and auto import them?
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

pub const world_indexes: [2]u16 = .{0, 12};
pub const world_sizes: [2]u16 = .{4, 9};
pub const world_dimensions: [4]u16 = .{2, 2, 3, 3};
pub const all_worlds: [39]u16 = .{
    // Layer 1 (background)
    0, 0,
    0, 0,
    // Layer 2 (collision)
    0, 0,
    0, 98,
    // Layer 3 (NPC)
    0, 0,
    0, 0,

    // layer 1
    0, 0, 0,
    0, 0, 99,
    0, 0, 0,
    // layer 2
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
    // layer 3
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
};
