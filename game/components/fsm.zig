const std = @import("std");

// Define a generic FSM mixin function
pub fn FsmMixin(comptime StateType: type) type {
    return struct {
        state: StateType,

        pub fn init(self: *@This(), initial_state: StateType) void {
            self.state = initial_state;
        }

        // TODO: rvice brought up a good point, sometimes you want to have current_state = to && previous_status = from
        // but also sometimes flipped (previous_state = to && current_state = from)
        pub fn transition(self: *@This(), new_state: StateType) void {
            self.state = new_state;
        }

        // pub fn handle(self: *@This(), event: EventType) void {
        //     _ = self;
        //     _ = event;
        //     // Implementation of state transition logic
        //     // This will need to be customized for each struct
        // }
    };
}

// NOTE: This version of fsm mixin is borked because (a) having a handle
// function here creates an ambiguous reference to any override functions
// and (b) the EventType: type (second parameter) of the main function
// is not used which Zig freaks out about
pub fn FsmMixin_BORKED(comptime StateType: type, comptime EventType: type) type {
    return struct {
        state: StateType,

        pub fn init(self: *@This(), initial_state: StateType) void {
            self.state = initial_state;
        }

        // TODO: rvice brought up a good point, sometimes you want to have current_state = to && previous_status = from
        // but also sometimes flipped (previous_state = to && current_state = from)
        pub fn transition(self: *@This(), new_state: StateType) void {
            self.state = new_state;
        }

        pub fn handle(self: *@This(), event: EventType) void {
            _ = self;
            _ = event;
            // Implementation of state transition logic
            // This will need to be customized for each struct
        }
    };
}

// // Define specific states and events for different structs
// const TrafficLightState = enum {
//     Red,
//     Yellow,
//     Green,
// };

// const TrafficLightEvent = enum {
//     Timeout,
//     PedestrianWaiting,
// };

// const DoorState = enum {
//     Open,
//     Closing,
//     Closed,
// };

// const DoorEvent = enum {
//     OpenRequest,
//     CloseRequest,
// };

// // Example structs using the FSM mixin with different states and events
// const TrafficLight = struct {
//     // You could import like this
//     // const FsmMixin = @import("fsm_mixin.zig").FsmMixin;
//     usingnamespace FsmMixin(TrafficLightState, TrafficLightEvent);
//     // Additional fields and methods specific to TrafficLight

//     // Overriding the handle method to implement the state transition logic
//     pub fn handle(self: *@This(), event: TrafficLightEvent) void {
//         switch (event) {
//             TrafficLightEvent.Timeout => {
//                 switch (self.state) {
//                     TrafficLightState.Red => self.transition(.Green),
//                     TrafficLightState.Yellow => self.transition(.Red),
//                     TrafficLightState.Green => self.transition(.Yellow),
//                 }
//             },
//             TrafficLightEvent.PedestrianWaiting => {
//                 switch (self.state) {
//                     TrafficLightState.Red => self.transition(.Green),
//                     TrafficLightState.Yellow => self.transition(.Red),
//                     TrafficLightState.Green => self.transition(.Yellow),
//                 }
//             },
//         }

//         // Note: keeping this as a reference for now on an alternative way to deal with state transitions
//         // switch (self.state) {
//         //     .Red => {
//         //         switch (event) {
//         //             .Timeout => self.transition(.Green),
//         //             TrafficLightEvent.PedestrianWaiting => self.transition(.Green),
//         //             else => {},
//         //         }
//         //     },
//         //     else => {},
//         // }
//     }
// };

// const Door = struct {
//     usingnamespace FsmMixin(DoorState, DoorEvent);
//     // Additional fields and methods specific to Door
// };

// // Example usage
// pub fn main() void {
//     var trafficLight = TrafficLight{};
//     trafficLight.init(.Red);
//     trafficLight.handle(.Timeout);
//     std.debug.print("Traffic light state: {}\n", .{trafficLight.state});

//     var door = Door{};
//     door.init(.Open);
//     door.handle(.CloseRequest);
//     std.debug.print("Door state: {}\n", .{door.state});
// }

// const Event = struct {
//     transitions: ?[]const i16,
// };

// const StateMachine = struct {
//     currentState: i16,
//     events: []Event,
//     states: []i16,
//     events_transitions: []?[]const i16,

//     // Initialize with empty arrays
//     pub fn init() StateMachine {
//         return .{
//             .currentState = 0, // Assuming 0 is the initial state
//             .events = &[_]Event{},
//             .states = &[_]i16{},
//             .events_transitions = &[_]?[]const i16{},
//         };
//     }

//     // Method to handle an event and determine the next state
//     pub fn handleEvent(self: *StateMachine, eventIndex: usize) !void {
//         const transitions = self.events_transitions[eventIndex] orelse return error.NoTransitionsForEvent;
//         for (transitions) |transition| {
//             if (transition[0] == self.currentState) {
//                 self.currentState = transition[1];
//                 return;
//             }
//         }
//         return error.InvalidTransition;
//     }

//     // Add an event with null transitions
//     pub fn addEvent(self: *StateMachine) void {
//         self.events.append(.{ .transitions = null }) catch unreachable;
//         self.events_transitions.append(null) catch unreachable;
//     }

//     // Add a state
//     pub fn addState(self: *StateMachine, state: i16) void {
//         self.states.append(state) catch unreachable;
//     }

//     // Add a transition to an event
//     pub fn addTransition(self: *StateMachine, eventIndex: usize, fromState: i16, toState: i16) void {
//         if (self.events_transitions[eventIndex] == null) {
//             self.events_transitions[eventIndex] = &[_]i16{};
//         }
//         self.events_transitions[eventIndex].?.append(fromState) catch unreachable;
//         self.events_transitions[eventIndex].?.append(toState) catch unreachable;
//     }

//     // Serialize to binary and write the memory location and length to provided pointers
//     pub fn serializeToBinary(self: *StateMachine, pointer: *u32, length: *u32) !void {
//         var buffer = std.ArrayList(u8).init(std.heap.page_allocator);
//         defer buffer.deinit();

//         // Serialize the state machine
//         try buffer.appendSlice(&std.mem.toBytes(u16, @intCast(u16, self.events.len)));
//         try buffer.appendSlice(&std.mem.toBytes(u16, @intCast(u16, self.states.len)));

//         // Serialize each event and its transitions
//         for (self.events) |event| {
//             if (event.transitions) |transitions| {
//                 try buffer.appendSlice(&std.mem.toBytes(u16, @intCast(u16, transitions.len)));
//                 for (transitions) |transition| {
//                     try buffer.appendSlice(&std.mem.toBytes(i16, transition));
//                 }
//             } else {
//                 try buffer.appendSlice(&std.mem.toBytes(u16, 0));
//             }
//         }

//         // Serialize each state
//         for (self.states) |state| {
//             try buffer.appendSlice(&std.mem.toBytes(i16, state));
//         }

//         // Allocate memory for the serialized data
//         const slice = std.heap.page_allocator.alloc(u8, buffer.items.len) catch @panic("failed to allocate memory");
//         std.mem.copy(u8, slice, buffer.items);

//         // Write the memory location and length to the provided pointers
//         pointer.* = @ptrToInt(slice.ptr);
//         length.* = @intCast(u32, buffer.items.len);
//     }
// };

// // Example usage
// pub fn main() !void {
//     var stateMachine = StateMachine.init();
//     // Deserialize binary data into the stateMachine
//     // Call handleEvent with the index of the event you want to process
//     try stateMachine.handleEvent(0); // Example: handle the first event
// }
