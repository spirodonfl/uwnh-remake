// TODO: Change this file name to camera. There's nothing else in here but a camera.
const std = @import("std");
const ArrayList = std.ArrayList;

pub var camera_position: [2]u16 = .{ 0, 0 }; // Equivalent to a world offset, more or less

test "camera_position" {
    try std.testing.expect(camera_position[0] == 0);
}

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();

// @wasm
pub fn getPositionX() u16 {
    return camera_position[0];
}
// @wasm
pub fn getPositionY() u16 {
    return camera_position[1];
}
// @wasm
pub fn setPosition(x: u16, y: u16) void {
    camera_position[0] = x;
    camera_position[1] = y;
}

// TESTS
test "test_camera" {
    try std.testing.expect(getPositionX() == 0);
    setPosition(0, 3);
    try std.testing.expect(getPositionY() == 3);
}

