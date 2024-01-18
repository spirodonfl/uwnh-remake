const std = @import("std");
const ArrayList = std.ArrayList;

var diff_list_arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const diff_list_allocator = diff_list_arena.allocator();

var diff_list = ArrayList(u16).init(diff_list_allocator);
pub fn getData(index: u16) u16 {
    return diff_list.items[index];
}
pub fn getLength() u16 {
    return @as(u16, @intCast(diff_list.items.len));
}
pub fn clearAll() void {
    diff_list.clearRetainingCapacity();
    _ = diff_list_arena.reset(.retain_capacity);
}
test "test_diff_list_stuff" {
    diff_list = ArrayList(u16).init(diff_list_allocator);
    diff_list.append(1) catch unreachable;
    try std.testing.expect(getLength() == 1);
    try std.testing.expect(getData(0) == 1);
    clearAll();
    try std.testing.expect(getLength() == 0);
    // try std.testing.expect(diff_list_get_data(0) == 0);
}

