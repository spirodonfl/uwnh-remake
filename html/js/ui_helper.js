// uih = UIHelper
var uih = {
    highlightNPCID: null,
    animations: [],
    getViewport: function ()
    {
        return document.getElementById("viewport");
    },
    updateLayers: function ()
    {
        var total_layers = wasm.exports.get_storage_layer_total_used_slots();
        var slots = game_get_storage_layer_used_slots(wasm.exports);
        LAYER = [];
        for (var t = 0; t < total_layers; ++t)
        {
            var layer_id = slots[t];
            LAYER.push(new GAME_DATA_LAYER(wasm.exports, [layer_id]));
        }
    },
    updatedRender: function ()
    {
        this.updateLayers();
        var html = ``;
        var total_layers = wasm.exports.get_storage_layer_total_used_slots();
        var bg_layer_id = null;
        var layer_one_id = null;
        var layer_two_id = null;
        for (var t = 0; t < total_layers; ++t)
        {
            if (LAYER[t].name_id === GAME_STRINGS.indexOf("LAYER_BACKGROUND"))
            {
                bg_layer_id = t;
            }
            if (LAYER[t].name_id === GAME_STRINGS.indexOf("LAYER_ONE"))
            {
                layer_one_id = t;
            }
            if (LAYER[t].name_id === GAME_STRINGS.indexOf("LAYER_TWO"))
            {
                layer_two_id = t;
            }
        }

        var cached_lam = LAYER_ATLAS_MAP[
            UNDERSTRINGS[
                GAME_STRINGS[gh.current.world_name]
            ]
        ];
        var value;
        var style, onmousedown, onmousemove = "";
        var viewport_style = `
            display: grid;
            grid-template-rows: repeat(${VIEWPORT.height}, 1fr);
            grid-template-columns: repeat(${VIEWPORT.width}, 1fr);
            width: ${VIEWPORT.width * TILE_SIZE_SCALED}px;
            height: ${VIEWPORT.height * TILE_SIZE_SCALED}px;
            zoom: ${zoom};`;
        if (should3d)
        {
            viewport_style += ` margin-left: 60px;`;
            viewport_style += ` 
                transform:
                    perspective(1000px)
                    rotateX(${degy}deg)
                    rotateY(${degx}deg)
                    rotateZ(0deg);
                transform-style: preserve-3d;
                will-change: transform;`;
        }
        var viewport_html = `
        <div
            id="viewport"
            style="${viewport_style}"
            onpointerdown="viewportMouseDown(event);"
            onpointermove="viewportMouseMove(event);"
        >
        `;
        for (var vy = 0; vy < VIEWPORT.height; ++vy)
        {
            for (var vx = 0; vx < VIEWPORT.width; ++vx)
            {
                var world_x = CAMERA.offset.x + vx;
                var world_y = CAMERA.offset.y + vy;

                style = `
                    width: ${TILE_SIZE_SCALED}px;
                    height: ${TILE_SIZE_SCALED}px;
                    mix-blend-mode: normal;`;
                if (should3d)
                {
                    style += ` 
                        transform-style: preserve-3d;
                        will-change: transform;
                        backface-visibility: hidden;`;
                }
                // onmousedown += ` viewportMouseDown(${world_x}, ${world_y});`;
                // onmousemove += ` viewportMouseMove(${vx}, ${vy}, ${world_x}, ${world_y});`;

                html += `<div
                    class="tile_element"
                    data-world-x="${world_x}"
                    data-world-y="${world_y}"
                    data-viewport-x="${vx}"
                    data-viewport-y="${vy}"
                    style="${style}"
                    onmousedown="${onmousedown}"
                    onmousemove="${onmousemove}"
                >`;

                value = get_layer_value(
                    LAYER[bg_layer_id],
                    world_x,
                    world_y
                );
                if (
                    value !== undefined
                    &&
                    !is_sentry(value)
                    &&
                    cached_lam["background_layer"][value]
                )
                {
                    html += animateOcean.render_ocean_bg_tile(value);
                }

                value = get_layer_value(LAYER[layer_one_id], world_x, world_y);
                if (
                    value !== undefined
                    &&
                    !is_sentry(value)
                    &&
                    cached_lam["layer_one"][value]
                )
                {
                    var atlas_x = cached_lam["layer_one"][value][0];
                    var atlas_y = cached_lam["layer_one"][value][1];
                    atlas_x *= TILE_SIZE_SCALED;
                    atlas_y *= TILE_SIZE_SCALED;
                    style = `
                        background-image: var(--atlas-image);
                        background-position: -${atlas_x} -${atlas_y};
                        position: absolute;
                        background-size: 
                            ${ATLAS_IMAGE_SIZE.x / 2}px
                            ${ATLAS_IMAGE_SIZE.y / 2}px;
                        width: ${TILE_SIZE_SCALED}px;
                        height: ${TILE_SIZE_SCALED}px;
                    `;
                    if ((value == 0 || value == 1) && should3d)
                    {
                        style += ` 
                            transform-style: preserve-3d;
                            transform: 
                                rotateX(-90deg)
                                translateZ(48px)
                                translateY(-32px);
                        `;
                    }
                    if ((value == 2 || value == 3) && should3d)
                    {
                        style += ` 
                            transform-style: preserve-3d;
                            transform: 
                                rotateX(-90deg)
                                translateZ(16px)
                                translateY(-16px);
                        `;
                    }
                    html += `<div
                        data-layer-id="${layer_one_id}"
                        data-layer="layer_one"
                        style="${style}"></div>`;
                }

                value = get_layer_value(
                    LAYER[layer_two_id],
                    world_x,
                    world_y
                );
                if (
                    value !== undefined
                    &&
                    !is_sentry(value)
                    &&
                    cached_lam["layer_two"][value]
                )
                {
                    var atlas_x = cached_lam["layer_two"][value][0];
                    var atlas_y = cached_lam["layer_two"][value][1];
                    atlas_x *= TILE_SIZE_SCALED;
                    atlas_y *= TILE_SIZE_SCALED;
                    style = `
                        background-image: var(--atlas-image);
                        background-position: -${atlas_x} -${atlas_y};
                        position: absolute;
                        background-size: 
                            ${ATLAS_IMAGE_SIZE.x / 2}px
                            ${ATLAS_IMAGE_SIZE.y / 2}px;
                        width: ${TILE_SIZE_SCALED}px;
                        height: ${TILE_SIZE_SCALED}px;`;
                    if (value === 4 && should3d)
                    {
                        style += ` 
                            transform-style: preserve-3d;
                            transform: 
                                rotateX(-90deg)
                                translateZ(16px)
                                translateY(-16px);`;
                    }
                    html += `<div
                        class="atlas"
                        data-layer-id="${layer_two_id}"
                        data-layer="layer_two"
                        style="${style}"></div>`;
                }

                for (var a = 0; a < uih.animations.length; ++a)
                {
                    var anim = uih.animations[a];
                    if (
                        anim.add_to_viewport_world_tile
                        &&
                        anim.is_valid(world_x, world_y)
                    )
                    {
                        html += anim.render_html(world_x, world_y);
                    }
                    if (anim.name === "ocean_battle_cannon")
                    {
                        anim.render();
                    }
                    if (anim.name === "ocean_battle_sword")
                    {
                        anim.render();
                    }
                }

                // NPCS
                for (var n = 0; n < world_npcs.length; ++n)
                {
                    if (
                        world_npcs[n].position_x === world_x
                        &&
                        world_npcs[n].position_y === world_y
                    )
                    {
                        var atlas_x, atlas_y = null;
                        var wnpc_name = world_npcs[n].name;
                        var wnpc_type = world_npcs[n].type;
                        if (cached_lam["npc_layer"][wnpc_name])
                        {
                            atlas_x = cached_lam["npc_layer"][wnpc_name][0];
                            atlas_y = cached_lam["npc_layer"][wnpc_name][1];
                        }
                        if (cached_lam["npc_layer"][n])
                        {
                            atlas_x = cached_lam["npc_layer"][n][0];
                            atlas_y = cached_lam["npc_layer"][n][1];
                        }
                        if (wnpc_type === "NPC_TYPE_SHIP")
                        {
                            if (cached_lam["npc_layer"]["ship_" + wnpc_name])
                            {
                                // atlas_x = cached_lam["npc_layer"]["ship_" + wnpc_name][0];
                                // atlas_y = cached_lam["npc_layer"]["ship_" + wnpc_name][1];
                                atlas_x = animateBattleShip.current.x;
                                atlas_y = animateBattleShip.current.y;
                                animateBattleShip.render();
                            }
                        }
                        if (atlas_x === null || atlas_y === null)
                        {
                            console.error(
                                "Could not place NPC for some reason",
                                {n, npc: world_npcs[n], wnpc_name, wnpc_type}
                            );
                            continue;
                        }
                        atlas_x *= TILE_SIZE_SCALED;
                        atlas_y *= TILE_SIZE_SCALED;
                        if (
                            (
                                wnpc_name === "player_one"
                                ||
                                wnpc_name === "bank_teller"
                                ||
                                wnpc_name === "general_shop_owner"
                                ||
                                wnpc_name === "goods_shop_owner"
                            )
                            && gh.current.game_mode !== GAME_STRINGS.indexOf("GAME_MODE_SAILING")
                        )
                        {
                            var image = '--main-character-image';
                            if (wnpc_name === "bank_teller")
                            {
                                image = '--banker-npc-image';
                            }
                            else if (wnpc_name === "general_shop_owner")
                            {
                                image = '--general-shop-owner-npc-image';
                            }
                            else if (wnpc_name === "goods_shop_owner")
                            {
                                image = '--goods-shop-owner-npc-image';
                            }
                            if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_UP"))
                            {
                                atlas_y = world_npcs[n].animation.direction_up_y;
                            }
                            else if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_LEFT"))
                            {
                                atlas_y = world_npcs[n].animation.direction_left_y;
                            }
                            else if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_DOWN"))
                            {
                                atlas_y = world_npcs[n].animation.direction_down_y;
                            }
                            else if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_RIGHT"))
                            {
                                atlas_y = world_npcs[n].animation.direction_right_y;
                            }
                            atlas_x = world_npcs[n].animation.current_x;
                            atlas_x *= TILE_SIZE_SCALED;
                            atlas_y *= TILE_SIZE_SCALED;
                            var bg_size_x = 832 / 2;
                            var bg_size_y = 1344 / 2;
                            style = `
                                background-image: var(${image});
                                background-position: -${atlas_x} -${atlas_y};
                                position: absolute;
                                background-size: 
                                    ${bg_size_x}px
                                    ${bg_size_y}px;
                                width: ${TILE_SIZE_SCALED}px;
                                height: ${TILE_SIZE_SCALED}px;`;
                            ++world_npcs[n].animation.current_frame;
                            world_npcs[n].animation.update();
                        }
                        else
                        {
                            style = `
                                background-image: var(--atlas-image);
                                background-position: -${atlas_x} -${atlas_y};
                                position: absolute;
                                background-size: 
                                    ${ATLAS_IMAGE_SIZE.x / 2}px
                                    ${ATLAS_IMAGE_SIZE.y / 2}px;
                                width: ${TILE_SIZE_SCALED}px;
                                height: ${TILE_SIZE_SCALED}px;`;
                            if (
                                gh.current.game_mode === GAME_STRINGS.indexOf("GAME_MODE_SAILING")
                            )
                            {
                                if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_UP"))
                                {
                                    style += ` rotate: 0deg;`;
                                }
                                else if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_LEFT"))
                                {
                                    style += ` rotate: 270deg;`;
                                }
                                else if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_DOWN"))
                                {
                                    style += ` rotate: 180deg;`;
                                }
                                else if (world_npcs[n].direction === GAME_STRINGS.indexOf("DIRECTION_RIGHT"))
                                {
                                    style += ` rotate: 90deg;`;
                                }
                            }
                        }
                        if (world_npcs[n].id === uih.highlightNPCID)
                        {
                            style += ` background-color: rgba(0, 0, 255, 0.2);`;
                        }
                        if (should3d)
                        {
                            style += ` 
                            transform: 
                                rotateX(90deg)
                                rotateZ(180deg)
                                rotateY(180deg)
                                translate3d(0px, -16px, 0px);`;
                            style += ` transform-style: preserve-3d;`;
                            style += ` will-change: transform;`;
                            style += ` backface-visibility: hidden;`;
                        }
                        html += `<div
                            class="layer-npc_layer"
                            data-npc-id="${n}"
                            style="${style}"
                            >${world_npcs[n].poops ?? ''}</div>`;
                    }
                }

                // ENTITIES
                for (var n = 0; n < world_entities.length; ++n)
                {
                    if (
                        world_entities[n].position_x === world_x
                        &&
                        world_entities[n].position_y === world_y
                    )
                    {
                        var entity_name = world_entities[n].getName();
                        if (entity_name === "ENTITY_CANNONBALL")
                        {
                            style = atlasToStyle("icon_cannonballs", null, null, true);
                            html += `<div
                                class="layer-entity_layer"
                                data-entity-id="${n}"
                                data-entity-name="${entity_name}"
                                style="${style}"
                                ></div>`;
                        }
                        else if (entity_name === "ENTITY_CANNON_TARGET")
                        {
                            style = atlasToStyle("reticle_red", null, null, true);
                            html += `<div
                                class="layer-entity_layer"
                                data-entity-id="${n}"
                                data-entity-name="${entity_name}"
                                style="${style}"
                                ></div>`;
                        }
                        else if (entity_name === "ENTITY_BOARDING_TARGET")
                        {
                            style = atlasToStyle("reticle_red", null, null, true);
                            html += `<div
                                class="layer-entity_layer"
                                data-entity-id="${n}"
                                data-entity-name="${entity_name}"
                                style="${style}"
                                ></div>`;
                        }
                        else if (entity_name === "ENTITY_MOVEMENT")
                        {
                            style = atlasToStyle("reticle_green", null, null, true);
                            html += `<div
                                class="layer-entity_layer"
                                data-entity-id="${n}"
                                data-entity-name="${entity_name}"
                                style="${style}"
                                ></div>`;
                        }
                        else if (entity_name === "ENTITY_SWORD")
                        {
                            style = atlasToStyle("icon_sword", null, null, true);
                            html += `<div
                                class="layer-entity_layer"
                                data-entity-id="${n}"
                                data-entity-name="${entity_name}"
                                style="${style}"
                                ></div>`;
                        }
                        else if (entity_name === "ENTITY_CONFIRMATION")
                        {
                            style = atlasToStyle("icon_thumbs_up", null, null, true);
                            html += `<div
                                class="layer-entity_layer"
                                data-entity-id="${n}"
                                data-entity-name="${entity_name}"
                                style="${style}"
                                ></div>`;
                        }
                    }
                }
                // blocks?

                html += `</div>`;
            }
        }
        viewport_html += `${html}`;
        viewport_html += `</div>`;
        return viewport_html;
    },
    updateRootProperties()
    {
        // :root update
        var de = document.documentElement;
        de.style.setProperty("--atlas-width", TILE_SIZE_SCALED + "px");
        de.style.setProperty("--atlas-height", TILE_SIZE_SCALED + "px");
        de.style.setProperty("--tile-scaled", TILE_SIZE_SCALED + "px");
        de.style.setProperty("--viewport-width", VIEWPORT.width);
        de.style.setProperty("--viewport-height", VIEWPORT.height);
        de.style.setProperty("--zoom", zoom);
    },
    setZoom: function(new_value)
    {
        zoom = new_value;
        var de = document.documentElement;
        de.style.setProperty("--zoom", zoom);
    },
    initialize: function ()
    {
        wasm.exports.tick();
        uih.updateLayers();
        uih.getViewport().outerHTML = uih.updatedRender();

        // By default add ocean animation
        // TODO: In the future, only add ocean animation when ocean is the background
        this.animations.push(animateOcean);
    },
};