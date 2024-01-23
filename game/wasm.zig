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
