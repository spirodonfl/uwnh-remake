class UI_PLAYER_MENU extends HTMLElement
{
    constructor()
    {
        super();
        this.rendered = false;
        this.initialized = false;
    }
    initialize()
    {
        if (!this.initialized)
        {
            this.initialized = true;
            this.render();
        }
    }
    render()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var qs = `document.querySelector('ui-player-menu')`;
        var html = `<div id="player_menu" class="popup topleft">`;
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
                html += `<div>${fi.getName()}</div>`;
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
        html += `<div><button class="red" onclick="${qs}.exit();">Exit</button></div>`;
        html += `</div>`;
        this.innerHTML = html;
    }
    exit()
    {
        wasm.exports.exit_player_menu();
        this.rendered = false;
        this.initialized = false;
        this.innerHTML = "";
    }
};
customElements.define("ui-player-menu", UI_PLAYER_MENU);