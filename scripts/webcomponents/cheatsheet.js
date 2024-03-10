import { globals } from '../globals.js';
import { globalStyles } from '../global-styles.js';
import { Inputs } from '../inputs.js';

export class ComponentCheatSheet extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        this.style.display = 'none';
        globals.EVENTBUS.addEventListener('input', (e) => {
            if (e.input.id === 'toggle-cheatsheet') {
                this.toggleDisplay();
            }
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    toggleDisplay() {
        this.shadowRoot.getElementById('cheatsheet').innerHTML = '';
        for (let m = 0; m < globals.MODES.length; ++m) {
            let mode = globals.MODES[m];
            let mode_header_template = this.shadowRoot
                .getElementById('mode-header')
                .content
                .cloneNode(true);
            mode_header_template.querySelector('span').innerText = mode;
            this.shadowRoot
                .getElementById('cheatsheet')
                .appendChild(mode_header_template);
            for (let i = 0; i < globals.INPUTS.length; ++i) {
                let input = globals.INPUTS[i];
                if (input.context === m) {
                    let mode_input_row_template = this.shadowRoot
                        .getElementById('mode-input-row')
                        .content
                        .cloneNode(true);
                    let divs = mode_input_row_template.querySelectorAll('div');
                    divs[0].innerText = input.description;
                    divs[1].innerText = input.friendlyCode;
                    divs[2].innerText = input.gamepadButton || '';
                    this.shadowRoot
                        .getElementById('cheatsheet')
                        .appendChild(mode_input_row_template);
                }
            }
            if (Inputs[mode] && Inputs[mode].length > 0) {
                for (let i = 0; i < Inputs[mode].length; ++i) {
                    let input = Inputs[mode][i];
                    let mode_input_row_template = this.shadowRoot
                        .getElementById('mode-input-row')
                        .content
                        .cloneNode(true);
                    let divs = mode_input_row_template.querySelectorAll('div');
                    divs[0].innerText = input.description;
                    divs[1].innerText = input.friendlyCode;
                    divs[2].innerText = input.gamepadButton || '';
                    this.shadowRoot
                        .getElementById('cheatsheet')
                        .appendChild(mode_input_row_template);
                }
            } else {
                console.log('unrecognized mode', mode);
            }
        }
        if (this.style.display === 'none') {
            this.style.display = 'block';
        } else {
            this.style.display = 'none';
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            ${globalStyles}
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
            <template id="mode-header">
                <div class="mode">MODE: <span></span></div>
                <div class="mode">&nbsp;</div>
                <div class="mode">&nbsp;</div>
                <div>Action</div><div>Key</div><div>Gamepad</div>
            </template>
            <template id="mode-input-row">
                <div></div><div></div><div></div>
            </template>
        `;
    }
}
customElements.define('cheatsheet-component', ComponentCheatSheet);
