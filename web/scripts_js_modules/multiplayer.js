import { RyansBackendSecondaryHole } from './websocket-ryans-backend-secondary-hole.js';
import { globals } from './globals.js';
import { globalStyles } from "./global-styles.js";
import { wasm } from './injector_wasm.js';

export class Multiplayer extends HTMLElement {
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
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "spawn"}));
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
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "despawn"}));
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
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "up"}));
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
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "down"}));
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
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "right"}));
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
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "left"}));
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
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({"cmd": "attack"}));
                }
            },
        ];
    }

    connectedCallback() {
        this.render();
        globals.INPUTS = globals.INPUTS.concat(this.inputs);
        globals.EVENTBUS.addEventListener('viewport-size', (e) => {
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('game-rendered', (e) => {
            this.updatePlayerList();
        });
        globals.EVENTBUS.addEventListener('opened-ryans-backend-secondary-hole', (e) => {
            console.log('a', e);
        });
        globals.EVENTBUS.addEventListener('message-from-ryans-backend-secondary-hole', (e) => {
            console.log('b', e);
            if (e.data.user_spawned) {
                this.ships_to_players = e.data.data;
                this.updatePlayerList();
            } else if (e.data.user_despawned) {
                this.ships_to_players = e.data.data;
                this.updatePlayerList();
            // } else if (e.data.update_health) {
            //     for (var i = 0; i < e.data.update_health; ++i) {
            //         if (e.data.update_health[i] !== null && e.data.update_health[i] !== undefined && e.data.update_health[i] > 0) {
            //             wasm.game_entitySetHealth(this.ships_to_players[i].wasm_entity_id, e.data.update_health[i]);
            //         } else {
            //             // TODO: Probably should make sure this user doesn't exist in this.ships_to_players && despawn if they do
            //         }
            //     }
            } else if (e.data.game_state) {
                console.log(e.data.game_state);
                // TODO: Update ship positions && health && this.ships_to_players with colors
                this.ships_to_players = e.data.game_state.ships_to_players;
                for (var i = 0; i < this.ships_to_players.length; ++i) {
                    if (this.ships_to_players[i] !== null) {
                        var entity_id = this.ships_to_players[i].wasm_entity_id;
                        wasm.game_entitySetHealth(entity_id, e.data.game_state.health[i]);
                        wasm.game_entitySetPositionX(entity_id, e.data.game_state.positions[i][0]);
                        wasm.game_entitySetPositionY(entity_id, e.data.game_state.positions[i][1]);
                    }
                }
            }
            console.log('ships to players', this.ships_to_players);
        });
        // TODO: Connect to RyansBackendSecondaryHole via twitch I guess
        if (window.USER) {
            RyansBackendSecondaryHole.init(window.USER.login, window.USER.username);
        } else {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
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
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'spawn'}));
        });
        this.shadowRoot.getElementById('left').addEventListener('click', () => {
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'left'}));
        });
        this.shadowRoot.getElementById('right').addEventListener('click', () => {
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'right'}));
        });
        this.shadowRoot.getElementById('up').addEventListener('click', () => {
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'up'}));
        });
        this.shadowRoot.getElementById('down').addEventListener('click', () => {
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'down'}));
        });
        this.shadowRoot.getElementById('despawn').addEventListener('click', () => {
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'despawn'}));
        });
        this.shadowRoot.getElementById('attack').addEventListener('click', () => {
            RyansBackendSecondaryHole.ws.send(JSON.stringify({cmd: 'attack'}));
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    // TODO: This is shared with the multiplayer_host too. Maybe create a common component or something
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