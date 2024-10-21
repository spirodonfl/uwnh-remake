package game

import "../common"

// TODO: These should all be in "common" and then exported here

GAME_MODES :: enum i32 {
    Empty,
    In_Game_Battle,
    In_Game_Duel,
    In_Game_Ocean,
    In_Game_Port,
    In_Game_Land,
    In_Game_City,
    In_Game_Scene,
    In_Game_Dialogue,
    In_Game_Menu,
    Opening_Title,
    Opening_Menu, // Load, New Game, Options, About, etc...
    Opening_New_Game // Enter Name + Stats?
}
current_game_mode := i32(GAME_MODES.Empty)
@(export)
get_current_game_mode :: proc() -> i32 {
    return current_game_mode
}
@(export)
set_current_game_mode :: proc(mode: i32) {
    current_game_mode = mode
}
@(export)
set_current_game_mode_to_in_game_ocean :: proc() {
    set_current_game_mode(i32(GAME_MODES.In_Game_Ocean))
}
@(export)
set_current_game_mode_to_in_game_port :: proc() {
    set_current_game_mode(i32(GAME_MODES.In_Game_Port))
}
@(export)
set_current_game_mode_to_in_game_menu :: proc() {
    set_current_game_mode(i32(GAME_MODES.In_Game_Menu))
}
@(export)
is_current_game_mode_in_ocean :: proc() -> bool {
    return current_game_mode == i32(GAME_MODES.In_Game_Ocean)
}
@(export)
is_current_game_mode_in_port :: proc() -> bool {
    return current_game_mode == i32(GAME_MODES.In_Game_Port)
}
@(export)
is_current_game_mode_in_menu :: proc() -> bool {
    return current_game_mode == i32(GAME_MODES.In_Game_Menu)
}