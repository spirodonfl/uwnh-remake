// -----------------------------------------------------------------
// - UI PLAYER MENU
// -----------------------------------------------------------------
class WC_PLAYER_MENU extends DEFAULT_WC {};
customElements.define("ui-player-menu", WC_PLAYER_MENU);
var UI_PLAYER_MENU = {};
UI_PLAYER_MENU.initialize = function ()
{
    if (this.initialized) { return; }
    this.data.rendered = false;
    this.data.component = document.querySelector('ui-player-menu');
    this.data.initialized = true;
    this.render();
}
UI_PLAYER_MENU.html_inventory_items = function ()
{
    var html = '';
    for (var i = 0; i < PLAYER.inventory_items.length; ++i)
    {
        if (!is_sentry(PLAYER.inventory_items[i]))
        {
            var ii = PLAYER.inventory_items[i];
            html += `<div>${ii.name} [${ii.number_held}]</div>`;
        }
    }
    return html;
}
UI_PLAYER_MENU.html_ships = function ()
{
    var html = '';
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
    return html;
}
UI_PLAYER_MENU.html = function ()
{
    var inventory_items_list = this.html_inventory_items();
    var ships_list = this.html_ships();
    var gold = wasm.exports.get_player_gold(0);
    var total_inventory_items = PLAYER.inventory.total_items;
    var leadership = PLAYER.stats.leadership;
    var seamanship = PLAYER.stats.seamanship;
    var total_ships_in_fleet = PLAYER.fleet.total_ships;
    var html = `
    <div id="player_menu" class="popup topleft">
        <div>Gold: ${gold}</div>
        <div>${total_inventory_items} Items In Inventory</div>
        ${inventory_items_list}
        <hr/>
        <div>Player Stats</div>
        <div>- Leadership: ${leadership}</div>
        <div>- Seamanship: ${seamanship}</div>
        <hr/>
        <div>Ships In Fleet: ${total_ships_in_fleet}</div>
        ${ships_list}
        <div>
            <button onclick="UI_PLAYER_MENU.exit();">Exit</button>
        </div>
    </div>
    `;
    return html;
}
UI_PLAYER_MENU.render = function ()
{
    if (this.data.rendered) { return; }
    this.data.rendered = true;
    // TODO: Go look at goods across all ships (lay out which ships goods are in)
    // TODO: View captains along with you (skills, assignments, ship captaining, monthly wage)
    // TODO: General things like -> total monthly costs (crew + captains) or ships that need repairs or low on supplies
    // TODO: Personal stats
    // TODO: Equipped armor / weapons
    // TODO: Any special items you can use or special actions to take?
    this.data.component.updateHTML(this.html());
}
UI_PLAYER_MENU.exit = function ()
{
    wasm.exports.exit_player_menu();
    this.data.rendered = false;
    this.data.initialized = false;
    this.data.component.clearHTML();
}