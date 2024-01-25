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
const game = @import("game.zig");
export fn game_loadWorld(index: u16) void {
    return game.loadWorld(index);
}
export fn game_getCurrentWorldIndex() u16 {
    return game.getCurrentWorldIndex();
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
export fn game_getWorldData(world: u16, layer: u16, x: u16, y: u16) u16 {
    return game.getWorldData(world, layer, x, y);
}
export fn game_getWorldSizeWidth(world: u16) u16 {
    return game.getWorldSizeWidth(world);
}
export fn game_getWorldSizeHeight(world: u16) u16 {
    return game.getWorldSizeHeight(world);
}
export fn game_getWorldAtViewport(layer: u16, x: u16, y: u16) u16 {
    return game.getWorldAtViewport(layer, x, y);
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
export fn viewport_setSize(width: u16, height: u16) void {
    return viewport.setSize(width, height);
}
export fn viewport_getSizeWidth() u16 {
    return viewport.getSizeWidth();
}
export fn viewport_getSizeHeight() u16 {
    return viewport.getSizeHeight();
}
export fn viewport_setPaddingTop(value: u16) void {
    return viewport.setPaddingTop(value);
}
export fn viewport_setPaddingBottom(value: u16) void {
    return viewport.setPaddingBottom(value);
}
export fn viewport_setPaddingLeft(value: u16) void {
    return viewport.setPaddingLeft(value);
}
export fn viewport_setPaddingRight(value: u16) void {
    return viewport.setPaddingRight(value);
}
export fn viewport_getPaddingTop() u16 {
    return viewport.getPaddingTop();
}
export fn viewport_getPaddingBottom() u16 {
    return viewport.getPaddingBottom();
}
export fn viewport_getPaddingLeft() u16 {
    return viewport.getPaddingLeft();
}
export fn viewport_getPaddingRight() u16 {
    return viewport.getPaddingRight();
}
export fn viewport_getXFromIndex(index: u16) u16 {
    return viewport.getXFromIndex(index);
}
export fn viewport_getYFromIndex(index: u16) u16 {
    return viewport.getYFromIndex(index);
}
export fn viewport_getLength() u16 {
    return viewport.getLength();
}
export fn viewport_clear() void {
    return viewport.clear();
}
