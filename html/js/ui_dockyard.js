// -----------------------------------------------------------------
// - UI DOCKYARD
// -----------------------------------------------------------------
class WC_DOCKYARD extends DEFAULT_WC {};
customElements.define("ui-dockyard", WC_DOCKYARD);
function ui_dockyard_initialize()
{
    if (CURRENT_SCENE !== null && CURRENT_SCENE.INITIALIZED === 1) { return; }
    if (CURRENT_SCENE !== null && CURRENT_SCENE.RENDERED === 1) { return; }
    CURRENT_SCENE = new GAME_DATA_SCENE_DOCKYARD(wasm.exports);
    CURRENT_SCENE.INITIALIZED = false;
    CURRENT_SCENE.RENDERED = false;
    CURRENT_SCENE.LAST_INPUT_MODE = false;
    CURRENT_SCENE.DEFAULT_ELEMENT = false;
    CURRENT_SCENE.COMPONENT = document.querySelector("ui-dockyard");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.removeListener("ui-dockyard");
    INPUT_SERVER.addListener(
        "ui-dockyard", ui_scene_default_input_listener
    );
    ui_dockyard_screen_home();
}
function ui_dockyard_exit()
{
    INPUT_SERVER.removeListener("ui-dockyard");
    CURRENT_SCENE.COMPONENT.clearHTML();
    CURRENT_SCENE = null;
    wasm.exports.scene_dockyard_exit();
}
function ui_dockyard_screen_home()
{
    if (CURRENT_SCENE.RENDERED === 1) { return; }
    CURRENT_SCENE.ACTIONS = {
        "supply": function ()
        {
            CURRENT_SCENE.RENDERED = 0;
            ui_dockyard_screen_supply_home();
        },
        "set_sail": function () { ui_dockyard_screen_set_sail(); },
        "cancel": function () { ui_dockyard_exit(); },
    };
    var fleet_id = PLAYER.fleet.id;
    var total_food = wasm.exports.get_fleet_total_food(fleet_id);
    var total_water = wasm.exports.get_fleet_total_water(fleet_id);
    var total_cannonballs = wasm.exports.get_fleet_total_cannonballs(fleet_id);
    var html = `
        <div id="dockyard" class="popup topleft">
            <div class="inner_text">
                Are you wishing to set sail?
            </div>
            <div>
                <div>Total Food: ${total_food}</div>
                <div>Total Water: ${total_water}</div>
                <div>Total Cannonballs: ${total_cannonballs}</div>
            </div>
            <div id="dialog_choices">
                <button
                    ${DEFAULT_INPUT_ACTIONS}
                    nav-down="set_sail"
                    data-id="supply">Supply</button>
                <button
                    ${DEFAULT_INPUT_ACTIONS}
                    nav-up="supply"
                    nav-down="cancel"
                    data-id="set_sail">Set Sail</button>
                <button
                    class="hover"
                    ${DEFAULT_INPUT_ACTIONS}
                    nav-up="set_sail"
                    data-id="cancel">Cancel</button>
            </div>
        </div>
    `;
    CURRENT_SCENE.DEFAULT_ELEMENT = "cancel";
    CURRENT_SCENE.COMPONENT.updateHTML(html);
    CURRENT_SCENE.RENDERED = 1;
}
function ui_dockyard_screen_set_sail()
{
    INPUT_SERVER.removeListener("ui-dockyard");
    CURRENT_SCENE.COMPONENT.clearHTML();
    CURRENT_SCENE = null;
    wasm.exports.scene_dockyard_set_sail();
}
function ui_dockyard_screen_supply_home()
{
    if (CURRENT_SCENE.RENDERED === 1) { return; }
    CURRENT_SCENE.ACTIONS = {
        "supply_ship": function ()
        {
            var element = CURRENT_SCENE.COMPONENT.querySelector(".hover");
            var data_id = element.getAttribute("data-ship-id");
            var ship_id = parseInt(data_id);
            wasm.exports.scene_dockyard_set_purchase_for_ship_id(ship_id);
            CURRENT_SCENE.RENDERED = 0;
            ui_dockyard_screen_supply_ship();
        },
        "cancel": function ()
        {
            CURRENT_SCENE.RENDERED = 0;
            ui_dockyard_screen_home();
        },
    };
    var style_grid = `
        display: grid;
        grid-template-columns: 20% 20% 20% 20% 20%;
        justify-items: center;
        align-items: center;
    `;
    var ships_list = ``;
    var last_ship_id = 0;
    var ship_ids = [];
    var max_ships = PLAYER.fleet_ships.length;
    for (var fs = 0; fs < max_ships; ++fs)
    {
        var fleet_ship = PLAYER.fleet_ships[fs];
        var ship = fleet_ship.ship;
        var data_id = `supply_ship_${ship.id}`;
        ship_ids.push(data_id);
        last_ship_id = ship.id;
    }
    for (var fs = 0; fs < max_ships; ++fs)
    {
        var fleet_ship = PLAYER.fleet_ships[fs];
        var ship = fleet_ship.ship;
        var used_space = wasm.exports.get_ship_used_cargo_space(ship.id);
        var max_space = wasm.exports.get_ship_max_cargo_space(ship.id);
        var food = wasm.exports.get_ship_total_food(ship.id);
        var water = wasm.exports.get_ship_total_water(ship.id);
        var cannonballs = wasm.exports.get_ship_total_cannonballs(ship.id);
        var nav_up = "";
        var nav_down = "";
        if (fs > 0)
        {
            nav_up = ship_ids[(fs - 1)];
        }
        if (fs < (max_ships - 1))
        {
            nav_down = ship_ids[(fs + 1)];
        }
        if (fs === (max_ships - 1))
        {
            nav_down = "cancel";
        }
        ships_list += `
            <div
                ${DEFAULT_INPUT_ACTIONS}
                data-id="${data_id}"
                data-ship-id="${ship.id}"
                data-action-id="supply_ship"
                class="table_row_cell"
                nav-down="${nav_down}"
                nav-up="${nav_up}"
                style="${style_grid}"
            >
                <div>${ship.getName()}</div>
                <div>${used_space} / ${max_space}</div>
                <div>${food}</div>
                <div>${water}</div>
                <div>${cannonballs}</div>
            </div>
        `;
    }
    var html = `
        <div id="dockyard" class="popup topleft">
            <div class="inner_text">
                Choose a ship to supply
            </div>
            <div>
                <div style="${style_grid}">
                    <div>Ship</div>
                    <div>Cargo Space</div>
                    <div>Food</div>
                    <div>Water</div>
                    <div>Cannonballs</div>
                </div>
                ${ships_list}
            </div>
            <div id="dialog_choices">
                <button
                    ${DEFAULT_INPUT_ACTIONS}
                    class="hover"
                    nav-up="supply_ship_${last_ship_id}"
                    data-id="cancel">Cancel</button>
            </div>
        </div>
    `;
    CURRENT_SCENE.DEFAULT_ELEMENT = "cancel";
    CURRENT_SCENE.COMPONENT.updateHTML(html);
    CURRENT_SCENE.RENDERED = 1;
}
function ui_dockyard_screen_supply_ship_modify_supply(type, direction) {
    var actions = {
        food: {
            increase: wasm.exports.scene_dockyard_increase_purchase_food,
            decrease: wasm.exports.scene_dockyard_decrease_purchase_food,
            get_total: wasm.exports.get_ship_total_food
        },
        water: {
            increase: wasm.exports.scene_dockyard_increase_purchase_water,
            decrease: wasm.exports.scene_dockyard_decrease_purchase_water,
            get_total: wasm.exports.get_ship_total_water
        },
        cannonballs: {
            increase: wasm.exports.scene_dockyard_increase_purchase_cannonballs,
            decrease: wasm.exports.scene_dockyard_decrease_purchase_cannonballs,
            get_total: wasm.exports.get_ship_total_cannonballs
        }
    };
    
    var change = actions[type][direction]();
    if (change === -1) { return; }
    
    var ship_id = CURRENT_SCENE.purchase_for_ship_id;
    var total = actions[type].get_total(ship_id);
    CURRENT_SCENE.COMPONENT
        .querySelector("#supply_" + type)
        .innerHTML = total + change;
    
    ui_dockyard_screen_supply_ship_update_cargo_space();
}
function ui_dockyard_screen_supply_ship_update_cargo_space()
{
    var ship_id = CURRENT_SCENE.purchase_for_ship_id;
    var used_space = wasm.exports.scene_dockyard_ship_intended_used_space();
    var max_space = wasm.exports.get_ship_max_cargo_space(ship_id);
    CURRENT_SCENE.COMPONENT
        .querySelector("#cargo_space")
        .innerHTML = `Cargo Space: ${used_space} / ${max_space}`;
}
function ui_dockyard_screen_supply_ship()
{
    if (CURRENT_SCENE.RENDERED === 1) { return; }
    CURRENT_SCENE.ACTIONS = {
        "increase_food": function ()
        {
            ui_dockyard_screen_supply_ship_modify_supply("food", "increase");
        },
        "decrease_food": function ()
        {
            ui_dockyard_screen_supply_ship_modify_supply("food", "decrease");
        },
        "increase_water": function ()
        {
            ui_dockyard_screen_supply_ship_modify_supply("water", "increase");
        },
        "decrease_water": function ()
        {
            ui_dockyard_screen_supply_ship_modify_supply("water", "decrease");
        },
        "increase_cannonballs": function ()
        {
            ui_dockyard_screen_supply_ship_modify_supply("cannonballs", "increase");
        },
        "decrease_cannonballs": function ()
        {
            ui_dockyard_screen_supply_ship_modify_supply("cannonballs", "decrease");
        },
        "supply_ship": function ()
        {
            var purchase = wasm.exports.scene_dockyard_purchase();
            if (purchase === 1)
            {
                CURRENT_SCENE.RENDERED = 0;
                ui_dockyard_screen_supply_home();
                wasm.exports.scene_reset_supply_ship();
                CURRENT_SCENE
                    .COMPONENT
                    .querySelector(".inner_text")
                    .innerHTML = STRINGS[GAME_STRINGS[CURRENT_SCENE.dialog_id]];
            }
            else
            {
                CURRENT_SCENE
                    .COMPONENT
                    .querySelector(".inner_text")
                    .innerHTML = STRINGS[GAME_STRINGS[CURRENT_SCENE.error_code]];
            }
        },
        "cancel": function ()
        {
            CURRENT_SCENE.RENDERED = 0;
            ui_dockyard_screen_supply_home();
        },
    };
    var input_actions = "nav-keydown nav-pointerup action-keyup action-pointerup";
    var ship_id = CURRENT_SCENE.purchase_for_ship_id;
    var available_space = wasm.exports.get_ship_available_cargo_space(ship_id);
    var max_space = wasm.exports.get_ship_max_cargo_space(ship_id);
    var used_space = max_space - available_space;
    var ship = new GAME_DATA_SHIP(wasm.exports, [
        CURRENT_SCENE.purchase_for_ship_id
    ]);
    var manage_html = ``;
    var types = ["Food", "Water", "Cannonballs"];
    var values = [
        wasm.exports.get_ship_total_food(ship_id),
        wasm.exports.get_ship_total_water(ship_id),
        wasm.exports.get_ship_total_cannonballs(ship_id)
    ];
    for (var t = 0; t < types.length; ++t)
    {
        var lower = types[t].toLowerCase();
        var value = values[t];
        var previous = "";
        var next = "";
        if (t > 0)
        {
            previous = types[(t - 1)].toLowerCase();
        }
        if (t < (types.length - 1))
        {
            next = types[(t + 1)].toLowerCase();
        }
        var nav = {
            increase: {
                right: `decrease_${lower}`,
                down: `increase_${next}`,
                up: `increase_${previous}`,
                style: `${atlasToStyle("icon_up_arrow", 4, 1)}`,
            },
            decrease: {
                left: `increase_${lower}`,
                down: `decrease_${next}`,
                up: `decrease_${previous}`,
                style: `${atlasToStyle("icon_down_arrow", 4, 1)}`,
            },
        };
        if (t === (types.length - 1))
        {
            nav.increase.down = "supply_ship";
            nav.decrease.down = "supply_ship";
        }
        manage_html += `
            <div style="display: grid; grid-auto-flow: column; grid-template-columns: 40% 20% 20% 20%;">
                <div>${types[t]}</div>
                <div
                    ${input_actions}
                    nav-right="${nav.increase.right}"
                    nav-down="${nav.increase.down}"
                    nav-up="${nav.increase.up}"
                    data-id="increase_${lower}"
                    class="icon_button"
                    style="${nav.increase.style}"></div>
                <div id="supply_${lower}">${value}</div>
                <div
                    ${input_actions}
                    nav-left="${nav.decrease.left}"
                    nav-up="${nav.decrease.up}"
                    nav-down="${nav.decrease.down}"
                    data-id="decrease_${lower}"
                    class="icon_button"
                    style="${nav.decrease.style}"></div>
            </div>
        `;
    }
    var html = `
        <div id="dockyard" class="popup topleft">
            <div class="inner_text">
                Supply stuff for this ship
            </div>
            <div>
                <div>${ship.getName()}</div>
                <div id="cargo_space">
                    Cargo Space: ${used_space} / ${max_space}
                </div>
                ${manage_html}
            </div>
            <div id="dialog_choices">
                <button
                    ${input_actions}
                    nav-up="increase_cannonballs"
                    nav-down="cancel"
                    data-id="supply_ship">Supply Ship</button>
                <button
                    ${input_actions}
                    nav-up="supply_ship"
                    data-id="cancel" class="hover">Cancel</button>
            </div>
        </div>
    `;
    CURRENT_SCENE.DEFAULT_ELEMENT = "cancel";
    CURRENT_SCENE.COMPONENT.updateHTML(html);
    CURRENT_SCENE.RENDERED = 1;
}