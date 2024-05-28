import { wasm } from './injector_wasm.js';
import './webcomponents/entity.js';
import './webcomponents/collision-entity.js';
import './webcomponents/viewport-entity.js';
import { globals, possibleKrakenImages } from './globals.js';
import './webcomponents/draggable.js';
import { globalStyles } from "./global-styles.js";
import { FRAMES } from './frames.js';
import { getRandomKey } from './helpers.js';
import { Inputs } from './inputs.js';
import { Editor } from './editor.js';
import { Debug } from './debug.js';

class ClassGame {
    constructor() {
        if (ClassGame.instance) {
            return Game.instance;
        }
        ClassGame.instance = this;
    }
    init() {
        this.width = 0;
        this.height = 0;
        this.x_padding = 0;
        this.y_padding = 0;

        this.assets = [
            { 
                type: 'image',
                loaded: false,
                path: import.meta.resolve('../images/atlas.png'),
                data: null,
                name: 'atlas',
            },
            {
                type: 'json',
                loaded: false,
                path: import.meta.resolve('../json/image_data.json'),
                data: null,
                name: 'image_data',
            },
            {
                type: 'image',
                loaded: false,
                path: import.meta.resolve('../images/world_0_layer_0_frame_0.png'),
                data: null,
                name: 'world_0_layer_0_frame_0',
            },
            {
                type: 'image',
                loaded: false,
                path: import.meta.resolve('../images/world_0_layer_1_frame_0.png'),
                data: null,
                name: 'world_0_layer_1_frame_0',
            },
            {
                type: 'image',
                loaded: false,
                path: import.meta.resolve('../images/world_0_layer_2_frame_0.png'),
                data: null,
                name: 'world_0_layer_2_frame_0',
            },
        ];
        this.loaded_assets = [];
        // TODO: Put this data in zig instead
        this.static_layers = [
            [
                // World 0
                { layer_id: 0, image_path: 'world_0_layer_0_frame_0', rendered: false, should_render: true, },
                { layer_id: 1, image_path: 'world_0_layer_1_frame_0', rendered: false, should_render: true, },
                { layer_id: 2, image_path: 'world_0_layer_2_frame_0', rendered: false, should_render: true, },
            ]
        ];
        this.loadAssets().then(() => {
            Debug.log({message: 'All assets loaded'}, 'info');
            for (let l = 0; l < this.static_layers.length; ++l) {
                let world_layers = this.static_layers[l];
                for (let wl = 0; wl < world_layers.length; ++wl) {
                    let layer = world_layers[wl];
                    layer.image_path = this.getAssetPath(layer.image_path);
                }
            }
            if (wasm.game_initializeGame()) {
                globals.EVENTBUS.triggerEvent({event_id: 'assets_loaded'});
            } else {
                Debug.log({message: 'Error initializing game'}, 'error');
            }
        });

    }
    loadImage(asset) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = () => {
                asset.loaded = true;
                asset.data = image;
                this.loaded_assets.push(asset.name);
                resolve(asset);
            };
            image.onerror = reject;
            image.src = asset.path;
        });
    }
    loadAssets() {
        let promises = this.assets.map(asset => {
            if (asset.type === 'image') {
                return this.loadImage(asset);
            } else if (asset.type === 'json') {
                return this.loadJsonFile(asset);
            }
        });

        return Promise.all(promises)
            .then(loadedAssets => {
                Debug.log({message: 'Assets loaded', loadedAssets}, 'info');
            })
            .catch(error => {
                Debug.log({message: 'Error loading assets'}, 'error');
            });
    }
    loadJsonFile(asset) {
        return fetch(asset.path)
            .then(response => response.json())
            .then(data => {
                asset.loaded = true;
                asset.data = data;
                this.loaded_assets.push(asset.name);
                return asset;
            });
    }
    getAssetData(asset_name) {
        for (let i = 0; i < this.assets.length; ++i) {
            if (this.assets[i].name === asset_name) {
                return this.assets[i].data;
            }
        }
        return null;
    }
    getAssetPath(asset_name) {
        for (let i = 0; i < this.assets.length; ++i) {
            if (this.assets[i].name === asset_name) {
                return this.assets[i].path;
            }
        }
        return null;
    }
    mainPlayerMoveUp() {
        Debug.log({message: 'mainPlayerMoveUp'}, 'trace');
        wasm.events_moveUp(1, 0);
    }
    mainPlayerMoveDown() {
        wasm.events_moveDown(1, 0);
    }
    mainPlayerMoveLeft() {
        Debug.log({message: 'mainPlayerMoveLeft'}, 'trace');
        wasm.events_moveLeft(1, 0);
    }
    mainPlayerMoveRight() {
        wasm.events_moveRight(1, 0);
    }
    moveCameraUp() {
        wasm.viewport_moveCameraUp();
    }
    moveCameraDown() {
        wasm.viewport_moveCameraDown();
    }
    moveCameraLeft() {
        wasm.viewport_moveCameraLeft();
    }
    moveCameraRight() {
        wasm.viewport_moveCameraRight();
    }
    mainPlayerAttack() {
        wasm.messages_attack(1, 0);
    }
    // Note: This belongs here even though it's a touch odd because creating
    // a static layer is essentially ensuring that there is a DOM element
    // to render a full layer instead of rendering individual elements.
    // This is a game rendering function so it ends up here.
    // It has overlap with editor but editor can also manage its own
    createStaticLayer(layer_id, image_path) {
        let camera_x = wasm.viewport_getCameraX();
        let camera_y = wasm.viewport_getCameraY();
        let static_layer = document.createElement('div');
        static_layer.id = 'static-layer-' + layer_id;
        static_layer.style.position = 'absolute';
        static_layer.style.width = (wasm.viewport_getSizeWidth() * 64) + 'px';
        static_layer.style.height = (wasm.viewport_getSizeHeight() * 64) + 'px';
        static_layer.style.backgroundImage = 'url(' + image_path + ')';
        // static_layer.style.backgroundSize = '100% 100%';
        // static_layer.style.backgroundRepeat = 'no-repeat';
        static_layer.style.backgroundPosition = '-' + (camera_x * 64) + 'px -' + (camera_y * 64) + 'px';
        static_layer.style.left = '0';
        static_layer.style.top = '0';
        static_layer.style.zIndex = layer_id;
        return static_layer;
    }
}
const Game = new ClassGame();
export { Game };
