var RAF = {
    fps: 60,
    interval: 1000,
    last_time: 0,
    is_paused: false,
    last_log_time: 0,
    log_interval: 0,
    fps_value: 0,
    last_fps_time: 0,
    frame_count: 0,
    initialize: function ()
    {
        RAF.interval = RAF.interval / RAF.fps;
    },
    animate: function(current_time)
    {
        requestAnimationFrame(RAF.animate);

        if (!RAF.is_paused)
        {
            // Calculate time elapsed since last frame
            var delta_time = current_time - RAF.last_time;

            // Only update if enough time has passed
            if (delta_time >= RAF.interval)
            {
                // Update last time, accounting for any extra time
                RAF.last_time = current_time - (delta_time % RAF.interval);

                RAF.update(delta_time, current_time);
                RAF.render();
                wasm.exports.tick();

                ++RAF.frame_count;
            }
        }

        // Calculate FPS every second
        if (current_time - RAF.last_fps_time >= 1000)
        {
            RAF.fps_value = Math.round(
                (RAF.frame_count * 1000) / (current_time - RAF.last_fps_time)
            );
            RAF.frame_count = 0;
            RAF.last_fps_time = current_time;
        }
    },
    update: function(delta_time, current_time)
    {
        if (current_time - RAF.last_log_time >= RAF.log_interval)
        {
            RAF.last_log_time = current_time;
        }
        // wasm.tick
    },
    can_tick: true,
    render: function ()
    {
        if (!wasm) { console.error("NO WASM"); return; }
        if (gh.current.game_mode === GAME_STRINGS.indexOf("GAME_MODE_IN_PLAYER_MENU"))
        {
            document.querySelector("ui-player-menu").initialize();
        }
        else if (gh.current.game_mode === GAME_STRINGS.indexOf("GAME_MODE_IN_SCENE"))
        {
            scene_name = GAME_STRINGS[gh.current.scene];
            // if (!gh.shouldUpdate("scene")) { return; }
            if (
                scene_name === "SCENE_NPC_RVICE"
                ||
                scene_name === "SCENE_NPC_LAFOLIE"
                ||
                scene_name === "SCENE_NPC_NAKOR"
                ||
                scene_name === "SCENE_NPC_TRAVIS"
                ||
                scene_name === "SCENE_NPC_LOLLER"
            )
            {
                document.querySelector("ui-scene-single-dialog").initialize();
            }
            else if (scene_name === "SCENE_GENERAL_SHOP")
            {
                // Note: This essentially disables rendering because of "shouldUpdate" function
                // gh.current.updated_state = GAME_STRINGS.indexOf("UPDATED_STATE_NOTHING");
                UI_GENERAL_SHOP.initialize();
                UI_GENERAL_SHOP.render();
            }
            else if (scene_name === "SCENE_GOODS_SHOP")
            {
                document.querySelector("ui-goods-shop").initialize();
            }
            else if (scene_name === "SCENE_BANK")
            {
                UI_BANK.initialize();
                UI_BANK.render();
            }
            else if (scene_name === "SCENE_OCEAN_BATTLE")
            {
                UI_OCEAN_BATTLE.initialize();
            }
            else if (scene_name === "SCENE_SHIPYARD")
            {
                document.querySelector("ui-shipyard").initialize();
            }
            else if (scene_name === "SCENE_DOCKYARD")
            {
                document.querySelector("ui-dockyard").initialize();
            }
        }
        else
        {
            if (PLAYER.previous_world_npc_id !== PLAYER.captain.world_npc_id)
            {
                PLAYER.world_npc = new GAME_DATA_WORLD_NPC(wasm.exports, [PLAYER.captain.world_npc_id]);
                PLAYER.previous_world_npc_id = PLAYER.captain.world_npc_id;
            }
            if (!is_sentry(PLAYER.world_npc.position_x))
            {
                if (
                    (PLAYER.world_npc.position_x - CAMERA.offset.x) > (VIEWPORT.width / 2)
                    &&
                    (CAMERA.offset.x + VIEWPORT.width) < WORLD[gh.current.world].width
                )
                {
                    CAMERA.moveRight();
                }
                else if (
                    (PLAYER.world_npc.position_x - CAMERA.offset.x) < (VIEWPORT.width / 2)
                    &&
                    CAMERA.offset.x > 0
                )
                {
                    CAMERA.moveLeft();
                }
                if (
                    (PLAYER.world_npc.position_y - CAMERA.offset.y) > (VIEWPORT.height / 2)
                    &&
                    (CAMERA.offset.y + VIEWPORT.height) < WORLD[gh.current.world].height
                )
                {
                    CAMERA.moveDown();
                }
                else if (
                    (PLAYER.world_npc.position_y - CAMERA.offset.y) < (VIEWPORT.height / 2)
                    &&
                    CAMERA.offset.y > 0
                )
                {
                    CAMERA.moveUp();
                }
            }
        }
        var fragment = document.createDocumentFragment();
        var viewport = document.createElement('div');
        viewport.id = 'viewport';
        viewport.innerHTML = uih.updatedRender();
        fragment.appendChild(viewport);
        uih.getViewport().replaceWith(fragment);
        for (var a = 0; a < uih.animations.length; ++a)
        {
            if (uih.animations[a].render_always)
            {
                uih.animations[a].render();
            }
        }
        document.querySelector("ui-menu-bar").initialize();
        document.querySelector("ui-menu-bar").updateTime();
    },
    togglePause: function ()
    {
        RAF.is_paused = !RAF.is_paused
        console.log(RAF.is_paused ? 'RAF paused' : 'RAF resumed')
    }
};