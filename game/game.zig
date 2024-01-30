// Note: make sure to remain on ZIG 0.11.0
//
// TODO
// - It makes sense for diff/diff_list to have an arena allocator because you want to clear it every loop/frame/tick
// -- what about viewport? (I think the answer is yes since it can change on the fly)
// -- what about world/world_data? (I think the answer is also yes since you can load/unload worlds on the fly)
// -- what about entities? (not the default "template" ones but the scene/world ones yes)
// - ECS
// -- array of entities (this serves as IDs?)
// -- array of entity_types
// -- array of components attached to entities ... how does this work?
// --- [0, x.., 0, x..] where every x > 0 and every 0 = another entity
// --- what about when you use the editor? you'd have to do something like [entity_index_id, add_or_remove_component, which_one]
// --- then you have a component so then what?
// --- no you need to keep them separated (like the song)
// --- you need to queries like...
// ---- "select * entities that have a health component"
// ---- "select * entities where type = %"
// ---- "select health from components where entity = %"
// ---- seperate array for each component vs entities = entities_with_health_component = [_]u16.{0,3,4,8}...
// - Go through all files that use "export fn" and convert them or remove them -> build process with // @wasm
// - Figure out the chain of initializations given new file structure, such as game->init() --->>> editor->init() ---->>>++++ entities->init()
//
// Entity -> array of attached components as integer IDs
// Take an action (function, example: Move(entity_index, direction)
// - In the function you would check if the entity HAS the component or not
// - If not, do nothing
// - Stat based components
// - entity_{id}_component_{id}.bin -> hold default values
// -- Alternatively: iterating over an entity at runtime and applying default values to it

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
    while (true) { @breakpoint(); }
}

pub fn uncaughtError(err: anytype) noreturn {
    log("uncaught error: {s}", .{@errorName(err)});
    if (@errorReturnTrace()) |t| {
        log("ErrorTrace:", .{});
        std.debug.dumpStackTrace(t.*);
    } else {
        log("ErrorTrace: <none>", .{});
    }
    while (true) { @breakpoint(); }
}


fn console_log_write_zig(context: void, bytes: []const u8) !usize {
    _ = context;
    console_log_write(bytes.ptr, bytes.len);
    return bytes.len;
}
extern fn console_log_write(ptr: [*]const u8, len: usize) void;
extern fn console_log_flush() void;
// -----------------------------------------------------------------------------------------


const Entity = struct {
    internalID: u16,
    internalIndex: usize = 0,
    pub fn init(self: *Entity) void {
        self.internalIndex = helpers.getEntityFileIndex(self.internalID);
    }
    pub fn pullEntityDataAndDoSomething(self: *Entity) u16 {
        return readFromEmbeddedFile(self.internalIndex, 0, 0);
    }
    // pub fn collisionFns
    // pub fn healthFns
    // pub fn movementFns
};

