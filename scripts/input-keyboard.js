import { globals } from './globals.js';
import { Inputs } from './inputs.js';

const inputMatch = function (input, event) {
    let handled = event.code === input.code && event.shiftKey === input.shiftKey && event.ctrlKey === input.ctrlKey;
    if (handled) {
        let payload = {input, event, composed_path: event.composedPath()};
        globals.EVENTBUS.triggerEvent('input', payload);
    }
    return handled;
}

document.addEventListener('keydown', function (event) {
    let handled = false;
    // Note: We *specifically* want to process the inputs in THIS order
    // so we have to handle them one by one. There might be a better way
    // to do this in the future but my brain can't figure it out right now
    for (const input of Inputs.ALL) {
        handled = inputMatch(input, event);
    }
    if (!handled) {
        for (const input of Inputs.EDITOR) {
            handled = inputMatch(input, event);
        }
    }
    if (!handled) {
        for (const input of Inputs.MULTIPLAYER) {
            handled = inputMatch(input, event);
        }
    }
    if (!handled) {
        for (const input of Inputs.MULTIPLAYERHOST) {
            handled = inputMatch(input, event);
        }
    }
    if (!handled) {
        for (const input of Inputs.GAME) {
            handled = inputMatch(input, event);
        }
    }
});
