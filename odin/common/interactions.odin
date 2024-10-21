package common

import "../js"

// current_interaction_id: string
// current_interaction_step: i32 = 0

// initiate_interaction_by_npc :: proc(npc_id: string) {
//     switch id in npc_id {
//         case "npc_world_1_market_owner":
//             handle_interaction("some interaction!")
//     }
// }

// handle_interaction :: proc(interaction_id: string) {
//     switch id in interaction_id {
//         case "some interaction!":
//             switch step in current_interaction_step {
//                 case 0:
//                     // dialogue("Some dialogue text here that does not have to necessarily exist anywhere else FOR NOW")
//                     current_interaction_step += 1
//                 case 1:
//                     // TODO: clear_interaction() which puts GAME_MODE back into whatever
//             }
//     }
// }
