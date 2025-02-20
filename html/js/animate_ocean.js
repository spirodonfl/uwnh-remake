var animateOcean = {
    current_x: 0,
    max_x: 7,
    current_frame: 0,
    render_always: true,
    frame_rate: 18,
    render: function ()
    {
        ++this.current_frame;
        if (this.current_frame > this.frame_rate)
        {
            this.current_frame = 0;
            ++this.current_x;
            if (this.current_x > this.max_x)
            {
                this.current_x = 0;
            }
        }
    },
    render_ocean_bg_tile: function(value)
    {
        var lam = LAYER_ATLAS_MAP[
            UNDERSTRINGS[
                GAME_STRINGS[gh.current.world_name]
            ]
        ];
        var atlas_x = lam["background_layer"][value][0];
        var atlas_y = lam["background_layer"][value][1];
        atlas_x += this.current_x;
        atlas_x *= TILE_SIZE_SCALED;
        atlas_y *= TILE_SIZE_SCALED;
        var style = ``;
        style += `position: absolute;`;
        style += ` background-image: var(--atlas-image);`;
        style += ` background-position: -${atlas_x} -${atlas_y};`;
        style += `
            background-size:
                ${ATLAS_IMAGE_SIZE.x / 2}px
                ${ATLAS_IMAGE_SIZE.y / 2}px;
        `;
        style += ` width: ${TILE_SIZE_SCALED}px;`;
        style += ` height: ${TILE_SIZE_SCALED}px;`;
        var html = `
            <div class="ocean_bg_tile" style="${style}"></div>
        `;
        return html;
    }
};