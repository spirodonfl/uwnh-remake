/**
 * Random kraken instead of built-in kraken (requires re-adjusting ocean_battle_turn_order and creating world npcs and all that jazz)
 BUGS TO FIX
 * if ship is beyond viewport, they magically teleport into viewport
 * who the hell is player 0? I DUNNO BRO WTF -> ACKSHUALLY the issue is that players local states are getting into a wonky place. Meanwhile, the server state is fine. There's an out of sync issue here which locks local player state. The band-aid fix is to ask for game state from server again. This is not a GAME STATE issue in c/h, it's an issue of server <--> communication
 * multi-highlight issue where camera is not accounted for on client so when you do move/attack the highlight is way out of screen if camera is beyond viewport size
*/


import { serve } from "bun";
import { v4 as uuidv4, parse as uuidParse } from "uuid";
import database from "bun:sqlite";
import * as fs from "fs";

var ADMIN_KEY = Bun.env.ADMIN_KEY;

function createWasmString(string)
{
    return Buffer.concat([Buffer.from(string), Buffer.from([0])]);
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function stripHTMLTags(str) {
    return str.replace(/<[^>]*>/g, '');
}

// ------------------------------------------------------------------------------------------------
// C GAME CODE
// ------------------------------------------------------------------------------------------------
var import_symbols = {
    // Define your C functions here
    initialize_game:
    { args: [], returns: "void", },
    tick:
    { args: [], returns: "void", },
    get_sentry:
    { args: [], returns: "u32", },
    get_current_game_mode:
    { args: [], returns: "u32", },
    get_max_world_npcs:
    { args: [], returns: "u32", },
    get_max_ships:
    { args: [], returns: "u32", },
    get_max_fleets:
    { args: [], returns: "u32", },
    get_max_fleet_ships:
    { args: [], returns: "u32", },
    get_max_captains:
    { args: [], returns: "u32", },
    get_max_ocean_battle_fleets:
    { args: [], returns: "u32", },
    get_max_players:
    { args: [], returns: "u32", },
    get_world_npc_position_x:
    { args: ["u32"], returns: "u32", },
    get_world_npc_position_y:
    { args: ["u32"], returns: "u32", },
    get_world_npc_npc_id:
    { args: ["u32"], returns: "u32", },
    get_world_npc_type:
    { args: ["u32"], returns: "u32", },
    get_world_npc_entity_id:
    { args: ["u32"], returns: "u32", },
    set_world_npc_type:
    { args: ["u32", "u32"], returns: "void", },
    get_ship_name_id:
    { args: ["u32"], returns: "u32", },
    get_ship_base_ship_id:
    { args: ["u32"], returns: "u32", },
    get_ship_crew:
    { args: ["u32"], returns: "u32", },
    get_ship_hull:
    { args: ["u32"], returns: "u32", },
    get_captain_npc_id:
    { args: ["u32"], returns: "u32", },
    get_captain_world_npc_id:
    { args: ["u32"], returns: "u32", },
    get_captain_player_id:
    { args: ["u32"], returns: "u32", },
    get_captain_fleet_id:
    { args: ["u32"], returns: "u32", },
    get_ocean_battle_data_size:
    { args: [], returns: "u32", },
    get_ocean_battle_data_value:
    { args: ["u32"], returns: "u32", },
    get_captain_to_player_value:
    { args: ["u32"], returns: "u32", },
    get_ocean_battle_total_fleets:
    { args: [], returns: "u32", },
    get_ocean_battle_fleets_value:
    { args: ["u32"], returns: "u32", },
    get_ocean_battle_turn_order_value:
    { args: ["u32"], returns: "u32", },
    set_ocean_battle_turn_order_value:
    { args: ["u32", "u32"], returns: "void", },
    get_max_ocean_battle_turn_orders:
    { args: [], returns: "u32", },
    move_world_npc_to:
    { args: ["u32", "u32", "u32"], returns: "void", },
    scene_ocean_battle:
    { args: ["u32"], returns: "u32" },
    get_current_scene:
    { args: [], returns: "u32" },
    get_current_scene_state:
    { args: [], returns: "u32" },
    get_current_scene_state_string_id:
    { args: [], returns: "u32" },
    clear_ocean_battle_fleets:
    { args: [], returns: "void", },
    clear_ocean_battle_data:
    { args: [], returns: "void", },
    clear_ocean_battle_turn_order:
    { args: [], returns: "void", },
    add_fleet_to_battle:
    { args: ["u32"], returns: "void", },
    get_fleet_id_by_general_id:
    { args: ["u32"], returns: "u32", },
    get_npc_id_by_machine_name:
    { args: ["cstring"], returns: "u32", },
    get_string_id_by_machine_name:
    { args: ["cstring"], returns: "u32", },
    get_npc_id_by_string_id:
    { args: ["u32"], returns: "u32", },
    get_layer_id_by_machine_name:
    { args: ["cstring"], returns: "u32", },
    get_player_value:
    { args: ["u32"], returns: "u32", },
    set_global_storage_world_npcs_used:
    { args: ["u32"], returns: "void", },
    set_global_storage_ships_used:
    { args: ["u32"], returns: "void", },
    set_global_storage_captains_used:
    { args: ["u32"], returns: "void", },
    set_global_storage_fleets_used:
    { args: ["u32"], returns: "void", },
    set_global_storage_fleet_ships_used:
    { args: ["u32"], returns: "void", },
    current_scene_make_choice:
    { args: ["u32"], returns: "void", },
    ocean_battle_get_total_valid_movement_coordinates:
    { args: [], returns: "u32",},
    ocean_battle_get_total_valid_boarding_coordinates:
    { args: [], returns: "u32",},
    ocean_battle_get_total_valid_cannon_coordinates:
    { args: [], returns: "u32",},
    ocean_battle_get_valid_boarding_coordinates_x:
    { args: ["u32"], returns: "u32",},
    ocean_battle_get_valid_boarding_coordinates_y:
    { args: ["u32"], returns: "u32",},
    ocean_battle_get_valid_cannon_coordinates_x:
    { args: ["u32"], returns: "u32",},
    ocean_battle_get_valid_cannon_coordinates_y:
    { args: ["u32"], returns: "u32",},
    ocean_battle_get_valid_movement_coordinates_x:
    { args: ["u32"], returns: "u32",},
    ocean_battle_get_valid_movement_coordinates_y:
    { args: ["u32"], returns: "u32",},
    set_ocean_battle_data_intended_move_x:
    { args: ["u32"], returns: "void",},
    set_ocean_battle_data_intended_move_y:
    { args: ["u32"], returns: "void",},
    set_ocean_battle_data_intended_boarding_x:
    { args: ["u32"], returns: "void",},
    set_ocean_battle_data_intended_boarding_y:
    { args: ["u32"], returns: "void",},
    set_ocean_battle_data_intended_cannon_x:
    { args: ["u32"], returns: "void",},
    set_ocean_battle_data_intended_cannon_y:
    { args: ["u32"], returns: "void",},
    set_ocean_battle_data_manual_setup:
    { args: ["u32"], returns: "void", },
    get_current_ocean_battle_turn_player_id:
    { args: [], returns: "u32", },
    set_fleet_total_ships:
    { args: ["u32", "u32"], returns: "u32", },
    set_fleet_total_captains:
    { args: ["u32", "u32"], returns: "u32", },
    set_fleet_general_id:
    { args: ["u32", "u32"], returns: "u32", },
    create_string:
    { args: ["cstring", "cstring"], returns: "u32", },
    pull_storage_ships_next_open_slot:
    { args: [], returns: "u32", },
    pull_storage_world_npcs_next_open_slot:
    { args: [], returns: "u32", },
    pull_storage_fleets_next_open_slot:
    { args: [], returns: "u32", },
    pull_storage_fleet_ships_next_open_slot:
    { args: [], returns: "u32", },
    set_ship_name_id:
    { args: ["u32", "u32"], returns: "void", },
    set_ship_base_ship_id:
    { args: ["u32", "u32"], returns: "void", },
    set_ship_crew:
    { args: ["u32", "u32"], returns: "void", },
    set_ship_hull:
    { args: ["u32", "u32"], returns: "void", },
    add_ship_to_fleet:
    { args: ["u32", "u32"], returns: "void", },
    add_value_to_global_world_data:
    { args: ["u32", "u32", "u32", "u32"], returns: "void", },
    get_base_ship_id_by_machine_name:
    { args: ["cstring"], returns: "u32", },
    set_world_npc_entity_id:
    { args: ["u32", "u32"], returns: "void", },
    set_world_npc_position_x:
    { args: ["u32", "u32"], returns: "void", },
    set_world_npc_position_y:
    { args: ["u32", "u32"], returns: "void", },
    set_world_npc_npc_id:
    { args: ["u32", "u32"], returns: "void", },
    set_ocean_battle_data_total_ships_in_play:
    { args: ["u32"], returns: "void", },
    increment_global_storage_world_npcs_count:
    { args: [], returns: "void", },
    increment_global_storage_ships_count:
    { args: [], returns: "void", },
    increment_global_storage_captains_count:
    { args: [], returns: "void", },
    increment_global_storage_fleets_count:
    { args: [], returns: "void", },
    increment_global_storage_fleet_ships_count:
    { args: [], returns: "void", },
    set_which_player_you_are:
    { args: ["u32"], returns: "void", },
    get_fleet_general_id:
    { args: ["u32"], returns: "u32", },
    get_fleet_total_ships:
    { args: ["u32"], returns: "u32", },
    get_fleet_total_captains:
    { args: ["u32"], returns: "u32", },
    get_fleet_ship_fleet_id:
    { args: ["u32"], returns: "u32", },
    get_fleet_ship_ship_id:
    { args: ["u32"], returns: "u32", },
    get_viewport_value_at_coordinates:
    { args: ["u32", "u32", "u32"], returns: "u32", },
    get_fleet_ship_id_by_ship_id:
    { args: ["u32"], returns: "u32", },
    generate_world:
    { args: ["cstring"], returns: "void", },
    clear_global_world_data:
    { args: [], returns: "void", },
    clear_storage_ship:
    { args: [], returns: "void", },
    set_current_scene_state_string_id_to_sentry:
    { args: ["u32"], returns: "void", },
};
import { cc } from "bun:ffi";
import source from "./bun_server.c" with { type: "file" };
// const { secondsymbols } = cc({
//     source,
//     symbols: import_symbols,
//     flags: ["-DTINYCC", "-w"]
// });
const { symbols } = cc({
    source,
    symbols: import_symbols,
    flags: ["-DTINYCC", "-w"]
});
var GAME_INITIALIZED = false;
var GLOBAL_WORLD_DATA = [];
function generateMatrix(players) {
    // Validate input: players should be an array of objects with fleet sizes
    if (!Array.isArray(players) || players.length > 10) {
        throw new Error('Players must be an array with maximum 10 fleets');
    }

    // Initialize 100x100 matrix with zeros
    const matrix = Array(100).fill().map(() => Array(100).fill(0));
    const usedPositions = new Set();

    // Special center coordinate reserved for later
    const CENTER_POINT = { x: 50, y: 50 };
    usedPositions.add(`${CENTER_POINT.x},${CENTER_POINT.y}`);

    // Define spawn points in corners/edges
    const spawnPoints = [
        { x: 0, y: 0 },      // Top left
        { x: 0, y: 99 },     // Top right
        { x: 99, y: 0 },     // Bottom left
        { x: 99, y: 99 },    // Bottom right
        { x: 0, y: 50 },     // Middle left
        { x: 99, y: 50 },    // Middle right
        { x: 50, y: 0 },     // Middle top
        { x: 50, y: 99 },    // Middle bottom
        { x: 25, y: 0 },     // Additional top
        { x: 75, y: 0 }      // Additional top
    ];

    function isValidPosition(x, y) {
        return x >= 0 && x < 100 && 
               y >= 0 && y < 100 && 
               !usedPositions.has(`${x},${y}`) &&
               !(x === CENTER_POINT.x && y === CENTER_POINT.y);
    }

    function getRandomPosition() {
        return Math.floor(Math.random() * 100);
    }

    function findNearbyPosition(x, y, radius = 3) {
        const positions = [];
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (dx === 0 && dy === 0) continue;
                const newX = x + dx;
                const newY = y + dy;
                if (isValidPosition(newX, newY)) {
                    positions.push([newX, newY]);
                }
            }
        }
        return positions.length > 0 ? 
            positions[Math.floor(Math.random() * positions.length)] : 
            null;
    }

    // Place 200 squares with value 42
    let count42 = 0;
    // TODO: Remove magic number
    while (count42 < 300) {
        const x = getRandomPosition();
        const y = getRandomPosition();
        
        if (isValidPosition(x, y)) {
            matrix[x][y] = 42;
            usedPositions.add(`${x},${y}`);
            count42++;
        }
    }

    // Place players and their fleets
    players.forEach((player, index) => {
        var fleet_ship_index = 0;
        if (player.fleetSize < 0 || player.fleetSize > 9) {
            throw new Error(`Fleet size must be between 0 and 9 for player ${index + 1}`);
        }

        var playerValue = 100 + (100 * index) + fleet_ship_index;
        const spawnPoint = spawnPoints[index];
        
        if (isValidPosition(spawnPoint.x, spawnPoint.y)) {
            // Place main player
            matrix[spawnPoint.x][spawnPoint.y] = playerValue;
            usedPositions.add(`${spawnPoint.x},${spawnPoint.y}`);
            console.log("(GenerateMatrix) - playerValue:" + playerValue + " " + spawnPoint.x + ":" + spawnPoint.y);
            ++fleet_ship_index;
            
            // Place fleet ships
            let shipsPlaced = 0;
            let attempts = 0;
            
            while (shipsPlaced < player.fleetSize && attempts < 20) {
                const nearbyPos = findNearbyPosition(spawnPoint.x, spawnPoint.y, 3);
                if (nearbyPos) {
                    playerValue = 100 + (100 * index) + fleet_ship_index;
                    const [shipX, shipY] = nearbyPos;
                    matrix[shipX][shipY] = playerValue;
                    console.log("(GenerateMatrix) - playerValue:" + playerValue + " " + shipX + ":" + shipY);
                    usedPositions.add(`${shipX},${shipY}`);
                    shipsPlaced++;
                    ++fleet_ship_index;
                }
                attempts++;
            }
        }
    });

    return matrix;
}
function beginGame()
{
    var str;
    var str_id;
    symbols.initialize_game();
    symbols.tick();
    symbols.clear_ocean_battle_turn_order();
    // TODO: (future) Add a health pack
    // TODO: Give special buffs to particular things
    // TODO: Sort out placement of world npcs too. Maybe random is ok.
    symbols.clear_ocean_battle_fleets();

    var matrix = generateMatrix([
        { fleetSize: 1 },  // Player 1 (note: fleetSize is player + 1)
        { fleetSize: 1 },  // Player 2
        { fleetSize: 0 },  // Kraken
        { fleetSize: 2 },  // Blackbeard
    ]);
    
    console.log("-- SETTING UP WORLD --");
    symbols.set_ocean_battle_data_manual_setup(1);
    var layer_one_id = symbols.get_layer_id_by_machine_name(createWasmString("layer_one"));
    var block_layer_id = symbols.get_layer_id_by_machine_name(createWasmString("block_layer"));
    GLOBAL_WORLD_DATA.push({ layer_id: layer_one_id, x: 0, y: 0, value: 33 });
    symbols.add_value_to_global_world_data(layer_one_id, 0, 0, 33);
    // TODO: Remove the magic number
    for (var x = 0; x < 100; ++x)
    {
        for (var y = 0; y < 100; ++y)
        {
            if (matrix[x][y] === 42)
            {
                GLOBAL_WORLD_DATA.push({ layer_id: layer_one_id, x, y, value: 42 });
                symbols.add_value_to_global_world_data(layer_one_id, x, y, 42);
                GLOBAL_WORLD_DATA.push({ layer_id: block_layer_id, x, y, value: 1 });
                symbols.add_value_to_global_world_data(block_layer_id, x, y, 1);
            }
        }
    }
    // can setup blocks now
    // layer two

    var MAX_TURN_ORDERS = symbols.get_max_ocean_battle_turn_orders();
    // TODO: make sure max is never exceeded
    OCEAN_BATTLE_TURN_ORDER = [];
    OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY = 0;

    console.log("-- SETTING UP SHIPS --");
    var base_ship_id = symbols.get_base_ship_id_by_machine_name(createWasmString("balsa"));
    // NEED THIS BECAUSE SHIP_TYPE === 3 and the renderer needs that
    var npc_ship_id = symbols.get_npc_id_by_machine_name(createWasmString("ship"));
    var fleet_id;
    var ship_id;
    var world_npc_id;
    var position_y = 7;
    var position_x = 0;
    var matrix_index = 0;
    var found = false;
    var fleet_index = 0;
    var ship_index = 0;
    for (var p = 0; p < players.length; ++p)
    {
        var ship_name_id;
        var npc_id;
        if (p === 0)
        {
            console.log("-- SETTING UP PLAYER ONE --");
            ship_name_id = symbols.get_string_id_by_machine_name(createWasmString("player_ones_ship"));
            npc_id = symbols.get_npc_id_by_machine_name(createWasmString("player_one"));
        }
        else if (p === 1)
        {
            console.log("-- SETTING UP PLAYER TWO --");
            ship_name_id = symbols.get_string_id_by_machine_name(createWasmString("player_twos_ship"));
            npc_id = symbols.get_npc_id_by_machine_name(createWasmString("player_two"));
        }
        else if (p === 2)
        {
            console.log("-- SETTING UP PLAYER THREE --");
            ship_name_id = symbols.get_string_id_by_machine_name(createWasmString("player_threes_ship"));
            npc_id = symbols.get_npc_id_by_machine_name(createWasmString("player_three"));
        }
        else if (p === 3)
        {
            console.log("-- SETTING UP PLAYER FOUR --");
            ship_name_id = symbols.get_string_id_by_machine_name(createWasmString("player_fours_ship"));
            npc_id = symbols.get_npc_id_by_machine_name(createWasmString("player_four"));
        }
        else if (p === 4)
        {
            console.log("-- SETTING UP PLAYER FIVE --");
            ship_name_id = symbols.get_string_id_by_machine_name(createWasmString("player_fives_ship"));
            npc_id = symbols.get_npc_id_by_machine_name(createWasmString("player_five"));
        }

        console.log("-- FLEET SETUP --");
        fleet_id = symbols.pull_storage_fleets_next_open_slot();
        symbols.set_fleet_total_ships(fleet_id, 0);
        symbols.set_fleet_total_captains(fleet_id, 1);
        symbols.set_fleet_general_id(fleet_id, npc_id);

        console.log("-- FLEET SHIP SETUP --");
        ship_id = symbols.pull_storage_ships_next_open_slot();
        symbols.set_ship_name_id(ship_id, ship_name_id);
        symbols.set_ship_base_ship_id(ship_id, base_ship_id);
        symbols.set_ship_crew(ship_id, 50);
        symbols.set_ship_hull(ship_id, 100);
        symbols.add_ship_to_fleet(fleet_id, ship_id);
        ++OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY;
        console.log("-- CREATING WORLD NPC --");
        world_npc_id = symbols.pull_storage_world_npcs_next_open_slot();
        symbols.set_world_npc_npc_id(world_npc_id, npc_id);
        symbols.set_world_npc_entity_id(world_npc_id, ship_id);
        // TODO: 3 is the magic number for SHIP but we should get this number in a better way
        symbols.set_world_npc_type(world_npc_id, 3);
        ship_index = 0;
        matrix_index = 100 + (100 * fleet_index) + ship_index;
        found = false;
        for (var x = 0; x < 100; ++x)
        {
            for (var y = 0; y < 100; ++y)
            {
                if (matrix[x][y] === matrix_index)
                {
                    console.log("-- Set npc:" + world_npc_id + " position to " + x + ":" + y);
                    symbols.set_world_npc_position_x(world_npc_id, x);
                    symbols.set_world_npc_position_y(world_npc_id, y);
                    found = true;
                }
                if (found) { break; }
            }
            if (found) { break; }
        }
        OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);

        console.log("-- FLEET SHIP SETUP --");
        ship_id = symbols.pull_storage_ships_next_open_slot();
        symbols.set_ship_name_id(ship_id, ship_name_id);
        symbols.set_ship_base_ship_id(ship_id, base_ship_id);
        symbols.set_ship_crew(ship_id, 50);
        symbols.set_ship_hull(ship_id, 100);
        symbols.add_ship_to_fleet(fleet_id, ship_id);
        ++OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY;
        console.log("-- CREATING WORLD NPC --");
        world_npc_id = symbols.pull_storage_world_npcs_next_open_slot();
        symbols.set_world_npc_npc_id(world_npc_id, npc_id);
        symbols.set_world_npc_entity_id(world_npc_id, ship_id);
        // TODO: 3 is the magic number for SHIP but we should get this number in a better way
        symbols.set_world_npc_type(world_npc_id, 3);
        ++ship_index;
        matrix_index = 100 + (100 * fleet_index) + ship_index;
        found = false;
        for (var x = 0; x < 100; ++x)
        {
            for (var y = 0; y < 100; ++y)
            {
                if (matrix[x][y] === matrix_index)
                {
                    console.log("-- Set npc:" + world_npc_id + " position to " + x + ":" + y);
                    symbols.set_world_npc_position_x(world_npc_id, x);
                    symbols.set_world_npc_position_y(world_npc_id, y);
                    found = true;
                }
                if (found) { break; }
            }
            if (found) { break; }
        }
        OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);

        console.log("-- ADDING FLEET TO BATTLE --");
        symbols.add_fleet_to_battle(fleet_id);

        ++fleet_index;
    }

    // kraken
    console.log("-- KRAKEN --");
    ship_name_id = symbols.get_string_id_by_machine_name(createWasmString("krakens_ship"));
    npc_id = symbols.get_npc_id_by_machine_name(createWasmString("npc_kraken"));
    console.log("-- KRAKEN FLEET SETUP --");
    fleet_id = symbols.pull_storage_fleets_next_open_slot();
    symbols.set_fleet_total_ships(fleet_id, 0);
    symbols.set_fleet_total_captains(fleet_id, 1);
    symbols.set_fleet_general_id(fleet_id, npc_id);
    console.log("-- KRAKEN FLEET SHIP SETUP --");
    ship_id = symbols.pull_storage_ships_next_open_slot();
    symbols.set_ship_name_id(ship_id, ship_name_id);
    symbols.set_ship_base_ship_id(ship_id, base_ship_id);
    symbols.set_ship_crew(ship_id, 333);
    symbols.set_ship_hull(ship_id, 333);
    symbols.add_ship_to_fleet(fleet_id, ship_id);
    ++OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY;
    console.log("-- KRAKEN CREATING WORLD NPC --");
    world_npc_id = symbols.pull_storage_world_npcs_next_open_slot();
    symbols.set_world_npc_npc_id(world_npc_id, npc_id);
    symbols.set_world_npc_entity_id(world_npc_id, ship_id);
    ship_index = 0;
    matrix_index = 100 + (100 * fleet_index) + ship_index;
    found = false;
    for (var x = 0; x < 100; ++x)
    {
        for (var y = 0; y < 100; ++y)
        {
            if (matrix[x][y] === matrix_index)
            {
                console.log("-- Set npc:" + world_npc_id + " position to " + x + ":" + y);
                symbols.set_world_npc_position_x(world_npc_id, x);
                symbols.set_world_npc_position_y(world_npc_id, y);
                found = true;
            }
            if (found) { break; }
        }
        if (found) { break; }
    }
    // TODO: 3 is the magic number for SHIP but we should get this number in a better way
    symbols.set_world_npc_type(world_npc_id, 3);
    symbols.set_global_storage_world_npcs_used(world_npc_id);
    symbols.increment_global_storage_world_npcs_count();
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);

    // davey jones
    
    ++fleet_index;
    console.log("-- BLACKBEARD --");
    ship_name_id = symbols.get_string_id_by_machine_name(createWasmString("blackbeards_ship"));
    npc_id = symbols.get_npc_id_by_machine_name(createWasmString("npc_blackbeard"));
    console.log("-- BLACKBEARD FLEET SETUP --");
    fleet_id = symbols.pull_storage_fleets_next_open_slot();
    symbols.set_fleet_total_ships(fleet_id, 0);
    symbols.set_fleet_total_captains(fleet_id, 1);
    symbols.set_fleet_general_id(fleet_id, npc_id);
    console.log("-- BLACKBEARD FLEET SHIP SETUP --");
    ship_id = symbols.pull_storage_ships_next_open_slot();
    symbols.set_ship_name_id(ship_id, ship_name_id);
    symbols.set_ship_base_ship_id(ship_id, base_ship_id);
    symbols.set_ship_crew(ship_id, 20);
    symbols.set_ship_hull(ship_id, 50);
    symbols.add_ship_to_fleet(fleet_id, ship_id);
    ++OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY;
    console.log("-- BLACKBEARD CREATING WORLD NPC --");
    world_npc_id = symbols.pull_storage_world_npcs_next_open_slot();
    symbols.set_world_npc_npc_id(world_npc_id, npc_id);
    symbols.set_world_npc_entity_id(world_npc_id, ship_id);
    ship_index = 0;
    matrix_index = 100 + (100 * fleet_index) + ship_index;
    found = false;
    for (var x = 0; x < 100; ++x)
    {
        for (var y = 0; y < 100; ++y)
        {
            if (matrix[x][y] === matrix_index)
            {
                console.log("-- Set npc:" + world_npc_id + " position to " + x + ":" + y);
                symbols.set_world_npc_position_x(world_npc_id, x);
                symbols.set_world_npc_position_y(world_npc_id, y);
                found = true;
            }
            if (found) { break; }
        }
        if (found) { break; }
    }
    // TODO: 3 is the magic number for SHIP but we should get this number in a better way
    symbols.set_world_npc_type(world_npc_id, 3);
    symbols.set_global_storage_world_npcs_used(world_npc_id);
    symbols.increment_global_storage_world_npcs_count();
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    console.log("-- BLACKBEARD FLEET SHIP SETUP --");
    ship_id = symbols.pull_storage_ships_next_open_slot();
    symbols.set_ship_name_id(ship_id, ship_name_id);
    symbols.set_ship_base_ship_id(ship_id, base_ship_id);
    symbols.set_ship_crew(ship_id, 20);
    symbols.set_ship_hull(ship_id, 50);
    symbols.add_ship_to_fleet(fleet_id, ship_id);
    ++OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY;
    console.log("-- BLACKBEARD CREATING WORLD NPC --");
    world_npc_id = symbols.pull_storage_world_npcs_next_open_slot();
    symbols.set_world_npc_npc_id(world_npc_id, npc_id);
    symbols.set_world_npc_entity_id(world_npc_id, ship_id);
    ++ship_index;
    matrix_index = 100 + (100 * fleet_index) + ship_index;
    found = false;
    for (var x = 0; x < 100; ++x)
    {
        for (var y = 0; y < 100; ++y)
        {
            if (matrix[x][y] === matrix_index)
            {
                console.log("-- Set npc:" + world_npc_id + " position to " + x + ":" + y);
                symbols.set_world_npc_position_x(world_npc_id, x);
                symbols.set_world_npc_position_y(world_npc_id, y);
                found = true;
            }
            if (found) { break; }
        }
        if (found) { break; }
    }
    // TODO: 3 is the magic number for SHIP but we should get this number in a better way
    symbols.set_world_npc_type(world_npc_id, 3);
    symbols.set_global_storage_world_npcs_used(world_npc_id);
    symbols.increment_global_storage_world_npcs_count();
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    console.log("-- BLACKBEARD FLEET SHIP SETUP --");
    ship_id = symbols.pull_storage_ships_next_open_slot();
    symbols.set_ship_name_id(ship_id, ship_name_id);
    symbols.set_ship_base_ship_id(ship_id, base_ship_id);
    symbols.set_ship_crew(ship_id, 2);
    symbols.set_ship_hull(ship_id, 2);
    symbols.add_ship_to_fleet(fleet_id, ship_id);
    ++OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY;
    console.log("-- BLACKBEARD CREATING WORLD NPC --");
    world_npc_id = symbols.pull_storage_world_npcs_next_open_slot();
    symbols.set_world_npc_npc_id(world_npc_id, npc_id);
    symbols.set_world_npc_entity_id(world_npc_id, ship_id);
    ++ship_index;
    matrix_index = 100 + (100 * fleet_index) + ship_index;
    console.log("[matrix_index] " + matrix_index);
    found = false;
    for (var x = 0; x < 100; ++x)
    {
        for (var y = 0; y < 100; ++y)
        {
            if (matrix[x][y] === matrix_index)
            {
                console.log("-- Set npc:" + world_npc_id + " position to " + x + ":" + y);
                symbols.set_world_npc_position_x(world_npc_id, x);
                symbols.set_world_npc_position_y(world_npc_id, y);
                found = true;
            }
            if (found) { break; }
        }
        if (found) { break; }
    }
    // TODO: 3 is the magic number for SHIP but we should get this number in a better way
    symbols.set_world_npc_type(world_npc_id, 3);
    symbols.set_global_storage_world_npcs_used(world_npc_id);
    symbols.increment_global_storage_world_npcs_count();
    // NOTE: This works! We can now intersperse ships into having MULTIPLE turns between other turns
    OCEAN_BATTLE_TURN_ORDER.push(world_npc_id);
    console.log("-- BLACKBEARD ADDING FLEET TO BATTLE --");
    symbols.add_fleet_to_battle(fleet_id);

    console.log("-- SETTING UP BATTLE --");
    symbols.set_ocean_battle_data_total_ships_in_play(OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY);
    OCEAN_BATTLE_TURN_ORDER = shuffleArray(OCEAN_BATTLE_TURN_ORDER);
    for (var o = 0; o < OCEAN_BATTLE_TURN_ORDER.length; ++o)
    {
        symbols.set_ocean_battle_turn_order_value(o, OCEAN_BATTLE_TURN_ORDER[o]);
    }

    console.log("-- STARTING BATTLE --");
    symbols.scene_ocean_battle(0);

    console.log("-- GAME READY --");
}
function endGame()
{
    console.log("-- TODO: END GAME --");
    console.log("-- KICKING OFF ALL PLAYERS --");
    for (var p = 0; p < players.length; ++p)
    {
        // TODO: Remove their key from the DB so they can't use this key again
        players[p].unsubscribe("gamestate");
        players[p].close();
    }
    GAME_INITIALIZED = false;
    IN_GAME = false;
    symbols.clear_ocean_battle_fleets();
    symbols.clear_ocean_battle_turn_order();
    symbols.clear_ocean_battle_data();
    symbols.clear_global_world_data();
    symbols.clear_storage_ship();
    symbols.set_current_scene_state_string_id_to_sentry();
    symbols.generate_world(createWasmString("dingus_land"));
}
function generateGameData()
{
    var game_data = [];
    game_data.push({
        type: "current_game_mode",
        value: symbols.get_current_game_mode(),
    });
    game_data.push({
        type: "current_scene",
        value: symbols.get_current_scene(),
    });
    game_data.push({
        type: "current_scene_state",
        value: symbols.get_current_scene_state(),
    });
    for (var i = 0; i < symbols.get_max_world_npcs(); ++i)
    {
        if (symbols.get_world_npc_npc_id(i) !== symbols.get_sentry())
        {
            game_data.push({
                type: "world_npc",
                world_npc_id: i,
                world_npc_entity_id: symbols.get_world_npc_entity_id(i),
                world_npc_npc_id: symbols.get_world_npc_npc_id(i),
                world_npc_type: symbols.get_world_npc_type(i),
                world_npc_x: symbols.get_world_npc_position_x(i),
                world_npc_y: symbols.get_world_npc_position_y(i),
            });
        }
    }
    for (var i = 0; i < symbols.get_max_ships(); ++i)
    {
        if (symbols.get_ship_name_id(i) !== symbols.get_sentry())
        {
            game_data.push({
                type: "ship",
                ship_id: i,
                ship_name_id: symbols.get_ship_name_id(i),
                ship_crew: symbols.get_ship_crew(i),
                ship_hull: symbols.get_ship_hull(i),
            });
        }
    }
    for (var i = 0; i < symbols.get_max_captains(); ++i)
    {
        if (symbols.get_captain_npc_id(i) !== symbols.get_sentry())
        {
            game_data.push({
                type: "captain",
                captain_id: i,
                captain_npc_id: symbols.get_captain_npc_id(i),
                captain_world_npc_id: symbols.get_captain_world_npc_id(i),
                captain_player_id: symbols.get_captain_player_id(i),
                captain_fleet_id: symbols.get_captain_fleet_id(i),
            });
        }
    }
    for (var i = 0; i < symbols.get_max_fleets(); ++i)
    {
        if (symbols.get_fleet_general_id(i) !== symbols.get_sentry())
        {
            game_data.push({
                type: "fleet",
                fleet_id: i,
                fleet_total_ships: symbols.get_fleet_total_ships(i),
                fleet_total_captains: symbols.get_fleet_total_captains(i),
                fleet_general_id: symbols.get_fleet_general_id(i),
            });
        }
    }
    for (var i = 0; i < symbols.get_max_fleet_ships(); ++i)
    {
        if (symbols.get_fleet_ship_fleet_id(i) !== symbols.get_sentry())
        {
            game_data.push({
                type: "fleet_ship",
                fleet_ship_id: i,
                fleet_ship_fleet_id: symbols.get_fleet_ship_fleet_id(i),
                fleet_ship_ship_id: symbols.get_fleet_ship_ship_id(i),
            });
        }
    }
    var ocean_battle_data = [];
    for (var i = 0; i < symbols.get_ocean_battle_data_size(); ++i)
    {
        ocean_battle_data[i] = symbols.get_ocean_battle_data_value(i);
    }
    game_data.push({
        type: "ocean_battle_data",
        value: ocean_battle_data,
    });
    var captain_to_players = [];
    for (var i = 0; i < symbols.get_max_captains(); ++i)
    {
        captain_to_players[i] = symbols.get_captain_to_player_value(i);
    }
    game_data.push({
        type: "captain_to_players",
        value: captain_to_players,
    });
    game_data.push({
        type: "ocean_battle_total_fleets",
        value: symbols.get_ocean_battle_total_fleets(),
    });
    var ocean_battle_fleets = [];
    for (var i = 0; i < symbols.get_max_ocean_battle_fleets(); ++i)
    {
        ocean_battle_fleets[i] = symbols.get_ocean_battle_fleets_value(i);
    }
    game_data.push({
        type: "ocean_battle_fleets",
        value: ocean_battle_fleets,
    });
    var ocean_battle_turn_order = [];
    for (var i = 0; i < (symbols.get_max_ocean_battle_fleets() * symbols.get_max_fleet_ships()); ++i)
    {
        ocean_battle_turn_order[i] = symbols.get_ocean_battle_turn_order_value(i);
    }
    game_data.push({
        type: "ocean_battle_turn_order",
        value: ocean_battle_turn_order,
    });
    var ocean_battle_get_total_valid_movement_coordinates = symbols.ocean_battle_get_total_valid_movement_coordinates();
    var ocean_battle_valid_movement_coordinates = [];
    for (var i = 0; i < ocean_battle_get_total_valid_movement_coordinates; ++i)
    {
        ocean_battle_valid_movement_coordinates.push(symbols.ocean_battle_get_valid_movement_coordinates_x(i));
        ocean_battle_valid_movement_coordinates.push(symbols.ocean_battle_get_valid_movement_coordinates_y(i));
    }
    game_data.push({
        type: "ocean_battle_total_valid_movement_coordinates",
        value: ocean_battle_valid_movement_coordinates,
    });
    var ocean_battle_get_total_valid_cannon_coordinates = symbols.ocean_battle_get_total_valid_cannon_coordinates();
    var ocean_battle_valid_cannon_coordinates = [];
    for (var i = 0; i < ocean_battle_get_total_valid_cannon_coordinates; ++i)
    {
        ocean_battle_valid_cannon_coordinates.push(symbols.ocean_battle_get_valid_cannon_coordinates_x(i));
        ocean_battle_valid_cannon_coordinates.push(symbols.ocean_battle_get_valid_cannon_coordinates_y(i));
    }
    game_data.push({
        type: "ocean_battle_total_valid_cannon_coordinates",
        value: ocean_battle_valid_cannon_coordinates,
    });
    var ocean_battle_get_total_valid_boarding_coordinates = symbols.ocean_battle_get_total_valid_boarding_coordinates();
    var ocean_battle_valid_boarding_coordinates = [];
    for (var i = 0; i < ocean_battle_get_total_valid_boarding_coordinates; ++i)
    {
        ocean_battle_valid_boarding_coordinates.push(symbols.ocean_battle_get_valid_boarding_coordinates_x(i));
        ocean_battle_valid_boarding_coordinates.push(symbols.ocean_battle_get_valid_boarding_coordinates_y(i));
    }
    game_data.push({
        type: "ocean_battle_total_valid_boarding_coordinates",
        value: ocean_battle_valid_boarding_coordinates,
    });
    game_data.push({
        type: "global_world_data",
        value: GLOBAL_WORLD_DATA,
    });
    return game_data;
}

