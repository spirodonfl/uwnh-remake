export class Entity extends HTMLElement {
    constructor() {
        super();
        this.entity_id = null;
        this.attachShadow({mode: 'open'});
    }

    updateSize() {
        this.size = (GLOBALS.SIZE * GLOBALS.SCALE);
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
        this.left = (this.viewport_x * (GLOBALS.SIZE * GLOBALS.SCALE));
    }
    setViewportY(value) {
        this.viewport_y = value;
        this.top = (this.viewport_y * (GLOBALS.SIZE * GLOBALS.SCALE));
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    // TODO: Perhaps put this somewhere more global
    getImageCoords(layer, id, frame) {
        if (frame === null || frame === undefined) {
            frame = 0;
        }
        if (!GLOBALS.LAYER_ID_TO_IMAGE[layer][id]) {
            return null;
        }
        return GLOBALS.LAYER_ID_TO_IMAGE[layer][id][frame];
    }

    render() {
        this.style.backgroundImage = `url("${GLOBALS.ATLAS_PNG_FILENAME}")`;
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
            <div></div>
        `;
    }
}
