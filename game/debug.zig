const std = @import("std");
const ArrayList = std.ArrayList;

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();
var debug = ArrayList(u16).init(allocator);

// @wasm
pub fn getData(index: u16) u16 {
    return debug.items[index];
}
// @wasm
pub fn addData(value: u16) void {
    debug.append(value) catch unreachable;
}
// @wasm
pub fn getLength() u16 {
    return @as(u16, @intCast(debug.items.len));
}
// @wasm
pub fn clearAll() void {
    debug.clearRetainingCapacity();
    _ = arena.reset(.retain_capacity);
}


// @wasm
pub fn testPanic() void {
    @panic("PANIC");
}
// @wasm
pub fn testBreakpoint() void {
    @breakpoint();
}
// @wasm
pub fn testTrap() void {
    @trap();
}
// try { _GAME.debug_testBreakpoint(); } catch (e) { console.log(e); }
// error message showing "unreachable"

// TESTS
test "test_debug_stuff" {
    debug = ArrayList(u16).init(allocator);
    debug.append(1) catch unreachable;
    try std.testing.expect(getLength() == 1);
    try std.testing.expect(getData(0) == 1);
    clearAll();
    try std.testing.expect(getLength() == 0);
}
