pub const EntityDataEnum = enum(u16) {
    Health = 0,
    PositionX = 1,
    PositionY = 2,

    pub fn getAsUsize(self: EntityDataEnum) usize {
        return @as(usize, @intFromEnum(self));
    }

    pub fn getAsU16(self: EntityDataEnum) u16 {
        return @intFromEnum(self);
    }
};

pub const playerEntity = @import("entity_player.zig");
pub const artificialEntity = @import("entity_artificial.zig");
pub const currentEntities: [2]*[3]u16 = .{ &playerEntity.data, &artificialEntity.data };

