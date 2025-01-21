import { serve } from "bun";
import { v4 as uuidv4, parse as uuidParse } from "uuid";
import database from "bun:sqlite";
import * as fs from "fs";

const db = database.open("game.db");

// Users have to generate a key via Discord
// -- key gets you access to the game (right role)
// When you initially load the page, validate the key
// -- if key is valid, set have_valid_key to true
// -- client starts polling (every X seconds, make a GET request for state of game)
// How do we determine when the game starts?
// -- Must have two or more active players
// -- Once two or more, start a countdown (30 secs)
// -- countdown ends, begin game
// When the game begins
// -- server must create fleets and add them to battle
// -- server must send that data to each client (stack)
// -- clients setup their local fleets & ships
// -- server initiates battle scene which places fleets/ships in world
// -- clients must also initiate their battle scene (must pass location data)
//
// What is our stack?
// - messages to send &| game state data
// -- PER active player
// - waiting for confirmation
// -- PER active player
// - waiting for confirmation from a *single* player
// -- player who is currently taking their turn in battle
// -- every other player is just waiting
// - on every X get request from players, we PULL and remove the "stack" object for that player
// -- track each players state (whether they pulled what's needed or not)
// - when stack is empty for *all* players, sometimes do a thing, sometimes not
// 
// This means we also need a POST path
// - all actions that a client needs to send will go through this POST path
//
// every GET/POST query will need a valid key
//
// What kind of data do we send to clients for actions && game state?
// - array of actions?
// -- set_current_scene(scene_id) (first get_current_scene() from server wasm)
// -- current_scene_state (same thing)
// -- Victory condition accounted for, but maybe send a special action to ensure it's CLEAR that this a victory condition
// -- move_world_npc_to (but first get_world_npc_x/get_world_npc_y from server wasm)
// --- ALT: send all world npc data all the time
// --- ALT: send all ship data (like crew and health) all the time
// - client has to run scene_ocean_battle(SCENE_ACTION_INIT (0)) locally, once scene state is updated
//
// We need a way for the server to trigger a clients page to reload (to start a new battle)
// We need a way for the server to reload it's own wasm state
// -- flush wasmInstance and then run webassembly.instance again (start at the top)
//
// [FUTURE]
// Would be cool to have *multiple* games going with multiple instances and each instance has unique players

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

// db.query(`UPDATE users SET score = score + ? WHERE username = ?`, [points, username]).run();
// const new_score = db.query("SELECT score FROM users WHERE username = ?", [username]).get().score;

const output_string_buffers = [];
const output_array_buffers = [];
const wasmCode = fs.readFileSync("./wasm_game.wasm");
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule, {
    env: {
        memory: new WebAssembly.Memory({
            initial: 512,
            maximum: 2048
        }),
        js_console_log: (ptr, len) => {
            const bytes = new Uint8Array(wasmInstance.exports.memory.buffer, ptr, len);
            const message = new TextDecoder('utf-8').decode(bytes);
            console.log(message);
        },
        js_output_string_buffer: (ptr, len) => {
            const bytes = new Uint8Array(wasmInstance.exports.memory.buffer, ptr, len);
            const message = new TextDecoder('utf-8').decode(bytes);
            output_string_buffers.push(message);
            const MAX_STRING_BUFFER_ENTRIES = 200;
            if (output_string_buffers.length > MAX_STRING_BUFFER_ENTRIES) {
                output_string_buffers.shift();
            }
        },
        js_output_array_buffer: (ptr, len) => {
            const array = new Int32Array(wasmInstance.exports.memory.buffer, ptr, len);
            output_array_buffers.push(array);
            const MAX_STRING_ARRAY_ENTRIES = 200;
            if (output_array_buffers.length > MAX_STRING_ARRAY_ENTRIES) {
                output_array_buffers.shift();
            }
        }
    }
});
// Access exports
const exports = wasmInstance.exports;
console.log("Exports are ready");
console.log(exports.initialize_game());

var players = [];
const COUNTDOWN_SECONDS = 120;

function beginGame()
{
    // iterate all players
    // we need to map server players to wasm players
    // SERVER ONLY -> c -> players[MAX_PLAYERS] -> must be mapped to server players array
    // when the game begins, we have to tell each client which player they are so their LOCAL wasm knows who they are
    // clients make a get request for state of game, in the stack of message, we say "you are player X"
    // -- client wasm.exports.set_which_player_you_are(server_id_authority)
    // -----------------------------------------------------------------------------------------
    // ONCE every player has pulled their player mapping
    // server sets up local instance of game
    // add fleets for each player to game
    // position everyone
    // when ready, add to player message stack (data for game [data we've determine above])
    // send scene && scene state
    // -----------------------------------------------------------------------------------------
    // each player must confirm that their local instance is setup
    // AKA: each player must get the "Setting Up Ocean Battle" message & click confirm
    // -- ships a POST request to server
    // -- once all players do this, continue
    // -- continue (in server context) == current_scene_make_choice(0) -> executes confirm locally for the server
    // -----------------------------------------------------------------------------------------
    // battle turn order will be updated based on previous server execution
    // who's turn is it? server doesn't need to send anything
    // IF WE DID THIS RIGHT
    // -- players will get put into a WAITING state
    // -- current turn player will auto prompted to take their actions
    // Wait for current turn player to submit their action to server
    // - server will pass that action into server wasm and respond good or bad
    // current turn player will have their turn END
    // -----------------------------------------------------------------------------------------
    // increment turn order (which SHOULD also happen automatically)
    // (pretend NPC turn now)
    // npc does actions in server wasm WHICH WE HAVE TO STORE AND SEND TO CLIENTS
    // ????? issue is that players will have their own local wasm run npc actions WITHOUT server consent because of single player mode
    // when the server sends updated state data, everybody will get re-synced
    // -----------------------------------------------------------------------------------------


    // clear_ocean_battle_fleets()
    // add_fleet_to_battle(get_fleet_id_by_general_id(get_npc_id_by_machine_name("npc_nakor")));
}

