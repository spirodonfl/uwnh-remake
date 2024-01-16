const SIZE = 32;
const SCALE = 2;
let DOM = {
    width: 0,
    height: 0,
    __world_rendered: false,
    renderWorld: function () {
        let element_view = document.getElementById('view');
        if (EDITOR.camera_has_changed) {
            var collision_blocks = document.querySelectorAll('.blue');
            for (var c = 0; c < collision_blocks.length; ++c) {
                collision_blocks[c].remove();
            }
        }
        var renderer = {row: 0, column: 0};
        for (var d = 0; d < GAME.getViewportData().length; ++d) {
            if (GAME.editor_mode) {
                var editor_block = document.querySelector('div.editor_block[data-x="' + renderer.column + '"][data-y="' + renderer.
                    row + '"]');
                var data_element = null;
                var coord_element = null;
                if (!editor_block) {
                    editor_block = document.createElement('div');
                    editor_block.classList.add('editor_block');
                    editor_block.setAttribute('data-x', renderer.column);
                    editor_block.setAttribute('data-y', renderer.row);

                    var data_element = document.createElement('div');
                    data_element.classList.add('data');
                    editor_block.appendChild(data_element);

                    var coord_element = document.createElement('div');
                    coord_element.classList.add('coordinate');
                    editor_block.appendChild(coord_element);

                    element_view.append(editor_block);
                }
                data_element = editor_block.querySelector('.data');
                coord_element = editor_block.querySelector('.coordinate');
                coord_element.innerHTML = '(' + renderer.column + ', ' + renderer.row + ')';
                data_element.innerHTML = GAME.getViewportData()[d];
                if (GAME.getViewportData()[d] > 0) {
                    data_element.classList.add('has_value');
                }
                editor_block.style.left = (renderer.column * (SIZE * SCALE)) + 'px';
                editor_block.style.top = (renderer.row * (SIZE * SCALE)) + 'px';
            }
            if (GAME.getViewportData()[d] > 0) {
                // Collisions
                if (!GAME.editor_mode) {
                    var x = renderer.column;
                    var y = renderer.row;
                    let element_item = document.querySelector('div.blue[data-x="' + x + '"][data-y="' + y + '"]');
                    if (element_item) { element_item.remove(); }
                }
                if (GAME.editor_mode && EDITOR.camera_has_changed) {
                    // COLLISION BLOCKS
                    var _artificial_layer = (GAME.getCurrentWorldSize().width * GAME.getCurrentWorldSize().height) * 1;
                    var _artificial_index = GAME.getViewportData()[d];
                    var index = _artificial_index + _artificial_layer - 1;
                    var data = GAME.getWorld()[index];
                    if (data === 1) {
                        var x = renderer.column;
                        var y = renderer.row;
                        // TODO: Put this in a function
                        let element_item = document.querySelector('div.blue[data-x="' + x + '"][data-y="' + y + '"]');
                        if (!element_item)
                        {
                            element_item = document.createElement('div');
                            element_item.classList.add('thing');
                            element_view.append(element_item);
                        }
                        element_item.setAttribute('data-x', x);
                        element_item.setAttribute('data-y', y);
                        element_item.style.left = (x * (SIZE * SCALE)) + 'px';
                        element_item.style.top = (y * (SIZE * SCALE)) + 'px';
                        element_item.classList.add('blue');
                    }
                }

                // Entities
                var _artificial_layer = (GAME.getCurrentWorldSize().width * GAME.getCurrentWorldSize().height) * 2;
                var _artificial_index = GAME.getViewportData()[d];
                var index = _artificial_index + _artificial_layer - 1;
                var data = GAME.getWorld()[index];
                if (data > 0 && !DOM.__world_rendered) {
                    data -= 1;
                    var x = renderer.column;
                    var y = renderer.row;
                    let entity = GAME.getEntity(data);
                    let element_entity = document.querySelector('div[data-entity="' + data + '"]');
                    if (!element_entity)
                    {
                        element_entity = document.createElement('div');
                        element_entity.setAttribute('data-entity', data.toString());
                        element_entity.classList.add('thing');
                        element_view.append(element_entity);
                        if (data === 0)
                        {
                            element_entity.classList.add('purple');
                        }
                        else
                        {
                            element_entity.classList.add('red');
                        }
                    }
                    element_entity.setAttribute('data-x', x);
                    element_entity.setAttribute('data-y', y);
                    element_entity.style.left = (x * (SIZE * SCALE)) + 'px';
                    element_entity.style.top = (y * (SIZE * SCALE)) + 'px';
                    element_entity.innerHTML = entity.health;
                }
            }

            ++renderer.column;
            if (renderer.column >= DOM.width) {
                renderer.column = 0;
                ++renderer.row;
            }
        }
        if (!DOM.__world_rendered) {
            DOM.__world_rendered = true;
        }

        EDITOR.camera_has_changed = false;
    },
    initGame: function ()
    {
        // TODO: Hide game or do not show it until you're done all this stuff first. Loading bar?
        this.sizeView();
        GAME.setViewportSize(DOM.width, DOM.height);
        GAME.updateViewportData();

        this.renderWorld();
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

const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    // entry.contentRect
    // REDO sizing and grid
    console.log('resize called');
    //DOM.sizeView();
    // TODO: Clean this up later. initGame not a good function for this
    if (GAME) {
        DOM.initGame();
    }
});

