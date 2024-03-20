import { globals } from './globals.js';
import { Inputs } from './inputs.js';

const inputMatch = function (event_id) {
    let input = Inputs.ALL.find(input => input.event_id === event_id);
    if (!input) {
        input = Inputs.EDITOR.find(input => input.event_id === event_id);
    }
    if (!input) {
        input = Inputs.MULTIPLAYER.find(input => input.event_id === event_id);
    }
    if (!input) {
        input = Inputs.MULTIPLAYERHOST.find(input => input.event_id === event_id);
    }
    if (!input) {
        input = Inputs.GAME.find(input => input.event_id === event_id);
    }
    return input;
}

document.addEventListener('click', function (event) {
    let handled = false;
    let composed_path = event.composedPath();
    if (composed_path.length > 0) {
        let target = composed_path[0];
        if (target.hasAttribute('event-id')) {
            let event_id = target.getAttribute('event-id');
            let input = inputMatch(event_id);
            if (input) {
                let payload = {
                    input,
                    event,
                    composed_path,
                    type: 'mouse',
                    event_id: input.event_id,
                };
                globals.EVENTBUS.triggerNamedEvent('input', payload);
                globals.EVENTBUS.triggerEvent(payload);
                handled = true;
            }
        }
    }

    if (!handled) {
        let event_id = null;
        if (composed_path.length > 0) {
            let target = composed_path[0];
            if (target.hasAttribute('event-id')) {
                event_id = target.getAttribute('event-id');
            }
        }
        let input = {event_id};
        let payload = {
            input,
            event,
            composed_path,
            type: 'mouse',
            event_id: input.event_id
        }
        globals.EVENTBUS.triggerNamedEvent('click', payload);
        globals.EVENTBUS.triggerEvent(payload);
    }
});

