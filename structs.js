class GAME_DATA_SCENE {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_scene_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_scene_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_scene_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_scene_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_scene_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flags() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 1 * 4, 10);
    }

    get strings() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 11 * 4, 10);
    }

    get actions() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 21 * 4, 10);
    }

    get action_flags() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 31 * 4, 10);
    }

    get error_code() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 41 * 4, true);
    }
    set error_code(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 41 * 4, value, true);
    }

}

class GAME_DATA_SCENE_SINGLE_DIALOG {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_scene_single_dialog_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_scene_single_dialog_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_scene_single_dialog_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_scene_single_dialog_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_scene_single_dialog_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get dialog_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set dialog_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get flag_initialized() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set flag_initialized(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get flag_confirmed() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set flag_confirmed(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get previous_game_mode() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set previous_game_mode(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get error_code() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set error_code(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

}

class GAME_DATA_SCENE_GENERAL_SHOP {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_scene_general_shop_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_scene_general_shop_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_scene_general_shop_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_scene_general_shop_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_scene_general_shop_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get flag_confirmed() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set flag_confirmed(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get flag_bought() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set flag_bought(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get previous_game_mode() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set previous_game_mode(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get inventory_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set inventory_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get chosen_items() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 6 * 4, 100);
    }

    get error_code() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 106 * 4, true);
    }
    set error_code(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 106 * 4, value, true);
    }

}

class GAME_DATA_SCENE_BLACKJACK {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_scene_blackjack_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_scene_blackjack_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_scene_blackjack_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_scene_blackjack_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_scene_blackjack_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get flag_confirmed() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set flag_confirmed(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get previous_game_mode() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set previous_game_mode(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get error_code() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set error_code(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get dialog_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set dialog_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

}

class GAME_DATA_SCENE_BANK {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_scene_bank_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_scene_bank_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_scene_bank_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_scene_bank_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_scene_bank_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get previous_game_mode() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set previous_game_mode(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get error_code() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set error_code(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get dialog_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set dialog_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

}

class GAME_DATA_BANK {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_bank_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_bank_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_bank_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_bank_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_bank_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get deposit_interest_rate() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set deposit_interest_rate(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get loan_interest_rate() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set loan_interest_rate(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get deposit_amount() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set deposit_amount(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get loan_amount() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set loan_amount(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get deposit_max_amount() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set deposit_max_amount(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get loan_max_amount() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set loan_max_amount(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get to_deposit() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set to_deposit(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get to_loan() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set to_loan(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get to_pay_loan() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 8 * 4, true);
    }
    set to_pay_loan(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get to_withdraw() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 9 * 4, true);
    }
    set to_withdraw(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 9 * 4, value, true);
    }

}

class GAME_DATA_NPC {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_npc_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_npc_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_npc_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_npc_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_npc_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get type() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set type(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

}

function game_get_storage_npc_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_npc_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_npc_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_npc_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_npc_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_npc_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_GENERAL_ITEM {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_general_item_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_general_item_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_general_item_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_general_item_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_general_item_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

}

function game_get_storage_general_item_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_general_item_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_general_item_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_general_item_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_general_item_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_general_item_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_BASE_SHIP {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_base_ship_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_base_ship_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_base_ship_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_base_ship_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_base_ship_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get top_material_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set top_material_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get max_capacity() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set max_capacity(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get tacking() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set tacking(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get power() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set power(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get speed() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set speed(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

}

function game_get_storage_base_ship_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_base_ship_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_base_ship_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_base_ship_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_base_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_base_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_SHIP {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_ship_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_ship_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_ship_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_ship_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_ship_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_ship_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_ship_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get material_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set material_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get capacity() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set capacity(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get tacking() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set tacking(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get power() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set power(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get speed() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 8 * 4, true);
    }
    set speed(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 8 * 4, value, true);
    }

}

function game_get_storage_ship_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_ship_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_ship_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_ship_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_SHIP_MATERIAL {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_ship_material_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_ship_material_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_ship_material_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_ship_material_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_ship_material_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get mod_power() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set mod_power(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get mod_capacity() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set mod_capacity(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get mod_tacking() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set mod_tacking(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get mod_speed() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set mod_speed(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

}

function game_get_storage_ship_material_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_ship_material_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_ship_material_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_ship_material_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_ship_material_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_ship_material_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_GOOD {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_good_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_good_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_good_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_good_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_good_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

}

function game_get_storage_good_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_good_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_good_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_good_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_good_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_good_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_WEAPON {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_weapon_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_weapon_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_weapon_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_weapon_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_weapon_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get power() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set power(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

}

function game_get_storage_weapon_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_weapon_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_weapon_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_weapon_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_weapon_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_weapon_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_ARMOR {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_armor_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_armor_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_armor_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_armor_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_armor_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get defense() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set defense(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

}

function game_get_storage_armor_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_armor_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_armor_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_armor_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_armor_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_armor_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_SPECIAL_ITEM {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_special_item_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_special_item_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_special_item_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_special_item_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_special_item_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

}

function game_get_storage_special_item_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_special_item_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_special_item_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_special_item_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_special_item_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_special_item_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_WORLD {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_world_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_world_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_world_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_world_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_world_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get width() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set width(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get height() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set height(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get total_npcs() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set total_npcs(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get total_captains() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set total_captains(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get total_layers() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set total_layers(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get layers() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 7 * 4, 10);
    }

}

function game_get_storage_world_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_world_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_world_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_world_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_world_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_world_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_WORLD_NPC {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_world_npc_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_world_npc_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_world_npc_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_world_npc_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_world_npc_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get npc_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set npc_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get position_x() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set position_x(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get position_y() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set position_y(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get direction() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set direction(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get is_interactable() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set is_interactable(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get is_captain() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set is_captain(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get interaction_scene() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 8 * 4, true);
    }
    set interaction_scene(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get is_player() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 9 * 4, true);
    }
    set is_player(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 9 * 4, value, true);
    }

    get inventory_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 10 * 4, true);
    }
    set inventory_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 10 * 4, value, true);
    }

    get entity_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 11 * 4, true);
    }
    set entity_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 11 * 4, value, true);
    }

    get captain_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 12 * 4, true);
    }
    set captain_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 12 * 4, value, true);
    }

    get type_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 13 * 4, true);
    }
    set type_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 13 * 4, value, true);
    }

}

function game_get_storage_world_npc_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_world_npc_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_world_npc_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_world_npc_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_world_npc_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_world_npc_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 1000);
}

class GAME_DATA_CAPTAIN {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_captain_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_captain_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_captain_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_captain_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_captain_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get npc_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set npc_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get world_npc_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set world_npc_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get in_world() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set in_world(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get global_position_x() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set global_position_x(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get global_position_y() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set global_position_y(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get in_port() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set in_port(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get on_land() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 8 * 4, true);
    }
    set on_land(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get in_ocean() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 9 * 4, true);
    }
    set in_ocean(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 9 * 4, value, true);
    }

    get sailing() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 10 * 4, true);
    }
    set sailing(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 10 * 4, value, true);
    }

    get gold() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 11 * 4, true);
    }
    set gold(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 11 * 4, value, true);
    }

    get inventory_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 12 * 4, true);
    }
    set inventory_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 12 * 4, value, true);
    }

    get player_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 13 * 4, true);
    }
    set player_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 13 * 4, value, true);
    }

    get general_of_fleet_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 14 * 4, true);
    }
    set general_of_fleet_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 14 * 4, value, true);
    }

}

