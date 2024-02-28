import { Entity } from './entity.js';

export class CollisionEntity extends Entity {
    render() {
        this.shadowRoot.innerHTML = `
            <style>
            :host {
                width: ${this.size}px;
                height: ${this.size}px;
                position: absolute;
                left: ${this.left}px;
                top: ${this.top}px;
                z-index: ${this.layer};
                background-color: rgba(0, 0, 0, 0.4);
            }
            </style>
            <div></div>
        `;
    }
}
