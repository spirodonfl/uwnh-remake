pub const WorldLayersEnum = enum(u16) {
    Base = 0,
    Collision = 1,
    Entities = 2,

    // TODO: Remove these in favor of enumToU16&&enumToUsize functions
    pub fn getAsUsize(self: WorldLayersEnum) usize {
        return @as(usize, @intFromEnum(self));
    }

    pub fn getAsU16(self: WorldLayersEnum) u16 {
        return @intFromEnum(self);
    }
};
pub const WorldDataEnum = enum(u16) {
    Width = 0,
    Height = 1,

    // TODO: Remove these in favor of enumToU16&&enumToUsize functions
    pub fn getAsUsize(self: WorldDataEnum) usize {
        return @as(usize, @intFromEnum(self));
    }

    pub fn getAsU16(self: WorldDataEnum) u16 {
        return @intFromEnum(self);
    }
};

pub const test_world = @import("testworld.zig");
pub const current_worlds = .{&test_world};
