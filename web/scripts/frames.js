import { wasm } from './injector_wasm.js';

let PAUSED = false;
let READY_TO_PROCESS_TICK = true;
let current_time_stamp = new Date().getTime();
let previous_time_stamp = 0;
let frames_this_second = 0;
let elapsed_ms = 0;
let current_fps = 0;
let then = performance.now();
const interval = 1000 / 30; // Frames per second
let delta = 0;
function updateStats() {
    ++frames_this_second;

    previous_time_stamp = current_time_stamp;
    current_time_stamp = new Date().getTime();
    elapsed_ms += current_time_stamp - previous_time_stamp;
    current_fps = 1000 / (current_time_stamp - previous_time_stamp);

    // Update every second
    if (elapsed_ms >= 1000)
    {
        var game_component = document.querySelector('game-component');
        game_component.updateFPS(frames_this_second);
        elapsed_ms -= 1000;
        frames_this_second = 0;
        game_component.updateElementCount();
    }
}
function tick() {
    let now = performance.now();
    if (now - then >= interval - delta) {
        delta = Math.min(interval, delta + now - then - interval);
        then = now;
        // TODO: Only allow paused on non-multiplayer game
        if (!PAUSED) {
            FRAMES.runOnFrames();
            updateStats();

            // TODO: Move this to game.js with runOnFrames()
            // Alternatively, we could have a global event bus that we trigger
            // especially since we're doing a lot of different things
            // based on which components are active in the page
            if (READY_TO_PROCESS_TICK) {
                wasm.game_processTick();

                if (wasm.diff_getLength() > 0) {
                    var length = wasm.diff_getLength();
                    for (var l = 0; l < length; ++l) {
                        var diff = wasm.diff_getData(l);
                        // TODO: Fix magic number here. This is also on Zig side
                        if (diff === 69) {
                            var attacker_entity_id = wasm.diff_getData((l + 1));
                            var attacker_entity_type = wasm.game_entityGetType(attacker_entity_id);
                            var attackee_entity_id = wasm.diff_getData((l + 2));
                            // TODO: referencing multiplayer-host-component stuff is weird here. global events maybe?
                            if (attacker_entity_type < 3) {
                                var multiplayer_host_element = document.querySelector('multiplayer-host-component');
                                if (multiplayer_host_element) {
                                    multiplayer_host_element.incrementLeaderboard(attacker_entity_id, attackee_entity_id);
                                    if (attackee_entity_id === 7) {
                                        multiplayer_host_element.disableKraken();
                                    }
                                }
                            } else if (attacker_entity_type == 99) {                        
                                var health = wasm.game_entityGetHealth(attackee_entity_id);
                                if (health === 0) {
                                    var multiplayer_host_element = document.querySelector('multiplayer-host-component');
                                    if (multiplayer_host_element) {
                                        multiplayer_host_element.despawnUser(attackee_entity_id);
                                    }
                                }
                            }
                            l += 2;
                        }
                    }
                    document.querySelector('game-component').renderGame();
                    document.querySelector('editor-component').renderViewportData();
                    wasm.diff_clearAll();
                }
            }
        }
    }
    FRAMES.requestAnimationFrame();
}

export const FRAMES = {
    frameCallbacks: [],
    pause: function () {
        PAUSED = !PAUSED;
    },
    getPaused: function () {
        return PAUSED;
    },
    addRunOnFrames: function (frames, clearOnRun, callback) {
        for (var i = 0; i < this.frameCallbacks.length; ++i) {
            if (this.frameCallbacks[i] === false) {
                this.frameCallbacks[i] = [0, frames, callback, clearOnRun];
                return i;
            }
        }
        this.frameCallbacks.push([0, frames, callback, clearOnRun]);
        return this.frameCallbacks.length - 1;
    },
    removeRunOnFrames: function (index) {
        this.frameCallbacks[i] = false;
    },
    runOnFrames: function () {
        for (let i = 0; i < this.frameCallbacks.length; ++i) {
            if (this.frameCallbacks[i] === false) {
                continue;
            }
            ++this.frameCallbacks[i][0];
            if (this.frameCallbacks[i][0] === this.frameCallbacks[i][1]) {
                this.frameCallbacks[i][0] = 0;
                var cb = this.frameCallbacks[i][2];
                if (this.frameCallbacks[i][3] === true) {
                    this.frameCallbacks[i] = false;
                }
                // this.frameCallbacks[i][2]();
                cb();
                // if (this.frameCallbacks[i][3] === true) {
                //     this.frameCallbacks[i] = false;
                // }
            }
        }
    },
    requestAnimationFrame: function () {
        requestAnimationFrame(tick);
    }
}
