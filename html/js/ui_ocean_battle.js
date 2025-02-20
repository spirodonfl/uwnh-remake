var UI_OCEAN_BATTLE =
{
    data: {
        scene: null,
        battle: null,
        original_coords:
        {
            x: null, y: null
        },
    },
    animating_cannons: false,
    animating_boarding: false,
    current_world_npc: false,
    current_world_npc_id: false,
    initialized: false,
    initialize: function ()
    {
        if (!this.initialized)
        {
            this.initialized = true;
            this.data.scene = new GAME_DATA_SCENE_OCEAN_BATTLE(wasm.exports);
            this.data.battle = new GAME_DATA_OCEAN_BATTLE(wasm.exports);
            this.render();
        }
    },
    hide: function ()
    {
        document.getElementById("ocean_battle").outerHTML = `<div id="ocean_battle"></div>`;
        this.initialized = false;
    },
    render: function ()
    {
        wasm.exports.ob_get_in_range();
        var captains_html = ``;
        for (var i = 0; i < this.data.battle.turn_order_fleets.length; ++i)
        {
            // Assumption is a linear layout with no gaps
            if (is_sentry(this.data.battle.turn_order_fleets[i]))
            {
                break;
            }
            var fleet_id = this.data.battle.turn_order_fleets[i];
            var fleet = new GAME_DATA_FLEET(wasm.exports, [fleet_id]);
            var general_id = fleet.general_id;
            var captain = new GAME_DATA_CAPTAIN(wasm.exports, [general_id]);
            captains_html += `
            <div>Captain: ${captain.getName()}</div>
            `;
        }
        var ships_html = ``;
        var players_turn = false;
        for (var i = 0; i < this.data.battle.turn_order_ships.length; ++i)
        {
            // Assumption is a linear layout with no gaps
            if (is_sentry(this.data.battle.turn_order_ships[i]))
            {
                break;
            }
            var fleet_ship_id = this.data.battle.turn_order_fleet_ships[i];
            var ship_id = this.data.battle.turn_order_ships[i];
            var wnpc_id = this.data.battle.turn_order_world_npcs[i];
            var ship = new GAME_DATA_SHIP(wasm.exports, [ship_id]);
            var wnpc = new GAME_DATA_WORLD_NPC(wasm.exports, [wnpc_id]);
            var fleet_ship = new GAME_DATA_FLEET_SHIP(wasm.exports, [fleet_ship_id]);
            var fleet = new GAME_DATA_FLEET(wasm.exports, [fleet_ship.fleet_id]);
            var onmouseover = `
                this.style.cursor = 'pointer';
                UI_OCEAN_BATTLE.highlightWorldNPC(${wnpc_id});
            `;
            var onmouseout = `UI_OCEAN_BATTLE.clearWorldNPCHighlights();`;
            var style = ``;
            if (i === this.data.battle.turn_order && fleet.general_id === 0)
            {
                players_turn = true;
            }
            if (i === this.data.battle.turn_order)
            {
                style = `color: rgb(255 217 0); border-left: 2px solid gold; padding-left: 6px;`;
            }
            ships_html += `
                <div onmouseover="${onmouseover}" onmouseout="${onmouseout}" style="${style}">
                    Ship [${ship_id}]
                </div>
                <div style="${style}">Crew: ${ship.crew}/100 - <progress max="100" value="${ship.crew}" /></div>
                <div style="${style}">Hull: ${ship.hull}/100 - <progress max="100" value="${ship.hull}" /></div>
            `;
        }
        var buttons = ``;
        if (this.data.battle.victory)
        {
            if (this.data.battle.player_victory)
            {
                buttons += `<button onclick="UI_OCEAN_BATTLE.hide();">Claim Victory</button>`;
            }
            else
            {
                buttons += `<button>You Lost</button>`;
            }
        }
        else if (players_turn)
        {
            buttons += `<button disable>Escape</button>`;
            if (this.data.battle.moved !== 1)
            {
                buttons += `<button onclick="UI_OCEAN_BATTLE.highlightValidMoves();">Move</button>`;
                buttons += `<button
                    id="ui_ocean_battle_confirm_move"
                    onclick="UI_OCEAN_BATTLE.confirmMove();"
                    style="display: none;">Confirm Move</button>`;
                buttons += `<button
                    id="ui_ocean_battle_cancel_move"
                    onclick="UI_OCEAN_BATTLE.cancelMove();"
                    style="display: none;">Cancel Move</button>`;
            }
            if (this.data.battle.attacked !== 1)
            {
                buttons += `<button
                    onclick="UI_OCEAN_BATTLE.highlightValidCannons();"
                >Fire Cannons</button>`;
                buttons += `<button
                    id="ui_ocean_battle_confirm_cannons"
                    onclick="UI_OCEAN_BATTLE.confirmCannons();"
                    style="display: none;">Confirm Cannons</button>`;
                buttons += `<button
                    id="ui_ocean_battle_cancel_cannons"
                    onclick="UI_OCEAN_BATTLE.cancelCannons();"
                    style="display: none;">Cancel Cannons</button>`;
                buttons += `<button
                    onclick="UI_OCEAN_BATTLE.highlightValidBoarding();"
                >Board</button>`;
                buttons += `<button
                    id="ui_ocean_battle_confirm_boarding"
                    onclick="UI_OCEAN_BATTLE.confirmBoarding();"
                    style="display: none;">Confirm Boarding</button>`;
                buttons += `<button
                    id="ui_ocean_battle_cancel_boarding"
                    onclick="UI_OCEAN_BATTLE.cancelBoarding();"
                    style="display: none;">Cancel Boarding</button>`;
            }
            buttons += `<button disabled>Duel Captain</button>`;
            buttons += `<button>Order Fleet</button>`;
            buttons += `<button onclick="UI_OCEAN_BATTLE.endTurn();">End Turn</button>`;
        }
        else
        {
            buttons += `<button onclick="UI_OCEAN_BATTLE.takeNPCTurn();">Run NPCs Turn</button>`;
        }
        var html = `
        <div id="ocean_battle" class="popup">
            <div class="outer_border" style="display: grid; grid-auto-flow: column;">
                <div id="ocean-battle-drag-handle" class="drag-bar svg svg-handle-bar-white"></div>
                <div>
                    <div class="inner_text" style="margin-bottom: 6px;">
                        Gonna fight!
                    </div>
                    <div id="battle_info" style="display: grid; grid-gap: 4px; margin-bottom: 6px;">
                        <div>Total Fleets In Battle: ${this.data.battle.total_fleets}</div>
                        <div>Total Ships In Battle: ${this.data.battle.total_ships}</div>
                        ${captains_html}
                        ${ships_html}
                    </div>
                    <div id="dialog_choices" style="display: grid; grid-auto-flow: row;">
                        ${buttons}
                    </div>
                </div>
            </div>
        </div>`;
        document.getElementById("ocean_battle").outerHTML = html;
        dragElement(
            document.getElementById("ocean_battle"),
            document.getElementById("ocean-battle-drag-handle"),
            { useBottomRight: true }
        );
    },
    takeNPCTurn: function (move_anim_done, attack_anim_done)
    {
        this.current_world_npc_id = UI_OCEAN_BATTLE.data.battle.turn_order_world_npcs[
            UI_OCEAN_BATTLE.data.battle.turn_order
        ];
        this.current_world_npc = new GAME_DATA_WORLD_NPC(wasm.exports, [
            this.current_world_npc_id
        ]);
        if (UI_OCEAN_BATTLE.data.battle.total_valid_cannon_coords === 0)
        {
            attack_anim_done = true;
        }
        if (
            move_anim_done === undefined
            &&
            UI_OCEAN_BATTLE.data.battle.total_valid_move_coords > 0
        )
        {
            if (UI_OCEAN_BATTLE.data.original_coords.x === null)
            {
                UI_OCEAN_BATTLE.data.original_coords.x = UI_OCEAN_BATTLE.current_world_npc.position_x;
                UI_OCEAN_BATTLE.data.original_coords.y = UI_OCEAN_BATTLE.current_world_npc.position_y;
            }
            var intended_move_x = UI_OCEAN_BATTLE.data.battle.intended_move_coords[0];
            var intended_move_y = UI_OCEAN_BATTLE.data.battle.intended_move_coords[1];
            // console.log("Moving ship from/to", {
            //     start_x: UI_OCEAN_BATTLE.data.original_coords.x,
            //     start_y: UI_OCEAN_BATTLE.data.original_coords.y,
            //     end_x: intended_move_x,
            //     end_y: intended_move_y,
            //     available_coords: UI_OCEAN_BATTLE.data.battle.valid_move_coords,
            // });
            animateOceanBattleMove.reset();
            animateOceanBattleMove.start.x = UI_OCEAN_BATTLE.data.original_coords.x;
            animateOceanBattleMove.start.x *= TILE_SIZE_SCALED;
            animateOceanBattleMove.start.y = UI_OCEAN_BATTLE.data.original_coords.y;
            animateOceanBattleMove.start.y *= TILE_SIZE_SCALED;
            animateOceanBattleMove.current.x = animateOceanBattleMove.start.x;
            animateOceanBattleMove.current.y = animateOceanBattleMove.start.y;
            animateOceanBattleMove.end.x = intended_move_x;
            animateOceanBattleMove.end.x *= TILE_SIZE_SCALED;
            animateOceanBattleMove.end.y = intended_move_y;
            animateOceanBattleMove.end.y *= TILE_SIZE_SCALED;
            animateOceanBattleMove.callbacks.push(UI_OCEAN_BATTLE.takeNPCTurn.bind(null, true));
            animateOceanBattleMove.callbacks.push(function () {
                UI_OCEAN_BATTLE.current_world_npc.position_x = intended_move_x;
                UI_OCEAN_BATTLE.current_world_npc.position_y = intended_move_y;
            }.bind(null));
            if (uih.animations.indexOf(animateOceanBattleMove) < 0)
            {
                uih.animations.push(animateOceanBattleMove);
            }
        }
        else if (
            attack_anim_done === undefined
            &&
            UI_OCEAN_BATTLE.data.battle.total_valid_cannon_coords > 0
        )
        {
            var start_x, start_y;
            if (!is_sentry(UI_OCEAN_BATTLE.data.battle.intended_move_coords[0]))
            {
                start_x = UI_OCEAN_BATTLE.data.battle.intended_move_coords[0];
                start_y = UI_OCEAN_BATTLE.data.battle.intended_move_coords[1];
            }
            else
            {
                start_x = UI_OCEAN_BATTLE.current_world_npc.position_x;
                start_y = UI_OCEAN_BATTLE.current_world_npc.position_y;
            }
            var intended_cannon_x = UI_OCEAN_BATTLE.data.battle.intended_cannon_coords[0];
            var intended_cannon_y = UI_OCEAN_BATTLE.data.battle.intended_cannon_coords[1];
            animateOceanBattleCannon.reset();
            animateOceanBattleCannon.start.x = start_x;
            animateOceanBattleCannon.start.x *= TILE_SIZE_SCALED;
            animateOceanBattleCannon.start.y = start_y;
            animateOceanBattleCannon.start.y *= TILE_SIZE_SCALED;
            animateOceanBattleCannon.current.x = animateOceanBattleCannon.start.x;
            animateOceanBattleCannon.current.y = animateOceanBattleCannon.start.y;
            animateOceanBattleCannon.end.x = intended_cannon_x * TILE_SIZE_SCALED;
            animateOceanBattleCannon.end.y = intended_cannon_y * TILE_SIZE_SCALED;
            if (UI_OCEAN_BATTLE.data.battle.total_valid_move_coords === 0)
            {
                move_anim_done = true;
            }
            animateOceanBattleCannon.callbacks.push(UI_OCEAN_BATTLE.takeNPCTurn.bind(null, move_anim_done, true));
            if (uih.animations.indexOf(animateOceanBattleCannon) < 0)
            {
                uih.animations.push(animateOceanBattleCannon);
            }
        }
        else if (
            attack_anim_done === undefined
            &&
            UI_OCEAN_BATTLE.data.battle.total_valid_boarding_coords > 0
        )
        {
            var start_x, start_y;
            if (!is_sentry(UI_OCEAN_BATTLE.data.battle.intended_move_coords[0]))
            {
                start_x = UI_OCEAN_BATTLE.data.battle.intended_move_coords[0];
                start_y = UI_OCEAN_BATTLE.data.battle.intended_move_coords[1];
            }
            else
            {
                start_x = UI_OCEAN_BATTLE.current_world_npc.position_x;
                start_y = UI_OCEAN_BATTLE.current_world_npc.position_y;
            }
            var intended_boarding_x = UI_OCEAN_BATTLE.data.battle.intended_boarding_coords[0];
            var intended_boarding_y = UI_OCEAN_BATTLE.data.battle.intended_boarding_coords[1];
            animateOceanBattleBoarding.reset();
            animateOceanBattleBoarding.start.x = start_x * TILE_SIZE_SCALED;
            animateOceanBattleBoarding.start.y = start_y * TILE_SIZE_SCALED;
            animateOceanBattleBoarding.current.x = animateOceanBattleBoarding.start.x;
            animateOceanBattleBoarding.current.y = animateOceanBattleBoarding.start.y;
            animateOceanBattleBoarding.end.x = intended_boarding_x * TILE_SIZE_SCALED;
            animateOceanBattleBoarding.end.y = intended_boarding_y * TILE_SIZE_SCALED;
            if (UI_OCEAN_BATTLE.data.battle.total_valid_move_coords === 0)
            {
                move_anim_done = true;
            }
            animateOceanBattleBoarding.callbacks.push(UI_OCEAN_BATTLE.takeNPCTurn.bind(null, move_anim_done, true));
            if (uih.animations.indexOf(animateOceanBattleBoarding) < 0)
            {
                uih.animations.push(animateOceanBattleBoarding);
            }
        }
        else if (move_anim_done === true && attack_anim_done === true)
        {
            wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_RUN_NPC_TURN"));
            UI_OCEAN_BATTLE.data.original_coords.x = null;
            UI_OCEAN_BATTLE.data.original_coords.y = null;
            UI_OCEAN_BATTLE.render();
        }
    },
    endTurn: function ()
    {
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_END_TURN"));
        this.data.original_coords.x = null;
        this.data.original_coords.y = null;
        UI_OCEAN_BATTLE.render();
    },
    highlightWorldNPC: function (wnpc_id)
    {
        uih.highlightNPCID = wnpc_id;
    },
    clearWorldNPCHighlights: function ()
    {
        uih.highlightNPCID = false;
    },
    highlightValidMoves: function()
    {
        if (uih.animations.indexOf(animateOceanBattleMoveCoords) < 0)
        {
            uih.animations.push(animateOceanBattleMoveCoords);
        }
    },
    moveWorldNPCTo: function (x, y)
    {
        var wnpcid = this.data.battle.turn_order_world_npcs[this.data.battle.turn_order];
        if (this.data.original_coords.x === null)
        {
            var wnpc = new GAME_DATA_WORLD_NPC(wasm.exports, [wnpcid]);
            this.data.original_coords.x = wnpc.position_x;
            this.data.original_coords.y = wnpc.position_y;
        }
        wasm.exports.move_world_npc_to(wnpcid, x, y);
        this.data.battle.intended_move_coords[0] = x;
        this.data.battle.intended_move_coords[1] = y;
        document.getElementById("ui_ocean_battle_confirm_move").style.display = "block";
        document.getElementById("ui_ocean_battle_cancel_move").style.display = "block";
        if (uih.animations.indexOf(animateOceanBattleMoveIntendedCoords) < 0)
        {
            uih.animations.push(animateOceanBattleMoveIntendedCoords);
        }
    },
    endMove: function ()
    {
        for (var i = (uih.animations.length - 1); i >= 0; --i)
        {
            if (
                uih.animations[i].type
                &&
                uih.animations[i].type === "ocean_battle"
            )
            {
                uih.animations.splice(i, 1);
            }
        }
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_MOVE"));
        UI_OCEAN_BATTLE.render();
    },
    confirmMove: function ()
    {
        this.current_world_npc_id = UI_OCEAN_BATTLE.data.battle.turn_order_world_npcs[
            UI_OCEAN_BATTLE.data.battle.turn_order
        ];
        this.current_world_npc = new GAME_DATA_WORLD_NPC(wasm.exports, [
            this.current_world_npc_id
        ]);
        wasm.exports.move_world_npc_to(
            this.current_world_npc_id,
            this.data.original_coords.x,
            this.data.original_coords.y
        );
        var intended_move_x = this.data.battle.intended_move_coords[0];
        var intended_move_y = this.data.battle.intended_move_coords[1];
        animateOceanBattleMove.reset();
        animateOceanBattleMove.start.x = this.data.original_coords.x;
        animateOceanBattleMove.start.x *= TILE_SIZE_SCALED;
        animateOceanBattleMove.start.y = this.data.original_coords.y;
        animateOceanBattleMove.start.y *= TILE_SIZE_SCALED;
        animateOceanBattleMove.current.x = animateOceanBattleMove.start.x;
        animateOceanBattleMove.current.y = animateOceanBattleMove.start.y;
        animateOceanBattleMove.end.x = intended_move_x * TILE_SIZE_SCALED;
        animateOceanBattleMove.end.y = intended_move_y * TILE_SIZE_SCALED;
        if (uih.animations.indexOf(animateOceanBattleMove) < 0)
        {
            uih.animations.push(animateOceanBattleMove);
        }
        animateOceanBattleMove.callbacks.push(UI_OCEAN_BATTLE.endMove.bind(null));
    },
    cancelMove: function ()
    {
        this.data.battle.intended_move_coords[0] = wasm.exports.get_sentry();
        this.data.battle.intended_move_coords[1] = wasm.exports.get_sentry();
        var wnpcid = this.data.battle.turn_order_world_npcs[this.data.battle.turn_order];
        wasm.exports.move_world_npc_to(
            wnpcid,
            this.data.original_coords.x,
            this.data.original_coords.y
        );
        document.getElementById("ui_ocean_battle_confirm_move").style.display = "none";
        document.getElementById("ui_ocean_battle_cancel_move").style.display = "none";
        for (var i = (uih.animations.length - 1); i >= 0; --i)
        {
            if (
                uih.animations[i].type
                &&
                uih.animations[i].type === "ocean_battle"
            )
            {
                uih.animations.splice(i, 1);
            }
        }
    },
    highlightValidCannons: function()
    {
        if (uih.animations.indexOf(animateOceanBattleCannonCoords) < 0)
        {
            uih.animations.push(animateOceanBattleCannonCoords);
        }
        document.getElementById("ui_ocean_battle_cancel_cannons").style.display = "block";
    },
    setCannonsTo: function(x, y)
    {
        this.data.battle.intended_cannon_coords[0] = x;
        this.data.battle.intended_cannon_coords[1] = y;
        document.getElementById("ui_ocean_battle_confirm_cannons").style.display = "block";
        document.getElementById("ui_ocean_battle_cancel_cannons").style.display = "block";
        if (uih.animations.indexOf(animateOceanBattleCannonIntendedCoords) < 0)
        {
            uih.animations.push(animateOceanBattleCannonIntendedCoords);
        }
    },
    confirmCannons: function (animation_done)
    {
        this.current_world_npc_id = UI_OCEAN_BATTLE.data.battle.turn_order_world_npcs[
            UI_OCEAN_BATTLE.data.battle.turn_order
        ];
        this.current_world_npc = new GAME_DATA_WORLD_NPC(wasm.exports, [
            this.current_world_npc_id
        ]);
        if (animation_done === undefined)
        {
            var intended_cannon_x = UI_OCEAN_BATTLE.data.battle.intended_cannon_coords[0];
            var intended_cannon_y = UI_OCEAN_BATTLE.data.battle.intended_cannon_coords[1];
            animateOceanBattleCannon.reset();
            animateOceanBattleCannon.start.x = this.current_world_npc.position_x;
            animateOceanBattleCannon.start.x *= TILE_SIZE_SCALED;
            animateOceanBattleCannon.start.y = this.current_world_npc.position_y;
            animateOceanBattleCannon.start.y *= TILE_SIZE_SCALED;
            animateOceanBattleCannon.current.x = animateOceanBattleCannon.start.x;
            animateOceanBattleCannon.current.y = animateOceanBattleCannon.start.y;
            animateOceanBattleCannon.end.x = intended_cannon_x * TILE_SIZE_SCALED;
            animateOceanBattleCannon.end.y = intended_cannon_y * TILE_SIZE_SCALED;
            animateOceanBattleCannon.callbacks.push(UI_OCEAN_BATTLE.confirmCannons.bind(null, true));
            uih.animations.push(animateOceanBattleCannon);
        }
        else if (animation_done === true)
        {
            // Note: If you're going to splice, do it in reverse so the indexes don't eff you up
            for (var i = (uih.animations.length - 1); i >= 0; --i)
            {
                if (
                    uih.animations[i].type
                    &&
                    uih.animations[i].type === "ocean_battle"
                )
                {
                    uih.animations.splice(i, 1);
                }
            }
            wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_FIRE_CANNONS"));
            UI_OCEAN_BATTLE.render();
        }
    },
    cancelCannons: function ()
    {
        this.data.battle.intended_cannon_coords[0] = wasm.exports.get_sentry();
        this.data.battle.intended_cannon_coords[1] = wasm.exports.get_sentry();
        document.getElementById("ui_ocean_battle_confirm_cannons").style.display = "none";
        document.getElementById("ui_ocean_battle_cancel_cannons").style.display = "none";
        for (var i = (uih.animations.length - 1); i >= 0; --i)
        {
            if (
                uih.animations[i].type
                &&
                uih.animations[i].type === "ocean_battle"
            )
            {
                uih.animations.splice(i, 1);
            }
        }
    },
    highlightValidBoarding: function()
    {
        if (uih.animations.indexOf(animateOceanBattleBoardingCoords) < 0)
        {
            uih.animations.push(animateOceanBattleBoardingCoords);
        }
    },
    setBoardingTo: function(x, y)
    {
        this.data.battle.intended_boarding_coords[0] = x;
        this.data.battle.intended_boarding_coords[1] = y;
        document.getElementById("ui_ocean_battle_confirm_boarding").style.display = "block";
        document.getElementById("ui_ocean_battle_cancel_boarding").style.display = "block";
        if (uih.animations.indexOf(animateOceanBattleBoardingIntendedCoords) < 0)
        {
            uih.animations.push(animateOceanBattleBoardingIntendedCoords);
        }
    },
    confirmBoarding: function (animation_done)
    {
        this.current_world_npc_id = UI_OCEAN_BATTLE.data.battle.turn_order_world_npcs[
            UI_OCEAN_BATTLE.data.battle.turn_order
        ];
        this.current_world_npc = new GAME_DATA_WORLD_NPC(wasm.exports, [
            this.current_world_npc_id
        ]);
        if (animation_done === undefined)
        {
            var intended_boarding_x = UI_OCEAN_BATTLE.data.battle.intended_boarding_coords[0];
            var intended_boarding_y = UI_OCEAN_BATTLE.data.battle.intended_boarding_coords[1];
            animateOceanBattleBoarding.reset();
            animateOceanBattleBoarding.start.x = this.current_world_npc.position_x;
            animateOceanBattleBoarding.start.x *= TILE_SIZE_SCALED;
            animateOceanBattleBoarding.start.y = this.current_world_npc.position_y;
            animateOceanBattleBoarding.start.y *= TILE_SIZE_SCALED;
            animateOceanBattleBoarding.current.x = animateOceanBattleBoarding.start.x;
            animateOceanBattleBoarding.current.y = animateOceanBattleBoarding.start.y;
            animateOceanBattleBoarding.end.x = intended_boarding_x * TILE_SIZE_SCALED;
            animateOceanBattleBoarding.end.y = intended_boarding_y * TILE_SIZE_SCALED;
            animateOceanBattleBoarding.callbacks.push(UI_OCEAN_BATTLE.confirmBoarding.bind(null, true));
            uih.animations.push(animateOceanBattleBoarding);
        }
        else if (animation_done === true)
        {
            // Note: If you're going to splice, do it in reverse so the indexes don't eff you up
            for (var i = (uih.animations.length - 1); i >= 0; --i)
            {
                if (
                    uih.animations[i].type
                    &&
                    uih.animations[i].type === "ocean_battle"
                )
                {
                    uih.animations.splice(i, 1);
                }
            }
            wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_BOARD"));
            UI_OCEAN_BATTLE.render();
        }
    },
    cancelBoarding: function ()
    {
        this.data.battle.intended_boarding_coords[0] = wasm.exports.get_sentry();
        this.data.battle.intended_boarding_coords[1] = wasm.exports.get_sentry();
        document.getElementById("ui_ocean_battle_confirm_boarding").style.display = "none";
        document.getElementById("ui_ocean_battle_cancel_boarding").style.display = "none";
        for (var i = (uih.animations.length - 1); i >= 0; --i)
        {
            if (
                uih.animations[i].type
                &&
                uih.animations[i].type === "ocean_battle"
            )
            {
                uih.animations.splice(i, 1);
            }
        }
    },
}