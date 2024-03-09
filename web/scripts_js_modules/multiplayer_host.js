import { RyansBackendMainHole } from './websocket-ryans-backend-main-hole.js';
import { globals, possibleKrakenImages } from './globals.js';
import { globalStyles } from "./global-styles.js";
import { wasm } from './injector_wasm.js';
import { FRAMES } from './frames.js';
import { getRandomKey } from './helpers.js';

export class MultiplayerHost extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        // TODO: Share in a common module/webcomponent
        this.ships_to_players = [null, null, null, null, null];
        this.ships_to_players_colors = ['#e28383', '#9e9ef9', '#79df79', 'yellow', '#df70df'];
        this.kraken_enabled = false;
        this.current_kraken_image = 'squid';

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
                description: 'Toggle Host Controls',
                context: globals.MODES.indexOf('MULTIPLAYER_HOST'),
                code: 'Digit2',
                friendlyCode: 'Shift+2',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.shadowRoot.getElementById('host-controls').toggleVisibility();
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
            {
                description: 'Move camera up',
                context: globals.MODES.indexOf('MULTIPLAYER_HOST'),
                code: 'ArrowUp',
                friendlyCode: '↑',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    document.querySelector('game-component').moveCameraUp();
                }
            },
            {
                description: 'Move camera down',
                context: globals.MODES.indexOf('MULTIPLAYER_HOST'),
                code: 'ArrowDown',
                friendlyCode: '↓',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    document.querySelector('game-component').moveCameraDown();
                }
            },
            {
                description: 'Move camera left',
                context: globals.MODES.indexOf('MULTIPLAYER_HOST'),
                code: 'ArrowLeft',
                friendlyCode: '←',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    document.querySelector('game-component').moveCameraLeft();
                }
            },
            {
                description: 'Move camera right',
                context: globals.MODES.indexOf('MULTIPLAYER_HOST'),
                code: 'ArrowRight',
                friendlyCode: '→',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    document.querySelector('game-component').moveCameraRight();
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
            if (this.kraken_enabled === false) {
                this.disableKraken();
            } else if (this.kraken_enabled === true) {
                this.enableKraken();
            }
            this.broadcastGameState();
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
                console.log(this.ships_to_players);
            }
            this.broadcastGameState();
        });
        globals.EVENTBUS.addEventListener('user-despawns', (e) => {
            console.log('User wants to despawn');
            var user_despawned = false;
            for (var i = 0; i < this.ships_to_players.length; ++i) {
                if (this.ships_to_player[i] !== undefined && this.ships_to_players[i] !== null && this.ships_to_players[i].username === e.data.user) {
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

        this.shadowRoot.getElementById('toggle_leaderboard').addEventListener('click', () => {
            this.toggleLeaderboardDisplay();
        });
        this.shadowRoot.getElementById('toggle_player_list').addEventListener('click', () => {
            this.togglePlayerList();
        });
        this.shadowRoot.getElementById('enable_kraken').addEventListener('click', () => {
            this.randomizeKraken();
            this.enableKraken();
            this.broadcastGameState();
        });
        this.shadowRoot.getElementById('disable_kraken').addEventListener('click', () => {
            this.disableKraken();
            this.broadcastGameState();
        });
        this.shadowRoot.getElementById('set_kraken_health').addEventListener('click', () => {
            let kraken_entity_id = 7;
            let health = this.shadowRoot.getElementById('kraken_health').value;
            wasm.game_entitySetHealth(kraken_entity_id, health);
            this.broadcastGameState();
        });
        this.shadowRoot.getElementById('set_kraken_image').addEventListener('click', () => {
            let kraken_entity_id = 7;
            let image = this.shadowRoot.getElementById('kraken_image').value;
            if (possibleKrakenImages[image]) {
                this.current_kraken_image = image;
                let entity_layer = wasm.game_getCurrentWorldEntityLayer();
                let image_data = globals.IMAGE_DATA[0][entity_layer][kraken_entity_id];
                if (image_data) {
                    image_data[0][0] = possibleKrakenImages[image].x * 64;
                    image_data[0][1] = possibleKrakenImages[image].y * 64;
                }
                this.broadcastGameState();
            }
        });

        FRAMES.addRunOnFrames(30, false, () => {
            if (this.kraken_enabled) {
                let entity_id = 7;
                let directions = [0, 1, 2, 3];
                let randomIndex = Math.floor(Math.random() * directions.length);
                let randomDirection = directions[randomIndex];
                if (randomDirection === 0) {
                    wasm.messages_moveLeft(entity_id, 0);
                } else if (randomDirection === 1) {
                    wasm.messages_moveRight(entity_id, 0);
                } else if (randomDirection === 2) {
                    wasm.messages_moveUp(entity_id, 0);
                } else if (randomDirection === 3) {
                    wasm.messages_moveDown(entity_id, 0);
                }
                wasm.messages_attack(entity_id, 0);
                var length = wasm.diff_getLength();
                for (var l = 0; l < length; ++l) {
                    var diff = wasm.diff_getData(l);
                    // TODO: Fix magic number here. This is also on Zig side
                    if (diff === 69) {
                        var attacker_entity_id = wasm.diff_getData((l + 1));
                        var attacker_entity_type = wasm.game_entityGetType(attacker_entity_id);
                        if (attacker_entity_type == 7) {
                            var attackee_entity_id = wasm.diff_getData((l + 2));
                            var health = wasm.game_entityGetHealth(attackee_entity_id);
                            if (health === 0) {
                                this.despawnUser(attackee_entity_id);
                            }
                        }
                        l += 2;
                    }
                }
                this.broadcastGameState();
            }
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    randomizeKraken() {
        let kraken_entity_id = 7;
        let entity_layer = wasm.game_getCurrentWorldEntityLayer();
        let random_kraken_image = getRandomKey(possibleKrakenImages);
        this.current_kraken_image = random_kraken_image;
        let image_data = globals.IMAGE_DATA[0][entity_layer][kraken_entity_id];
        if (image_data) {
            image_data[0][0] = possibleKrakenImages[random_kraken_image].x * 64;
            image_data[0][1] = possibleKrakenImages[random_kraken_image].y * 64;
        }
    }
    // TODO: Damn it we need a common place for this multiplayer stuff
    enableKraken() {
        this.kraken_enabled = true;
        // TODO: Don't rely on magic numbers here!
        let kraken_entity_id = 7;
        let entity_layer = wasm.game_getCurrentWorldEntityLayer();
        if (wasm.game_entityGetHealth(kraken_entity_id) === 0) {
            wasm.game_entitySetHealth(kraken_entity_id, 44);
        }
        wasm.game_entityEnableCollision(kraken_entity_id);
        var kraken_element = document.querySelector('game-component').shadowRoot.querySelector('[entity_id="' + kraken_entity_id + '"][layer="' + entity_layer + '"]');
        if (kraken_element) {
            kraken_element.style.display = 'block';
        }
    }
    disableKraken() {
        this.kraken_enabled = false;
        let entity_id = 7;
        let entity_layer = wasm.game_getCurrentWorldEntityLayer();
        wasm.game_entityDisableCollision(entity_id);
        var kraken_element = document.querySelector('game-component').shadowRoot.querySelector('[entity_id="' + entity_id + '"][layer="' + entity_layer + '"]');
        if (kraken_element) {
            kraken_element.style.display = 'none';
        }
    }

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
        // TODO: STOP USING MAGIC NUMBERS DAMMIT
        let kraken_entity_id = 7;
        if (message_user) {
            RyansBackendMainHole.ws.send(JSON.stringify({
                "send": {
                    "user": message_user,
                    "payload": {
                        "game_state": {
                            "ships_to_players": this.ships_to_players,
                            "positions": positions,
                            "health": health,
                            "kraken_enabled": this.kraken_enabled,
                            "kraken_position": [wasm.game_entityGetPositionX(kraken_entity_id), wasm.game_entityGetPositionY(kraken_entity_id)],
                            "kraken_health": wasm.game_entityGetHealth(kraken_entity_id),
                            "kraken_image": this.current_kraken_image,
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
                            "kraken_enabled": this.kraken_enabled,
                            "kraken_position": [wasm.game_entityGetPositionX(kraken_entity_id), wasm.game_entityGetPositionY(kraken_entity_id)],
                            "kraken_health": wasm.game_entityGetHealth(kraken_entity_id),
                            "kraken_image": this.current_kraken_image,
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
                var entity_layer = wasm.game_getCurrentWorldEntityLayer();
                let player_element = game_component.shadowRoot.querySelector('[entity_id="' + entity_id + '"][layer="' + entity_layer + '"]');
                if (player_element) {
                    player_element.setBorder(color);
                }
                players_element.innerHTML += '<span style="color:' + color + ';">' + this.ships_to_players[i].username + '</span><br />';
            }
        }
    }

    incrementLeaderboard(attacker_entity_id, attackee_entity_id) {
        // despawn attackee_entity_id
        let user = null;
        for (let p = 0; p < this.ships_to_players.length; ++p) {
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

            this.despawnUser(attackee_entity_id);
        }
    }

    despawnUser(user_entity_id) {
        let user_despawned = false;
        for (let p = 0; p < this.ships_to_players.length; ++p) {
            if (this.ships_to_players[p] !== null && this.ships_to_players[p].wasm_entity_id === user_entity_id) {
                this.ships_to_players[p] = null;
                user_despawned = true;
                break;
            }
        }

        this.updatePlayerList();

        if (user_despawned) {
            this.broadcastGameState();
        }
    }

    toggleLeaderboardDisplay() {
        // TODO: Use new visible attribute
        const leaderboard = this.shadowRoot.getElementById('leaderboard');
        if (leaderboard.classList.contains('hidden')) {
            RyansBackendMainHole.getLeaderboard();
        } else {
            leaderboard.classList.add('hidden');
        }
    }

    toggleOnScreenControls() {
        // TODO: Use new visible attribute
        const onScreenControls = this.shadowRoot.getElementById('on-screen-controls');
        onScreenControls.classList.toggle('hidden');
    }

    togglePlayerList() {
        // TODO: Use the new visible attribute
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
            <x-draggable name="host-controls" id="host-controls" visible="false">
                <div class="main-content">
                    <div class="title">HOST CONTROLS</div>
                    <input type="button" id="toggle_leaderboard" value="Toggle Leaderboard" />
                    <input type="button" id="toggle_player_list" value="Toggle Player List" />
                    <input type="button" id="enable_kraken" value="Enable Kraken" />
                    <input type="button" id="disable_kraken" value="Disable Kraken" />
                    <input type="text" id="kraken_image" value="${this.current_kraken_image}" />
                    <input type="button" id="set_kraken_image" value="Set Kraken Image" />
                    <input type="text" id="kraken_health" value="44" />
                    <input type="button" id="set_kraken_health" value="Set Kraken Health" />
                </div>
            </x-draggable>
        `;
    }
};
customElements.define('multiplayer-host-component', MultiplayerHost);
