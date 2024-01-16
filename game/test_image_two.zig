// TODO: Can use u and i bit-widths of up to 65535
// https://ziglang.org/documentation/0.11.0/#Integers
// example: []u13
pub const width: u16 = 2;
pub const height: u16 = 2;
pub const size: u16 = width * height * 4 + 3;
pub const data: [size]u16= .{
    width, height, size,
    0, 255, 0, 255,
    0, 200, 0, 255,
    0, 255, 0, 255,
    0, 200, 0, 255,
};
