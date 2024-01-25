const SIZE = 32;
const SCALE = 2;

// TODO: This can be its own file in the future, ideally somehow imported auto-magically
const IMAGEENUM = [
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

        if (!DOM.rendered) {
            var y = 0;
            var x = 0;
            var cwi = _GAME.game_getCurrentWorldIndex();
            var layer = 0;
            for (var i = 0; i < (DOM.width * DOM.height); ++i) {
                var viewport_y = Math.floor(i / DOM.width);
                var viewport_x = i % DOM.width;
                console.log({viewport_x, viewport_y});

                if (game.viewportHasData(x, y)) {
                    game.worldGetData(x, y);
                }        

                // console.log({world_x, world_y});
                // if (world_x > 0 && world_y > 0) {
                //     --world_x;
                //     --world_y;
                //     var el = document.createElement('div');
                //     el.style.backgroundColor = 'purple';
                //     el.style.width = (SIZE * SCALE) + 'px';
                //     el.style.height = (SIZE * SCALE) + 'px';
                //     el.style.position = 'absolute';
                //     el.style.left = (world_x * (SIZE * SCALE)) + 'px';
                //     el.style.top = (world_y * (SIZE * SCALE)) + 'px';
                //     document.getElementById('view').appendChild(el);
                // }
            }
            DOM.rendered = true;
        }
        // _GAME.game_getWorldData(1, 0, _GAME.viewport_getXFromIndex(0), _GAME.viewport_getYFromIndex(0))
        // TODO: Run other updates/animations here
        // Check diff list && update that
        // OR
        // if first time, do an initial viewport render
    }
}
LOADER.events.addEventListener('loaded', function () {
    DOM.sizeView();
    GAME.setViewportSize(DOM.width, DOM.height);
    GAME.initializeGame();
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
        var clicked_element = document.querySelector('div.thing[data-x="' + x + '"][data-y="' + y + '"]');
        console.log(clicked_element);
        if (clicked_element) {
            if (clicked_element.classList.contains('thing')) {
                console.log('CLICKED A THING', element);
            }
        }
    });
    resizeObserver.observe(document.body);
    LOADER.loaded('window_ready');
});
