// TODO: Can we use macros to do these definition exports for wasm functions?

const std = @import("std");
const mem = @import("std").mem;
const ArrayList = std.ArrayList;
var gpa_allocator = std.heap.GeneralPurposeAllocator(.{}){};
var allocator = gpa_allocator.allocator();

pub fn main() !void {
    const cmdline_args = (try std.process.argsAlloc(allocator))[1..];
    if (cmdline_args.len < 2) {
        std.log.err("expected at least 2 cmdline args", .{});
        std.os.exit(0xff);
    }

    // --------- THIS WORKS IN build.zig ----------------
    // std.debug.print("Copying enums file from: {s}\n", .{cmdline_args[0]});
    // std.debug.print("Copying enums file to: {s}\n", .{cmdline_args[1]});
    // // const sourcePath = b.pathFromRoot("game/enums.zig");
    // const sourcePath = cmdline_args[0];
    // // const destPath = b.pathFromRoot("scripts/copied_game_enums.zig");
    // const destPath = cmdline_args[1];
    // // Open the source file
    // const sourceFile = try std.fs.cwd().openFile(sourcePath, .{});
    // defer sourceFile.close();
    // // Open the destination file
    // const destFile = try std.fs.cwd().createFile(destPath, .{});
    // defer destFile.close();
    // // Buffer to hold the chunk of data being read
    // var buffer: [4096]u8 = undefined;
    // // Read and write the file in chunks
    // while (true) {
    //     const bytesRead = try sourceFile.read(buffer[0..]);
    //     if (bytesRead == 0) break; // End of file
    //     _ = try destFile.write(buffer[0..bytesRead]);
    // }

    const PP_file = try std.fs.cwd().createFile("./game/enumgetters.zig", .{ .read = true });
    defer PP_file.close();

    try PP_file.writeAll("const enums = @import(\"enums.zig\");\n\n");
    
    const game_enums = @import("copied_game_enums.zig");
    
    inline for (@typeInfo(game_enums.WorldDataEnum).Enum.fields) |f| {
        const fn_name = "WorldData_" ++ f.name;
        const fn_body = "return enums.WorldDataEnum." ++ f.name ++ ".int();";
        const fn_decl = "// @wasm\npub fn " ++ fn_name ++ "() u16 {\n    " ++ fn_body ++ "\n}";
        try PP_file.writeAll(fn_decl);
        try PP_file.writeAll("\n\n");
    }

    inline for (@typeInfo(game_enums.EntityDataEnum).Enum.fields) |f| {
        const fn_name = "EntityData_" ++ f.name;
        const fn_body = "return enums.EntityDataEnum." ++ f.name ++ ".int();";
        const fn_decl = "// @wasm\npub fn " ++ fn_name ++ "() u16 {\n    " ++ fn_body ++ "\n}";
        try PP_file.writeAll(fn_decl);
        try PP_file.writeAll("\n\n");
    }

    inline for (@typeInfo(game_enums.DirectionsEnum).Enum.fields) |f| {
        const fn_name = "Directions_" ++ f.name;
        const fn_body = "return enums.DirectionsEnum." ++ f.name ++ ".int();";
        const fn_decl = "// @wasm\npub fn " ++ fn_name ++ "() u16 {\n    " ++ fn_body ++ "\n}";
        try PP_file.writeAll(fn_decl);
        try PP_file.writeAll("\n\n");
    }

    inline for (@typeInfo(game_enums.ReturnsEnum).Enum.fields) |f| {
        const fn_name = "Returns_" ++ f.name;
        const fn_body = "return enums.ReturnsEnum." ++ f.name ++ ".int();";
        const fn_decl = "// @wasm\npub fn " ++ fn_name ++ "() u16 {\n    " ++ fn_body ++ "\n}";
        try PP_file.writeAll(fn_decl);
        try PP_file.writeAll("\n\n");
    }

    inline for (@typeInfo(game_enums.ComponentsEnum).Enum.fields) |f| {
        const fn_name = "Components_" ++ f.name;
        const fn_body = "return enums.ComponentsEnum." ++ f.name ++ ".int();";
        const fn_decl = "// @wasm\npub fn " ++ fn_name ++ "() u16 {\n    " ++ fn_body ++ "\n}";
        try PP_file.writeAll(fn_decl);
        try PP_file.writeAll("\n\n");
    }

    inline for (@typeInfo(game_enums.DiffListTypesEnum).Enum.fields) |f| {
        const fn_name = "DiffListTypes_" ++ f.name;
        const fn_body = "return enums.DiffListTypesEnum." ++ f.name ++ ".int();";
        const fn_decl = "// @wasm\npub fn " ++ fn_name ++ "() u16 {\n    " ++ fn_body ++ "\n}";
        try PP_file.writeAll(fn_decl);
        try PP_file.writeAll("\n\n");
    }
}
