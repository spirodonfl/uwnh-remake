// TODO: This will become what gets generated out of game editor output

// Generate an array of 4 u8s
pub var test_one_data: [4]u8 = [_]u8{ 0, 1, 2, 3 };

// --------------------
// Layers legend
// 0 = base layer
// 1 = collision layer
// 2 = entity layer
// --------------------
pub var layers: [3]u8 = .{ 0, 1, 2 };
pub var size: [2]u16 = .{ 4, 4 };
pub var data: [3][4][4]u16 = .{
    .{
        .{ 0, 0, 0, 0 },
        .{ 0, 0, 0, 0 },
        .{ 0, 0, 0, 0 },
        .{ 0, 0, 0, 0 },
    },
    .{
        .{ 0, 0, 0, 0 },
        .{ 0, 0, 0, 0 },
        .{ 0, 0, 0, 0 },
        .{ 0, 0, 0, 1 },
    },
    .{
        .{ 1, 0, 0, 0 },
        .{ 0, 0, 0, 0 },
        .{ 0, 0, 2, 0 },
        .{ 0, 0, 0, 0 },
    },
};

pub var entity_image_bytes: [4][4]u8 = .{
    .{ 200, 200, 200, 255 },
    .{ 200, 200, 200, 255 },
    .{ 200, 200, 200, 255 },
    .{ 200, 200, 200, 255 },
};
