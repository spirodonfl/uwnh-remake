// TODO: Can we use macros to do these definition exports for wasm functions?

const std = @import("std");
const mem = @import("std").mem;
const ArrayList = std.ArrayList;
var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();

const prefix: []const u8 = "game";
const files = [_][]const u8{"debug", "diff", "editor", "game", "renderer", "viewport"};

pub fn main() !void {
    const PP_file = try std.fs.cwd().createFile("game/wasm.zig", .{ .read = true });
    defer PP_file.close();

    try PP_file.writer().writeAll("pub const panic = @import(\"game.zig\").panic;\n");
    for (files) |file_name| {
        const full_file = try std.fmt.allocPrint(allocator, "{s}/{s}{s}", .{prefix, file_name, ".zig"});
        var file = try std.fs.cwd().openFile(full_file, .{});
        // defer file.close();

        var buf_reader = std.io.bufferedReader(file.reader());
        var in_stream = buf_reader.reader();

        // const first_line = try std.fmt.allocPrint(allocator, "{s}{s}{s}{s}{s}", .{"const ", file_name, " = @import(\"", file_name, ".zig\");\n"});
        // TODO: Update other files where you use allocPrint with this
        try PP_file.writer().print("const {s} = @import(\"{s}.zig\");\n", .{file_name, file_name});
        // try PP_file.writeAll(first_line);

        var buf: [1024]u8 = undefined;
        var is_line_we_want: bool = false;
        var was_line_we_want: bool = false;
        while (try in_stream.readUntilDelimiterOrEof(&buf, '\n')) |line| {
            // std.debug.print("Line Length: {s}\n", .{line});

            is_line_we_want = std.mem.startsWith(u8, line, "// @wasm");
            if (is_line_we_want) {
                was_line_we_want = true;
            } else if (was_line_we_want) {
                was_line_we_want = false;

                const decl_start = "pub const ";
                if (std.mem.startsWith(u8, line, decl_start)) {
                    const line_at_id = line[decl_start.len..];
                    const id = line_at_id[0 .. std.mem.indexOf(u8, line_at_id, " ").?];
                    try PP_file.writer().print("pub const {s} = {s}.{0s};\n", .{id, file_name});
                    continue;
                }

                // std.debug.print("Line: {s}\n", .{line});
                // std.debug.print("Test {any}\n", .{std.mem.indexOf(u8, line, ": u16")});
                const export_line = try std.fmt.allocPrint(allocator, "{s}{s}{s}", .{"export fn ", file_name, "_"});
                try PP_file.writeAll(export_line);
                const start = std.mem.indexOf(u8, line, "(").?;
                const fn_name = line[7..start];
                // std.debug.print("FN NAME: {s}\n", .{fn_name});
                try PP_file.writeAll(fn_name);
                try PP_file.writeAll("(");
                const end = std.mem.indexOf(u8, line, ")").?;
                const squirelly = std.mem.indexOf(u8, line, "{").?;
                const return_type = std.mem.trimLeft(u8, line[end..squirelly], ")");
                var iter = std.mem.split(u8, line[start..end], ",");
                var param_index: u8 = 0;
                var param_list: ArrayList([]const u8) = ArrayList([]const u8).init(allocator);
                defer param_list.deinit();
                while (iter.next()) |param| {
                    var param_iter = std.mem.split(u8, param, ":");
                    var param_iter_index: u8 = 0;
                    var param_name: []const u8 = undefined;
                    var param_type: []const u8 = undefined;
                    if (param_index != 0) {
                        try PP_file.writeAll(", ");
                    }
                    while (param_iter.next()) |pi| {
                        if (param_iter_index == 0) {
                            param_name = pi;
                            param_name = std.mem.trimLeft(u8, param_name, "( ");
                            try param_list.append(param_name);
                            try PP_file.writeAll(param_name);
                        } else if (param_iter_index == 1) {
                            param_type = pi;
                            try PP_file.writeAll(":");
                            try PP_file.writeAll(param_type);
                        }
                        param_iter_index += 1;
                    }
                    param_index += 1;
                }
                try PP_file.writeAll(")");
                try PP_file.writeAll(return_type);
                try PP_file.writeAll("{\n");
                const return_line = try std.fmt.allocPrint(allocator, "{s}{s}{s}", .{"    return ", file_name, "."});
                try PP_file.writeAll(return_line);
                try PP_file.writeAll(fn_name);
                try PP_file.writeAll("(");
                if (param_list.items.len > 0) {
                    for (param_list.items, 0..) |param, i| {
                        if (i != 0) {
                            try PP_file.writeAll(", ");
                        }
                        try PP_file.writeAll(param);
                    }
                }
                try PP_file.writeAll(");\n");
                try PP_file.writeAll("}");
                try PP_file.writeAll("\n");
            }
        }
        file.close();
    }
}
