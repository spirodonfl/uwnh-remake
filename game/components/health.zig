const game = @import("../game.zig");

// TODO: Add an FSM
pub const ComponentHealth = struct {
    default_value: u16,
    current_value: u16,
    parent: *game.EntityDataStruct,
    pub fn incrementHealth(self: *ComponentHealth) void {
        if (self.current_value < self.default_value) {
            self.current_value += 1;
        }
    }
    pub fn decrementHealth(self: *ComponentHealth) void {
        if (self.current_value > 0) {
            self.current_value -= 1;
        }
    }
    pub fn setHealth(self: *ComponentHealth, value: u16) void {
        self.current_value = value;
    }
    // Method to create a new instance of ComponentHealth
    pub fn createNew(default_value: u16) !*ComponentHealth {
        var newInstance = try game.allocator.create(ComponentHealth);
        newInstance.* = ComponentHealth{
            .default_value = default_value,
            .current_value = default_value,
        };
        return newInstance;
    }
};
