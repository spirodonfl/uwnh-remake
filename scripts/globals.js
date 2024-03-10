import { EVENTBUS } from './eventbus.js';

export const globals = {
    SCALE: 2,
    SIZE: 32,
    ATLAS_PNG_FILENAME: import.meta.resolve('../images/atlas.png'),
    LAYER_ID_TO_IMAGE_JSON_FILENAME: import.meta.resolve('../json/layer_id_to_image.json'),
    LAYER_ID_TO_IMAGE: null,
    IMAGE_DATA: import.meta.resolve('../json/image_data.json'),
    EVENTBUS: new EVENTBUS(),
    MODE: 2,
    MODES: ['ALL', 'GAME', 'EDITOR', 'MULTIPLAYER', 'MULTIPLAYER_HOST'],
    INPUTS: [],
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
