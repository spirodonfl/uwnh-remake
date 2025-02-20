class UI_MENU_BAR extends HTMLElement
{
    constructor()
    {
        super();
        this.initialized = false;
        this.rendered = false;
        this.layer_mode = null;
        this.active_layer_id = null;
        this.active_layer_name_id = null;
        viewport_callbacks["mousemove"].push(this.viewportMouseMove);
        viewport_callbacks["mousedown"].push(this.viewportMouseDown);
        this.current_atlas_x = 0;
        this.current_atlas_y = 0;
    }
    initialize()
    {
        if (!this.initialized)
        {
            this.initialized = true;
            this.rendered = false;
            this.layer_mode = null;
            this.render();
        }
    }
    updateTime()
    {
        var game_time = new GAME_DATA_GAME_TIME(wasm.exports);
        this.querySelector('#time').innerHTML = `
            <div>${game_time.day} / ${game_time.month} / ${game_time.year} / ${game_time.total_days}</div>
        `;
    }
    togglePause()
    {
        RAF.togglePause();
        if (RAF.is_paused)
        {
            this.querySelector("#raf_pause_toggle").innerHTML = "Unpause";
        }
        else
        {
            this.querySelector("#raf_pause_toggle").innerHTML = "Pause";
        }
    }
    viewportMouseMove(data)
    {
        var self = document.querySelector("ui-menu-bar");
        self.querySelector("#debug_viewport_x").innerHTML = data.viewport_x;
        self.querySelector("#debug_viewport_y").innerHTML = data.viewport_y;
        self.querySelector("#debug_world_x").innerHTML = data.world_x;
        self.querySelector("#debug_world_y").innerHTML = data.world_y;
        // for (var i = 0; i < LAYER.length; ++i)
        // {
        //     var wasm_value = get_layer_value(LAYER[i], data.world_x, data.world_y);
        //     var name = LAYER[i].getName();
        //     var name_id = LAYER[i].name_id;
        //     var el = self.querySelector(`#layer_id_${i}`);
        //     el.innerHTML = `${name}: ${wasm_value}`;
        // }
    }
    viewportMouseDown(data)
    {
        var self = document.querySelector("ui-menu-bar");
        var current_world = gh.getCurrentWorldName();
        if (self.layer_mode === "pull")
        {
            // we need to pull atlas_asset_x && atlas_asset_y
            for (var i = 0; i < LAYER.length; ++i)
            {
                if (LAYER[i].name_id !== self.active_layer_name_id)
                {
                    continue;
                }
                var value = get_layer_value(LAYER[i], data.world_x, data.world_y);
                var name = LAYER[i].getName();
                self.querySelector("#debug_layer_value").value = value;
                var name_id = GAME_STRINGS[LAYER[i].name_id];
                var layer_name = "layer_" + UNDERSTRINGS[name_id];
                if (
                    LAYER_ATLAS_MAP[current_world]
                    &&
                    LAYER_ATLAS_MAP[current_world][layer_name]
                    &&
                    LAYER_ATLAS_MAP[current_world][layer_name][value]
                )
                {
                    var atlas_x = LAYER_ATLAS_MAP
                        [current_world]
                        [layer_name]
                        [value]
                        [0];
                    var atlas_y = LAYER_ATLAS_MAP
                        [current_world]
                        [layer_name]
                        [value]
                        [1];
                    atlas_x *= TILE_SIZE_SCALED;
                    atlas_y *= TILE_SIZE_SCALED;
                    self
                        .querySelector("#atlas_preview")
                        .style
                        .backgroundPosition = `-${atlas_x}px -${atlas_y}px`;
                }
                break;
            }
        }
        else if (self.layer_mode === "set")
        {
            var wasm_value = parseInt(document.getElementById("debug_layer_value").value);
            var layer_id = self.active_layer_id;
            wasm.exports.layer_set_value(
                layer_id,
                data.world_x,
                data.world_y,
                wasm_value
            );

            // NOTE: This is to set the LAM array values if you want to
            // var atlas_x = parseInt(document.getElementById("atlas_asset_x").value);
            // var atlas_y = parseInt(document.getElementById("atlas_asset_y").value);
            // if (!LAYER_ATLAS_MAP[current_world])
            // {
            //     LAYER_ATLAS_MAP[current_world] = [];
            // }
            // if (!LAYER_ATLAS_MAP[current_world][layer_name])
            // {
            //     LAYER_ATLAS_MAP[current_world][layer_name] = [];
            // }
            // if (!LAYER_ATLAS_MAP[current_world][layer_name][wasm_value])
            // {
            //     LAYER_ATLAS_MAP[current_world][layer_name][wasm_value] = [];
            // }
            // LAYER_ATLAS_MAP[current_world][layer_name][wasm_value][0] = atlas_x;
            // LAYER_ATLAS_MAP[current_world][layer_name][wasm_value][1] = atlas_y;
        }
    }
    setModeToPull()
    {
        this.layer_mode = "pull";
        this.querySelector("#mode_set").style.border = '0px';
        this.querySelector("#mode_pull").style.border = '1px solid red';
    }
    setModeToSet()
    {
        this.layer_mode = "set";
        this.querySelector("#mode_pull").style.border = '0px';
        this.querySelector("#mode_set").style.border = '1px solid red';
    }
    setActiveLayer(layer_id)
    {
        var layers = this.querySelectorAll(".layer_list_layer");
        for (var l = 0; l < layers.length; ++l)
        {
            if (layers[l] instanceof HTMLElement)
            {
                layers[l].style.border = "0px";
            }
        }
        this.querySelector(`#layer_id_${layer_id}`).style.border = "1px solid red";
        var name = LAYER[layer_id].getName();
        var name_id = LAYER[layer_id].name_id;
        this.active_layer_name_id = parseInt(`${name_id}`);
        this.active_layer_id = layer_id;
    }
    increaseAtlasX()
    {
        this.current_atlas_x += TILE_SIZE_SCALED;
        this
            .querySelector("#atlas_preview")
            .style.backgroundPosition = `
                -${this.current_atlas_x}px -${this.current_atlas_y}px
            `;
    }
    increaseAtlasY()
    {
        this.current_atlas_y += TILE_SIZE_SCALED;
        this
            .querySelector("#atlas_preview")
            .style.backgroundPosition = `
                -${this.current_atlas_x}px -${this.current_atlas_y}px
            `;
    }
    decreaseAtlasX()
    {
        this.current_atlas_x -= TILE_SIZE_SCALED;
        if (this.current_atlas_x < 0)
        {
            this.current_atlas_x = 0;
        }
        this
            .querySelector("#atlas_preview")
            .style.backgroundPosition = `
                -${this.current_atlas_x}px -${this.current_atlas_y}px
            `;
    }
    decreaseAtlasY()
    {
        this.current_atlas_y -= TILE_SIZE_SCALED;
        if (this.current_atlas_y < 0)
        {
            this.current_atlas_y = 0;
        }
        this
            .querySelector("#atlas_preview")
            .style.backgroundPosition = `
                -${this.current_atlas_x}px -${this.current_atlas_y}px
            `;
    }
    render()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var qs = `document.querySelector('ui-menu-bar')`;
        var onmouseout = `this.querySelector('.submenu').style.display = 'none';`;
        var onmouseover = `this.parentElement.querySelector('.submenu').style.display = 'block';`;
        var load_athens = `wasm.exports.generate_world(GAME_STRINGS.indexOf('WORLD_ATHENS'));`;
        var layers_list = ``;
        for (var i = 0; i < LAYER.length; ++i)
        {
            var name = LAYER[i].getName();
            var name_id = LAYER[i].name_id;
            layers_list += `
            <div
                id="layer_id_${i}"
                style="cursor: pointer;"
                class="layer_list_layer"
                onclick="${qs}.setActiveLayer(${i});"
            >${name}</div>`;
        }
        this.innerHTML = `
        <div id="menu" style="
            width: 100%;
            height: 32px;
            display: grid;
            grid-auto-flow: column;
            background: linear-gradient(180deg, #5b5b5b, #000000);
            padding: 0px 6px;
            align-items: center;
        ">
            <div style="position: relative;" onmouseout="${onmouseout}">
                <div style="cursor: pointer;" onmouseover="${onmouseover}">
                    Help
                </div>
                <div class="submenu" onmouseover="${onmouseover}" style="
                    position: absolute;
                    z-index: 90;
                    background-color: black;
                    padding: 4px;
                    display: grid;
                    grid-auto-flow: row;
                    grid-gap: 4px;
                    display: none;
                ">
                    <div
                        style="cursor: pointer;"
                        onclick="uih.toggleHelp();"
                    >Show Help</div>
                    <div
                        style="cursor: pointer;"
                        onclick="wasm.exports.test();"
                    >DEBUG</div>
                    <div
                        style="cursor: pointer;"
                        onclick="toggleShouldThreeD();"
                    >3D</div>
                    <div
                        style="cursor: pointer;"
                        onclick="${load_athens}"
                    >Load Athens</div>
                </div>
            </div>
            <div
                id="raf_pause_toggle"
                style="cursor: pointer;"
                onclick="${qs}.togglePause();">Pause</div>
            <div style="position: relative;" onmouseout="${onmouseout}">
                <div style="cursor: pointer;" onmouseover="${onmouseover}">Layers</div>
                <div class="submenu" onmouseover="${onmouseover}" style="
                    position: absolute;
                    z-index: 90;
                    background-color: black;
                    padding: 4px;
                    display: grid;
                    grid-auto-flow: row;
                    grid-gap: 4px;
                    display: none;
                ">
                    <div
                        id="mode_pull"
                        style="cursor: pointer;"
                        onclick="${qs}.setModeToPull();"
                    >Pull Value</div>
                    <div
                        id="mode_set"
                        style="cursor: pointer;"
                        onclick="${qs}.setModeToSet();"
                    >Set Value</div>
                    ${layers_list}
                </div>
            </div>
            <div id="time"></div>
            <div>WX:<span id="debug_world_x">NA</span></div>
            <div>WY:<span id="debug_world_y">NA</span></div>
            <div>VX:<span id="debug_viewport_x">NA</span></div>
            <div>VY:<span id="debug_viewport_y">NA</span></div>
            <div>
                <input id="debug_layer_value" type="number" style="width: 50px;" />
            </div>
            <div style="display: grid; grid-auto-flow: column;">
                <div style="display: grid; grid-auto-flow: row; height: 32px;">
                    <button
                        onclick="${qs}.increaseAtlasX();"
                        style="
                            width: 16px;
                            padding: 0px;
                            margin: 0px;
                            height: 16px;
                        ">+</button>
                    <button
                        onclick="${qs}.decreaseAtlasX();"
                        style="
                            width: 16px;
                            padding: 0px;
                            margin: 0px;
                            height: 16px;
                        ">-</button>
                </div>
                <div id="atlas_preview" style="
                    background-image: var(--atlas-image);
                    background-size: var(--bg-size);
                    background-position: -0 -0;
                    width: 32px;
                    height: 32px;
                    border: 1px solid white;
                "></div>
                <div style="display: grid; grid-auto-flow: row; height: 32px;">
                    <button
                        onclick="${qs}.increaseAtlasY();"
                        style="
                            width: 16px;
                            padding: 0px;
                            margin: 0px;
                            height: 16px;
                        ">+</button>
                    <button
                        onclick="${qs}.decreaseAtlasY();"
                        style="
                            width: 16px;
                            padding: 0px;
                            margin: 0px;
                            height: 16px;
                        ">-</button>
                </div>
            </div>
        </div>
        `;
    }
};
customElements.define("ui-menu-bar", UI_MENU_BAR);