// ------------------------------------------------------------------------------------------------
// DATABASE OPERATIONS
// ------------------------------------------------------------------------------------------------
const db = database.open("game.sqlite");
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        score INTEGER DEFAULT 0
    );
`);
db.run(`
    CREATE TABLE IF NOT EXISTS keys (
        key BLOB PRIMARY KEY,
        username TEXT,
        FOREIGN KEY(username) REFERENCES users(username)
    );
`);

// ------------------------------------------------------------------------------------------------
// GLOBAL VARIABLES
// ------------------------------------------------------------------------------------------------
var players = [];
var IN_GAME = false;
var REQUIRED_PLAYERS = 2;
var COUNTDOWN_MS_ITERATOR = 0;
var COUNTDOWN_CURRENT_SECONDS = 0;
var COUNTDOWN_SECONDS = 3;
var COUNTDOWN_INTERVAL;
var chat_messages = [];
var GAME_LAST_ATTACKED_SHIP_ID = null;
var OCEAN_BATTLE_TURN_ORDER = [];
var OCEAN_BATTLE_TOTAL_SHIPS_IN_PLAY = 0;

// ------------------------------------------------------------------------------------------------
// HTML FUNCTIONS
// ------------------------------------------------------------------------------------------------
function playerConnectedHTML()
{

    var html = `
        <form id='content' ws-send>
            <script>
                if (URLPARAMS.get('username'))
                {
                    document.getElementById('htmx-ws-username').value = URLPARAMS.get('username');
                }
                if (URLPARAMS.get('keystring'))
                {
                    document.getElementById('htmx-ws-keystring').value = URLPARAMS.get('keystring');
                }
            </script>
            <input type='text' id='htmx-ws-username' name='username' />
            <input type='password' id='htmx-ws-keystring' name='keystring' />
            <input type='hidden' name='type' value='join_game' />
            <button type='submit' class='button-with-icon'><span class='svg svg-anchor'></span> <span>Login</span></button>
        </form>
    `;

    // NOTE: I tried using a template literal and I tried using a single quote on the outer and double on the inner
    // in BOTH cases, the double quotes, inner, were escaped and newline characters were added
    // this breaks HTMX on the client side and it doesn't do a proper swap
    // Therefore, must convert the template literal and use single quotes in it too
    return String.raw`${html}`.replace(/`/g, '"').replace(/\n/g, '');
}
function playerJoinedGameHTML()
{
    var html = `
    <div id='content'>
        <div id='multiplayer-actions'><button onclick='MULTIPLAYER.__player_manually_get_game_state();'>Refresh Game</button></div>
        <div id='countdown_timer'>Waiting for more players...</div>
        <div id='players'></div>
        <div id='admin'></div>
        <hr/>
        <form id='send_chat' ws-send>
            <span class='svg svg-chat-white'></span>
            <input type='text' name='chat_message' id='multiplayer-chat-message-input' />
            <input type='hidden' name='type' value='chat_message' />
            <button type='submit'>Send Trash Talk</button>
        </form>
        <div id='chat'></div>
    </div>`;
    return String.raw`${html}`.replace(/`/g, '"').replace(/\n/g, '');
}
function adminHTML()
{
    var html = `
    <div id='admin'>
    `;
    for (var p = 0; p < players.length; ++p)
    {
        var username = players[p].username;
        html += `<div><span>Give Points To</span> <button onclick='MULTIPLAYER.__admin_give_points_to(this);' data-username='${username}'>${username}</button></div>`;
        html += `<div><span>Take Points From</span> <button onclick='MULTIPLAYER.__admin_take_points_from(this);' data-username='${username}'>${username}</button></div>`;
    }
    html += `
        <div><span>Force Reload Game</span> <button onclick='MULTIPLAYER.__admin_force_reload();'>RED BUTTON</button></div>
    </div>
    `;
    return String.raw`${html}`.replace(/`/g, '"').replace(/\n/g, '');
}
function chatHTML()
{
    var html = "<div id='chat'>";
    for (var i = 0; i < chat_messages.length; ++i)
    {
        html += "<div class='chat-message'>[" + chat_messages[i].username +"] " + chat_messages[i].text + "</div>";
    }
    html += "</div>";
    return html;
}
function countdownTimerHTML()
{
    var html = `
        <div id='countdown_timer'>${COUNTDOWN_CURRENT_SECONDS}</div>
    `;
    return String.raw`${html}`.replace(/`/g, '"').replace(/\n/g, '');
}
function playersHTML()
{
    var html = `<div id='players'>`;
    for (var p = 0; p < players.length; ++p)
    {
        var username = players[p].username;
        db.run(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [username]);
        var db_user = db.query(`SELECT * FROM users WHERE username = $username`).get({$username: username});
        var score = null;
        if (db_user !== null)
        {
            score = db_user.score;
        }
        else
        {
            console.log("Could not find user " + username + " in the db");
        }
        var player_number = p + 1;
        html += `
        <div class='multiplayer-info'>
            <div class='multiplayer-info-wrapper'>
                <span><span class='svg svg-ship-white'></span> ${player_number}</span>
                <span>${username}</span>
                <span>(Score: ${score})</span>
            </div>
            <div class='multiplayer-health-bar'></div>
        </div>`;
    }
    html += '</div>';
    return String.raw`${html}`.replace(/`/g, '"').replace(/\n/g, '');
}

