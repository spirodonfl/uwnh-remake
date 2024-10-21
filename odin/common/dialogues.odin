package common

import "../js"

// TODO: For localization, during ROM phase, you can default to english
// In other languages, set a locale
// load locale on game initialization
// in dialogue function, if locale is set, get current text
// iterate locale array to match current english text
// if matched, return string of locale instead of current english text

current_dialogue_string: string

dialogue :: proc(text: string) {
    current_dialogue_string = text
    // TODO: Wait for input to clear dialogue maybe?
}


/*import "core:fmt"
import "common"

DialogueState :: enum {
    Display_Dialogue,
    Wait_For_Read_Confirmation,
    Display_Confirmation_Dialogue,
    Wait_For_Confirm_Deny,
    End_Dialogue,
}

DialogueTransition :: enum {
    To_Wait_Read,
    To_Display_Confirm,
    To_Wait_Confirm_Deny,
    To_End,
}

DialogueFSM :: struct {
    fsm: common.FSM(DialogueState, DialogueTransition),
    current_dialogue: string,
    current_input_state: DialogueState,
}

dialogue_fsm: DialogueFSM

// Simulated game functions
move_npc :: proc(npc_id: int, x, y: float) {
    fmt.printf("Moving NPC %d to position (%.2f, %.2f)\n", npc_id, x, y)
}

move_camera :: proc(x, y: float) {
    fmt.printf("Moving camera to position (%.2f, %.2f)\n", x, y)
}

set_npc_hp :: proc(npc_id: int, hp: int) {
    fmt.printf("Setting NPC %d HP to %d\n", npc_id, hp)
}

create_dialogue_fsm :: proc() -> DialogueFSM {
    fsm := DialogueFSM{
        fsm = common.create_fsm(DialogueState, DialogueTransition),
        current_dialogue = "",
        current_input_state = .Display_Dialogue,
    }

    common.add_state(&fsm.fsm, .Display_Dialogue, display_dialogue_enter, display_dialogue_exit)
    common.add_state(&fsm.fsm, .Wait_For_Read_Confirmation, wait_for_read_confirmation_enter, nil)
    common.add_state(&fsm.fsm, .Display_Confirmation_Dialogue, display_confirmation_dialogue_enter, nil)
    common.add_state(&fsm.fsm, .Wait_For_Confirm_Deny, wait_for_confirm_deny_enter, nil)
    common.add_state(&fsm.fsm, .End_Dialogue, end_dialogue_enter, end_dialogue_exit)

    common.add_transition(&fsm.fsm, .To_Wait_Read, .Display_Dialogue, .Wait_For_Read_Confirmation, to_wait_read_transition)
    common.add_transition(&fsm.fsm, .To_Display_Confirm, .Wait_For_Read_Confirmation, .Display_Confirmation_Dialogue, to_display_confirm_transition)
    common.add_transition(&fsm.fsm, .To_Wait_Confirm_Deny, .Display_Confirmation_Dialogue, .Wait_For_Confirm_Deny, to_wait_confirm_deny_transition)
    common.add_transition(&fsm.fsm, .To_End, .Wait_For_Confirm_Deny, .End_Dialogue, to_end_transition)

    common.set_initial_state(&fsm.fsm, .Display_Dialogue)

    return fsm
}

display_dialogue_enter :: proc() {
    fmt.println("Entering Display_Dialogue state")
    fmt.println("Displaying dialogue:", dialogue_fsm.current_dialogue)
    move_camera(0, 0) // Center camera
    move_npc(1, 100, 100) // Move NPC to dialogue position
}

display_dialogue_exit :: proc() {
    fmt.println("Exiting Display_Dialogue state")
    move_npc(1, 150, 150) // Move NPC back to original position
}

wait_for_read_confirmation_enter :: proc() {
    fmt.println("Entering Wait_For_Read_Confirmation state")
    fmt.println("Waiting for read confirmation...")
}

display_confirmation_dialogue_enter :: proc() {
    fmt.println("Entering Display_Confirmation_Dialogue state")
    dialogue_fsm.current_dialogue = "Do you accept? Press 'A' for yes, 'B' for no."
    fmt.println("Displaying confirmation dialogue:", dialogue_fsm.current_dialogue)
    move_camera(50, 50) // Slightly move camera for emphasis
}

wait_for_confirm_deny_enter :: proc() {
    fmt.println("Entering Wait_For_Confirm_Deny state")
    fmt.println("Waiting for confirm/deny input...")
}

end_dialogue_enter :: proc() {
    fmt.println("Entering End_Dialogue state")
    fmt.println("Dialogue ended.")
}

end_dialogue_exit :: proc() {
    fmt.println("Exiting End_Dialogue state")
    move_camera(0, 0) // Reset camera position
    set_npc_hp(1, 100) // Reset NPC HP
}

to_wait_read_transition :: proc() {
    fmt.println("Transitioning to Wait_For_Read_Confirmation")
    move_npc(2, 200, 200) // Move another NPC into view
}

to_display_confirm_transition :: proc() {
    fmt.println("Transitioning to Display_Confirmation_Dialogue")
    set_npc_hp(1, 80) // Reduce NPC HP for dramatic effect
}

to_wait_confirm_deny_transition :: proc() {
    fmt.println("Transitioning to Wait_For_Confirm_Deny")
}

to_end_transition :: proc() {
    fmt.println("Transitioning to End_Dialogue")
    move_npc(2, 300, 300) // Move the other NPC out of view
}

init_dialogue :: proc() {
    dialogue_fsm = create_dialogue_fsm()
}

set_dialogue :: proc(dialogue: string) {
    dialogue_fsm.current_dialogue = dialogue
    common.set_initial_state(&dialogue_fsm.fsm, .Display_Dialogue)
}

get_current_input_state :: proc() -> DialogueState {
    return dialogue_fsm.current_input_state
}

handle_input :: proc(is_button_a: bool) {
    current_state := common.get_current_state(&dialogue_fsm.fsm)
    
    switch current_state {
    case .Wait_For_Read_Confirmation:
        if is_button_a {
            common.transition(&dialogue_fsm.fsm, .To_Display_Confirm)
        }
    case .Wait_For_Confirm_Deny:
        if is_button_a {
            fmt.println("User confirmed")
            set_npc_hp(1, 100) // Restore NPC HP on confirmation
        } else {
            fmt.println("User denied")
            set_npc_hp(1, 50) // Further reduce NPC HP on denial
        }
        common.transition(&dialogue_fsm.fsm, .To_End)
    }
}*/