const std = @import("std");
const Builder = @import("std").build.Builder;

pub fn build(b: *Builder) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const game = b.addSharedLibrary(.{
        .name = "game",
        .root_source_file = .{ .path = "game/game.zig" },
        .target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        },
        .optimize = .ReleaseSmall,
    });
    game.rdynamic = true;
    b.installArtifact(game);

    const bindgen = b.addExecutable(.{
        .name = "bindgen",
        .root_source_file = .{ .path = "game/output_definitions.zig" },
        .target = target,
        .optimize = optimize,
    });
    const run_bindgen = b.addRunArtifact(bindgen);
    b.getInstallStep().dependOn(&run_bindgen.step);

    const copy_output_to_root = b.addInstallBinFile(game.getEmittedBin(), "../../web/wasm/game.wasm");
    b.getInstallStep().dependOn(&copy_output_to_root.step);
}