let then = performance.now();
const interval = 1000 / 30;
let delta = 0;
function animateEntities () {
    let now = performance.now();
    if (now - then >= interval - delta) {
        delta = Math.min(interval, delta + now - then - interval);
        then = now;

        if (_testScript[_testScript_i]) {
            _testScript[_testScript_i]();
        }
        DOM.renderWorld();
        if (GAME.getDiffListLen() > 0) {
            let diff_list = GAME.getDiffList();
            var mode = null;
            var values_read = 0;
            const MODES = ['entity', 'world', 'collision', 'viewport', 'entity_movement'];
            var collision_update = [null, null, null];
            var viewport_update = [];
            for (var d = 0; d < diff_list.length; ++d) {
                // TODO: You need to merge this with the general renderer so that the general renderer only happens when you render the WHOLE world and the diff list happens when you only want to re-render *portions* of the world
                // Update diff_list so you only update the part of the viewport that needs updating (could be all or a specific coordinate or specific coordinates) of the viewport_data from GAME.getViewportData()
                if (mode === null) {
                    mode = MODES[diff_list[d]];
                    // TODO: Copy collision block memory, intercede in front of any wasm calls, use editor collision memory until reset
                    if (mode === 'collision') {
                        var data = diff_list.slice(d, d+8);
                        var x = data[1];
                        var y = data[2];
                        if (data[0] === 0) {
                            // Added collision block
                            let element_item = document.querySelector('div.blue[data-x="' + x + '"][data-y="' + y + '"]');
                            if (!element_item)
                            {
                                element_item = document.createElement('div');
                                element_item.classList.add('thing');
                                element_view.append(element_item);
                            }
                            element_item.setAttribute('data-x', x);
                            element_item.setAttribute('data-y', y);
                            element_item.style.left = (x * (SIZE * SCALE)) + 'px';
                            element_item.style.top = (y * (SIZE * SCALE)) + 'px';
                            element_item.classList.add('blue');
                            EDITOR.camera_has_changed = true;
                        } else {
                            // Removed collision block
                            let element_item = document.querySelector('div.blue[data-x="' + x + '"][data-y="' + y + '"]');
                            if (element_item) { element_item.remove(); }
                            EDITOR.camera_has_changed = true;
                        }
                    }
                } else {
                    if (mode === 'entity') {
                        let element_entity = document.querySelector('div[data-entity="' + diff_list[d] + '"]');
                        if (element_entity) {
                            //element_entity.remove();
                            ++values_read;
                            if (values_read == 1) {
                                mode = null;
                            }
                        } else {
                            console.error('COULD NOT FIND ENTITY: ' + diff_list[d]);
                        }
                    } else if (mode === 'world') {
                        // TODO: This... is what?
                    } else if (mode === 'collision') {
                        if (collision_update[0] === null) {
                            collision_update[0] = diff_list[d];
                        } else if (collision_update[1] === null) {
                            collision_update[1] = diff_list[d];
                        } else if (collision_update[2] === null) {
                            collision_update[2] = diff_list[d];
                        }
                        ++values_read;
                        if (values_read === collision_update.length) {
                            if (collision_update[0] === 1) {
                                let collision_element = document.querySelector('div[data-x="' + collision_update[1] + '"][data-y="' + collision_update[2] + '"]');
                                collision_element.remove();
                            } else {
                                console.log('Collision Update:', collision_update);
                                let element_world = document.getElementById('world');
                                let element_item = document.querySelector('div[data-x="' + collision_update[1] + '"][data-y="' + collision_update[2] + '"]');
                                if (!element_item)
                                {
                                    element_item = document.createElement('div');
                                    element_item.setAttribute('data-x', collision_update[1]);
                                    element_item.setAttribute('data-y', collision_update[2]);
                                    element_item.classList.add('thing');
                                }
                                element_item.style.left = (collision_update[1] * (SIZE * SCALE)) + 'px';
                                element_item.style.top = (collision_update[2] * (SIZE * SCALE)) + 'px';
                                element_item.classList.add('blue');
                            }
                            mode = null;
                        }
                    } else if (mode === 'viewport') {
                        if (viewport_update.length < 7) {
                            viewport_update.push(diff_list[d]);
                        }
                        if (viewport_update.length === 7) {
                            // TODO: Check viewport_update[0] for what we're updating. Example, 0 = entity
                            console.log('Viewport Update:', viewport_update);
                            var vp_data = GAME.getViewportData();
                            var from_coords = [];
                            var to_coords = [];
                            var element_item = null;
                            if (viewport_update[1] === 0) {
                                from_coords = [viewport_update[2], viewport_update[3]];
                                to_coords = [viewport_update[5], viewport_update[6]];
                            } else {
                                to_coords = [viewport_update[2], viewport_update[3]];
                                from_coords = [viewport_update[5], viewport_update[6]];
                            }
                            console.log('from_coords', from_coords);
                            console.log('to coords', to_coords);
                            console.log('div.thing[data-x="' + from_coords[0] + '"][data-y="' + from_coords[1] + '"]');
                            element_item = document.querySelector('div.thing[data-x="' + from_coords[0] + '"][data-y="' + from_coords[1] + '"]');
                            if (element_item) {
                                element_item.setAttribute('data-x', to_coords[0]);
                                element_item.setAttribute('data-y', to_coords[1]);
                                element_item.style.left = (to_coords[0] * (SIZE * SCALE)) + 'px';
                                element_item.style.top = (to_coords[1] * (SIZE * SCALE)) + 'px';
                            }
                            mode = null;
                        }
                    } else if (mode === 'entity_movement') {
                        if (viewport_update.length < 1) {
                            viewport_update.push(diff_list[d]);
                        }
                        if (viewport_update.length === 1) {
                            let element_entity = document.querySelector('div[data-entity="' + viewport_update[0] + '"]');
                            if (element_entity) {
                                let entity = GAME.getEntity(viewport_update[0]);
                                element_entity.innerHTML = entity.health;
                            }
                            mode = null;
                        }
                    }
                }
            }
            console.log('diff_list', diff_list);
            // for (let i = 0; i < diff_list.length; ++i) {
            //     let position = GAME.getEntityPosition(diff_list[i]);
            // }
            GAME.clearDiffList();
        }
    }
};
function animate() {
    // call this function again asap
    requestAnimationFrame(animate);
    // measure time and add or remove sprites
    STATS.checkFPS();
    
    // deal with the level
    animateEntities();
}

LOADER.events.addEventListener('loaded', function (a) {
    // console.log(a);
    // run each frame
    GAME.initGame();
    DOM.initGame();
    animate();
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
                if (clicked_element.classList.contains('blue')) {
                    clicked_element.classList.add('chosen');
                }
            }
        }
    });
    resizeObserver.observe(document.body);
    LOADER.loaded('window_ready');
});
