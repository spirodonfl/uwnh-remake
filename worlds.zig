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
// TODO: Test if this works better and keeps everything public
// _ = @import("testworld");
pub const current_worlds = .{&test_world};

// TODO: Flat worlds array of all worlds
