const std = @import("std");

const game = @import("game.zig");
const enums = @import("enums.zig");

pub fn processEvents() void {
    while (game.events_list.items.len > 0) {
        var event = game.events_list.pop();
        if (event.type == enums.GameMessagesEventsEnum.Attack.int()) {
            processAttack(event);
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

pub fn processMove(event: game.GameEvent) void {
    std.log.info("Processing move", .{});
    // TODO: if event.force
    var entity = game.entities_list.at(event.data[0]);
    switch (event.type) {
        enums.GameMessagesEventsEnum.MoveUp.int() => entity.handle(enums.ComponentMovementEvent.MoveUp),
        enums.GameMessagesEventsEnum.MoveDown.int() => entity.handle(enums.ComponentMovementEvent.MoveDown),
        enums.GameMessagesEventsEnum.MoveLeft.int() => entity.handle(enums.ComponentMovementEvent.MoveLeft),
        enums.GameMessagesEventsEnum.MoveRight.int() => entity.handle(enums.ComponentMovementEvent.MoveRight),
        else => return false,
    }
}
