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

const enums = @import("enums.zig");
const embeds = @import("embeds.zig");
const debug = @import("debug.zig");
const helpers = @import("helpers.zig");
const renderer = @import("renderer.zig");
const diff = @import("diff.zig");
const editor = @import("editor.zig");
const viewport = @import("viewport.zig");

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

pub const WorldDataStruct = struct {
    embedded_data: EmbeddedDataStruct = undefined,
    embedded_layers: std.ArrayListUnmanaged(EmbeddedDataStruct) = .{},
    // Note: this is to store the position of entities and whatnot
    position_layer: std.ArrayListUnmanaged(u16) = .{},
    pub fn setEmbeddedData(self: *WorldDataStruct, embedded: EmbeddedDataStruct) void {
        self.embedded_data = embedded;
    }
    pub fn addEmbeddedLayer(self: *WorldDataStruct, embedded: EmbeddedDataStruct) !void {
        try self.embedded_layers.append(gpa_allocator.allocator(), embedded);
    }
    pub fn readData(self: *WorldDataStruct, index: u16) u16 {
        return self.embedded_data.readData(index, .Little);
    }
    pub fn readLayer(self: *WorldDataStruct, layer_index: u16, index: u16) u16 {
        return self.embedded_layers.items[layer_index].readData(index, .Little);
    }
    pub fn getIndex(self: *WorldDataStruct) u16 {
        const enum_index = enums.WorldDataEnum.ID.int();
        const index = self.readData(enum_index);
        // std.log.info("index {d}",.{index});
        return index;
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
        var index: u16 = (y * self.getWidth()) + x;
        const data = self.readLayer(layer, index);
        return data;
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
pub const EntityDataStruct = struct {
    type: u16 = 0,
    data: std.ArrayListUnmanaged(u16) = .{},
    has_data: bool = false,
    embedded: EmbeddedDataStruct = undefined,
    health: ComponentHealth = undefined,
    pub fn getType(self: *EntityDataStruct) u16 {
        return @as(u16, @intCast(self.type));
    }
    pub fn setEmbedded(self: *EntityDataStruct, embedded: EmbeddedDataStruct) void {
        self.embedded = embedded;
    }
    pub fn getIndex(self: *EntityDataStruct) u16 {
        const enum_index = enums.EntityDataEnum.ID.int();
        const index = if (self.has_data)
            self.data.items[enum_index]
        else
            self.embedded.readData(enum_index, .Little);

        // std.log.info("index {d}",.{index});
        return index;
    }
    pub fn readDataFromEmbedded(self: *EntityDataStruct) !void {
        // TODO: Add a "force" option to do it even if self.has_data
        if (self.has_data) {
            return;
        }
        var max: u16 = self.embedded.getLength();
        max = max / 2; // Note: because the embedded file is using 32-bit or something like that, so you gotta divide
        // std.log.info("max {d}",.{max});
        // std.log.info("file_index {d}",.{self.embedded.file_index});
        try self.data.resize(gpa_allocator.allocator(), max);
        for (0..max) |i| {
            var i_converted = @as(u16, @intCast(i));
            const value = self.embedded.readData(i_converted, .Little);
            // std.log.info("value {d}",.{value});
            self.data.items[i_converted] = value;
            // std.log.info("new_data[i] {d}",.{new_data[i]});
        }
        self.has_data = true;
    }
    pub fn loadComponents(self: *EntityDataStruct) !void {
        if (!self.has_data) {
            try self.readDataFromEmbedded();
        }
        if (self.data.items[enums.EntityDataEnum.ComponentHealth.int()] == 1) {
            self.health = ComponentHealth{
                .default_value = 10,
                .current_value = self.data.items[enums.EntityDataEnum.ComponentHealthDefaultValue.int()] 
            };
            // std.log.info("health component found", .{});
        }
    }
    // TODO: move component + other components
};

// --- GAME FUNCTIONS ---
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
pub fn entityGetHealth(entity: u16) u16 {
    // TODO: Add a check to make sure this entity has health component loaded
    return entities_list.at(entity).health.current_value;
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
pub fn entityGetType(entity: u16) u16 {
    return entities_list.at(entity).getType();
}
// @wasm
pub fn entitySetHealth(entity: u16, value: u16) !void {
    // TODO: Check to make sure the health component is loaded
    try diff.addData(0);
    entities_list.at(entity).health.setHealth(value);
}
// @wasm
pub fn initializeGame() !void {
    if (GAME_INITIALIZED) {
        return;
    }
    for (0..embeds.total_worlds) |i| {
        var embedded_data_struct = EmbeddedDataStruct{};
        var world = try embedded_data_struct.findIndexByFileName(.world, @intCast(i), 0);
        if (world == true) {
            try worlds_list.append(gpa_allocator.allocator(), .{
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
    for (0..embeds.total_entities) |i| {
        var embedded_data_struct = EmbeddedDataStruct{};
        var entity = try embedded_data_struct.findIndexByFileName(.entity, @intCast(i), 0);
        if (entity == true) {
            // TODO: Actually put the type into the embedded data
            try entities_list.append(gpa_allocator.allocator(), .{
                .embedded = embedded_data_struct,
                .type = 0,
            });
            try entities_list.at(i).loadComponents();
        }
    }
    GAME_INITIALIZED = true;
}
// @wasm
pub fn loadWorld(index: u16) void {
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
    return worlds_list.at(current_world_index).readData(enums.WorldDataEnum.CollisionLayer.int());
}
// @wasm
pub fn getCurrentWorldEntityLayer() u16 {
    return worlds_list.at(current_world_index).readData(enums.WorldDataEnum.EntityLayer.int());
}
// @wasm
pub fn getCurrentWorldTotalLayers() u16 {
    return worlds_list.at(current_world_index).readData(enums.WorldDataEnum.TotalLayers.int());
}
// @wasm
pub fn getWorldData(world_index: u16, layer_index: u16, x: u16, y: u16) u16 {
    return worlds_list.at(world_index).getCoordinateData(layer_index, x, y);
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
pub fn getWorldDataAtViewportCoordinate(layer: u16, x: u16, y: u16) u16 {
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
        return getWorldData(current_world_index, layer, world_x, world_y);
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

// TODO: Need to implement an actor model system
// Define an actor for a player character
// class PlayerActor {
// public:
//     void receiveMessage(const Message& message) {
//         if (message.type == "attack") {
//             // Handle attack action
//         } else if (message.type == "useItem") {
//             // Handle item usage
//         }
//         // ... other message types
//     }
// };

// // Define an actor for an enemy character
// class EnemyActor {
// public:
//     void receiveMessage(const Message& message) {
//         if (message.type == "takeDamage") {
//             // Handle taking damage
//         } else if (message.type == "move") {
//             // Handle movement
//         }
//         // ... other message types
//     }
// };

// // Example of sending a message from a player to an enemy
// void sendMessageFromPlayerToEnemy(PlayerActor& player, EnemyActor& enemy) {
//     Message attackMessage;
//     attackMessage.type = "attack";
//     player.receiveMessage(attackMessage);
//     enemy.receiveMessage(attackMessage);
// }


// class Actor {
// public:
//     virtual void ReceiveMessage(const Message& message) = 0;
//     virtual void Update(float deltaTime) = 0;
// };
// class Player : public Actor {
// public:
//     void ReceiveMessage(const Message& message) override {
//         if (message.type == "move") {
//             MoveMessage move = static_cast<const MoveMessage&>(message);
//             position.x += move.x;
//             position.y += move.y;
//         } else if (message.type == "attack") {
//             // Handle attack
//         }
//     }

//     void Update(float deltaTime) override {
//         // Update actor's state based on deltaTime
//     }

// private:
//     Vector2 position;
// };
// class MessageSystem {
// public:
//     void Update(float deltaTime) {
//         for (auto& actor : actors) {
//             for (auto& message : actor.messages) {
//                 actor.ReceiveMessage(message);
//             }
//             actor.Update(deltaTime);
//         }
//     }

// private:
//     std::vector<Actor> actors;
// };
// int main() {
//     MessageSystem messageSystem;
//     Player player;
//     messageSystem.actors.push_back(player);

//     while (gameIsRunning) {
//         float deltaTime = getDeltaTime();
//         messageSystem.Update(deltaTime);
//         // Render game state
//     }

//     return 0;
// }
