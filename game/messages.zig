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
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        if (entity.getId() == entity_id) {
            try entity.addMessage(message);
        }
    }
}
// @wasm
pub fn moveDown(entity_id: u16, force: bool) !void {
    var message = game.GameMessage{
        .command = enums.GameMessagesEventsEnum.MoveDown.int(),
        .force = force,
    };
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        if (entity.getId() == entity_id) {
            try entity.addMessage(message);
        }
    }
}
// @wasm
pub fn moveLeft(entity_id: u16, force: bool) !void {
    var message = game.GameMessage{
        .command = enums.GameMessagesEventsEnum.MoveLeft.int(),
        .force = force,
    };
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        if (entity.getId() == entity_id) {
            try entity.addMessage(message);
        }
    }
}
// @wasm
pub fn moveRight(entity_id: u16, force: bool) !void {
    var message = game.GameMessage{
        .command = enums.GameMessagesEventsEnum.MoveRight.int(),
        .force = force,
    };
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        if (entity.getId() == entity_id) {
            try entity.addMessage(message);
        }
    }
}
// @wasm
pub fn attack(entity_id: u16, force: bool) !void {
    var message = game.GameMessage{
        .command = enums.GameMessagesEventsEnum.Attack.int(),
        .force = force,
    };
    // try message.data.append(game.allocator, target_entity_id);
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        if (entity.getId() == entity_id) {
            try entity.addMessage(message);
        }
    }
}