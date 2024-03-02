import { Entity } from './entity.js';

export class ViewportEntity extends Entity {
    render() {
        var _class = 'data';
        if (this.entity_id !== null && this.entity_id !== 0) {
            _class += ' have-data';
        }
        this.shadowRoot.innerHTML = `
            <style>
            :host {
                width: ${this.size}px;
                height: ${this.size}px;
                position: absolute;
                left: ${this.left}px;
                top: ${this.top}px;
                z-index: ${this.layer};
            }
            .data {
                --ts-size: 3px;
                text-shadow: 0px 0px var(--ts-size) black, 0px 0px var(--ts-size) black, 0px 0px var(--ts-size) black, 0px 0px var(--ts-size) black;
                width: min-content;
                color: white;
            }
            .have-data {
                background-color: rgba(0, 0, 0, 0.3);
                padding: 2px 4px;
            }
            </style>
            <div class="${_class}">${this.entity_id}</div>
        `;
    }
}
