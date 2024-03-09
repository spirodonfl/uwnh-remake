// Note: make sure to remain on ZIG 0.11.0

// TODO: Scripts
// Outer array is script line
// Inner array is command for line (need to create legend for inner array commands)
// if [0] = 0 = moveEntity
// -- [1] = entityIndex
// -- [2] = direction (0 = left, 1 = right, 2 = up, 3 = down) (EXAMPLE)
// script: [2][3]u8 = .{ .{ 0, 0, 0 }, .{ 0, 0, 0 } };
// runScript(scriptIndex: u8)

const std = @import("std");
const ArrayList = std.ArrayList;

pub var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
pub var allocator = gpa_allocator.allocator();
pub var entities_list = std.SegmentedList(EntityDataStruct, 32){};
pub var worlds_list = std.SegmentedList(WorldDataStruct, 32){};
pub var current_world_index: u16 = 0;
var GAME_INITIALIZED: bool = false;
pub var events_list = std.ArrayListUnmanaged(GameEvent){};

const enums = @import("enums.zig");
const embeds = @import("embeds.zig");
const helpers = @import("helpers.zig");
const renderer = @import("renderer.zig");
const diff = @import("diff.zig");
const editor = @import("editor.zig");
const viewport = @import("viewport.zig");
const events = @import("events.zig");

// -----------------------------------------------------------------------------------------
// @wasm
pub const std_options = struct {
    pub const log_level = .info;
    pub fn logFn(
        comptime level: std.log.Level,
        comptime scope: @Type(.EnumLiteral),
        comptime format: []const u8,
        args: anytype,
    ) void {
        const prefix = if (scope == .default) ": " else "(" ++ @tagName(scope) ++ "): ";
        log(level.asText() ++ prefix ++ format, args);
    }
};

fn log(comptime format: []const u8, args: anytype) void {
    const writer = std.io.Writer(void, error{}, console_log_write_zig){ .context = {} };
    writer.print(format, args) catch @panic("console_log_write failed");
    console_log_flush();
}

pub fn panic(
    msg: []const u8,
    trace: ?*std.builtin.StackTrace,
    ret_addr: ?usize,
) noreturn {
    log("panic: {s}", .{msg});
    if (trace) |t| {
        log("ErrorTrace:", .{});
        std.debug.dumpStackTrace(t.*);
    } else {
        log("ErrorTrace: <none>", .{});
    }
    log("StackTrace:", .{});
    std.debug.dumpCurrentStackTrace(ret_addr);
    while (true) {
        @breakpoint();
    }
}

pub fn uncaughtError(err: anytype) noreturn {
    log("uncaught error: {s}", .{@errorName(err)});
    if (@errorReturnTrace()) |t| {
        log("ErrorTrace:", .{});
        std.debug.dumpStackTrace(t.*);
    } else {
        log("ErrorTrace: <none>", .{});
    }
    while (true) {
        @breakpoint();
    }
}

fn console_log_write_zig(context: void, bytes: []const u8) !usize {
    _ = context;
    console_log_write(bytes.ptr, bytes.len);
    return bytes.len;
}
extern fn console_log_write(ptr: [*]const u8, len: usize) void;
extern fn console_log_flush() void;

// -----------------------------------------------------------------------------------------
pub const GameMessage = struct {
    command: u16,
    data: std.ArrayListUnmanaged(u16) = .{},
    force: bool,
};
pub const GameEvent = struct {
    type: u16,
    data: std.ArrayListUnmanaged(u16) = .{},
    force: bool,
};

