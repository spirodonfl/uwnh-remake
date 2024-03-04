const game = @import("../game.zig");

pub const ComponentMovement = struct {
    parent: *game.EntityDataStruct,
    pub fn init(parent: *game.EntityDataStruct) ComponentMovement {
        return .{ .parent = parent };
    }
    pub fn intendedMoveUp(self: *ComponentMovement) u16 {
        return self.parent.position[1] - 1;
    }
    pub fn moveUp(self: *ComponentMovement) void {
        self.parent.position[1] -= 1;
    }
    pub fn intendedMoveDown(self: *ComponentMovement) u16 {
        return self.parent.position[1] + 1;
    }
    pub fn moveDown(self: *ComponentMovement) void {
        self.parent.position[1] += 1;
    }
    pub fn intendedMoveLeft(self: *ComponentMovement) u16 {
        return self.parent.position[0] - 1;
    }
    pub fn moveLeft(self: *ComponentMovement) void {
        self.parent.position[0] -= 1;
    }
    pub fn intendedMoveRight(self: *ComponentMovement) u16 {
        return self.parent.position[0] + 1;
    }
    pub fn moveRight(self: *ComponentMovement) void {
        self.parent.position[0] += 1;
    }
};