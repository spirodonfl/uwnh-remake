pub var embeds = [_][]const u8{
    @embedFile("binaries/entity_0.bin"),
    @embedFile("binaries/player.bin"),
    @embedFile("binaries/world_0_layer_0.bin"),
    @embedFile("binaries/world_0_layer_1.bin"),
    @embedFile("binaries/world_0_layer_2.bin"),
    @embedFile("binaries/world_0_size.bin")
};

pub const file_names = [_][]const u8{
    "entity_0.bin",
    "player.bin",
    "world_0_layer_0.bin",
    "world_0_layer_1.bin",
    "world_0_layer_2.bin",
    "world_0_size.bin"
};

pub const total_worlds: u16 = 4;
pub const total_entities: u16 = 1;