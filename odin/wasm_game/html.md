# The HTML For The Game

For the browser based version, we're going to run this with JS and HTML, all vanilla, using as much ES5 as possible.

## JS Console Log w/ WASM

If you look at [odin.md](./odin.md) there's some Odin/WASM code that foreign exports a `console_log` function. That function maps onto this `js_console_log` function. In essence, WASM calls this javascript code and executes it.

Since text strings are really just an array of u8 characters "under the hood", we use a uint8array with a pointer location to the memory space and a length to get the string and decode it into utf-8.

<!-- lit block js_console_log_function -->
``` js
js_console_log: function(ptr, len) {
    var bytes = new Uint8Array(wasm.exports.memory.buffer, ptr, len)
    var message = new TextDecoder('utf-8').decode(bytes)
    console.log(message)
}
```
<!-- lit end_block -->

Sometimes we may want to manually reach into the wasm memory and read strings so we'll just expand the js_console_log function here into a more generalized one we can use directly from the JS side.

<!-- lit block read_string_from_wasm_function -->
``` js
function readStringFromWasm(start, length) {
    var string_buffer = new Uint8Array(
        wasm.exports.memory.buffer,
        start,
        length,
    )
    var string = new TextDecoder('utf-8').decode(string_buffer)
    return string
}

function getCurrentSceneName() {
    var ptr = wasm.exports.get_current_scene_name_ptr()
    var len = wasm.exports.get_current_scene_name_len()
    return readStringFromWasm(ptr, len)
}
function getCurrentSceneCursor() {
    return readStringFromWasm(wasm.exports.get_current_scene_cursor_ptr(), wasm.exports.get_current_scene_cursor_len())
}
function getCurrentSceneDialogue() {
    return readStringFromWasm(wasm.exports.get_current_scene_dialogue_ptr(), wasm.exports.get_current_scene_dialogue_len())
}
function getCurrentSceneMenu() {
    return readStringFromWasm(wasm.exports.get_current_scene_menu_ptr(), wasm.exports.get_current_scene_menu_len())
}
function getCurrentSceneChoice(which) {
    return readStringFromWasm(wasm.exports.get_current_scene_choices_ptr(which), wasm.exports.get_current_scene_choices_len(which))
}
```
<!-- lit end_block -->

## Fetching the WASM

We instantiate a fetch protocol and read the wasm file as an array buffer. Once it's read, we attach it to the global `wasm` variable for easy access and start the game.

<!-- lit block fetch_wasm_function -->
``` js
fetch('wasm_game.wasm')
    .then(function(response) { return response.arrayBuffer() })
    .then(function(bytes) { return WebAssembly.instantiate(bytes, importObject) })
    .then(function(results) {
        var instance = results.instance
        wasm = instance

        start_game()
    })
```
<!-- lit end_block -->

## Starting the game

<!-- lit block start_game_function -->
``` js
function start_game() {
    console.log('Starting game here')

    var TILE_SIZE = 16
    var TILE_SCALE = 2
    var TILE_SIZE_SCALED = TILE_SIZE * TILE_SCALE
    wasm.exports.set_viewport_size(12, 12)
    document.getElementById('viewport').style.width = (TILE_SIZE_SCALED * wasm.exports.get_viewport_width()) + 'px'
    document.getElementById('viewport').style.height = (TILE_SIZE_SCALED * wasm.exports.get_viewport_height()) + 'px'
    for (var i = 0; i < wasm.exports.get_viewport_width(); ++i) {
        for (var j = 0; j < wasm.exports.get_viewport_height(); ++j) {
            var tile = document.createElement('div')
            tile.style.width = TILE_SIZE_SCALED + 'px'
            tile.style.height = TILE_SIZE_SCALED + 'px'
            tile.style.backgroundColor = 'purple'
            tile.style.border = '1px solid white'
            tile.setAttribute('viewport_x', i)
            tile.setAttribute('viewport_y', j)
            tile.setAttribute('world_x', i)
            tile.setAttribute('world_y', j)
            document.getElementById('viewport').appendChild(tile)
        }
    }
    wasm.exports.initialize_game()
    if (wasm.exports.get_current_game_mode() == wasm.exports.get_game_mode_in_empty()) {
        console.log('Game is empty, starting frames')
        requestAnimationFrame(RAF.animate)
    }

    {{{ user_input_functionality }}}
}
```
<!-- lit end_block -->

