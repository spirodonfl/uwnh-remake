const std = @import("std");
const game = @import("../game.zig");
const viewport = @import("../viewport.zig");
const entity = @import("../entity.zig");
const EntityDataStruct = entity.EntityDataStruct;
const enums = @import("../enums.zig");
const fsm = @import("fsm.zig");
const diff = @import("../diff.zig");

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
            // NOTE: Zig can infer where this enum comes from
            // TODO: Update ALL enum references to do this
            .MoveLeft => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        var current_world = game.worlds_list.at(game.current_world_index);
                        var intended_x = self.intendedMoveLeft();
                        var intended_y = self.parent.position[1];
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false) {
                            // NOTE: The moveLeft function already has a built in check for less than 0
                            self.moveLeft();
                            try diff.addData(0);
                        }
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.MoveRight => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        var current_world = game.worlds_list.at(game.current_world_index);
                        var intended_x = self.intendedMoveRight();
                        var intended_y = self.parent.position[1];
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false) {
                            self.moveRight();
                            try diff.addData(0);
                        }
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.MoveUp => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        var current_world = game.worlds_list.at(game.current_world_index);
                        var intended_x = self.parent.position[0];
                        var intended_y = self.intendedMoveUp();
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false) {
                            self.moveUp();
                            try diff.addData(0);
                        }
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.MoveDown => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle.int() => {
                        self.state = enums.ComponentMovementState.Moving.int();
                        var current_world = game.worlds_list.at(game.current_world_index);
                        var intended_x = self.parent.position[0];
                        var intended_y = self.intendedMoveDown();
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false) {
                            // NOTE: The moveDown function already has a built in check for less than 0
                            self.moveDown();
                            try diff.addData(0);
                        }
                        try self.handle(enums.ComponentMovementEvent.Moved);
                    },
                    else => self.state = enums.ComponentMovementState.Idle.int(),
                }
            },
            enums.ComponentMovementEvent.Moved => {
                switch (self.state) {
                    enums.ComponentMovementState.Moving.int() => {
                        std.log.info("Move completed", .{});
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
        self.parent.direction = enums.DirectionsEnum.Up.int();
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
        self.parent.direction = enums.DirectionsEnum.Down.int();
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
        self.parent.direction = enums.DirectionsEnum.Left.int();
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
        self.parent.direction = enums.DirectionsEnum.Right.int();
    }
};
