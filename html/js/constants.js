// -----------------------------------------------------------------
// - CONSTANTS
// -----------------------------------------------------------------
var wasm;
var QUERYSTRING = window.location.search;
var URLPARAMS = new URLSearchParams(QUERYSTRING);
var IS_MULTIPLAYER = false;
var should_render_tiles = false;
var VIEWPORT = { width: 14, height: 14 };
var ATLAS_IMAGE_SIZE = { x: 3008, y: 3008 };
// TODO: bad naming convention, should be "should_3d"
var should3d = false;
var force_redraw = false;
var ctrl_down = false;
var zoom = 2;
var game_mode;
var TILE_SIZE = 32;
var TILE_SCALE = 1;
var TILE_SIZE_SCALED = TILE_SIZE * TILE_SCALE;
// TODO: Unclear what this is (it's for 3d)
var degx = 0;
var degy = 65;
var MAX_U32 = 4294967295;
var WC_TAGS = [
    "ui-dockyard", "ui-ocean-battle",
];
var SCREEN_NAMES = [];

// Note: Here because we need to be able to reference it globally
function createEnum()
{
    // Convert arguments to array
    var values = Array.prototype.slice.call(arguments);
    var enumObj = values.reduce(function(obj, key, index) {
        obj[key] = index;
        return obj;
    }, {});
    enumObj.LENGTH = values.length;
    return Object.freeze(enumObj);
}

// Empty function for initializations
var noop = function () {};

// Default webcomponent class
class DEFAULT_WC extends HTMLElement
{
    constructor() { super(); }
    updateHTML(html) { this.innerHTML = html; }
    clearHTML() { this.innerHTML = ''; }
    updateInnerText(text) { this.querySelector("#inner_text").innerHTML = text; }
    getDataIDElement(id) { return this.querySelector(`[data-id="${id}"]`); }
};

// Automatically gets filled in and compiled by C. This is an
// extracted "enum" in C called GameStrings which is exported
// by C to an array so we don't have to manually track the enum
// names and/or values
var GAME_STRINGS = [];
// This stores a map of GAME_STRINGS to normal case and lowercase
// values so they're more readable
// TODO: Update this so you can do something like
// GAME_STRING.id("SOME_ENUM_STRING")
// GAME_STRING.str("SOME_ENUM_STRING") -> normal case
// GAME_STRING.lwr("SOME_ENUM_STRING") -> lower case
var STRINGS = [];
var UNDERSTRINGS = [];
// TODO: Should we "header-ize" structs.js? Eventually, yes, when
// we remove the need for structs to be auto generated to begin with

var CURRENT_SCENE = null;
var OCEAN_BATTLE = null;

// In case we use embedded, single file, HTML, we have two options
var wasmU8 = [];
var wasmBase64 = "";

var INPUT_KEYBOARD = {};
INPUT_KEYBOARD.listen = noop;

var CAMERA = {};
CAMERA.moveUp = noop;
CAMERA.moveDown = noop;
CAMERA.moveLeft = noop;
CAMERA.moveRight = noop;

// Coordinate values to easily reference for atlas stuff
var ATLAS_COORDS = {};
// For world layers to map to coordinate values in the atlas
var LAYER_ATLAS_MAP = {};

// Global game data as dataviews or uint32 views or whatever
var INVENTORY = [];
var WORLD = [];
var CAPTAIN = [];
var BASE_SHIP = [];
var NPC = [];
var SHIP_MATERIAL = [];
var GOOD = [];
var ARMOR = [];
var WEAPON = [];
var SPECIAL_ITEM = [];
var FIGUREHEAD = [];
var CANNON = [];
var FLEET = [];
var LAYER = [];
var PLAYER = {};
PLAYER.updateData = noop;

