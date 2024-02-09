const SIZE = 32;
const SCALE = 2;

// TODO: This can be its own file in the future, ideally somehow imported auto-magically
const ENUM_IMAGES = [
    // zig -> ImagesEnum.PlayerImage
    'images/ship-1.gif',
    // zig -> ImagesEnum.NPCImage
    'images/ship-2.gif',
    // zig -> ImagesEnum.OceanBGImage
    'images/ocean-bg-1.gif',
    'images/matisse-ship-1-removebg-preview.png',
    'images/ship-4.png',
    'images/EvilOctopus.png'
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
    _GAME.diff_addData(0);
    randomInterval((stop) => {
        if (_GAME.game_entityGetHealth(OCTOPUS_INDEX) <= 0 || OCTOPUS[3] === true) {
            // TODO: so much hack, get rid of this
            var OCTOPUS_INDEX = 9-1;
            var directions = [0, 1, 2, 3];
            let randomIndex = Math.floor(Math.random() * directions.length);
            let randomDirection = directions[randomIndex];
            if (randomDirection === 0) {
                _GAME.inputs_inputLeft(OCTOPUS_INDEX);
            } else if (randomDirection === 1) {
                _GAME.inputs_inputRight(OCTOPUS_INDEX);
            } else if (randomDirection === 2) {
                _GAME.inputs_inputDown(OCTOPUS_INDEX);
            } else if (randomDirection === 3) {
                _GAME.inputs_inputUp(OCTOPUS_INDEX);
            }
            for (var i = 0; i < 4; ++i) {
                _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                _GAME.game_entityAttack(OCTOPUS_INDEX, i);
            }
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
                            var img = ENUM_IMAGES[5];
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
                            health_element.innerHTML = _GAME.game_entityGetHealth((entity_id - 1));
                            entity.appendChild(health_element);
                            var name_element = document.createElement('div');
                            name_element.id = 'entity_name_' + entity_id;
                            name_element.classList.add('name');
                            name_element.innerHTML = 'KRAKEN';
                            entity.appendChild(name_element);
                            document.getElementById('view').appendChild(entity);
                        } else if (entity_id > 0) {
                            var img = ENUM_IMAGES[0];
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
                            health_element.innerHTML = _GAME.game_entityGetHealth((entity_id - 1));
                            entity.appendChild(health_element);
                            var name_element = document.createElement('div');
                            name_element.id = 'entity_name_' + entity_id;
                            name_element.classList.add('name');
                            name_element.innerHTML = 'Entity ' + entity_id;
                            // TODO: This is a hack, but it's a good hack for now, to get player names from websocket integration
                            if (typeof SHIPS_TO_PLAYER !== 'undefined') {
                                var player_index = SHIPS_TO_PLAYER[(entity_id - 1)];
                                if (player_index !== null) {
                                    name_element.innerHTML = player_index;
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

    _GAME.game_entitySetHealth(0, 8);
    _GAME.game_entitySetHealth(1, 8);
    _GAME.game_entitySetHealth(2, 8);
    _GAME.game_entitySetHealth(3, 8);
    _GAME.game_entitySetHealth(4, 8);
    // TODO: This is a weird way to initialize (6, 7, 8, 9) but you have to remeber we start at 1, not 0
    _GAME.editor_createEntity(99);
    // world #, layer #, x, y, entity_id
    _GAME.game_setWorldData(0, 1, 5, 0, 6);
    _GAME.editor_createEntity(99);
    _GAME.game_setWorldData(0, 1, 12, 5, 7);
    _GAME.editor_createEntity(99);
    _GAME.game_setWorldData(0, 1, 21, 10, 8);
    _GAME.editor_createEntity(98);
    _GAME.game_setWorldData(0, 1, OCTOPUS[0], OCTOPUS[1], 9);

    requestAnimationFrame(tick);

    randomInterval((stop) => {
        _GAME.game_setWorldData(0, 1, 5, 0, 6);
        _GAME.game_setWorldData(0, 1, 12, 5, 7);
        _GAME.game_setWorldData(0, 1, 21, 10, 8);
        // if (stopCondition) {
        //     stop();
        // }
    }, 500000, 600000);
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