// ------------------------------------------------------------------------------------------------
// AUTHENTICATION FUNCTIONS
// ------------------------------------------------------------------------------------------------
function confirmKeyInData(ws, type, data)
{
    if (!data.username && !data.keystring)
    {
        ws.send(JSON.stringify({
            type,
            success: false,
            error: "[E] Must provide a username and keystring to validate a key with!"
        }));
        return false;
    }
    return true;
}
function validateKey(ws, type, username, keystring)
{
    if (keystring === ADMIN_KEY)
    {
        return true;
    }
    var key = uuidParse(keystring);
    var result = db.query("SELECT username FROM keys WHERE key = ?").get(key);

    if (result && result.username === username)
    {
        return true;
    }
    else
    {
        ws.send(JSON.stringify({
            type,
            success: false,
            error: "[E] Invalid key!"
        }));
        return false;
    }
}

// ------------------------------------------------------------------------------------------------
// SERVER FUNCTIONS
// ------------------------------------------------------------------------------------------------
function sendGameDataToAllPlayers()
{
    for (var i = 0; i < players.length; ++i)
    {
        players[i].send(JSON.stringify({
            type: "get_game_state",
            success: true,
            message: "Game state returned",
            game_data: generateGameData(),
            game_initialized: GAME_INITIALIZED,
        }));
    }

    if (GAME_INITIALIZED === false)
    {
        GAME_INITIALIZED = true;
    }
}

