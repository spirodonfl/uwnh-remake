var INVENTORY = [];
var WORLD = [];
var CAPTAIN = [];
var BASE_SHIP = [];
var NPC = [];
var SHIP_MATERIAL = [];
var GOOD = [];
var ARMOR = [];
var WEAPON = [];
var SPECIAL_ITEM = [];
var FIGUREHEAD = [];
var CANNON = [];
var FLEET = [];
var LAYER = [];
var PLAYER = {
    captain: null,
    previous_world_npc_id: null,
    world_npc: null,
    inventory: null,
    inventory_items: [],
    fleet: null,
    fleet_ships: [],
    stats: null,
    updateData: function ()
    {
        PLAYER.captain = CAPTAIN[0];
        // PLAYER.captain = new GAME_DATA_CAPTAIN(wasm.exports, [0]);
        PLAYER.fleet = FLEET[PLAYER.captain.general_of_fleet_id];
        // PLAYER.fleet = new GAME_DATA_FLEET(wasm.exports, [PLAYER.captain.general_of_fleet_id]);
        PLAYER.inventory = INVENTORY[PLAYER.captain.inventory_id];
        // PLAYER.inventory = new GAME_DATA_INVENTORY(wasm.exports, [PLAYER.captain.inventory_id]);
        PLAYER.fleet_ships = [];
        for (var s = 0; s < PLAYER.fleet.ship_ids.length; ++s)
        {
            if (!is_sentry(PLAYER.fleet.ship_ids[s]))
            {
                var fsid = PLAYER.fleet.ship_ids[s];
                PLAYER.fleet_ships.push(
                    new GAME_DATA_FLEET_SHIP(wasm.exports, [fsid])
                );
            }
        }
        for (var f = 0; f < PLAYER.fleet_ships.length; ++f)
        {
            var fs = PLAYER.fleet_ships[f];
            fs.name_game_string = GAME_STRINGS[fs.name_id];
            fs.name_string = STRINGS[fs.name_game_string];
            fs.ship = new GAME_DATA_SHIP(wasm.exports, [fs.ship_id]);
            fs.ship.name_game_string = GAME_STRINGS[fs.ship.name_id];
            fs.ship.name_string = STRINGS[fs.ship.name_game_string];
            fs.ship.base_ship = new GAME_DATA_BASE_SHIP(wasm.exports, [fs.ship.base_ship_id]);
            fs.ship.base_ship.name_game_string = GAME_STRINGS[fs.ship.base_ship.name_id];
            fs.ship.base_ship.name_string = STRINGS[fs.ship.base_ship.name_game_string];
        }
        PLAYER.inventory_items = [];
        for (var t = 0; t < PLAYER.inventory.inventory_items.length; ++t)
        {
            if (!is_sentry(PLAYER.inventory.inventory_items[t]))
            {
                var inventory_id = PLAYER.inventory.inventory_items[t];
                PLAYER.inventory_items.push(
                    new GAME_DATA_INVENTORY_ITEM(wasm.exports, [inventory_id])
                );
                var last_index = PLAYER.inventory_items.length - 1;
                var inventory_item = PLAYER.inventory_items[last_index];
                inventory_item.name = STRINGS[GAME_STRINGS[inventory_item.name_id]];
            }
        }
        PLAYER.stats = new GAME_DATA_STATS(wasm.exports, [PLAYER.captain.stats_id]);
    }
};