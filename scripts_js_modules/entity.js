import { wasm } from './injector_wasm.js';
import { globalStyles } from "./global-styles.js";
import { globals } from "./globals.js";

export class Entity extends HTMLElement {
    constructor() {
        super();
        this.entity_id = null;
        this.health = null;
        this.type = null;
        this.auto_animate = null;
        this.animation_frame = null;
        this.layer = null;
        this.attachShadow({mode: 'open'});
    }

    setBorder(color) {
        this.style.border = `4px solid ${color}`;
    }
    clearBorder() {
        this.style.border = 'none';
    }
    updateHealth() {
        this.getHealth();
        if (this.health !== null) {
            this.shadowRoot.getElementById('health_value').innerHTML = this.health;
        }
    }
    updateSize() {
        this.size = (globals.SIZE * globals.SCALE);
    }
    setLayer(layer) {
        this.layer = layer;
        this.style.zIndex = layer;
        this.setAttribute('layer', layer);
    }
    setEntityId(id) {
        this.entity_id = id;
        this.setAttribute('entity_id', id);
    }
    getHealth() {
        this.health = wasm.game_entityGetHealth(this.entity_id);
    }
    getType() {
        this.type = wasm.game_entityGetType(this.entity_id);
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
    setAnimationProperties() {
        this.auto_animate = 1;
        this.animation_frame = 0;
    }
    updateAnimationFrame() {
        ++this.animation_frame;
        if (this.animation_frame >= this.getImageCoordsFrames(this.layer, this.entity_id)) {
            this.animation_frame = 0;
        }

        let image_frame_coords = this.getImageCoords(this.layer, this.entity_id, this.animation_frame);
        if (image_frame_coords !== null && image_frame_coords !== undefined) {
            let x = image_frame_coords[0];
            let y = image_frame_coords[1];
            this.style.backgroundPosition = '-' + x + 'px -' + y + 'px';
        }
    }

    connectedCallback() {
        this.render();
        this.getType();
        if (this.layer === wasm.game_getCurrentWorldEntityLayer() && this.type > 0) {
            this.getHealth();
            if (this.health !== null) {
                this.shadowRoot.getElementById('health_value').innerHTML = this.health;
            }
        }
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
    getImageCoordsFrames(layer, id) {
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
        return Object.keys(globals.IMAGE_DATA[current_world_index][layer][id]).length;
        // TODO: Real entities (npcs and characters and other "moving" things should have a default image)
    }

    render() {
        this.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
        var image_frame_coords = this.getImageCoords(this.layer, this.entity_id, 0);
        if (image_frame_coords !== null && image_frame_coords !== undefined) {
            this.style.backgroundPosition = '-' + image_frame_coords[0] + 'px -' + image_frame_coords[1] + 'px';
        }
        this.shadowRoot.innerHTML = `
            ${globalStyles}
            <style>
            :host {
                width: ${this.size}px;
                height: ${this.size}px;
                position: absolute;
                left: ${this.left}px;
                top: ${this.top}px;
                z-index: ${this.layer};
            }
            #health_value {
                position: absolute;
                bottom: 0px;
                left: 0px;
            }
            </style>
            <div id="health_value" class="text-shadow"></div>
        `;
    }
}
customElements.define('entity-component', Entity);
