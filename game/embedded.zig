const std = @import("std");

const game = @import("game.zig");
const enums = @import("enums.zig");
const embeds = @import("embeds.zig");

// TODO: Rename this eventually because it's grown past just embedded data
pub const EmbeddedDataStruct = struct {
    file_index: u16 = undefined,
    // Note: we have raw_data so we can either load raw_data from the embed
    // or so we can create structs without having to use an embed at all and
    // we retain compliance with other structs that required the use of embeddeddatastruct
    raw_data: std.ArrayListUnmanaged(u16) = .{},
    // TODO: How do we deal with optional parameters like layer here?
    pub fn findIndexByFileName(self: *EmbeddedDataStruct, data_type: enums.EmbeddedDataType, index: u16, layer: u16) !bool {
        var buf: [256]u8 = undefined;
        // TODO: Can we do better than (layer - 1)
        const file_name = switch (data_type) {
            .world => try std.fmt.bufPrint(&buf, "world_{d}_data.bin", .{index}),
            .entity => try std.fmt.bufPrint(&buf, "entity_{d}.bin", .{index}),
            .world_layer => try std.fmt.bufPrint(&buf, "world_{d}_layer_{d}.bin", .{ index, (layer - 1) }),
        };

        for (embeds.file_names, 0..) |name, i| {
            if (std.mem.eql(u8, name, file_name)) {
                self.file_index = @intCast(i);
                return true;
            }
        }
        return false;
    }
    pub fn getLength(self: *EmbeddedDataStruct) u16 {
        if (self.raw_data.items.len > 0) {
            return @as(u16, @intCast(self.raw_data.items.len));
        }
        return @as(u16, @intCast(embeds.embeds[self.file_index].len));
    }
    pub fn firstMemoryLocation(self: *EmbeddedDataStruct) !*u16 {
        if (self.raw_data.items.len == 0) {
            try self.readToRawData();
        }
        return &self.raw_data.items[0];
    }
    pub fn readData(self: *EmbeddedDataStruct, index: u16, endian: std.builtin.Endian) u16 {
        // std.log.info("readData({})", .{index});
        if (self.raw_data.items.len > 0) {
            return self.raw_data.items[index];
        }
        const filebytes = embeds.embeds[self.file_index];
        const pulled_value = std.mem.readInt(u16, filebytes[index * 2 ..][0..2], endian);
        return pulled_value;
    }
    pub fn readToRawData(self: *EmbeddedDataStruct) !void {
        if (self.raw_data.items.len == 0) {
            // std.log.info("about to read raw data", .{});
            var length: u16 = @as(u16, @intCast(embeds.embeds[self.file_index].len));
            length = length / 2;
            try self.raw_data.resize(game.allocator, length);
            for (0..length) |i| {
                var i_converted = @as(u16, @intCast(i));
                // TODO: Cannot use self.readData because, as you fill this up, you trigger raw_data.items.len > 0 and it fails
                const filebytes = embeds.embeds[self.file_index];
                const value = std.mem.readInt(u16, filebytes[i_converted * 2 ..][0..2], .Little);
                // std.log.info("value {d}",.{value});
                self.raw_data.items[i_converted] = value;
                // std.log.info("new_data[i] {d}",.{self.raw_data.items[i_converted]});
            }
            // std.log.info("done reading raw data (length: {d})", .{self.raw_data.items.len});
        }
    }
    pub fn appendToRawData(self: *EmbeddedDataStruct, value: u16) !void {
        try self.raw_data.append(game.allocator, value);
    }
    pub fn clearRawData(self: *EmbeddedDataStruct) !void {
        try self.raw_data.resize(game.allocator, 0);
    }
};