function game_get_storage_captain_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_captain_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_captain_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_captain_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_captain_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_captain_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_LAYER {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_layer_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_layer_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_layer_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_layer_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_layer_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get is_block() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set is_block(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get width() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set width(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get height() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set height(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get same_value() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set same_value(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get specific_coordinates_size() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set specific_coordinates_size(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get data() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 7 * 4, 2500);
    }

}

function game_get_storage_layer_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_layer_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_layer_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_layer_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_layer_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_layer_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 1000);
}

class GAME_DATA_INVENTORY_ITEM {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_inventory_item_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_inventory_item_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_inventory_item_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_inventory_item_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_inventory_item_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get number_held() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set number_held(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get adjusted_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set adjusted_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get type() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set type(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get type_reference() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set type_reference(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get inventory_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set inventory_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

}

function game_get_storage_inventory_item_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_inventory_item_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_inventory_item_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_inventory_item_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_inventory_item_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_inventory_item_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 1000);
}

class GAME_DATA_INVENTORY {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_inventory_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_inventory_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_inventory_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_inventory_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_inventory_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get total_items() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set total_items(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get inventory_items() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 3 * 4, 100);
    }

}

function game_get_storage_inventory_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_inventory_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_inventory_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_inventory_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_inventory_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_inventory_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 1000);
}

