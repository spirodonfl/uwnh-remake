const std = @import("std");
const game = @import("../game.zig");
const viewport = @import("../viewport.zig");
const entity = @import("../entity.zig");
const EntityDataStruct = entity.EntityDataStruct;
const enums = @import("../enums.zig");
const fsm = @import("fsm.zig");

pub const ComponentMovement = struct {
    // TODO: Do we still need this?
    entity_id: u16,
    parent: *EntityDataStruct,
    state: u16 = 0,
    // NOTE: Without the anyerror!void here, we get an error from zig
    // "unable to resolve inferred error set" -> try self.directionalAttack()
    // weird... need to understand how and why
    pub fn handle(self: *@This(), event: enums.ComponentMovementEvent) anyerror!void {
        switch (event) {
            enums.ComponentMovementEvent.MoveLeft => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        // TODO: Check that the move is legal?
                        self.moveLeft();
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.MoveRight => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        // TODO: Check that the move is legal?
                        self.moveRight();
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.MoveUp => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        // TODO: Check that the move is legal?
                        self.moveUp();
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.MoveDown => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        // TODO: Check that the move is legal?
                        self.moveDown();
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.Moved => {
                switch (self.state) {
                    enums.ComponentMovementState.Moving.int() => {
                        self.state = enums.ComponentMovementState.Idle.int();
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
        }
    }
    pub fn intendedMoveUp(self: *ComponentMovement) u16 {
        if (self.parent.position[1] > 0) {
            return self.parent.position[1] - 1;
        }
        return self.parent.position[1];
    }
    pub fn moveUp(self: *ComponentMovement) void {
        if (self.parent.position[1] > 0) {
            self.parent.position[1] -= 1;
        }
    }
    pub fn intendedMoveDown(self: *ComponentMovement) u16 {
        if (self.parent.position[1] < game.worlds_list.at(game.current_world_index).getHeight() - 1) {
            return self.parent.position[1] + 1;
        }
        return self.parent.position[1];
    }
    pub fn moveDown(self: *ComponentMovement) void {
        if (self.parent.position[1] < game.worlds_list.at(game.current_world_index).getHeight() - 1) {
            self.parent.position[1] += 1;
        }
    }
    pub fn intendedMoveLeft(self: *ComponentMovement) u16 {
        if (self.parent.position[0] > 0) {
            return self.parent.position[0] - 1;
        }
        return self.parent.position[0];
    }
    pub fn moveLeft(self: *ComponentMovement) void {
        if (self.parent.position[0] > 0) {
            self.parent.position[0] -= 1;
        }
    }
    pub fn intendedMoveRight(self: *ComponentMovement) u16 {
        if (self.parent.position[0] < game.worlds_list.at(game.current_world_index).getWidth() - 1) {
            return self.parent.position[0] + 1;
        }
        return self.parent.position[0];
    }
    pub fn moveRight(self: *ComponentMovement) void {
        if (self.parent.position[0] < game.worlds_list.at(game.current_world_index).getWidth() - 1) {
            self.parent.position[0] += 1;
        }
    }
};
