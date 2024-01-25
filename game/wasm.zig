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
const game = @import("game.zig");
export fn game_loadWorld(index: u16) void {
    return game.loadWorld(index);
}
export fn game_getEntityById(id: u16) u16 {
    return game.getEntityById(id);
}
export fn game_readFromEmbeddedFile(file_index: usize, index: u16, mode: u16) u16 {
    return game.readFromEmbeddedFile(file_index, index, mode);
}
export fn game_initializeGame() void {
    return game.initializeGame();
}
export fn game_getWorld(world: u16, layer: u16, x: u16, y: u16) u16 {
    return game.getWorld(world, layer, x, y);
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
