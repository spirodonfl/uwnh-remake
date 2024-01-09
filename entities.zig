pub const EntityDataEnum = enum(u16) {
    Health = 0,
    PositionX = 1,
    PositionY = 2,
};

pub const player_entity = @import("entity_player.zig");
pub const artificial_entity = @import("entity_artificial.zig");
pub const current_entities: [2]*[3]u16 = .{ &player_entity.data, &artificial_entity.data };
