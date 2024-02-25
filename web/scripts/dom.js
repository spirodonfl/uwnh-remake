const SIZE = 32;
const SCALE = 2;

// TODO: This can be its own file in the future, ideally somehow imported auto-magically
const ENUM_IMAGES = [
    // zig -> ImagesEnum.PlayerImage
    'images/ship-1.gif', // 0
    // zig -> ImagesEnum.NPCImage
    'images/ship-2.gif', // 1
    // zig -> ImagesEnum.OceanBGImage
    'images/ocean-bg-1.gif', // 2
    'images/matisse-ship-1-removebg-preview.png', // 3
    'images/ship-4.png', // 4
    'images/EvilOctopus.png', // 5
    'images/ocaml-big.png', // 6
    'images/Ship_Spawn.gif', // 7
    'images/Sea_Tile.gif', // 8
    'images/Ship_Attack.gif', // 9
    'images/Ship_1_64.png', // 10
    'images/Ship_2_64.png', // 11
    'images/Ship_3_64.png', // 12
    'images/Ship_4_64.png', // 13
    'images/Ship_5_64.png', // 14
    'images/Animated_Water_Tiles_8_Frames.png', // 15
    'images/ground-tiles/island tiles1.png', // 16
    'images/Kraken_7_frames.png', // 17
    'images/ground-tiles/island tiles17.png',
];
var ATLAS_PNG_FILENAME = 'images/atlas.png';
var ATLAS_PNG_FILESIZE = [3008, 2304];
var LAYER_ID_TO_IMAGE = {
    data: [],
    /**
     * Returns the total # of frames this particular set has
     * @param {number} layer - the layer you want to try and pull from
     * @param {number} id - the specific ID that you want to grab
     * @returns {number}
     */
    getFrames: function (layer, id) {
        if (!this.data[layer]) {
            return 0;
        }
        if (!this.data[layer][id]) {
            return 0;
        }
        return this.data[layer][id].length;
    },
    /**
     * Returns the actual string value from ENUM_IMAGES given an ID
     * @param {number} layer - the layer you want to try and pull from
     * @param {number} id - the specific ID that you want to grab
     * @returns {(string|null)}
     */
    getImage: function (layer, id) {
        if (this.getImageId(layer, id) !== null) {
            return ENUM_IMAGES[this.getImageId(layer, id)];
        }

        return null;
    },
    /**
     * Returns an image as an ID from ENUM_IMAGES or will return null if nothing exists
     * @param {number} layer - the layer you want to try and pull from
     * @param {number} id - the specific ID that you want to grab
     * @returns {(number|null)}
     */
    getImageId: function (layer, id) {
        if (!this.data[layer]) {
            this.data[layer] = [];
        }
        if (!this.data[layer][id]) {
            this.data[layer][id] = null;
        }
        return this.data[layer][id];
    },
    /**
     * Sets an image as an ID from ENUM_IMAGES
     * @param {number} layer - the layer you want to set
     * @param {number} id - the specific ID that you want to set
     * @param {number} image_id - the ENUM_IMAGES ID you want to set
     */
    setImage: function (layer, id, image_id) {
        if (!this.data[layer]) {
            this.data[layer] = [];
        }
        if (!this.data[layer][id]) {
            this.data[layer][id] = null;
        }
        this.data[layer][id] = image_id;
    },
    setImageCoords: function (layer, id, x, y, frames) {
        if (frames === null || frames === undefined) {
            frames = 1;
        }
        if (!this.data[layer]) {
            this.data[layer] = [];
        }
        if (!this.data[layer][id]) {
            this.data[layer][id] = null;
        }
        // TODO: Careful! This overrides existing values so make sure you add an override function/parameter
        this.data[layer][id] = [];
        var current_x = x;
        var current_y = y;
        for (var frame = 0; frame < frames; ++frame) {
            this.data[layer][id].push([current_x, current_y]);
            current_x += 64;
            if (current_x >= ATLAS_PNG_FILESIZE[0]) {
                current_y += 64;
                current_x = 0;
            }
            if (current_y >= ATLAS_PNG_FILESIZE[1]) {
                console.trace('THIS SHOULD NEVER HAPPEN');
                current_y = 0;
            }
        }
    },
    getImageCoords: function (layer, id, frame) {
        if (frame === null || frame === undefined) {
            frame = 0;
        }
        if (!this.data[layer][id]) {
            return null;
        }
        return this.data[layer][id][frame];
    }
};
// TODO: instead of raw pixel values, use x/y coordinates translated INTO pixel values