var current_world_index: u16 = 0;
// @wasm
pub fn loadWorld(index: u16) void {
    current_world_index = index;
    var w: u16 = undefined;
    var h: u16 = undefined;
    var in_editor: bool = false;
    for (0..editor.new_worlds.items.len) |nw| {
        if (editor.new_worlds.items[nw].items[0] == index) {
            in_editor = true;
            w = editor.new_worlds.items[nw].items[1];
            h = editor.new_worlds.items[nw].items[2];
        }
    }
    if (!in_editor) {
        const world_size_file_name = std.fmt.allocPrint(allocator, "world_{d}_size.bin", .{current_world_index}) catch unreachable;
        var world_size_file_index: usize = 0;
        for (embeds.file_names, 0..) |name, i| {
            if (std.mem.eql(u8, name, world_size_file_name)) {
                world_size_file_index = i;
            }
        }
        w = readFromEmbeddedFile(world_size_file_index, 0, 0);
        h = readFromEmbeddedFile(world_size_file_index, 1, 0);
    }

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
        if (
            x >= viewport.getPaddingLeft() and
            y >= viewport.getPaddingTop() and
            x < (viewport.getSizeWidth() - viewport.getPaddingRight()) and
            y < (viewport.getSizeHeight() - viewport.getPaddingBottom())
        ) {
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
pub fn getEntityById(id: u16) u16 {
    // TODO: Update so this returns the entity type + attached components via ID/ENUM match
    if (id >= embeds.total_entities) {
        var offset_index: u16 = id - embeds.total_entities;
        return editor.entities.items[offset_index];
    } else {
        const entity_file_name = std.fmt.allocPrint(allocator, "entity_{d}.bin", .{id}) catch unreachable;
        const file_index = getFileIndexByName(entity_file_name);
        return readFromEmbeddedFile(file_index, 0, 0);
    }
}

// NOTE: NOT WASM COMPATIBLE
pub fn getFileIndexByName(name: []const u8) usize {
    var file_index: usize = 0;
    for (embeds.file_names, 0..) |file_name, i| {
        if (std.mem.eql(u8, file_name, name)) {
            file_index = i;
        }
    }
    return file_index;
}
// @wasm
pub fn readFromEmbeddedFile(file_index: usize, index: u16, mode: u16) u16 {
    var file = embeds.embeds[file_index];
    const adjusted_index = index * 2;

    var pulled_value: u16 = 0;
    if (mode == 0) {
        // Little Endian Mode
        pulled_value = (@as(u16, @intCast(file[adjusted_index + 1])) << 8 | @as(u16, @intCast(file[adjusted_index])));
    } else if (mode == 1) {
        // Big Endian Mode
        pulled_value = (@as(u16, @intCast(file[adjusted_index])) << 8 | @as(u16, @intCast(file[adjusted_index + 1])));
    }

    return pulled_value;
}
var entities_list = ArrayList(Entity).init(gpa_allocator.allocator());
// entities_with_component_* = arraylist
// read through entity data, if certain components are turned on or off, create the appropriate struct and add it to the array
// @wasm
pub fn initializeGame() !void {
    loadWorld(current_world_index);

    var new_entity = Entity{ .internalID = 0 };
    new_entity.init();
    try entities_list.append(new_entity);
}
// @wasm
pub fn getEntityOut() u16 {
    return entities_list.items[0].pullEntityDataAndDoSomething();
}

// @wasm
pub fn getWorldData(world: u16, layer: u16, x: u16, y: u16) u16 {
    for (0..editor.new_worlds.items.len) |nw| {
        if (editor.new_worlds.items[nw].items[0] == world) {
            var w = editor.new_worlds.items[nw].items[1];
            // TODO: Layers
            var index: u16 = y * w + x + 3;
            return editor.new_worlds.items[nw].items[index];
        }
    }
    // if (editor.new_worlds.items[world].items.len > 0) {
    //     var w = editor.new_worlds.items[world].items[0].items[1];
    //     var index: u16 = y * w + x;
    //     return editor.new_worlds.items[world].items[layer + 1].items[index];
    // }
    if (world >= embeds.total_worlds) {
        var offset_index: u16 = world - embeds.total_worlds;
        // iterate over editor.world_layer until you get a match
        var cursor: u16 = 0;
        var layer_index: u16 = 0;
        while (cursor < editor.world_layer.items.len) {
            var e_world: u16 = editor.world_layer.items[cursor];
            var e_layer: u16 = editor.world_layer.items[(cursor + 1)];
            if (e_world == offset_index and e_layer == layer) {
                layer_index = layer;
                break;
            }
            cursor += 2;
        }
        var w = editor.worlds.items[offset_index].items[0];
        var index: u16 = y * w * x + 1; // +1 = layer type
        return editor.layers.items[layer_index].items[index];
    } else {
        for (0..editor.world_modifications.items.len) |wmi| {
            var edited_world = editor.world_modifications.items[wmi].items[0];
            var edited_layer = editor.world_modifications.items[wmi].items[1];
            var edited_x = editor.world_modifications.items[wmi].items[2];
            var edited_y = editor.world_modifications.items[wmi].items[3];
            if (edited_world == world and edited_layer == layer and edited_x == x and edited_y == y) {
                return editor.world_modifications.items[wmi].items[4];
            }
        }
        const world_layer_file_name = std.fmt.allocPrint(allocator, "world_{d}_layer_{d}.bin", .{world, layer}) catch unreachable;
        const world_size_file_name = std.fmt.allocPrint(allocator, "world_{d}_size.bin", .{world}) catch unreachable;
        var world_layer_file_name_index: usize = 0;
        var world_size_file_index: usize = 0;
        for (embeds.file_names, 0..) |name, i| {
            if (std.mem.eql(u8, name, world_layer_file_name)) {
                world_layer_file_name_index = i;
            } else if (std.mem.eql(u8, name, world_size_file_name)) {
                world_size_file_index = i;
            }
        }
        var w = readFromEmbeddedFile(world_size_file_index, 0, 0);
        var index: u16 = y * w + x;
        return readFromEmbeddedFile(world_layer_file_name_index, index, 0);
    }
}
// @wasm
pub fn getWorldSizeWidth(world: u16) u16 {
    for (0..editor.new_worlds.items.len) |nw| {
        if (editor.new_worlds.items[nw].items[0] == world) {
            return editor.new_worlds.items[nw].items[1];
        }
    }
    // if (editor.new_worlds.items[world].items.len > 0) {
    //     return editor.new_worlds.items[world].items[0].items[0];
    // }
    if (world >= embeds.total_worlds) {
        var offset_index: u16 = world - embeds.total_worlds;
        return editor.worlds.items[offset_index].items[0];
    } else {
        // TODO: Search for width / height modifications??
        // for (0..editor.world_modifications.items.len) |wmi| {}
        const world_size_file_name = std.fmt.allocPrint(allocator, "world_{d}_size.bin", .{world}) catch unreachable;
        var world_size_file_index: usize = 0;
        for (embeds.file_names, 0..) |name, i| {
            if (std.mem.eql(u8, name, world_size_file_name)) {
                world_size_file_index = i;
            }
        }
        return readFromEmbeddedFile(world_size_file_index, 0, 0);
    }

}
// @wasm
pub fn getWorldSizeHeight(world: u16) u16 {
    for (0..editor.new_worlds.items.len) |nw| {
        if (editor.new_worlds.items[nw].items[0] == world) {
            return editor.new_worlds.items[nw].items[2];
        }
    }
    // if (editor.new_worlds.items[world].items.len > 0) {
    //     return editor.new_worlds.items[world].items[0].items[1];
    // }
    if (world >= embeds.total_worlds) {
        var offset_index: u16 = world - embeds.total_worlds;
        return editor.worlds.items[offset_index].items[1];
    } else {
        // TODO: Search for width / height modifications??
        // for (0..editor.world_modifications.items.len) |wmi| {}
        const world_size_file_name = std.fmt.allocPrint(allocator, "world_{d}_size.bin", .{world}) catch unreachable;
        var world_size_file_index: usize = 0;
        for (embeds.file_names, 0..) |name, i| {
            if (std.mem.eql(u8, name, world_size_file_name)) {
                world_size_file_index = i;
            }
        }
        return readFromEmbeddedFile(world_size_file_index, 1, 0);
    }
}

// array of entities with just type like you have now
// another array file called entity_{id}_components.bin
// -- indexes determine whether a component is off or on
// another array file called entity_{id}_component_values.bin
// -- stores a flat array of all possible values across all components
// -- ideally when exporting an entity you will go over all the total possible values for all components of the given entity TYPE and then spit out a flat array with all that
// @wasm
pub fn getWorldAtViewport(layer: u16, x: u16, y: u16) u16 {
    // TODO: Camera offset and all that
    if (
        x >= viewport.getPaddingLeft() and
        y >= viewport.getPaddingTop() and
        x < (viewport.getSizeWidth() - viewport.getPaddingRight()) and
        y < (viewport.getSizeHeight() - viewport.getPaddingBottom())
    ) {
        var world_x = x - viewport.getPaddingLeft();
        var world_y = y - viewport.getPaddingTop();
        return getWorldData(current_world_index, layer, world_x, world_y); 
    }
    return 0;
}


const hc = @import("components/health.zig").ComponentHealth;
var healthComponent = hc{.default_value = 10, .current_value = 10};

// @wasm
pub fn input(key: u16) void {
    if (key == 0) {
        // embeds.embeds[1]
        healthComponent.addHealth();
        // purposefully return nothing
    }
}
// @wasm
pub fn getHealth() u16 {
    return healthComponent.current_value;
    // const healthComponent = @import("components/health.zig").ComponentHealth;
    // healthComponent.init();
    // healthComponent.setHealth(0, 20);
    // return healthComponent.getCurrent();
}



test "string_stuff" {
    const str = try std.fmt.allocPrint(allocator, "world_{d}_layer_{d}.bin", .{0, 0});
    try std.testing.expect(std.mem.eql(u8, str, "world_0_layer_0.bin") == true);
}

test "raw_enums" {
    var enumint: u16 = helpers.enumToU16(enums.WorldsEnum, enums.WorldsEnum.World1);
    var some_value: u16 = 0;
    try std.testing.expect(enumint == 0);
    try std.testing.expect(some_value == @intFromEnum(enums.WorldsEnum.World1));
}

test "entity_components" {
    var entity: [3]u16 = .{ 2, 0, 0 };
    try std.testing.expect(entity[0] == 2);
    const health = @import("components/health.zig");
    std.debug.print("\n{s}\n", .{@typeName(health)});
    // entity[2] = health;
    // try std.testing.expect(entity[2].default_value == 10);
}
