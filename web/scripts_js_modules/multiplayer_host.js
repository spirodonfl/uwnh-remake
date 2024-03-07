import { RyansBackendMainHole } from './websocket-ryans-backend-main-hole.js';
import { globals } from './globals.js';
import { globalStyles } from "./global-styles.js";
import { wasm } from './injector_wasm.js';

export class MultiplayerHost extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        // TODO: Share in a common module/webcomponent
        this.ships_to_players = [null, null, null, null, null];
        this.ships_to_players_colors = ['#e28383', '#9e9ef9', '#79df79', 'yellow', '#df70df'];

        // TODO: Fun fact! Unless you inject the element onto the page
        // (which you don't want to do, in this case, until you need it)
        // the inputs don't get registered globally so the cheatsheet
        // doesn't update until the element exists
        this.inputs = [
            {
                description: 'Toggle Leaderboard',
                context: globals.MODES.indexOf('MULTIPLAYER_HOST'),
                code: 'Digit1',
                friendlyCode: 'Shift+1',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.toggleLeaderboardDisplay();
                }
            },
            {
                description: 'Toggle Player List',
                context: globals.MODES.indexOf('MULTIPLAYER_HOST'),
                code: 'Digit3',
                friendlyCode: 'Shift+3',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.togglePlayerList();
                }
            },
        ];
    }

    connectedCallback() {
        this.render();
        globals.INPUTS = globals.INPUTS.concat(this.inputs);
        globals.EVENTBUS.addEventListener('viewport-size', (e) => {
            // TODO: Need to go around and remove the extraneous "updatePlayerList" calls we make
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('game-rendered', (e) => {
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('opened-ryans-backend-main-hole', (e) => {
            // console.log('opened')
        });
        globals.EVENTBUS.addEventListener('message-from-ryans-backend-main-hole', function (a) {
            // console.log('b', a);
        });
        globals.EVENTBUS.addEventListener('leaderboard-update', (e) => {
            const leaderboard = this.shadowRoot.getElementById('leaderboard');
            leaderboard.innerHTML = '';
            for (var i = 0; i < e.data.length; ++i) {
                var score = e.data[i];
                leaderboard.innerHTML += `<div>${score.user}: ${score.total}</div>`;
            }
            leaderboard.classList.remove('hidden');
        });
        globals.EVENTBUS.addEventListener('user-spawns', (e) => {
            console.log('USER IS SPAWNING', e);
            let user_spawned = false;
            let user_exists = false;
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
                    user_exists = true;
                    break;
                }
            }
            if (!user_exists) {
                let s_to_p_id = 0;
                // TODO: SPIRO CLEAN THIS UP YOU HOSER
                // ALSO SEND CHAT MAPLE SYRUP TO APOLOGIZE, EH?
                let entities = wasm.game_getEntitiesLength();
                for (var i = 0; i < entities; ++i) {
                    let entity_id = wasm.game_getEntityIdByIndex(i);
                    let entity_type = wasm.game_getEntityTypeByIndex(i);
                    if (entity_type === 1 || entity_type === 3) {
                        let taken = false;
                        for (let s_to_p = 0; s_to_p < this.ships_to_players.length; ++s_to_p) {
                            if (this.ships_to_players[s_to_p] !== null) {
                                if (this.ships_to_players[s_to_p].wasm_entity_id === entity_id) {
                                    taken = true;
                                    break;
                                }
                            }
                        }
                        if (!taken) {
                            for (let s_to_p = 0; s_to_p < this.ships_to_players.length; ++s_to_p) {
                                if (this.ships_to_players[s_to_p] === null) {
                                    user_spawned = true;
                                    s_to_p_id = s_to_p;
                                    this.ships_to_players[s_to_p] = {username: e.data.user, role: e.data.role, wasm_entity_id: entity_id};
                                    // TODO: Pull from default value within WASM instead of magic number-ing
                                    wasm.game_entitySetHealth(entity_id, 10);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }

                this.updatePlayerList();

                if (user_spawned) {
                    this.broadcastGameState();
                }

                console.log(this.ships_to_players);
            }
        });
        globals.EVENTBUS.addEventListener('user-despawns', (e) => {
            console.log('User wants to despawn');
            var user_despawned = false;
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
                    this.ship_to_players[i] = null;
                    user_despawned = true;
                    // TODO: Reset this entities health and anything else we need
                }
            }

            if (user_despawned) {
                this.broadcastGameState();
            }
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('user-moves-left', (e) => {
            console.log('User wants to move left');
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
                    console.log('sending message for user move left [' + this.ships_to_players[i].wasm_entity_id + ']');
                    wasm.messages_moveLeft(this.ships_to_players[i].wasm_entity_id, 0);
                    break;
                }
            }
            this.broadcastGameState();
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('user-moves-right', (e) => {
            console.log('User wants to move right');
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
                    console.log('sending message for user move right [' + this.ships_to_players[i].wasm_entity_id + ']');
                    wasm.messages_moveRight(this.ships_to_players[i].wasm_entity_id, 0);
                    break;
                }
            }
            this.broadcastGameState();
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('user-moves-up', (e) => {
            console.log('User wants to move up');
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
                    console.log('sending message for user move up [' + this.ships_to_players[i].wasm_entity_id + ']');
                    wasm.messages_moveUp(this.ships_to_players[i].wasm_entity_id, 0);
                    break;
                }
            }
            this.broadcastGameState();
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('user-moves-down', (e) => {
            console.log('User wants to move down');
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
                    console.log('sending message for user move down [' + this.ships_to_players[i].wasm_entity_id + ']');
                    wasm.messages_moveDown(this.ships_to_players[i].wasm_entity_id, 0);
                    break;
                }
            }
            this.broadcastGameState();
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('user-attacks', (e) => {
            console.log('User wants to attack');
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
                    console.log('sending message for user attack [' + this.ships_to_players[i].wasm_entity_id + ']');
                    wasm.messages_attack(this.ships_to_players[i].wasm_entity_id, 0);
                    break;
                }
            }
            this.broadcastGameState();
            this.updatePlayerList();
        });


        RyansBackendMainHole.init();

        // TODO: A better way to not repeat our input functionality here
        document.addEventListener('keydown', (e) => {
            for (var i = 0; i < this.inputs.length; ++i) {
                let input = this.inputs[i];
                if (e.code === input.code && e.shiftKey === input.shiftKey && e.ctrlKey === input.ctrlKey) {
                    if (input.context === globals.MODES.indexOf('ALL') || input.context === globals.MODE) {
                        input.callback();
                    }
                }
            }
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    broadcastGameState(message_user) {
        var positions = [];
        var health = [];
        for (var i = 0; i < this.ships_to_players.length; ++i) {
            if (this.ships_to_players[i] !== null) {
                var entity_id = this.ships_to_players[i].wasm_entity_id;
                positions.push([wasm.game_entityGetPositionX(entity_id), wasm.game_entityGetPositionY(entity_id)]);
                health.push(wasm.game_entityGetHealth(entity_id));
            } else {
                positions.push(null);
                health.push(null);
            }
        }
        if (message_user) {
            RyansBackendMainHole.ws.send(JSON.stringify({
                "send": {
                    "user": message_user,
                    "payload": {
                        "game_state": {
                            "ships_to_players": this.ships_to_players,
                            "positions": positions,
                            "health": health,
                        }
                    }
                }
            }));
        } else {
            RyansBackendMainHole.ws.send(JSON.stringify({
                "broadcast": {
                    "payload": {
                        "game_state": {
                            "ships_to_players": this.ships_to_players,
                            "positions": positions,
                            "health": health,
                        }
                    }
                }
            }));
        }
    }

    updatePlayerList() {
        var players_element = this.shadowRoot.getElementById('players');
        players_element.innerHTML = '';
        var game_component = document.querySelector('game-component');
        var entity_components = game_component.shadowRoot.querySelector('entity-component');
        for (var e = 0; e < entity_components.length; ++e) {
            entity_components[e].clearBorder();
        }
        for (var i = 0; i < this.ships_to_players.length; ++i) {
            if (this.ships_to_players[i] !== null) {
                var color = this.ships_to_players_colors[i];
                var entity_id = this.ships_to_players[i].wasm_entity_id;
                // TODO: Pull this from wasm instead of magic numbers
                var entity_layer = 2;
                game_component.shadowRoot.querySelector('[entity_id="' + entity_id + '"][layer="' + entity_layer + '"]').setBorder(color);
                players_element.innerHTML += '<span style="color:' + color + ';">' + this.ships_to_players[i].username + '</span><br />';
            }
        }
    }

    incrementLeaderboard(attacker_entity_id, attackee_entity_id) {
        // despawn attackee_entity_id
        var user = null;
        for (var p = 0; p < this.ships_to_players.length; ++p) {
            if (this.ships_to_players[p] !== null && this.ships_to_players[p].wasm_entity_id === attacker_entity_id) {
                user = this.ships_to_players[p].username;
                break;
            }
        }
        if (user !== null) {
            RyansBackendMainHole.ws.send(JSON.stringify(
                {
                    increment_score: {
                        user: user,
                        inc: 1
                    }
                }
            ));
            RyansBackendMainHole.getLeaderboard();

            user = null;
            var s_to_p_id = null;
            var user_despawned = false;
            for (var p = 0; p < this.ships_to_players.length; ++p) {
                if (this.ships_to_players[p] !== null && this.ships_to_players[p].wasm_entity_id === attackee_entity_id) {
                    user = this.ships_to_players[p].username;
                    s_to_p_id = p;
                    this.ships_to_players[p] = null;
                    user_despawned = true;
                    break;
                }
            }

            this.updatePlayerList();

            if (user_despawned) {
                RyansBackendMainHole.ws.send(JSON.stringify({
                    "broadcast": {"payload": {
                        "user_despawned": user,
                        "s_to_p_id": s_to_p_id,
                        "data": this.ships_to_players,
                    }}
                }));
            }
        }
    }

    toggleLeaderboardDisplay() {
        const leaderboard = this.shadowRoot.getElementById('leaderboard');
        if (leaderboard.classList.contains('hidden')) {
            RyansBackendMainHole.getLeaderboard();
        } else {
            leaderboard.classList.add('hidden');
        }
    }

    toggleOnScreenControls() {
        const onScreenControls = this.shadowRoot.getElementById('on-screen-controls');
        onScreenControls.classList.toggle('hidden');
    }

    togglePlayerList() {
        const playerList = this.shadowRoot.getElementById('player-list');
        playerList.classList.toggle('hidden');
    }

    render() {
        this.shadowRoot.innerHTML = `
            ${globalStyles}
            <x-draggable name="leaderboard" id="leaderboard" class="hidden">
                <div class="main-content">
                    <div class="title">LEADERBOARD [TOP 40]</div>
                    <div>Some_Name: 1233222</div>
                </div>
            </x-draggable>
            <x-draggable name="on-screen-controls" id="on-screen-controls" class="hidden">
                <div class="main-content">
                    <input type="button" id="spawn_kraken" value="Spawn Kraken" />
                    <input type="button" id="despawn_kraken" value="Despawn Kraken" />
                    <input type="button" id="despawn_user" value="Despawn User" />
                    <input type="button" id="reset" value="Reset" />
                    <input type="button" id="give_crit_buff" value="Give Crit Buff" class="hidden" />
                </div>
            </x-draggable>
            <x-draggable name="player-list" id="player-list" class="hidden">
                <div class="main-content">
                    <div class="title">PLAYERS</div>
                    <div id="players"></div>
                </div>
            </x-draggable>
        `;
    }
};
customElements.define('multiplayer-host-component', MultiplayerHost);