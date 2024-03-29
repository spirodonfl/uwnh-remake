// TOP LEVEL MODULE
// TODO: GLOBAL
//
// "clickable_view" is not properly offset left-right (maybe?)
// 
// Re-implement pause (so we can re-implement animations)
// 
// Animate staticized layers
// 
// Switch between staticzed vs non-staticzed layers (raw data w/ element) layers
// 
// Can you get enums out of zig into JS objects or something?
// 
// Stop removing game render elements and re-adding them (thrashes UI)
// -- Probably, at least for entities, just move their position instead
// -- Requires updating diff in zig to track this
// 
// Fix issues with layer management (front and back)
// 
// Make sure entity management is fully working
// -- Once you have that, make multiplayer entities dynamic
// 
// Re-enable / fix resize
// 
// Update UI/UX for multiplayers so its nicer
// 
// Bar across the top on non-production mode as an app menu sorta
// 
// !!BUG!!: pressing spaces makes you go down (multiplyer)
//
// Add more kraken icons
// - next.js
// - react
// - ruby
// - vim
// - jetbrains
// - brainf*ck as an epic
// - c
// - c++
// - rust
// - crablang
// - elixir
// - haskell
// - cobol
// - assembly/wasm
// - cobol-on-wheelchair
// - fortran
// - matlab
// GLEAM AS A TREASURE ITEM

import './webcomponents/cheatsheet.js';
import './webcomponents/editor.js';
import './webcomponents/game.js';
import { Game } from './game.js';
import { globals } from './globals.js';
import { RyansBackendMainHole } from './websockets/ryans-backend-main-hole.js';
import { RyansBackendSecondaryHole } from './websockets/ryans-backend-secondary-hole.js';
import { Debug } from './debug.js';
import './inputs.js';
import './input-gamepad.js';

import { wasm } from './injector_wasm.js';
window.WASM = wasm;

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

Debug.init();
globals.EVENTBUS.addEventListener('event', function(e) {
    if (e.input.event_id === 'assets_loaded') {
        var game_element = document.createElement('game-component');
        document.body.appendChild(game_element);

        var editor_element = document.createElement('editor-component');
        document.body.appendChild(editor_element);
    }
});
Game.init();
