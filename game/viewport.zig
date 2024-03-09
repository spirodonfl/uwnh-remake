const std = @import("std");
const ArrayList = std.ArrayList;

const game = @import("game.zig");
const diff = @import("diff.zig");

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();
var size: [2]u16 = .{ 0, 0 };
var padding: [4]u16 = .{ 0, 0, 0, 0 };
var camera: [2]u16 = .{ 0, 0 };
var data = ArrayList(u16).init(allocator);
// @wasm
pub fn setSize(width: u16, height: u16) void {
    size[0] = width;
    size[1] = height;
}
// @wasm
pub fn setCamera(x: u16, y: u16) !void {
    camera[0] = x;
    camera[1] = y;
    try diff.addData(0);
}
// @wasm
pub fn getCameraX() u16 {
    return camera[0];
}
// @wasm
pub fn getCameraY() u16 {
    return camera[1];
}
// @wasm
pub fn moveCameraUp() !void {
    if (camera[1] > 0) {
        camera[1] -= 1;
        try diff.addData(0);
    }
}
// @wasm
pub fn moveCameraDown() !void {
    var height = game.worlds_list.at(game.current_world_index).getHeight();
    if (
        height > size[1]
        and (camera[1] + size[1]) < height
    ) {
        camera[1] += 1;
        try diff.addData(0);
    }
}
// @wasm
pub fn moveCameraLeft() !void {
    if (camera[0] > 0) {
        camera[0] -= 1;
        try diff.addData(0);
    }
}
// @wasm
pub fn moveCameraRight() !void {
    var width = game.worlds_list.at(game.current_world_index).getWidth();
    if (
        width > size[0]
        and (camera[0] + size[0]) < width
    ) {
        camera[0] += 1;
        try diff.addData(0);
    }
}
// @wasm
pub fn initializeViewportData() void {
    var total_size = size[0] * size[1];
    for (0..total_size) |i| {
        _ = i;
        data.append(0) catch unreachable;
    }
}
// @wasm
pub fn setData(x: u16, y: u16, value: u16) void {
    var index = y * size[0] + x;
    data.items[index] = value;
}
// @wasm
pub fn getData(x: u16, y: u16) u16 {
    var index = y * size[0] + x;
    return data.items[index];
}
// @wasm
pub fn getDataByIndex(index: u16) u16 {
    return data.items[index];
}
// @wasm
pub fn getSizeWidth() u16 {
    return size[0];
}
// @wasm
pub fn getSizeHeight() u16 {
    return size[1];
}
// @wasm
pub fn setPaddingTop(value: u16) void {
    padding[0] = value;
}
// @wasm
pub fn setPaddingBottom(value: u16) void {
    padding[1] = value;
}
// @wasm
pub fn setPaddingLeft(value: u16) void {
    padding[2] = value;
}
// @wasm
pub fn setPaddingRight(value: u16) void {
    padding[3] = value;
}
// @wasm
pub fn getPaddingTop() u16 {
    return padding[0];
}
// @wasm
pub fn getPaddingBottom() u16 {
    return padding[1];
}
// @wasm
pub fn getPaddingLeft() u16 {
    return padding[2];
}
// @wasm
pub fn getPaddingRight() u16 {
    return padding[3];
}

// Note: the following two functions return the cell x,y
// coordinates in the viewport such that you can map
// them against world data
// @wasm
pub fn getXFromIndex(index: u16) u16 {
    return index % size[0];
}
// @wasm
pub fn getYFromIndex(index: u16) u16 {
    return index / size[0];
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

