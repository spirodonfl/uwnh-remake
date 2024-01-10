pub const test_image = @import("test_image.zig");
pub const test_image_two = @import("test_image_two.zig");

pub var images: [2]u32 = undefined;
pub export fn init() void {
    images = .{@as(u32, @intCast(@intFromPtr(&test_image.data))), @as(u32, @intCast(@intFromPtr(&test_image_two.data)))};
}

// Note: These bubble out! That's awesome!
pub export fn getImages() u32 {
    return @as(u32, @intCast(@intFromPtr(&images)));
}
pub export fn getImage(index: u16) u32 {
    return @as(u32, @intCast(@intFromPtr(&images[index])));
}
