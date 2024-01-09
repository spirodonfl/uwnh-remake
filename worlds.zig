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