// ------------------------------------------------------------------------------------------------
// SERVER INITIALIZATION
// ------------------------------------------------------------------------------------------------
const server = serve({
    port: Bun.env.PORT,
    static:
    {
        // NOTE: Cannot hot reload. HTML is static-ized
        "/index.html": new Response(
            await Bun.file("./index.html").bytes(),
            {
                header: { "Content-Type": "text/html" }
            }
        )
    },
    async fetch(req, server)
    {
        // Check if it's a WebSocket request
        if (req.headers.get("Upgrade") === "websocket") {
            const success = server.upgrade(req);
            if (success) return;
        }

        const url = new URL(req.url);
        let body;

        if (req.method === "POST")
        {
            body = await req.json();
        }
        if (url.pathname === "/hello")
        {
            // && req.method === "POST"
            return new Response(JSON.stringify({ message: "hello" }), {
                header: { "Content-Type": "application/json" }
            });
        }
        return new Response("Not found", { status: 404 });
    },
    websocket:
    {
        message(ws, message)
        {
            try
            {
                var data = JSON.parse(message);
                console.log("--- JSON RECEIVED ---");
                console.log(data);

                switch (data.type)
                {
                    case "welcome":
                        ws.send(JSON.stringify({
                            type: "htmx_message",
                            html: playerConnectedHTML(),
                        }));
                        break;
                    // case "cage_the_kraken": // manually override and put the kraken away
                    // case "increase_ship_id_hull": // and crew and subsequent decrease commands
                    case "force_reload":
                        if (data.keystring && data.keystring === ADMIN_KEY)
                        {
                            for (var p = 0; p < players.length; ++p)
                            {
                                players[p].send(JSON.stringify({
                                    type: "force_reload"
                                }));
                                endGame();
                            }
                        }
                        break;
                    case "give_points_to":
                        if (data.keystring && data.keystring === ADMIN_KEY)
                        {
                            // data.to_username
                            // data.points
                            var current_points = db.query("SELECT * FROM users WHERE username = ?").get([data.to_username]).score;
                            db.query("UPDATE users SET score = $points WHERE username = $username").run({
                                $points: parseInt(data.points + current_points),
                                $username: data.to_username,
                            });
                            for (var p = 0; p < players.length; ++p)
                            {
                                players[p].send(JSON.stringify({
                                    type: "htmx_message",
                                    html: playersHTML(),
                                }));
                            }
                        }
                        break;
                    case "take_points_from":
                        if (data.keystring && data.keystring === ADMIN_KEY)
                        {
                            // data.to_username
                            // data.points
                            var current_points = db.query("SELECT * FROM users WHERE username = ?").get([data.to_username]).score;
                            db.query("UPDATE users SET score = $points WHERE username = $username").run({
                                $points: parseInt(current_points - data.points),
                                $username: data.to_username,
                            });
                            for (var p = 0; p < players.length; ++p)
                            {
                                players[p].send(JSON.stringify({
                                    type: "htmx_message",
                                    html: playersHTML(),
                                }));
                            }
                        }
                        break;
                    // case "remove_user_key": // remove key from db so players can't join using that key
                    // TODO: Add a new game state called "waiting" which is just one state and its only for multiplayer during ocean battle which gets all other players put into while current player is taking turn
                    case "release_the_kraken":
                        if (data.keystring && data.keystring === ADMIN_KEY)
                        {
                            // TODO OR user and user role is special
                        }
                        break;
                    case "generate_key":
                        if (!data.keystring && data.keystring !== ADMIN_KEY)
                        {
                            if (!data.for_username)
                            {
                                ws.send(JSON.stringify({
                                    type: "generate_key",
                                    success: false,
                                    message: "You must provide a for_username to generate a key for",
                                }));
                                break;
                            }
                            var keystring = uuidv4();
                            var key = uuidParse(keystring);

                            db.run(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [data.for_username]);
                            db.run(`INSERT INTO keys (key, username) VALUES (?, ?)`, [key, data.for_username]);

                            ws.send(JSON.stringify({
                                type: "generate_key",
                                success: true,
                                keystring,
                            }));
                        }
                        break;
                    case "validate_key":
                        if (!confirmKeyInData(ws, "validate_key", data)) { break; }
                        if (validateKey(ws, "validate_key", data.username, data.keystring))
                        {
                            ws.send(JSON.stringify({
                                type: "validate_key",
                                success: true,
                                message: "Key is valid!",
                            }));
                        }
                        break;
                    case "join_game":
                        if (IN_GAME)
                        {
                            ws.send(JSON.stringify({
                                type: "join_game",
                                success: false,
                                error: "Game already in progress!",
                            }));
                            break;
                        }
                        if (players.length === symbols.get_max_players())
                        {
                            ws.send(JSON.stringify({
                                type: "join_game",
                                success: false,
                                error: "Players already maxed out",
                            }));
                            break;
                        }
                        if (!confirmKeyInData(ws, "validate_key", data)) { break; }
                        if (validateKey(ws, "validate_key", data.username, data.keystring))
                        {
                            ws.username = data.username;
                            ws.send(JSON.stringify({
                                type: "join_game",
                                success: true,
                                message: "Joined game!",
                                username: data.username,
                                keystring: data.keystring,
                                which_player_are_you: players.length
                            }));
                            ws.send(JSON.stringify({
                                type: "htmx_message",
                                html: playerJoinedGameHTML(),
                            }));
                            players.push(ws);
                            ws.player_id = players.length - 1;
                            ws.send(JSON.stringify({
                                type: "set_which_player_you_are",
                                value: ws.player_id,
                            }));

                            for (var p = 0; p < players.length; ++p)
                            {
                                players[p].send(JSON.stringify({
                                    type: "htmx_message",
                                    html: playersHTML(),
                                }));
                            }

                            if (players.length >= REQUIRED_PLAYERS && IN_GAME !== true)
                            {
                                COUNTDOWN_MS_ITERATOR = 0;
                                COUNTDOWN_CURRENT_SECONDS = COUNTDOWN_SECONDS;
                                clearInterval(COUNTDOWN_INTERVAL);
                                COUNTDOWN_INTERVAL = setInterval(function () {
                                    ++COUNTDOWN_MS_ITERATOR;
                                    for (var p = 0; p < players.length; ++p)
                                    {
                                        players[p].send(JSON.stringify({
                                            type: "htmx_message",
                                            html: countdownTimerHTML(),
                                        }));
                                    }
                                    if (COUNTDOWN_CURRENT_SECONDS <= 0)
                                    {
                                        for (var p = 0; p < players.length; ++p)
                                        {
                                            players[p].send(JSON.stringify({
                                                type: "htmx_message",
                                                html: "<div id='countdown_timer'>GAME STARTING!</div>",
                                            }));
                                        }
                                        IN_GAME = true;
                                        beginGame();
                                        clearInterval(COUNTDOWN_INTERVAL);

                                        sendGameDataToAllPlayers();
                                    }
                                    --COUNTDOWN_CURRENT_SECONDS;
                                }, 1000);
                            }

                            if (data.keystring === ADMIN_KEY)
                            {
                                ws.send(JSON.stringify({
                                    type: "htmx_message",
                                    html: adminHTML(),
                                }));
                            }
                        }
                        break;
                    case "player_action":
                        if (!confirmKeyInData(ws, "validate_key", data)) { break; }
                        if (validateKey(ws, "validate_key", data.username, data.keystring))
                        {
                            // TURN ORDER IMPLEMENTATION
                            // If current player id == SENTRY then it's an NPC turn, continue until not sentry
                            // - That should store all the moves the npcs make
                            // When not sentry, update all players
                            // At that point, do not accept any input from any player unless its the current players turn
                            // On the client side, if it's current players turn (simple check on client) then
                            // - only send a move
                            // - only send a cannon after confirmation (not during)
                            // - only send a boarding after confirmation (not during)
                            // -- if move & attack has been done just check on server and send updated game if turn auto ends
                            // - only send end turn
                            // GameData would include the current turn order from the wasm stuff on the server (nobody elses)
                            // - client renders & overrides turn order

                            console.log("-- current turn player id is " + symbols.get_current_ocean_battle_turn_player_id() + ":" + ws.player_id);
                            if (symbols.get_current_ocean_battle_turn_player_id() === ws.player_id)
                            {
                                // NOTE: If we don't do this then the options aren't loaded in the scene and so we end up stuck
                                symbols.set_which_player_you_are(ws.player_id);
                                if (data.action.type === "making_choice")
                                {
                                    symbols.current_scene_make_choice(parseInt(data.action.choice_id));
                                    symbols.scene_ocean_battle(0);
                                    if (GAME_LAST_ATTACKED_SHIP_ID !== null)
                                    {
                                        // NOTE: The issue is that the scene state to do a cannon || boarding attack
                                        // does the attack *AFTER* confirmation so we have to check it here.
                                        // TODO: Fix this out of order issue inside the game itself
                                        console.log(GAME_LAST_ATTACKED_SHIP_ID);
                                        console.log("Ship destroyed? " + symbols.get_ship_hull(GAME_LAST_ATTACKED_SHIP_ID));
                                        console.log("Ship destroyed? " + symbols.get_ship_crew(GAME_LAST_ATTACKED_SHIP_ID));
                                        // TODO: differentiate between kraken, blackbeard, davey jones and player ships
                                        var destruction = false;
                                        if (symbols.get_ship_hull(GAME_LAST_ATTACKED_SHIP_ID) <= 0)
                                        {
                                            console.log("SHIP HULL ZERO");
                                            destruction = true;
                                        }
                                        if (symbols.get_ship_crew(GAME_LAST_ATTACKED_SHIP_ID) <= 0)
                                        {
                                            console.log("SHIP CREW ZERO");
                                            destruction = true;
                                        }
                                        if (destruction)
                                        {
                                            var current_points = db.query("SELECT * FROM users WHERE username = ?").get([data.username]).score;
                                            db.query("UPDATE users SET score = $points WHERE username = $username").run({
                                                $points: parseInt(current_points + 10),
                                                $username: data.username,
                                            });
                                            for (var p = 0; p < players.length; ++p)
                                            {
                                                players[p].send(JSON.stringify({
                                                    type: "htmx_message",
                                                    html: playersHTML(),
                                                }));
                                            }
                                        }
                                        GAME_LAST_ATTACKED_SHIP_ID = null;
                                    }
                                }
                                if (data.action.type === "back_button")
                                {
                                    symbols.current_scene_make_choice(1);
                                }
                                else if (data.action.type === "moving_choose_target")
                                {
                                    symbols.set_ocean_battle_data_intended_move_x(parseInt(data.action.chosen_target.x));
                                    symbols.set_ocean_battle_data_intended_move_y(parseInt(data.action.chosen_target.y));
                                    // symbols.ocean_battle_is_valid_movement_coordinates(x, y)
                                    // Fake out the selection of the confirmation button
                                    symbols.current_scene_make_choice(0);
                                    symbols.scene_ocean_battle(0);
                                }
                                else if (data.action.type === "cannon_attack_choose_target")
                                {
                                    symbols.set_ocean_battle_data_intended_cannon_x(parseInt(data.action.chosen_target.x));
                                    symbols.set_ocean_battle_data_intended_cannon_y(parseInt(data.action.chosen_target.y));
                                    // symbols.ocean_battle_is_valid_movement_coordinates(x, y)
                                    // Fake out the selection of the confirmation button
                                    symbols.current_scene_make_choice(0);
                                    symbols.scene_ocean_battle(0);
                                    
                                    var npc_layer_id = symbols.get_layer_id_by_machine_name(createWasmString("npc_layer"));
                                    var world_value = symbols.get_viewport_value_at_coordinates(npc_layer_id, data.action.chosen_target.x, data.action.chosen_target.y);
                                    var ship_id = symbols.get_world_npc_entity_id(world_value);
                                    GAME_LAST_ATTACKED_SHIP_ID = ship_id;
                                }
                                else if (data.action.type === "boarding_attack_choose_target")
                                {
                                    symbols.set_ocean_battle_data_intended_boarding_x(parseInt(data.action.chosen_target.x));
                                    symbols.set_ocean_battle_data_intended_boarding_y(parseInt(data.action.chosen_target.y));
                                    // symbols.ocean_battle_is_valid_movement_coordinates(x, y)
                                    // Fake out the selection of the confirmation button
                                    symbols.current_scene_make_choice(0);
                                    symbols.scene_ocean_battle(0);

                                    var npc_layer_id = symbols.get_layer_id_by_machine_name(createWasmString("npc_layer"));
                                    var world_value = symbols.get_viewport_value_at_coordinates(npc_layer_id, data.action.chosen_target.x, data.action.chosen_target.y);
                                    var ship_id = symbols.get_world_npc_entity_id(world_value);
                                    GAME_LAST_ATTACKED_SHIP_ID = ship_id;
                                }
                                // TODO: Special, if kraken, no crew, so all attacks are hull attacks

                                // Running tick 3x just to make sure the game progresses fine
                                symbols.tick();
                                symbols.tick();
                                symbols.tick();
                            }
                            else if (symbols.get_current_ocean_battle_turn_player_id() === symbols.get_sentry())
                            {
                                symbols.current_scene_make_choice(0);
                                symbols.scene_ocean_battle(0);
                            }
                            else if (symbols.get_current_ocean_battle_turn_player_id() > players.length)
                            {
                                // Note: The idea here is you gotta be able to say "ok" for non-player (npc) turns
                                if (data.action.type === "making_choice")
                                {
                                    symbols.current_scene_make_choice(parseInt(data.action.choice_id));
                                    symbols.scene_ocean_battle(0);
                                }
                            }
                            else
                            {
                                console.log("I dunno something went wrong I guess");
                            }
                            // TODO: This is going to thrash the connection with messages to all players
                            // every time a player mashes the button during their turn
                            sendGameDataToAllPlayers();
                            ws.send(JSON.stringify({
                                type: "htmx_message",
                                html: playersHTML(),
                            }));
                            var victory_string_id = symbols.get_string_id_by_machine_name(createWasmString("ocean_battle_victory"));
                            console.log("Victory String ID: " + victory_string_id);
                            console.log("Current scene state string id: " + symbols.get_current_scene_state_string_id());
                            if (symbols.get_current_scene_state_string_id() === victory_string_id)
                            {
                                endGame();
                                console.log("VICTORY!");
                                process.exit();
                                // TODO: Reset the game here or whatever
                                // TODO: Send a special message here
                            }
                        }
                        break;
                    case "get_game_state":
                        if (!confirmKeyInData(ws, "validate_key", data)) { break; }
                        if (validateKey(ws, "validate_key", data.username, data.keystring))
                        {
                            ws.send(JSON.stringify({
                                type: "get_game_state",
                                success: true,
                                message: "Game state returned",
                                game_data: generateGameData(),
                            }));
                        }
                        break;
                    case "chat_message":
                        if (!confirmKeyInData(ws, "validate_key", data)) { break; }
                        if (validateKey(ws, "validate_key", data.username, data.keystring))
                        {
                            if (!data.chat_message)
                            {
                                console.error("[E] need a chat message");
                                ws.send(JSON.stringify({
                                    type: "chat_message",
                                    success: false,
                                    error: "[E] Need a chat message to work with"
                                }));
                                break;
                            }
                            chat_messages.push({
                                text: stripHTMLTags(data.chat_message),
                                username: data.username,
                            });
                            if (chat_messages.length > 10)
                            {
                                chat_messages.shift();
                            }
                            for (var i = 0; i < players.length; ++i)
                            {
                                players[i].send(JSON.stringify({
                                    type: "htmx_message",
                                    html: chatHTML(),
                                }));
                            }
                        }
                        break;
                }
            }
            catch (e)
            {
                console.error("Websocket message error:", e);
                ws.send(JSON.stringify({
                    error: "Invalid message format"
                }));
            }
        },
        open(ws)
        {
            console.log("Client connected");
            ws.subscribe("gamestate");
            console.log("Subscribed");
            ws.send(JSON.stringify({
                type: "welcome",
                message: "Connected to game server"
            }));
        },
        close(ws)
        {
            console.log("Client disconnected");
            ws.unsubscribe("gamestate");
        }
    }
});
console.log("Server start at port " + Bun.env.PORT);