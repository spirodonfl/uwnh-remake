// TODO: Branching inputs?
// Depending on mode of editor or game
// Inputs adjust either
// (a) what they do
// (b) where they go with event data
// Ok thought about it. Not a branch.
// You want to have a ***separate*** set of inputs for editor mode vs normal/game mode
window.addEventListener('keyup', function (evt) {
    if (GAME && GAME.moveEntity) {
        console.log(evt);
        // Note: This has to be up top so it's captured before the other KeyD is captured for moving the player around
        // TODO: Write our input captures better, including in editor mode
        if (evt.code === 'KeyD' && evt.shiftKey === true) {
            if (GAME.editor_mode) {
                var collision_block = document.querySelector('.thing.chosen');
                var x = parseInt(collision_block.getAttribute('data-x'));
                var y = parseInt(collision_block.getAttribute('data-y'));
                console.log('Delete collision block at:', {x, y});
                console.log(_GAME.editor_deleteCollision(x, y));
            }
        }
        else if (evt.code === 'KeyA' && evt.shiftKey === true) {
            if (GAME.editor_mode) {
                var x = EDITOR.last_clicked_coordinates[0];
                var y = EDITOR.last_clicked_coordinates[1];
                console.log('About to add collision block to coords:', EDITOR.last_clicked_coordinates);
                console.log(_GAME.editor_addCollision(x, y));
            }
        }
        else if (evt.code === 'KeyE' && evt.shiftKey === true) {
            if (GAME.editor_mode) {
                // TODO: show editor UI
            }
        }
        else if (evt.code === 'KeyW') {
            // UP
            GAME.moveEntity(0, 2);
        } else if (evt.code === 'KeyS') {
            // DOWN
            GAME.moveEntity(0, 3);
        } else if (evt.code === 'KeyA') {
            // LEFT
            GAME.moveEntity(0, 0);
        } else if (evt.code === 'KeyD') {
            // RIGHT
            GAME.moveEntity(0, 1);
        } else if (evt.code === 'Space') {
            GAME.attackEntity(0, 1);
        } else if (evt.code === 'KeyQ') {
            if (MENUS) {
                MENUS.toggle('fullscreen');
            }
        } else if (evt.code === 'ArrowUp') {
            GAME.setCameraPosition(0);
            if (GAME.editor_mode) {
                EDITOR.camera_has_changed = true;
            }
            DOM.__world_rendered = false;
        } else if (evt.code === 'ArrowDown') {
            GAME.setCameraPosition(1);
            if (GAME.editor_mode) {
                EDITOR.camera_has_changed = true;
            }
            DOM.__world_rendered = false;
        } else if (evt.code === 'ArrowLeft') {
            GAME.setCameraPosition(2);
            if (GAME.editor_mode) {
                EDITOR.camera_has_changed = true;
            }
            DOM.__world_rendered = false;
        } else if (evt.code === 'ArrowRight') {
            GAME.setCameraPosition(3);
            if (GAME.editor_mode) {
                EDITOR.camera_has_changed = true;
            }
            DOM.__world_rendered = false;
        } else if (evt.code === 'Digit2' && evt.shiftKey === true) {
            GAME.editor_mode = !GAME.editor_mode;
            if (GAME.editor_mode) {
                EDITOR.camera_has_changed = true;
            } else {
                var editor_blocks = document.querySelectorAll('.editor_block');
                for (var i in editor_blocks) {
                    if (editor_blocks[i] instanceof HTMLElement) {
                        editor_blocks[i].remove();
                    }
                }
            }
            if (GAME.editor_mode) {
                var elements = document.querySelectorAll('.editor');
                for (var i = 0; i < elements.length; ++i) {
                    elements[i].style.display = 'block';
                }
            } else {
                var elements = document.querySelectorAll('.editor');
                for (var i = 0; i < elements.length; ++i) {
                    elements[i].style.display = 'none';
                }
            }
        } else if (evt.code === 'PageUp') {
            EDITOR.current_layer += 1;
            if (EDITOR.current_layer > 2) {
                // TODO: Take into account actual number of available layers but, for now, max is 3
                EDITOR.current_layer = 2;
            }
            document.querySelector('#editor_menu #current_layer .layer_number').innerHTML = EDITOR.current_layer;
        } else if (evt.code === 'PageDown') {
            EDITOR.current_layer -= 1;
            if (EDITOR.current_layer < 0) {
                EDITOR.current_layer = 0;
            }
            document.querySelector('#editor_menu #current_layer .layer_number').innerHTML = EDITOR.current_layer;
        }
    }
});
