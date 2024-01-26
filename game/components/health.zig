pub const ComponentHealth = struct {
    default_value: u16,
    current_value: u16,
    pub fn init() ComponentHealth {
        // if no value initially entered
        // check entity array index of N to get default or current value
        return ComponentHealth{.default_value = 10, .current_value = 10};
    }
    pub fn addHealth(self: *ComponentHealth) void {
        self.current_value += 1;
    }
};
// Assign this to an entity


var default_value: u16 = 10;
var current_value: u16 = 10;

pub const ComponentValues = enum(u16) {
    Health = 0,
};
const std = @import("std");
// TODO: Use this somewhere more global when you are about to export an entity
fn getTotalComponentValuesEnum() u16 {
    var total: u16 = 0;
    inline for (@typeInfo(ComponentValues).Enum.fields) |f| {
        std.debug.print("{}\n", .{f.value});
        total += 1;
    }

    return total;
}

pub fn init() void {
    // ... pass an entity into the init as a param
    // attach and set values
    return [1]u16{
        current_value,
    };
}
pub fn setHealth(entity: u16, value: u16) void {
    _ = entity;
    _ = value;
    // ... Somehow you have to check that the entity has the component attached, every time you run this function or others
}
// pub fn decreaseHealth(entity ...) {
    // ... check that entity has the component
// }