pub const WorldDataStruct = struct {
    embedded_data: EmbeddedDataStruct = undefined,
    embedded_layers: std.ArrayListUnmanaged(EmbeddedDataStruct) = .{},
    entities_list: std.ArrayListUnmanaged(u16) = .{},
    entities_initialized: bool = false,
    pub fn getTotalLayers(self: *WorldDataStruct) usize {
        return self.embedded_layers.items.len;
    }
    pub fn getCollisionLayer(self: *WorldDataStruct) u16 {
        return self.readData(enums.WorldDataEnum.CollisionLayer.int());
    }
    pub fn getEntityLayer(self: *WorldDataStruct) u16 {
        return self.readData(enums.WorldDataEnum.EntityLayer.int());
    }
    pub fn setTotalLayers(self: *WorldDataStruct, total_layers: u16) !void {
        if (self.embedded_data.raw_data.items.len == 0) {
            try self.embedded_data.readToRawData();
        }
        self.embedded_data.raw_data.items[enums.WorldDataEnum.TotalLayers.int()] = total_layers;
    }
    pub fn setEntityLayer(self: *WorldDataStruct, entity_layer: u16) !void {
        if (self.embedded_data.raw_data.items.len == 0) {
            try self.embedded_data.readToRawData();
        }
        self.embedded_data.raw_data.items[enums.WorldDataEnum.EntityLayer.int()] = entity_layer;
    }
    pub fn setCollisionLayer(self: *WorldDataStruct, collision_layer: u16) !void {
        if (self.embedded_data.raw_data.items.len == 0) {
            try self.embedded_data.readToRawData();
        }
        self.embedded_data.raw_data.items[enums.WorldDataEnum.CollisionLayer.int()] = collision_layer;
    }
    pub fn setEmbeddedData(self: *WorldDataStruct, embedded: EmbeddedDataStruct) void {
        self.embedded_data = embedded;
    }
    pub fn addEmbeddedLayer(self: *WorldDataStruct, embedded: EmbeddedDataStruct) !void {
        try self.embedded_layers.append(allocator, embedded);
    }
    pub fn readData(self: *WorldDataStruct, index: u16) u16 {
        return self.embedded_data.readData(index, .Little);
    }
    pub fn readLayer(self: *WorldDataStruct, layer_index: u16, index: u16) u16 {
        return self.embedded_layers.items[layer_index].readData(index, .Little);
    }
    pub fn getWidth(self: *WorldDataStruct) u16 {
        const enum_index = enums.WorldDataEnum.Width.int();
        const width = self.readData(enum_index);
        // std.log.info("width {d}",.{width});
        return width;
    }
    pub fn getHeight(self: *WorldDataStruct) u16 {
        const enum_index = enums.WorldDataEnum.Height.int();
        const height = self.readData(enum_index);
        // std.log.info("height {d}",.{height});
        return height;
    }
    pub fn getSize(self: *WorldDataStruct) u16 {
        const size = self.getWidth() * self.getHeight();
        // std.log.info("size {d}",.{size});
        return size;
    }
    pub fn getCoordinateData(self: *WorldDataStruct, layer: u16, x: u16, y: u16) u16 {
        var entity_layer = self.readData(enums.WorldDataEnum.EntityLayer.int());
        if (layer == entity_layer) {
            if (self.entities_initialized == false) {
                var index: u16 = (y * self.getWidth()) + x;
                const data = self.readLayer(layer, index);
                return data;
            } else {
                for (0..self.entities_list.items.len) |i| {
                    var entity_id = self.entities_list.items[i];
                    for (0..entities_list.len) |j| {
                        if (entities_list.at(j).getId() == entity_id) {
                            if (entities_list.at(j).position[0] == x and entities_list.at(j).position[1] == y) {
                                return entity_id;
                            }
                        }
                    }
                }
            }
        } else {
            var index: u16 = (y * self.getWidth()) + x;
            const data = self.readLayer(layer, index);
            return data;
        }
        return 0;
    }
    pub fn checkEntityCollision(self: *WorldDataStruct, x: u16, y: u16) bool {
        for (0..self.entities_list.items.len) |i| {
            var entity_id = self.entities_list.items[i];
            for (0..entities_list.len) |j| {
                if (entities_list.at(j).getId() == entity_id) {
                    if (entities_list.at(j).position[0] == x and entities_list.at(j).position[1] == y) {
                        if (entities_list.at(j).isCollision() == true) {
                            return true;
                        }
                    }
                }
            }
        }
        // TODO: Check collision layer too
        if (self.getCoordinateData(self.readData(enums.WorldDataEnum.CollisionLayer.int()), x, y) > 0) {
            return true;
        }
        return false;
    }
    pub fn initializeEntities(self: *WorldDataStruct) !void {
        if (self.entities_initialized == false) {
            var entity_layer = self.readData(enums.WorldDataEnum.EntityLayer.int());
            var w = self.getWidth();
            var h = self.getHeight();
            var size = w * h;
            for (0..size) |i| {
                var x: u16 = @as(u16, @intCast(i % w));
                var y: u16 = @as(u16, @intCast(i / w));
                var value = self.getCoordinateData(entity_layer, x, y);
                if (value > 0) {
                    try self.entities_list.append(allocator, value);
                    for (0..entities_list.len) |j| {
                        if (entities_list.at(j).getId() == value) {
                            entities_list.at(j).position[0] = x;
                            entities_list.at(j).position[1] = y;
                        }
                    }
                    // var entity = entities_list.at(self.entities_list.items.len - 1);
                    // entity.position[0] = x;
                    // entity.position[1] = y;
                }
            }
        }
        self.entities_initialized = true;
    }
    pub fn addEntity(self: *WorldDataStruct, entity_id: u16, position_x: u16, position_y: u16) !void {
        var exists: bool = false;
        for (0..self.entities_list.items.len) |i| {
            if (self.entities_list.items[i] == entity_id) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            try self.entities_list.append(allocator, entity_id);
            for (0..entities_list.len) |i| {
                if (entities_list.at(i).getId() == entity_id) {
                    entities_list.at(i).position[0] = position_x;
                    entities_list.at(i).position[1] = position_y;
                    return;
                }
            }
        }
    }
    pub fn removeEntity(self: *WorldDataStruct, entity_id: u16) !void {
        for (0..self.entities_list.len) |i| {
            if (self.entities_list.items[i] == entity_id) {
                try self.entities_list.remove(i);
                for (0..entities_list.len) |j| {
                    if (entities_list.at(j).getId() == entity_id) {
                        entities_list.at(j).position[0] = 0;
                        entities_list.at(j).position[1] = 0;
                        return;
                    }
                }
            }
        }
    }
};

