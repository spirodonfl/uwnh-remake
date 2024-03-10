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
        // TODO: Should move this to its own function and its really only for multiplayer anyways
        this.style.backgroundColor = `${color}50`;
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

    hideRanges() {
        this.shadowRoot.querySelectorAll('.range').forEach(range => {
            range.classList.add('hidden');
        });
    }
    showRangeLeft() {
        this.hideRanges();
        this.shadowRoot.getElementById('range_left').classList.remove('hidden');
        this.shadowRoot.getElementById('range_left_2').classList.remove('hidden');
    }
    showRangeRight() {
        this.hideRanges();
        this.shadowRoot.getElementById('range_right').classList.remove('hidden');
        this.shadowRoot.getElementById('range_right_2').classList.remove('hidden');
    }
    showRangeUp() {
        this.hideRanges();
        this.shadowRoot.getElementById('range_up').classList.remove('hidden');
        this.shadowRoot.getElementById('range_up_2').classList.remove('hidden');
    }
    showRangeDown() {
        this.hideRanges();
        this.shadowRoot.getElementById('range_down').classList.remove('hidden');
        this.shadowRoot.getElementById('range_down_2').classList.remove('hidden');
    }

    render() {
        var image_frame_coords = this.getImageCoords(this.layer, this.entity_id, 0);
        if (image_frame_coords !== null && image_frame_coords !== undefined) {
            this.style.backgroundImage = `url("${globals.ATLAS_PNG_FILENAME}")`;
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
            .range {
                border: 2px solid red;
                width: 64px;
                height: 64px;
                position: absolute;
            }
            </style>
            <div id="health_value" class="text-shadow"></div>

            <div id="range_left" class="range hidden" style="left: -64px;"></div>
            <div id="range_left_2" class="range hidden" style="left: -128px;"></div>

            <div id="range_right" class="range hidden" style="right: -64px;"></div>
            <div id="range_right_2" class="range hidden" style="right: -128px;"></div>

            <div id="range_up" class="range hidden" style="top: -64px;"></div>
            <div id="range_up_2" class="range hidden" style="top: -128px;"></div>

            <div id="range_down" class="range hidden" style="bottom: -64px;"></div>
            <div id="range_down_2" class="range hidden" style="bottom: -128px;"></div>
        `;
    }
}
customElements.define('entity-component', Entity);
