var UI_GENERAL_SHOP = 
{
    data: {
        shop: null,
        inventory: null,
    },
    rendered: false,
    initialized: false,
    dialog: STRINGS["SCENE_GENERAL_SHOP"],
    initialize: function ()
    {
        if (!this.initialized)
        {
            this.data.shop = new GAME_DATA_SCENE_GENERAL_SHOP(wasm.exports);
            this.data.inventory = new GAME_DATA_INVENTORY(wasm.exports, [
                this.data.shop.inventory_id
            ]);
            this.initialized = true;
            this.rendered = false;
        }
    },
    render: function ()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var html = ``;
        var outer_border_style = `
            background: linear-gradient(172deg, #000000, #373737);
            padding: 4px; border-radius: 4px; max-width: fit-content;
            display: grid; grid-gap: 10px;
        `;
        var inner_text_style = `
            background: linear-gradient(152deg, black, #4d4d4d); padding: 6px; max-width: 300px;
            max-height: 200px; overflow: auto; border: 1px solid black;`;
        var inventory_list_style = `
            display: grid; grid-template-columns: 1fr 1fr 1fr;
            grid-gap: 5px; justify-items: center;`;
        var list_html = ``;
        for (var d = 0; d < this.data.inventory.total_items; ++d)
        {
            if (!is_sentry(this.data.inventory.inventory_items[d]))
            {
                var ghi = new GAME_DATA_INVENTORY_ITEM(wasm.exports, [
                    this.data.inventory.inventory_items[d]
                ]);
                var name = STRINGS[GAME_STRINGS[ghi.name_id]];
                list_html += `<div>${name}</div>`;
                list_html += `<div>
                    <input
                        class='shop_inventory_item'
                        type='number'
                        value='0'
                        data-price='${ghi.adjusted_price}'
                        data-id='${d}'
                        style='width: 40px;'
                        onclick='UI_GENERAL_SHOP.updateTotalPrice()' /></div>`;
                list_html += `<div>${ghi.adjusted_price}</div>`;
            }
        }
        html += `
        <div id="inventory_menu" style="max-width: fit-content; position: absolute; top: 0px;">
            <div style="${outer_border_style}">
                <div style="${inner_text_style}">
                    <div style="margin-bottom: 10px;">${this.dialog}</div>
                    <div style="${inventory_list_style}">
                        ${list_html}
                        <div>TOTAL</div><div>&nbsp;</div><div><span id="inventory_total_price">0</span></div>
                        <div><button class="green" onclick="UI_GENERAL_SHOP.buyItems()">Buy</button></div>
                        <div>&nbsp;</div>
                        <div><button class="red" onclick="UI_GENERAL_SHOP.cancel()">Cancel</button></div>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("inventory_menu").outerHTML = html;
    },
    updateTotalPrice: function ()
    {
        var total_price = 0;
        var items = document
            .getElementById("inventory_menu")
            .querySelectorAll(".shop_inventory_item");
        for (var i = 0; i < items.length; ++i)
        {
            if (items[i] instanceof HTMLElement && items[i].value > 0)
            {
                total_price += items[i].value * parseInt(items[i].dataset.price);
                var id = parseInt(items[i].dataset.id);
                this.data.shop.chosen_items[id] = items[i].value;
            }
        }
        document.getElementById("inventory_total_price").innerHTML = total_price;
    },
    cancel: function ()
    {
        document
            .getElementById("inventory_menu")
            .outerHTML = `<div id="inventory_menu"></div>`;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_EXIT"));
        this.initialized = false;
    },
    buyItems: function ()
    {
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_BUY"));
        if (this.data.shop.flag_bought == true)
        {
            console.log("Successful purchase!");
        }
        this.dialog = STRINGS["SCENE_GENERAL_SHOP_THANK_YOU"];
        this.rendered = false;
        this.render();
    }
};