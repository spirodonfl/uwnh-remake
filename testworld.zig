// Legend = width * height * # of layers in game + 2 offset
pub const width = 6;
pub const height = 6;
pub const layers = 3; // TODO: Import layers from parent
pub const size = width * height * layers + 2;
// TODO: Add size as third dimension to data
pub var data: [size]u16 = .{
    width, height,

    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,

    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,

    0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 2, 0, 0, 0, 0,
};
