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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flags() {
        return new Uint32Array(this._memory.buffer, this._ptr + 1 * 4, 10);
    }

    get strings() {
        return new Uint32Array(this._memory.buffer, this._ptr + 11 * 4, 10);
    }

    get actions() {
        return new Uint32Array(this._memory.buffer, this._ptr + 21 * 4, 10);
    }

    get action_flags() {
        return new Uint32Array(this._memory.buffer, this._ptr + 31 * 4, 10);
    }

    get error_code() {
        return this._view.getUint32(this._ptr + 41 * 4, true);
    }
    set error_code(value) {
        this._view.setUint32(this._ptr + 41 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get dialog_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set dialog_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get flag_initialized() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set flag_initialized(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get flag_confirmed() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set flag_confirmed(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get previous_game_mode() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set previous_game_mode(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get error_code() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set error_code(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get flag_confirmed() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set flag_confirmed(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get flag_bought() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set flag_bought(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get previous_game_mode() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set previous_game_mode(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get inventory_id() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set inventory_id(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get chosen_items() {
        return new Uint32Array(this._memory.buffer, this._ptr + 6 * 4, 100);
    }

    get error_code() {
        return this._view.getUint32(this._ptr + 106 * 4, true);
    }
    set error_code(value) {
        this._view.setUint32(this._ptr + 106 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get flag_confirmed() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set flag_confirmed(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get previous_game_mode() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set previous_game_mode(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get error_code() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set error_code(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get dialog_id() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set dialog_id(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get previous_game_mode() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set previous_game_mode(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get error_code() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set error_code(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get dialog_id() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set dialog_id(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get deposit_interest_rate() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set deposit_interest_rate(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get loan_interest_rate() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set loan_interest_rate(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get deposit_amount() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set deposit_amount(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get loan_amount() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set loan_amount(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get deposit_max_amount() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set deposit_max_amount(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get loan_max_amount() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set loan_max_amount(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get to_deposit() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set to_deposit(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get to_loan() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set to_loan(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get to_pay_loan() {
        return this._view.getUint32(this._ptr + 8 * 4, true);
    }
    set to_pay_loan(value) {
        this._view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get to_withdraw() {
        return this._view.getUint32(this._ptr + 9 * 4, true);
    }
    set to_withdraw(value) {
        this._view.setUint32(this._ptr + 9 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get type() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set type(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get top_material_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set top_material_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get max_capacity() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set max_capacity(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get tacking() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set tacking(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get power() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set power(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get speed() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set speed(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get durability() {
        return this._view.getUint32(this._ptr + 8 * 4, true);
    }
    set durability(value) {
        this._view.setUint32(this._ptr + 8 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_ship_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_ship_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get price() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set price(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get material_id() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set material_id(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get capacity() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set capacity(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get tacking() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set tacking(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get power() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set power(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get speed() {
        return this._view.getUint32(this._ptr + 8 * 4, true);
    }
    set speed(value) {
        this._view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get durability() {
        return this._view.getUint32(this._ptr + 9 * 4, true);
    }
    set durability(value) {
        this._view.setUint32(this._ptr + 9 * 4, value, true);
    }

    get crew() {
        return this._view.getUint32(this._ptr + 10 * 4, true);
    }
    set crew(value) {
        this._view.setUint32(this._ptr + 10 * 4, value, true);
    }

    get crew_space() {
        return this._view.getUint32(this._ptr + 11 * 4, true);
    }
    set crew_space(value) {
        this._view.setUint32(this._ptr + 11 * 4, value, true);
    }

    get cargo_space() {
        return this._view.getUint32(this._ptr + 12 * 4, true);
    }
    set cargo_space(value) {
        this._view.setUint32(this._ptr + 12 * 4, value, true);
    }

    get cannon_space() {
        return this._view.getUint32(this._ptr + 13 * 4, true);
    }
    set cannon_space(value) {
        this._view.setUint32(this._ptr + 13 * 4, value, true);
    }

    get cannons() {
        return this._view.getUint32(this._ptr + 14 * 4, true);
    }
    set cannons(value) {
        this._view.setUint32(this._ptr + 14 * 4, value, true);
    }

    get cannon_type() {
        return this._view.getUint32(this._ptr + 15 * 4, true);
    }
    set cannon_type(value) {
        this._view.setUint32(this._ptr + 15 * 4, value, true);
    }

    get hull() {
        return this._view.getUint32(this._ptr + 16 * 4, true);
    }
    set hull(value) {
        this._view.setUint32(this._ptr + 16 * 4, value, true);
    }

    get cargo_goods() {
        return new Uint32Array(this._memory.buffer, this._ptr + 17 * 4, 1000);
    }

    get cargo_goods_qty() {
        return new Uint32Array(this._memory.buffer, this._ptr + 1017 * 4, 1000);
    }

    get total_cargo_goods() {
        return this._view.getUint32(this._ptr + 2017 * 4, true);
    }
    set total_cargo_goods(value) {
        this._view.setUint32(this._ptr + 2017 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get mod_power() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set mod_power(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get mod_capacity() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set mod_capacity(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get mod_tacking() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set mod_tacking(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get mod_speed() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set mod_speed(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get mod_durability() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set mod_durability(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get power() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set power(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get defense() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set defense(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get width() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set width(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get height() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set height(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get total_npcs() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set total_npcs(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get total_captains() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set total_captains(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get total_layers() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set total_layers(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get layers() {
        return new Uint32Array(this._memory.buffer, this._ptr + 7 * 4, 10);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get npc_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set npc_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get position_x() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set position_x(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get position_y() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set position_y(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get direction() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set direction(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get is_interactable() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set is_interactable(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get is_captain() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set is_captain(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get interaction_scene() {
        return this._view.getUint32(this._ptr + 8 * 4, true);
    }
    set interaction_scene(value) {
        this._view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get is_player() {
        return this._view.getUint32(this._ptr + 9 * 4, true);
    }
    set is_player(value) {
        this._view.setUint32(this._ptr + 9 * 4, value, true);
    }

    get inventory_id() {
        return this._view.getUint32(this._ptr + 10 * 4, true);
    }
    set inventory_id(value) {
        this._view.setUint32(this._ptr + 10 * 4, value, true);
    }

    get entity_id() {
        return this._view.getUint32(this._ptr + 11 * 4, true);
    }
    set entity_id(value) {
        this._view.setUint32(this._ptr + 11 * 4, value, true);
    }

    get captain_id() {
        return this._view.getUint32(this._ptr + 12 * 4, true);
    }
    set captain_id(value) {
        this._view.setUint32(this._ptr + 12 * 4, value, true);
    }

    get type_id() {
        return this._view.getUint32(this._ptr + 13 * 4, true);
    }
    set type_id(value) {
        this._view.setUint32(this._ptr + 13 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get npc_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set npc_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get world_npc_id() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set world_npc_id(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get in_world() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set in_world(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get global_position_x() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set global_position_x(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get global_position_y() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set global_position_y(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get in_port() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set in_port(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get on_land() {
        return this._view.getUint32(this._ptr + 8 * 4, true);
    }
    set on_land(value) {
        this._view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get in_ocean() {
        return this._view.getUint32(this._ptr + 9 * 4, true);
    }
    set in_ocean(value) {
        this._view.setUint32(this._ptr + 9 * 4, value, true);
    }

    get sailing() {
        return this._view.getUint32(this._ptr + 10 * 4, true);
    }
    set sailing(value) {
        this._view.setUint32(this._ptr + 10 * 4, value, true);
    }

    get gold() {
        return this._view.getUint32(this._ptr + 11 * 4, true);
    }
    set gold(value) {
        this._view.setUint32(this._ptr + 11 * 4, value, true);
    }

    get inventory_id() {
        return this._view.getUint32(this._ptr + 12 * 4, true);
    }
    set inventory_id(value) {
        this._view.setUint32(this._ptr + 12 * 4, value, true);
    }

    get player_id() {
        return this._view.getUint32(this._ptr + 13 * 4, true);
    }
    set player_id(value) {
        this._view.setUint32(this._ptr + 13 * 4, value, true);
    }

    get general_of_fleet_id() {
        return this._view.getUint32(this._ptr + 14 * 4, true);
    }
    set general_of_fleet_id(value) {
        this._view.setUint32(this._ptr + 14 * 4, value, true);
    }

    get stats_id() {
        return this._view.getUint32(this._ptr + 15 * 4, true);
    }
    set stats_id(value) {
        this._view.setUint32(this._ptr + 15 * 4, value, true);
    }

    get skills() {
        return new Uint32Array(this._memory.buffer, this._ptr + 16 * 4, 20);
    }

    get test_for_pointer() {
        return new Uint32Array(this._memory.buffer, this._ptr + 36 * 4, 20);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get is_block() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set is_block(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get width() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set width(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get height() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set height(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get same_value() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set same_value(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get specific_coordinates_size() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set specific_coordinates_size(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get data() {
        return new Uint32Array(this._memory.buffer, this._ptr + 7 * 4, 2500);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get number_held() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set number_held(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get adjusted_price() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set adjusted_price(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get type() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set type(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get type_reference() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set type_reference(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get inventory_id() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set inventory_id(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get total_items() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set total_items(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get inventory_items() {
        return new Uint32Array(this._memory.buffer, this._ptr + 3 * 4, 100);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get global_location_x() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set global_location_x(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get global_location_y() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set global_location_y(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get overall_investment_level() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set overall_investment_level(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get market_investment_level() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set market_investment_level(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get shipyard_investment_level() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set shipyard_investment_level(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get flag_initialized() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set flag_initialized(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get previous_game_mode() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set previous_game_mode(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get error_code() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set error_code(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get dialog_id() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set dialog_id(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get ships_prefab() {
        return new Uint32Array(this._memory.buffer, this._ptr + 5 * 4, 10);
    }

    get buying_prefab_ship_id() {
        return this._view.getUint32(this._ptr + 15 * 4, true);
    }
    set buying_prefab_ship_id(value) {
        this._view.setUint32(this._ptr + 15 * 4, value, true);
    }

    get new_ship() {
        return this._view.getUint32(this._ptr + 16 * 4, true);
    }
    set new_ship(value) {
        this._view.setUint32(this._ptr + 16 * 4, value, true);
    }

    get to_invest() {
        return this._view.getUint32(this._ptr + 17 * 4, true);
    }
    set to_invest(value) {
        this._view.setUint32(this._ptr + 17 * 4, value, true);
    }

    get remodel_ship_id() {
        return this._view.getUint32(this._ptr + 18 * 4, true);
    }
    set remodel_ship_id(value) {
        this._view.setUint32(this._ptr + 18 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get material_id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set material_id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get cargo_space() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set cargo_space(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get cannon_space() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set cannon_space(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get crew_space() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set crew_space(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get cannon_type_id() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set cannon_type_id(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get figurehead_id() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set figurehead_id(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get type_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set type_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get material_id() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set material_id(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get cargo() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set cargo(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get cannons() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set cannons(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get crew() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set crew(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get cannon_type_id() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set cannon_type_id(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get figurehead_id() {
        return this._view.getUint32(this._ptr + 8 * 4, true);
    }
    set figurehead_id(value) {
        this._view.setUint32(this._ptr + 8 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get battle_level() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set battle_level(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get navigation_level() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set navigation_level(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get leadership() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set leadership(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get seamanship() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set seamanship(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get knowledge() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set knowledge(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get intuition() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set intuition(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get courage() {
        return this._view.getUint32(this._ptr + 8 * 4, true);
    }
    set courage(value) {
        this._view.setUint32(this._ptr + 8 * 4, value, true);
    }

    get swordsmanship() {
        return this._view.getUint32(this._ptr + 9 * 4, true);
    }
    set swordsmanship(value) {
        this._view.setUint32(this._ptr + 9 * 4, value, true);
    }

    get charm() {
        return this._view.getUint32(this._ptr + 10 * 4, true);
    }
    set charm(value) {
        this._view.setUint32(this._ptr + 10 * 4, value, true);
    }

    get luck() {
        return this._view.getUint32(this._ptr + 11 * 4, true);
    }
    set luck(value) {
        this._view.setUint32(this._ptr + 11 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get stats_requirements_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set stats_requirements_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get is_interactable() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set is_interactable(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get is_solid() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set is_solid(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get interaction_on_step_over() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set interaction_on_step_over(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get interaction_scene() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set interaction_scene(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get position_x() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set position_x(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get position_y() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set position_y(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get total_ships() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set total_ships(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get total_captains() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set total_captains(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get first_mate_id() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set first_mate_id(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get accountant_id() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set accountant_id(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    get navigator_id() {
        return this._view.getUint32(this._ptr + 6 * 4, true);
    }
    set navigator_id(value) {
        this._view.setUint32(this._ptr + 6 * 4, value, true);
    }

    get general_id() {
        return this._view.getUint32(this._ptr + 7 * 4, true);
    }
    set general_id(value) {
        this._view.setUint32(this._ptr + 7 * 4, value, true);
    }

    get ship_ids() {
        return new Uint32Array(this._memory.buffer, this._ptr + 8 * 4, 100);
    }

    get captain_ids() {
        return new Uint32Array(this._memory.buffer, this._ptr + 108 * 4, 100);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get ship_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set ship_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get fleet_id() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set fleet_id(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get captain_id() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set captain_id(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get is_flagship() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set is_flagship(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get captain_id() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set captain_id(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get fleet_id() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set fleet_id(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get range() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set range(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get power() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set power(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get name_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set name_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get base_price() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set base_price(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get world() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set world(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get world_name() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set world_name(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get scene() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set scene(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get game_mode() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set game_mode(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get updated_state() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set updated_state(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get deck() {
        return new Uint32Array(this._memory.buffer, this._ptr + 0 * 4, 48);
    }

    get deck_index() {
        return this._view.getUint32(this._ptr + 48 * 4, true);
    }
    set deck_index(value) {
        this._view.setUint32(this._ptr + 48 * 4, value, true);
    }

    get player_deck() {
        return new Uint32Array(this._memory.buffer, this._ptr + 49 * 4, 10);
    }

    get player_deck_iterator() {
        return this._view.getUint32(this._ptr + 59 * 4, true);
    }
    set player_deck_iterator(value) {
        this._view.setUint32(this._ptr + 59 * 4, value, true);
    }

    get dealer_deck() {
        return new Uint32Array(this._memory.buffer, this._ptr + 60 * 4, 10);
    }

    get dealer_deck_iterator() {
        return this._view.getUint32(this._ptr + 70 * 4, true);
    }
    set dealer_deck_iterator(value) {
        this._view.setUint32(this._ptr + 70 * 4, value, true);
    }

    get player_value() {
        return this._view.getUint32(this._ptr + 71 * 4, true);
    }
    set player_value(value) {
        this._view.setUint32(this._ptr + 71 * 4, value, true);
    }

    get dealer_value() {
        return this._view.getUint32(this._ptr + 72 * 4, true);
    }
    set dealer_value(value) {
        this._view.setUint32(this._ptr + 72 * 4, value, true);
    }

    get bet_amount() {
        return this._view.getUint32(this._ptr + 73 * 4, true);
    }
    set bet_amount(value) {
        this._view.setUint32(this._ptr + 73 * 4, value, true);
    }

    get bet_minimum() {
        return this._view.getUint32(this._ptr + 74 * 4, true);
    }
    set bet_minimum(value) {
        this._view.setUint32(this._ptr + 74 * 4, value, true);
    }

    get bet_maximum() {
        return this._view.getUint32(this._ptr + 75 * 4, true);
    }
    set bet_maximum(value) {
        this._view.setUint32(this._ptr + 75 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
    }

}

class GAME_DATA_SCENE_OCEAN_BATTLE {
    constructor(wasm_exports, input_array) {
        this._memory = wasm_exports.memory;
        if (!input_array || input_array.length === 0) {
            this._ptr = wasm.exports.get_data_scene_ocean_battle_ptr();
        } else if (input_array.length === 1) {
            this._ptr = wasm.exports.get_data_scene_ocean_battle_ptr(input_array[0]);
        } else if (input_array.length === 2) {
            this._ptr = wasm.exports.get_data_scene_ocean_battle_ptr(input_array[0], input_array[1]);
        } else if (input_array.length === 3) {
            this._ptr = wasm.exports.get_data_scene_ocean_battle_ptr(input_array[0], input_array[1], input_array[2]);
        } else if (input_array.length === 4) {
            this._ptr = wasm.exports.get_data_scene_ocean_battle_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);
        }
        this._view = new DataView(this._memory.buffer);
    }

    get id() {
        return this._view.getUint32(this._ptr + 0 * 4, true);
    }
    set id(value) {
        this._view.setUint32(this._ptr + 0 * 4, value, true);
    }

    get dialog_id() {
        return this._view.getUint32(this._ptr + 1 * 4, true);
    }
    set dialog_id(value) {
        this._view.setUint32(this._ptr + 1 * 4, value, true);
    }

    get flag_initialized() {
        return this._view.getUint32(this._ptr + 2 * 4, true);
    }
    set flag_initialized(value) {
        this._view.setUint32(this._ptr + 2 * 4, value, true);
    }

    get flag_confirmed() {
        return this._view.getUint32(this._ptr + 3 * 4, true);
    }
    set flag_confirmed(value) {
        this._view.setUint32(this._ptr + 3 * 4, value, true);
    }

    get previous_game_mode() {
        return this._view.getUint32(this._ptr + 4 * 4, true);
    }
    set previous_game_mode(value) {
        this._view.setUint32(this._ptr + 4 * 4, value, true);
    }

    get error_code() {
        return this._view.getUint32(this._ptr + 5 * 4, true);
    }
    set error_code(value) {
        this._view.setUint32(this._ptr + 5 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
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
        this._view = new DataView(this._memory.buffer);
    }

    get turn_order_fleets() {
        return new Uint32Array(this._memory.buffer, this._ptr + 0 * 4, 10);
    }

    get turn_order_fleet_ships() {
        return new Uint32Array(this._memory.buffer, this._ptr + 10 * 4, 1000);
    }

    get turn_order_world_npcs() {
        return new Uint32Array(this._memory.buffer, this._ptr + 1010 * 4, 1000);
    }

    get turn_order_ships() {
        return new Uint32Array(this._memory.buffer, this._ptr + 2010 * 4, 1000);
    }

    get total_fleets() {
        return this._view.getUint32(this._ptr + 3010 * 4, true);
    }
    set total_fleets(value) {
        this._view.setUint32(this._ptr + 3010 * 4, value, true);
    }

    get attacker_id() {
        return this._view.getUint32(this._ptr + 3011 * 4, true);
    }
    set attacker_id(value) {
        this._view.setUint32(this._ptr + 3011 * 4, value, true);
    }

    get target_id() {
        return this._view.getUint32(this._ptr + 3012 * 4, true);
    }
    set target_id(value) {
        this._view.setUint32(this._ptr + 3012 * 4, value, true);
    }

    get total_ships() {
        return this._view.getUint32(this._ptr + 3013 * 4, true);
    }
    set total_ships(value) {
        this._view.setUint32(this._ptr + 3013 * 4, value, true);
    }

    get turn_order() {
        return this._view.getUint32(this._ptr + 3014 * 4, true);
    }
    set turn_order(value) {
        this._view.setUint32(this._ptr + 3014 * 4, value, true);
    }

    get turn_history() {
        return new Uint32Array(this._memory.buffer, this._ptr + 3015 * 4, 3000);
    }

    get valid_move_coords() {
        return new Uint32Array(this._memory.buffer, this._ptr + 6015 * 4, 100);
    }

    get total_valid_move_coords() {
        return this._view.getUint32(this._ptr + 6115 * 4, true);
    }
    set total_valid_move_coords(value) {
        this._view.setUint32(this._ptr + 6115 * 4, value, true);
    }

    get valid_cannon_coords() {
        return new Uint32Array(this._memory.buffer, this._ptr + 6116 * 4, 100);
    }

    get total_valid_cannon_coords() {
        return this._view.getUint32(this._ptr + 6216 * 4, true);
    }
    set total_valid_cannon_coords(value) {
        this._view.setUint32(this._ptr + 6216 * 4, value, true);
    }

    get valid_boarding_coords() {
        return new Uint32Array(this._memory.buffer, this._ptr + 6217 * 4, 100);
    }

    get total_valid_boarding_coords() {
        return this._view.getUint32(this._ptr + 6317 * 4, true);
    }
    set total_valid_boarding_coords(value) {
        this._view.setUint32(this._ptr + 6317 * 4, value, true);
    }

    get intended_move_coords() {
        return new Uint32Array(this._memory.buffer, this._ptr + 6318 * 4, 2);
    }

    get intended_cannon_coords() {
        return new Uint32Array(this._memory.buffer, this._ptr + 6320 * 4, 2);
    }

    get intended_boarding_coords() {
        return new Uint32Array(this._memory.buffer, this._ptr + 6322 * 4, 2);
    }

    get victory() {
        return this._view.getUint32(this._ptr + 6324 * 4, true);
    }
    set victory(value) {
        this._view.setUint32(this._ptr + 6324 * 4, value, true);
    }

    get player_victory() {
        return this._view.getUint32(this._ptr + 6325 * 4, true);
    }
    set player_victory(value) {
        this._view.setUint32(this._ptr + 6325 * 4, value, true);
    }

    get fleet_victory() {
        return this._view.getUint32(this._ptr + 6326 * 4, true);
    }
    set fleet_victory(value) {
        this._view.setUint32(this._ptr + 6326 * 4, value, true);
    }

    get who_won() {
        return this._view.getUint32(this._ptr + 6327 * 4, true);
    }
    set who_won(value) {
        this._view.setUint32(this._ptr + 6327 * 4, value, true);
    }

    get moved() {
        return this._view.getUint32(this._ptr + 6328 * 4, true);
    }
    set moved(value) {
        this._view.setUint32(this._ptr + 6328 * 4, value, true);
    }

    get attacked() {
        return this._view.getUint32(this._ptr + 6329 * 4, true);
    }
    set attacked(value) {
        this._view.setUint32(this._ptr + 6329 * 4, value, true);
    }

    getName() {
        if (!this.name_id) { return 'Unknown'; }
        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }
        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }
        else { return STRINGS[GAME_STRINGS[this.name_id]]; }
    }

}

