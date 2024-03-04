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
    MODES: ['ALL', 'GAME', 'EDITOR', 'MULTIPLAYER / TWITCH'],
    INPUTS: [],
};
