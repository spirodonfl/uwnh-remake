pub const panic = @import("game.zig").panic;
const debug = @import("debug.zig");
export fn debug_getData(index: u16) u16 {
    return debug.getData(index);
}
export fn debug_addData(value: u16) void {
    return debug.addData(value);
}
export fn debug_getLength() u16 {
    return debug.getLength();
}
export fn debug_clearAll() void {
    return debug.clearAll();
}
export fn debug_testPanic() void {
    return debug.testPanic();
}
export fn debug_testBreakpoint() void {
    return debug.testBreakpoint();
}
export fn debug_testTrap() void {
    return debug.testTrap();
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
const editor = @import("editor.zig");
export fn editor_createLayer(width: u16, height: u16, layer_type: u16) void {
    return editor.createLayer(width, height, layer_type);
}
export fn editor_attachLayerToWorld(world_index: u16, layer_index: u16) void {
    return editor.attachLayerToWorld(world_index, layer_index);
}
export fn editor_createWorld(width: u16, height: u16) void {
    return editor.createWorld(width, height);
}
export fn editor_totalWorlds() u16 {
    return editor.totalWorlds();
}
export fn editor_totalLayers() u16 {
    return editor.totalLayers();
}
export fn editor_totalEntities() u16 {
    return editor.totalEntities();
}
export fn editor_createEntity(entity_type: u16) void {
    return editor.createEntity(entity_type);
}
export fn editor_clearWorlds() void {
    return editor.clearWorlds();
}
export fn editor_clearEntities() void {
    return editor.clearEntities();
}
export fn editor_clearAll() void {
    return editor.clearAll();
}
export fn editor_modifyWorldData(world: u16, layer: u16, x: u16, y: u16, new_value: u16) void {
    return editor.modifyWorldData(world, layer, x, y, new_value);
}
export fn editor_resizeWorld(world: u16, width: u16, height: u16) void {
    return editor.resizeWorld(world, width, height);
}
export fn editor_addRowToWorld(world: u16) void {
    return editor.addRowToWorld(world);
}
export fn editor_addColumnToWorld(world: u16) void {
    return editor.addColumnToWorld(world);
}
const game = @import("game.zig");
pub const std_options = game.std_options;
export fn game_panic(