// Note: make sure to remain on ZIG 0.11.0

const std = @import("std");
const ArrayList = std.ArrayList;

pub var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
pub var allocator = gpa_allocator.allocator();
pub var entities_list = std.SegmentedList(EntityDataStruct, 32){};
pub var worlds_list = std.SegmentedList(WorldDataStruct, 32){};
pub var current_world_index: u16 = 0;
pub var events_list = std.ArrayListUnmanaged(GameEvent){};

var GAME_INITIALIZED: bool = false;

const enums = @import("enums.zig");
const embeds = @import("embeds.zig");
const diff = @import("diff.zig");
const editor = @import("editor.zig");
const viewport = @import("viewport.zig");
const events = @import("events.zig");
const Service = @import("services.zig").Service;
const ServiceHandle = @import("services.zig").ServiceHandle;
const ComponentHealth = @import("components/health.zig").ComponentHealth;
const ComponentMovement = @import("components/movement.zig").ComponentMovement;
const ComponentAttack = @import("components/attack.zig").ComponentAttack;

// Note: These need to stay here since they are
// initialized as part of initializeGame function
pub const ServiceEntityData = Service(EntityDataStruct);
const ServiceWorldData = Service(WorldDataStruct);
const ServiceEmbeddedData = Service(EmbeddedDataStruct);
const ServiceComponentHealth = Service(ComponentHealth);
const ServiceComponentMovement = Service(ComponentMovement);
const ServiceComponentAttack = Service(ComponentAttack);
pub var sComponentHealth: ServiceComponentHealth = undefined;
pub var sComponentMovement: ServiceComponentMovement = undefined;
pub var sComponentAttack: ServiceComponentAttack = undefined;
pub var sEntityData: ServiceEntityData = undefined;
pub var sWorldData: ServiceWorldData = undefined;
pub var sEmbeddedData: ServiceEmbeddedData = undefined;

const WorldDataStruct = @import("world.zig").WorldDataStruct;
const EntityDataStruct = @import("entity.zig").EntityDataStruct;
const EmbeddedDataStruct = @import("embedded.zig").EmbeddedDataStruct;

pub var GAME_PAUSED: bool = false;
pub var GAME_MODE: u16 = enums.GameModesEnum.TurnBased.int();
pub var game_state: u16 = enums.GameState.Idle.int();
pub var entity_turn: u16 = 0;
// TODO: Are you sure you want these here?
pub var entity_has_moved: bool = false;
pub var entity_has_attacked: bool = false;

pub var global_seed: u64 = 12345;
fn getRandomNumber(min: u16, max: u16) u16 {
    var rng = std.rand.DefaultPrng.init(global_seed);
    const range = @as(u16, @intCast(max - min + 1));
    const random_number = @as(u16, @intCast(rng.next() % @as(u64, @intCast(range))));
    return random_number + min;
}

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
    // TODO: For anything but javascript/wasm
    // _ = format;
    // _ = args;
    // std.debug.print(std_options.log_level, .default, format, args);
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
// TODO: For anything but javascript/wasm (comment these out)
extern fn console_log_write(ptr: [*]const u8, len: usize) void;
extern fn console_log_flush() void;

