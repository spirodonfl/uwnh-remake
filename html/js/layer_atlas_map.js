// BUILDING starts with 20x12
var LAYER_ATLAS_MAP = {
    // Note: array values are "layer_value", "atlas-x", "atlas-y"
    "athens": {
        "background_layer": [],
        "layer_one":[],
        "layer_two":[],
        "npc_layer":[],
    },
    "dingus_land": {
        "background_layer": [],
        "layer_one":[],
        "layer_two":[],
        "npc_layer":[],
    },
    "world_globe_1": {
        "background_layer": [],
        "layer_one":[],
        "layer_two":[],
        "npc_layer":[],
    },
};
LAYER_ATLAS_MAP["athens"]["background_layer"][1] = [0, 0];
LAYER_ATLAS_MAP["athens"]["layer_one"][33] = [11, 27];
LAYER_ATLAS_MAP["athens"]["layer_one"][34] = [12, 27];
LAYER_ATLAS_MAP["athens"]["layer_one"][35] = [13, 27];
LAYER_ATLAS_MAP["athens"]["layer_one"][36] = [11, 26];
LAYER_ATLAS_MAP["athens"]["layer_one"][37] = [12, 26];
LAYER_ATLAS_MAP["athens"]["layer_one"][38] = [13, 26];
LAYER_ATLAS_MAP["athens"]["layer_one"][39] = [11, 28];
LAYER_ATLAS_MAP["athens"]["layer_one"][40] = [12, 28];
LAYER_ATLAS_MAP["athens"]["layer_one"][41] = [13, 28];
LAYER_ATLAS_MAP["athens"]["layer_one"][50] = [16, 5];
LAYER_ATLAS_MAP["athens"]["layer_one"][51] = [16, 6];
LAYER_ATLAS_MAP["athens"]["layer_one"][52] = [16, 7];
LAYER_ATLAS_MAP["athens"]["layer_one"][53] = [16, 4];
LAYER_ATLAS_MAP["athens"]["layer_one"][54] = [24, 5];
LAYER_ATLAS_MAP["athens"]["layer_one"][55] = [24, 7];
LAYER_ATLAS_MAP["athens"]["layer_one"][56] = [24, 4];
LAYER_ATLAS_MAP["athens"]["layer_one"][57] = [21, 8];
LAYER_ATLAS_MAP["athens"]["layer_one"][58] = [24, 6];
LAYER_ATLAS_MAP["athens"]["layer_one"][59] = [16, 3];
LAYER_ATLAS_MAP["athens"]["layer_two"][69] = [12, 0];
LAYER_ATLAS_MAP["athens"]["layer_two"][70] = [12, 0];
LAYER_ATLAS_MAP["athens"]["layer_two"][71] = [18, 3];
LAYER_ATLAS_MAP["athens"]["layer_two"][72] = [18, 4];
// Building
LAYER_ATLAS_MAP["athens"]["layer_one"][0] = [32, 4];
LAYER_ATLAS_MAP["athens"]["layer_one"][1] = [33, 4];
LAYER_ATLAS_MAP["athens"]["layer_one"][2] = [32, 5];
LAYER_ATLAS_MAP["athens"]["layer_one"][3] = [33, 5];
// Door
LAYER_ATLAS_MAP["athens"]["layer_two"][4] = [34, 4];
// Shipyard sign
LAYER_ATLAS_MAP["athens"]["layer_two"][10] = [19, 10];
// sailing sign
LAYER_ATLAS_MAP["athens"]["layer_two"][11] = [20, 10];
// rock
LAYER_ATLAS_MAP["athens"]["layer_two"][20] = [0, 27];
// house
LAYER_ATLAS_MAP["athens"]["layer_two"][50] = [25, 15];
LAYER_ATLAS_MAP["athens"]["layer_two"][51] = [21, 12];
LAYER_ATLAS_MAP["athens"]["layer_two"][52] = [22, 12];
LAYER_ATLAS_MAP["athens"]["layer_two"][53] = [23, 12];
LAYER_ATLAS_MAP["athens"]["layer_two"][54] = [24, 14];
LAYER_ATLAS_MAP["athens"]["layer_two"][55] = [25, 14];
LAYER_ATLAS_MAP["athens"]["layer_two"][56] = [26, 14];

// TODO: Need to come up with a better dataset
// LAYER_ATLAS_MAP["athens"]["npc_layer"][0] = {
//     default: [34, 1],
//     down: [34, 0],
//     up: [34, 2],
//     left: [34, 3],
//     right: [34, 4],
// };

LAYER_ATLAS_MAP["athens"]["npc_layer"][0] = [34, 1];
LAYER_ATLAS_MAP["athens"]["npc_layer"][1] = [35, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][2] = [36, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][3] = [35, 6];
LAYER_ATLAS_MAP["athens"]["npc_layer"][4] = [37, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][5] = [40, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][6] = [41, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][7] = [42, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][8] = [43, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][9] = [44, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][10] = [44, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][11] = [44, 2];
LAYER_ATLAS_MAP["athens"]["npc_layer"][12] = [44, 2];
LAYER_ATLAS_MAP["dingus_land"]["background_layer"][1] = [0, 0];
LAYER_ATLAS_MAP["dingus_land"]["layer_one"][42] = [16, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["player_one"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["player_two"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["player_three"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["player_four"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["player_five"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["npc_blackbeard"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["npc_davey_jones"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["npc_kraken"] = [18, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_player_one"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_player_two"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_player_three"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_player_four"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_player_five"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_npc_blackbeard"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_npc_davey_jones"] = [20, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_npc_kraken"] = [18, 0];
LAYER_ATLAS_MAP["dingus_land"]["npc_layer"]["ship_ship"] = [20, 0];
LAYER_ATLAS_MAP["world_globe_1"]["background_layer"][1] = [0, 0];
LAYER_ATLAS_MAP["world_globe_1"]["layer_one"][1] = [33, 0];
LAYER_ATLAS_MAP["world_globe_1"]["layer_two"][1] = [7, 2];
LAYER_ATLAS_MAP["world_globe_1"]["npc_layer"]["player_one"] = [20, 0];
var LAYER_COORDINATES_VALUE_HISTORY = [];
var LAYER_COORDINATES_VALUE_UNDO_COUNTER = 0;
var LAYER_COORDINATES_VALUE_REDO_COUNTER = 0;