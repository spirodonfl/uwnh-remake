import { Draggable } from './draggable.js';
import { wasm } from './injector_wasm.js';
var _GAME = wasm.instance.exports;

export class Editor extends HTMLElement {
    constructor() {
        super();
        this.current_layer = 0;
        this.current_data_id = 0;
        this.last_atlas_click = {x: 0, y: 0};
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        Draggable(this.shadowRoot.querySelector('#editor'));
        Draggable(this.shadowRoot.querySelector('#atlas'));
        // Listen to game-component for custom event called 'viewport-size'
        var game_component = document.querySelector('game-component');
        game_component.addEventListener('viewport-size', (e) => {
            this.onViewportSize(e);
        });
        this.shadowRoot.getElementById('clickable_view').addEventListener('click', (e) => {
            // TODO: Holy crap this code is weird
            var game_component = document.querySelector('game-component');
            var x = e.clientX - game_component.x_padding;
            var y = e.clientY - game_component.y_padding;
            x = Math.floor(x / (GLOBALS.SIZE * GLOBALS.SCALE));
            y = Math.floor(y / (GLOBALS.SIZE * GLOBALS.SCALE));
            var clicked_view = this.shadowRoot.getElementById('clicked_view');
            clicked_view.style.display = 'block';
            clicked_view.style.width = (GLOBALS.SIZE * GLOBALS.SCALE) + 'px';
            clicked_view.style.height = (GLOBALS.SIZE * GLOBALS.SCALE) + 'px';
            clicked_view.style.left = game_component.x_padding + (x * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
            clicked_view.style.top = game_component.y_padding + (y * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
            var data_id = _GAME.game_getWorldAtViewport(2, x, y);
            this.shadowRoot.getElementById('current_data_id').value = data_id;
            // game_component.dispatchEvent(new CustomEvent('editor-click', {detail: {x: x, y: y}}));
        });
        this.shadowRoot.getElementById('atlas_img').addEventListener('click', (e) => {
            console.log(e);
            // TODO: Get the x and y of the click but WITHIN the image
            var x = e.offsetX;
            var y = e.offsetY;
            console.log('atlas click', x, y);
            x = Math.floor(x / (3008 / 64));
            y = Math.floor(y / (3008 / 64));
            console.log('atlas click', x, y);
            this.last_atlas_click.x = x;
            this.last_atlas_click.y = y;
        });
        this.shadowRoot.getElementById('apply_image_to_layer_id_input').addEventListener('click', (e) => {
            var layer_id = parseInt(this.shadowRoot.getElementById('current_layer_id').value);
            var data_id = parseInt(this.shadowRoot.getElementById('current_data_id').value);
            var x = this.last_atlas_click.x;
            var y = this.last_atlas_click.y;
            GLOBALS.LAYER_ID_TO_IMAGE[layer_id][data_id] = [[x * (GLOBALS.SIZE * GLOBALS.SCALE), y * (GLOBALS.SIZE * GLOBALS.SCALE)]];
            console.log('YEP', {layer: layer_id, data_id: data_id, image: GLOBALS.LAYER_ID_TO_IMAGE[layer_id][data_id]});
            var game_component = document.querySelector('game-component');
            game_component.renderGame();
        });
    }

    onViewportSize(e) {
        var viewport_size = e.detail;
        // TODO: clickable_view should be a separate component
        this.shadowRoot.getElementById('clickable_view').style.width = (viewport_size.width * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
        this.shadowRoot.getElementById('clickable_view').style.height = (viewport_size.height * (GLOBALS.SIZE * GLOBALS.SCALE)) + 'px';
        // TODO: consider updating top && left instead of margin
        this.shadowRoot.getElementById('clickable_view').style.margin = viewport_size.y_padding + 'px ' + viewport_size.x_padding + 'px';
    }

    disconnectedCallback() {}
    adoptedCallback() {}
    attributeChangedCallback() {}

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            #editor, #atlas {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 300px;
                height: 300px;
                z-index: 1000001;
                background-color: rgba(0, 0, 0, 0.96);
                color: white;
            }
            .draggable-header {
                width: 100%;
                height: 2em;
                background-color: rgba(255, 255, 255, 0.15);
            }
            #clickable_view {
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 99999;
            }
            #clicked_view {
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 100000;
                display: none;
                border: 1px solid red;
            }
            </style>
            <div id="clickable_view"></div>
            <div id="clicked_view"></div>
            <div id="editor">
                <div class="draggable-header"></div>
                <div>EDITOR</div>
                <div id="current_asset"><div id="current_asset_img" src=""></div></div>
                <div id="current_layer"><input type="text" id="current_layer_id" value="0" /></div>
                <div id="current_data"><input type="text" id="current_data_id" value="0" /></div>
                <div id="apply_image_to_layer_id"><input type="button" id="apply_image_to_layer_id_input" value="Apply" /></div>
                <div id="current_editor_mode"></div>
            </div>
            <div id="atlas">
                <div class="draggable-header"></div>
                <div style="overflow: scroll; width: 100%; height: 100%;"><img id="atlas_img" src="${GLOBALS.ATLAS_PNG_FILENAME}" /></div>
            </div>
        `;
    }
}
