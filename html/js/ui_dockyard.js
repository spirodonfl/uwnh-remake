class UI_DOCKYARD extends HTMLElement
{
    // TODO: This. You're about to set sail. You need
    // to make sure you have supplies
    // cannons
    // water
    // food
    // enough men to drive your fleet
    // calculate rough time you can travel on water
    // button -> set sail -> what entity does right now
    constructor()
    {
        super();
        this.data = {
            scene: null,
        };
        this.initialized = false;
        this.rendered = false;
    }
    initialize()
    {
        if (!this.initialized)
        {
            this.initialized = true;
            this.rendered = false;
            this.data.scene = new GAME_DATA_SCENE_DOCKYARD(wasm.exports);
            this.render();
        }
    }
    render()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var qs = `document.querySelector('ui-dockyard')`;
        var fleet_id = PLAYER.fleet.id;
        var good_food_id = wasm.exports.find_storage_good_by_name_id(GAME_STRINGS.indexOf("GOOD_FOOD"));
        var total_food = wasm.exports.get_good_qty_from_fleet_ships(good_food_id, fleet_id);
        var good_water_id = wasm.exports.find_storage_good_by_name_id(GAME_STRINGS.indexOf("GOOD_WATER"));
        var total_water = wasm.exports.get_good_qty_from_fleet_ships(good_water_id, fleet_id);
        var good_cannonbals_id = wasm.exports.find_storage_good_by_name_id(GAME_STRINGS.indexOf("GOOD_CANNONBALLS"));
        var total_cannonballs = wasm.exports.get_good_qty_from_fleet_ships(good_cannonbals_id, fleet_id);
        var html = `
        <div id="dockyard" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    Are you wishing to set sail?
                </div>
                <div style="margin-bottom: 10px;">
                    <div>Total Food: ${total_food}</div>
                    <div>Total Water: ${total_water}</div>
                    <div>Total Cannonballs: ${total_cannonballs}</div>
                </div>
                <div id="dialog_choices">
                    <button 
                        class="positive"
                        onclick="${qs}.supply()"
                    >Supply</button>
                    <button 
                        class="positive"
                        onclick="${qs}.setSail()"
                    >Set Sail</button>
                    <button 
                        class="negative"
                        onclick="${qs}.exit()"
                    >Cancel</button>
                </div>
            </div>
        </div>
        `;
        this.innerHTML = html;
    }
    setSail()
    {
        // TODO: If not enough food or water or some error code from scene to
        // that effect (let the internal scene handle it I think)
        // then show alert that you cannot set sail for some reason
        // otherwise go to globe_world_1
        this.rendered = false;
        this.initialized = false;
        this.innerHTML = ``;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_DOCKYARD_SET_SAIL"));
    }
    supply()
    {
        var qs = `document.querySelector('ui-dockyard')`;
        var ships_list = ``;
        for (var fs = 0; fs < PLAYER.fleet_ships.length; ++fs)
        {
            var fleet_ship = PLAYER.fleet_ships[fs];
            var ship = fleet_ship.ship;
            var available_space = wasm.exports.get_ship_available_cargo_space(ship.id);
            var food = wasm.exports.get_ship_total_food(ship.id);
            var water = wasm.exports.get_ship_total_water(ship.id);
            var cannonballs = wasm.exports.get_ship_total_cannonballs(ship.id);
            ships_list += `
                <div>${ship.getName()}</div>
                <div>${available_space}</div>
                <div><input type="number" value="${food}" /></div>
                <div><input type="number" value="${water}" /></div>
                <div><input type="number" value="${cannonballs}" /></div>
            `;
        }
        var header_style = `
            background-color: rgba(30, 30, 30, 0.6);
            padding: 4px;
        `;
        var headers = [
            'Name', 'Available Capacity', 'Food', 'Water', 'Cannonballs',
        ];
        var headers_html = ``;
        for (var h = 0; h < headers.length; ++h)
        {
            headers_html += `<div style="${header_style}">${headers[h]}</div>`;
        }
        var html = `
        <div id="dockyard" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    Go ahead and supply your ships as you see fit.
                </div>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(5, max-content);
                    grid-gap: 10px;
                    margin-bottom: 10px;
                    "
                >
                    ${headers_html}
                    ${ships_list}
                </div>
                <div id="dialog_choices">
                    <button 
                        class="negative"
                        onclick="${qs}.exitSupply()"
                    >Cancel</button>
                </div>
            </div>
        </div>
        `;
        this.innerHTML = html;
    }
    exitSupply()
    {
        this.rendered = false;
        this.render();
    }
    exit()
    {
        this.rendered = false;
        this.initialized = false;
        this.innerHTML = ``;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_EXIT"));
    }
}
customElements.define("ui-dockyard", UI_DOCKYARD);