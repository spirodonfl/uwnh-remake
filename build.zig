const std = @import("std");
const Builder = @import("std").build.Builder;

pub fn build(b: *Builder) !void {
    const embed_gen = b.addExecutable(.{
        .name = "embed_gen",
        .root_source_file = .{ .path = "scripts/output_embeds.zig" },
    });
    const gen_step = b.addRunArtifact(embed_gen);

    const wasm_exports = blk: {
        const gen_exe = b.addExecutable(.{
            .name = "output_wasm_exports",
            .root_source_file = .{ .path = "scripts/output_wasm_exports.zig" },
        });
        const gen = b.addRunArtifact(gen_exe);
        const wasm_exports_zig = gen.addOutputFileArg("wasmexports.zig");
        gen.addArg(b.pathFromRoot("web/scripts/js.bindings.js"));
        inline for (&.{"debug", "diff", "editor", "inputs", "game", "renderer", "viewport"}) |name| {
            gen.addFileArg(.{ .path = b.pathFromRoot("game/" ++ name ++ ".zig") });
        }

        break :blk b.createModule(.{
            .source_file = wasm_exports_zig,
        });
    };

    const game = b.addSharedLibrary(.{
        .name = "game",
        .root_source_file = .{ .path = "game/wasm.zig" },
        .target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        },
        // .optimize = .ReleaseSmall,
        .optimize = .Debug,
    });
    game.addModule("wasmexports", wasm_exports);
    game.rdynamic = true;
    game.step.dependOn(&gen_step.step);
    b.installArtifact(game);

    const copy_output_to_root = b.addInstallBinFile(game.getEmittedBin(), "../../web/wasm/game.wasm");
    b.getInstallStep().dependOn(&copy_output_to_root.step);
}
