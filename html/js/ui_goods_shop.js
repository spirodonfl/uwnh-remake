class UI_GOODS_SHOP extends HTMLElement
{
    constructor()
    {
        super();
        this.initialized = false;
        this.rendered = false;
        this.data = {
            scene: null,
            inventory: null,
            inventory_items: [],
        };
    }
    initialize()
    {
        if (!this.initialized)
        {
            this.initialized = true;
            this.rendered = false;
            this.data.scene = new GAME_DATA_SCENE_GOODS_SHOP(wasm.exports);
            this.data.inventory = new GAME_DATA_INVENTORY(wasm.exports, [this.data.scene.inventory_id]);
            this.data.inventory_items = [];
            for (var d = 0; d < this.data.inventory.total_items; ++d)
            {
                if (!is_sentry(this.data.inventory.inventory_items[d]))
                {
                    this.data.inventory_items.push(
                        new GAME_DATA_INVENTORY_ITEM(wasm.exports, [
                            this.data.inventory.inventory_items[d]
                        ])
                    );
                }
            }
            this.render();
        }
    }
    updateGoodQuantity(id)
    {
        var quantity = document.getElementById(`goods_shop_${id}`).value;
        var total = quantity * this.data.inventory_items[id].adjusted_price;
        document.getElementById(id).innerText = total;
        if (total > wasm.exports.get_player_gold(0))
        {
            this.querySelector("#your_gold").style.color = "red";
        }
        else
        {
            this.querySelector("#your_gold").style.color = "white";
        }
    }
    buyGood(id)
    {
        // TODO:
        // * Check that you have enough gold (might show this in previous screen)
        // * Check that you have enough cargo space in fleet (again, previous screen)
        // * Show list of ships in fleet and, for each, ship, show current cargo
        //   along with max cargo space
        //   Then apply number of goods to set in each ship
        // * Show total cost of goods
        // * Any other metric that's needed
        // * Finalize purchase
        // * wasm will do final checks and move inventory and all that
        // * success message and go back to goods screen to purchase more goods
        var name_id = this.data.inventory_items[id].name_id;
        var good_id = this.data.inventory_items[id].type_reference;
        wasm.exports.scene_goods_shop_set_intended_good_id(good_id);

        var quantity = document.getElementById(`goods_shop_${id}`).value;
        wasm.exports.scene_goods_shop_set_intended_good_qty(quantity);

        var total = wasm.exports.scene_goods_shop_get_total_good_cost();
        if (total > wasm.exports.get_player_gold(0))
        {
            this.querySelector("#your_gold").style.color = "red";
        }
        else
        {
            this.querySelector("#your_gold").style.color = "white";
            this.rendered = false;
            this.whichShip();
        }
    }
    addCargoToShip(element)
    {
        if (element.previous_value === undefined)
        {
            element.previous_value = 0;
        }
        var response = null;
        for (var fs = 0; fs < PLAYER.fleet_ships.length; ++fs)
        {
            if (PLAYER.fleet_ships[fs].id === element.fleet_ship_id)
            {
                if (element.value_int > element.previous_value)
                {
                    response = wasm.exports.
                        scene_goods_shop_increase_fleet_ship_good_qty(
                            element.fleet_ship_id
                        );
                }
                else
                {
                    response = wasm.exports.
                        scene_goods_shop_decrease_fleet_ship_good_qty(
                            element.fleet_ship_id
                        );
                }
            }
        }
        console.log(response);
    }
    whichShip()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var qs = `document.querySelector('ui-goods-shop')`;
        var columns = [
            "Ship Name",
            "Total Capacity",
            "Available Capacity",
            "LOAD"
        ];
        var columns_html = ``;
        for (var c = 0; c < columns.length; ++c)
        {
            columns_html += `<div style="background-color: rgba(0, 0, 0, 0.3); padding: 2px 4px; border-bottom: 1px solid white;">${columns[c]}</div>`;
        }
        var ships_list = ``;
        for (var fs = 0; fs < PLAYER.fleet_ships.length; ++fs)
        {
            var fleet_ship = PLAYER.fleet_ships[fs];
            var ship = fleet_ship.ship;
            var total_space = ship.capacity;
            var available_space = wasm.exports.get_ship_available_cargo_space(ship.id);
            var cargo_goods_html = ``;
            for (var c = 0; c < ship.cargo_goods.length; ++c)
            {
                if (!is_sentry(ship.cargo_goods[c]))
                {
                    var qty = ship.cargo_goods_qty[c];
                    var good = new GAME_DATA_GOOD(wasm.exports, [ship.cargo_goods[c]]);
                    cargo_goods_html += `<div>${good.getName()}: ${qty}</div>`;
                }
            }
            // Cargo goods would be PLAYER.fleet_ships[0].ship.cargo_goods
            // also PLAYER.fleet_ships[0].ship.cargo_goods_qty
            // TODO: Update the data from this.data.scene
            ships_list += `
                <div>${ship.getName()}</div>
                <div>${total_space}</div>
                <div>${available_space}</div>
                <div>
                    <input
                        type="number"
                        id="fleet_ship_id_${fleet_ship.id}"
                        value="0"
                        class="ship_cargo_loader"
                        onchange="
                            this.fleet_ship_id = ${fleet_ship.id};
                            this.previous_value = this.value_int;
                            this.value_int = parseInt(this.value);
                            ${qs}.addCargoToShip(this);
                        "
                    />
                </div>
                <div class="cargo_test" style="grid-column: 1 / -1; border: 1px solid white; background-color: rgba(0, 0, 0, 0.8); padding: 4px; text-align: center;">
                    <div>Current Cargo</div>
                    <hr />
                    <div style="display: grid; grid-auto-flow: column;">
                        ${cargo_goods_html}
                    </div>
                </div>
            `;
        }
        var item_name = '';
        for (var i = 0; i < this.data.inventory_items.length; ++i)
        {
            var this_inventory_item = this.data.inventory_items[i];
            if (this_inventory_item.type_reference == this.data.scene.intended_good_id)
            {
                item_name = this_inventory_item.getName();
            }
        }
        var qty = this.data.scene.intended_good_qty;
        // TODO: Somehow reduce qty when loaded on ship(s)
        this.innerHTML = `
        <div id="goods_shop" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    Which ships do you want to load your goods into?
                </div>
                <div id="your_gold" style="color: gold;">
                    Your Gold: ${wasm.exports.get_player_gold(0)}
                </div>
                <div id="chosen_inventory_item" style="color: gold;">
                    <div>Item: ${item_name}</div>
                    <div id="remaining">Quantity: ${qty}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(${columns.length}, max-content); margin-bottom: 10px; justify-content: center;">
                    ${columns_html}
                    ${ships_list}
                </div>
                <div id="dialog_choices">
                    <button onclick="${qs}.buy();">Purchase Goods</button>
                    <button 
                        class="negative"
                        onclick="${qs}.cancel();"
                    >Cancel</button>
                </div>
            </div>
        </div>
        `;
    }
    buy()
    {
        var response = null;
        response = wasm.exports.current_scene_take_action(
            GAME_STRINGS.indexOf("ACTION_GOODS_SHOP_BUY")
        );
        console.log(response);
        // if this.data.scene.error_code == SENTRY
        // AND GAME_STRINGS->this.data.scene.dialog_id = DIALOG_GOODS_SHOP_PURCHASED_GOODS
        // good to go!
    }
    render()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var qs = `document.querySelector('ui-goods-shop')`;
        var goods_list = ``;
        for (var i = 0; i < this.data.inventory_items.length; ++i)
        {
            var item = this.data.inventory_items[i];
            goods_list += `<div>${item.getName()}</div>`;
            goods_list += `<div>${item.adjusted_price}</div>`;
            goods_list += `
            <div>
                <input
                    style="width: 60px;"
                    type="number"
                    id="goods_shop_${i}"
                    value="0"
                    min="0"
                    max="${item.quantity}"
                    onchange="${qs}.updateGoodQuantity(${i});"
                />
            </div>
            <div>
                <span id="${i}">${item.quantity * item.adjusted_price}</span>
            </div>
            <div>
                <button
                    onclick="${qs}.buyGood(${i});"
                >Buy</button>
            </div>`;
        }
        var columns = [
            "Name", "Market Price", "&nbsp;", "Total", "&nbsp;"
        ];
        var columns_html = "";
        for (var i = 0; i < columns.length; ++i)
        {
            columns_html += `<div>${columns[i]}</div>`;
        }
        this.innerHTML = `
        <div id="goods_shop" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    Look at our trade goods. A 20% trade tax applies.
                </div>
                <div id="your_gold">
                    Your Gold: ${wasm.exports.get_player_gold(0)}
                </div>
                <div style="display: grid; grid-template-columns: repeat(${columns.length}, max-content); grid-gap: 10px; margin-bottom: 10px;">
                    ${columns_html}
                    ${goods_list}
                </div>
                <div id="dialog_choices">
                    <button 
                        class="negative"
                        onclick="${qs}.cancel();"
                    >Cancel</button>
                </div>
            </div>
        </div>
        `;
    }
    cancel()
    {
        this.rendered = false;
        this.initialized = false;
        this.innerHTML = ``;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_EXIT"));
    }
};
customElements.define("ui-goods-shop", UI_GOODS_SHOP);