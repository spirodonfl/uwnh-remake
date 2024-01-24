const std = @import("std");
const ArrayList = std.ArrayList;

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();
var data = ArrayList(u16).init(allocator);

pub var viewport_size: [2]u16 = .{ 0, 0 };
var viewport_data = ArrayList(u16).init(allocator);
// @wasm
pub fn getDataIndex(index: u16) u16 {
    return viewport_data.items[index];
}
// @wasm
pub fn setDataIndex(index: u16, value: u16) void {
    viewport_data.items[index] = value;
}
// @wasm
pub fn getData(x: u16, y: u16) u16 {
    var index = y * viewport_size[0] + x;
    return getDataIndex(index);
}
// @wasm
pub fn setData(x: u16, y: u16, value: u16) void {
    var index = y * viewport_size[0] + x;
    setDataIndex(index, value);
}
// @wasm
pub fn getLength() u16 {
    return @as(u16, @intCast(data.items.len));
}
// @wasm
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

