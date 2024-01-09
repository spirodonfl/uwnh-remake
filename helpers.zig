const std = @import("std");

pub fn multiply(a: u16, b: u16) u16 { return a * b; }
pub fn add(a: u16, b: u16) u16 { return a + b; }
pub fn enumToUsize(comptime E: type, value: E) usize {
    return @as(usize, @intFromEnum(value));
}
pub fn enumToU16(comptime E: type, value: E) u16 {
    return @intFromEnum(value);
}

test "multiply" {
    try std.testing.expect(multiply(2, 3) == 6);
}
test "add" {
    try std.testing.expect(add(2, 3) == 5);
}
