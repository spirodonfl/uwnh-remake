// TODO: Branching inputs?
// Depending on mode of editor or game
// Inputs adjust either
// (a) what they do
// (b) where they go with event data
// Ok thought about it. Not a branch.
// You want to have a ***separate*** set of inputs for editor mode vs normal/game mode
var INPUT = {
    MODE: 0,
    MODES: ['Game', 'Editor', 'Twitch'],
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
                } else if (evt.code === 'Digit0') {
                    // Game Mode
                    INPUT.MODE = 0;
                    EDITOR.updateInputMode();
                } else if (evt.code === 'Digit1') {
                    // Editor Mode
                    INPUT.MODE = 1;
                    EDITOR.updateInputMode();
                } else if (evt.code === 'Digit2') {
                    // Twitch Mode
                    INPUT.MODE = 2;
                    EDITOR.updateInputMode();
                }
            }

            if (INPUT.MODE === 0) {
                GAME.handleInput(evt);
            } else if (INPUT.MODE === 1) {
                EDITOR.handleInput(evt);
            } else if (INPUT.MODE === 2) {
                TWITCH.handleInput(evt);
            }
        });
    },
};
