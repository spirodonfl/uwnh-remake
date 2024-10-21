package common

import "../js"

// current_scene: string
// current_scene_step: i32 = 0

// import "core:fmt"

// Scene_Handler :: proc(step: i32)

// scene_handlers := map[string]Scene_Handler{
//     "cool_scene_of_awesomeness" = proc(step: i32) {
//         switch step {
//             case 0:
//                 load_world("some_world")
//                 set_npc_hp("some_npc", 200)
//                 current_scene_step += 1
//             case 1:
//                 dialogue("More dialogue text that does not have to exist anywhere")
//                 current_scene_step += 1
//             case 2:
//                 // TODO: clear_scene() which puts GAME_MODE into whatever is appropriate
//         }
//     },
//     // Add more scenes as needed
// }

// handle_scene :: proc(scene_id: string) {
//     if handler, ok := scene_handlers[scene_id]; ok {
//         handler(current_scene_step)
//     } else {
//         fmt.println("Unknown scene:", scene_id)
//     }
// }