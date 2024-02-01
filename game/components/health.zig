pub const ComponentValues = enum(u16) {
    Health = 0,
};

pub const ComponentHealth = struct {
    default_value: u16,
    current_value: u16,
    pub fn incrementHealth(self: *ComponentHealth) void {
        self.current_value += 1;
    }
};

