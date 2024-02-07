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
            EDITOR.addLog('Keyboard Code: ' + evt.code);
            EDITOR.addLog('Keyboard Key: ' + evt.key);
            EDITOR.addLog('Keyboard Shift: ' + evt.shiftKey);
            EDITOR.addLog('Keyboard Ctrl: ' + evt.ctrlKey);
            EDITOR.addLog('Keyboard Alt: ' + evt.altKey);
            EDITOR.addLog('Keyboard Meta: ' + evt.metaKey);
            EDITOR.addLog('Keyboard KeyCode: ' + evt.keyCode);
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
                EDITOR.removeCollision();
            } else if (evt.code === 'KeyA' && evt.shiftKey === true) {
                // ADD COLLISION BLOCK
                EDITOR.addCollision();
            } else if (evt.code === 'KeyE' && evt.shiftKey === true) {
                // TODO: show editor UI
            } else if (evt.code === 'KeyW') {
                // UP
                _GAME.inputs_inputUp(0);
            } else if (evt.code === 'KeyS') {
                // DOWN
                _GAME.inputs_inputDown(0);
            } else if (evt.code === 'KeyA') {
                // LEFT
                _GAME.inputs_inputLeft(0);
            } else if (evt.code === 'KeyD') {
                // RIGHT
                _GAME.inputs_inputRight(0);
            } else if (evt.code === 'Space') {
                // ATTACK
                _GAME.game_entityAttack(0, 1);
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
