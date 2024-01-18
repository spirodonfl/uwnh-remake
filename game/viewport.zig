const std = @import("std");
const ArrayList = std.ArrayList;

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();
var data = ArrayList(u16).init(allocator);

pub fn init() void {}
pub fn update() void {}
// @wasm
pub fn getData(x: u16, y: u16) u16 {
    var index = (y * x) + x;
    return data.items[index];
}
pub fn getLength() u16 {
    return @as(u16, @intCast(data.items.len));
}
pub fn clear() void {
    data.clearRetainingCapacity();
    _ = arena.reset(.retain_capacity);
}
test "test_viewport_stuff" {
    data.append(0) catch unreachable;
    data.append(1) catch unreachable;
    // TODO: how would I test viewport_update ?
    try std.testing.expect(getData(1, 0) == 1);
    try std.testing.expect(getLength() == 2);
    clear();
    try std.testing.expect(getLength() == 0);
}

