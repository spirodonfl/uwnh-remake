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

    shouldRedrawEverything: function ()
    {
        gh.current.updated_state = GAME_STRINGS.indexOf("UPDATED_STATE_EVERYTHING");
    },

    shouldUpdate: function (what)
    {
        var everything = GAME_STRINGS.indexOf("UPDATED_STATE_EVERYTHING");
        var scene = GAME_STRINGS.indexOf("UPDATED_STATE_SCENE");
        var world = GAME_STRINGS.indexOf("UPDATED_STATE_WORLD");
        if (gh.current.updated_state === everything)
        {
            return true;
        }
        if (what === "scene" && gh.current.updated_state === scene)
        {
            return true;
        }
        if (what === "world" && gh.current.updated_state === world)
        {
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