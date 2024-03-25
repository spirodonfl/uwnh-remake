import { EVENTBUS } from './eventbus.js';

export const globals = {
    SCALE: 2,
    SIZE: 32,
    MODE: 1,
    MODES: ['ALL', 'GAME', 'EDITOR', 'MULTIPLAYER', 'MULTIPLAYER_HOST'],
    EVENTBUS: new EVENTBUS(),
};

export const possibleKrakenImages = {
    "ocaml": {
        "x": 34,
        "y": 1
    },
    "squid": {
        "x": 18,
        "y": 0
    },
    "react": {
        "x": 19,
        "y": 2
    },
    "neovim": {
        "x": 20,
        "y": 2
    },
    "sublime": {
        "x": 21,
        "y": 2
    },
    "php": {
        "x": 22,
        "y": 2
    },
    "python": {
        "x": 23,
        "y": 2
    },
    "golang": {
        "x": 24,
        "y": 2
    },
    "docker": {
        "x": 25,
        "y": 2
    }
};
