const std = @import("std");
const messages = @import("../messages.zig");
const game = @import("../game.zig");
const diff = @import("../diff.zig");
const enums = @import("../enums.zig");
const fsm = @import("fsm.zig");
const entity = @import("../entity.zig");
const EntityDataStruct = entity.EntityDataStruct;

pub const ComponentAttack = struct {
    // TODO: Do we still need this?
    entity_id: u16,
    default_damage: u16 = 1,
    current_damage: u16 = 1,
    default_range: u16 = 2,
    current_range: u16 = 2,
    parent: *EntityDataStruct,
    state: u16 = 0,
    // NOTE: Without the anyerror!void here, we get an error from zig
    // "unable to resolve inferred error set" -> try self.directionalAttack()
    // weird... need to understand how and why
    pub fn handle(self: *@This(), event: enums.ComponentAttackEvent) anyerror!void {
        switch (event) {
            enums.ComponentAttackEvent.ExecuteAttack => {
                switch (self.state) {
                    enums.ComponentAttackState.Idle.int() => {
                        self.state = enums.ComponentAttackState.Attacking.int();
                        try self.omniAttack();
                    },
                    else => self.state = enums.ComponentAttackState.Idle.int(),
                }
            },
            enums.ComponentAttackEvent.TakeAttack => {
                switch (self.state) {
                    enums.ComponentAttackState.Idle.int() => self.state = enums.ComponentAttackState.BeingAttacked.int(),
                    else => self.state = enums.ComponentAttackState.Idle.int(),
                }
            },
            enums.ComponentAttackEvent.CompleteAttack => {
                switch (self.state) {
                    enums.ComponentAttackState.Attacking.int() => self.state = enums.ComponentAttackState.Idle.int(),
                    else => self.state = enums.ComponentAttackState.Idle.int(),
                }
            },
            enums.ComponentAttackEvent.FailAttack => {
                switch (self.state) {
                    enums.ComponentAttackState.Attacking.int() => self.state = enums.ComponentAttackState.Idle.int(),
                    else => self.state = enums.ComponentAttackState.Idle.int(),
                }
            },
        }
    }
    pub fn omniAttack(self: *ComponentAttack) !void {
        var current_world = game.worlds_list.at(game.current_world_index);
        var min_x: u16 = 0;
        if (self.parent.position[0] > self.current_range) {
            min_x = self.parent.position[0] - self.current_range;
        } else {
            min_x = 0;
        }
        var min_y: u16 = 0;
        if (self.parent.position[1] > self.current_range) {
            min_y = self.parent.position[1] - self.current_range;
        } else {
            min_y = 0;
        }
        var max_x: u16 = 0;
        if (self.parent.position[0] + self.current_range > current_world.getWidth()) {
            max_x = current_world.getWidth();
        } else {
            max_x = self.parent.position[0] + self.current_range;
        }
        var max_y: u16 = 0;
        if (self.parent.position[1] + self.current_range > current_world.getHeight()) {
            max_y = current_world.getHeight();
        } else {
            max_y = self.parent.position[1] + self.current_range;
        }

        for (0..current_world.entities_list.items.len) |i| {
            if (current_world.entities_list.items[i] != self.entity_id) {
                var target_entity_index = game.getEntityById(current_world.entities_list.items[i]);
                if (target_entity_index > 0) {
                    var target_entity = game.entities_list.at(target_entity_index - 1);
                    var in_range: bool = false;
                    if (target_entity.position[0] >= min_x and
                        target_entity.position[0] <= max_x and
                        target_entity.position[1] >= min_y and
                        target_entity.position[1] <= max_y)
                    {
                        in_range = true;
                    }

                    if (in_range) {
                        var dh = try game.sComponentHealth.getData(&target_entity.health);
                        for (0..self.default_damage) |a| {
                            _ = a;
                            // TODO: Should use a message for this
                            // target_entity.health.decrementHealth();
                            dh.decrementHealth();
                        }
                        try diff.addData(0);
                        std.log.info("IN RANGE {d} {d}", .{ target_entity.getId(), dh.current_value });

                        // if (target_entity.health.current_value == 0) {
                        if (dh.current_value == 0) {
                            // TODO: Don't use magic numbers
                            try diff.addData(69); // TODO: What is this?
                            try diff.addData(self.entity_id);
                            try diff.addData(target_entity.getId());
                        }
                        try self.handle(enums.ComponentAttackEvent.CompleteAttack);
                    }
                }
            }
        }
    }
    // TODO: Does it matter if you use @This() vs ComponentAttack as the self parameter in these functions?
    pub fn directionalAttack(self: *ComponentAttack) !void {
        var current_world = game.worlds_list.at(game.current_world_index);
        for (0..current_world.entities_list.items.len) |i| {
            if (current_world.entities_list.items[i] != self.entity_id) {
                var target_entity_index = game.getEntityById(current_world.entities_list.items[i]);
                if (target_entity_index > 0) {
                    var target_entity = game.entities_list.at(target_entity_index - 1);
                    var in_position: bool = false;
                    // Need to take into account self.parent.direction and also self.current_range and match
                    // the two against the entity then exit this function on the first hit
                    // TODO: Put these directional/positional things into a "canAttack" function of some kind?
                    if (self.parent.direction == enums.DirectionsEnum.Up.int()) {
                        var above = self.parent.position[1];
                        while (above > 0 and above > self.parent.position[1] - self.current_range) {
                            above -= 1;
                            if (target_entity.position[1] == above and target_entity.position[0] == self.parent.position[0]) {
                                in_position = true;
                                break;
                            }
                        }
                    } else if (self.parent.direction == enums.DirectionsEnum.Down.int()) {
                        var below = self.parent.position[1];
                        while (below < self.parent.position[1] + self.current_range) {
                            below += 1;
                            if (target_entity.position[1] == below and target_entity.position[0] == self.parent.position[0]) {
                                in_position = true;
                                break;
                            }
                        }
                    } else if (self.parent.direction == enums.DirectionsEnum.Left.int()) {
                        var left = self.parent.position[0];
                        // TODO: Found an error where you reach this line and it becomes unreachable somehow
                        while (left > 0 and left > self.parent.position[0] - self.current_range) {
                            left -= 1;
                            if (target_entity.position[0] == left and target_entity.position[1] == self.parent.position[1]) {
                                in_position = true;
                                break;
                            }
                        }
                    } else if (self.parent.direction == enums.DirectionsEnum.Right.int()) {
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
                        var dh = try game.sComponentHealth.getData(&target_entity.health);
                        for (0..self.default_damage) |a| {
                            _ = a;
                            // TODO: Should use a message for this
                            // target_entity.health.decrementHealth();
                            dh.decrementHealth();
                        }
                        try diff.addData(0);

                        // if (target_entity.health.current_value == 0) {
                        if (dh.current_value == 0) {
                            // TODO: Don't use magic numbers
                            try diff.addData(69);
                            try diff.addData(self.entity_id);
                            try diff.addData(target_entity.getId());

                            try self.handle(enums.ComponentAttackEvent.CompleteAttack);
                        }
                    }
                }
            }
        }
        try self.handle(enums.ComponentAttackEvent.FailAttack);
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
                        if (target_entity.position[1] == below or target_entity.position[1] == above) {
                            in_position = true;
                        }
                    } else if (target_entity.position[1] == self.parent.position[1]) {
                        var left = self.parent.position[0];
                        if (left > 0) {
                            left -= 1;
                        }
                        var right = self.parent.position[0] + 1;
                        if (target_entity.position[0] == right or target_entity.position[0] == left) {
                            in_position = true;
                        }
                    }

                    if (in_position) {
                        var dh = try game.sComponentHealth.getData(&target_entity.health);
                        for (0..self.default_damage) |a| {
                            _ = a;
                            // target_entity.health.decrementHealth();
                            dh.decrementHealth();
                        }
                        try diff.addData(0);

                        if (dh.current_value == 0) {
                            // TODO: Don't use magic numbers
                            try diff.addData(69);
                            try diff.addData(self.entity_id);
                            try diff.addData(target_entity.getId());

                            try self.handle(enums.ComponentAttackEvent.CompleteAttack);
                        }
                    }
                }
            }
        }
        try self.handle(enums.ComponentAttackEvent.FailAttack);
    }
};
