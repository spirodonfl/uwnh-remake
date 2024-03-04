import { globals } from "./globals.js";

export class CheatSheet extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        this.inputs = [
            {
                description: 'Toggle the cheatsheet',
                context: globals.MODES.indexOf('ALL'),
                code: 'KeyH',
                friendlyCode: 'H',
                shiftKey: false,
                ctrlKey: false,
                callback: () => {
                    this.toggleDisplay();
                }
            }
        ];
    }

    connectedCallback() {
        this.render();
        globals.INPUTS = globals.INPUTS.concat(this.inputs);
        // TODO: A better way to not repeat our input functionality here
        document.addEventListener('keydown', (e) => {
            for (var i = 0; i < this.inputs.length; ++i) {
                let input = this.inputs[i];
                if (e.code === input.code && e.shiftKey === input.shiftKey && e.ctrlKey === input.ctrlKey) {
                    if (input.context === globals.MODES.indexOf('ALL')) {
                        input.callback();
                    }
                }
            }
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    toggleDisplay() {
        this.shadowRoot.getElementById('cheatsheet').innerHTML = '';
        for (var m = 0; m < globals.MODES.length; ++m) {
            let mode = globals.MODES[m];
            this.shadowRoot.getElementById('cheatsheet').innerHTML += `
                <div class="mode">MODE: ${mode}</div><div class="mode">&nbsp;</div><div class="mode">&nbsp;</div>
                <div>Action</div><div>Key</div><div>Gamepad</div>
            `;
            for (var i = 0; i < globals.INPUTS.length; ++i) {
                let input = globals.INPUTS[i];
                if (input.context === m) {
                    this.shadowRoot.getElementById('cheatsheet').innerHTML += `
                        <div>${input.description}</div><div>${input.friendlyCode}</div><div></div>
                    `;
                }
            }
        }
        this.style.display = (this.style.display === 'none') ? 'block' : 'none';
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            :host {
                position: absolute;
                padding: 2em;
                width: calc(100% - calc(2em * 2));
                height: calc(100% - calc(2em * 2));
                top: 0px;
                left: 0px;
                z-index: 9999999;
                background-color: rgba(0, 0, 0, 0.96);
                color: white;
                display: none;
            }
            .title {
                text-align: center;
            }
            #cheatsheet {
                margin-left: auto;
                margin-right: auto;
                margin-top: 2em;
                margin-bottom: 0px;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-gap: 1em 0em;
                max-width: 1280px;
                overflow-y: scroll;
                height: inherit;
            }
            #cheatsheet div {
                background-color: rgba(255, 255, 255, 0.15);
                padding: 0.5em;
            }
            #cheatsheet div.mode {
                margin-top: 1em;
                background-color: rgba(255, 255, 255, 0.2);
            }
            </style>
            <div class="title">CHEATSHEET</div>
            <div id="cheatsheet"></div>
        `;
    }
}
customElements.define('cheatsheet-component', CheatSheet);