// TODO: Rename this eventually because it's grown past just embedded data
pub const EmbeddedDataStruct = struct {
    file_index: u16 = undefined,
    // Note: we have raw_data so we can either load raw_data from the embed
    // or so we can create structs without having to use an embed at all and
    // we retain compliance with other structs that required the use of embeddeddatastruct
    raw_data: std.ArrayListUnmanaged(u16) = .{},
    // TODO: How do we deal with optional parameters like layer here?
    pub fn findIndexByFileName(self: *EmbeddedDataStruct, data_type: enums.EmbeddedDataType, index: u16, layer: u16) !bool {
        var buf: [256]u8 = undefined;
        // TODO: Can we do better than (layer - 1)
        const file_name = switch (data_type) {
            .world => try std.fmt.bufPrint(&buf, "world_{d}_data.bin", .{index}),
            .entity => try std.fmt.bufPrint(&buf, "entity_{d}.bin", .{index}),
            .world_layer => try std.fmt.bufPrint(&buf, "world_{d}_layer_{d}.bin", .{ index, (layer - 1) }),
        };

        for (embeds.file_names, 0..) |name, i| {
            if (std.mem.eql(u8, name, file_name)) {
                self.file_index = @intCast(i);
                return true;
            }
        }
        return false;
    }
    pub fn getLength(self: *EmbeddedDataStruct) u16 {
        if (self.raw_data.items.len > 0) {
            return @as(u16, @intCast(self.raw_data.items.len));
        }
        return @as(u16, @intCast(embeds.embeds[self.file_index].len));
    }
    pub fn firstMemoryLocation(self: *EmbeddedDataStruct) !*u16 {
        if (self.raw_data.items.len == 0) {
            try self.readToRawData();
        }
        return &self.raw_data.items[0];
    }
    pub fn readData(self: *EmbeddedDataStruct, index: u16, endian: std.builtin.Endian) u16 {
        // std.log.info("readData({})", .{index});
        if (self.raw_data.items.len > 0) {
            return self.raw_data.items[index];
        }
        const filebytes = embeds.embeds[self.file_index];
        const pulled_value = std.mem.readInt(u16, filebytes[index * 2 ..][0..2], endian);
        return pulled_value;
    }
    pub fn readToRawData(self: *EmbeddedDataStruct) !void {
        if (self.raw_data.items.len == 0) {
            var length: u16 = @as(u16, @intCast(embeds.embeds[self.file_index].len));
            length = length / 2;
            try self.raw_data.resize(allocator, length);
            for (0..length) |i| {
                var i_converted = @as(u16, @intCast(i));
                // TODO: Cannot use self.readData because, as you fill this up, you trigger raw_data.items.len > 0 and it fails
                const filebytes = embeds.embeds[self.file_index];
                const value = std.mem.readInt(u16, filebytes[i_converted * 2 ..][0..2], .Little);
                // std.log.info("value {d}",.{value});
                self.raw_data.items[i_converted] = value;
                // std.log.info("new_data[i] {d}",.{self.raw_data.items[i_converted]});
            }
        }
    }
    pub fn appendToRawData(self: *EmbeddedDataStruct, value: u16) !void {
        try self.raw_data.append(allocator, value);
    }
    pub fn clearRawData(self: *EmbeddedDataStruct) !void {
        try self.raw_data.resize(allocator, 0);
    }
};

