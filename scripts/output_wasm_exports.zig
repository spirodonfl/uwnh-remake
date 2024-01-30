// TODO: Can we use macros to do these definition exports for wasm functions?

const std = @import("std");
const mem = @import("std").mem;
const ArrayList = std.ArrayList;
var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();

const prefix: []const u8 = "game";

pub fn main() !void {
    const cmdline_args = (try std.process.argsAlloc(allocator))[1..];
    if (cmdline_args.len < 2) {
        std.log.err("expected at least 2 cmdline args", .{});
        std.os.exit(0xff);
    }
    const out_file_zig = cmdline_args[0];
    const out_file_js = cmdline_args[1];

    const PP_file = try std.fs.cwd().createFile(out_file_zig, .{ .read = true });
    defer PP_file.close();
    const js_file = try std.fs.cwd().createFile(out_file_js, .{});
    defer js_file.close();
    const js_writer = js_file.writer();
    try js_writer.writeAll("const _WASM_IMPORTS = {\n");

    for (cmdline_args[2..]) |full_file| {
        const base_name = std.fs.path.basename(full_file);
        const file_name = base_name[0 .. base_name.len - 4];
        var file = try std.fs.cwd().openFile(full_file, .{});
        // defer file.close();

        var buf_reader = std.io.bufferedReader(file.reader());
        var in_stream = buf_reader.reader();

        // const first_line = try std.fmt.allocPrint(allocator, "{s}{s}{s}{s}{s}", .{"const ", file_name, " = @import(\"", file_name, ".zig\");\n"});
        // TODO: Update other files where you use allocPrint with this
        try PP_file.writer().print("const {s} = @import(\"root\").{0s};\n", .{file_name});
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
                try js_writer.print("    {s}_{s}(", .{file_name, fn_name});
                try PP_file.writeAll(fn_name);
                try PP_file.writeAll("(");
                const end = std.mem.indexOf(u8, line, ")").?;
                const squirelly = std.mem.indexOf(u8, line, "{").?;
                const return_type: struct { without_error: []const u8, has_error: bool} = blk: {
                    const return_type_part = std.mem.trimLeft(u8, line[end..squirelly], ")");
                    const return_type_full = std.mem.trimLeft(u8, return_type_part, " ");
                    if (std.mem.startsWith(u8, return_type_full, "!"))
                        break :blk .{ .without_error = return_type_full[1..], .has_error = true };
                    break :blk .{ .without_error = return_type_full, .has_error = false };
                };
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
                try PP_file.writeAll(return_type.without_error);
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
                for (param_list.items, 0..) |name, i| {
                    const sep: []const u8 = if (i == 0) "" else ", ";
                    try js_writer.print("{s}{s}", .{sep, name});
                }
                try js_writer.writeAll(") {},\n");
                const catch_clause: []const u8 = if (return_type.has_error)
                    " catch |e| game.uncaughtError(e)"
                else
                    "";
                try PP_file.writer().print("){s};\n", .{catch_clause});
                try PP_file.writeAll("}");
                try PP_file.writeAll("\n");
            }
        }
        file.close();
    }

    try js_writer.writeAll("};\n");
}
