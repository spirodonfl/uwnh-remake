const std = @import("std");
const ArrayList = std.ArrayList;

var viewport_data_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const viewport_data_allocator = viewport_data_arena.allocator();
var viewport_data = ArrayList(u16).init(viewport_data_allocator);

pub fn init() void {}
pub fn update() void {}
// @wasm
pub fn getData(x: u16, y: u16) u16 {
    var index = (y * x) + x;
    return viewport_data.items[index];
}
pub fn getLength() u16 {
    return @as(u16, @intCast(viewport_data.items.len));
}
pub fn clear() void {
    viewport_data.clearRetainingCapacity();
    _ = viewport_data_arena.reset(.retain_capacity);
}
test "test_viewport_stuff" {
    viewport_data = ArrayList(u16).init(viewport_data_allocator);
    viewport_data.append(0) catch unreachable;
    viewport_data.append(1) catch unreachable;
    // TODO: how would I test viewport_update ?
    try std.testing.expect(getData(1, 0) == 1);
    try std.testing.expect(getLength() == 2);
    clear();
    try std.testing.expect(getLength() == 0);
}