serve({
    port: 3333,
    static: {
        // NOTE: Cannot hot reload. HTML is static-ized
        "/index.html": new Response(await Bun.file("./index.html").bytes(), {
            header: { "Content-Type": "text/html" }
        })
    },
    async fetch(req)
    {
        const url = new URL(req.url);
        let body;

        if (req.method === "POST")
        {
            body = await req.json();
        }

        if (url.pathname === "/generatekey")
        {
            const { username } = body;
            const keyString = uuidv4();
            const key = uuidParse(keyString);

            db.run(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [username]);
            db.run(`INSERT INTO keys (key, username) VALUES (?, ?)`, [key, username]);

            return new Response(JSON.stringify({ keyString, key, username }), {
                header: { "Content-Type": "application/json" }
            });
        }
        else if (url.pathname === "/validatekey" && req.method === "POST")
        {
            const { keyString, username } = body;
            const key = uuidParse(keyString);
            const result = db.query("SELECT username FROM keys WHERE key = ?").get(key);

            if (result && result.username === username)
            {
                if (players.length < 10)
                {
                    var in_array = false;
                    for (var p = 0; p < players.length; ++p)
                    {
                        if (players[p].key === key)
                        {
                            in_array = true;
                            break;
                        }
                    }
                    if (!in_array)
                    {
                        players.push({
                            key, username
                        });
                    }
                }
                // Do not delete key from DB because we constantly need to check validity of key
                // TODO: Move to end of battle
                // db.run("DELETE FROM keys WHERE key = ?", [key]);

                if (players.length > 2)
                {
                    // start a countdown of X seconds or something
                    // countdown ends, begin game
                    // settimeout??????
                }

                return new Response(JSON.stringify({
                    success: true,
                    message: "Key validated, access granted!"
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
            else
            {
                return new Response(JSON.stringify({
                    success: false,
                    message: "Invalid key or username mismatch"
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
        }
        else if (url.pathname === "/getgamestate")
        {
            const { keyString, username } = body;
            const key = uuidParse(keyString);
            const result = db.query("SELECT username FROM keys WHERE key = ?").get(key);

            if (result && result.username === username)
            {
                return new Response(JSON.stringify({
                    success: true,
                    data: [32, 33, 69, 420],
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
            else
            {
                return new Response(JSON.stringify({
                    success: false,
                    message: "Invalid key or username mismatch"
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
        }
        else if (url.pathname === "/playeraction")
        {
            const { keyString, username, action, choice_id, chosen_target } = body;
            const key = uuidParse(keyString);
            const result = db.query("SELECT username FROM keys WHERE key = ?").get(key);

            if (choice_id !== "" && choice_id !== undefined && choice_id !== null)
            {
                choice_id = parseInt(choice_id);
            }
            // chosen_target.x && chosen_target.y
            // wasmInstance.exports.get_current_scene() -> clients set_current_scene()
            // wasmInstance.exports.get_current_scene_state()
            // ....get_current_world_total_world_npcs()
            // for (npc = 0; npc < total; ++npc) -> 
            /**
             *  get_world_npc_npc_id(npc) -> ....
                WORLD_NPC_CAPTAIN_ID,
                WORLD_NPC_POSITION_X,
                WORLD_NPC_POSITION_Y,
                WORLD_NPC_DIRECTION,
                WORLD_NPC_IS_INTERACTABLE,
                WORLD_NPC_IS_CAPTAIN,
                WORLD_NPC_INTERACTION_SCENE,
                WORLD_NPC_IS_PLAYER,
                WORLD_NPC_INVENTORY_ID,
                WORLD_NPC_ENTITY_ID,
                -> set_world_npc_npc_id(npc)
            */

            if (result && result.username === username)
            {
                // TODO: Match username to internal/wasm player id and ensure you're allowed to take action

                return new Response(JSON.stringify({
                    success: true,
                    message: "Good job!",
                    state: {
                        scene_name: "",
                        scene_state_name: "",
                        world_npcs: [{}, {}],
                        ships: [],
                    }
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
            else
            {
                return new Response(JSON.stringify({
                    success: false,
                    message: "Invalid key or username mismatch"
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
        }
        return new Response("Not found", { status: 404 });
    }
});