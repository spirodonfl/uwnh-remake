import { globals } from './globals.js';
import './input-keyboard.js';
import './input-mouse.js';
// import './input-gamepad.js';

const Inputs = {
    'ALL': [],
    'EDITOR': [],
    'MULTIPLAYER': [],
    'MULTIPLAYERHOST': [],
    'GAME': [],
};
Inputs.ALL = [
    {
        description: 'Toggle the main menu',
        id: 'toggle-main-menu',
        code: 'KeyX',
        friendlyCode: 'X',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: 9,
    },
    { 
        description: 'Toggle the cheatsheet',
        id: 'toggle-cheatsheet',
        code: 'KeyH',
        friendlyCode: 'H',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: 8,
    },
];

Inputs.EDITOR = [
    {
        description: 'Toggle Editor',
        id: 'toggle-editor',
        code: 'KeyP',
        friendlyCode: 'P',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Toggle Atlas',
        id: 'toggle-atlas',
        code: 'KeyA',
        friendlyCode: 'A',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Toggle Entity Editor',
        id: 'toggle-entity-editor',
        code: 'KeyE',
        friendlyCode: 'E',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Change Layer',
        id: 'change-layer',
        code: 'KeyL',
        friendlyCode: 'L',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Add Collision',
        id: 'add-collision',
        code: 'KeyA',
        friendlyCode: 'SHIFT+A',
        shiftKey: true,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Delete Collision',
        id: 'delete-collision',
        code: 'KeyD',
        friendlyCode: 'SHIFT+D',
        shiftKey: true,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Apply Current Data To Layer',
        id: 'apply-current-data-to-layer',
        code: 'KeyV',
        friendlyCode: 'V',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Apply Zero Data To Layer',
        id: 'apply-zero-data-to-layer',
        code: 'KeyZ',
        friendlyCode: 'Z',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Extract Data From Selected Coord',
        id: 'extract-data-from-selected-coord',
        code: 'KeyX',
        friendlyCode: 'SHIFT+X',
        shiftKey: true,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Extract Image From Data',
        id: 'extract-image-from-data',
        code: 'KeyI',
        friendlyCode: 'I',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
];

export { Inputs };
