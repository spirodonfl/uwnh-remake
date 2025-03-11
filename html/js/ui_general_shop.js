class UI_GENERAL_SHOP extends HTMLElement
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
            this.data.scene = new GAME_DATA_SCENE_GENERAL_SHOP(wasm.exports);
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
    render()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var qs = `document.querySelector('ui-general-shop')`;
        var html = ``;
        var inventory_list_style = `
            display: grid; grid-template-columns: 1fr 1fr 1fr;
            grid-gap: 5px; justify-items: center;`;
        var list_html = ``;
        for (var d = 0; d < this.data.inventory.total_items; ++d)
        {
            if (!is_sentry(this.data.inventory_items[d]))
            {
                var item = this.data.inventory_items[d];
                list_html += `<div>${item.getName()}</div>`;
                list_html += `<div>
                    <input
                        class='shop_inventory_item'
                        type='number'
                        value='0'
                        data-price='${item.adjusted_price}'
                        data-id='${d}'
                        style='width: 40px;'
                        onclick="${qs}.updateTotalPrice()" /></div>`;
                list_html += `<div>${item.adjusted_price}</div>`;
            }
        }
        html += `
        <div id="inventory_menu" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">${this.dialog}</div>
                <div style="${inventory_list_style}">
                    ${list_html}
                    <div>TOTAL</div><div>&nbsp;</div><div><span id="inventory_total_price">0</span></div>
                    <div><button class="green" onclick="${qs}.buyItems()">Buy</button></div>
                    <div>&nbsp;</div>
                    <div><button class="red" onclick="${qs}.cancel()">Cancel</button></div>
                </div>
            </div>
        </div>
        `;
        this.innerHTML = html;
    }
    updateTotalPrice()
    {
        var total_price = 0;
        var items = this.querySelectorAll("#inventory_menu .shop_inventory_item");
        for (var i = 0; i < items.length; ++i)
        {
            if (items[i] instanceof HTMLElement && items[i].value > 0)
            {
                total_price += items[i].value * parseInt(items[i].dataset.price);
                var id = parseInt(items[i].dataset.id);
                this.data.scene.chosen_items[id] = items[i].value;
            }
        }
        this.querySelector("#inventory_total_price").innerHTML = total_price;
    }
    cancel()
    {
        this
            .querySelector("#inventory_menu")
            .outerHTML = `<div id="inventory_menu"></div>`;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_EXIT"));
        this.initialized = false;
    }
    buyItems()
    {
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_BUY"));
        if (this.data.scene.flag_bought == true)
        {
            console.log("Successful purchase!");
        }
        this.dialog = STRINGS["SCENE_GENERAL_SHOP_THANK_YOU"];
        this.rendered = false;
        this.render();
    }
};
customElements.define("ui-general-shop", UI_GENERAL_SHOP);