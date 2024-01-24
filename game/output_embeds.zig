const std = @import("std");

var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();

pub fn main() !void {
    const PP_file = try std.fs.cwd().createFile("game/embeds.zig", .{ .read = true });
    defer PP_file.close();

    var dir = try std.fs.cwd().openIterableDir("game/binaries", .{});
    var it = dir.iterate();

    var buffer_embeds = std.ArrayList(u8).init(allocator);
    var buffer_names = std.ArrayList(u8).init(allocator);
    var total_worlds: u16 = 0;
    var total_entities: u16 = 0;

    // try PP_file.writer().print(
    //     \\pub var assets = [_][]const u8{
    // , .{});
    try PP_file.writeAll("pub var embeds = [_][]const u8{\n");

    while (try it.next()) |entry| {
        switch (entry.kind) {
            .file => {
                // try PP_file.writer().print(
                //     \\pub const world_{d} = @embedFile("binaries/{s}");
                //     \\
                // , .{world_i, entry.name});
                // try PP_file.writer().print(
                //     \\@embedFile("binaries/{s}")
                // , .{entry.name});

                // Note: Keeping this commented here in case it's useful down the road
                var underscore = std.mem.split(u8, entry.name[0..entry.name.len], "_");
                while (underscore.next()) |u| {
                    // std.debug.print("{s}\n", .{u});
                    var end: []const u8 = undefined;
                    var ending = std.mem.split(u8, u[0..u.len], ".");
                    var ending_i: u16 = 0;
                    while (ending.next()) |e| {
                        if (ending_i == 0) {
                            // std.debug.print("{s}\n", .{e});
                            end = e;
                        }
                        ending_i += 1;
                    }
                    if (ending_i > 1) {
                        // Means we got .bin entry
                        // std.debug.print("End: {s}\n", .{end});
                    } else {
                        if (std.mem.eql(u8, u, "world")) {
                            total_worlds += 1;
                        } else if (std.mem.eql(u8, u, "entity")) {
                            total_entities += 1;
                        }
                    }
                }
                
                try buffer_embeds.appendSlice("    @embedFile(\"binaries/");
                try buffer_embeds.appendSlice(entry.name);
                try buffer_embeds.append('"');
                try buffer_embeds.append(')');
                try buffer_embeds.append(',');
                try buffer_embeds.append('\n');

                try buffer_names.appendSlice("    ");
                try buffer_names.append('"');
                try buffer_names.appendSlice(entry.name);
                try buffer_names.append('"');
                try buffer_names.append(',');
                try buffer_names.append('\n');
            },
            .directory => {
                // try addFiles(b, exe, name);
            },
            else => {},
        }
    }

    if (buffer_embeds.items.len > 0) {
        _ = buffer_embeds.pop();
        _ = buffer_embeds.pop();
    }
    if (buffer_names.items.len > 0) {
        _ = buffer_names.pop();
        _ = buffer_names.pop();
    }

    const embeds = try buffer_embeds.toOwnedSlice();
    try PP_file.writeAll(embeds);

    // try PP_file.writer().print(
    //     \\};
    // , .{});
    try PP_file.writeAll("\n};");
    try PP_file.writeAll("\n");
    try PP_file.writeAll("\n");
    try PP_file.writeAll("pub const file_names = [_][]const u8{\n");
    const names = try buffer_names.toOwnedSlice();
    try PP_file.writeAll(names);
    try PP_file.writeAll("\n};");
    try PP_file.writeAll("\n");
    try PP_file.writeAll("\n");
    try PP_file.writeAll("pub const total_worlds: u16 = ");
    try PP_file.writeAll(try std.fmt.allocPrint(allocator, "{d}", .{total_worlds}));
    try PP_file.writeAll(";");
    try PP_file.writeAll("\n");
    try PP_file.writeAll("pub const total_entities: u16 = ");
    try PP_file.writeAll(try std.fmt.allocPrint(allocator, "{d}", .{total_entities}));
    try PP_file.writeAll(";");

}
