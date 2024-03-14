const std = @import("std");
const messages = @import("../messages.zig");
const game = @import("../game.zig");
const diff = @import("../diff.zig");

pub const ComponentAttack = struct {
    // TODO: Do we still need this?
    entity_id: u16,
    default_damage: u16 = 1,
    current_damage: u16 = 1,
    default_range: u16 = 2,
    current_range: u16 = 2,
    parent: *game.EntityDataStruct,
    pub fn directionalAttack(self: *ComponentAttack) !void {
        var current_world = game.worlds_list.at(game.current_world_index);
        for (0..current_world.entities_list.items.len) |i| {
            if (current_world.entities_list.items[i] != self.entity_id) {
                var target_entity_index = game.getEntityById(current_world.entities_list.items[i]);
                if (target_entity_index > 0) {
                    var target_entity = game.entities_list.at(target_entity_index - 1);
                    var in_position: bool = false;
                    // Need to take into account self.parent.direction and also self.current_range and match the two against the entity then exit this function on the first hit
                    if (self.parent.direction == 0) {
                        var above = self.parent.position[1];
                        while (above > 0 and above > self.parent.position[1] - self.current_range) {
                            above -= 1;
                            if (target_entity.position[1] == above and target_entity.position[0] == self.parent.position[0]) {
                                in_position = true;
                                break;
                            }
                        }
                    } else if (self.parent.direction == 1) {
                        var below = self.parent.position[1];
                        while (below < self.parent.position[1] + self.current_range) {
                            below += 1;
                            if (target_entity.position[1] == below and target_entity.position[0] == self.parent.position[0]) {
                                in_position = true;
                                break;
                            }
                        }
                    } else if (self.parent.direction == 2) {
                        var left = self.parent.position[0];
                        // TODO: Found an error where you reach this line and it becomes unreachable somehow
                        while (left > 0 and left > self.parent.position[0] - self.current_range) {
                            left -= 1;
                            if (target_entity.position[0] == left and target_entity.position[1] == self.parent.position[1]) {
                                in_position = true;
                                break;
                            }
                        }
                    } else if (self.parent.direction == 3) {
                        var right = self.parent.position[0];
                        while (right < self.parent.position[0] + self.current_range) {
                            right += 1;
                            if (target_entity.position[0] == right and target_entity.position[1] == self.parent.position[1]) {
                                in_position = true;
                                break;
                            }
                        }
                    }
                    if (in_position) {
                        for (0..self.default_damage) |a| {
                            _ = a;
                            target_entity.health.decrementHealth();
                        }
                        try diff.addData(0);

                        if (target_entity.health.current_value == 0) {
                            // TODO: Don't use magic numbers
                            try diff.addData(69);
                            try diff.addData(self.entity_id);
                            try diff.addData(target_entity.getId());
                        }
                    }
                }
            }
        }
    }
    // Note: This is an AOE attack method, anything in range gets hit
    pub fn attack(self: *ComponentAttack) !void {
        var current_world = game.worlds_list.at(game.current_world_index);
        for (0..current_world.entities_list.items.len) |i| {
            if (current_world.entities_list.items[i] != self.entity_id) {
                var target_entity_index = game.getEntityById(current_world.entities_list.items[i]);
                if (target_entity_index > 0) {
                    var target_entity = game.entities_list.at(target_entity_index - 1);
                    var in_position: bool = false;
                    if (target_entity.position[0] == self.parent.position[0]) {
                        var above = self.parent.position[1];
                        if (above > 0) {
                            above -= 1;
                        }
                        var below = self.parent.position[1] + 1;
                        if (
                            target_entity.position[1] == below
                            or target_entity.position[1] == above
                        ) {
                            in_position = true;
                        }
                    } else if (target_entity.position[1] == self.parent.position[1]) {
                        var left = self.parent.position[0];
                        if (left > 0) {
                            left -= 1;
                        }
                        var right = self.parent.position[0] + 1;
                        if (
                            target_entity.position[0] == right
                            or target_entity.position[0] == left
                        ) {
                            in_position = true;
                        }
                    }

                    if (in_position) {
                        for (0..self.default_damage) |a| {
                            _ = a;
                            target_entity.health.decrementHealth();
                        }
                        try diff.addData(0);

                        if (target_entity.health.current_value == 0) {
                            // TODO: Don't use magic numbers
                            try diff.addData(69);
                            try diff.addData(self.entity_id);
                            try diff.addData(target_entity.getId());
                        }
                    }
                }
            }
        }
    }
};