// -----------------------------------------------------------------------------------------
// TODO: Move these to some kind of message & event folder structure directory thingy bob?
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
    // std.log.info("processTick", .{});
    // TODO: Update the messaging system so that you have priority levels
    // highest priority must be done first before the renderer can process the next tick
    // also bring in the pause function from the javascript side into zig
    // std.log.info("PROCESS TICK", .{});
    // TODO: Is it truly Idle that you want here? What about waiting for entity to take action state? Deal with this later.
    if (game_state == enums.GameState.Idle.int()) {
        if (GAME_MODE == enums.GameModesEnum.TurnBased.int()) {
            // NOTE: We are flushing any messages from all entities if it's not their turn.
            for (0..entities_list.len) |i| {
                var entity = entities_list.at(i);
                if (entity.getId() != i) {
                    // TODO: Is there a better way to flush these immediately?
                    while (entity.messages.items.len > 0) {
                        _ = entity.messages.pop();
                    }
                }
            }
        }

        // TODO: Consider whether or not these have to be put into the TurnBased mode function above or not
        // NOTE: FIRST process the entire global states / messages / etc...
        try events.processEvents();
        // NOTE: THEN process individual entity messages because global will send messages to entities
        try events.processEntityMessages();
        // TODO: What if an entity attacks another entity and the other entity has to decrease health as an event?

        // Deal with the automation of next players if they are not player driven

        for (0..entities_list.len) |i| {
            var entity = entities_list.at(i);
            if (entity.getId() == entity_turn and !entity.player_driven and entity.should_automate) {
                // TODO: has_attacked
                if (!entity_has_moved) {
                    // TODO: Automate the movement. Maybe randomize it? Up/down/left/right and then attack directional?
                    var direction = getRandomNumber(1, 8);
                    std.log.info("Direction {d}", .{direction});
                    if (direction == 1) {
                        try events.moveUp(entity.getId(), false);
                    } else if (direction == 2) {
                        try events.moveDown(entity.getId(), false);
                    } else if (direction == 3) {
                        try events.moveLeft(entity.getId(), false);
                    } else if (direction == 4) {
                        try events.moveRight(entity.getId(), false);
                    } else if (direction > 4) {
                        try events.attack(entity.getId(), 0, false);
                    }
                } else {
                    try events.endTurn(entity.getId(), false);
                }
            }
        }
    }
}
// @wasm
pub fn entityIncrementHealth(entity_index: u16) u16 {
    var entity = entities_list.at(entity_index - 1);
    // return entity.health.current_value;
    var sHealth = try sComponentHealth.getData(&entity.health);
    return sHealth.current_value;
    // return entities_list.at(entity).health.current_value;
}
// @wasm
pub fn entityDecrementHealth(entity_index: u16) u16 {
    // TODO: Add a check to make sure this entity has health component loaded
    // entities_list.at(entity_index).health.decrementHealth();
    var entity = entities_list.at(entity_index);
    // return entities_list.at(entity).health.current_value;
    var sHealth = try sComponentHealth.getData(&entity.health);
    sHealth.decrementHealth();
    return sHealth.current_value;
}
// @wasm
pub fn entityGetHealth(entity_id: u16) u16 {
    var entity_index = getEntityById(entity_id);
    if (entity_index == 0) {
        @panic("Entity not found");
    }
    var entity = entities_list.at(entity_index - 1);
    // return entity.health.current_value;
    var sHealth = try sComponentHealth.getData(&entity.health);
    return sHealth.current_value;
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
    var sHealth = try sComponentHealth.getData(&entity.health);
    sHealth.setHealth(value);
    // entity.health.setHealth(value);
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
pub fn entityIsCoordInRage(entity_id: u16, x: u16, y: u16) !bool {
    for (0..entities_list.len) |i| {
        var entity = entities_list.at(i);
        if (entity.getId() == entity_id) {
            var sAttack = try sComponentAttack.getData(&entity.attack);
            return sAttack.isCoordInAttackRange(x, y);
        }
    }
    return false;
}
// @wasm
pub fn initializeGame() !bool {
    if (GAME_INITIALIZED) {
        return true;
    }
    sComponentHealth = try ServiceComponentHealth.init(&allocator, 10, false);
    sComponentMovement = try ServiceComponentMovement.init(&allocator, 10, false);
    sComponentAttack = try ServiceComponentAttack.init(&allocator, 10, false);
    sEntityData = try ServiceEntityData.init(&allocator, 10, false);
    sWorldData = try ServiceWorldData.init(&allocator, 10, false);
    sEmbeddedData = try ServiceEmbeddedData.init(&allocator, 10, false);
    // TODO: We are actually prematurely loading worlds & entities here.
    // Move this stuff to the loadWorld function and handle it there
    for (0..embeds.total_worlds) |i| {
        var embedded_data_struct = EmbeddedDataStruct{};
        var world = try embedded_data_struct.findIndexByFileName(.world, @intCast(i), 0);
        if (world == true) {
            try worlds_list.append(allocator, .{ .embedded_data = embedded_data_struct });
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
            std.log.info("World not found - {d}", .{@as(u16, @intCast(i))});
        }
    }
    var entities_loaded: u16 = 0;
    var cursor: u16 = 0;
    while (entities_loaded < embeds.total_entities) {
        var embedded_data_struct = EmbeddedDataStruct{};
        var entity = try embedded_data_struct.findIndexByFileName(.entity, cursor, 0);
        if (entity == true) {
            try entities_list.append(allocator, .{
                .embedded = embedded_data_struct,
            });
            var i: usize = entities_list.len - 1;
            try entities_list.at(i).init();
            // TODO: this returns a handle, we need to store this handle in a list
            _ = try sEntityData.addData(EntityDataStruct{ .embedded = embedded_data_struct });
            entities_loaded += 1;
        } else {
            // std.log.info("FaLsE {d}", .{entities_loaded});
        }
        cursor += 1;
        // std.log.info("entities_loaded->cursor {d}", .{cursor});
    }
    GAME_INITIALIZED = true;
    entity_turn = entities_list.at(0).getId();
    return true;
}
// TODO: There is a difference between loadWorld INTO THE GAME
// and loadWorld as in getWorldData even if it's not loaded
// (for example, in the editor)
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
        // TODO: FIX - If your viewport is greater than world, you get weird y (and maybe x) offset issues with padding
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

    // var i: usize = 0;
    // while (i < entities_list.len) {
    //     std.log.info("entity loaded position: {d} {d} {d} {d}", .{ entities_list.at(i).getId(), entities_list.at(i).getType(), entities_list.at(i).getPositionX(), entities_list.at(i).getPositionY() });
    //     i += 1;
    // }
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
        return getWorldData(current_world_index, layer_index, world_x, world_y);
    }
    std.log.info("Invalid coordinates: {d} {d}", .{ x, y });
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

