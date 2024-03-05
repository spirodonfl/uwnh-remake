import { RyansBackendSecondaryHole } from './websocket-ryans-backend-secondary-hole.js';
import { globals } from './globals.js';
import { globalStyles } from "./global-styles.js";

export class Multiplayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        // TODO: Fun fact! Unless you inject the element onto the page
        // (which you don't want to do, in this case, until you need it)
        // the inputs don't get registered globally so the cheatsheet
        // doesn't update until the element exists
        this.inputs = [
            {
                description: 'Toggle Leaderboard',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'Digit1',
                friendlyCode: 'Shift+1',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    this.toggleLeaderboardDisplay();
                }
            },
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
                description: 'Spawn',
                context: globals.MODES.indexOf('MULTIPLAYER'),
                code: 'KeyS',
                friendlyCode: 'Shift+S',
                shiftKey: true,
                ctrlKey: false,
                callback: () => {
                    // TODO: this
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
                    // TODO: this
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
                    // TODO: this
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
                    // TODO: this
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
                    // TODO: this
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
                    // TODO: this
                }
            },
        ];
    }

    connectedCallback() {
        this.render();
        globals.INPUTS = globals.INPUTS.concat(this.inputs);
        globals.EVENTBUS.addEventListener('opened-ryans-backend-secondary-hole', (e) => {
            console.log('a', e);
        });
        globals.EVENTBUS.addEventListener('message-from-ryans-backend-secondary-hole', function (a, e) {
            console.log('b', a);
        });
        // TODO: Connect to RyansBackendSecondaryHole via twitch I guess
        RyansBackendSecondaryHole.init('spirodonfl', 'spirodonfl');

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
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    toggleLeaderboardDisplay() {
        // TODO: Ask Ryan to let players get leaderboard data directly
        // RyansBackendSecondaryHole.getLeaderboard();
        const leaderboard = this.shadowRoot.getElementById('leaderboard');
        leaderboard.classList.toggle('hidden');
    }

    toggleOnScreenControls() {
        const onScreenControls = this.shadowRoot.getElementById('on-screen-controls');
        onScreenControls.classList.toggle('hidden');
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
                    <input type="button" id="move_up" value="Move Up" />
                    <input type="button" id="move_down" value="Move Down" />
                    <input type="button" id="move_left" value="Move Left" />
                    <input type="button" id="move_right" value="Move Right" />
                </div>
            </x-draggable
        `;
    }
};
customElements.define('multiplayer-component', Multiplayer);