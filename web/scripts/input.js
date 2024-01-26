// TODO: Branching inputs?
// Depending on mode of editor or game
// Inputs adjust either
// (a) what they do
// (b) where they go with event data
// Ok thought about it. Not a branch.
// You want to have a ***separate*** set of inputs for editor mode vs normal/game mode
var INPUT = {
    startListening: function() {
        window.addEventListener('keyup', function (evt) {
            console.log(evt);
            // TODO: If EDITOR.enabled
            // -- Separate input path that takes precedence
            
            if (evt.shiftKey === true) {
                if (evt.code === 'KeyS') {
                    document.getElementById("stats").classList.toggle('hide');
                }
            }

            // Note: This has to be up top so it's captured before the other KeyD is captured for moving the player around
            if (evt.code === 'KeyD' && evt.shiftKey === true) {
                // DELETE COLLISION BLOCK
            } else if (evt.code === 'KeyA' && evt.shiftKey === true) {
                // ADD COLLISION BLOCK
            } else if (evt.code === 'KeyE' && evt.shiftKey === true) {
                // TODO: show editor UI
            } else if (evt.code === 'KeyW') {
                // UP
                if (__entities__.length > 0) {
                    __entities__[0][1] -= 1;
                    var element = document.querySelector('[data-entity-id="1"]');
                    if (element instanceof HTMLElement) {
                        element.style.left = (__entities__[0][0] * (SIZE * SCALE)) + 'px';
                        element.style.top = (__entities__[0][1] * (SIZE * SCALE)) + 'px';
                    }
                }

            } else if (evt.code === 'KeyS') {
                // DOWN
                if (__entities__.length > 0) {
                    __entities__[0][1] += 1;
                    var element = document.querySelector('[data-entity-id="1"]');
                    if (element instanceof HTMLElement) {
                        element.style.left = (__entities__[0][0] * (SIZE * SCALE)) + 'px';
                        element.style.top = (__entities__[0][1] * (SIZE * SCALE)) + 'px';
                    }
                }
            } else if (evt.code === 'KeyA') {
                // LEFT
                if (__entities__.length > 0) {
                    __entities__[0][0] -= 1;
                    var element = document.querySelector('[data-entity-id="1"]');
                    if (element instanceof HTMLElement) {
                        element.style.left = (__entities__[0][0] * (SIZE * SCALE)) + 'px';
                        element.style.top = (__entities__[0][1] * (SIZE * SCALE)) + 'px';
                    }
                }

            } else if (evt.code === 'KeyD') {
                // RIGHT
                if (__entities__.length > 0) {
                    __entities__[0][0] += 1;
                    var element = document.querySelector('[data-entity-id="1"]');
                    if (element instanceof HTMLElement) {
                        element.style.left = (__entities__[0][0] * (SIZE * SCALE)) + 'px';
                        element.style.top = (__entities__[0][1] * (SIZE * SCALE)) + 'px';
                    }
                }

            } else if (evt.code === 'Space') {
                // ATTACK
            } else if (evt.code === 'KeyQ') {
                // FULL SCREEN MENU
            } else if (evt.code === 'ArrowUp') {
                // UPDATE CAMERA AND RE-RENDER VIEWPORT
            } else if (evt.code === 'ArrowDown') {
                // UPDATE CAMERA AND RE-RENDER VIEWPORT
            } else if (evt.code === 'ArrowLeft') {
                // UPDATE CAMERA AND RE-RENDER VIEWPORT
            } else if (evt.code === 'ArrowRight') {
                // UPDATE CAMERA AND RE-RENDER VIEWPORT
            } else if (evt.code === 'Digit2' && evt.shiftKey === true) {
                // TURN ON EDITOR MODE
                // SHOW COLLISION BLOCKs
                // IF EDITOR MODE ON, TURN IT OFF
                // HIDE COLLISION BLOCKS
            }
        });
    },
};
