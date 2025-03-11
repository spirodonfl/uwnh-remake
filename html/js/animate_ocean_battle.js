var animateOceanBattleCannon = {
    type: "ocean_battle",
    name: "ocean_battle_cannon",
    entity_id: null,
    start: {x: 0, y: 0},
    current: {x: 0, y: 0},
    end: {x: 0, y: 0},
    animated: false,
    current_frame: 0,
    frame_rate: 2000,
    move_by: 1,
    render_always: true,
    cannon_tile: null,
    callbacks: [],
    reset: function ()
    {
        if (this.cannon_tile !== null)
        {
            this.cannon_tile = null;
            this.entity_id = null;
        }
        this.start = {x: 0, y: 0};
        this.current = {x: 0, y: 0};
        this.end = {x: 0, y: 0};
        this.animated = false;
        this.callbacks = [];
    },
    render: function ()
    {
        if (this.cannon_tile === null)
        {
            ocean_battle_spawn_cannonball(this.current.x, this.current.y);
            this.entity_id = wasm.exports.find_storage_world_entity_by_name_id(
                GAME_STRINGS.indexOf("ENTITY_CANNONBALL")
            );
            this.cannon_tile = true;
        }

        ++this.current_frame;
        if (this.current_frame > this.frame_rate)
        {
            this.current_frame = 0;
            if (this.end.x > this.start.x)
            {
                this.current.x += this.move_by;
                if (this.current.x > this.end.x) {
                    this.current.x = this.end.x;
                }
            }
            else
            {
                this.current.x -= this.move_by;
                if (this.current.x < this.end.x)
                {
                    this.current.x = this.end.x;
                }
            }

            if (this.end.y > this.start.y)
            {
                this.current.y += this.move_by;
                if (this.current.y > this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            else
            {
                this.current.y -= this.move_by;
                if (this.current.y < this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            wasm.exports.move_world_entity_to(this.entity_id, this.current.x, this.current.y);
            if (
                this.current.x == this.end.x
                &&
                this.current.y == this.end.y
            ) {
                ocean_battle_despawn_cannonball();
                this.cannon_tile = false;
                this.entity_id = null;
                this.animated = true;
                uih.animations.splice(uih.animations.indexOf(animateOceanBattleCannon), 1);
                for (var ca = 0; ca < this.callbacks.length; ++ca)
                {
                    this.callbacks[ca]();
                }
            }
        }
    }
};
var animateOceanBattleMove = {
    type: "ocean_battle",
    name: "ocean_battle_move",
    render_always: true,
    start: {x: 0, y: 0},
    current: {x: 0, y: 0},
    end: {x: 0, y: 0},
    animated: false,
    animating: false,
    current_frame: 0,
    frame_rate: 20,
    move_by: 1,
    callbacks: [],
    reset: function ()
    {
        this.start = {x: 0, y: 0};
        this.current = {x: 0, y: 0};
        this.end = {x: 0, y: 0};
        this.animated = false;
        this.callbacks = [];
    },
    render: function ()
    {
        ++this.current_frame;
        this.animating = true;
        if (this.current_frame > this.frame_rate)
        {
            this.current_frame = 0;
            if (this.end.x > this.start.x)
            {
                this.current.x += this.move_by;
                if (this.current.x > this.end.x) {
                    this.current.x = this.end.x;
                }
            }
            else
            {
                this.current.x -= this.move_by;
                if (this.current.x < this.end.x)
                {
                    this.current.x = this.end.x;
                }
            }
            if (this.end.y > this.start.y)
            {
                this.current.y += this.move_by;
                if (this.current.y > this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            else
            {
                this.current.y -= this.move_by;
                if (this.current.y < this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            var wnpcid = OCEAN_BATTLE.turn_order_world_npcs[
                OCEAN_BATTLE.turn_order
            ];
            wasm.exports.move_world_npc_to(wnpcid, this.current.x, this.current.y);
            if (
                this.current.x == this.end.x
                &&
                this.current.y == this.end.y
            ) {
                this.animating = false;
                this.animated = true;
                uih.animations.splice(
                    uih.animations.indexOf(animateOceanBattleMove), 1
                );
                for (var ca = 0; ca < this.callbacks.length; ++ca)
                {
                    this.callbacks[ca]();
                }
            }
        }
    }
};
var animateOceanBattleBoarding = {
    type: "ocean_battle",
    name: "ocean_battle_boarding",
    entity_id: null,
    start: {x: 0, y: 0},
    current: {x: 0, y: 0},
    end: {x: 0, y: 0},
    animated: false,
    current_frame: 0,
    frame_rate: 20,
    move_by: 1,
    render_always: true,
    boarding_tile: null,
    callbacks: [],
    reset: function ()
    {
        if (this.boarding_tile !== null)
        {
            this.boarding_tile = null;
            this.entity_id = null;
        }
        this.start = {x: 0, y: 0};
        this.current = {x: 0, y: 0};
        this.end = {x: 0, y: 0};
        this.animated = false;
        this.callbacks = [];
    },
    render: function ()
    {
        if (this.boarding_tile === null)
        {
            ocean_battle_spawn_sword(this.current.x, this.current.y);
            this.entity_id = wasm.exports.find_storage_world_entity_by_name_id(
                GAME_STRINGS.indexOf("ENTITY_SWORD")
            );
            this.boarding_tile = true;
        }

        ++this.current_frame;
        if (this.current_frame > this.frame_rate)
        {
            this.current_frame = 0;
            if (this.end.x > this.start.x)
            {
                this.current.x += this.move_by;
                if (this.current.x > this.end.x) {
                    this.current.x = this.end.x;
                }
            }
            else
            {
                this.current.x -= this.move_by;
                if (this.current.x < this.end.x)
                {
                    this.current.x = this.end.x;
                }
            }

            if (this.end.y > this.start.y)
            {
                this.current.y += this.move_by;
                if (this.current.y > this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            else
            {
                this.current.y -= this.move_by;
                if (this.current.y < this.end.y)
                {
                    this.current.y = this.end.y;
                }
            }
            wasm.exports.move_world_entity_to(this.entity_id, this.current.x, this.current.y);
            if (
                this.current.x == this.end.x
                &&
                this.current.y == this.end.y
            ) {
                ocean_battle_despawn_sword();
                this.boarding_tile = false;
                this.entity_id = null;
                this.animated = true;
                uih.animations.splice(uih.animations.indexOf(animateOceanBattleBoarding), 1);
                for (var ca = 0; ca < this.callbacks.length; ++ca)
                {
                    this.callbacks[ca]();
                }
            }
        }
    }
};