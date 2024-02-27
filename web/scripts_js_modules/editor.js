import { Draggable } from './draggable.js';

export class Editor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        Draggable(this.shadowRoot.querySelector('#editor'));
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            #editor {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 300px;
                height: auto;
                z-index: 1000;
                background-color: rgba(0, 0, 0, 0.96);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .draggable-header {
                width: 100%;
                height: 2em;
                background-color: rgba(255, 255, 255, 0.15);
            }
            </style>
            <div id="editor">
                <div class="draggable-header"></div>
                <div>EDITOR</div>
            </div>
        `;
    }
}
