const game = @import("game.zig");
export fn game_initGame() bool {
    return game.initGame();
}
const debug = @import("debug.zig");
const diff = @import("diff.zig");
export fn diff_getData(index: u16) u16 {
    return diff.getData(index);
}
export fn diff_getLength() u16 {
    return diff.getLength();
}
export fn diff_clearAll() void {
    return diff.clearAll();
}
const worlds = @import("worlds.zig");
export fn worlds_getData(world: u16, layer: u16, x: u16, y: u16) u16 {
    return worlds.getData(world, layer, x, y);
}
export fn worlds_getWidth(world: u16) u16 {
    return worlds.getWidth(world);
}
export fn worlds_getHeight(world: u16) u16 {
    return worlds.getHeight(world);
}
export fn worlds_currentGetData(layer: u16, x: u16, y: u16) u16 {
    return worlds.currentGetData(layer, x, y);
}
export fn worlds_currentGetWidth() u16 {
    return worlds.currentGetWidth();
}
export fn worlds_currentGetHeight() u16 {
    return worlds.currentGetHeight();
}
const entities = @import("entities.zig");
export fn entities_getImage(entity: u16) u16 {
    return entities.getImage(entity);
}
const renderer = @import("renderer.zig");
export fn renderer_getPositionX() u16 {
    return renderer.getPositionX();
}
const viewport = @import("viewport.zig");
export fn viewport_getData(x: u16, y: u16) u16 {
    return viewport.getData(x, y);
}
