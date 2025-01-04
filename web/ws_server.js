import { serve } from "bun";
import { WebSocketServer } from "ws";
import { readFileSync } from "fs";
import https from "https";

// Load SSL/TLS certificates
const privateKey = readFileSync('C:\\Users\\spiro\\D\\snotes\\shell_files\\nginx_config\\server.key', 'utf8');
const certificate = readFileSync('C:\\Users\\spiro\\D\\snotes\\shell_files\\nginx_config\\server.crt', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
};

// Load and instantiate the WASM module
let wasmModule;
let wasm;
async function loadWasmModule() {
    const wasmBuffer = readFileSync("odin.game.wasm");
    wasmModule = await WebAssembly.instantiate(wasmBuffer, {
        env: {
            js_console_log: (ptr, len) => {
                const memory = wasmModule.instance.exports.memory;
                const bytes = new Uint8Array(memory.buffer, ptr, len);
                const message = new TextDecoder("utf-8").decode(bytes);
                console.log(message);
            },
        },
    });
    wasm = wasmModule.instance.exports;

    // Initialize the game state
    wasm.init();
    wasm.set_viewport_size(8, 8);
}

const players = new Map();
const spectators = new Set();
const availableShips = new Set([1, 2, 3, 4, 5]);

async function startServer() {
    await loadWasmModule();

    // Create HTTPS server
    const httpsServer = https.createServer(credentials);
    httpsServer.listen(3334, () => {
        console.log('HTTPS Server running on port 3334');
    });

    // Create WSS server
    const wss = new WebSocketServer({ server: httpsServer });

    wss.on("connection", (ws) => {
        console.log("New client connected");

        ws.on("message", (message) => {
            const data = JSON.parse(message);
            handleClientMessage(ws, data);
        });

        ws.on("close", () => {
            console.log("Client disconnected");
            const shipId = players.get(ws);
            if (shipId) {
                availableShips.add(shipId);
            }
            players.delete(ws);
            spectators.delete(ws);
            broadcastGameState();
        });
    });

    console.log("WSS server is running on wss://localhost:8443");
}

// Start the server
startServer().catch(console.error);

async function resetGameState() {
    // Unload and reload the WASM module
    await loadWasmModule();

    // Clear out all players
    players.clear();

    // Reset available ships
    availableShips.clear();
    for (let i = 1; i <= 5; i++) { // Assuming 5 ships, adjust as needed
        availableShips.add(i);
    }

    wasm.init();
    wasm.set_viewport_size(8, 8);

    // Broadcast the reset game state to all connected clients
    broadcastGameState();

    console.log("Game state has been reset");
}

async function handleClientMessage(ws, message) {
    switch (message.type) {
        case "request_spot":
            assignSpot(ws);
            break;
        case "move":
            handleMove(ws, message);
            break;
        case "attack":
            handleAttack(ws, message);
            break;
        case "end_turn":
            handleEndTurn(ws, message);
            break;
        case "reset_game":
            await resetGameState();
            break;
    }
}

function assignSpot(ws) {
    const availableShipId = getAvailableShipId();
    if (availableShipId !== null) {
        players.set(ws, availableShipId);
        availableShips.delete(availableShipId);
        ws.send(JSON.stringify({
            type: "spot_assignment",
            role: "player",
            ship_id: availableShipId
        }));
    } else {
        spectators.add(ws);
        ws.send(JSON.stringify({
            type: "spot_assignment",
            role: "spectator"
        }));
    }
    broadcastGameState();
}

function getAvailableShipId() {
    if (availableShips.size > 0) {
        return availableShips.values().next().value;
    }
    return null;
}

function handleMove(ws, message) {
    const shipId = players.get(ws);
    const currentTurnShipId = wasm.get_current_ship_id();

    if (shipId && shipId === currentTurnShipId) {
        if (wasm.is_in_players_movement_range(message.x, message.y)) {
            wasm.move_ship(shipId, message.x, message.y);
            broadcastGameState();
        }
    }
}

function handleAttack(ws, message) {
    const shipId = players.get(ws);
    const currentTurnShipId = wasm.get_current_ship_id();
    console.log('handle attack', shipId, currentTurnShipId);
    if (shipId && shipId === currentTurnShipId) {
        console.log('is in players attack range', message, wasm.is_target_in_attack_range(message.attacker_x, message.attacker_y, message.target_x, message.target_y));
        if (wasm.is_target_in_attack_range(message.attacker_x, message.attacker_y, message.target_x, message.target_y)) {
            const targetShipId = wasm.get_viewport_value_at_coordinates(2, message.target_x, message.target_y);
            console.log('target ship id', targetShipId);
            if (targetShipId > 0) {
                const success = wasm.ship_attack(shipId, targetShipId);
                console.log('ship attack success', success);
                if (success) {
                    broadcastAttackResult(shipId, targetShipId, message.target_x, message.target_y);
                }
                broadcastGameState();
            }
        }
    }
}

function handleEndTurn(ws, message) {
    const shipId = players.get(ws);
    const currentTurnShipId = wasm.get_current_ship_id();
    console.log('handle end turn', shipId, currentTurnShipId, wasm.is_player_turn(shipId));

    if (shipId && shipId === currentTurnShipId) {
        console.log('ending turn in server');
        wasm.end_turn();
        // const nextShipId = wasm.get_current_ship_id();
        // broadcastTurnEnded(nextShipId);
        broadcastGameState();
    } else {
        broadcastGameState();
        console.log('Attempted to end turn for incorrect player');
    }
}

function broadcastTurnEnded(nextShipId) {
    const turnEndedMessage = JSON.stringify({
        type: "turn_ended",
        next_turn: nextShipId
    });

    players.forEach((_, ws) => ws.send(turnEndedMessage));
    spectators.forEach(ws => ws.send(turnEndedMessage));
    broadcastGameState();
}

function broadcastGameState() {
    const state = getGameState();
    const stateMessage = JSON.stringify({
        type: "state_update",
        state: state
    });

    players.forEach((_, ws) => ws.send(stateMessage));
    spectators.forEach(ws => ws.send(stateMessage));
}

function broadcastAttackResult(attackerId, targetId, targetX, targetY) {
    const message = JSON.stringify({
        type: "attack_result",
        success: true,
        attacker_id: attackerId,
        attacker_x: wasm.get_ship_x(attackerId),
        attacker_y: wasm.get_ship_y(attackerId),
        target_id: targetId,
        target_x: targetX,
        target_y: targetY,
        new_target_hp: wasm.get_ship_hp(targetId)
    });

    players.forEach((_, ws) => ws.send(message));
    spectators.forEach(ws => ws.send(message));
}

function getGameState() {
    const state = {
        ships: [],
        currentTurn: wasm.get_current_ship_id(),
        currentAction: wasm.get_current_ship_action(),
    };

    const shipLayerIndex = wasm.find_ships_layer_index();
    const mapWidth = wasm.get_current_map_width();
    const mapHeight = wasm.get_current_map_height();

    // Scan the ship layer to find ship positions
    for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
            const shipId = wasm.get_viewport_value_at_coordinates(shipLayerIndex, x, y);
            if (shipId > 0) {
                const shipState = {
                    id: shipId,
                    x: x,
                    y: y,
                    hp: wasm.get_ship_hp(shipId),
                    isActive: wasm.get_ship_hp(shipId) > 0,
                    relativeTurnOrder: wasm.get_relative_turn_order(shipId),
                };
                state.ships.push(shipState);
            }
        }
    }

    return state;
}

console.log("WebSocket server is running");