// TOP LEVEL MODULE

import { Test } from './test.js';
import { CheatSheet } from './cheatsheet.js';
import { Game } from './game.js';
// TODO: Do we actually need an eventbus if we have CustomEvents?
// Note: game-component might be our top level event bus for global events
import { EVENTBUS } from './eventbus.js';
import { Editor } from './editor.js';

customElements.define('cheatsheet-component', CheatSheet);
customElements.define('game-component', Game);
customElements.define('editor-component', Editor);

if (!window.requestAnimationFrame)  {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback,element) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
}
window.GLOBALS = {
    SCALE: 2,
    SIZE: 32,
    ATLAS_PNG_FILENAME: import.meta.resolve('../images/atlas.png'),
    LAYER_ID_TO_IMAGE_JSON_FILENAME: import.meta.resolve('..//json/layer_id_to_image.json'),
    LAYER_ID_TO_IMAGE: null,
    IMAGE_DATA: import.meta.resolve('..//json/image_data.json'),
    EVENTBUS: new EVENTBUS(),
    MODE: 2,
    MODES: ['ALL', 'GAME', 'EDITOR', 'MULTIPLAYER / TWITCH'],
    INPUTS: [],
};
// TODO: Why are we doubling up these meta resolve calls?
window.GLOBALS.ATLAS_PNG_FILENAME = import.meta.resolve(GLOBALS.ATLAS_PNG_FILENAME);
window.GLOBALS.LAYER_ID_TO_IMAGE_JSON_FILENAME = import.meta.resolve(GLOBALS.LAYER_ID_TO_IMAGE_JSON_FILENAME);
window.GLOBALS.IMAGE_DATA = import.meta.resolve(GLOBALS.IMAGE_DATA);

// REQUEST ANIMATION FRAME SHIM
// TODO: Do we even truly need this truly truly?
if (!window.requestAnimationFrame)  {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback,element) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
}

document.documentElement.style.setProperty('--scale', GLOBALS.SCALE);
document.documentElement.style.setProperty('--size', GLOBALS.SIZE);
document.documentElement.style.setProperty('--scaled-size', 'calc(var(--size) * var(--scale))');
document.documentElement.style.setProperty('--scaled-size-px', 'calc(var(--scaled-size) * 1px)');
document.body.style.setProperty('--font-size', 'large');
document.body.style.setProperty('--font-family', 'monospace');
document.body.style.fontSize = 'var(--font-size)';
document.body.style.backgroundColor = 'black';
document.body.style.color = 'white';
document.body.style.fontFamily = 'var(--font-family)';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.fontSize = 'var(--font-size)';
document.body.style.boxSizing = 'border-box';
document.body.style.overflow = 'hidden';
// console.log(wasm.instance.exports.game_getCurrentWorldIndex());
// Note: It doesn't really matter where, in the order of things, this CSS file is loaded since it doesn't get used right away
const juice_it_css = import.meta.resolve("../styles/juice-it-animations.css");
var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = juice_it_css;
document.head.appendChild(link);

var cheatsheet_element = document.createElement('cheatsheet-component');
document.body.appendChild(cheatsheet_element);

var game_element = document.createElement('game-component');
document.body.appendChild(game_element);

var editor_element = document.createElement('editor-component');
document.body.appendChild(editor_element);