## Tick and RequestAnimationFrame and FPS

Our Odin/WASM game has a tick function. This tick function essentially runs WASM operations on the game like updating the state of the game, moving global NPCs around, or other things. Our renderer (in this case, JS) needs to call this tick function or the game doesn't move forward (usually). We also want to tie this into the rendering frames so that each frame on the rendering side calls the WASM tick function. This ensure the frames are synchronized (hopefully) with the game.

Browsers and javascript already have a nice feature called `requestAnimationFrame` which we'll use to manage our framerate (we can manually throttle or set it) and run tick alongside the frames.

TODO: Break this out and explain it better

<!-- lit block raf_functionality -->
``` js
var RAF = {
    fps: 60,
    interval: 1000,
    last_time: 0,
    is_paused: false,
    last_log_time: 0,
    log_interval: 0,
    fps_value: 0,
    last_fps_time: 0,
    frame_count: 0,
    initialize: function () {
        RAF.interval = RAF.interval / RAF.fps
    },
    animate: function(current_time) {
        requestAnimationFrame(RAF.animate)

        if (!RAF.is_paused) {
            // Calculate time elapsed since last frame
            var delta_time = current_time - RAF.last_time

            // Only update if enough time has passed
            if (delta_time >= RAF.interval) {
                // Update last time, accounting for any extra time
                RAF.last_time = current_time - (delta_time % RAF.interval)

                RAF.update(delta_time, current_time)
                RAF.render()

                ++RAF.frame_count
            }
        }

        // Calculate FPS every second
        if (current_time - RAF.last_fps_time >= 1000) {
            RAF.fps_value = Math.round((RAF.frame_count * 1000) / (current_time - RAF.last_fps_time))
            RAF.frame_count = 0
            RAF.last_fps_time = current_time
        }
    },
    update: function(delta_time, current_time) {
        if (current_time - RAF.last_log_time >= RAF.log_interval) {
            RAF.last_log_time = current_time
        }
    },
    render: function () {
        if (wasm) {
            wasm.exports.tick()
            if (wasm.exports.get_current_game_mode() === wasm.exports.get_game_mode_in_opening_title()) {
                document.getElementById('opening_title').style.display = 'block'
            } else if (wasm.exports.get_current_game_mode() === wasm.exports.get_game_mode_in_new_load_options_menu()) {
                document.getElementById('opening_title').style.display = 'none'
                document.getElementById('new_menu').style.display = 'none'
                document.getElementById('new_load_options_menu').style.display = 'block'
            } else if (wasm.exports.get_current_game_mode() === wasm.exports.get_game_mode_in_new_menu()) {
                document.getElementById('new_load_options_menu').style.display = 'none'
                document.getElementById('new_menu').style.display = 'block'
            } else if (wasm.exports.get_current_game_mode() === wasm.exports.get_game_mode_in_scene()) {
                document.getElementById('new_menu').style.display = 'none'
                if (wasm.exports.get_current_scene_dialogue_len() > 0) {
                    document.getElementById('scene_dialogue').style.display = 'block'
                    document.getElementById('scene_dialogue').innerHTML = getCurrentSceneDialogue()
                } else {
                    document.getElementById('scene_dialogue').style.display = 'none'
                    document.getElementById('scene_dialogue').innerHTML = ''
                }
                if (wasm.exports.get_current_scene_menu_len() > 0) {
                    if (getCurrentSceneMenu() === "in_port_bank" && document.getElementById('scene_choices').style.display === 'none') {
                        for (var i = 0; i < wasm.exports.get_max_scene_choices(); ++i) {
                            if (wasm.exports.get_current_scene_choices_len(i) > 0) {
                                var choice = document.createElement('div')
                                choice.innerHTML = getCurrentSceneChoice(i)
                                document.getElementById('scene_choices').appendChild(choice)
                            }
                        }
                        document.getElementById('scene_choices').style.display = 'block'
                    }
                } else {
                    document.getElementById('scene_choices').style.display = 'none'
                    document.getElementById('scene_choices').innerHTML = ''
                }
            } else if (wasm.exports.get_current_game_mode() === wasm.exports.get_game_mode_in_port()) {
                document.getElementById('scene_dialogue').style.display = 'none'
                document.getElementById('viewport').style.display = 'grid'
                document.getElementById('viewport').style.gridTemplateColumns = `repeat(${wasm.exports.get_viewport_width()}, 1fr)`
                document.getElementById('viewport').style.gridTemplateRows = `repeat(${wasm.exports.get_viewport_height()}, 1fr)`

                // if (wasm.exports.renderer_should_redraw()) {
                    // console.log('Should redraw')
                    // TODO: This should become "render viewport" or whatever
                    for (var i = 0; i < wasm.exports.get_viewport_width(); ++i) {
                        for (var j = 0; j < wasm.exports.get_viewport_height(); ++j) {
                            var tile = document.getElementById('viewport').children[i + j * wasm.exports.get_viewport_width()]
                            // TODO: Magic number where we know it's 0, for now
                            var bg_layer = 0
                            var value = wasm.exports.get_viewport_value_at_coordinates(bg_layer, i, j)
                            if (value === 1) {
                                tile.style.backgroundColor = 'rgb(50, 50, 50)'
                            } else if (value === 2) {
                                tile.style.backgroundColor = 'red'
                            } else {
                                tile.style.backgroundColor = 'black'
                            }
                            var npc_layer = 1
                            var npc_value = wasm.exports.get_viewport_value_at_coordinates(npc_layer, i, j)
                            if (npc_value !== -1) {
                                tile.style.backgroundColor = 'blue'
                            }
                        }
                    }
                // }
            } else {
                console.log('Unknown game mode:', wasm.exports.get_current_game_mode())
            }
        }
    },
    togglePause: function () {
        RAF.is_paused = !RAF.is_paused
        console.log(RAF.is_paused ? 'RAF paused' : 'RAF resumed')
    }
}

window.addEventListener('load', function () {
    RAF.initialize()

    {{{ fetch_wasm_function }}}
})
```
<!-- lit end_block -->

