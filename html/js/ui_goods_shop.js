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
        for (var i = 0; i < this.data.inventory_items.length; ++i)
        {
            if (this.data.inventory_items[i].id != id) { continue; }
            var total = quantity * this.data.inventory_items[i].adjusted_price;
            document.getElementById(id).innerText = total;
            break;
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
        var quantity = document.getElementById(`goods_shop_${id}`).value;
        var total = quantity * this.data.inventory_items[id].adjusted_price;
        if (total > wasm.exports.get_player_gold(0))
        {
            alert("You don't have enough gold.");
        }
        // else
        // {
        //     wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_BUY_GOODS"), id, quantity);
        // }
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
                    id="goods_shop_${item.id}"
                    value="0"
                    min="0"
                    max="${item.quantity}"
                    onchange="${qs}.updateGoodQuantity(${item.id});"
                />
            </div>
            <div>
                <span id="${item.id}">${item.quantity * item.adjusted_price}</span>
            </div>
            <div>
                <button
                    onclick="${qs}.buyGood(${item.id});"
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