// TODO: Uncomment when ready
/*
var = UI_OCEAN_BATTLE = {};
UI_OCEAN_BATTLE.data.rendered = false;
UI_OCEAN_BATTLE.data.initialized = false;
UI_OCEAN_BATTLE.data.component = false;
// TODO: Object variables
UI_OCEAN_BATTLE.initialize = noop;
UI_OCEAN_BATTLE.render = noop;
UI_OCEAN_BATTLE.exit = noop;
UI_OCEAN_BATTLE.html = noop;
TODO: Other html functions we need
TODO: Convert current isPlayersTurn to wasm.exports.isPlayersTurn
UI_OCEAN_BATTLE.highlighValidMoves = noop;
UI_OCEAN_BATTLE.cancelMove = noop;
UI_OCEAN_BATTLE.moveWorldNPCTo = function (x, y) {};
UI_OCEAN_BATTLE.cancelMove = noop;
UI_OCEAN_BATTLE.endMove = noop;
UI_OCEAN_BATTLE.endTurn = noop;
UI_OCEAN_BATTLE.takeNPCTurn = function (move_anim_done, attack_anim_done) {};
UI_OCEAN_BATTLE.buttonHover = function (element) {};
UI_OCEAN_BATTLE.buttonNotHover = function (element) {};
UI_OCEAN_BATTLE.render = noop;
*/


// TODO: UI_SHIPYARD
/*
var UI_SHIPYARD = {};
UI_SHIPYARD.data.rendered = false;
UI_SHIPYARD.data.initialized = false;
UI_SHIPYARD.data.component = false;
UI_SHIPYARD.data.scene = null;
UI_SHIPYARD.ships_prefab = [];
UI_SHIPYARD.remodel_ship = null;
UI_SHIPYARD.initialize = noop;
UI_SHIPYARD.render = noop;
UI_SHIPYARD.exit = noop;
// TODO: Other html functions we need
// TODO: This function should actually be
// wasm.exports.clear_remodel_ship or whatever
UI_SHIPYARD.clearRemodelData = noop;
UI_SHIPYARD.remodelSpace = function (event) {};
UI_SHIPYARD.remodelMaterial = function (event) {};
UI_SHIPYARD.remodelFigurehead = function (event) {};
UI_SHIPYARD.remodelCannons = function (event) {};
// TODO: What the hell are these function names? Fix it up
UI_SHIPYARD.doRemodelShip = function (event) {};
UI_SHIPYARD.remodelShip = noop;
UI_SHIPYARD.buildNewShip = noop;
UI_SHIPYARD.buyUsedShip = noop;
UI_SHIPYARD.buyShip = function (prefab_ship_id) {};
*/
class WC_SHIPYARD extends DEFAULT_WC {};
// TODO: Uncomment when ready
// customElements.define("ui-shipyard", WC_SHIPYARD);

// TODO: UI_BLACKJACK
/*
var UI_BLACKJACK = {};
UI_BLACKJACK.data.rendered = false;
UI_BLACKJACK.data.initialized = false;
UI_BLACKJACK.data.component = false;
UI_BLACKJACK.data.scene = null;
UI_BLACKJACK.initialize = noop;
UI_BLACKJACK.render = noop;
UI_BLACKJACK.exit = noop;
// TODO: Other html functions need
*/
class WC_BLACKJACK extends DEFAULT_WC {};
// TODO: Uncomment when ready
// customElements.define("ui-blackjack", WC_BLACKJACK);

// TODO: UI_MENU_BAR
/*
var UI_MENU_BAR = {};
UI_MENU_BAR.data.initialized = false;
UI_MENU_BAR.data.rendered = false;
UI_MENU_BAR.data.layer_mode = null;
UI_MENU_BAR.data.active_layer_id = null;
UI_MENU_BAR.data.active_layer_name_id = null;
UI_MENU_BAR.data.current_atlas_x = 0;
UI_MENU_BAR.data.current_atlas_y = 0;
UI_MENU_BAR.initialize = noop;
UI_MENU_BAR.render = noop;
UI_MENU_BAR.exit = noop;
// TODO: Other html functions need
UI_MENU_BAR.updateTime = noop;
UI_MENU_BAR.togglePause = noop;
UI_MENU_BAR.viewportMouseMove = function (data) {};
UI_MENU_BAR.viewportMouseDown = function (data) {};
UI_MENU_BAR.setModeToPull = noop;
UI_MENU_BAR.setModeToSet = noop;
UI_MENU_BAR.setActiveLayer = function (layer_id) {};
UI_MENU_BAR.increaseAtlasX = noop;
UI_MENU_BAR.increaseAtlasY = noop;
UI_MENU_BAR.decreaseAtlasX = noop;
UI_MENU_BAR.decreaseAtlasY = noop;
*/
class WC_MENU_BAR extends DEFAULT_WC {};
// TODO: Uncomment when ready
// customElements.define("ui-menu-bar", WC_MENU_BAR);