## User Input

<!-- lit block user_input_functionality -->
``` js
document.addEventListener('keyup', function (e) {
    switch (e.code) {
        case "KeyZ":
            wasm.exports.user_input_a()
        break
        case "KeyX":
            wasm.exports.user_input_b()
        break
        case "KeyA":
            wasm.exports.user_input_left()
        break
        case "KeyD":
            wasm.exports.user_input_right()
        break
        case "KeyW":
            wasm.exports.user_input_up()
        break
        case "KeyS":
            wasm.exports.user_input_down()
        break
    }
})
```
<!-- lit end_block -->

# The final output!

<!-- lit output wasm_game.html -->
``` html
<html>
    <head>
        <title>The Game</title>
        <style type="text/css">
            body {
                background-color: rgb(20, 20, 20);
                color: white;
                font-family: 'Times New Roman';
                font-size: 24px;
            }
            * {
                box-sizing: border-box;
            }
        </style>
        <script type="text/javascript">
            var wasm
            var importObject = {
                env: {
                    {{{ js_console_log_function }}}
                }
            }
            {{{ raf_functionality }}}
            {{{ read_string_from_wasm_function }}}
            {{{ start_game_function }}}
        </script>
    </head>
    <body>
        <div id="opening_title" style="display: none;">The Games Opening Title Here. Press A (Z) to start!</div>
        <div id="new_load_options_menu" style="display: none;">
            <p>Press A (Z) to start new game</p>
            <ul>
                <li>New</li>
                <li>Load</li>
                <li>Options</li>
            </ul>
        </div>
        <div id="new_menu" style="display: none;">
            <p>Press A (Z) to start new game</p>
            <p>Press B (X) to go back to main menu</p>
            <ul>
                <li>Stats</li>
                <li>Looks</li>
                <li>Name</li>
            </ul>
        </div>
        <div id="scene_dialogue" style="display: none;"></div>
        <div id="scene_choices" style="display: none;"></div>
        <div id="viewport" style="display: none;"></div>
    </body>
</html>
```
<!-- lit end_output -->