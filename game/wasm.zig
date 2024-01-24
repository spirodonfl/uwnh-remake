const game = @import("game.zig");
export fn game_loadWorld(index: u16) void {
    return game.loadWorld(index);
}
export fn game_initializeGame() void {
    return game.initializeGame();
}
export fn game_getWorld(world: u16, layer: u16, x: u16, y: u16) u16 {
    return game.getWorld(world, layer, x, y);
}
const debug = @import("debug.zig");
export fn debug_getData(index: u16) u16 {
    return debug.getData(index);
}
export fn debug_getLength() u16 {
    return debug.getLength();
}
export fn debug_clearAll() void {
    return debug.clearAll();
}
const diff = @import("diff.zig");
export fn diff_getData(index: u16) u16 {
    return diff.getData(index);
}
export fn diff_getLength() u16 {
    return diff.getLength();
}
export fn diff_addData(data: u16) void {
    return diff.addData(data);
}
export fn diff_clearAll() void {
    return diff.clearAll();
}
const renderer = @import("renderer.zig");
export fn renderer_getPositionX() u16 {
    return renderer.getPositionX();
}
export fn renderer_getPositionY() u16 {
    return renderer.getPositionY();
}
export fn renderer_setPosition(x: u16, y: u16) void {
    return renderer.setPosition(x, y);
}
const viewport = @import("viewport.zig");
export fn viewport_getDataIndex(index: u16) u16 {
    return viewport.getDataIndex(index);
}
export fn viewport_setDataIndex(index: u16, value: u16) void {
    return viewport.setDataIndex(index, value);
}
export fn viewport_getData(x: u16, y: u16) u16 {
    return viewport.getData(x, y);
}
export fn viewport_setData(x: u16, y: u16, value: u16) void {
    return viewport.setData(x, y, value);
}
export fn viewport_getLength() u16 {
    return viewport.getLength();
}
export fn viewport_clear() void {
    return viewport.clear();
}
