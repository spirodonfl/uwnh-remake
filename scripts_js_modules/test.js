export class Test extends HTMLElement {
    constructor() {
        console.log('test constructor');
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        console.log('test connected');
        this.render();
        this.shadowRoot.querySelector('div').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('test'));
        });
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            :host {
                display: block;
                border: 2px solid pink;
            }
            div {
                padding: 10px;
                cursor: pointer;
            }
            </style>
            <div>Test</div>
        `;
    }
}

