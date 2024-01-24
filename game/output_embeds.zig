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

    try PP_file.writeAll("pub var embeds = [_][]const u8{\n");

    while (try it.next()) |entry| {
        switch (entry.kind) {
            .file => {
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
                
                try buffer_embeds.writer().print(
                    \\    @embedFile("binaries/{s}"),
                    \\
                , .{entry.name});

                try buffer_names.writer().print(
                    \\    "{s}",
                    \\
                , .{entry.name});
            },
            .directory => {
                // try addFiles(b, exe, name);
            },
            else => {},
        }
    }

    const embeds = try buffer_embeds.toOwnedSlice();
    try PP_file.writeAll(embeds);

    const names = try buffer_names.toOwnedSlice();
    try PP_file.writer().print(
        \\}};
        \\
        \\pub const file_names = [_][]const u8{{
        \\{s}
        \\}};
        \\
        \\pub const total_worlds: u16 = {d};
        \\pub const total_entities: u16 = {d};
    , .{names, total_worlds, total_entities});

}
