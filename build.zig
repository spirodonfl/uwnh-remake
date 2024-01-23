const std = @import("std");
const Builder = @import("std").build.Builder;

fn addFiles(b: *std.Build, exe: *std.Build.CompileStep, folder: []const u8) !void {
    var dir = try std.fs.cwd().openIterableDir(folder, .{});
    var it = dir.iterate();

    while (try it.next()) |entry| {
        const name = try std.fmt.allocPrint(b.allocator, "{s}/{s}", .{ folder, entry.name });
        std.debug.print("adding for embedding {s}\n", .{name});
        switch (entry.kind) {
            .file => {
                exe.addAnonymousModule(name, .{
                    .source_file = std.build.FileSource.relative(name),
                });
            },
            .directory => {
                try addFiles(b, exe, name);
            },
            else => {},
        }
    }
}

pub fn build(b: *Builder) !void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const game = b.addSharedLibrary(.{
        .name = "game",
        .root_source_file = .{ .path = "game/wasm.zig" },
        .target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        },
        .optimize = .ReleaseSmall,
    });
    game.rdynamic = true;
    try addFiles(b, game, "game/binaries/");
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