const ComponentHealth = @import("components/health.zig").ComponentHealth;
const ComponentMovement = @import("components/movement.zig").ComponentMovement;
const ComponentAttack = @import("components/attack.zig").ComponentAttack;
// TODO: Should probably rename these structs, they've become more than just structs
pub const EntityDataStruct = struct {
    messages: std.ArrayListUnmanaged(GameMessage) = .{},
    embedded: EmbeddedDataStruct = undefined,
    health: ComponentHealth = undefined,
    movement: ComponentMovement = undefined,
    attack: ComponentAttack = undefined,
    is_collision: bool = false,
    direction: u16 = 0, // 0 = up, 1 = down, 2 = left, 3 = right (USE AN ENUM TODO:)
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
        try self.messages.append(allocator, message);
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

            // IN CASE YOU NEED THIS -> note you also need health: *ComponentHealth = undefined, (star)
            // var health_component = try ComponentHealth.createNew(20);
            // self.health = health_component;
            // ------------------------------------------------------------------------------------------
            self.health = ComponentHealth{
                .parent = self,
                // TODO: Do we even need this anymore?
                .default_value = 10,
                .current_value = self.embedded.readData(enums.EntityDataEnum.ComponentHealthDefaultValue.int(), .Little),
            };
            // std.log.info("(a)health now {d} {d}", .{self.getId(), self.health.current_value});
        }
        if (self.embedded.readData(enums.EntityDataEnum.ComponentMovement.int(), .Little) == 1) {
            // std.log.info("movement component found", .{});
            self.movement = ComponentMovement{
                .parent = self,
                .entity_id = self.getId()
            };
        }
        if (self.embedded.readData(enums.EntityDataEnum.ComponentAttack.int(), .Little) == 1) {
            // std.log.info("attack component found (entity id: {d})", .{self.getId()});
            self.attack = ComponentAttack{
                .parent = self,
                .entity_id = self.getId()
            };
            // TODO: This is special code. Remove it and make it better / dynamic!
            if (self.getType() == 99) {
                self.attack.default_damage = 3;
            }
        }
    }
    pub fn processMessages(self: *EntityDataStruct) !void {
        while (self.messages.items.len > 0) {
            var message = self.messages.pop();
            switch (message.command) {
                enums.GameMessagesEventsEnum.MoveUp.int() => {
                    // TODO: check if entity has the move component
                    var current_world = worlds_list.at(current_world_index);
                    var intended_x = self.position[0];
                    var intended_y = self.movement.intendedMoveUp();
                    if (intended_y < current_world.getHeight())
                    {
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false)
                        {
                            self.direction = 0;
                            self.movement.moveUp();
                            try diff.addData(0);
                        }
                    }
                },
                enums.GameMessagesEventsEnum.MoveDown.int() => {
                    // TODO: check if entity has the move component
                    var current_world = worlds_list.at(current_world_index);
                    var intended_x = self.position[0];
                    var intended_y = self.movement.intendedMoveDown();
                    if (intended_y < current_world.getHeight())
                    {
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false)
                        {
                            self.direction = 1;
                            self.movement.moveDown();
                            try diff.addData(0);
                        }
                    }
                },
                enums.GameMessagesEventsEnum.MoveLeft.int() => {
                    // TODO: check if entity has the move component
                    var current_world = worlds_list.at(current_world_index);
                    var intended_x = self.movement.intendedMoveLeft();
                    var intended_y = self.position[1];
                    if (intended_x < current_world.getWidth())
                    {
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false)
                        {
                            self.direction = 2;
                            self.movement.moveLeft();
                            try diff.addData(0);
                        }
                    }
                },
                enums.GameMessagesEventsEnum.MoveRight.int() => {
                    // TODO: check if entity has the move component
                    var current_world = worlds_list.at(current_world_index);
                    var intended_x = self.movement.intendedMoveRight();
                    var intended_y = self.position[1];
                    if (intended_x < current_world.getWidth())
                    {
                        if (current_world.checkEntityCollision(intended_x, intended_y) == false)
                        {
                            self.direction = 3;
                            self.movement.moveRight();
                            try diff.addData(0);
                        }
                    }
                },
                enums.GameMessagesEventsEnum.Attack.int() => {
                    // TODO: Check if entity has the attack component
                    // if (message.data.items.len == 1) {
                    //     try self.attack.attack(message.data.items[0]);
                    // } else {
                    //     std.log.info("Attack message missing target", .{});
                    // }
                    if (self.getType() <= 3) {
                        try self.attack.directionalAttack();
                    } else {
                        // TODO: This is for the kraken. Hacky. FIX
                        try self.attack.attack();
                    }
                },
                else => {
                    std.log.info("Unknown message command: {d}", .{message.command});
                },
            }
        }
    }
};

