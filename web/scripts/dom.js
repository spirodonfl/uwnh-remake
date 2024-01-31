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
];
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
    requestAnimationFrame(tick);
    STATS.checkFPS();
    let now = performance.now();
    if (now - then >= interval - delta) {
        delta = Math.min(interval, delta + now - then - interval);
        then = now;

        if (_GAME.diff_getLength() > 0) {
            // TODO: Should make this a special number to force a redraw
            if (_GAME.diff_getData(0) === 0) {
                console.log('CLEARING VIEWPORT');
                DOM.rendered = false;
                var player = false;
                if (player = document.getElementById('the_player')) {
                    player.remove();
                }
                var collisions = document.getElementsByClassName('collision');
                for (var i = 0; i < collisions.length; ++i) {
                    collisions[i].remove();
                }
            }
            _GAME.diff_clearAll();
        }

        if (!DOM.rendered) {
            console.log('RENDERING VIEWPORT');
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

                    var entity = _GAME.game_getWorldAtViewport(1, viewport_x, viewport_y);
                    if (entity === 1) {
                        var img = ENUM_IMAGES[0];
                        var entity = document.createElement('div');
                        entity.id = 'the_player';
                        entity.setAttribute('data-time', then);
                        entity.setAttribute('data-entity-id', 1);
                        entity.style.backgroundImage = 'url("' + img + '")';
                        entity.style.width = (SIZE * SCALE) + 'px';
                        entity.style.height = (SIZE * SCALE) + 'px';
                        entity.style.position = 'absolute';
                        entity.style.left = (viewport_x * (SIZE * SCALE)) + 'px';
                        entity.style.top = (viewport_y * (SIZE * SCALE)) + 'px';
                        entity.style.zIndex = 1;
                        entity.dataset.x = viewport_x;
                        entity.dataset.y = viewport_y;
                        document.getElementById('view').appendChild(entity);
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
}
LOADER.events.addEventListener('loaded', function () {
    DOM.sizeView();
    EDITOR.addLog('Viewport Width: ' + DOM.width);
    EDITOR.addLog('Viewport Height: ' + DOM.height);
    _GAME.viewport_setSize(DOM.width, DOM.height);
    _GAME.game_initializeGame();
    INPUT.startListening();
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
        console.log(clicked_element);
        if (clicked_element) {
            if (clicked_element.classList.contains('bg-tile')) {
                console.log('CLICKED A THING', clicked_element);
                var bg_tiles = document.getElementsByClassName('bg-tile');
                for (var i = 0; i < bg_tiles.length; ++i) {
                    bg_tiles[i].style.border = 'none';
                }
                clicked_element.style.border = '1px solid red';
            }
        }
    });
    resizeObserver.observe(document.body);
    LOADER.loaded('window_ready');
});
