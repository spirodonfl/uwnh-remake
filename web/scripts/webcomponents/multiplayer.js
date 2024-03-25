// TODO: Ideally, we remove all references to this websocket thing
import { RyansBackendSecondaryHole } from '../websockets/websocket-ryans-backend-secondary-hole.js';
import { globals, possibleKrakenImages } from '../globals.js';
import { globalStyles } from "../global-styles.js";
import { wasm } from '../injector_wasm.js';
import { FRAMES } from '../frames.js';
import { Multiplayer } from '../multiplayer.js';

export class ComponentMultiplayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        Multiplayer.init();
    }

    connectedCallback() {
        this.render();

        globals.EVENTBUS.addEventListener('event', (e) => {
            console.log('multiplayer event', e);
            switch(e.input.event_id) {
                case 'game_rendered':
                    this.updatePlayerList();
                    if (Multiplayer.kraken_enabled === false) {
                        this.disableKraken();
                    } else if (Multiplayer.kraken_enabled === true) {
                        this.enableKraken();
                    }
                    if (Multiplayer.inGame() && Multiplayer.last_move_direction !== null && this.findOwnEntityElement()) {
                        let entity_element = this.findOwnEntityElement();
                        switch (Multiplayer.last_move_direction) {
                            case 'left':
                                entity_element.showRangeLeft();
                                break;
                            case 'right':
                                entity_element.showRangeRight();
                                break;
                            case 'up':
                                entity_element.showRangeUp();
                                break;
                            case 'down':
                                entity_element.showRangeDown();
                                break;
                        }
                    }
                    break;
                case 'move_up':
                    this.sendUp();
                    break;
                case 'move_down':
                    this.sendDown();
                    break;
                case 'move_left':
                    this.sendLeft();
                    break;
                case 'move_right':
                    this.sendRight();
                    break;
                case 'attack':
                    Multiplayer.sendAttack();
                    break;
                case 'spawn':
                    Multiplayer.sendSpawn();
                    break;
                case 'despawn':
                    Multiplayer.sendDespawn();
                    break;
                case 'toggle_leaderboard':
                    this.toggleLeaderboardDisplay();
                    break;
                case 'toggle_on_screen_controls':
                    this.toggleOnScreenControls();
                    break;
                case 'toggle_player_list':
                    this.togglePlayerList();
                    break;
                case 'enable_kraken':
                    this.enableKraken();
                    break;
                case 'disable_kraken':
                    this.disableKraken();
                    break;
                case 'reset':
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({
                        cmd: 'reset',
                    }));
                    break;
                case 'multiplayer_special_role_enable_kraken':
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({
                        cmd: 'enable_kraken',
                    }));
                    break;
                case 'multiplayer_special_role_disable_kraken':
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({
                        cmd: 'disable_kraken',
                    }));
                    break;
                case 'multiplayer_special_role_reset':
                    RyansBackendSecondaryHole.ws.send(JSON.stringify({
                        cmd: 'reset',
                    }));
                    break;
            }
        });
        globals.EVENTBUS.addEventListener('viewport-size', (e) => {
            this.updatePlayerList();
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
                for (let g = 0; g < e.data.game_state.ships_to_players.length; ++g) {
                    if (e.data.game_state.ships_to_players[g] === null && Mutiplayer.ships_to_players[g] !== null) {
                        let entity_id = Multiplayer.ships_to_players[g].wasm_entity_id;
                        wasm.game_entitySetHealth(entity_id, 0);
                    } else if (e.data.game_state.ships_to_players[g] !== null && Multiplayer.ships_to_players[g] === null) {
                        Multiplayer.ships_to_players[g] = e.data.game_state.ships_to_players[g];
                        let entity_id = e.data.game_state.ships_to_players[g].wasm_entity_id;
                        wasm.game_entitySetHealth(entity_id, e.data.game_state.health[g]);
                        wasm.game_entitySetPositionX(entity_id, e.data.game_state.positions[g][0]);
                        wasm.game_entitySetPositionY(entity_id, e.data.game_state.positions[g][1]);
                    } else {
                        Multiplayer.ships_to_players[g] = e.data.game_state.ships_to_players[g];
                        let entity_id = Multiplayer.ships_to_players[g].wasm_entity_id;
                        wasm.game_entitySetHealth(entity_id, e.data.game_state.health[g]);
                        wasm.game_entitySetPositionX(entity_id, e.data.game_state.positions[g][0]);
                        wasm.game_entitySetPositionY(entity_id, e.data.game_state.positions[g][1]);
                    }
                }
                if (Multiplayer.inGame()) {
                    this.showButtons();
                }
                if (e.data.game_state.kraken_enabled !== Multiplayer.kraken_enabled) {
                    Multiplayer.kraken_enabled = e.data.game_state.kraken_enabled;
                    if (e.data.game_state.kraken_enabled) {
                        this.enableKraken();
                    } else {
                        this.disableKraken();
                    }
                    console.log('kraken_enabled', [Multiplayer.kraken_enabled, e.data.game_state.kraken_enabled]);
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
            console.log('ships to players', Multiplayer.ships_to_players);
        });
        if (window.USER) {
            Multiplayer.user = window.USER;
            Multiplayer.user.display_name = Multiplayer.user.display_name.toLowerCase();
            // TODO: Fix this. Keeping this for backwards compatibility everywhere else
            Multiplayer.user.username = Multiplayer.user.display_name;
            RyansBackendSecondaryHole.init(Multiplayer.user.display_name, Multiplayer.user.display_name, window.USER.id);
            globals.MODE = globals.MODES.indexOf('MULTIPLAYER');
            document.querySelector('game-component').shadowRoot.getElementById('mode').innerText = globals.MODES[globals.MODE];
            this.toggleOnScreenControls();
            // mod, vip, sub, broadcaster
            let role = null;
            if (Multiplayer.user.channel_roles.length > 0) {
                let roles = Multiplayer.user.channel_roles;
                for (let r = 0; r < roles.length; ++r) {
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
            Multiplayer.user.role = role;
            this.hideInitialButtons();
        } else {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            // ?login=spirodonfl&username=spirodonfl&role=broadcaster&id=62338636
            Multiplayer.user = {
                username: params.username.toLowerCase(),
                login: params.login,
                role: params.role,
                id: params.id,
            };
            RyansBackendSecondaryHole.init(params.login, params.username, params.id);
            this.hideInitialButtons();
        }
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    showButtons() {
        this.shadowRoot.querySelector('#despawn').classList.remove('hidden');
        this.shadowRoot.querySelector('#attack').classList.remove('hidden');
        this.shadowRoot.querySelector('#up').classList.remove('hidden');
        this.shadowRoot.querySelector('#down').classList.remove('hidden');
        this.shadowRoot.querySelector('#left').classList.remove('hidden');
        this.shadowRoot.querySelector('#right').classList.remove('hidden');
    }
    hideInitialButtons() {
        this.shadowRoot.querySelector('#despawn').classList.add('hidden');
        this.shadowRoot.querySelector('#attack').classList.add('hidden');
        this.shadowRoot.querySelector('#up').classList.add('hidden');
        this.shadowRoot.querySelector('#down').classList.add('hidden');
        this.shadowRoot.querySelector('#left').classList.add('hidden');
        this.shadowRoot.querySelector('#right').classList.add('hidden');
        if (Mutiplayer.user.role !== null) {
            this.shadowRoot.querySelector('#enable_kraken').classList.remove('hidden');
            this.shadowRoot.querySelector('#disable_kraken').classList.remove('hidden');
            this.shadowRoot.querySelector('#reset').classList.remove('hidden');
        }
    }

    // TODO: Consider that this might actually be better suited in the multiplayer.js file
    // even though we're doing DOM querying here
    // If we do that then we should move all the move/direction functions as well as
    // the enable/disable kraken functions
    findOwnEntityElement() {
        let entity_layer_index = wasm.game_getCurrentWorldEntityLayer();
        // TODO: Maybe we put this in a variable in the component
        let entity_element = document
            .querySelector('game-component')
            .shadowRoot
            .querySelector('[entity_id="' + Multiplayer.getOwnEntityId() + '"][layer="' + entity_layer_index + '"]');
        if (entity_element) {
            return entity_element;
        }
        return false;
    }
    sendLeft() {
        Multiplayer.sendLeft();
        if (Multiplayer.inGame() && this.findOwnEntityElement()) {
            this.findOwnEntityElement().showRangeLeft();
        }
    }
    sendRight() {
        Multiplayer.sendRight();
        if (Multiplayer.inGame() && this.findOwnEntityElement()) {
            this.findOwnEntityElement().showRangeRight();
        }
    }
    sendUp() {
        Multiplayer.sendUp();
        if (Multiplayer.inGame() && this.findOwnEntityElement()) {
            this.findOwnEntityElement().showRangeUp();
        }
    }
    sendDown() {
        Multiplayer.sendDown();
        if (Multiplayer.inGame() && this.findOwnEntityElement()) {
            this.findOwnEntityElement().showRangeDown();
        }
    }

    // TODO: Damn it we need a common place for this multiplayer stuff
    enableKraken() {
        Multiplayer.kraken_enabled = true;
        // TODO: Don't rely on magic numbers here!
        let entity_id = 7;
        let entity_layer = wasm.game_getCurrentWorldEntityLayer();
        wasm.game_entityEnableCollision(entity_id);
        let kraken_element = document.querySelector('game-component').shadowRoot.querySelector('[entity_id="' + entity_id + '"][layer="' + entity_layer + '"]');
        if (kraken_element) {
            console.log('show kraken!');
            kraken_element.style.display = 'block';
        }
    }
    disableKraken() {
        Multiplayer.kraken_enabled = false;
        let entity_id = 7;
        let entity_layer = wasm.game_getCurrentWorldEntityLayer();
        wasm.game_entityDisableCollision(entity_id);
        let kraken_element = document.querySelector('game-component').shadowRoot.querySelector('[entity_id="' + entity_id + '"][layer="' + entity_layer + '"]');
        if (kraken_element) {
            console.log('hide kraken!');
            kraken_element.style.display = 'none';
        }
    }

    // Note: This is specific to this webcomponent so keep this function here
    // There is no guarantee the multiplayer host component will look the same anyways
    updatePlayerList() {
        let players_element = this.shadowRoot.getElementById('players');
        players_element.innerHTML = '';
        let game_component = document.querySelector('game-component');
        let entity_components = game_component.shadowRoot.querySelector('entity-component');
        if (entity_components && entity_components.length > 0) {
            for (let e = 0; e < entity_components.length; ++e) {
                entity_components[e].clearBorder();
            }
        }
        for (let i = 0; i < Multiplayer.ships_to_players.length; ++i) {
            if (Multiplayer.ships_to_players[i] !== null) {
                let color = Multiplayer.ships_to_players_colors[i];
                let entity_id = Multiplayer.ships_to_players[i].wasm_entity_id;
                let entity_layer = wasm.game_getCurrentWorldEntityLayer();
                let player_element = game_component.shadowRoot.querySelector('[entity_id="' + entity_id + '"][layer="' + entity_layer + '"]');
                if (player_element) {
                    player_element.setBorder(color);
                }
                players_element.innerHTML += '<span style="color:' + color + ';">' + Multiplayer.ships_to_players[i].username + '</span><br />';
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
                    <input type="button" event-id="spawn" id="spawn" value="Spawn" />
                    <input type="button" event-id="despawn" id="despawn" value="Despawn" />
                    <input type="button" event-id="attack" id="attack" value="Attack" />
                    <input type="button" event-id="move_up" id="up" value="Move Up" />
                    <input type="button" event-id="move_down" id="down" value="Move Down" />
                    <input type="button" event-id="move_left" id="left" value="Move Left" />
                    <input type="button" event-id="move_right" id="right" value="Move Right" />

                    <input type="button" event-id="multiplayer_special_role_enable_kraken" id="enable_kraken" class="hidden" value="Enable Kraken" />
                    <input type="button" event-id="multiplayer_special_role_disable_kraken" id="disable_kraken" class="hidden" value="Disable Kraken" />
                    <input type="button" event-id="multiplayer_special_role_reset" id="reset" class="hidden" value="Reset Game" />
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
customElements.define('multiplayer-component', ComponentMultiplayer);

// TODO: In case you want to have single instances to reference against
// ???????????????????????????????????????????????????????????????????????????????????????
// document.addEventListener('DOMContentLoaded', function() {
//     const myComponentInstance = document.createElement('my-component');
//     document.body.appendChild(myComponentInstance);
//     export { myComponentInstance };
// });
