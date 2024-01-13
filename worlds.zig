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

pub const all_worlds: [27]u16 = .{
    4, 2, 2,
    // Layer 1 (background)
    0, 0,
    0, 0,
    // Layer 2 (collision)
    0, 0,
    0, 0,
    // Layer 3 (NPC)
    0, 0,
    0, 0,

    9, 3, 3,
    // layer 1
    0, 0, 0,
    0, 0, 0,
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
