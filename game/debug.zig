const std = @import("std");
const ArrayList = std.ArrayList;

var debug: ArrayList(u16) = undefined;

var debug_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const debug_allocator = debug_arena.allocator();
pub fn init() void {
    debug = ArrayList(u16).init(debug_allocator);
}
pub fn getData(index: u16) u16 {
    return debug.items[index];
}
pub fn getLength() u16 {
    return @as(u16, @intCast(debug.items.len));
}
pub fn clearAll() void {
    debug.clearRetainingCapacity();
    _ = debug_arena.reset(.retain_capacity);
}
test "test_debug_stuff" {
    debug = ArrayList(u16).init(debug_allocator);
    debug.append(1) catch unreachable;
    try std.testing.expect(getLength() == 1);
    try std.testing.expect(getData(0) == 1);
    clearAll();
    try std.testing.expect(getLength() == 0);
}
