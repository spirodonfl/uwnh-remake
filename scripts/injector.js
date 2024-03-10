// TOP LEVEL MODULE
// TODO: GLOBAL
// Move some functionality inside of multiplayer into the zig file itself
// Move some functions/methods in the individual web components to common module
// Cleanup todos
// Re-implement pause (so we can re-implement animations)
// Animate staticized layers
// Switch between staticzed vs non-staticzed layers (raw data w/ element) layers
// Can you get enums out of zig into JS objects or something?
// Stop removing game render elements and re-adding them (thrashes UI)
// -- Probably, at least for entities, just move their position instead
// -- Requires updating diff in zig to track this
// Fix issues with layer management (front and back)
// Make sure entity management is fully working
// -- Once you have that, make multiplayer entities dynamic
// Re-enable / fix resize
// Update UI/UX for multiplayers so its nicer
// Bar across the top on non-production mode as an app menu sorta
// !!BUG!!: pressing spaces makes you go down (multiplyer)

import { Test } from './test.js';
import { ComponentCheatSheet } from './webcomponents/cheatsheet.js';
// TODO: convert this webcomponent and re-import properly (ComponentGame)
import './game.js';
import './editor.js';
import { EVENTBUS } from './eventbus.js';
import { ComponentEditor } from './webcomponents/editor.js';
import { globals } from './globals.js';
import { RyansBackendMainHole } from './websocket-ryans-backend-main-hole.js';
import { RyansBackendSecondaryHole } from './websocket-ryans-backend-secondary-hole.js';

import './inputs.js';
import './game-pad.js';

// REQUEST ANIMATION FRAME SHIM
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

// Note: we depend on these css variables to be global so that's why we set them up like this
// CSS is pretty finicky about how css variables are setup and this ensures we can penetrate
// through the shadow dom on webcomponents
document.documentElement.style.setProperty('--scale', globals.SCALE);
document.documentElement.style.setProperty('--size', globals.SIZE);
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

var cheatsheet_element = document.createElement('cheatsheet-component');
document.body.appendChild(cheatsheet_element);

var game_element = document.createElement('game-component');
document.body.appendChild(game_element);

var editor_element = document.createElement('editor-component');
document.body.appendChild(editor_element);
