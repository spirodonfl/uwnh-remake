var UI_PLAYER_MENU =
{
    // TODO: If you hit the start button while this is open, close it and free it up
    data: null,
    rendered: false,
    initialized: false,
    initialize: function ()
    {
        if (!this.initialized)
        {
            this.initialized = true;
        }
    },
    render: function ()
    {
        // TODO: This probably runs here too often, honestly. Reduce runs
        PLAYER.updateData();
        if (!this.rendered)
        {
            var html = `<div id="player_menu"
                style="max-width: fit-content;
                position: absolute;
                top: 0px;
                background-color: rgba(0, 0, 0, 0.7);
                padding: 10px;">`;
            html += `<div>Gold: ${wasm.exports.get_player_gold(0)}</div>`;
            html += `<div>${PLAYER.inventory.total_items} Items In Inventory</div>`;
            for (var i = 0; i < PLAYER.inventory_items.length; ++i)
            {
                if (!is_sentry(PLAYER.inventory_items[i]))
                {
                    var ii = PLAYER.inventory_items[i];
                    html += `<div>${ii.name} [${ii.number_held}]</div>`;
                }
            }
            html += `<div>Player Stats</div>`;
            html += `<div>- Leadership: ${PLAYER.stats.leadership}</div>`;
            html += `<div>- Seamanship: ${PLAYER.stats.seamanship}</div>`;
            html += `<div>------</div>`;
            html += `<div>Ships In Fleet: ${PLAYER.fleet.total_ships}</div>`;
            for (var i = 0; i < PLAYER.fleet_ships.length; ++i)
            {
                if (!is_sentry(PLAYER.fleet_ships[i]))
                {
                    var fi = PLAYER.fleet_ships[i];
                    html += `<div>${fi.name_string}</div>`;
                    html += `<div>- Total Cargo Items: ${fi.ship.total_cargo_goods}</div>`;
                    html += `<div>- Tacking: ${fi.ship.tacking}</div>`;
                    html += `<div>- Power: ${fi.ship.power}</div>`;
                    html += `<div>- Speed: ${fi.ship.speed}</div>`;
                }
            }
            // TODO: Go look at goods across all ships (lay out which ships goods are in)
            // TODO: View captains along with you (skills, assignments, ship captaining, monthly wage)
            // TODO: General things like -> total monthly costs (crew + captains) or ships that need repairs or low on supplies
            // TODO: Personal stats
            // TODO: Equipped armor / weapons
            // TODO: Any special items you can use or special actions to take?
            html += `<div><button class="red" onclick="UI_PLAYER_MENU.exit();">Exit</button></div>`;
            html += `</div>`;
            document.getElementById("player_menu").outerHTML = html;
            this.rendered = true;
        }
    },
    exit: function ()
    {
        document.getElementById("player_menu").outerHTML = `<div id="player_menu"></div>`;
        gh.current.game_mode = GAME_STRINGS.indexOf("GAME_MODE_IN_PORT");
        this.rendered = false;
    }
};