const std = @import("std");

const game = @import("game.zig");
const enums = @import("enums.zig");

// @wasm
pub fn attack(entity_id: u16, target_entity_id: u16, force: bool) !void {
    // TODO: How do we make the force parameter default to false?
    var event = game.GameEvent{
        .type = enums.GameMessagesEventsEnum.Attack.int(),
        .force = force,
    };
    try event.data.append(game.allocator, entity_id);
    try event.data.append(game.allocator, target_entity_id);
    try game.events_list.append(game.allocator, event);
}

pub fn processAttack(event: game.GameEvent) void {
    _ = event;
    std.log.info("Processing attack", .{});
    // event.force
    // event.data[0] && event.data[1]
}