// TODO: UI_BANK
/*
var UI_BANK = {};
UI_BANK.data.initialized = false;
UI_BANK.data.rendered = false;
UI_BANK.data.scene = null;
UI_BANK.data.bank = null;
UI_BANK.initialize = noop;
UI_BANK.render = noop;
UI_BANK.exit = noop;
// TODO: Other html functions need
UI_BANK.deposit = noop;
UI_BANK.takeLoan = noop;
UI_BANK.payLoan = noop;
UI_BANK.withdraw = noop;
*/
class WC_BANK extends DEFAULT_WC {};
// TODO: Uncomment when ready
// customElements.define("ui-bank", WC_BANK);

// TODO: UI_GENERAL_SHOP
/*
var UI_GENERAL_SHOP = {};
UI_GENERAL_SHOP.data.initialized = false;
UI_GENERAL_SHOP.data.rendered = false;
UI_GENERAL_SHOP.data.scene = null;
UI_GENERAL_SHOP.data.inventory = null;
UI_GENERAL_SHOP.data.inventory_items = null;
UI_GENERAL_SHOP.initialize = noop;
UI_GENERAL_SHOP.render = noop;
UI_GENERAL_SHOP.exit = noop;
// TODO: Other html functions need
UI_GENERAL_SHOP.updateTotalPrice = noop;
UI_GENERAL_SHOP.buyItems = noop;
*/
class WC_GENERAL_SHOP extends DEFAULT_WC {};
// TODO: Uncomment when ready
// customElements.define("ui-general-shop", WC_GENERAL_SHOP);

// TODO: UI_GOODS_SHOP
class WC_GOODS_SHOP extends DEFAULT_WC {};
/*
var UI_GOODS_SHOP = {};
UI_GOODS_SHOP.data.initialized = false;
UI_GOODS_SHOP.data.rendered = false;
UI_GOODS_SHOP.data.scene = null;
UI_GOODS_SHOP.data.inventory = null;
UI_GOODS_SHOP.data.inventory_items = null;
UI_GOODS_SHOP.initialize = noop;
UI_GOODS_SHOP.render = noop;
UI_GOODS_SHOP.exit = noop;
// TODO: Other html functions need
UI_GOODS_SHOP.updateGoodQuantity = function (id) {};
UI_GOODS_SHOP.buyGood = function (id) {};
UI_GOODS_SHOP.addCargoToShip = function (element) {};
UI_GOODS_SHOP.whichShip = noop;
UI_GOODS_SHOP.buy = noop;
*/
// TODO: Uncomment when ready
// customElements.define("ui-goods-shop", WC_GOODS_SHOP);

// TODO: UI_SAILING_MENU
/*
var UI_SAILING_MENU = {};
UI_SAILING_MENU.data.initialized = false;
UI_SAILING_MENU.data.rendered = false;
UI_SAILING_MENU.data.scene = null;
UI_SAILING_MENU.data.inventory = null;
UI_SAILING_MENU.data.inventory_items = null;
UI_SAILING_MENU.initialize = noop;
UI_SAILING_MENU.render = noop;
UI_SAILING_MENU.exit = noop;
// TODO: Other html functions need
*/
class WC_SAILING_MENU extends DEFAULT_WC {};
// TODO: Uncomment when ready
// customElements.define("ui-sailing-menu", WC_SAILING_MENU);

// TODO: GAME_HELPER (gh)
var total_world_npcs = 0;
var npcs_slots = 0;
var world_npcs = [];
var total_world_entities = 0;
var entities_slots = [];
var world_entities =[];