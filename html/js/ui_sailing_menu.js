class UI_SAILING_MENU extends HTMLElement
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
        var atlas_x = 9;
        var atlas_y = 9;
        var middle_x = Math.floor(VIEWPORT.width / 2);
        var middle_y = Math.floor(VIEWPORT.height / 2);
        var qs = `document.querySelector('ui-sailing-menu')`;
        var html = `<div id="sailing_menu" style="
    position: absolute;
    font-size: 14px;
    color: white;
    z-index: 99;
    width: 32px;
    height: 32px;
    top: ${middle_y * TILE_SIZE_SCALED}px;
    left: ${middle_x * TILE_SIZE_SCALED}px;
    zoom: var(--zoom);
        border: 2px solid purple;
        background-color: gold;
        cursor: pointer;
">
    <div style="
        width: 32px;
        height: 32px;
        background-image: var(--atlas-image);
        background-size: var(--bg-size);
        background-position: -${atlas_x * TILE_SIZE_SCALED} -${atlas_y * TILE_SIZE_SCALED};
    "></div>
</div>

    <div id="sailing_menu" style="
    position: absolute;
    font-size: 14px;
    color: white;
    z-index: 99;
    width: 32px;
    height: 32px;
    top: ${middle_y * TILE_SIZE_SCALED}px;
    left: ${(middle_x - 1) * TILE_SIZE_SCALED}px;
    zoom: var(--zoom);
        border: 2px solid purple;
        background-color: gold;
        cursor: pointer;
">
    <div style="
        width: 32px;
        height: 32px;
        background-image: var(--atlas-image);
        background-size: var(--bg-size);
        background-position: -${(atlas_x + 1) * TILE_SIZE_SCALED} -${atlas_y * TILE_SIZE_SCALED};
    "></div>
</div>`;
        this.innerHTML = html;
        // TODO: Actions
        // If you have a telescope, you can use it to see targets or ports or towns or whatever
        // Initiate an attack if you're next to any fleet
        // Talk to a fleet if you're next to them
        // Set anchor / Lift anchor
        // Use items (like lime juice for scurvy)
        // Manage fleet
        // -- transfer cargo
        // -- adjust captains / first mates
        // -- adjust crew assignments (how many crew on sailing, battle, etc...)
        // -- repair ships (but you have to anchored to land)
        // If you have a captain with autosail skill, set destination
    }
};
customElements.define("ui-sailing-menu", UI_SAILING_MENU);