// TODO: Actually get these values from WASM, not from here
var BG_TILE = 0;
var ENTITY_LAYER = 2;
var COLLISION_LAYER = 3;

// x, y, health, on/off
var OCTOPUS = [13, 5, 20, false];
function ENABLE_KRAKEN() {
    if (!OCTOPUS[3]) {
        _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 0);
        OCTOPUS[0] = 13;
        OCTOPUS[1] = 5;
        OCTOPUS[2] = 20;
        OCTOPUS[3] = true;
        _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 9);
        _GAME.game_entitySetHealth((9-1), 44);
        OCTOPUS[2] = 44;
        _GAME.diff_addData(0);
        if (TWITCH.GAME_MODE === 0) {
            randomInterval((stop) => {
                // TODO: If the kraken is back on we gotta turn this back on too
                if (TWITCH.GAME_MODE === 1) { stop(); }
                if (_GAME.game_entityGetHealth((9-1)) > 0 || OCTOPUS[3] === true) {
                    COMMANDS_TO_FUNCTIONS.autoKraken();
                } else {
                    var evil_octopus = document.querySelector('.evil-octopus');
                    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 0);
                    OCTOPUS[0] = 0;
                    OCTOPUS[1] = 0;
                    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 9);
                    evil_octopus.style.display = 'none';
                    stop();
                }
                // else stop();
            }, 1000, 2000);
        } else if (TWITCH.GAME_MODE === 1) {
            var have_players = false;
            for (var s_my_d = 0; s_my_d < TWITCH.SHIPS_TO_PLAYER.length; ++s_my_d) {
                if (TWITCH.SHIPS_TO_PLAYER[s_my_d] !== null) {
                    have_players = true;
                    break;
                }
            }
            if (!have_players) {
                COMMANDS_TO_FUNCTIONS.autoKraken();
            }
        }
    }
}
function DISABLE_KRAKEN() {
    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 0);
    OCTOPUS[0] = 13;
    OCTOPUS[1] = 5;
    OCTOPUS[2] = 20;
    OCTOPUS[3] = false;
    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 9);
}


