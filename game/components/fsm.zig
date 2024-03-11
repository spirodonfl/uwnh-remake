const std = @import("std");

// Define a generic FSM mixin function
fn FsmMixin(comptime StateType: type, comptime EventType: type) type {
    return struct {
        state: StateType,

        pub fn init(self: *@This(), initial_state: StateType) void {
            self.state = initial_state;
        }

        pub fn transition(self: *@This(), new_state: StateType) void {
            self.state = new_state;
        }

        pub fn handle(self: *@This(), event: EventType) void {
            // Implementation of state transition logic
            // This will need to be customized for each struct
        }
    };
}

// Define specific states and events for different structs
const TrafficLightState = enum {
    Red,
    Yellow,
    Green,
};

const TrafficLightEvent = enum {
    Timeout,
    PedestrianWaiting,
};

const DoorState = enum {
    Open,
    Closing,
    Closed,
};

const DoorEvent = enum {
    OpenRequest,
    CloseRequest,
};

// Example structs using the FSM mixin with different states and events
const TrafficLight = struct {
    // You could import like this
    // const FsmMixin = @import("fsm_mixin.zig").FsmMixin;
    usingnamespace FsmMixin(TrafficLightState, TrafficLightEvent);
    // Additional fields and methods specific to TrafficLight
};

const Door = struct {
    // You could import like this
    // const FsmMixin = @import("fsm_mixin.zig").FsmMixin;
    usingnamespace FsmMixin(DoorState, DoorEvent);
    // Additional fields and methods specific to Door
};

// Example usage
pub fn main() void {
    var trafficLight = TrafficLight{};
    trafficLight.init(.Red);
    trafficLight.handle(.Timeout);
    std.debug.print("Traffic light state: {}\n", .{trafficLight.state});

    var door = Door{};
    door.init(.Open);
    door.handle(.CloseRequest);
    std.debug.print("Door state: {}\n", .{door.state});
}

