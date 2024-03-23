import { RyansBackendSecondaryHole } from './websocket-ryans-backend-secondary-hole.js';

class ClassMultiplayer {
    constructor() {
        if (ClassMultiplayer.instance) {
            return Multiplayer.instance;
        }
        ClassMultiplayer.instance = this;
    }
    init() {
        this.ships_to_players = [null, null, null, null, null];
        this.ships_to_players_colors = ['#e28383', '#9e9ef9', '#79df79', 'yellow', '#df70df'];
        this.kraken_enabled = false;
        // TODO: Is this being used still?
        this.kraken_image = null;
        this.user = null;
        this.last_move_direction = null;
    }
    getOwnEntityId() {
        if (this.user !== null) {
            for (let p = 0; p < this.ships_to_players.length; ++p) {
                if (this.ships_to_players[p] !== null && this.ships_to_players[p].username === this.user.username) {
                    return this.ships_to_players[p].wasm_entity_id;
                }
            }
        }
        return false;
    }
    inGame() {
        if (this.user !== null) {
            for (let p = 0; p < this.ships_to_players.length; ++p) {
                if (this.ships_to_players[p] !== null && this.ships_to_players[p].username === this.user.username) {
                    return true;
                }
            }
        }
        return false;
    }
    sendSpawn() {
        RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'spawn'}));
    }
    sendDespawn() {
        // TODO: Remove range highlighter
        RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'despawn'}));
    }
    sendAttack() {
        if (this.inGame()) {
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'attack'}));
        }
    }
    sendLeft() {
        if (this.inGame()) {
            this.last_move_direction = 'left';
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'left'}));
        }
    }
    sendRight() {
        if (this.inGame()) {
            this.last_move_direction = 'right';
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'right'}));
        }
    }
    sendUp() {
        if (this.inGame()) {
            this.last_move_direction = 'up';
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'up'}));
        }
    }
    sendDown() {
        if (this.inGame()) {
            this.last_move_direction = 'down';
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'down'}));
        }
    }
};

const Multiplayer = new ClassMultiplayer();
export { Multiplayer };
