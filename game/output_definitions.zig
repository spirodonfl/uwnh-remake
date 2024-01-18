const std = @import("std");
const unicode = @import("std").unicode;
const mem = @import("std").mem;
const ArrayList = std.ArrayList;

// const std = @import("std");
// test {
//     const u_strs = [_][]const u21{
//         comptime toUnicodeSlice("export"),
//     };
//     std.debug.print("xs={u}\n", .{u_strs});
// }
//
// fn toUnicodeSlice(bytes: []const u8) []const u21 {
//     comptime {
//         if (!std.unicode.utf8ValidateSlice(bytes)) @panic("invalid utf8");
//         var result: []const u21 = &.{};
//         var iter = std.unicode.Utf8Iterator{ .bytes = bytes, .i = 0 };
//         while (iter.nextCodepoint()) |cp| {
//             result = result ++ [1]u21{cp};
//         }
//         return result;
//     }
// }

// std.mem.startsWith(u8, "Haystack stuff", "needle")

pub fn main() !void {
    var file = try std.fs.cwd().openFile("game/game.zig", .{});
    defer file.close();

    var buf_reader = std.io.bufferedReader(file.reader());
    var in_stream = buf_reader.reader();

    const PP_file = try std.fs.cwd().createFile("web/scripts/js.bindings.js", .{ .read = true });
    try PP_file.writeAll("const _WASM_IMPORTS = {\n");
    defer PP_file.close();

    var buf: [1024]u8 = undefined;
    while (try in_stream.readUntilDelimiterOrEof(&buf, '\n')) |line| {
        // std.debug.print("Line Length: {s}\n", .{line});

        var is_line_we_want: bool = std.mem.startsWith(u8, line, "export fn");
        if (is_line_we_want) {
            // std.debug.print("Line: {s}\n", .{line});
            // std.debug.print("Test {any}\n", .{std.mem.indexOf(u8, line, ": u16")});

            // for (line) |the_line| {
            //     std.debug.print("LINE: {d} ", .{the_line});
            // }

            const start = std.mem.indexOf(u8, line, "(").?;
            const fn_name = line[10..start];
            // std.debug.print("FN NAME: {s}\n", .{fn_name});
            try PP_file.writeAll("    ");
            try PP_file.writeAll(fn_name);
            try PP_file.writeAll("(");
            const end = std.mem.indexOf(u8, line, ")").?;
            var iter = std.mem.split(u8, line[start..end], ",");
            var param_index: u8 = 0;
            while (iter.next()) |param| {
                var param_iter = std.mem.split(u8, param, ":");
                const name = std.mem.trimLeft(u8, param_iter.next().?, "( ");
                // std.debug.print("Arg: {s}\n", .{name});
                if (param_index != 0) {
                    try PP_file.writeAll(", ");
                }
                try PP_file.writeAll(name);
                param_index += 1;
            }
            try PP_file.writeAll(")");
            try PP_file.writeAll(" {},\n");
        }

        // var nl: []u21 = undefined;
        // var nl_i: u8 = 0;
        // var looking_for: [9]u21 = .{'e','x','p','o','r','t', ' ', 'f', 'n'};
        // var looking_for_cursor: u8 = 0;
        // var iter = (try unicode.Utf8View.init(line)).iterator();
        // var f: u16 = 0;
        // while (iter.nextCodepoint()) |cp| {
        //     if (f < 9) {
        //         if (cp == looking_for[looking_for_cursor]) {
        //             looking_for_cursor += 1;
        //         }
        //     }
        //     if (looking_for_cursor == 9) {
        //         nl[nl_i] = cp;
        //     }
        //     f += 1;
        // }

        // if (looking_for_cursor == 9) {
        // //     var nl: []const u8 = line;
        // //     nl = nl[9..];
        // //     nl = mem.trimRight(u8, nl, ")");
        // //     std.debug.print("Success {s}\n", .{nl});
        //     var nll: []const u8 = @as([]u8, nl);
        //     try PP_file.writeAll(nll);
        //     try PP_file.writeAll("\n");
        // }

    }
    try PP_file.writeAll("};");
}
