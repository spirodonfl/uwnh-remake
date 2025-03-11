/**
 * Actions you can take
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_RUN_NPC_TURN"));
 * Should be scene_ocean_battle_run_npc_turn
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_END_TURN"));
 * Should be scene_ocean_battle_end_turn
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_FIRE_CANNONS"));
 * Should be scene_ocean_battle_fire_cannons
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_BOARD"));
 * Should be scene_ocean_battle_board
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_MOVE"));
 * Should be scene_ocean_battle_move
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_DUEL_CAPTAIN"));
 * Should be scene_ocean_battle_duel_captain
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_ORDER_FLEET"));
 * Should be scene_ocean_battle_order_fleet
 * wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("OCEAN_BATTLE_ESCAPE"));
 * Should be scene_ocean_battle_escape
 */

class WC_OCEAN_BATTLE extends DEFAULT_WC {};
customElements.define("ui-ocean-battle", WC_OCEAN_BATTLE);

function ocean_battle_board_ship()
{
    var wnpcid = OCEAN_BATTLE.turn_order_world_npcs[
        OCEAN_BATTLE.turn_order
    ];
    var world_npc = world_npcs[wnpcid];
    if (OCEAN_BATTLE.total_valid_boarding_coords === 0) { return; }
    if (animateOceanBattleBoarding.entity_id !== null) { return; }
    var name_id = GAME_STRINGS.indexOf("ENTITY_CONFIRMATION");
    wasm.exports.entity_despawn(name_id);
    var start_x = world_npc.position_x;
    var start_y = world_npc.position_y;
    var intended_boarding_x = OCEAN_BATTLE.intended_boarding_coords[0];
    var intended_boarding_y = OCEAN_BATTLE.intended_boarding_coords[1];
    animateOceanBattleBoarding.reset();
    animateOceanBattleBoarding.start.x = start_x;
    animateOceanBattleBoarding.start.y = start_y;
    animateOceanBattleBoarding.current.x = animateOceanBattleBoarding.start.x;
    animateOceanBattleBoarding.current.y = animateOceanBattleBoarding.start.y;
    animateOceanBattleBoarding.end.x = intended_boarding_x;
    animateOceanBattleBoarding.end.y = intended_boarding_y;
    animateOceanBattleBoarding.callbacks.push(function () {
        INPUT_SERVER.removeListener("ui-ocean-battle-confirm-boarding");
        INPUT_SERVER.clearHistory();
        var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="board"]`);
        element.children[0].classList.remove("hidden");
        element.children[1].classList.add("hidden");
        element.classList.remove("active");
    });
    if (uih.animations.indexOf(animateOceanBattleBoarding) < 0)
    {
        uih.animations.push(animateOceanBattleBoarding);
    }
}
function ocean_battle_fire_cannons()
{
    var wnpcid = OCEAN_BATTLE.turn_order_world_npcs[
        OCEAN_BATTLE.turn_order
    ];
    var world_npc = world_npcs[wnpcid];
    if (OCEAN_BATTLE.total_valid_cannon_coords === 0) { return; }
    if (animateOceanBattleCannon.entity_id !== null) { return; }
    var name_id = GAME_STRINGS.indexOf("ENTITY_CONFIRMATION");
    wasm.exports.entity_despawn(name_id);
    var start_x = world_npc.position_x;
    var start_y = world_npc.position_y;
    var intended_cannon_x = OCEAN_BATTLE.intended_cannon_coords[0];
    var intended_cannon_y = OCEAN_BATTLE.intended_cannon_coords[1];
    animateOceanBattleCannon.reset();
    animateOceanBattleCannon.start.x = start_x;
    animateOceanBattleCannon.start.y = start_y;
    animateOceanBattleCannon.current.x = animateOceanBattleCannon.start.x;
    animateOceanBattleCannon.current.y = animateOceanBattleCannon.start.y;
    animateOceanBattleCannon.end.x = intended_cannon_x;
    animateOceanBattleCannon.end.y = intended_cannon_y;
    animateOceanBattleCannon.callbacks.push(function () {
        INPUT_SERVER.removeListener("ui-ocean-battle-confirm-cannons");
        INPUT_SERVER.clearHistory();
        var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="cannons"]`);
        element.children[0].classList.remove("hidden");
        element.children[1].classList.add("hidden");
        element.classList.remove("active");
    });
    if (uih.animations.indexOf(animateOceanBattleCannon) < 0)
    {
        uih.animations.push(animateOceanBattleCannon);
    }
}
function ocean_battle_spawn_confirmation(x, y)
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_CONFIRMATION");
    wasm.exports.entity_spawn(name_id, x, y);
}
function ocean_battle_spawn_cannonball(x, y)
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_CANNONBALL");
    wasm.exports.entity_spawn(name_id, x, y);
}
function ocean_battle_spawn_sword(x, y)
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_SWORD");
    wasm.exports.entity_spawn(name_id, x, y);
}
function ocean_battle_move_cannonball(direction)
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_CANNONBALL");
    var entity_id = wasm.exports.find_storage_world_entity_by_name_id(name_id);
    if (direction === "up")
    {
        wasm.exports.move_world_entity_up(entity_id);
    }
    else if (direction === "down")
    {
        wasm.exports.move_world_entity_down(entity_id);
    }
    else if (direction === "left")
    {
        wasm.exports.move_world_entity_left(entity_id);
    }
    else if (direction === "right")
    {
        wasm.exports.move_world_entity_right(entity_id);
    }
}
function ocean_battle_despawn_cannonball()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_CANNONBALL");
    wasm.exports.entity_despawn(name_id);
    wasm.exports.scene_ocean_battle_fire_cannons();
}
function ocean_battle_despawn_confirmation()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_CONFIRMATION");
    wasm.exports.entity_despawn(name_id);
}
function ocean_battle_despawn_sword()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_SWORD");
    wasm.exports.entity_despawn(name_id);
    wasm.exports.scene_ocean_battle_board();
}
function ui_ocean_battle_show_valid_cannons()
{
    // TODO: I do not like calling this here
    wasm.exports.ob_get_in_range();
    if (OCEAN_BATTLE.total_valid_cannon_coords === 0) { return; }
    var name_id = GAME_STRINGS.indexOf("ENTITY_CANNON_TARGET");
    for (var i = 0; i < OCEAN_BATTLE.valid_cannon_coords.length; i += 2)
    {
        var x = OCEAN_BATTLE.valid_cannon_coords[i];
        var y = OCEAN_BATTLE.valid_cannon_coords[i + 1];
        wasm.exports.entity_spawn(name_id, x, y);
    }
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-cannon");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.addListener(
        "ui-ocean-battle-intended-cannon", function ()
        {
            var input_event = INPUT_SERVER.getLatestEntry();
            if (!input_event) { return; }
            if (input_event.type === "pointerup")
            {
                console.trace(input_event.mouse.viewport);
                if (!input_event.mouse.viewport) { return; }
                var valid_coords = false;
                for (var i = 0; i < OCEAN_BATTLE.valid_cannon_coords.length; i += 2)
                {
                    var x = OCEAN_BATTLE.valid_cannon_coords[i];
                    var y = OCEAN_BATTLE.valid_cannon_coords[i + 1];
                    if (x === input_event.mouse.viewport.world_x && y === input_event.mouse.viewport.world_y)
                    {
                        valid_coords = true;
                        break;
                    }
                }
                if (valid_coords)
                {
                    OCEAN_BATTLE.intended_cannon_coords[0] = input_event.mouse.viewport.world_x;
                    OCEAN_BATTLE.intended_cannon_coords[1] = input_event.mouse.viewport.world_y;
                    var x = input_event.mouse.viewport.world_x;
                    var y = input_event.mouse.viewport.world_y;
                    ocean_battle_spawn_confirmation(x, y);
                    ui_ocean_battle_confirm_cannons();
                }
            }
            // TODO: In keyboard mode, move a target around. In mouse, update target based on move
        }
    );
}
function ui_ocean_battle_confirm_cannons()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_CANNON_TARGET");
    wasm.exports.entity_despawn(name_id);
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-cannon");
    INPUT_SERVER.removeListener("ui-ocean-battle-confirm-cannons");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.addListener(
        "ui-ocean-battle-confirm-cannons", function ()
        {
            var input_event = INPUT_SERVER.getLatestEntry();
            if (!input_event) { return; }
            if (input_event.type === "pointerup")
            {
                console.trace(input_event.mouse.viewport);
                var valid_coords = false;
                for (var i = 0; i < OCEAN_BATTLE.valid_cannon_coords.length; i += 2)
                {
                    var x = OCEAN_BATTLE.valid_cannon_coords[i];
                    var y = OCEAN_BATTLE.valid_cannon_coords[i + 1];
                    if (x === OCEAN_BATTLE.intended_cannon_coords[0] && y === OCEAN_BATTLE.intended_cannon_coords[1])
                    {
                        console.log("TODO: Confirmed intended cannon coordinates.");
                        ocean_battle_fire_cannons();
                        break;
                    }
                }
            }
            // TODO: In keyboard mode, move a target around. In mouse, update target based on move
        }
    );
}
function ui_ocean_battle_hide_valid_cannons()
{
    if (OCEAN_BATTLE.total_valid_cannon_coords === 0) { return; }
    var name_id = GAME_STRINGS.indexOf("ENTITY_CANNON_TARGET");
    wasm.exports.entity_despawn(name_id);
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-cannon");
    OCEAN_BATTLE.intended_cannon_coords[0] = wasm.exports.get_sentry();
    OCEAN_BATTLE.intended_cannon_coords[1] = wasm.exports.get_sentry();
    name_id = GAME_STRINGS.indexOf("ENTITY_CONFIRMATION");
    wasm.exports.entity_despawn(name_id);
}
function ui_ocean_battle_hide_valid_moves()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_MOVEMENT");
    wasm.exports.entity_despawn(name_id);
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-move");
    OCEAN_BATTLE.intended_move_coords[0] = wasm.exports.get_sentry();
    OCEAN_BATTLE.intended_move_coords[1] = wasm.exports.get_sentry();
}
function ui_ocean_battle_show_valid_moves()
{
    // TODO: I do not like calling this here
    wasm.exports.ob_get_in_range();
    if (OCEAN_BATTLE.total_valid_move_coords === 0) { return; }
    var name_id = GAME_STRINGS.indexOf("ENTITY_MOVEMENT");
    for (var i = 0; i < OCEAN_BATTLE.valid_move_coords.length; i += 2)
    {
        var x = OCEAN_BATTLE.valid_move_coords[i];
        var y = OCEAN_BATTLE.valid_move_coords[i + 1];
        wasm.exports.entity_spawn(name_id, x, y);
    }
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-move");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.addListener(
        "ui-ocean-battle-intended-move", function ()
        {
            var input_event = INPUT_SERVER.getLatestEntry();
            if (!input_event) { return; }
            if (input_event.type === "pointerup")
            {
                console.trace(input_event.mouse.viewport);
                if (!input_event.mouse.viewport) { return; }
                var valid_coords = false;
                for (var i = 0; i < OCEAN_BATTLE.valid_move_coords.length; i += 2)
                {
                    var x = OCEAN_BATTLE.valid_move_coords[i];
                    var y = OCEAN_BATTLE.valid_move_coords[i + 1];
                    if (x === input_event.mouse.viewport.world_x && y === input_event.mouse.viewport.world_y)
                    {
                        valid_coords = true;
                        break;
                    }
                }
                if (valid_coords)
                {
                    OCEAN_BATTLE.intended_move_coords[0] = input_event.mouse.viewport.world_x;
                    OCEAN_BATTLE.intended_move_coords[1] = input_event.mouse.viewport.world_y;
                    var x = input_event.mouse.viewport.world_x;
                    var y = input_event.mouse.viewport.world_y;
                    ocean_battle_spawn_confirmation(x, y);
                    ui_ocean_battle_confirm_move();
                }
            }
            // TODO: In keyboard mode, move a target around. In mouse, update target based on move
        }
    );
}
function ui_ocean_battle_confirm_move()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_MOVEMENT");
    wasm.exports.entity_despawn(name_id);
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-move");
    INPUT_SERVER.removeListener("ui-ocean-battle-confirm-move");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.addListener(
        "ui-ocean-battle-confirm-move", function ()
        {
            var input_event = INPUT_SERVER.getLatestEntry();
            if (!input_event) { return; }
            if (input_event.type === "pointerup")
            {
                console.trace(input_event.mouse.viewport);
                var valid_coords = false;
                for (var i = 0; i < OCEAN_BATTLE.valid_move_coords.length; i += 2)
                {
                    var x = OCEAN_BATTLE.valid_move_coords[i];
                    var y = OCEAN_BATTLE.valid_move_coords[i + 1];
                    if (x === OCEAN_BATTLE.intended_move_coords[0] && y === OCEAN_BATTLE.intended_move_coords[1])
                    {
                        console.log("TODO: Confirmed intended move coordinates.");
                        ocean_battle_move();
                        break;
                    }
                }
            }
            // TODO: In keyboard mode, move a target around. In mouse, update target based on move
        }
    );
}
function ocean_battle_move()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_CONFIRMATION");
    wasm.exports.entity_despawn(name_id);
    var wnpcid = OCEAN_BATTLE.turn_order_world_npcs[
        OCEAN_BATTLE.turn_order
    ];
    var world_npc = world_npcs[wnpcid];
    if (OCEAN_BATTLE.total_valid_move_coords === 0) { return; }
    // TODO: Probably update animateOceanBattleCannon to do this too
    if (animateOceanBattleMove.animating === true) { return; }
    var name_id = GAME_STRINGS.indexOf("ENTITY_MOVEMENT");
    wasm.exports.entity_despawn(name_id);
    var start_x = world_npc.position_x;
    var start_y = world_npc.position_y;
    var intended_move_x = OCEAN_BATTLE.intended_move_coords[0];
    var intended_move_y = OCEAN_BATTLE.intended_move_coords[1];
    animateOceanBattleMove.reset();
    animateOceanBattleMove.start.x = start_x;
    animateOceanBattleMove.start.y = start_y;
    animateOceanBattleMove.current.x = animateOceanBattleMove.start.x;
    animateOceanBattleMove.current.y = animateOceanBattleMove.start.y;
    animateOceanBattleMove.end.x = intended_move_x;
    animateOceanBattleMove.end.y = intended_move_y;
    animateOceanBattleMove.callbacks.push(function () {
        INPUT_SERVER.removeListener("ui-ocean-battle-confirm-move");
        INPUT_SERVER.clearHistory();
        var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="move"]`);
        element.children[0].classList.remove("hidden");
        element.children[1].classList.add("hidden");
        element.classList.remove("active");
    });
    if (uih.animations.indexOf(animateOceanBattleMove) < 0)
    {
        uih.animations.push(animateOceanBattleMove);
    }
}
function ui_ocean_battle_show_valid_boardings()
{
    // TODO: I do not like calling this here
    wasm.exports.ob_get_in_range();
    if (OCEAN_BATTLE.total_valid_boarding_coords === 0) { return; }
    var name_id = GAME_STRINGS.indexOf("ENTITY_BOARDING_TARGET");
    for (var i = 0; i < OCEAN_BATTLE.valid_boarding_coords.length; i += 2)
    {
        var x = OCEAN_BATTLE.valid_boarding_coords[i];
        var y = OCEAN_BATTLE.valid_boarding_coords[i + 1];
        wasm.exports.entity_spawn(name_id, x, y);
    }
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-boarding");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.addListener(
        "ui-ocean-battle-intended-boarding", function ()
        {
            var input_event = INPUT_SERVER.getLatestEntry();
            if (!input_event) { return; }
            if (input_event.type === "pointerup")
            {
                console.trace(input_event.mouse.viewport);
                if (!input_event.mouse.viewport) { return; }
                var valid_coords = false;
                for (var i = 0; i < OCEAN_BATTLE.valid_boarding_coords.length; i += 2)
                {
                    var x = OCEAN_BATTLE.valid_boarding_coords[i];
                    var y = OCEAN_BATTLE.valid_boarding_coords[i + 1];
                    if (x === input_event.mouse.viewport.world_x && y === input_event.mouse.viewport.world_y)
                    {
                        valid_coords = true;
                        break;
                    }
                }
                if (valid_coords)
                {
                    OCEAN_BATTLE.intended_boarding_coords[0] = input_event.mouse.viewport.world_x;
                    OCEAN_BATTLE.intended_boarding_coords[1] = input_event.mouse.viewport.world_y;
                    var x = input_event.mouse.viewport.world_x;
                    var y = input_event.mouse.viewport.world_y;
                    ocean_battle_spawn_confirmation(x, y);
                    ui_ocean_battle_confirm_boarding();
                }
            }
            // TODO: In keyboard mode, move a target around. In mouse, update target based on move
        }
    );
}
function ui_ocean_battle_hide_valid_boardings()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_BOARDING_TARGET");
    wasm.exports.entity_despawn(name_id);
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-boarding");
    OCEAN_BATTLE.intended_boarding_coords[0] = wasm.exports.get_sentry();
    OCEAN_BATTLE.intended_boarding_coords[1] = wasm.exports.get_sentry();
    name_id = GAME_STRINGS.indexOf("ENTITY_CONFIRMATION");
    wasm.exports.entity_despawn(name_id);
}
function ui_ocean_battle_confirm_boarding()
{
    var name_id = GAME_STRINGS.indexOf("ENTITY_BOARDING_TARGET");
    wasm.exports.entity_despawn(name_id);
    INPUT_SERVER.removeListener("ui-ocean-battle-intended-boarding");
    INPUT_SERVER.removeListener("ui-ocean-battle-confirm-boarding");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.addListener(
        "ui-ocean-battle-confirm-boarding", function ()
        {
            var input_event = INPUT_SERVER.getLatestEntry();
            if (!input_event) { return; }
            if (input_event.type === "pointerup")
            {
                console.trace(input_event.mouse.viewport);
                var valid_coords = false;
                for (var i = 0; i < OCEAN_BATTLE.valid_boarding_coords.length; i += 2)
                {
                    var x = OCEAN_BATTLE.valid_boarding_coords[i];
                    var y = OCEAN_BATTLE.valid_boarding_coords[i + 1];
                    if (x === OCEAN_BATTLE.intended_boarding_coords[0] && y === OCEAN_BATTLE.intended_boarding_coords[1])
                    {
                        console.log("TODO: Confirmed intended boarding coordinates.");
                        ocean_battle_board_ship();
                        break;
                    }
                }
            }
            // TODO: In keyboard mode, move a target around. In mouse, update target based on move
        }
    );
}

function ocean_battle_is_players_turn()
{
    var to = OCEAN_BATTLE.turn_order;
    var fleet_ship_id = OCEAN_BATTLE.turn_order_fleet_ships[to];
    var fleet_ship = new GAME_DATA_FLEET_SHIP(wasm.exports, [fleet_ship_id]);
    var fleet = new GAME_DATA_FLEET(wasm.exports, [fleet_ship.fleet_id]);
    // Note: General ID 0 should always be the player
    if (fleet.general_id === 0)
    {
        return true;
    }
    return false;
}

function ui_ocean_battle_initialize()
{
    if (CURRENT_SCENE !== null && CURRENT_SCENE.INITIALIZED === 1) { return; }
    if (CURRENT_SCENE !== null && CURRENT_SCENE.RENDERED === 1) { return; }
    CURRENT_SCENE = new GAME_DATA_SCENE_OCEAN_BATTLE(wasm.exports);
    CURRENT_SCENE.INITIALIZED = false;
    CURRENT_SCENE.RENDERED = false;
    CURRENT_SCENE.LAST_INPUT_MODE = false;
    CURRENT_SCENE.DEFAULT_ELEMENT = false;
    CURRENT_SCENE.COMPONENT = document.querySelector("ui-ocean-battle");
    INPUT_SERVER.clearHistory();
    INPUT_SERVER.removeListener("ui-ocean-battle");
    INPUT_SERVER.addListener(
        "ui-ocean-battle", ui_scene_default_input_listener
    );
    INPUT_SERVER.removeListener("ui-ocean-battle-hover");
    INPUT_SERVER.addListener(
        "ui-ocean-battle-hover",
        function ()
        {
            var input_event = INPUT_SERVER.getLatestEntry();
            if (!input_event) { return; }
            if (input_event.type === "pointermove")
            {
                if (input_event.mouse.viewport === null) { return; }
                var x = input_event.mouse.viewport.world_x;
                var y = input_event.mouse.viewport.world_y;
                for (var i = 0; i < world_npcs.length; ++i)
                {
                    world_npcs[i].poops = "";
                    if (world_npcs[i].position_x === x && world_npcs[i].position_y === y)
                    {
                        var element = document.querySelector(`[data-npc-id="${world_npcs[i].id}"`);
                        if (element)
                        {
                            for (var fs = 0; fs < wasm.exports.get_max_fleet_ships(); ++fs)
                            {
                                var fleet_ship = new GAME_DATA_FLEET_SHIP(wasm.exports, [fs]);
                                if (fleet_ship.id === world_npcs[i].entity_id)
                                {
                                    for (var s = 0; s < wasm.exports.get_max_ships(); ++s)
                                    {
                                        var ship = new GAME_DATA_SHIP(wasm.exports, [s]);
                                        if (ship.id === fleet_ship.ship_id)
                                        {
                                            console.log(world_npcs[i].entity_id, fleet_ship.id, fleet_ship.ship_id, ship.id);
                                            world_npcs[i].poops = `
                                                <div class="ocean_battle_ship_info" style="text-align: center; background-color: rgba(0, 0, 0, 0.5);">${ship.durability}</div>
                                                <div class="ocean_battle_ship_info" style="text-align: center; background-color: rgba(255, 0, 0, 0.6); color: white;">${ship.crew}</div>
                                            `;
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    );
    // Note: Need to have this so we have access to ocean battle data
    OCEAN_BATTLE = new GAME_DATA_OCEAN_BATTLE(wasm.exports);
    ui_ocean_battle_screen_home();
}
function ui_ocean_battle_exit()
{
    INPUT_SERVER.removeListener("ui-ocean-battle");
    INPUT_SERVER.removeListener("ui-ocean-battle-hover");
    CURRENT_SCENE.COMPONENT.clearHTML();
    CURRENT_SCENE = null;
    OCEAN_BATTLE = null;
    wasm.exports.scene_ocean_battle_exit();
}
function ui_ocean_battle_button_wrapper_hover(element)
{
    var css = `
        font-size: 14px;
        color: white;
        width: ${TILE_SIZE_SCALED}px;
        height: ${TILE_SIZE_SCALED}px;
        zoom: var(--zoom);
        background-color: rgba(0, 0, 0, 0.3);
        cursor: pointer;
    `;
    if (element)
    {
        element.style.cssText = css;
    }
    return css;
}
function ui_ocean_battle_button_wrapper_no_hover(element)
{
    var css = `
        font-size: 14px;
        color: white;
        width: ${TILE_SIZE_SCALED}px;
        height: ${TILE_SIZE_SCALED}px;
        zoom: var(--zoom);
        background-color: rgba(0, 0, 0, 0.15);
        cursor: pointer;
    `;
    if (element)
    {
        element.style.cssText = css;
    }
    return css;
}
function ui_ocean_battle_button_wrapper_two_columns_hover(element)
{
    var css = `
        font-size: 12px;
        color: white;
        width: ${TILE_SIZE_SCALED * 2}px;
        height: ${TILE_SIZE_SCALED}px;
        zoom: var(--zoom);
        background-color: rgba(0, 0, 0, 0.3);
        cursor: pointer;
        grid-column: 1 / 3;
        align-content: center;
        text-align: center;
        text-shadow: 0px 0px 3px black;
    `;
    if (element)
    {
        element.style.cssText = css;
    }
    return css;
}
function ui_ocean_battle_button_wrapper_two_columns_no_hover(element)
{
    var css = `
        font-size: 12px;
        color: white;
        width: ${TILE_SIZE_SCALED * 2}px;
        height: ${TILE_SIZE_SCALED}px;
        zoom: var(--zoom);
        background-color: rgba(0, 0, 0, 0.15);
        cursor: pointer;
        grid-column: 1 / 3;
        align-content: center;
        text-align: center;
        text-shadow: 0px 0px 3px black;
    `;
    if (element)
    {
        element.style.cssText = css;
    }
    return css;
}
function ui_ocean_battle_screen_home()
{
    if (CURRENT_SCENE.RENDERED === 1) { return; }
    CURRENT_SCENE.ACTIONS = {
        get_ship_details: function () {},
        view_map: function () {},
        board: function () {
            var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="board"]`);
            if (element.classList.contains("active"))
            {
                ui_ocean_battle_hide_valid_boardings();
                element.children[0].classList.remove("hidden");
                element.children[1].classList.add("hidden");
                element.classList.remove("active");
            }
            else
            {
                ui_ocean_battle_show_valid_boardings();
                element.children[0].classList.add("hidden");
                element.children[1].classList.remove("hidden");
                element.classList.add("active");
            }
        },
        cannons: function () {
            var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="cannons"]`);
            if (element.classList.contains("active"))
            {
                ui_ocean_battle_hide_valid_cannons();
                element.children[0].classList.remove("hidden");
                element.children[1].classList.add("hidden");
                element.classList.remove("active");
            }
            else
            {
                ui_ocean_battle_show_valid_cannons();
                element.children[0].classList.add("hidden");
                element.children[1].classList.remove("hidden");
                element.classList.add("active");
            }
        },
        move: function () {
            var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="move"]`);
            if (element.classList.contains("active"))
            {
                ui_ocean_battle_hide_valid_moves();
                element.children[0].classList.remove("hidden");
                element.children[1].classList.add("hidden");
                element.classList.remove("active");
            }
            else
            {
                ui_ocean_battle_show_valid_moves();
                element.children[0].classList.add("hidden");
                element.children[1].classList.remove("hidden");
                element.classList.add("active");
            }
        },
        view_fleet: function () {},
        end_turn: function () {
            var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="end_turn"]`);
            if (ocean_battle_is_players_turn())
            {
                if (element.classList.contains("confirm"))
                {
                    element.classList.remove("confirm");
                    element.innerHTML = "End Turn";
                    wasm.exports.scene_ocean_battle_end_turn();
                    CURRENT_SCENE.ACTIONS.end_turn();
                }
                else
                {
                    element.classList.add("confirm");
                    element.innerHTML = "Are you sure?";
                }
            }
            else
            {
                element.classList.remove("confirm");
                element.innerHTML = "Running NPC Turn";
                console.log("NPC TURN");
                // wasm.exports.scene_ocean_battle_end_turn();
                // first move
                // cannon || board
                var wnpcid = OCEAN_BATTLE.turn_order_world_npcs[
                    OCEAN_BATTLE.turn_order
                ];
                var world_npc = world_npcs[wnpcid];
                console.log(world_npc.id);
                if (OCEAN_BATTLE.total_valid_move_coords > 0)
                {
                    var start_x = world_npc.position_x;
                    var start_y = world_npc.position_y;
                    var intended_move_x = OCEAN_BATTLE.intended_move_coords[0];
                    var intended_move_y = OCEAN_BATTLE.intended_move_coords[1];
                    animateOceanBattleMove.reset();
                    animateOceanBattleMove.start.x = start_x;
                    animateOceanBattleMove.start.y = start_y;
                    animateOceanBattleMove.current.x = animateOceanBattleMove.start.x;
                    animateOceanBattleMove.current.y = animateOceanBattleMove.start.y;
                    animateOceanBattleMove.end.x = intended_move_x;
                    animateOceanBattleMove.end.y = intended_move_y;
                    console.log("About to move NPC animation");
                    animateOceanBattleMove.callbacks.push(function () {
                        console.log("?");
                        if (OCEAN_BATTLE.total_valid_cannon_coords > 0)
                        {
                            // TODO: Do cannon
                            // in callback, run end npc turn
                            var wnpcid = OCEAN_BATTLE.turn_order_world_npcs[
                                OCEAN_BATTLE.turn_order
                            ];
                            var world_npc = world_npcs[wnpcid];
                            // if (OCEAN_BATTLE.total_valid_cannon_coords === 0) { return; }
                            if (animateOceanBattleCannon.entity_id !== null) { return; }
                            var start_x = world_npc.position_x;
                            var start_y = world_npc.position_y;
                            var intended_cannon_x = OCEAN_BATTLE.intended_cannon_coords[0];
                            var intended_cannon_y = OCEAN_BATTLE.intended_cannon_coords[1];
                            animateOceanBattleCannon.reset();
                            animateOceanBattleCannon.start.x = start_x;
                            animateOceanBattleCannon.start.y = start_y;
                            animateOceanBattleCannon.current.x = animateOceanBattleCannon.start.x;
                            animateOceanBattleCannon.current.y = animateOceanBattleCannon.start.y;
                            animateOceanBattleCannon.end.x = intended_cannon_x;
                            animateOceanBattleCannon.end.y = intended_cannon_y;
                            animateOceanBattleCannon.callbacks.push(function () {
                                console.log("NPC ATtack ended?");
                                wasm.exports.scene_ocean_battle_run_npc_turn();
                                element.innerHTML = "End Turn";
                            });
                            if (uih.animations.indexOf(animateOceanBattleCannon) < 0)
                            {
                                uih.animations.push(animateOceanBattleCannon);
                            }
                        }
                        else if (OCEAN_BATTLE.total_valid_boarding_coords > 0)
                        {
                            // TODO: Do board
                            // in callback, run end npc turn
                        }
                        else
                        {
                            console.log("TODO: I guess deal with move ending?");
                            wasm.exports.scene_ocean_battle_run_npc_turn();
                            element.innerHTML = "End Turn";
                        }
                    });
                    if (uih.animations.indexOf(animateOceanBattleMove) < 0)
                    {
                        uih.animations.push(animateOceanBattleMove);
                    }
                }
                else
                {
                    console.log("No moves for NPC?");
                }
            }
        },
    };
    CURRENT_SCENE.STYLES = {
        button_wrapper: {
            default: ui_ocean_battle_button_wrapper_no_hover,
            hover: ui_ocean_battle_button_wrapper_hover,
        },
        button_wrapper_two_columns: {
            default: ui_ocean_battle_button_wrapper_two_columns_no_hover,
            hover: ui_ocean_battle_button_wrapper_two_columns_hover,
        },
        button: {
            default: function () {
                return `
                    width: ${TILE_SIZE_SCALED}px;
                    height: ${TILE_SIZE_SCALED}px;
                    background-image: var(--atlas-image);
                    background-size: var(--bg-size);
                `;
            }
        }
    };
    var position_x = VIEWPORT.width - 2;
    var position_y = VIEWPORT.height - 4;
    var button_wrapper_style = CURRENT_SCENE.STYLES.button_wrapper.default();
    var button_wrapper_two_columns_style = CURRENT_SCENE.STYLES.button_wrapper_two_columns.default();
    var menu_style = `
        border: 1px solid black;
        position: absolute;
        top: ${position_y * TILE_SIZE_SCALED * zoom};
        left: ${position_x * TILE_SIZE_SCALED * zoom};
        display: grid;
        grid-template-columns: 1fr 1fr;
        z-index: 99;
    `;
    var button_style = CURRENT_SCENE.STYLES.button.default();
    var html = `
    <div style="${menu_style}">
        <div style-id="button_wrapper" data-id="get_ship_details" style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("icon_telescope")}"></div>
        </div>
        <div style-id="button_wrapper" data-id="view_map" style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("icon_map")}"></div>
        </div>
        <div nav-down="move" style-id="button_wrapper" data-id="board" ${DEFAULT_INPUT_ACTIONS} style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("icon_gold_sword")}"></div>
            <div class="hidden" style="${button_style} ${atlasToBGPosition("icon_thumbs_down")}"></div>
        </div>
        <div nav-down="view_fleet" style-id="button_wrapper" data-id="cannons" ${DEFAULT_INPUT_ACTIONS} style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("icon_cannon")}"></div>
            <div class="hidden" style="${button_style} ${atlasToBGPosition("icon_thumbs_down")}"></div>
        </div>
        <div nav-up="board" style-id="button_wrapper" data-id="move" ${DEFAULT_INPUT_ACTIONS} style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("icon_steering_wheel")}"></div>
            <div class="hidden" style="${button_style} ${atlasToBGPosition("icon_thumbs_down")}"></div>
        </div>
        <div style-id="button_wrapper" data-id="view_fleet" style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("icon_fleet")}"></div>
        </div>
        <!--<div style-id="button_wrapper" data-id="cancel" style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("icon_red_cancel")}"></div>
            <div class="hidden" style="${button_style} ${atlasToBGPosition("icon_thumbs_down")}"></div>
        </div>
        <div style="${button_wrapper_style}">
            <div style="${button_style} ${atlasToBGPosition("empty")}"></div>
        </div>-->
        <div style-id="button_wrapper_two_columns" data-id="end_turn" ${DEFAULT_INPUT_ACTIONS} style="${button_wrapper_two_columns_style}">
            End Turn
        </div>
    </div>`;
    // CURRENT_SCENE.DEFAULT_ELEMENT = "cancel";
    CURRENT_SCENE.COMPONENT.updateHTML(html);
    CURRENT_SCENE.RENDERED = 1;
}