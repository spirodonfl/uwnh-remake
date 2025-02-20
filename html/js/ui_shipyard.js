class UI_SHIPYARD extends HTMLElement
{
    constructor()
    {
        super();
        this.data = {
            scene: null,
            ships_prefab: [],
            remodel_ship: null,
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
            this.data.scene = new GAME_DATA_SCENE_SHIPYARD(wasm.exports);
            for (var i = 0; i < this.data.scene.ships_prefab.length; ++i)
            {
                var ship_id = this.data.scene.ships_prefab[i];
                if (!is_sentry(ship_id))
                {
                    this.data.ships_prefab[i] = new GAME_DATA_SHIP(wasm.exports, [ship_id]);
                }
            }
            this.clearRemodelData();
            this.render();
        }
    }
    clearRemodelData()
    {
        this.data.remodel_ship = new GAME_DATA_REMODEL_SHIP(wasm.exports);
        this.data.remodel_ship.material_id = wasm.exports.get_sentry();
        this.data.remodel_ship.cargo_space = wasm.exports.get_sentry();
        this.data.remodel_ship.cannon_space = wasm.exports.get_sentry();
        this.data.remodel_ship.crew_space = wasm.exports.get_sentry();
        this.data.remodel_ship.cannon_type_id = wasm.exports.get_sentry();
        this.data.remodel_ship.figurehead_id = wasm.exports.get_sentry();
        this.data.remodel_ship.total_price = 0;
    }
    render()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var buy_used_ship_click = `document.querySelector('ui-shipyard').buyUsedShip();`;
        var build_new_ship_click = `document.querySelector('ui-shipyard').buildNewShip();`;
        var remodel_ship = `document.querySelector('ui-shipyard').remodelShip();`;
        var html = `
        <div id="shipyard" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    Welcome to the shipyard. How can I help you?
                </div>
                <div id="dialog_choices">
                    <button class="positive" onclick="${buy_used_ship_click}">Buy Used Ship</button>
                    <button class="positive" onclick="${build_new_ship_click}">Build New Ship</button>
                    <button class="positive" onclick="${remodel_ship}">Remodel</button>
                    <button class="neutral">Sell Ship</button>
                    <button class="negative" onclick="document.querySelector('ui-shipyard').exit();">Cancel</button>
                </div>
            </div>
        </div>
        `;
        this.innerHTML = html;
    }
    remodelSpace(event)
    {
        var ship_id = parseInt(event.target.dataset.shipId);
        var this_ship = PLAYER.fleet_ships[ship_id].ship;
        var cannon_space = this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_ship_cannon_space`
        ).value;
        cannon_space = parseInt(cannon_space);
        if (cannon_space > 0)
        {
            this.data.remodel_ship.cannon_space = cannon_space;
        }
        var crew_space = this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_ship_crew_space`
        ).value;
        crew_space = parseInt(crew_space);
        if (crew_space > 0)
        {
            this.data.remodel_ship.crew_space = crew_space;
        }
        var cargo_space = this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_ship_cargo_space`
        ).value;
        cargo_space = parseInt(cargo_space);
        if (cargo_space > 0)
        {
            this.data.remodel_ship.cargo_space = cargo_space;
        }
        wasm.exports.current_scene_take_action(
            GAME_STRINGS.indexOf("ACTION_SHIPYARD_REMODEL_SHIP_SPACE")
        );
        // TODO: If this.data.scene.error_code != SENTRY ...
        this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_price`
        ).innerHTML = this.data.remodel_ship.total_price;
    }
    remodelMaterial(event)
    {
        var ship_id = parseInt(event.target.dataset.shipId);
        if (ship_id !== this.data.scene.remodel_ship_id)
        {
            this.clearRemodelData();
        }
        var this_ship = PLAYER.fleet_ships[ship_id].ship;
        var material_id = this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_ship_material`
        ).value;
        
        this.data.remodel_ship.material_id = parseInt(material_id);
        wasm.exports.current_scene_take_action(
            GAME_STRINGS.indexOf("ACTION_SHIPYARD_REMODEL_SHIP_MATERIAL")
        );

        // TODO: Show the difference between remodel material stats
        //       and the current ships material stats so player can preview

        this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_price`
        ).innerHTML = this.data.remodel_ship.total_price;
        this.data.remodel_ship.material_id = material_id;
    }
    remodelFigurehead(event)
    {
        var ship_id = parseInt(event.target.dataset.shipId);
        if (ship_id !== this.data.scene.remodel_ship_id)
        {
            this.clearRemodelData();
        }
        var this_ship = PLAYER.fleet_ships[ship_id].ship;
        var figurehead_id = this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_ship_figurehead`
        ).value;
        
        this.data.remodel_ship.figurehead_id = parseInt(figurehead_id);
        wasm.exports.current_scene_take_action(
            GAME_STRINGS.indexOf("ACTION_SHIPYARD_REMODEL_SHIP_FIGUREHEAD")
        );

        this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_price`
        ).innerHTML = this.data.remodel_ship.total_price;
        this.data.remodel_ship.figurehead_id = figurehead_id;
    }
    remodelCannons(event)
    {
        var ship_id = parseInt(event.target.dataset.shipId);
        if (ship_id !== this.data.scene.remodel_ship_id)
        {
            this.clearRemodelData();
        }
        var this_ship = PLAYER.fleet_ships[ship_id].ship;
        var cannon_type_id = this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_ship_cannon_type`
        ).value;
        
        this.data.remodel_ship.cannon_type_id = parseInt(cannon_type_id);
        wasm.exports.current_scene_take_action(
            GAME_STRINGS.indexOf("ACTION_SHIPYARD_REMODEL_SHIP_CANNON_TYPE")
        );

        this.querySelector(
            `[data-ship-id="${ship_id}"].remodel_price`
        ).innerHTML = this.data.remodel_ship.total_price;
        this.data.remodel_ship.cannon_type_id = cannon_type_id;
    }
    doRemodelShip(event)
    {
        var ship_id = parseInt(event.target.dataset.shipId);
        if (ship_id !== this.data.scene.remodel_ship_id)
        {
            console.error("Not remodeling the same ship you started to");
        }
        else
        {
            var this_ship = PLAYER.fleet_ships[ship_id].ship;
            this.data.scene.remodel_ship_id = ship_id;
            if (
                !is_sentry(this.data.remodel_ship.crew_space)
                &&
                this.data.remodel_ship.crew_space < this_ship.crew_space)
            {
                var leftover = this_ship.crew_space - this.data.remodel_ship.crew_space;
                alert(`I will have to dismiss ${leftover} crew members.`);
            }
            wasm.exports.current_scene_take_action(
                GAME_STRINGS.indexOf("ACTION_SHIPYARD_REMODEL_SHIP")
            );
            if (is_sentry(this.data.scene.error_code))
            {
                // Re-render the UI for remodeling ships
                this.remodelShip();
            }
        }
    }
    remodelShip()
    {
        this.clearRemodelData();
        var max_cannon_types = wasm.exports.get_max_cannons();
        var cannons = [];
        var cannon_opts = ``;
        cannon_opts += `<option value="${wasm.exports.get_sentry()}">NONE</option>`;
        for (var i = 0; i < max_cannon_types; ++i)
        {
            var data = new GAME_DATA_CANNON(wasm.exports, [i]);
            if (!is_sentry(data.name_id))
            {
                cannons.push(data);
                cannon_opts += `<option value="${i}">${data.getName()}</option>`;
            }
        }
        var max_figurehead_types = wasm.exports.get_max_figureheads();
        var figureheads = [];
        var figurehead_opts = ``;
        figurehead_opts += `<option value="${wasm.exports.get_sentry()}">NONE</option>`;
        for (var i = 0; i < max_figurehead_types; ++i)
        {
            var data = new GAME_DATA_FIGUREHEAD(wasm.exports, [i]);
            if (!is_sentry(data.name_id))
            {
                figureheads.push(data);
                figurehead_opts += `<option value="${i}">${data.getName()}</option>`;
            }
        }
        var max_ship_material_types = wasm.exports.get_max_ship_materials();
        var ship_materials = [];
        for (var i = 0; i < max_ship_material_types; ++i)
        {
            var data = new GAME_DATA_SHIP_MATERIAL(wasm.exports, [i]);
            if (!is_sentry(data.name_id))
            {
                ship_materials.push(data);
            }
        }
        var dialog = `Which ship would you like to remodel?`;
        if (this.data.scene.dialog_id === GAME_STRINGS.indexOf("DIALOG_SHIPYARD_REMODEL_SUCCESS"))
        {
            dialog = `Successfully remodeled your ship!`;
        }
        var list = ``;
        var qs = `document.querySelector('ui-shipyard')`;
        for (var i = 0; i < PLAYER.fleet_ships.length; ++i)
        {
            var fleet_ship = PLAYER.fleet_ships[i];
            var ship = fleet_ship.ship;
            var base_ship = ship.base_ship;
            var top_material_id = base_ship.top_material_id;
            var ship_material_opts = ``;
            // TODO: Pre-select the current ships cannon type
            // TODO: Pre-select the current ships figurehead
            // TODO: Pre-select the current ships material
            for (var smi = 0; smi < max_ship_material_types; ++smi)
            {
                if (smi > top_material_id) { break; }
                var data = ship_materials[smi];
                ship_material_opts += `<option value="${smi}">${data.getName()}</option>`;
            }
            list += `<div>${ship.getName()}</div>`;
            list += `<div data-ship-id="${i}" class="remodel_price">0</div>`;
            list += `<div><button data-ship-id="${i}" onclick="${qs}.doRemodelShip(event);">Remodel</button></div>`;
            list += `<div>${ship_materials[top_material_id].getName()}</div>`;
            list += `
            <div>
                <select
                    data-ship-id="${i}"
                    class="remodel_ship_material"
                    onchange="${qs}.remodelMaterial(event);">
                        ${ship_material_opts}
                </select>
            </div>`;
            list += `<div>${ship.speed}</div>`;
            list += `<div>${ship.capacity}</div>`;
            list += `<div>${ship.tacking}</div>`;
            list += `<div>${ship.power}</div>`;
            list += `<div>${ship.durability}</div>`;
            list += `
            <div>
                <input
                    data-ship-id="${i}"
                    class="remodel_ship_crew_space"
                    onchange="${qs}.remodelSpace(event);"
                    type="number"
                    value="${ship.crew_space}"
                /> / ${ship.capacity}
            </div>`;
            list += `
            <div>
                <input
                    data-ship-id="${i}"
                    class="remodel_ship_cargo_space"
                    onchange="${qs}.remodelSpace(event);"
                    type="number"
                    value="${ship.cargo_space}"
                /> / ${ship.capacity}
            </div>`;
            list += `
            <div>
                <input
                    data-ship-id="${i}"
                    class="remodel_ship_cannon_space"
                    onchange="${qs}.remodelSpace(event);"
                    type="number"
                    value="${ship.cannon_space}"
                /> / ${ship.capacity}
            </div>`;
            list += `
            <div>
                <select
                    data-ship-id="${i}"
                    class="remodel_ship_cannon_type"
                    onchange="${qs}.remodelCannons(event);">
                    ${cannon_opts}
                </select>
            </div>`;
            list += `
            <div>
                <select
                    data-ship-id="${i}"
                    class="remodel_ship_figurehead"
                    onchange="${qs}.remodelFigurehead(event);">
                    ${figurehead_opts}
                </select>
            </div>`;
        }
        var header_style = `
            background-color: rgba(30, 30, 30, 0.6);
            padding: 4px;
        `;
        var headers = [
            'Name', 'Remodel Price', '&nbsp;', 'Top Material', 'Material',
            'Speed', 'Capacity', 'Tacking', 'Power', 'Durability',
            'Crew Space', 'Cargo Space', 'Cannon Space', 'Cannon Type',
            'Figurehead',
        ];
        var headers_html = ``;
        for (var h = 0; h < headers.length; ++h)
        {
            headers_html += `<div style="${header_style}">${headers[h]}</div>`;
        }
        var html = `
        <div id="shipyard" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    ${dialog}
                </div>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(${headers.length}, max-content);
                    grid-gap: 10px;
                    margin-bottom: 10px;
                    "
                >
                    ${headers_html}
                    ${list}
                </div>
                <div id="dialog_choices">
                    <button 
                        class="negative"
                        onclick="
                            document.querySelector('ui-shipyard').rendered = false;
                            document.querySelector('ui-shipyard').render();
                        "
                    >Cancel</button>
                </div>
            </div>
        </div>
        `;
        this.innerHTML = html;
    }
    buildNewShip()
    {
        //...
    }
    buyUsedShip()
    {
        var dialog = `Which ship would you like to buy?`;
        if (this.data.scene.dialog_id === GAME_STRINGS.indexOf("DIALOG_SHIPYARD_PREFAB_PURCHASE_SUCCESS"))
        {
            dialog = `You have purchased a ship!`;
        }
        var used_ships_list = ``;
        for (var i = 0; i < this.data.ships_prefab.length; ++i)
        {
            if (this.data.ships_prefab[i] === undefined) { continue; }
            var ship = this.data.ships_prefab[i];
            if (is_sentry(ship.id))
            {
                continue;
            }
            ship = new GAME_DATA_SHIP(wasm.exports, [ship.id]);
            var base_ship = new GAME_DATA_BASE_SHIP(wasm.exports, [
                ship.base_ship_id
            ]);
            var top_material = new GAME_DATA_SHIP_MATERIAL(
                wasm.exports,
                [
                    ship.top_material_id
                ]
            );
            var ship_material = new GAME_DATA_SHIP_MATERIAL(
                wasm.exports,
                [
                    ship.ship_material_id
                ]
            );
            var onclick = `
                document.querySelector('ui-shipyard').buyShip(${i});
            `;
            used_ships_list += `
                <div>${ship.getName()}</div>
                <div>${ship.price}</div>
                <div>
                    <button 
                        onclick="${onclick}"
                    >Buy</button>
                </div>
                <div>${top_material.getName()}</div>
                <div>${ship_material.getName()}</div>
                <div>${ship.speed}</div>
                <div>${base_ship.max_capacity}</div>
                <div>${ship.capacity}</div>
                <div>${ship.tacking}</div>
                <div>${ship.power}</div>
                <div>${ship.durability}</div>
                <div>${ship.crew_space}</div>
                <div>${ship.cargo_space}</div>
                <div>${ship.cannon_space}</div>
            `;
        }
        var html = `
        <div id="shipyard" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    Which ship would you like to buy?
                </div>
                <div style="display: grid; grid-template-columns: repeat(14, max-content); grid-gap: 10px; margin-bottom: 10px;">
                    <style>.padded_header{ background-color: rgba(30, 30, 30, 0.6); padding: 4px; }</style>
                    <div class="padded_header">Name</div>
                    <div class="padded_header">Price</div>
                    <div>&nbsp;</div>
                    <div class="padded_header">Top Material</div>
                    <div class="padded_header">Material</div>
                    <div class="padded_header">Speed</div>
                    <div class="padded_header">Max Capacity</div>
                    <div class="padded_header">Capacity</div>
                    <div class="padded_header">Tacking</div>
                    <div class="padded_header">Power</div>
                    <div class="padded_header">Durability</div>
                    <div class="padded_header">Crew Space</div>
                    <div class="padded_header">Cargo Space</div>
                    <div class="padded_header">Cannon Space</div>
                    ${used_ships_list}
                </div>
                <div id="dialog_choices">
                    <button 
                        class="negative"
                        onclick="
                            document.querySelector('ui-shipyard').rendered = false;
                            document.querySelector('ui-shipyard').render();
                        "
                    >Cancel</button>
                </div>
            </div>
        </div>
        `;
        this.innerHTML = html;
    }
    buyShip(prefab_ship_id)
    {
        this.data.scene.buying_prefab_ship_id = prefab_ship_id;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_SHIPYARD_BUY_USED"));
        this.rendered = false;
        this.render();
    }
    exit()
    {
        this.data.ships_prefab = [];
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_EXIT"));
        this.innerHTML = ``;
        this.initialized = false;
    }
};
customElements.define("ui-shipyard", UI_SHIPYARD);