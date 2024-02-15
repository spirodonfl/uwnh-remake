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
];

// x, y, health, on/off
var OCTOPUS = [13, 5, 20, false];
function ENABLE_KRAKEN() {
    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 0);
    OCTOPUS[0] = 13;
    OCTOPUS[1] = 5;
    OCTOPUS[2] = 20;
    OCTOPUS[3] = true;
    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 9);
    _GAME.game_entitySetHealth((9-1), 44);
    OCTOPUS[2] = 44;
    _GAME.diff_addData(0);
    if (GAME_MODE === 0) {
        randomInterval((stop) => {
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
    } else if (GAME_MODE === 1) {
        var have_players = false;
        for (var s_my_d = 0; s_my_d < SHIPS_TO_PLAYER.length; ++s_my_d) {
            if (SHIPS_TO_PLAYER[s_my_d] !== null) {
                have_players = true;
                break;
            }
        }
        if (!have_players) {
            COMMANDS_TO_FUNCTIONS.autoKraken();
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
            if (this.frameCallbacks[i] === null) {
                this.frameCallbacks[i] = [0, frames, callback, clearOnRun];
                return i;
            }
        }
        this.frameCallbacks.push([0, frames, callback, clearOnRun]);
        return this.frameCallbacks.length - 1;
    },
    removeRunOnFrames: function (index) {
        this.frameCallbacks[i] = null;
    },
    runOnFrames: function () {
        for (let i = 0; i < this.frameCallbacks.length; ++i) {
            if (this.frameCallbacks[i] === null) {
                continue;
            }
            ++this.frameCallbacks[i][0];
            if (this.frameCallbacks[i][0] === this.frameCallbacks[i][1]) {
                this.frameCallbacks[i][0] = 0;
                console.log('running frame', this.frameCallbacks[i]);
                this.frameCallbacks[i][2]();
                if (this.frameCallbacks[i][3] === true) {
                    console.log('clearing frame callback');
                    this.frameCallbacks[i] = null;
                }
            }
        }
    },
    sizeView: function ()
    {
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
            var layer = 0;
            // if (DOM.width * DOM.height) !== _GAME.viewport_getLength() // panic
            for (var i = 0; i < (DOM.width * DOM.height); ++i) {
                var viewport_y = Math.floor(i / DOM.width);
                var viewport_x = i % DOM.width;
                if (_GAME.viewport_getData(viewport_x, viewport_y)) {
                    var img = ENUM_IMAGES[2];
                    var el = document.createElement('div');
                    el.classList.add('bg-tile');
                    el.style.backgroundImage = 'url("' + img + '")';
                    el.style.width = (SIZE * SCALE) + 'px';
                    el.style.height = (SIZE * SCALE) + 'px';
                    el.style.position = 'absolute';
                    el.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                    el.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                    el.dataset.x = viewport_x;
                    el.dataset.y = viewport_y;
                    // TODO: Do not depend on border on bg-tile, instead, have another "editor" layer over top of everything and then draw some bg opacity or something
                    // Note: Until you do the above TODO, trying *moving* the player and then clicking. It won't work. Because you have to re-render the whole viewport.
                    if (EDITOR.last_clicked_coordinates && EDITOR.last_clicked_coordinates[0] === viewport_x && EDITOR.last_clicked_coordinates[1] === viewport_y) {
                        el.style.border = '1px solid red';
                    }
                    document.getElementById('view').appendChild(el);

                    var entity_id = _GAME.game_getWorldAtViewport(1, viewport_x, viewport_y);
                    if (entity_id > 0) {
                        var entity_type = _GAME.game_entityGetType((entity_id -1));
                        if (entity_type === 99) {
                            var entity = document.createElement('div');
                            entity.classList.add('health-restore');
                            entity.style.width = (SIZE * SCALE) + 'px';
                            entity.style.height = (SIZE * SCALE) + 'px';
                            entity.style.position = 'absolute';
                            entity.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                            entity.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                            entity.style.zIndex = 1;
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
                            var img = ENUM_IMAGES[6];
                            var entity = document.createElement('div');
                            entity.classList.add('evil-octopus');
                            entity.style.backgroundImage = 'url("' + img + '")';
                            entity.style.backgroundSize = 'cover';
                            entity.style.width = (SIZE * SCALE) + 'px';
                            entity.style.height = (SIZE * SCALE) + 'px';
                            entity.style.position = 'absolute';
                            entity.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                            entity.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                            entity.style.zIndex = 1;
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
                            var img = ENUM_IMAGES[4];
                            // When animation for 7 is done, change this to 4
                            if (entity_id === 2) {
                                img = ENUM_IMAGES[3];
                            }
                            if (entity_id >= 3) {
                                img = ENUM_IMAGES[4];
                            }
                            var entity = document.createElement('div');
                            if (entity_id === 1) {
                                entity.id = 'the_player';
                            } else {
                                entity.classList.add('npc');
                                entity.id = 'npc_' + entity_id;
                            }
                            entity.setAttribute('data-time', then);
                            entity.setAttribute('data-entity-id', entity_id);
                            entity.style.backgroundImage = 'url("' + img + '")';
                            entity.style.backgroundSize = 'cover';
                            entity.style.width = (SIZE * SCALE) + 'px';
                            entity.style.height = (SIZE * SCALE) + 'px';
                            entity.style.position = 'absolute';
                            entity.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                            entity.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                            entity.style.zIndex = 1;
                            entity.dataset.x = viewport_x;
                            entity.dataset.y = viewport_y;
                            var health_element = document.createElement('div');
                            health_element.classList.add('health');
                            // Note: current entity - 1
                            // health_element.innerHTML = _GAME.game_entityGetHealth((entity_id - 1));
                            var health_progress = document.createElement('progress');
                            health_progress.style.width = (SIZE * SCALE) + 'px';
                            health_progress.style.setProperty('--health-color', SHIPS_TO_PLAYER_COLORCODE[(entity_id - 1)]);
                            health_progress.max = 10;
                            health_progress.value = _GAME.game_entityGetHealth((entity_id - 1));
                            health_element.appendChild(health_progress);
                            entity.appendChild(health_element);
                            var name_element = document.createElement('div');
                            name_element.id = 'entity_name_' + entity_id;
                            name_element.classList.add('name');
                            name_element.innerHTML = 'Entity ' + entity_id;
                            // TODO: This is a hack, but it's a good hack for now, to get player names from websocket integration
                            if (typeof SHIPS_TO_PLAYER !== 'undefined') {
                                var player_index = SHIPS_TO_PLAYER[(entity_id - 1)];
                                if (player_index !== -1) {
                                    name_element.innerHTML = player_index;
                                    entity.style.borderTop = '4px solid ' + SHIPS_TO_PLAYER_COLORCODE[(entity_id - 1)];
                                }
                            }
                            entity.appendChild(name_element);
                            document.getElementById('view').appendChild(entity);
                        }
                        __entities__.push([viewport_x, viewport_y]);
                    }

                    var collision = _GAME.game_getWorldAtViewport(2, viewport_x, viewport_y);
                    if (collision === 1) {
                        var collision = document.createElement('div');
                        collision.classList.add('collision');
                        collision.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                        collision.style.width = (SIZE * SCALE) + 'px';
                        collision.style.height = (SIZE * SCALE) + 'px';
                        collision.style.position = 'absolute';
                        collision.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                        collision.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                        collision.style.zIndex = 1;
                        collision.dataset.x = viewport_x;
                        collision.dataset.y = viewport_y;
                        document.getElementById('view').appendChild(collision);
                    }
                }
            }
            DOM.rendered = true;
        }
    }
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

    requestAnimationFrame(tick);
});
window.addEventListener('load', function () {
    var element_view = document.getElementById('view');
    var element_clickable_view = document.getElementById('clickable_view');
    element_clickable_view.addEventListener('click', function (e) {
        let x = Math.floor(e.offsetX / (SIZE * SCALE));
        let y = Math.floor(e.offsetY / (SIZE * SCALE));
        console.log('click', x, y);
        EDITOR.last_clicked_coordinates = [x, y];
        // TODO: if you move the camera around after you clicked, you need to re-click or update coordinates
        var clicked_element = document.querySelector('div.bg-tile[data-x="' + x + '"][data-y="' + y + '"]');
        // console.log(clicked_element);
        if (clicked_element) {
            if (clicked_element.classList.contains('bg-tile')) {
                // console.log('CLICKED A THING', clicked_element);
                var bg_tiles = document.querySelectorAll('.bg-tile');
                for (var i = 0; i < bg_tiles.length; ++i) {
                    if (bg_tiles[i] instanceof HTMLElement) {
                        bg_tiles[i].style.border = 'none';
                    }
                }
                clicked_element.style.border = '1px solid red';
            }
        }
    });
    resizeObserver.observe(document.body);
    LOADER.loaded('window_ready');
});
