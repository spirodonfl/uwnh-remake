pub const game = @import("game.zig");
pub const diff = @import("diff.zig");
pub const editor = @import("editor.zig");
pub const viewport = @import("viewport.zig");
pub const messages = @import("messages.zig");
pub const events = @import("events.zig");
pub const enumgetters = @import("enumgetters.zig");

comptime {
    _ = @import("wasmexports");
}
pub const std_options = game.std_options;
pub const panic = game.panic;
