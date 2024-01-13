const std = @import("std");
const Builder = @import("std").build.Builder;

pub fn build(b: *Builder) void {
    const game = b.addSharedLibrary(.{
        .name = "game",
        .root_source_file = .{ .path = "game.zig" },
        .target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
            .abi = .musl,
        },
        .optimize = .ReleaseSmall,
    });

    b.installArtifact(game);
}