let DOM = {
    width: 0,
    height: 0,
    rendered: false,
    frameCallbacks: [],
    addRunOnFrames: function (frames, callback, clearOnRun) {
        for (var i = 0; i < this.frameCallbacks.length; ++i) {
            if (this.frameCallbacks[i] === false) {
                this.frameCallbacks[i] = [0, frames, callback, clearOnRun];
                return i;
            }
        }
        this.frameCallbacks.push([0, frames, callback, clearOnRun]);
        return this.frameCallbacks.length - 1;
    },
    removeRunOnFrames: function (index) {
        this.frameCallbacks[i] = false;
    },
    runOnFrames: function () {
        for (let i = 0; i < this.frameCallbacks.length; ++i) {
            if (this.frameCallbacks[i] === false) {
                continue;
            }
            ++this.frameCallbacks[i][0];
            if (this.frameCallbacks[i][0] === this.frameCallbacks[i][1]) {
                this.frameCallbacks[i][0] = 0;
                var cb = this.frameCallbacks[i][2];
                if (this.frameCallbacks[i][3] === true) {
                    this.frameCallbacks[i] = false;
                }
                // this.frameCallbacks[i][2]();
                cb();
                // if (this.frameCallbacks[i][3] === true) {
                //     this.frameCallbacks[i] = false;
                // }
            }
        }
    },
    sizeView: function () {
        // Full height, including the scroll part
        const full_height = Math.max(
            // document.body.scrollHeight,
            // document.documentElement.scrollHeight,
            // document.body.offsetHeight,
            // document.documentElement.offsetHeight,
            document.body.clientHeight,
            // document.documentElement.clientHeight
        );
        // Full width, including the scroll part
        const full_width = Math.max(
            // document.body.scrollWidth,
            // document.documentElement.scrollWidth,
            // document.body.offsetWidth,
            // document.documentElement.offsetWidth,
            document.body.clientWidth,
            // document.documentElement.clientWidth
        );

        const root = document.documentElement;
        root.style.setProperty('--scale', SCALE);

        console.log({full_width, full_height});

        let x = Math.floor(full_width / (SIZE * SCALE));
        let y = Math.floor(full_height / (SIZE * SCALE));
        // So we add a bit more space in the view
        if (x > 6)
        {
            --x;
        }
        if (y > 6)
        {
            --y;
        }
        let x_padding = (full_width - (x * (SIZE * SCALE))) / 2;
        let y_padding = (full_height - (y * (SIZE * SCALE))) / 2;
        document.getElementById('view').style.margin = y_padding + 'px ' + x_padding + 'px';
        document.getElementById('view').style.width = (x * (SIZE * SCALE)) + 'px';
        document.getElementById('view').style.height = (y * (SIZE * SCALE)) + 'px';
        document.getElementById('clickable_view').style.width = (x * (SIZE * SCALE)) + 'px';
        document.getElementById('clickable_view').style.height = (y * (SIZE * SCALE)) + 'px';
        DOM.width = x;
        DOM.height = y;
    },
    generateTileDiv: function (viewport_x, viewport_y, data_id) {
        var element = document.createElement('div');
        element.style.width = (SIZE * SCALE) + 'px';
        element.style.height = (SIZE * SCALE) + 'px';
        element.style.position = 'absolute';
        element.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
        element.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
        if (data_id !== null && data_id !== undefined) {
            element.setAttribute('data-id', data_id);
        }

        element.style.zIndex = 1;

        return element;
    },
    addViewportDataToTile: function (element, viewport_x, viewport_y) {
        element.dataset.x = viewport_x;
        element.dataset.y = viewport_y;
    },
    addAnimationToTile: function (element) {
        // element.style.setProperty('--animation-frame', '1');
        // element.style.backgroundPosition = "calc(64px * var(--animation-frame))";
        element.setAttribute('data-animation-frame', '0');
    },
    addLayerToTile: function (element) {
        element.setAttribute('data-layer-id', 0);
    },
    setLayerToTile: function (element, value) {
        element.setAttribute('data-layer-id', value);
    },
    incrementZIndexOfTile: function (element) {
        var current_z_index = parseInt(element.style.zIndex);
        ++current_z_index;
        element.style.zIndex = current_z_index;
    },
    setZIndexToTile: function (element, value) {
        element.style.zIndex = value;
    },
    setBackgroundImageOfTile: function (element) {
        element.style.backgroundImage = 'url("' + ATLAS_PNG_FILENAME + '")';
        var current_layer = element.getAttribute('data-layer-id');
        current_layer = parseInt(current_layer);
        var current_id = element.getAttribute('data-id');
        current_id = parseInt(current_id);
        var image_frame_coords = LAYER_ID_TO_IMAGE.getImageCoords(current_layer, current_id, 0);
        if (image_frame_coords !== null && image_frame_coords !== undefined) {
            element.style.backgroundPosition = '-' + image_frame_coords[0] + 'px -' + image_frame_coords[1] + 'px';
        }
    },
    setAutoAnimateOnTile: function (element) {
        element.setAttribute('data-auto-animate', 1);
        element.setAttribute('data-animation-frame', 0);
    },
    animateTile: function (element) {
        var current_animation_frame = element.getAttribute('data-animation-frame');
        current_animation_frame = parseInt(current_animation_frame);
        var current_layer = element.getAttribute('data-layer-id');
        current_layer = parseInt(current_layer);
        var current_id = element.getAttribute('data-id');
        current_id = parseInt(current_id);
        var intended_animation_frame = current_animation_frame + 1;
        if (LAYER_ID_TO_IMAGE.getFrames(current_layer, current_id) > 0 && intended_animation_frame >= LAYER_ID_TO_IMAGE.getFrames(current_layer, current_id)) {
            intended_animation_frame = 0;
        }
        var image_frame_coords = LAYER_ID_TO_IMAGE.getImageCoords(current_layer, current_id, intended_animation_frame);
        if (image_frame_coords !== null && image_frame_coords !== undefined) {
            element.style.backgroundPosition = '-' + image_frame_coords[0] + 'px -' + image_frame_coords[1] + 'px';
            element.setAttribute('data-animation-frame', intended_animation_frame);
        }
    }
};

