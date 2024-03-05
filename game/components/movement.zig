const std = @import("std");
const game = @import("../game.zig");
const viewport = @import("../viewport.zig");

// TODO: Retain a reference to parent as EntityDataStruct
pub const ComponentMovement = struct {
    entity_id: u16,
    pub fn intendedMoveUp(self: *ComponentMovement) u16 {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[1] > 0) {
            return entity.position[1] - 1;
        }
        return entity.position[1];
    }
    pub fn moveUp(self: *ComponentMovement) void {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[1] > 0) {
            entity.position[1] -= 1;
        }
    }
    pub fn intendedMoveDown(self: *ComponentMovement) u16 {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[1] < viewport.getSizeHeight() - 1) {
            return entity.position[1] + 1;
        }
        return entity.position[1];
    }
    pub fn moveDown(self: *ComponentMovement) void {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[1] < viewport.getSizeHeight() - 1) {
            entity.position[1] += 1;
        }
    }
    pub fn intendedMoveLeft(self: *ComponentMovement) u16 {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[0] > 0) {
            return entity.position[0] - 1;
        }
        return entity.position[0];
    }
    pub fn moveLeft(self: *ComponentMovement) void {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[0] > 0) {
            entity.position[0] -= 1;
        }
    }
    pub fn intendedMoveRight(self: *ComponentMovement) u16 {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[0] < viewport.getSizeWidth() - 1) {
            return entity.position[0] + 1;
        }
        return entity.position[0];
    }
    pub fn moveRight(self: *ComponentMovement) void {
        var entity = game.getEntityById(self.entity_id);
        if (entity.position[0] < viewport.getSizeWidth() - 1) {
            entity.position[0] += 1;
        }
    }
};