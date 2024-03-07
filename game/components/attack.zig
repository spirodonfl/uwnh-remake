const std = @import("std");
const messages = @import("../messages.zig");
const game = @import("../game.zig");
const diff = @import("../diff.zig");

pub const ComponentAttack = struct {
    // TODO: Do we still need this?
    entity_id: u16,
    default_attack_damage: u16 = 1,
    parent: *game.EntityDataStruct,
    pub fn attack(self: *ComponentAttack) !void {
        var current_world = game.worlds_list.at(game.current_world_index);
        for (0..current_world.entities_list.items.len) |i| {
            if (current_world.entities_list.items[i] != self.entity_id) {
                var target_entity_index = game.getEntityById(current_world.entities_list.items[i]);
                if (target_entity_index > 0) {
                    var target_entity = game.entities_list.at(target_entity_index - 1);
                    var in_position: bool = false;
                    if (target_entity.position[0] == self.parent.position[0]) {
                        if (
                            target_entity.position[1] == self.parent.position[1] + 1
                            or target_entity.position[1] == self.parent.position[1] - 1
                        ) {
                            in_position = true;
                        }
                    } else if (target_entity.position[1] == self.parent.position[1]) {
                        if (
                            target_entity.position[0] == self.parent.position[0] + 1
                            or target_entity.position[0] == self.parent.position[0] - 1
                        ) {
                            in_position = true;
                        }
                    }

                    if (in_position) {
                        for (0..self.default_attack_damage) |a| {
                            _ = a;
                            target_entity.health.decrementHealth();
                        }
                        try diff.addData(0);

                        if (target_entity.health.current_value == 0) {
                            try diff.addData(69);
                            try diff.addData(target_entity.getId());
                            try diff.addData(self.entity_id);
                        }
                    }
                }
            }
        }
    }
};