// @wasm
pub fn sum(a: u16, b: u16) u16 {
    return a + b;
}
// extern fn sum(a: u16, b: u16) u16;

// --------------------- STRING TESTS -----------------------
var str = "Hello, World!";
const strings: []const u8 = @embedFile("binaries/strings.bin");
// @wasm
pub fn TEST_getString() [*c]const u8 {
    //const index = 0;
    // const pulled_value = std.mem.readInt(u16, filebytes[index * 2 ..][0..2], std.builtin.Little);
    const num_strings = std.mem.readInt(u16, strings[0..2], .Little);
    var e_strings = std.ArrayList([]const u8).init(allocator);
    defer e_strings.deinit();
    var offset: usize = 0; // Start after the number of strings
    var i: u16 = 0;
    while (i < num_strings) {
        // Find the null terminator to determine the string length
        const null_index = std.mem.indexOfScalar(u8, strings[offset..], 0) orelse break;
        const string_length = null_index;

        // Extract the string
        const string_data = strings[offset .. offset + string_length];
        e_strings.append(string_data) catch break;

        // Move to the next string
        offset += string_length + 1; // +1 to skip the null terminator
        i += 1;
    }

    return e_strings.items[1].ptr;
    //return str;
}
// HOW TO USE IN JS
// // Assuming getString is the exported function from Zig
// const stringPtr = WASM.game_TEST_getString();

// // Read the string from memory
// let str = "";
// let ptr = stringPtr;
// let memoryView = new DataView(WASM.memory.buffer);
// while (memoryView.getUint8(ptr) !== 0) {
//     str += String.fromCharCode(memoryView.getUint8(ptr));
//     ptr++;
// }

// console.log(str); // Outputs: Hello, World!
// HOW TO SAVE STRINGS IN JS
// // Step 1: Flatten the array
// const nestedArray = [
//     ["Hello World!"],
//     ["String 2"],
//     // Add more strings as needed
// ];
// const flattenedArray = nestedArray.flat();

// // Step 2: Convert strings to Uint8Arrays
// const uint8Arrays = flattenedArray.map(str => {
//     const encoder = new TextEncoder();
//     return new Uint8Array([...encoder.encode(str), 0]); // Ensure null-termination
// });

// // Step 3: Combine Uint8Arrays
// const combinedLength = uint8Arrays.reduce((acc, arr) => acc + arr.length, 0);
// const combinedArray = new Uint8Array(combinedLength);
// let offset = 0;
// uint8Arrays.forEach(arr => {
//     combinedArray.set(arr, offset);
//     offset += arr.length;
// });

// // Step 4: Save to binary file
// const blob = new Blob([combinedArray.buffer], { type: 'application/octet-stream' });
// const url = URL.createObjectURL(blob);
// const link = document.createElement('a');
// link.href = url;
// link.download = 'strings.bin';
// link.click();

// @wasm
pub fn getEntityTurn() u16 {
    return entity_turn;
}
// @wasm
pub fn getCurrentMode() u16 {
    return GAME_MODE;
}
// @wasm
pub fn getGameState() u16 {
    return game_state;
}
// @wasm
pub fn getGamePaused() bool {
    return GAME_PAUSED;
}
// @wasm
pub fn toggleGamePaused() void {
    GAME_PAUSED = !GAME_PAUSED;
}
// @wasm
pub fn setEntityPlayerDriven(entity_id: u16, player_driven: bool) void {
    for (0..entities_list.len) |i| {
        var entity = entities_list.at(i);
        if (entity.getId() == entity_id) {
            entity.player_driven = player_driven;
        }
    }
}
// @wasm
pub fn setGlobalSeed(seed: u64) void {
    global_seed = seed;
}
// @wasm
pub fn getEntityRange(entity_id: u16) u16 {
    for (0..entities_list.len) |i| {
        var entity = entities_list.at(i);
        if (entity.getId() == entity_id) {
            var sAttack = try sComponentAttack.getData(&entity.attack);
            return sAttack.current_range;
        }
    }
    return 0;
}
