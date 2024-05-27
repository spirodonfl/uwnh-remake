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
    usingnamespace fsm.FsmMixin(enums.ComponentMovementState, enums.ComponentMovementEvent);
    pub fn handle(self: *@This(), event: enums.ComponentMovementEvent) void {
        switch (event) {
            enums.ComponentMovementEvent.Move => {
                switch (self.state) {
                    enums.ComponentMovementState.Idle => self.transition(.Moving),
                }
            },
            enums.ComponentMovementEvent.Moved => {
                switch (self.state) {
                    enums.ComponentMovementState.Moving => self.transition(.Idle),
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