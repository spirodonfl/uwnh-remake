const std = @import("std");

var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();

pub fn main() !void {
    const PP_file = try std.fs.cwd().createFile("game/_embeds.zig", .{ .read = true });
    defer PP_file.close();

    var dir = try std.fs.cwd().openIterableDir("game/binaries", .{});
    var it = dir.iterate();

    var world_i: u16 = 0;
    while (try it.next()) |entry| {
        switch (entry.kind) {
            .file => {
                try PP_file.writer().print(
                    \\pub const world_{d} = @embedFile("binaries/{s}");
                    \\
                , .{world_i, entry.name});
                world_i += 1;
                // const file_name = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ "game/binaries", entry.name });
                // try PP_file.writeAll("pub const world_two = @embedFile(\"");
                // try PP_file.writeAll(file_name);
                // try PP_file.writeAll("\");\n");
            },
            .directory => {
                // try addFiles(b, exe, name);
            },
            else => {},
        }
    }
}
