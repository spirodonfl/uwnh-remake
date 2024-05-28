const std = @import("std");

const game = @import("game.zig");
const enums = @import("enums.zig");

const EmbeddedDataStruct = @import("embedded.zig").EmbeddedDataStruct;
const ServiceEntityData = game.ServiceEntityData;
const GameMessage = game.GameMessage;
const ServiceHandle = @import("services.zig").ServiceHandle;
const ComponentHealth = @import("components/health.zig").ComponentHealth;
const ComponentMovement = @import("components/movement.zig").ComponentMovement;
const ComponentAttack = @import("components/attack.zig").ComponentAttack;

const diff = @import("diff.zig");

// const FsmMixin = @import("components/fsm_mixin.zig").FsmMixin;
// TODO: Should probably rename these structs, they've become more than just structs
// TODO: Add an entity FSM
pub const EntityDataStruct = struct {
    // usingnamespace FsmMixin(TrafficLightState, TrafficLightEvent);
    messages: std.ArrayListUnmanaged(GameMessage) = .{},
    embedded: EmbeddedDataStruct = undefined,
    health: ServiceHandle = undefined,
    movement: ServiceHandle = undefined,
    attack: ServiceHandle = undefined,
    components: std.ArrayListUnmanaged(ServiceHandle) = .{},
    is_collision: bool = false,
    direction: u16 = enums.DirectionsEnum.Left.int(),
    // TODO: Move this to movement component?
    position: [2]u16 = .{ 0, 0 },
    pub fn init(self: *EntityDataStruct) !void {
        //std.log.info("EntityDataStruct loadComponents", .{});
        try self.loadComponents();
    }
    pub fn getPositionX(self: *EntityDataStruct) u16 {
        return self.position[0];
    }
    pub fn getPositionY(self: *EntityDataStruct) u16 {
        return self.position[1];
    }
    // TODO: Wait... do these setPosition functions not contradict the ComponentMove stuff?
    pub fn setPositionX(self: *EntityDataStruct, value: u16) void {
        self.position[0] = value;
    }
    pub fn setPositionY(self: *EntityDataStruct, value: u16) void {
        self.position[1] = value;
    }
    pub fn addMessage(self: *EntityDataStruct, message: GameMessage) !void {
        try self.messages.append(game.allocator, message);
    }
    pub fn isCollision(self: *EntityDataStruct) bool {
        // std.log.info("isCollision {d} {d}", .{self.getId(), self.is_collision});
        return self.is_collision;
        // if (self.embedded.readData(enums.EntityDataEnum.IsCollision.int(), .Little) == 1) {
        //     return true;
        // }
        // return false;
    }
    pub fn getType(self: *EntityDataStruct) u16 {
        return self.embedded.readData(enums.EntityDataEnum.Type.int(), .Little);
    }
    pub fn setEmbedded(self: *EntityDataStruct, embedded: EmbeddedDataStruct) void {
        self.embedded = embedded;
    }
    pub fn getId(self: *EntityDataStruct) u16 {
        return self.embedded.readData(enums.EntityDataEnum.ID.int(), .Little);
    }
    pub fn loadComponents(self: *EntityDataStruct) !void {
        // I guess "is collision" is kinda a component of sorts
        if (self.embedded.readData(enums.EntityDataEnum.IsCollision.int(), .Little) == 1) {
            self.is_collision = true;
        }
        if (self.embedded.readData(enums.EntityDataEnum.ComponentHealth.int(), .Little) == 1) {
            // std.log.info("health component found", .{});
            // TODO: Remove these hard component injections
            self.health = try game.sComponentHealth.addData(ComponentHealth{
                .parent = self,
                // TODO: Do we even need this anymore?
                .default_value = 10,
                .current_value = self.embedded.readData(enums.EntityDataEnum.ComponentHealthDefaultValue.int(), .Little),
            });
            game.sComponentHealth.incrementReference(&self.health);
            try self.components.append(game.allocator, self.health);
        }
        if (self.embedded.readData(enums.EntityDataEnum.ComponentMovement.int(), .Little) == 1) {
            // std.log.info("movement component found", .{});
            self.movement = try game.sComponentMovement.addData(ComponentMovement{ .parent = self, .entity_id = self.getId() });
            game.sComponentMovement.incrementReference(&self.movement);
            try self.components.append(game.allocator, self.movement);
        }
        if (self.embedded.readData(enums.EntityDataEnum.ComponentAttack.int(), .Little) == 1) {
            // std.log.info("attack component found (entity id: {d})", .{self.getId()});
            // TODO: This is special code. Remove it and make it better / dynamic as part of entity binary data
            if (self.getType() == enums.EntityTypesEnum.Kraken.int()) {
                self.attack = try game.sComponentAttack.addData(ComponentAttack{
                    .parent = self,
                    .entity_id = self.getId(),
                    .default_damage = 3,
                });
            } else {
                self.attack = try game.sComponentAttack.addData(ComponentAttack{
                    .parent = self,
                    .entity_id = self.getId(),
                    .default_damage = 1,
                });
            }
            game.sComponentAttack.incrementReference(&self.attack);
            try self.components.append(game.allocator, self.attack);
        }
    }
    pub fn processMessages(self: *EntityDataStruct) !void {
        while (self.messages.items.len > 0) {
            var message = self.messages.pop();
            switch (message.command) {
                enums.GameMessagesEventsEnum.MoveUp.int() => {
                    // TODO: check if entity has the move component (not undefined ?)
                    var mh = try game.sComponentMovement.getData(&self.movement);

                    try mh.handle(enums.ComponentMovementEvent.MoveUp);
                },
                enums.GameMessagesEventsEnum.MoveDown.int() => {
                    // TODO: check if entity has the move component (not undefined ?)
                    var mh = try game.sComponentMovement.getData(&self.movement);

                    try mh.handle(enums.ComponentMovementEvent.MoveDown);
                },
                enums.GameMessagesEventsEnum.MoveLeft.int() => {
                    // TODO: check if entity has the move component (not undefined ?)
                    var mh = try game.sComponentMovement.getData(&self.movement);

                    try mh.handle(enums.ComponentMovementEvent.MoveLeft);
                },
                enums.GameMessagesEventsEnum.MoveRight.int() => {
                    // TODO: check if entity has the move component (not undefined ?)
                    var mh = try game.sComponentMovement.getData(&self.movement);

                    try mh.handle(enums.ComponentMovementEvent.MoveRight);
                },
                enums.GameMessagesEventsEnum.Attack.int() => {
                    // TODO: Check if entity has the attack component
                    // if (message.data.items.len == 1) {
                    //     try self.attack.attack(message.data.items[0]);
                    // } else {
                    //     std.log.info("Attack message missing target", .{});
                    // }
                    var ah = try game.sComponentAttack.getData(&self.attack);
                    if (self.getType() <= 3) {
                        try ah.directionalAttack();
                    } else {
                        // TODO: This is for the kraken. Hacky. FIX
                        try ah.attack();
                    }
                },
                else => {
                    std.log.info("Unknown message command: {d}", .{message.command});
                },
            }
        }
    }
};
