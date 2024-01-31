pub const game = @import("game.zig");
pub const debug = @import("debug.zig");
pub const diff = @import("diff.zig");
pub const editor = @import("editor.zig");
pub const renderer = @import("renderer.zig");
pub const viewport = @import("viewport.zig");
pub const inputs = @import("inputs.zig");

comptime {
    _ = @import("wasmexports");
}
pub const std_options = game.std_options;
pub const panic = game.panic;
