pub const ComponentValues = enum(u16) {
    Health = 0,
};

pub const ComponentHealth = struct {
    default_value: u16,
    current_value: u16,
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
};

