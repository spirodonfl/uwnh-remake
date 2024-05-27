const std = @import("std");

const game = @import("game.zig");
const enums = @import("enums.zig");
const entity = @import("entity.zig");

const EmbeddedDataStruct =  @import("embedded.zig").EmbeddedDataStruct;
const EntityDataStruct = entity.EntityDataStruct;
const ServiceEntityData = game.ServiceEntityData;

pub const WorldDataStruct = struct {
    embedded_data: EmbeddedDataStruct = undefined,
    embedded_layers: std.ArrayListUnmanaged(EmbeddedDataStruct) = .{},
    entities_list: std.ArrayListUnmanaged(u16) = .{},
    entities_initialized: bool = false,
    service_entities_list: ServiceEntityData = undefined,
    pub fn getTotalLayers(self: *WorldDataStruct) usize {
        return self.embedded_layers.items.len;
    }
    pub fn getCollisionLayer(self: *WorldDataStruct) u16 {
        return self.readData(enums.WorldDataEnum.CollisionLayer.int());
    }
    pub fn getEntityLayer(self: *WorldDataStruct) u16 {
        return self.readData(enums.WorldDataEnum.EntityLayer.int());
    }
    pub fn setTotalLayers(self: *WorldDataStruct, total_layers: u16) !void {
        if (self.embedded_data.raw_data.items.len == 0) {
            try self.embedded_data.readToRawData();
        }
        self.embedded_data.raw_data.items[enums.WorldDataEnum.TotalLayers.int()] = total_layers;
    }
    pub fn setEntityLayer(self: *WorldDataStruct, entity_layer: u16) !void {
        if (self.embedded_data.raw_data.items.len == 0) {
            try self.embedded_data.readToRawData();
        }
        self.embedded_data.raw_data.items[enums.WorldDataEnum.EntityLayer.int()] = entity_layer;
    }
    pub fn setCollisionLayer(self: *WorldDataStruct, collision_layer: u16) !void {
        if (self.embedded_data.raw_data.items.len == 0) {
            try self.embedded_data.readToRawData();
        }
        self.embedded_data.raw_data.items[enums.WorldDataEnum.CollisionLayer.int()] = collision_layer;
    }
    pub fn setEmbeddedData(self: *WorldDataStruct, embedded: EmbeddedDataStruct) void {
        self.embedded_data = embedded;
    }
    pub fn addEmbeddedLayer(self: *WorldDataStruct, embedded: EmbeddedDataStruct) !void {
        try self.embedded_layers.append(game.allocator, embedded);
    }
    pub fn readData(self: *WorldDataStruct, index: u16) u16 {
        return self.embedded_data.readData(index, .Little);
    }
    pub fn readLayer(self: *WorldDataStruct, layer_index: u16, index: u16) u16 {
        return self.embedded_layers.items[layer_index].readData(index, .Little);
    }
    pub fn getWidth(self: *WorldDataStruct) u16 {
        const enum_index = enums.WorldDataEnum.Width.int();
        const width = self.readData(enum_index);
        // std.log.info("width {d}",.{width});
        return width;
    }
    pub fn getHeight(self: *WorldDataStruct) u16 {
        const enum_index = enums.WorldDataEnum.Height.int();
        const height = self.readData(enum_index);
        // std.log.info("height {d}",.{height});
        return height;
    }
    pub fn getSize(self: *WorldDataStruct) u16 {
        const size = self.getWidth() * self.getHeight();
        // std.log.info("size {d}",.{size});
        return size;
    }
    pub fn getCoordinateData(self: *WorldDataStruct, layer: u16, x: u16, y: u16) u16 {
        var entity_layer = self.readData(enums.WorldDataEnum.EntityLayer.int());
        if (layer == entity_layer) {
            if (self.entities_initialized == false) {
                var index: u16 = (y * self.getWidth()) + x;
                const data = self.readLayer(layer, index);
                return data;
            } else {
                for (0..self.entities_list.items.len) |i| {
                    var entity_id = self.entities_list.items[i];
                    for (0..game.entities_list.len) |j| {
                        if (game.entities_list.at(j).getId() == entity_id) {
                            if (game.entities_list.at(j).position[0] == x and game.entities_list.at(j).position[1] == y) {
                                return entity_id;
                            }
                        }
                    }
                }
                // Note: Turning this on makes the editor see the value but the game doesn't update entities properly
                // var index: u16 = (y * self.getWidth()) + x;
                // const data = self.readLayer(layer, index);
                // return data;
            }
        } else {
            var index: u16 = (y * self.getWidth()) + x;
            const data = self.readLayer(layer, index);
            return data;
        }
        return 0;
    }
    pub fn checkEntityCollision(self: *WorldDataStruct, x: u16, y: u16) bool {
        for (0..self.entities_list.items.len) |i| {
            var entity_id = self.entities_list.items[i];
            for (0..game.entities_list.len) |j| {
                if (game.entities_list.at(j).getId() == entity_id) {
                    if (game.entities_list.at(j).position[0] == x and game.entities_list.at(j).position[1] == y) {
                        if (game.entities_list.at(j).isCollision() == true) {
                            return true;
                        }
                    }
                }
            }
        }
        // TODO: Check collision layer too
        if (self.getCoordinateData(self.readData(enums.WorldDataEnum.CollisionLayer.int()), x, y) > 0) {
            return true;
        }
        return false;
    }
    pub fn initializeEntities(self: *WorldDataStruct) !void {
        if (self.entities_initialized == false) {
            self.service_entities_list = try ServiceEntityData.init(&game.allocator, 32, false);
            var entity_layer = self.readData(enums.WorldDataEnum.EntityLayer.int());
            var w = self.getWidth();
            var h = self.getHeight();
            var size = w * h;
            for (0..size) |i| {
                var x: u16 = @as(u16, @intCast(i % w));
                var y: u16 = @as(u16, @intCast(i / w));
                var value = self.getCoordinateData(entity_layer, x, y);
                if (value > 0) {
                    try self.entities_list.append(game.allocator, value);
                    for (0..game.entities_list.len) |j| {
                        if (game.entities_list.at(j).getId() == value) {
                            game.entities_list.at(j).position[0] = x;
                            game.entities_list.at(j).position[1] = y;
                            var raw_entity = game.entities_list.at(j).*;
                            var eh = try self.service_entities_list.addData(@as(EntityDataStruct, raw_entity));
                            _ = eh;
                        }
                    }
                    // var entity = entities_list.at(self.entities_list.items.len - 1);
                    // entity.position[0] = x;
                    // entity.position[1] = y;
                }
            }
        }
        self.entities_initialized = true;
    }
    pub fn addEntity(self: *WorldDataStruct, entity_id: u16, position_x: u16, position_y: u16) !void {
        _ = position_x;
        _ = position_y;
        var exists: bool = false;
        for (0..self.entities_list.items.len) |i| {
            if (self.entities_list.items[i] == entity_id) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            try self.entities_list.append(game.allocator, entity_id);
        }
    }
    pub fn removeEntity(self: *WorldDataStruct, entity_id: u16) !void {
        for (0..self.entities_list.len) |i| {
            if (self.entities_list.items[i] == entity_id) {
                try self.entities_list.remove(i);
                for (0..game.entities_list.len) |j| {
                    if (game.entities_list.at(j).getId() == entity_id) {
                        game.entities_list.at(j).position[0] = 0;
                        game.entities_list.at(j).position[1] = 0;
                        return;
                    }
                }
            }
        }
    }
};