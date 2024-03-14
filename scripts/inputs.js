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
        event_id: 'toggle_main_menu',
        code: 'KeyX',
        friendlyCode: 'X',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: 9,
    },
    { 
        description: 'Toggle the cheatsheet',
        event_id: 'toggle_cheatsheet',
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
        event_id: 'toggle_editor',
        code: 'KeyP',
        friendlyCode: 'P',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Toggle Atlas',
        event_id: 'toggle_atlas',
        code: 'KeyA',
        friendlyCode: 'A',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Toggle Entity Editor',
        event_id: 'toggle_entity_editor',
        code: 'KeyE',
        friendlyCode: 'E',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Change Layer',
        event_id: 'change_layer',
        code: 'KeyL',
        friendlyCode: 'L',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Add Collision',
        event_id: 'add_collision',
        code: 'KeyA',
        friendlyCode: 'SHIFT+A',
        shiftKey: true,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Delete Collision',
        event_id: 'delete_collision',
        code: 'KeyD',
        friendlyCode: 'SHIFT+D',
        shiftKey: true,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Apply Current Data To Layer',
        event_id: 'apply_current_data_to_layer',
        code: 'KeyV',
        friendlyCode: 'V',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Apply Zero Data To Layer',
        event_id: 'apply_zero_data_to_layer',
        code: 'KeyZ',
        friendlyCode: 'Z',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Extract Data From Selected Coord',
        event_id: 'extract_data_from_selected_coord',
        code: 'KeyX',
        friendlyCode: 'SHIFT+X',
        shiftKey: true,
        ctrlKey: false,
        gamepadButton: null,
    },
    {
        description: 'Extract Image From Data',
        event_id: 'extract_image_from_data',
        code: 'KeyI',
        friendlyCode: 'I',
        shiftKey: false,
        ctrlKey: false,
        gamepadButton: null,
    },
];

export { Inputs };
