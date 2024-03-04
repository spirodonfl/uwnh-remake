const std = @import("std");

const Actor = struct {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
    velocity_x: f32,
    velocity_y: f32,
    messages: std.ArrayList(Message),
    system: *ActorSystem, // Reference to the ActorSystem
    item: ?*Item, // Optional reference to an item

    fn init(allocator: *std.mem.Allocator, system: *ActorSystem) Actor {
        return Actor{
            .x = 0,
            .y = 0,
            .width = 50,
            .height = 50,
            .velocity_x = 0,
            .velocity_y = 0,
            .messages = std.ArrayList(Message).init(allocator),
            .system = system,
            .item = null, // Initially, the actor holds no item
        };
    }

    fn deinit(self: *Actor) void {
        self.messages.deinit();
    }

    fn move(self: *Actor) void {
        self.x += self.velocity_x;
        self.y += self.velocity_y;
    }

    fn collide(self: Actor, other: Actor) bool {
        return (self.x < other.x + other.width and
                self.x + self.width > other.x and
                self.y < other.y + other.height and
                self.y + self.height > other.y);
    }

    fn sendMessage(self: *Actor, target: *Actor, command: []const u8, value: f32) void {
        const message = Message{ .command = command, .value = value };
        target.messages.append(message) catch unreachable;
    }

    fn giveItem(self: *Actor, item: *Item) void {
        self.item = item;
    }
};

const Message = struct {
    command: []const u8,
    value: f32,
};

const Item = struct {
    name: []const u8,
    description: []const u8,
};

const GiveItemEvent = struct {
    actor: *Actor,
    item: *Item,
};

const Event = struct {
    actor: *Actor,
    type: []const u8,
    data: anytype,
};

const ActorSystem = struct {
    actors: std.ArrayList(Actor),
    events: std.ArrayList(Event),

    fn init() ActorSystem {
        return ActorSystem{
            .actors = std.ArrayList(Actor).init(std.heap.page_allocator),
            .events = std.ArrayList(Event).init(std.heap.page_allocator),
        };
    }

    fn addActor(self: *ActorSystem, actor: Actor) void {
        self.actors.append(actor) catch unreachable;
    }

    fn emitEvent(self: *ActorSystem, actor: *Actor, eventType: []const u8, data: anytype) void {
        const event = Event{ .actor = actor, .type = eventType, .data = data };
        self.events.append(event) catch unreachable;
    }

    fn processMessages(self: *ActorSystem) void {
        for (self.actors.items) |*actor| {
            while (actor.messages.len > 0) {
                const message = actor.messages.pop();
                var new_x = actor.x;
                var new_y = actor.y;

                if (std.mem.eql(u8, message.command, "move_up")) {
                    new_y -= message.value;
                } else if (std.mem.eql(u8, message.command, "move_down")) {
                    new_y += message.value;
                } else if (std.mem.eql(u8, message.command, "move_left")) {
                    new_x -= message.value;
                } else if (std.mem.eql(u8, message.command, "move_right")) {
                    new_x += message.value;
                } else if (std.mem.eql(u8, message.command, "give_item")) {
                    // Example: Give item using a message
                    // This assumes the message's value is the index of the item in a global items array
                    const itemIndex = @floatToInt(usize, message.value);
                    actor.giveItem(&globalItems[itemIndex]);
                }

                var collision = false;
                for (self.actors.items) |other| {
                    if (other == actor) continue;
                    if (actor.collide(other)) {
                        collision = true;
                        break;
                    }
                }

                if (!collision) {
                    actor.x = new_x;
                    actor.y = new_y;
                }
            }
        }
    }

    fn processEvents(self: *ActorSystem) void {
        while (self.events.len > 0) {
            const event = self.events.pop();
            if (std.mem.eql(u8, event.type, "give_item")) {
                // Example: Give item using an event
                const giveItemEvent = event.data;
                giveItemEvent.actor.giveItem(giveItemEvent.item);
            } else if (std.mem.eql(u8, event.type, "attack")) {
                // Handle attack event with range check
                const attackEvent = event.data;
                const attacker = attackEvent.actor;
                const target = attackEvent.target;
                const range = 5.0; // Attack range

                // Calculate the distance between the attacker and the target
                const dx = attacker.x - target.x;
                const dy = attacker.y - target.y;
                const distance = std.math.sqrt(dx * dx + dy * dy);

                // Check if the target is within the attack range
                if (distance <= range) {
                    // Attack logic here, e.g., reducing the target's health
                    std.debug.print("Attack successful\n", .{});
                } else {
                    std.debug.print("Attack failed: Target out of range\n", .{});
                }
            }
        }
    }
};

// Example global items array
var globalItems: [2]*Item = undefined;

pub fn main() !void {
    var actorSystem = ActorSystem.init();

    // Initialize global items
    globalItems[0] = &Item{ .name = "Sword", .description = "A sharp blade." };
    globalItems[1] = &Item{ .name = "Shield", .description = "A sturdy shield." };

    // Create actors
    var actor1 = Actor.init(std.heap.page_allocator, &actorSystem);
    var actor2 = Actor.init(std.heap.page_allocator, &actorSystem);

    // Add actors to the system
    actorSystem.addActor(actor1);
    actorSystem.addActor(actor2);

    // Example: actor1 sends a message to actor2
    actor1.sendMessage(&actor2, "move_right", 5.0);

    // Example: actor1 attacks actor2
    actorSystem.emitEvent(&actor1, "attack", .{ .target = &actor2, .damage = 10 });

    // Example: Give item using a message
    actor1.sendMessage(&actor1, "give_item", @intToFloat(f32, 0)); // Give the first item in the global items array

    // Example: Give item using an event
    var giveItemEvent = GiveItemEvent{ .actor = &actor2, .item = globalItems[1] };
    actorSystem.emitEvent(&giveItemEvent, "give_item", .{});

    // Game loop
    while (true) {
        // Process messages and check for collisions before moving
        actorSystem.processMessages();

        // Process events
        actorSystem.processEvents();

        // Move actors based on their velocities
        for (actorSystem.actors.items) |*actor| {
            actor.move();
        }

        // Update game state, e.g., draw actors, handle input
    }
}