pub fn getEntityById(entity_id: u16) usize {
    for (0..entities_list.len) |i| {
        if (entities_list.at(i).getId() == entity_id) {
            return i + 1;
        }
    }

    return 0;
}

// --- GAME FUNCTIONS ---
// @wasm
pub fn processTick() !void {
    for (0..entities_list.len) |i| {
        var entity = entities_list.at(i);
        try entity.processMessages();
    }
    while (events_list.items.len > 0) {
        var event = events_list.pop();
        if (event.type == enums.GameMessagesEventsEnum.Attack.int()) {
            events.processAttack(event);
        }
    }
}
// @wasm
pub fn entityIncrementHealth(entity: u16) u16 {
    return entities_list.at(entity).health.current_value;
}
// @wasm
pub fn entityDecrementHealth(entity: u16) u16 {
    // TODO: Add a check to make sure this entity has health component loaded
    entities_list.at(entity).health.decrementHealth();
    return entities_list.at(entity).health.current_value;
}
// @wasm
pub fn entityAttack(entity: u16, target: u16, crit_buff: bool) !bool {
    var target_coords: [2]u16 = .{ 0, 0 };
    var entity_coords: [2]u16 = .{ 0, 0 };
    // Determine if entity is next to target
    // If so, decrement target health
    var world = worlds_list.at(current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        // TODO: Update magic number 2 to be ENTITY_LAYER
        var value = getWorldData(current_world_index, 2, x, y);
        if (value == (entity + 1)) {
            entity_coords = .{ x, y };
        } else if (value == (target + 1)) {
            target_coords = .{ x, y };
        }
    }

    var target_plus_one_y = target_coords[1] + 1;
    // TODO: If plus one is greater than height, then don't add one
    var target_minus_one_y = target_coords[1];
    if (target_coords[1] > 0) {
        target_minus_one_y = target_coords[1] - 1;
    }
    var target_plus_one_x = target_coords[0] + 1;
    // TODO: If plus one is greater than width, then don't add one
    var target_minus_one_x = target_coords[0];
    if (target_coords[0] > 0) {
        target_minus_one_x = target_coords[0] - 1;
    }
    if ((entity_coords[0] == target_coords[0] and (entity_coords[1] == target_plus_one_y or entity_coords[1] == target_minus_one_y)) or
        (entity_coords[1] == target_coords[1] and (entity_coords[0] == target_plus_one_x or entity_coords[0] == target_minus_one_x)))
    {
        try diff.addData(0);
        if (crit_buff) {
            _ = entityDecrementHealth(target);
            _ = entityDecrementHealth(target);
            _ = entityDecrementHealth(target);
        } else {
            _ = entityDecrementHealth(target);
        }
        return true;
    }

    return false;
}
// @wasm
pub fn entityGetHealth(entity_id: u16) u16 {
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    return entity.health.current_value;
}
// @wasm
pub fn entityGetWorldX(entity: u16) !u16 {
    // TODO: Update this so we
    // (a) use world.ENTITY_LAYER
    // (b) use world.position_layer
    var world = worlds_list.at(current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        if (getWorldData(current_world_index, 2, x, y) == (entity + 1)) {
            return x;
        }
    }

    @panic("Entity not found in world");
}
// @wasm
pub fn entityGetWorldY(entity: u16) !u16 {
    // TODO: Update this so we
    // (a) use world.ENTITY_LAYER
    // (b) use world.position_layer
    var world = worlds_list.at(current_world_index);
    var w = world.getWidth();
    var h = world.getHeight();
    var size = w * h;
    for (0..size) |i| {
        var x: u16 = @as(u16, @intCast(i % w));
        var y: u16 = @as(u16, @intCast(i / w));
        if (getWorldData(current_world_index, 2, x, y) == (entity + 1)) {
            return y;
        }
    }

    @panic("Entity not found in world");
}
// @wasm
pub fn entityGetType(entity_id: u16) u16 {
    for (0..entities_list.len) |i| {
        if (entities_list.at(i).getId() == entity_id) {
            return entities_list.at(i).getType();
        }
    }

    return 0;
}
// @wasm
pub fn entityEnableCollision(entity_id: u16) void {
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    entity.is_collision = true;
}
// @wasm
pub fn entityDisableCollision(entity_id: u16) void {
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    entity.is_collision = false;
}
// @wasm
pub fn getEntitiesLength() u16 {
    return @as(u16, @intCast(entities_list.len));
}
// @wasm
pub fn getEntityIdByIndex(index: u16) u16 {
    return entities_list.at(index).getId();
}
// @wasm
pub fn getEntityTypeByIndex(index: u16) u16 {
    return entities_list.at(index).getType();
}
// @wasm
pub fn entitySetHealth(entity_id: u16, value: u16) !void {
    // TODO: Check to make sure the health component is loaded
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    entity.health.setHealth(value);
    try diff.addData(0);
}
// @wasm
pub fn entityGetPositionX(entity_id: u16) !u16 {
    // TODO: Check to make sure the movement component is loaded
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    return entity.getPositionX();
}
// @wasm
pub fn entityGetPositionY(entity_id: u16) !u16 {
    // TODO: Check to make sure the movement component is loaded
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    return entity.getPositionY();
}
// @wasm
pub fn entitySetPositionX(entity_id: u16, value: u16) !void {
    // TODO: Check to make sure the movement component is loaded
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    entity.setPositionX(value);
    try diff.addData(0);
}
// @wasm
pub fn entitySetPositionY(entity_id: u16, value: u16) !void {
    // TODO: Check to make sure the movement component is loaded
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    entity.setPositionY(value);
    try diff.addData(0);
}
// @wasm
pub fn initializeGame() !bool {
    if (GAME_INITIALIZED) {
        return true;
    }
    for (0..embeds.total_worlds) |i| {
        var embedded_data_struct = EmbeddedDataStruct{};
        var world = try embedded_data_struct.findIndexByFileName(.world, @intCast(i), 0);
        if (world == true) {
            try worlds_list.append(allocator, .{
                .embedded_data = embedded_data_struct
            });
            var last_world = worlds_list.at(worlds_list.len - 1);
            var total_layers = last_world.readData(enums.WorldDataEnum.TotalLayers.int());
            for (0..total_layers) |l| {
                var layer_embedded_struct = EmbeddedDataStruct{};
                var layer = try layer_embedded_struct.findIndexByFileName(.world_layer, @intCast(i), @intCast(l + 1));
                if (layer == true) {
                    try last_world.addEmbeddedLayer(layer_embedded_struct);
                } else {
                    std.log.info("Layer not found - {d} (world: {d})", .{ @as(u16, @intCast(l)), @as(u16, @intCast(i)) });
                }
            }
        } else {
            std.log.info("World not found - {d}", .{ @as(u16, @intCast(i)) });
        }
    }
    var entities_loaded: u16 = 0;
    var cursor: u16 = 0;
    while (entities_loaded < embeds.total_entities) {
        var embedded_data_struct = EmbeddedDataStruct{};
        var entity = try embedded_data_struct.findIndexByFileName(.entity, cursor, 0);
        if (entity == true) {
            // std.log.info("TrUe", .{});
            try entities_list.append(allocator, .{
                .embedded = embedded_data_struct,
            });
            var i: usize = entities_list.len - 1;
            try entities_list.at(i).init();
            entities_loaded += 1;
        } else {
            // std.log.info("FaLsE {d}", .{entities_loaded});
        }
        cursor += 1;
        // std.log.info("entities_loaded->cursor {d}", .{cursor});
    }
    GAME_INITIALIZED = true;
    return true;
}
// @wasm
pub fn loadWorld(index: u16) !void {
    current_world_index = index;
    var w: u16 = worlds_list.at(current_world_index).getWidth();
    var h: u16 = worlds_list.at(current_world_index).getHeight();

    if (w < viewport.getSizeWidth()) {
        var leftover = viewport.getSizeWidth() - w;
        if (leftover % 2 > 0) {
            viewport.setPaddingLeft(leftover / 2);
            viewport.setPaddingRight(leftover / 2 + 1);
        } else {
            viewport.setPaddingLeft(leftover / 2);
            viewport.setPaddingRight(leftover / 2);
        }
    }
    if (h < viewport.getSizeHeight()) {
        var leftover = viewport.getSizeHeight() - h;
        if (leftover % 2 > 0) {
            viewport.setPaddingTop(leftover / 2);
            viewport.setPaddingBottom(leftover / 2 + 1);
        } else {
            viewport.setPaddingTop(leftover / 2);
            viewport.setPaddingBottom(leftover / 2);
        }
    }

    // TODO: Check that we have a viewport size
    viewport.initializeViewportData();
    var x: u16 = 0;
    var y: u16 = 0;
    for (0..viewport.getLength()) |i| {
        _ = i;
        if (x >= viewport.getPaddingLeft() and
            y >= viewport.getPaddingTop() and
            x < (viewport.getSizeWidth() - viewport.getPaddingRight()) and
            y < (viewport.getSizeHeight() - viewport.getPaddingBottom()))
        {
            viewport.setData(x, y, 1);
        } else {
            viewport.setData(x, y, 0);
        }

        x += 1;
        if (x >= viewport.getSizeWidth()) {
            y += 1;
            x = 0;
        }
    }

    try worlds_list.at(current_world_index).initializeEntities();
}
// @wasm
pub fn getCurrentWorldIndex() u16 {
    return current_world_index;
}
// @wasm
pub fn getCurrentWorldWidth() u16 {
    // return worlds_list.items[current_world_index].getWidth();
    return worlds_list.at(current_world_index).getWidth();
}
// @wasm
pub fn getCurrentWorldHeight() u16 {
    // return worlds_list.items[current_world_index].getWidth();
    return worlds_list.at(current_world_index).getHeight();
}
// @wasm
pub fn getCurrentWorldCollisionLayer() u16 {
    return worlds_list.at(current_world_index).getCollisionLayer();
}
// @wasm
pub fn getCurrentWorldEntityLayer() u16 {
    return worlds_list.at(current_world_index).getEntityLayer();
}
// TODO: This is an editor function, move it
// @wasm
pub fn setCurrentWorldCollisionLayer(layer_index: u16) !void {
    try worlds_list.at(current_world_index).setCollisionLayer(layer_index);
}
// TODO: This is an editor function, move it
// @wasm
pub fn setCurrentWorldEntityLayer(layer_index: u16) !void {
    try worlds_list.at(current_world_index).setEntityLayer(layer_index);
}
// @wasm
pub fn getCurrentWorldTotalLayers() u16 {
    return @as(u16, @intCast(worlds_list.at(current_world_index).getTotalLayers()));
}
// @wasm
pub fn getWorldData(world_index: u16, layer_index: u16, x: u16, y: u16) u16 {
    return worlds_list.at(world_index).getCoordinateData(layer_index, x, y);
}
// @wasm
pub fn getCurrentWorldLayerRawData(layer_index: u16, x: u16, y: u16) u16 {
    return worlds_list.at(current_world_index).readLayer(layer_index, (y * worlds_list.at(current_world_index).getWidth()) + x);
}
// @wasm
pub fn resetWorldData(world_index: u16) !void {
    var world = worlds_list.at(world_index);
    try world.embedded_data.clearRawData();
}
// @wasm
pub fn resetWorldLayerData(world_index: u16, layer_index: u16) !void {
    var world = worlds_list.at(world_index);
    try world.embedded_layers.items[layer_index].clearRawData();
}
// @wasm
pub fn getWorldDataAtViewportCoordinate(layer_index: u16, x: u16, y: u16) u16 {
    // TODO: if layer_index == EntityLayer then iterate over entities in the game and get their position to match coords
    if (x >= viewport.getPaddingLeft() and
        y >= viewport.getPaddingTop() and
        x < (viewport.getSizeWidth() - viewport.getPaddingRight()) and
        y < (viewport.getSizeHeight() - viewport.getPaddingBottom()))
    {
        var world_x = x - viewport.getPaddingLeft();
        var world_y = y - viewport.getPaddingTop();
        world_x += viewport.getCameraX();
        world_y += viewport.getCameraY();
        // std.log.info("world {d}", .{worlds_list.len});
        return getWorldData(current_world_index, layer_index, world_x, world_y);
    }
    std.log.info("Invalid coordinates: {d} {d}", .{x, y});
    @panic("Invalid viewport coordinate");
}
// @wasm
pub fn translateViewportXToWorldX(x: u16) u16 {
    if (x >= viewport.getPaddingLeft() and
        x < (viewport.getSizeWidth() - viewport.getPaddingRight()))
    {
        var world_x = x - viewport.getPaddingLeft();
        world_x += viewport.getCameraX();
        return world_x;
    }
    @panic("Invalid viewport x coordinate");
}
// @wasm
pub fn translateViewportYToWorldY(y: u16) u16 {
    if (y >= viewport.getPaddingTop() and
        y < (viewport.getSizeHeight() - viewport.getPaddingBottom()))
    {
        var world_y = y - viewport.getPaddingTop();
        world_y += viewport.getCameraY();
        return world_y;
    }
    @panic("Invalid viewport y coordinate");
}
