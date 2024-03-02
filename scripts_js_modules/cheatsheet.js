export class CheatSheet extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h') {
                this.style.display = this.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

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
            <div id="cheatsheet">
                <div class="mode">MODE: ALL</div><div class="mode">&nbsp;</div><div class="mode">&nbsp;</div>
                <div>Action</div><div>Key</div><div>Gamepad</div>
                <div>Toggle this cheatsheet</div><div>H</div><div></div>
                <div>Show Credits & Attributions</div><div></div><div></div>
                <div>Switch modes</div><div>S</div><div></div>

                <div class="mode">MODE: EDITOR</div><div class="mode">&nbsp;</div><div class="mode">&nbsp;</div>
                <div>Action</div><div>Key</div><div>Gamepad</div>
                <div>Toggle main menu</div><div>P</div><div></div>
                <div>Toggle atlas</div><div>A</div><div></div>
                <div>Iterate through available layers</div><div>L</div><div></div>
                <div>Add collision block</div><div></div><div></div>
                <div>Remove collision block</div><div></div><div></div>
                <div>Show layer data</div><div></div><div></div>
                <div>Hide layer data</div><div></div><div></div>
                <div>Apply atlas image to layer data</div><div></div><div></div>
                <div>"Disapply" atlas image from layer data</div><div></div><div></div>
                <div>Create world</div><div></div><div></div>
                <div>Delete world (note: this requires downloading all worlds again and re-compiling)</div><div></div><div></div>
                <div>Create layer</div><div></div><div></div>
                <div>Detach layer from world (note: this requires downloading all world layers again and re-compiling)</div><div></div><div></div>
                <div>Attach layer to world</div><div></div><div></div>
                <div>Extract data from world layer location</div><div></div><div></div>
                <div>Apply data to world layer location (popup)</div><div></div><div></div>
                <div>Zero out data from world layer location</div><div></div><div></div>
                <div>Load world (popup)</div><div></div><div></div>
                <div>Copy/paste data mode (first click to copy second to paste)</div><div></div><div></div>
                <div>Copy/paste atlas mode (first click to copy second to paste)</div><div></div><div></div>
                <div>Open/close atlas</div><div></div><div></div>
                <div>Open/close entity system</div><div></div><div></div>
                <div>Edit selected entity</div><div></div><div></div>
                <div></div><div></div><div></div>

                <div class="mode">MODE: GAME</div><div class="mode">&nbsp;</div><div class="mode">&nbsp;</div>
                <div>Move Up</div><div></div><div></div>
                <div>Move Down</div><div></div><div></div>
                <div>Move Left</div><div></div><div></div>
                <div>Move Right</div><div></div><div></div>
                <div>Attack</div><div></div><div></div>

                <div class="mode">MODE: MULTIPLAYER / TWITCH</div><div class="mode">&nbsp;</div><div class="mode">&nbsp;</div>
                <div>Spawn</div><div></div><div></div>
                <div>Move Up</div><div></div><div></div>
                <div>Move Down</div><div></div><div></div>
                <div>Move Left</div><div></div><div></div>
                <div>Move Right</div><div></div><div></div>
                <div>Attack</div><div></div><div></div>
                <div>Despawn</div><div></div><div></div>
                <div></div><div></div><div></div>
            </div>
        `;
    }
}
