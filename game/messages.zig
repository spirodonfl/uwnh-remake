const std = @import("std");

const game = @import("game.zig");
const enums = @import("enums.zig");

// @wasm
pub fn moveUp(entity_id: u16, force: bool) !void {
    // TODO: How do we make the force parameter default to false?
    var message = game.GameMessage{
        .command = enums.GameMessagesEventsEnum.MoveUp.int(),
        .force = force,
    };
    try game.entities_list.at(entity_id).messages.append(game.allocator, message);
}