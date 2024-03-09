import { globals } from './globals.js';

// TODO: Finish this. Global listener I suppose works
globals.INPUTS.push({
    description: 'Toggle the main menu',
    context: globals.MODES.indexOf('ALL'),
    code: 'KeyX',
    friendlyCode: 'X',
    shiftKey: false,
    ctrlKey: false,
});

