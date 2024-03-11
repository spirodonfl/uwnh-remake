import { RyansBackendSecondaryHole } from './websocket-ryans-backend-secondary-hole.js';
import { globals, possibleKrakenImages } from './globals.js';
import { globalStyles } from "./global-styles.js";
import { wasm } from './injector_wasm.js';
import { FRAMES } from './frames.js';

export class Multiplayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        // TODO: Share in a common module/webcomponent
        this.ships_to_players = [null, null, null, null, null];
        this.ships_to_players_colors = ['#e28383', '#9e9ef9', '#79df79', 'yellow', '#df70df'];
        this.kraken_enabled = false;
        this.kraken_image = null;
        this.user = null;
        this.last_move_direction = null;

        // TODO: Fun fact! Unless you inject the element onto the page
        // (which you don't want to do, in this case, until you need it)
        // the inputs don't get registered globally so the cheatsheet
        // doesn't update until the element exists
        this.inputs = [
            // {
            //     description: 'Toggle Leaderboard',
            //     context: globals.MODES.indexOf('MULTIPLAYER'),
            //     code: 'Digit1',
            //     friendlyCode: 'Shift+1',
            //     shiftKey: true,
            //     ctrlKey: false,
            //     callback: () => {
            //         this.toggleLeaderboardDisplay();
            //     }
            // },
            // TODO: Need to also map to Numpad2,3 etc...
            {
                description: 'Toggle On-Screen Controls',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'Digit2',
                friendlyCode: 'Shift+2',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.toggleOnScreenControls();
                }
            },
            {
                description: 'Toggle Player List',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'Digit3',
                friendlyCode: 'Shift+3',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.togglePlayerList();
                }
            },
            {
                description: 'Spawn',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'KeyS',
                friendlyCode: 'Shift+S',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.sendSpawn();
                }
            },
            {
                description: 'Despawn',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'KeyD',
                friendlyCode: 'Shift+D',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.sendDespawn();
                }
            },
            {
                description: 'Move Up',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'KeyI',
                friendlyCode: 'I',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.sendUp();
                }
            },
            {
                description: 'Move Down',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'KeyK',
                friendlyCode: 'K',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.sendDown();
                }
            },
            {
                description: 'Move Right',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'KeyL',
                friendlyCode: 'L',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.sendRight();
                }
            },
            {
                description: 'Move Left',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'KeyJ',
                friendlyCode: 'J',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.sendLeft();
                }
            },
            {
                description: 'Attack',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'Space',
                friendlyCode: 'Space',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.sendAttack();
                }
            },
            {
                description: 'Move camera up',
                context: globals.MODES.indexOf('MULTIPLAYER'),
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
                context: globals.MODES.indexOf('MULTIPLAYER'),
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
                context: globals.MODES.indexOf('MULTIPLAYER'),
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
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'ArrowRight',
                friendlyCode: '→',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    document.querySelector('game-component').moveCameraRight();
                }
            },
        ];
        globals.INPUTS = globals.INPUTS.concat(this.inputs);
    }

    connectedCallback() {
        this.render();
        globals.EVENTBUS.addEventListener('viewport-size', (e) => {
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('game-rendered', (e) => {
            this.updatePlayerList();
            if (this.kraken_enabled === false) {
                this.disableKraken();
            } else if (this.kraken_enabled === true) {
                this.enableKraken();
            }
            if (this.inGame() && this.last_move_direction !== null && this.findOwnEntityElement()) {
                if (this.last_move_direction === 'left') {
                    this.findOwnEntityElement().showRangeLeft();
                } else if (this.last_move_direction === 'right') {
                    this.findOwnEntityElement().showRangeRight();
                } else if (this.last_move_direction === 'up') {
                    this.findOwnEntityElement().showRangeUp();
                } else if (this.last_move_direction === 'down') {
                    this.findOwnEntityElement().showRangeDown();
                }
            }
        });
        globals.EVENTBUS.addEventListener('opened-ryans-backend-secondary-hole', (e) => {
            console.log('a', e);
        });
        globals.EVENTBUS.addEventListener('message-from-ryans-backend-secondary-hole', (e) => {
            console.log('b', e);
            if (e.data.user_spawned) {
                // TODO: Clear these out
                // this.ships_to_players = e.data.data;
                // this.updatePlayerList();
            } else if (e.data.user_despawned) {
                // TODO: Clear these out
                // this.ships_to_players = e.data.data;
                // this.updatePlayerList();
            } else if (e.data.game_state) {
                console.log('GAME STATE:', e.data.game_state);
                // TODO: This is terribly hacky
                for (var g = 0; g < e.data.game_state.ships_to_players.length; ++g) {
                    if (e.data.game_state.ships_to_players[g] === null && this.ships_to_players[g] !== null) {
                        var entity_id = this.ships_to_players[g].wasm_entity_id;
                        wasm.game_entitySetHealth(entity_id, 0);
                        // TODO: Update position maybe?
                    } else if (e.data.game_state.ships_to_players[g] !== null && this.ships_to_players[g] === null) {
                        var entity_id = e.data.game_state.ships_to_players[g].wasm_entity_id;
                        wasm.game_entitySetHealth(entity_id, e.data.game_state.health[g]);
                        wasm.game_entitySetPositionX(entity_id, e.data.game_state.positions[g][0]);
                        wasm.game_entitySetPositionY(entity_id, e.data.game_state.positions[g][1]);
                    }
                }
                this.ships_to_players = e.data.game_state.ships_to_players;
                for (var i = 0; i < this.ships_to_players.length; ++i) {
                    if (this.ships_to_players[i] !== null) {
                        var entity_id = this.ships_to_players[i].wasm_entity_id;
                        wasm.game_entitySetHealth(entity_id, e.data.game_state.health[i]);
                        wasm.game_entitySetPositionX(entity_id, e.data.game_state.positions[i][0]);
                        wasm.game_entitySetPositionY(entity_id, e.data.game_state.positions[i][1]);
                    }
                }
                if (this.inGame()) {
                    this.shadowRoot.querySelector('#despawn').classList.remove('hidden');
                    this.shadowRoot.querySelector('#attack').classList.remove('hidden');
                    this.shadowRoot.querySelector('#up').classList.remove('hidden');
                    this.shadowRoot.querySelector('#down').classList.remove('hidden');
                    this.shadowRoot.querySelector('#left').classList.remove('hidden');
                    this.shadowRoot.querySelector('#right').classList.remove('hidden');
                }
                if (e.data.game_state.kraken_enabled !== this.kraken_enabled) {
                    this.kraken_enabled = e.data.game_state.kraken_enabled;
                    if (e.data.game_state.kraken_enabled) {
                        this.enableKraken();
                    } else {
                        this.disableKraken();
                    }
                    console.log('kraken_enabled', [this.kraken_enabled, e.data.game_state.kraken_enabled]);
                }
                // TODO: STOP USING MAGIC NUMBERS DAMMIT
                let kraken_entity_id = 7;
                let entity_layer = wasm.game_getCurrentWorldEntityLayer();
                wasm.game_entitySetPositionX(kraken_entity_id, e.data.game_state.kraken_position[0]);
                wasm.game_entitySetPositionY(kraken_entity_id, e.data.game_state.kraken_position[1]);
                wasm.game_entitySetHealth(kraken_entity_id, e.data.game_state.kraken_health);
                let image_data = globals.IMAGE_DATA[0][entity_layer][kraken_entity_id];
                if (image_data) {
                    image_data[0][0] = possibleKrakenImages[e.data.game_state.kraken_image].x * 64;
                    image_data[0][1] = possibleKrakenImages[e.data.game_state.kraken_image].y * 64;
                }
            }
            console.log('ships to players', this.ships_to_players);
        });
        // TODO: Potentially add client side twitch auth here
        if (window.USER) {
            this.user = window.USER;
            this.user.display_name = this.user.display_name.toLowerCase();
            // TODO: Fix this. Keeping this for backwards compatibility everywhere else
            this.user.username = this.user.display_name;
            RyansBackendSecondaryHole.init(this.user.display_name, this.user.display_name, window.USER.id);
            globals.MODE = globals.MODES.indexOf('MULTIPLAYER');
            document.querySelector('game-component').shadowRoot.getElementById('mode').innerText = globals.MODES[globals.MODE];
            this.toggleOnScreenControls();
            // mod, vip, sub, broadcaster
            let role = null;
            if (this.user.channel_roles.length > 0) {
                let roles = this.user.channel_roles;
                for (var r = 0; r < roles.length; ++r) {
                    if (roles[r].role === 'broadcaster') {
                        role = 'broadcaster';
                        break;
                    } else if (roles[r].role === 'mod') {
                        role = 'mod';
                        break;
                    } else if (roles[r].role === 'vip') {
                        role = 'vip';
                        break;
                    }
                }
            }
            this.shadowRoot.querySelector('#despawn').classList.add('hidden');
            this.shadowRoot.querySelector('#attack').classList.add('hidden');
            this.shadowRoot.querySelector('#up').classList.add('hidden');
            this.shadowRoot.querySelector('#down').classList.add('hidden');
            this.shadowRoot.querySelector('#left').classList.add('hidden');
            this.shadowRoot.querySelector('#right').classList.add('hidden');
            if (role !== null) {
                this.shadowRoot.querySelector('#enable_kraken').classList.remove('hidden');
                this.shadowRoot.querySelector('#enable_kraken').addEventListener('click', () => {
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({
                        cmd: 'enable_kraken',
                    }));
                });
                this.shadowRoot.querySelector('#disable_kraken').classList.remove('hidden');
                this.shadowRoot.querySelector('#disable_kraken').addEventListener('click', () => {
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({
                        cmd: 'disable_kraken',
                    }));
                });
                this.shadowRoot.querySelector('#reset').classList.remove('hidden');
                this.shadowRoot.querySelector('#reset').addEventListener('click', () => {
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({
                        cmd: 'reset',
                    }));
                });
            }
        } else {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            this.user = {
                username: params.username.toLowerCase(),
                login: params.login,
                role: null
            };
            RyansBackendSecondaryHole.init(params.login, params.username);
        }

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

        this.shadowRoot.getElementById('spawn').addEventListener('click', () => {
            this.sendSpawn()
        });
        this.shadowRoot.getElementById('left').addEventListener('click', () => {
            this.sendLeft();
        });
        this.shadowRoot.getElementById('right').addEventListener('click', () => {
            this.sendRight();
        });
        this.shadowRoot.getElementById('up').addEventListener('click', () => {
            this.sendUp();
        });
        this.shadowRoot.getElementById('down').addEventListener('click', () => {
            this.sendDown();
        });
        this.shadowRoot.getElementById('despawn').addEventListener('click', () => {
            this.sendDespawn();
        });
        this.shadowRoot.getElementById('attack').addEventListener('click', () => {
            this.sendAttack();
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

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
    findOwnEntityElement() {
        let entity_layer_index = wasm.game_getCurrentWorldEntityLayer();
        let entity_element = document.querySelector('game-component').shadowRoot.querySelector('[entity_id="' + this.getOwnEntityId() + '"][layer="' + entity_layer_index + '"]');
        if (entity_element) {
            return entity_element;
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
            if (this.findOwnEntityElement()) {
                this.findOwnEntityElement().showRangeLeft();
            }
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'left'}));
        }
    }
    sendRight() {
        if (this.inGame()) {
            this.last_move_direction = 'right';
            if (this.findOwnEntityElement()) {
                this.findOwnEntityElement().showRangeRight();
            }
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'right'}));
        }
    }
    sendUp() {
        if (this.inGame()) {
            this.last_move_direction = 'up';
            if (this.findOwnEntityElement()) {
                this.findOwnEntityElement().showRangeUp();
            }
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'up'}));
        }
    }
    sendDown() {
        if (this.inGame()) {
            this.last_move_direction = 'down';
            if (this.findOwnEntityElement()) {
                this.findOwnEntityElement().showRangeDown();
            }
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'down'}));
        }
    }

    // TODO: Damn it we need a common place for this multiplayer stuff
    enableKraken() {
        this.kraken_enabled = true;
        // TODO: Don't rely on magic numbers here!
        let entity_id = 7;
        let entity_layer = wasm.game_getCurrentWorldEntityLayer();
        wasm.game_entityEnableCollision(entity_id);
        var kraken_element = document.querySelector('game-component').shadowRoot.querySelector('[entity_id="' + entity_id + '"][layer="' + entity_layer + '"]');
        if (kraken_element) {
            console.log('show kraken!');
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
            console.log('hide kraken!');
            kraken_element.style.display = 'none';
        }
    }

    // TODO: This is shared with the multiplayer_host too. Maybe create a common component or something
    updatePlayerList() {
        let players_element = this.shadowRoot.getElementById('players');
        players_element.innerHTML = '';
        let game_component = document.querySelector('game-component');
        let entity_components = game_component.shadowRoot.querySelector('entity-component');
        if (entity_components && entity_components.length > 0) {
            for (var e = 0; e < entity_components.length; ++e) {
                entity_components[e].clearBorder();
            }
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

    toggleLeaderboardDisplay() {
        // TODO: Ask Ryan to let players get leaderboard data directly
        // RyansBackendSecondaryHole.getLeaderboard();
        // RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "spawn"}));
        const leaderboard = this.shadowRoot.getElementById('leaderboard');
        leaderboard.classList.toggle('hidden');
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
                    <input type="button" id="spawn" value="Spawn" />
                    <input type="button" id="despawn" value="Despawn" />
                    <input type="button" id="attack" value="Attack" />
                    <input type="button" id="up" value="Move Up" />
                    <input type="button" id="down" value="Move Down" />
                    <input type="button" id="left" value="Move Left" />
                    <input type="button" id="right" value="Move Right" />

                    <input type="button" id="enable_kraken" class="hidden" value="Enable Kraken" />
                    <input type="button" id="disable_kraken" class="hidden" value="Disable Kraken" />
                    <input type="button" id="reset" class="hidden" value="Reset Game" />
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
customElements.define('multiplayer-component', Multiplayer);
