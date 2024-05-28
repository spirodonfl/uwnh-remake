const std = @import("std");

const game = @import("game.zig");
const enums = @import("enums.zig");
const messages = @import("messages.zig");

pub fn processEvents() !void {
    while (game.events_list.items.len > 0) {
        var event = game.events_list.pop();
        if (event.type == enums.GameMessagesEventsEnum.Attack.int()) {
            processAttack(event);
        } else if (event.type == enums.GameMessagesEventsEnum.MoveUp.int()) {
            try processMove(event);
        } else if (event.type == enums.GameMessagesEventsEnum.MoveDown.int()) {
            try processMove(event);
        } else if (event.type == enums.GameMessagesEventsEnum.MoveLeft.int()) {
            try processMove(event);
        } else if (event.type == enums.GameMessagesEventsEnum.MoveRight.int()) {
            try processMove(event);
        } else if (event.type == enums.GameMessagesEventsEnum.EndTurn.int()) {
            // NOTE: Make sure that the entity that initiated the end turn message
            // is actually the CURRENT turn entity we're expecting to see
            if (event.data.items[0] == game.entity_turn) {
                game.entity_turn += 1;
                if (game.entity_turn > game.entities_list.len) {
                    game.entity_turn = 0;
                }
            }
        }
    }
}

pub fn processEntityMessages() !void {
    for (0..game.entities_list.len) |i| {
        var entity = game.entities_list.at(i);
        try entity.processMessages();
    }
}

// @wasm
pub fn endTurn(entity_id: u16, force: bool) !void {
    // TODO: How do we make the force parameter default to false?
    var event = game.GameEvent{
        .type = enums.GameMessagesEventsEnum.EndTurn.int(),
        .force = force,
    };
    try event.data.append(game.allocator, entity_id);
    try game.events_list.append(game.allocator, event);
}

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
    // event.data.items[0] && event.data.items[1]
}

// @wasm
pub fn moveUp(entity_id: u16, force: bool) !void {
    // TODO: How do we make the force parameter default to false?
    var event = game.GameEvent{
        .type = enums.GameMessagesEventsEnum.MoveUp.int(),
        .force = force,
    };
    try event.data.append(game.allocator, entity_id);
    try game.events_list.append(game.allocator, event);
}

// @wasm
pub fn moveDown(entity_id: u16, force: bool) !void {
    // TODO: How do we make the force parameter default to false?
    var event = game.GameEvent{
        .type = enums.GameMessagesEventsEnum.MoveDown.int(),
        .force = force,
    };
    try event.data.append(game.allocator, entity_id);
    try game.events_list.append(game.allocator, event);
}

// @wasm
pub fn moveLeft(entity_id: u16, force: bool) !void {
    // TODO: How do we make the force parameter default to false?
    var event = game.GameEvent{
        .type = enums.GameMessagesEventsEnum.MoveLeft.int(),
        .force = force,
    };
    try event.data.append(game.allocator, entity_id);
    try game.events_list.append(game.allocator, event);
}

// @wasm
pub fn moveRight(entity_id: u16, force: bool) !void {
    // TODO: How do we make the force parameter default to false?
    var event = game.GameEvent{
        .type = enums.GameMessagesEventsEnum.MoveRight.int(),
        .force = force,
    };
    try event.data.append(game.allocator, entity_id);
    try game.events_list.append(game.allocator, event);
}

pub fn processMove(event: game.GameEvent) !void {
    std.log.info("Processing move", .{});
    switch (event.type) {
        enums.GameMessagesEventsEnum.MoveUp.int() => try messages.moveDown(event.data.items[0], event.force),
        enums.GameMessagesEventsEnum.MoveDown.int() => try messages.moveDown(event.data.items[0], event.force),
        enums.GameMessagesEventsEnum.MoveLeft.int() => try messages.moveLeft(event.data.items[0], event.force),
        enums.GameMessagesEventsEnum.MoveRight.int() => try messages.moveRight(event.data.items[0], event.force),
        else => unreachable,
    }
}
