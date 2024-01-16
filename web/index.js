import { dom } from "./scripts/dom.js";
import { game } from "./scripts/game.js";
import "./scripts/input.js";
import "./scripts/requestAnimationFrameShim.js";

console.log(game);
dom.initGame();
dom.renderWorld();

