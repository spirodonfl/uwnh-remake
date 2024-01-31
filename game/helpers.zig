const std = @import("std");

pub fn multiply(a: u16, b: u16) u16 { return a * b; }
pub fn add(a: u16, b: u16) u16 { return a + b; }
// TODO: This seems a bit redunant, remove it?
pub fn enumToUsize(comptime E: type, value: E) usize {
    return @as(usize, @intFromEnum(value));
}
// TODO: This seems a bit redundant, remove it?
pub fn enumToU16(comptime E: type, value: E) u16 {
    return @intFromEnum(value);
}

test "multiply" {
    try std.testing.expect(multiply(2, 3) == 6);
}
test "add" {
    try std.testing.expect(add(2, 3) == 5);
}

const embeds = @import("embeds.zig");
var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();
pub fn getEntityFileIndex(id: u16) usize {
    const file_name = std.fmt.allocPrint(allocator, "entity_{d}.bin", .{id}) catch unreachable;
    var file_name_index: usize = 0;
    var found: bool = false;
    for (embeds.file_names, 0..) |name, i| {
        if (std.mem.eql(u8, name, file_name)) {
            file_name_index = i;
            found = true;
            break;
        }
    }
    if (found == false) {
        std.log.info("Looked for entity file with ID: {d}", .{id});
        @panic("Entity file not found!");
    }
    return file_name_index;
}
pub fn getWorldFileIndex(id: u16) usize {
    const file_name = std.fmt.allocPrint(allocator, "world_{d}.bin", .{id}) catch unreachable;
    var file_name_index: usize = 0;
    var found: bool = false;
    for (embeds.file_names, 0..) |name, i| {
        if (std.mem.eql(u8, name, file_name)) {
            file_name_index = i;
            found = true;
            break;
        }
    }
    if (found == false) {
        std.log.info("Looked for world file with ID: {d}", .{id});
        @panic("World file not found!");
    }
    return file_name_index;
}
// pub fn getWorldLayerFileIndex
// pub fn getWorldSizeFileIndex
// Maybe take the two functions above and have them set as a paramter in getWorldFileIndex where you choose the type of file you want to grab the index of