class GAME_DATA_PORT {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_port_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_port_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_port_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_port_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_port_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get global_location_x() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set global_location_x(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get global_location_y() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set global_location_y(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get overall_investment_level() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set overall_investment_level(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get market_investment_level() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set market_investment_level(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get shipyard_investment_level() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set shipyard_investment_level(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

}

function game_get_storage_port_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_port_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_port_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_port_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_port_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_port_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_SCENE_SHIPYARD {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_scene_shipyard_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_scene_shipyard_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_scene_shipyard_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_scene_shipyard_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_scene_shipyard_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get previous_game_mode() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set previous_game_mode(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get error_code() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set error_code(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get dialog_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set dialog_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get ships_prefab() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 5 * 4, 10);
    }

    get new_ship() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 15 * 4, true);
    }
    set new_ship(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 15 * 4, value, true);
    }

    get to_invest() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 16 * 4, true);
    }
    set to_invest(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 16 * 4, value, true);
    }

}

class GAME_DATA_REMODEL_SHIP {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_remodel_ship_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_remodel_ship_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_remodel_ship_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_remodel_ship_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_remodel_ship_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get material_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set material_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get cargo() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set cargo(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get cannons() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set cannons(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get crew() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set crew(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get cannon_type_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set cannon_type_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get figurehead_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set figurehead_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

}

class GAME_DATA_NEW_SHIP {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_new_ship_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_new_ship_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_new_ship_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_new_ship_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_new_ship_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get type_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set type_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get material_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set material_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get cargo() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set cargo(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get cannons() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set cannons(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get crew() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set crew(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get cannon_type_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set cannon_type_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get figurehead_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 8 * 4, true);
    }
    set figurehead_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 8 * 4, value, true);
    }

}

function game_get_storage_new_ship_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_new_ship_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_new_ship_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_new_ship_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_new_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_new_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_STATS {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_stats_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_stats_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_stats_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_stats_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_stats_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get battle_level() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set battle_level(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get navigation_level() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set navigation_level(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get leadership() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set leadership(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

}

function game_get_storage_stats_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_stats_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_stats_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_stats_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_stats_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_stats_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_SKILL {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_skill_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_skill_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_skill_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_skill_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_skill_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get stats_requirements() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set stats_requirements(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

}

function game_get_storage_skill_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_skill_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_skill_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_skill_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_skill_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_skill_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_ENTITY {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_entity_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_entity_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_entity_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_entity_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_entity_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get is_interactable() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set is_interactable(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get is_solid() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set is_solid(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get interaction_on_step_over() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set interaction_on_step_over(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get interaction_scene() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set interaction_scene(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get position_x() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set position_x(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get position_y() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set position_y(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

}

function game_get_storage_entity_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_entity_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_entity_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_entity_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_entity_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_entity_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_FLEET {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_fleet_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_fleet_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_fleet_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_fleet_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_fleet_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get total_ships() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set total_ships(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get total_captains() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set total_captains(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get first_mate_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set first_mate_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get accountant_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set accountant_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get navigator_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 6 * 4, true);
    }
    set navigator_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get general_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 7 * 4, true);
    }
    set general_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get ship_ids() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 8 * 4, 100);
    }

    get captain_ids() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 108 * 4, 100);
    }

}

function game_get_storage_fleet_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_fleet_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_fleet_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_fleet_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_fleet_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_fleet_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_FLEET_SHIP {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_fleet_ship_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_fleet_ship_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_fleet_ship_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_fleet_ship_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_fleet_ship_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get ship_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set ship_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get fleet_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set fleet_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get captain_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set captain_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get is_flagship() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 5 * 4, true);
    }
    set is_flagship(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 5 * 4, value, true);
    }

}

function game_get_storage_fleet_ship_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_fleet_ship_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_fleet_ship_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_fleet_ship_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_fleet_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_fleet_ship_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_FLEET_CAPTAIN {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_fleet_captain_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_fleet_captain_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_fleet_captain_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_fleet_captain_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_fleet_captain_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get captain_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set captain_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get fleet_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set fleet_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

}

function game_get_storage_fleet_captain_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_fleet_captain_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_fleet_captain_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_fleet_captain_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_fleet_captain_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_fleet_captain_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_CANNON {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_cannon_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_cannon_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_cannon_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_cannon_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_cannon_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get range() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set range(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get power() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set power(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

}

function game_get_storage_cannon_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_cannon_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_cannon_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_cannon_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_cannon_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_cannon_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_DATA_FIGUREHEAD {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_figurehead_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_figurehead_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_figurehead_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_figurehead_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_figurehead_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

}

function game_get_storage_figurehead_used_slots(wasm_exports, input_array) {
    var ptr = null;
    if (!input_array || input_array.length === 0) {
        ptr = wasm.exports.get_storage_figurehead_used_slots_ptr();
    } else if (input_array.length === 1) {
        ptr = wasm.exports.get_storage_figurehead_used_slots_ptr(input_array[0]);
    } else if (input_array.length === 2) {
        ptr = wasm.exports.get_storage_figurehead_used_slots_ptr(input_array[0], input_array[1]);
    } else if (input_array.length === 3) {
        ptr = wasm.exports.get_storage_figurehead_used_slots_ptr(input_array[0], input_array[1], input_array[2]);
    } else if (input_array.length === 4) {
        ptr = wasm.exports.get_storage_figurehead_used_slots_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
    }
    return new Uint32Array(wasm_exports.memory.buffer, ptr, 100);
}

class GAME_CURRENT {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_current_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_current_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_current_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_current_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_current_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get world() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 0 * 4, true);
    }
    set world(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get world_name() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 1 * 4, true);
    }
    set world_name(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get scene() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2 * 4, true);
    }
    set scene(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get game_mode() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 3 * 4, true);
    }
    set game_mode(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get updated_state() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 4 * 4, true);
    }
    set updated_state(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 4 * 4, value, true);
    }

}

