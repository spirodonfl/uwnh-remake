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
                z-index: 9999;
                background-color: rgba(0, 0, 0, 0.96);
                color: white;
                display: none;
            }
            .title {
                text-align: center;
            }
            #cheatsheet div {
                background-color: rgba(255, 255, 255, 0.15);
                padding: 0.5em;
            }
            </style>
            <div class="title">CHEATSHEET</div>
            <div id="cheatsheet" style="margin-left: auto; margin-right: auto; margin-top: 2em; margin-bottom: 0px; display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 1em 0em; max-width: 1280px;">
                <div>Action</div><div>Key</div><div>Gamepad</div>
                <div>Toggle this cheatsheet</div><div>H</div><div></div>
            </div>
        `;
    }
}
