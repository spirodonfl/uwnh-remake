package rom

import "../common"
import "core:fmt"

lookup_goods := make([dynamic]i32)
existing_lookup_good_ids: map[i32]bool
current_good_id: i32 = 1

create_a_good :: proc(id: i32, extra_length: i32 = 0) -> []i32 {
    if existing_lookup_good_ids[id] {
        fmt.println("Error: ID", id, "already exists")
        return nil
    }

    existing_lookup_good_ids[id] = true

    final_length := i32(len(common.EnumGood))
    if extra_length > 0 {
        final_length += extra_length
    }
    
    game_array := create_game_array_via(&lookup_goods, final_length, i32(common.EnumLookupTypes.Good), id)
    common.lookup_data_goods = lookup_goods[:]

    return game_array
}

create_a_good_into_all :: proc(id: i32, extra_length: i32 = 0) {
    data_array := create_a_good(id, extra_length)
    append_to_all_data(data_array)
}

create_new_good :: proc(extra_length: i32 = 0) -> i32 {
    create_a_good_into_all(current_good_id, extra_length)
    current_good_id += 1
    return current_good_id
}