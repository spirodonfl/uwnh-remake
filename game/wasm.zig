const debug = @import("debug.zig");
const diff = @import("diff.zig");
const worlds = @import("worlds.zig");
const entities = @import("entities.zig");
const renderer = @import("renderer.zig");
export fn renderer_getPositionX() u16 {
    return renderer.getPositionX();
}
const viewport = @import("viewport.zig");
export fn viewport_getData(x: u16, y: u16) u16 {
    return viewport.getData(x, y);
}
