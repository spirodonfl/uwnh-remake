// What is this for?
//
// This should hold an array of differences in the game
// since the last time it was checked.
//
// Examples:
// An entity has moved from location 1,1 to location 1,2
// An entity has been destroyed because it's health went to 0
// An entity has change its asset due to some condition
// 
// This provides a way for the rendering mechanism to understand
// if there are changes that need to be taken into account since
// the last loop/tick/frame

const std = @import("std");
const ArrayList = std.ArrayList;

const enums = @import("enums.zig");

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);

var diff_list = ArrayList(u16).init(arena.allocator());
// @wasm
pub fn getData(index: u16) u16 {
    return diff_list.items[index];
}
// @wasm
pub fn getLength() u16 {
    return @intCast(diff_list.items.len);
}
// @wasm
pub fn addData(data: u16) !void {
    try diff_list.append(data);
}
// @wasm
pub fn clearAll() void {
    diff_list.clearRetainingCapacity();
    // Note: arena.reset(.retain_capacity) does nothing because we haven't freed any memory
}

// TESTS
test "test_diff_list_stuff" {
    diff_list = ArrayList(u16).init(arena.allocator());
    diff_list.append(1) catch unreachable;
    try std.testing.expect(getLength() == 1);
    try std.testing.expect(getData(0) == 1);
    clearAll();
    try std.testing.expect(getLength() == 0);
    // try std.testing.expect(diff_list_get_data(0) == 0);
}

