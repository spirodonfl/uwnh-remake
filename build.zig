const std = @import("std");
const Builder = @import("std").build.Builder;

pub fn build(b: *Builder) !void {
    const sourcePath = b.pathFromRoot("game/enums.zig");
    const destPath = b.pathFromRoot("scripts/copied_game_enums.zig");
    // Open the source file
    const sourceFile = try std.fs.cwd().openFile(sourcePath, .{});
    defer sourceFile.close();
    // Open the destination file
    const destFile = try std.fs.cwd().createFile(destPath, .{});
    defer destFile.close();
    // Buffer to hold the chunk of data being read
    var buffer: [4096]u8 = undefined;
    // Read and write the file in chunks
    while (true) {
        const bytesRead = try sourceFile.read(buffer[0..]);
        if (bytesRead == 0) break; // End of file
        _ = try destFile.write(buffer[0..bytesRead]);
    }

    const optimize = b.standardOptimizeOption(.{});
    const embed_gen = b.addExecutable(.{
        .name = "embed_gen",
        .root_source_file = .{ .path = "scripts/output_embeds.zig" },
    });
    const embed_gen_step = b.addRunArtifact(embed_gen);

    const enum_gen = b.addExecutable(.{
        .name = "enum_gen",
        .root_source_file = .{ .path = "scripts/output_enum_getters.zig" },
    });
    const enum_gen_step = b.addRunArtifact(enum_gen);
    enum_gen_step.addArg(b.pathFromRoot("game/enums.zig"));
    enum_gen_step.addArg(b.pathFromRoot("scripts/copied_game_enums.zig"));

    const wasm_exports = blk: {
        const gen_exe = b.addExecutable(.{
            .name = "output_wasm_exports",
            .root_source_file = .{ .path = "scripts/output_wasm_exports.zig" },
        });
        const gen = b.addRunArtifact(gen_exe);
        const wasm_exports_zig = gen.addOutputFileArg("wasmexports.zig");
        gen.addArg(b.pathFromRoot("web/scripts/js.bindings.js"));
        inline for (&.{ "diff", "editor", "game", "viewport", "messages", "events", "enumgetters" }) |name| {
            gen.addFileArg(.{ .path = b.pathFromRoot("game/" ++ name ++ ".zig") });
        }

        break :blk b.createModule(.{
            .source_file = wasm_exports_zig,
        });
    };

    const game_enums_module = b.createModule(.{
        .source_file = .{ .path = "game/enums.zig" },
        .dependencies = &.{},
    });

    const game = b.addSharedLibrary(.{
        .name = "game",
        .root_source_file = .{ .path = "game/wasm.zig" },
        .target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        },
        .optimize = optimize,
    });
    game.addModule("wasmexports", wasm_exports);
    game.addModule("game_enums", game_enums_module);
    game.rdynamic = true;
    // enum_gen_step.step.dependOn(&copy_game_enums.step);
    // game.step.dependOn(&copy_game_enums.step);
    game.step.dependOn(&embed_gen_step.step);
    game.step.dependOn(&enum_gen_step.step);
    b.installArtifact(game);

    const copy_output_to_root = b.addInstallBinFile(game.getEmittedBin(), "../../web/wasm/game.wasm");
    b.getInstallStep().dependOn(&copy_output_to_root.step);
}