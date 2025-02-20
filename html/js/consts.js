var wasm;
var QUERYSTRING = window.location.search;
var URLPARAMS = new URLSearchParams(QUERYSTRING);
var IS_MULTIPLAYER = false;
var should_render_tiles = false;

var VIEWPORT =
{
    width: 12,
    height: 12,
};

var ATLAS_IMAGE_SIZE =
{
    x: 3008,
    y: 3008
};

var should3d = false;

var force_redraw = false;

var zoom = 2.2;
var game_mode;
var TILE_SIZE = 16;
var TILE_SCALE = 2;
var TILE_SIZE_SCALED = TILE_SIZE * TILE_SCALE;
var degx = 0;
var degy = 65;