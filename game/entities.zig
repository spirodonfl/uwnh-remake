pub const EntityDataEnum = enum(u16) {
    Health = 0,
    PositionX = 1,
    PositionY = 2,
};

pub const player_entity = @import("entity_player.zig");
pub const artificial_entity = @import("entity_artificial.zig");
pub const current_entities: [2]*[3]u16 = .{ &player_entity.data, &artificial_entity.data };

// TODO: Pull in index #4 from ImageEnum.NPCPlayer && ImageEnum.Player ??
pub var entity_indexes: [2]u16 = .{0, 4};
pub var entities: [8]u16 = .{
    // Entity 1
    10, 0, 0, 0,
    // Entity 2
    10, 0, 0, 1,
};


const std = @import("std");
pub fn entity_set_position(entity: u16, x: u16, y: u16) void {
    _ = y;
    _ = x;
    _ = entity;
    // TODO: Both in entity array data AND in world npc layer data
    // TODO: Check if entity even belongs in world??

}
pub fn Move(index: u16) void {
    // TODO: up down left right
    _ = index;
}
pub fn Attack(index: u16, entity_attacked_index: u16) void {
    _ = index;
    _ = entity_attacked_index;
}
pub fn getHealth(entity: u16) u16 {
    // TODO: Check if editor_entities length > 0
    // If so, find entity_index (in parameter) and check if modification includes 0, new_health_modified_value
    // return that instead of original
    return entities[entity_indexes[entity]]; 
}
pub fn getPositionX(entity: u16) u16 {
    return entities[entity_indexes[entity] + 1];
}
pub fn getPositionY(entity: u16) u16 {
    return entities[entity_indexes[entity] + 2];
}
pub fn setHealth(entity: u16, health: u16) void {
    entities[entity_indexes[entity]] = health; 
}
pub fn getImage(entity: u16) u16 {
    return entities[entity_indexes[entity] + 3];
}
test "test_entities" {
    try std.testing.expect(getHealth(0) == 10);
    setHealth(0, 11);
    try std.testing.expect(getHealth(0) == 11);
    try std.testing.expect(getPositionX(0) == 0);
    try std.testing.expect(getPositionY(0) == 0);
}