class GAME_BLACKJACK {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_blackjack_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_blackjack_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_blackjack_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_blackjack_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_blackjack_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get deck() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 0 * 4, 48);
    }

    get deck_index() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 48 * 4, true);
    }
    set deck_index(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 48 * 4, value, true);
    }

    get player_deck() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 49 * 4, 10);
    }

    get player_deck_iterator() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 59 * 4, true);
    }
    set player_deck_iterator(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 59 * 4, value, true);
    }

    get dealer_deck() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 60 * 4, 10);
    }

    get dealer_deck_iterator() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 70 * 4, true);
    }
    set dealer_deck_iterator(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 70 * 4, value, true);
    }

    get player_value() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 71 * 4, true);
    }
    set player_value(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 71 * 4, value, true);
    }

    get dealer_value() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 72 * 4, true);
    }
    set dealer_value(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 72 * 4, value, true);
    }

    get bet_amount() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 73 * 4, true);
    }
    set bet_amount(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 73 * 4, value, true);
    }

    get bet_minimum() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 74 * 4, true);
    }
    set bet_minimum(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 74 * 4, value, true);
    }

    get bet_maximum() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 75 * 4, true);
    }
    set bet_maximum(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 75 * 4, value, true);
    }

}

class GAME_DATA_OCEAN_BATTLE {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_ocean_battle_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_ocean_battle_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_ocean_battle_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_ocean_battle_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_ocean_battle_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
    }

    get turn_order_fleets() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 0 * 4, 10);
    }

    get turn_order_fleet_ships() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 10 * 4, 1000);
    }

    get turn_order_world_npcs() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 1010 * 4, 1000);
    }

    get total_fleets() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2010 * 4, true);
    }
    set total_fleets(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2010 * 4, value, true);
    }

    get attacker_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2011 * 4, true);
    }
    set attacker_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2011 * 4, value, true);
    }

    get target_id() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2012 * 4, true);
    }
    set target_id(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2012 * 4, value, true);
    }

    get total_ships_in_play() {
        const view = new DataView(this._memory.buffer);
        return view.getUint32(this._ptr + 2013 * 4, true);
    }
    set total_ships_in_play(value) {
        const view = new DataView(this._memory.buffer);
        view.setUint32(this._ptr + 2013 * 4, value, true);
    }

    get turn_history() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 2014 * 4, 3000);
    }

    get valid_move_coords() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 5014 * 4, 100);
    }

    get valid_cannon_coords() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 5114 * 4, 100);
    }

    get valid_boarding_coords() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 5214 * 4, 100);
    }

    get intended_move_coords() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 5314 * 4, 2);
    }

    get intended_cannon_coords() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 5316 * 4, 2);
    }

    get intended_boarding_coords() {
        const view = new DataView(this._memory.buffer);
        return new Uint32Array(this._memory.buffer, this._ptr + 5318 * 4, 2);
    }

}

