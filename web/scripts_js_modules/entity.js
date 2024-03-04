import { globals } from "./globals.js";

export class Entity extends HTMLElement {
    constructor() {
        super();
        this.entity_id = null;
        this.attachShadow({mode: 'open'});
    }

    updateSize() {
        this.size = (globals.SIZE * globals.SCALE);
    }
    setLayer(layer) {
        this.layer = layer;
        this.style.zIndex = layer;
    }
    setEntityId(id) {
        this.entity_id = id;
    }
    setViewportXY(x, y) {
        this.setViewportX(x);
        this.setViewportY(y);
    }
    setViewportX(value) {
        this.viewport_x = value;
        this.left = (this.viewport_x * (globals.SIZE * globals.SCALE));
    }
    setViewportY(value) {
        this.viewport_y = value;
        this.top = (this.viewport_y * (globals.SIZE * globals.SCALE));
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    getElementCount() {
        return this.shadowRoot.childElementCount;
    }

    // TODO: Perhaps put this somewhere more global
    getImageCoords(layer, id, frame) {
        if (frame === null || frame === undefined) {
            frame = 0;
        }
        var current_world_index = _GAME.game_getCurrentWorldIndex();
        if (!globals.IMAGE_DATA[current_world_index]) {
            return null;
        }
        if (!globals.IMAGE_DATA[current_world_index][layer]) {
            return null;
        }
        if (!globals.IMAGE_DATA[current_world_index][layer][id]) {
            return null;
        }
        return globals.IMAGE_DATA[current_world_index][layer][id][frame];
        // TODO: Real entities (npcs and characters and other "moving" things should have a default image)
    }

    render() {
        this.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
        var image_frame_coords = this.getImageCoords(this.layer, this.entity_id, 0);
        if (image_frame_coords !== null && image_frame_coords !== undefined) {
            this.style.backgroundPosition = '-' + image_frame_coords[0] + 'px -' + image_frame_coords[1] + 'px';
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
            </style>
        `;
    }
}
customElements.define('entity-component', Entity);