// TODO: This is temporary
let __entities__ = [];

const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    // entry.contentRect
    // REDO sizing and grid
    console.log('resize called');
});
let then = performance.now();
const interval = 1000 / 30;
let delta = 0;
function tick() {
    STATS.checkFPS();
    let now = performance.now();
    if (now - then >= interval - delta) {
        delta = Math.min(interval, delta + now - then - interval);
        then = now;

        DOM.runOnFrames();

        if (_GAME.diff_getLength() > 0) {
            DOM.rendered = false;
            __entities__ = [];
            // TODO: Should make this a special number to force a redraw
            if (_GAME.diff_getData(0) === 0) {
                // console.log('CLEARING VIEWPORT');
                var player = false;
                if (player = document.querySelector('#the_player')) {
                    player.remove();
                }
                var npcs = document.querySelectorAll('.npc');
                for (var i = 0; i < npcs.length; ++i) {
                    npcs[i].remove();
                }
                var evil_octopuses = document.querySelectorAll('.evil-octopus');
                for (var i = 0; i < evil_octopuses.length; ++i) {
                    evil_octopuses[i].remove();
                }
                var health_restores = document.querySelectorAll('.health-restore');
                for (var i = 0; i < health_restores.length; ++i) {
                    health_restores[i].remove();
                }
                var collisions = document.querySelectorAll('.collision');
                for (var i = 0; i < collisions.length; ++i) {
                    collisions[i].remove();
                }
                var bg_tiles_removed = 0;
                // NOTE: getElementsByClassName does a LIVE update of DOM elements so when you go to remove them you don't always have access to the elements you grabbed initially
                var bg_tiles = document.querySelectorAll('.bg-tile');
                for (var i = 0; i < bg_tiles.length; ++i) {
                    if (bg_tiles[i] instanceof HTMLElement) {
                        ++bg_tiles_removed;
                        bg_tiles[i].remove();
                    }
                }
            }
            _GAME.diff_clearAll();
        }

        if (!DOM.rendered) {
            // console.log('RENDERING VIEWPORT');
            var y = 0;
            var x = 0;
            var cwi = _GAME.game_getCurrentWorldIndex();
            // if (DOM.width * DOM.height) !== _GAME.viewport_getLength() // panic
            for (var i = 0; i < (DOM.width * DOM.height); ++i) {
                var viewport_y = Math.floor(i / DOM.width);
                var viewport_x = i % DOM.width;
                if (_GAME.viewport_getData(viewport_x, viewport_y)) {
                    // Note: We do this so that, down the road, we can offset the layer in case we need that
                    var layer = 0;
                    var bg_tile_id = _GAME.game_getWorldAtViewport(layer, viewport_x, viewport_y);
                    if (bg_tile_id >= 0) {
                        var el = DOM.generateTileDiv(viewport_x, viewport_y, bg_tile_id);
                        el.classList.add('bg-tile');
                        DOM.setLayerToTile(el, layer);
                        DOM.setAutoAnimateOnTile(el);
                        DOM.addAnimationToTile(el);
                        DOM.setBackgroundImageOfTile(el);
                        DOM.addViewportDataToTile(el, viewport_x, viewport_y);
                        DOM.setZIndexToTile(el, layer);
                        document.getElementById('view').appendChild(el);
                    }
                    ++layer;
                    var bg_tile_id = _GAME.game_getWorldAtViewport(layer, viewport_x, viewport_y);
                    if (bg_tile_id > 0) {
                        var el = DOM.generateTileDiv(viewport_x, viewport_y, bg_tile_id);
                        el.classList.add('bg-tile');
                        DOM.setLayerToTile(el, layer);
                        if (LAYER_ID_TO_IMAGE.getFrames(layer, bg_tile_id) > 0) {
                            DOM.setAutoAnimateOnTile(el);
                            DOM.addAnimationToTile(el);
                        }
                        DOM.setBackgroundImageOfTile(el);
                        DOM.addViewportDataToTile(el, viewport_x, viewport_y);
                        DOM.setZIndexToTile(el, layer);
                        document.getElementById('view').appendChild(el);
                    }

                    ++layer;
                    var entity_id = _GAME.game_getWorldAtViewport(ENTITY_LAYER, viewport_x, viewport_y);
                    if (entity_id > 0) {
                        var entity_type = _GAME.game_entityGetType((entity_id -1));
                        if (entity_type === 99) {
                            var entity = document.createElement('div');
                            DOM.setLayerToTile(entity, ENTITY_LAYER);
                            entity.classList.add('health-restore');
                            entity.style.width = (SIZE * SCALE) + 'px';
                            entity.style.height = (SIZE * SCALE) + 'px';
                            entity.style.position = 'absolute';
                            entity.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                            entity.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                            DOM.setZIndexToTile(entity, ENTITY_LAYER);
                            entity.dataset.x = viewport_x;
                            entity.dataset.y = viewport_y;
                            var health_element = document.createElement('div');
                            health_element.style.width = '100%';
                            health_element.style.height = '100%';
                            health_element.style.color = 'black';
                            health_element.style.textAlign = 'center';
                            health_element.style.fontWeight = 'bold';
                            health_element.style.fontSize = '2em';
                            health_element.innerHTML = 'H';
                            entity.appendChild(health_element);
                            document.getElementById('view').appendChild(entity);
                        } else if (entity_type === 98) {
                            OCTOPUS[0] = _GAME.game_translateViewportXToWorldX(viewport_x);
                            OCTOPUS[1] = _GAME.game_translateViewportYToWorldY(viewport_y);
                            var img = ENUM_IMAGES[17];
                            var entity = document.createElement('div');
                            DOM.setLayerToTile(entity, ENTITY_LAYER);
                            DOM.setZIndexToTile(entity, ENTITY_LAYER);
                            entity.classList.add('evil-octopus');
                            entity.style.backgroundImage = 'url("' + img + '")';
                            entity.style.backgroundSize = 'cover';
                            entity.style.setProperty('--animation-frame', '1');
                            entity.style.backgroundPosition = "calc(64px * var(--animation-frame))";
                            entity.style.width = (SIZE * SCALE) + 'px';
                            entity.style.height = (SIZE * SCALE) + 'px';
                            entity.style.position = 'absolute';
                            entity.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                            entity.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                            if (OCTOPUS[3] === false) {
                                entity.style.display = 'none';
                            }
                            entity.dataset.x = viewport_x;
                            entity.dataset.y = viewport_y;
                            var health_element = document.createElement('div');
                            health_element.classList.add('health');
                            // Note: current entity - 1
                            // health_element.innerHTML = _GAME.game_entityGetHealth((entity_id - 1));
                            // entity.appendChild(health_element);
                            var health_progress = document.createElement('progress');
                            health_progress.style.width = (SIZE * SCALE) + 'px';
                            health_progress.style.setProperty('--health-color', 'purple');
                            health_progress.max = OCTOPUS[2];
                            health_progress.value = _GAME.game_entityGetHealth(9-1);
                            health_element.appendChild(health_progress);
                            entity.appendChild(health_element);
                            var name_element = document.createElement('div');
                            name_element.id = 'entity_name_' + entity_id;
                            name_element.classList.add('name');
                            name_element.innerHTML = 'OCAML';
                            entity.appendChild(name_element);
                            document.getElementById('view').appendChild(entity);
                        } else if (entity_id > 0) {
                            var img = LAYER_ID_TO_IMAGE.getImage(2, entity_id);
                            var entity = document.createElement('div');
                            if (entity_id === 1) {
                                entity.id = 'the_player';
                            } else {
                                entity.classList.add('npc');
                                entity.id = 'npc_' + entity_id;
                            }
                            DOM.setLayerToTile(entity, ENTITY_LAYER);
                            DOM.setZIndexToTile(entity, ENTITY_LAYER);
                            entity.setAttribute('data-time', then);
                            entity.setAttribute('data-entity-id', entity_id);
                            entity.style.backgroundImage = 'url("' + img + '")';
                            entity.style.backgroundSize = 'cover';
                            entity.style.width = (SIZE * SCALE) + 'px';
                            entity.style.height = (SIZE * SCALE) + 'px';
                            entity.style.position = 'absolute';
                            entity.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                            entity.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                            entity.dataset.x = viewport_x;
                            entity.dataset.y = viewport_y;
                            var health_element = document.createElement('div');
                            health_element.classList.add('health');
                            // Note: current entity - 1
                            // health_element.innerHTML = _GAME.game_entityGetHealth((entity_id - 1));
                            var health_progress = document.createElement('progress');
                            health_progress.style.width = (SIZE * SCALE) + 'px';
                            health_progress.style.setProperty('--health-color', TWITCH.SHIPS_TO_PLAYER_COLORCODE[(entity_id - 1)]);
                            health_progress.max = 10;
                            health_progress.value = _GAME.game_entityGetHealth((entity_id - 1));
                            health_element.appendChild(health_progress);
                            entity.appendChild(health_element);
                            var name_element = document.createElement('div');
                            name_element.id = 'entity_name_' + entity_id;
                            name_element.classList.add('name');
                            name_element.innerHTML = 'Entity ' + entity_id;
                            // TODO: This is a hack, but it's a good hack for now, to get player names from websocket integration
                            if (typeof TWITCH.SHIPS_TO_PLAYER !== 'undefined') {
                                var player_index = TWITCH.SHIPS_TO_PLAYER[(entity_id - 1)];
                                if (player_index !== -1) {
                                    name_element.innerHTML = player_index;
                                    entity.style.borderTop = '4px solid ' + TWITCH.SHIPS_TO_PLAYER_COLORCODE[(entity_id - 1)];
                                }
                            }
                            entity.appendChild(name_element);
                            document.getElementById('view').appendChild(entity);
                        }
                        __entities__.push([viewport_x, viewport_y]);
                    }

                    ++layer;
                    if (INPUT.MODES[INPUT.MODE] === 'Editor') {
                        var collision = _GAME.game_getWorldAtViewport(COLLISION_LAYER, viewport_x, viewport_y);
                        if (collision === 1) {
                            var collision = document.createElement('div');
                            DOM.setLayerToTile(collision, COLLISION_LAYER);
                            DOM.setZIndexToTile(collision, COLLISION_LAYER);
                            collision.classList.add('collision');
                            collision.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                            // collision.style.backgroundImage = 'url("' + ENUM_IMAGES[16] + '")';
                            // collision.style.backgroundSize = 'cover';
                            collision.style.width = (SIZE * SCALE) + 'px';
                            collision.style.height = (SIZE * SCALE) + 'px';
                            collision.style.position = 'absolute';
                            collision.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                            collision.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                            collision.dataset.x = viewport_x;
                            collision.dataset.y = viewport_y;
                            document.getElementById('view').appendChild(collision);
                        }
                    }
                }
            }
            DOM.rendered = true;
        }
    }
    EDITOR.showAllTileValues();
    requestAnimationFrame(tick);
}
function randomInterval(callback, min, max) {
    const randomNum = (max, min = 0) => Math.random() * (max - min) + min;

    let targetTime = randomNum(min, max);
    let lastInvoke = performance.now();

    const stop = () => targetTime = null

    const rando_tick = () => {
        if (!targetTime) return;

        if (performance.now() - lastInvoke > targetTime) {
            lastInvoke = performance.now();
            targetTime = randomNum(min, max);
            callback && typeof callback === "function" && callback(stop);
        }

        requestAnimationFrame(rando_tick)
    }

    rando_tick();
}
LOADER.events.addEventListener('loaded', function () {
    DOM.sizeView();
    // TODO: We should aboslutely be checking for the existence of EDITOR here
    if (EDITOR) {
        EDITOR.init();
    }
    EDITOR.addLog('Viewport Width: ' + DOM.width);
    EDITOR.addLog('Viewport Height: ' + DOM.height);
    _GAME.viewport_setSize(DOM.width, DOM.height);
    _GAME.game_initializeGame();
    INPUT.startListening();

    _GAME.game_entitySetHealth(0, 10);
    _GAME.game_entitySetHealth(1, 10);
    _GAME.game_entitySetHealth(2, 10);
    _GAME.game_entitySetHealth(3, 10);
    _GAME.game_entitySetHealth(4, 10);
    // TODO: This is a weird way to initialize (6, 7, 8, 9) but you have to remeber we start at 1, not 0
    _GAME.editor_createEntity(99);
    _GAME.game_entitySetHealth(5, 0);
    // world #, layer #, x, y, entity_id
    _GAME.game_setWorldData(0, 1, 5, 0, 6);
    _GAME.editor_createEntity(99);
    _GAME.game_entitySetHealth(6, 0);
    _GAME.game_setWorldData(0, 1, 12, 5, 7);
    _GAME.editor_createEntity(99);
    _GAME.game_entitySetHealth(7, 0);
    _GAME.game_setWorldData(0, 1, 21, 10, 8);
    _GAME.editor_createEntity(98);
    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 9);

    DOM.addRunOnFrames(10, function () {
        var octopi = document.querySelectorAll('.evil-octopus');
        for (var o = 0; o < octopi.length; ++o) {
            if (octopi[o] instanceof HTMLElement) {
                var animation_frame = octopi[o].style.getPropertyValue('--animation-frame');
                animation_frame = parseInt(animation_frame);
                ++animation_frame;
                if (animation_frame > 7) {
                    animation_frame = 1;
                }
                octopi[o].style.setProperty('--animation-frame', animation_frame);
            }
        }

        var auto_animation_tiles = document.querySelectorAll('div[data-auto-animate="1"]');
        for (var aat = 0; aat < auto_animation_tiles.length; ++aat) {
            if (auto_animation_tiles[aat] instanceof HTMLElement) {
                DOM.animateTile(auto_animation_tiles[aat]);
            }
        }
    }, false);

    requestAnimationFrame(tick);
});


function loadJsonFile(filePath, callback) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', filePath, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var jsonData;
            try {
                jsonData = JSON.parse(xhr.responseText);
            } catch (error) {
                console.error('Error parsing JSON:', error.message);
            }
            callback(jsonData);
        } else {
            console.error('Failed to fetch JSON file (' + xhr.status + ' ' + xhr.statusText + ')');
            callback(null);
        }
    }
    };

    xhr.send();
}
window.addEventListener('load', function () {
    resizeObserver.observe(document.body);
    LOADER.addRequired('atlas');
    LOADER.addRequired('layer_id_to_image_json');
    var atlas = new Image();
    atlas.onload = function () {
        LOADER.loaded('atlas');
    }
    atlas.src = ATLAS_PNG_FILENAME;
    var jsonFilePath = 'json/layer_id_to_image.json';
    loadJsonFile(jsonFilePath, function(data) {
        if (data) {
            LAYER_ID_TO_IMAGE.data = data;
            LOADER.loaded('layer_id_to_image_json');
        }
    });
    LOADER.loaded('window_ready');
});
