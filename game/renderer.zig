const std = @import("std");

pub var camera_position: [2]u16 = .{ 0, 0 }; // Equivalent to a world offset, more or less
pub var viewport_size: [2]u16 = .{ 0, 0 };

test "camera_position" {
    try std.testing.expect(camera_position[0] == 0);
}

// @wasm
pub fn getPositionX() u16 {
    return camera_position[0];
}
pub fn getPositionY() u16 {
    return camera_position[1];
}
pub fn setPosition(x: u16, y: u16) void {
    camera_position[0] = x;
    camera_position[1] = y;
}
test "test_camera" {
    try std.testing.expect(getPositionX() == 0);
    setPosition(0, 3);
    try std.testing.expect(getPositionY() == 3);
}

