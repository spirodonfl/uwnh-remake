// TODO: Since we cannot do a mass import, we need to do this manually.
// How will you track the current files and any new files if you're including data from editor exports?
// Tracking new files should be easy by returning length of existing array and then you n + 1
// Replacing files would just be array index naming convention

pub const test_image = @import("test_image.zig");
pub const test_image_two = @import("test_image_two.zig");

pub var images: [2]u32 = undefined;
pub export fn init() void {
    images = .{@as(u32, @intCast(@intFromPtr(&test_image.data))), @as(u32, @intCast(@intFromPtr(&test_image_two.data)))};
}

// Note: These bubble out! That's awesome!
// TODO: Use these pub exports in entities && world && renderer
pub export fn getImages() u32 {
    return @as(u32, @intCast(@intFromPtr(&images)));
}
pub export fn getImage(index: u16) u32 {
    return @as(u32, @intCast(@intFromPtr(&images[index])));
}

pub const image_indexes: [2]u16 = .{0, 16};
pub const image_dimensions: [4]u16 = .{2, 2, 3, 3};
pub const image_sizes: [2]u16 = .{16, 24};
pub const image_atlas: [40]u16 = .{
    // Image 1
    200, 200, 0, 255,
    200, 200, 0, 255,
    200, 200, 0, 255,
    200, 200, 0, 255,

    // Image 2
    100, 100, 30, 255,
    100, 100, 30, 255,
    100, 100, 30, 255,
    100, 100, 30, 255,
    100, 100, 30, 255,
    100, 100, 30, 255,
};
