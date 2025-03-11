// gh = GameHelper
var gh = {
    current: null,
    initialize: function ()
    {
        this.current = new GAME_CURRENT(wasm.exports);
        var max = wasm.exports.get_max_worlds();
        for (var w = 0; w < max; ++w)
        {
            WORLD[w] = new GAME_DATA_WORLD(wasm.exports, [w]);
        }
        max = wasm.exports.get_max_inventories();
        for (var i = 0; i < max; ++i)
        {
            INVENTORY[i] = new GAME_DATA_INVENTORY(wasm.exports, [i]);
        }
        max = wasm.exports.get_max_captains();
        for (var c = 0; c < max; ++c)
        {
            CAPTAIN[c] = new GAME_DATA_CAPTAIN(wasm.exports, [c]);
        }
        max = wasm.exports.get_max_base_ships();
        for (var b = 0; b < max; ++b)
        {
            BASE_SHIP[b] = new GAME_DATA_BASE_SHIP(wasm.exports, [b]);
        }
        max = wasm.exports.get_max_npcs();
        for (var n = 0; n < max; ++n)
        {
            NPC[n] = new GAME_DATA_NPC(wasm.exports, [n]);
        }
        max = wasm.exports.get_max_ship_materials();
        for (var s = 0; s < max; ++s)
        {
            SHIP_MATERIAL[s] = new GAME_DATA_SHIP_MATERIAL(wasm.exports, [s]);
        }
        max = wasm.exports.get_max_goods();
        for (var g = 0; g < max; ++g)
        {
            GOOD[g] = new GAME_DATA_GOOD(wasm.exports, [g]);
        }
        max = wasm.exports.get_max_armors();
        for (var a = 0; a < max; ++a)
        {
            ARMOR[a] = new GAME_DATA_ARMOR(wasm.exports, [a]);
        }
        max = wasm.exports.get_max_weapons();
        for (var w = 0; w < max; ++w)
        {
            WEAPON[w] = new GAME_DATA_WEAPON(wasm.exports, [w]);
        }
        max = wasm.exports.get_max_special_items();
        for (var si = 0; si < max; ++si)
        {
            SPECIAL_ITEM[si] = new GAME_DATA_SPECIAL_ITEM(wasm.exports, [si]);
        }
        max = wasm.exports.get_max_figureheads();
        for (var f = 0; f < max; ++f)
        {
            FIGUREHEAD[f] = new GAME_DATA_FIGUREHEAD(wasm.exports, [f]);
        }
        max = wasm.exports.get_max_cannons();
        for (var c = 0; c < max; ++c)
        {
            CANNON[c] = new GAME_DATA_CANNON(wasm.exports, [c]);
        }
        max = wasm.exports.get_max_fleets();
        for (var f = 0; f < max; ++f)
        {
            FLEET[f] = new GAME_DATA_FLEET(wasm.exports, [f]);
        }
        PLAYER.updateData();
    },

    updateWorldNPCs: function ()
    {
        total_world_npcs = wasm.exports.get_storage_world_npc_total_used_slots();
        npcs_slots = game_get_storage_npc_used_slots(wasm.exports);
        // TODO: This is super wasteful. Only get world npcs if world npcs have actually changed
        world_npcs = [];
        for (var n = 0; n < total_world_npcs; ++n)
        {
            world_npcs.push(new GAME_DATA_WORLD_NPC(wasm.exports, [n]));
            var last_index = world_npcs.length - 1;
            world_npcs[last_index].name = UNDERSTRINGS[
                GAME_STRINGS[world_npcs[last_index].name_id]
            ];
            world_npcs[last_index].type = GAME_STRINGS[
                world_npcs[last_index].type_id
            ];
            world_npcs[last_index].animation = {
                direction_up_y: 8,
                direction_left_y: 9,
                direction_down_y: 10,
                direction_right_y: 11,
                max_x: 10,
                current_x: 0,
                current_frame: 0,
                update: function ()
                {
                    if (this.current_frame >= 10)
                    {
                        this.current_frame = 0;
                        ++this.current_x;
                        if (this.current_x > this.max_x)
                        {
                            this.current_x = 0;
                        }
                    }
                }
            };
        }
    },

    updateWorldEntities: function ()
    {
        total_world_entities = wasm.exports.get_max_world_entities();
        world_entities = [];
        for (var n = 0; n < total_world_entities; ++n)
        {
            if (!wasm.exports.is_storage_world_entity_slot_used(n)) { continue; }
            world_entities.push(new GAME_DATA_WORLD_ENTITY(wasm.exports, [n]));
            var last_index = world_entities.length - 1;
            world_entities[last_index].name = UNDERSTRINGS[
                GAME_CURRENT[world_entities[last_index].name_id]
            ];
        }
    },

    shouldUpdate: function ()
    {
        var everything = GAME_STRINGS.indexOf("UPDATED_STATE_EVERYTHING");
        var scene = GAME_STRINGS.indexOf("UPDATED_STATE_SCENE");
        var world = GAME_STRINGS.indexOf("UPDATED_STATE_WORLD");
        if (gh.current.updated_state === everything)
        {
            // gh.updateWorldNPCs();
            return true;
        }
        if (gh.current.updated_state === scene)
        {
            console.log("SCENE shouldUpdate");
            gh.updateWorldNPCs();
            gh.updateWorldEntities();
            gh.current.updated_state = wasm.exports.get_sentry();
            return true;
        }
        if (gh.current.updated_state === world)
        {
            console.log("WORLD shouldUpdate");
            gh.updateWorldNPCs();
            gh.updateWorldEntities();
            gh.current.updated_state = wasm.exports.get_sentry();
            return true;
        }
        return false;
    },

    getCurrentWorldName: function ()
    {
        // TODO: Stop creating new views
        var current = new GAME_CURRENT(wasm.exports);
        // TODO: This is a weird way to get world name
        return UNDERSTRINGS[GAME_STRINGS[current.world_name]];
    },
};