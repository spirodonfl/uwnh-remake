const std = @import("std");

pub var camera_position: [2]u16 = .{ 0, 0 }; // Equivalent to a world offset, more or less
pub var viewport_size: [2]u16 = .{ 0, 0 };

test "camera_position" {
    try std.testing.expect(camera_position[0] == 0);
}
