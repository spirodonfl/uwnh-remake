import { globals } from './globals.js';
import { Inputs } from './inputs.js';

const inputMatch = function (input_id) {
    let input = Inputs.ALL.find(input => input.input_id === input_id);
    if (!input) {
        input = Inputs.EDITOR.find(input => input.input_id === input_id);
    }
    if (!input) {
        input = Inputs.MULTIPLAYER.find(input => input.input_id === input_id);
    }
    if (!input) {
        input = Inputs.MULTIPLAYERHOST.find(input => input.input_id === input_id);
    }
    if (!input) {
        input = Inputs.GAME.find(input => input.input_id === input_id);
    }
    return input;
}

document.addEventListener('click', function (event) {
    let handled = false;
    let composed_path = event.composedPath();
    if (composed_path.length > 0) {
        let target = composed_path[0];
        if (target.hasAttribute('input-id')) {
            let input_id = target.getAttribute('input-id');
            let input = inputMatch(input_id);
            if (input) {
                let payload = {input, event, composed_path};
                globals.EVENTBUS.triggerEvent('input', payload);
                handled = true;
            }
        }
    }

    if (!handled) {
        let input_id = null;
        if (composed_path.length > 0) {
            let target = composed_path[0];
            if (target.hasAttribute('input-id')) {
                input_id = target.getAttribute('input-id');
            }
        }
        let input = {input_id};
        globals.EVENTBUS.triggerEvent('click', {input, event, composed_path});
    }
});

