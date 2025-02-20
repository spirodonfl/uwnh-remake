#include <stdint.h>
#include <stddef.h>
#include <stdarg.h>
#include <stdbool.h>

// #include "rvice_sucks.h"
// u32 test_world_data_out(u32 t) {
//     // u32 offset = t * 4;
//     // return rvice_sucks_bin[offset];
//     return rvice_sucks[t];
// }

#define BUFFER_SIZE 1024

typedef uint32_t u32;
typedef uint32_t u8;

void console_log(const char* message);
unsigned long my_strlen(const char* str)
{
    unsigned long len = 0;
    while (str[len] != '\0') len++;
    return len;
}
u32 my_strcmp(const char* str1, const char* str2)
{
    // Check for null pointers
    if (!str1 || !str2) return -1;
    
    // Compare characters until we hit a mismatch or end
    while (*str1 && *str2) {
        if (*str1 != *str2) {
            break;
        }
        str1++;
        str2++;
    }
    
    // Return the difference of the current characters
    return (u32)((unsigned char)*str1 - (unsigned char)*str2);
}
u32 my_floor(u32 x, u32 multiple)
{
    return x - (x % multiple);
}
u32 my_floor_percentage(u32 value, u32 percentage)
{
    return (value * percentage) / 100;
}
#define SENTRY UINT32_MAX
// __attribute__((visibility("default")))
u32 get_sentry()
{
    return SENTRY;
}
extern void js_console_log(void* ptr, u32 len);
extern void js_output_string_buffer(void* ptr, uint32_t len); 
extern void js_output_array_buffer(void* ptr, uint32_t len);
void console_log(const char* message)
{
    if (message != NULL)
    {
        js_console_log((void*)message, (u32)(sizeof(char) * my_strlen(message)));
    }
}

typedef union {
    int i;
    const char* s;
    void* p;
} FormatArg;
FormatArg args[100];
char* string_format(const char* format, FormatArg* args, int arg_count) {
    static char local_buffer[BUFFER_SIZE];
    
    // Zero out buffer
    for (u32 i = 0; i < BUFFER_SIZE; i++) {
        local_buffer[i] = '\0';
    }
    
    u32 pos = 0;
    const char* p = format;
    int current_arg = 0;
    
    while (*p && pos < BUFFER_SIZE - 1) {
        if (*p != '%') {
            local_buffer[pos++] = *p++;
            continue;
        }
        
        p++; // Skip '%'
        if (current_arg >= arg_count) break;
        
        switch (*p) {
            case 'd': {
                int val = args[current_arg++].i;
                if (val < 0) {
                    local_buffer[pos++] = '-';
                    val = -val;
                }
                
                char temp[12];
                u32 temp_pos = 0;
                
                if (val == 0) {
                    temp[temp_pos++] = '0';
                } else {
                    while (val > 0 && temp_pos < 11) {
                        temp[temp_pos++] = '0' + (val % 10);
                        val /= 10;
                    }
                    for (u32 i = 0; i < temp_pos / 2; i++) {
                        char t = temp[i];
                        temp[i] = temp[temp_pos - 1 - i];
                        temp[temp_pos - 1 - i] = t;
                    }
                }
                
                for (u32 i = 0; i < temp_pos; i++) {
                    local_buffer[pos++] = temp[i];
                }
                break;
            }
            case 's': {
                const char* str = args[current_arg++].s;
                if (str) {
                    while (*str && pos < BUFFER_SIZE - 1) {
                        local_buffer[pos++] = *str++;
                    }
                }
                break;
            }
        }
        p++;
    }
    
    local_buffer[pos] = '\0';
    return local_buffer;
}
void console_log_format(const char* format, FormatArg* args, int arg_count) {
    char* formatted = string_format(format, args, arg_count);
    console_log(formatted);
}

u32 max(u32 a, u32 b)
{
    return a > b ? a : b;
}

#define CLEAR_STRUCT(STRUCT_PTR, value) \
    do { \
        u32 *ptr = (u32 *)STRUCT_PTR; \
        u32 count = (sizeof(*STRUCT_PTR) / sizeof(u32)); \
        for (u32 i = 0; i < count; ++i) \
        { \
            ptr[i] = (value); \
        } \
    } while (0)

#define CLEAR_DATA(data, size) \
    do { \
        for (u32 i = 0; i < (size); ++i) \
        { \
            (data)[i] = SENTRY; \
        } \
    } while (0)

#define STORAGE_STRUCT(LOWERSCORE, UPPERSCORE, FULLLOWERSCORE, MAX_COUNT) \
    typedef struct __attribute__((packed)) \
    { \
        UPPERSCORE data[MAX_COUNT]; \
        bool used[MAX_COUNT]; \
        u32 count; \
        u32 next_open_slot; \
    } STORAGE_##UPPERSCORE; \
    STORAGE_##UPPERSCORE storage_##LOWERSCORE; \
    u32 find_next_storage_##LOWERSCORE##_open_slot() \
    { \
        for (u32 i = 0; i < MAX_COUNT; ++i) \
        { \
            if (storage_##LOWERSCORE.used[i] == false) \
            { \
                storage_##LOWERSCORE.next_open_slot = i; \
                return i; \
            } \
        } \
        return SENTRY; \
    } \
    u32 get_storage_##LOWERSCORE##_next_open_slot() \
    { \
        return storage_##LOWERSCORE.next_open_slot; \
    } \
    u32 get_storage_##LOWERSCORE##_total_used_slots() \
    { \
        return storage_##LOWERSCORE.count; \
    } \
    void update_storage_##LOWERSCORE##_used_slots() \
    { \
        u32 usi = 0; \
        u32 total = 0; \
        u32 open_slot = SENTRY; \
        for (u32 i = 0; i < MAX_COUNT; ++i) \
        { \
            if (storage_##LOWERSCORE.used[i] == true) \
            { \
                storage_##LOWERSCORE##_used_slots[usi] = i; \
                ++total; \
            } \
            else \
            { \
                if (open_slot == SENTRY) \
                { \
                    open_slot = i; \
                } \
                storage_##LOWERSCORE##_used_slots[usi] = SENTRY; \
            } \
            ++usi; \
        } \
        storage_##LOWERSCORE.count = total; \
    } \
    u32 pull_storage_##LOWERSCORE##_next_open_slot() \
    { \
        u32 current_count = storage_##LOWERSCORE.count; \
        if (current_count + 1 >= MAX_COUNT) \
        { \
            console_log("[E] No more room left in " #LOWERSCORE " to add a new entry"); \
            return SENTRY; \
        } \
        u32 current_open_slot = storage_##LOWERSCORE.next_open_slot; \
        storage_##LOWERSCORE.used[current_open_slot] = true; \
        CLEAR_STRUCT(&storage_##LOWERSCORE.data[current_open_slot], SENTRY); \
        ++storage_##LOWERSCORE.count; \
        storage_##LOWERSCORE.data[current_open_slot].id = current_open_slot; \
        find_next_storage_##LOWERSCORE##_open_slot(); \
        update_storage_##LOWERSCORE##_used_slots(); \
        return current_open_slot; \
    } \
    u32* get_##FULLLOWERSCORE##_ptr(u32 id) \
    { \
        return (u32*)&storage_##LOWERSCORE.data[id]; \
    } \
    UPPERSCORE* get_##FULLLOWERSCORE(u32 id) \
    { \
        return &storage_##LOWERSCORE.data[id]; \
    } \
    void free_storage_##LOWERSCORE##_slot(u32 id) \
    { \
        if (storage_##LOWERSCORE.used[id] == true) \
        { \
            storage_##LOWERSCORE.used[id] = false; \
        } \
        update_storage_##LOWERSCORE##_used_slots(); \
        find_next_storage_##LOWERSCORE##_open_slot(); \
    }

#define ADD_STORAGE_FUNC(LOWERSCORE, UPPERSCORE) \
    u32 add_storage_##LOWERSCORE(UPPERSCORE* source, bool force_clear) \
    { \
        u32 new_id = pull_storage_##LOWERSCORE##_next_open_slot(); \
        assign_storage_##LOWERSCORE(new_id, source); \
        source->id = new_id; \
        if (force_clear) \
        { \
            CLEAR_STRUCT(source, SENTRY); \
        } \
        return new_id; \
    }

#define FIND_STORAGE_BY_NAME_ID_FUNC(LOWERSCORE, UPPERSCORE, MAX_COUNT) \
    u32 find_storage_##LOWERSCORE##_by_name_id(u32 name_id) \
    { \
        for (u32 i = 0; i < MAX_COUNT; ++i) \
        { \
            if ( \
                storage_##LOWERSCORE.used[i] == true \
                && \
                storage_##LOWERSCORE.data[i].name_id == name_id \
            ) \
            { \
                return i; \
            } \
        } \
        return SENTRY; \
    }

// -----------------------------------------------------------------------------
// - Constants
// -----------------------------------------------------------------------------
#define MAX_NPCS 100
u32 get_max_npcs() { return MAX_NPCS; }
#define MAX_WEAPONS 100
u32 get_max_weapons() { return MAX_WEAPONS; }
#define MAX_ARMORS 100
u32 get_max_armors() { return MAX_ARMORS; }
#define MAX_GENERAL_ITEMS 100
u32 get_max_general_items() { return MAX_GENERAL_ITEMS; }
#define MAX_SPECIAL_ITEMS 100
u32 get_max_special_items() { return MAX_SPECIAL_ITEMS; }
#define MAX_BANKS 100
#define MAX_INVENTORIES 100
u32 get_max_inventories() { return MAX_INVENTORIES; }
#define MAX_PORTS 100
#define MAX_STATS 100
#define MAX_SKILLS 100
#define MAX_ENTITIES 100
#define MAX_FLEETS 100
u32 get_max_fleets() { return MAX_FLEETS; }
#define MAX_FLEET_SHIPS 100
u32 get_max_fleet_ships() { return MAX_FLEET_SHIPS; }
#define MAX_FLEET_CAPTAINS 100
#define MAX_CANNONS 100
u32 get_max_cannons() { return MAX_CANNONS; }
#define MAX_FIGUREHEADS 100
u32 get_max_figureheads() { return MAX_FIGUREHEADS; }
#define MAX_WORLDS 100
u32 get_max_worlds() { return MAX_WORLDS; }
#define MAX_LAYERS 10
u32 get_max_layers() { return MAX_LAYERS; }
#define MAX_WORLD_NPCS 1000
u32 get_max_world_npcs() { return MAX_WORLD_NPCS; }
#define MAX_WORLD_ENTITIES 10
#define MAX_SHIPS 100
u32 get_max_ships() { return MAX_SHIPS; }
#define MAX_SHIP_MATERIALS 100
u32 get_max_ship_materials() { return MAX_SHIP_MATERIALS; }
#define MAX_BASE_SHIPS 100
u32 get_max_base_ships() { return MAX_BASE_SHIPS; }
#define MAX_INVENTORY_ITEMS 100
#define MAX_CAPTAINS 100
u32 get_max_captains() { return MAX_CAPTAINS; }
#define MAX_SCENE_DATA_SIZE 1000
#define MAX_SCENE_CHOICES 10
#define MAX_SCENE_STATES 100
#define MAX_SCENE_STRINGS 100
#define MAX_GLOBAL_ENTITIES 10
#define MAX_GOODS 100
u32 get_max_goods() { return MAX_GOODS; }
#define MAX_OCEAN_BATTLE_MOVES 10000
#define MAX_WORLD_WIDTH 100
#define MAX_WORLD_HEIGHT 100
#define MAX_LAYER_SIZE (MAX_WORLD_WIDTH * MAX_WORLD_HEIGHT)
#define MAX_SHIP_CARGO_SPACE 1000
#define MAX_SHIP_PREFABS 10

// -----------------------------------------------------------------------------
// FORWARD DECLARATIONS
// -----------------------------------------------------------------------------
u32 get_player_npc_id(u32 player_id);

void move_player_left(u32 player_id);
void move_player_right(u32 player_id);
void move_player_up(u32 player_id);
void move_player_down(u32 player_id);

void handle_input(u32 input);

u32 get_player_in_world(u32 player_id);
u32 get_player_in_world_x(u32 player_id);
u32 get_player_in_world_y(u32 player_id);

void fake_ocean_battle();
u32 scene_blackjack(u32 action);
u32 scene_general_shop(u32 action);
u32 scene_goods_shop(u32 action);
u32 scene_ocean_battle(u32 action);
u32 scene_shipyard(u32 action);
u32 scene_dockyard(u32 action);
u32 scene_npc_rvice(u32 action);
u32 scene_npc_lafolie(u32 action);
u32 scene_npc_nakor(u32 action);
u32 scene_npc_travis(u32 action);
u32 scene_npc_loller(u32 action);
u32 scene_bank(u32 action);
u32 scene_test(u32 action);

void generate_world(u32 world_name_id);

void update_npc_layer(u32 world_npc_id);

void test();

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
enum UserInput
{
    USER_INPUT_A,
    USER_INPUT_B,
    USER_INPUT_X,
    USER_INPUT_Y,
    USER_INPUT_UP,
    USER_INPUT_DOWN,
    USER_INPUT_LEFT,
    USER_INPUT_RIGHT,
    USER_INPUT_START,
    USER_INPUT_SELECT,
    USER_INPUT_LEFT_BUMPER,
    USER_INPUT_RIGHT_BUMPER,
    USER_INPUT_CUSTOM_NUMBER,
    USER_INPUT_CUSTOM_STRING,
};

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    // machine_name id
    u32 id;
    u32 flags[10];
    u32 strings[10];
    // i.e: actions[0] = ACTION_CONFIRM, actions[1] = ACTION_BUY
    u32 actions[10];
    // whether or not action is enabled
    // i.e: actions[0] = 1, actions[1] = 0 (buy not enabled maybe due to flags)
    u32 action_flags[10];
    u32 error_code;
} DATA_SCENE;

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 dialog_id;
    u32 flag_initialized;
    u32 flag_confirmed;
    u32 previous_game_mode;
    u32 error_code;
} DATA_SCENE_SINGLE_DIALOG;
DATA_SCENE_SINGLE_DIALOG Scene_Single_Dialog;
u32* get_data_scene_single_dialog_ptr()
{ return (u32*)&Scene_Single_Dialog; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 flag_initialized;
    u32 flag_confirmed;
    u32 flag_bought;
    u32 previous_game_mode;
    u32 inventory_id;
    u32 chosen_items[MAX_INVENTORY_ITEMS];
    u32 error_code;
} DATA_SCENE_GENERAL_SHOP;
DATA_SCENE_GENERAL_SHOP Scene_General_Shop;
u32* get_data_scene_general_shop_ptr()
{ return (u32*)&Scene_General_Shop; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 flag_initialized;
    u32 flag_confirmed;
    u32 previous_game_mode;
    u32 error_code;
    u32 dialog_id;
} DATA_SCENE_BLACKJACK;
DATA_SCENE_BLACKJACK Scene_Blackjack;
u32* get_data_scene_blackjack_ptr()
{ return (u32*)&Scene_Blackjack; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 flag_initialized;
    u32 previous_game_mode;
    u32 error_code;
    u32 dialog_id;
} DATA_SCENE_BANK;
DATA_SCENE_BANK Scene_Bank;
u32* get_data_scene_bank_ptr()
{ return (u32*)&Scene_Bank; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 flag_initialized;
    u32 previous_game_mode;
    u32 error_code;
    u32 dialog_id;
    u32 inventory_id;
} DATA_SCENE_GOODS_SHOP;
DATA_SCENE_GOODS_SHOP Scene_Goods_Shop;
u32* get_data_scene_goods_shop_ptr()
{ return (u32*)&Scene_Goods_Shop; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 flag_initialized;
    u32 previous_game_mode;
    u32 error_code;
    u32 dialog_id;
} DATA_SCENE_TEST;
DATA_SCENE_TEST Scene_Test;
u32* get_data_scene_test_ptr()
{ return (u32*)&Scene_Test; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 deposit_interest_rate;
    u32 loan_interest_rate;
    u32 deposit_amount;
    u32 loan_amount;
    u32 deposit_max_amount;
    u32 loan_max_amount;
    u32 to_deposit;
    u32 to_loan;
    u32 to_pay_loan;
    u32 to_withdraw;
} DATA_BANK;
DATA_BANK bank;
u32* get_data_bank_ptr()
{ return (u32*)&bank; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 type_id;
    u32 name_id;
} DATA_NPC;
/** EXPORT TO JS **/
u32 storage_npc_used_slots[MAX_NPCS];
u32* get_storage_npc_used_slots_ptr()
{ return (u32*)&storage_npc_used_slots[0]; }
STORAGE_STRUCT(npc, DATA_NPC, data_npc, MAX_NPCS)
FIND_STORAGE_BY_NAME_ID_FUNC(npc, DATA_NPC, MAX_NPCS)
void assign_storage_npc(u32 id, DATA_NPC* source)
{
    storage_npc.data[id].id = id;
    source->id = id;
    storage_npc.data[id].name_id = source->name_id;
    storage_npc.data[id].type_id = source->type;
}
ADD_STORAGE_FUNC(npc, DATA_NPC)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_price;
} DATA_GENERAL_ITEM;
/** EXPORT TO JS **/
u32 storage_general_item_used_slots[MAX_NPCS];
u32* get_storage_general_item_used_slots_ptr()
{ return (u32*)&storage_general_item_used_slots[0]; }
STORAGE_STRUCT(general_item, DATA_GENERAL_ITEM, data_general_item, MAX_GENERAL_ITEMS)
FIND_STORAGE_BY_NAME_ID_FUNC(general_item, DATA_GENERAL_ITEM, MAX_GENERAL_ITEMS)
void assign_storage_general_item(u32 id, DATA_GENERAL_ITEM* source)
{
    storage_general_item.data[id].id = id;
    source->id = id;
    storage_general_item.data[id].name_id = source->name_id;
    storage_general_item.data[id].base_price = source->base_price;
}
ADD_STORAGE_FUNC(general_item, DATA_GENERAL_ITEM)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 top_material_id;
    u32 base_price;
    // Represents the maximum amount of goods, crew, cannons a ship can carry.
    u32 max_capacity;
    // Represents ease in tacking and handling efficiency.
    u32 tacking;
    // Indicates the ship's power in propelling forward.
    u32 power;
    // Maximum speed in knots
    u32 speed;
    // The endurance of a vessel. Wears out over time.
    u32 durability;
} DATA_BASE_SHIP;
/** EXPORT TO JS **/
u32 storage_base_ship_used_slots[MAX_NPCS];
u32* get_storage_base_ship_used_slots_ptr()
{ return (u32*)&storage_base_ship_used_slots[0]; }
STORAGE_STRUCT(base_ship, DATA_BASE_SHIP, data_base_ship, MAX_BASE_SHIPS)
FIND_STORAGE_BY_NAME_ID_FUNC(base_ship, DATA_BASE_SHIP, MAX_BASE_SHIPS)
void assign_storage_base_ship(u32 id, DATA_BASE_SHIP* source)
{
    storage_base_ship.data[id].id = id;
    storage_base_ship.data[id].name_id = source->name_id;
    storage_base_ship.data[id].top_material_id = source->top_material_id;
    storage_base_ship.data[id].base_price = source->base_price;
    storage_base_ship.data[id].max_capacity = source->max_capacity;
    storage_base_ship.data[id].tacking = source->tacking;
    storage_base_ship.data[id].power = source->power;
    storage_base_ship.data[id].speed = source->speed;
    storage_base_ship.data[id].durability = source->durability;
}
ADD_STORAGE_FUNC(base_ship, DATA_BASE_SHIP)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_ship_id;
    u32 price;
    u32 material_id;
    u32 capacity;
    u32 tacking;
    u32 power;
    u32 speed;
    u32 durability;
    u32 crew;
    u32 crew_space;
    u32 cargo_space;
    u32 cannon_space;
    // Actual number of cannons purchased (could be under the available space)
    u32 cannons;
    // Reference to CANNON* type
    u32 cannon_type_id;
    u32 cargo_goods[MAX_SHIP_CARGO_SPACE];
    u32 cargo_goods_qty[MAX_SHIP_CARGO_SPACE];
    u32 total_cargo_goods;
    u32 figurehead_id;
} DATA_SHIP;
/** EXPORT TO JS **/
u32 storage_ship_used_slots[MAX_SHIPS];
u32* get_storage_ship_used_slots_ptr()
{ return (u32*)&storage_ship_used_slots[0]; }
STORAGE_STRUCT(ship, DATA_SHIP, data_ship, MAX_SHIPS)
FIND_STORAGE_BY_NAME_ID_FUNC(ship, DATA_SHIP, MAX_SHIPS)
void assign_storage_ship(u32 id, DATA_SHIP* source)
{
    storage_ship.data[id].id = id;
    storage_ship.data[id].name_id = source->name_id;
    storage_ship.data[id].base_ship_id = source->base_ship_id;
    storage_ship.data[id].price = source->price;
    storage_ship.data[id].material_id = source->material_id;
    storage_ship.data[id].capacity = source->capacity;
    storage_ship.data[id].tacking = source->tacking;
    storage_ship.data[id].power = source->power;
    storage_ship.data[id].speed = source->speed;
    storage_ship.data[id].crew = source->crew;
    storage_ship.data[id].cannons = source->cannons;
    storage_ship.data[id].cannon_type_id = source->cannon_type_id;
    storage_ship.data[id].durability = source->durability;
    storage_ship.data[id].total_cargo_goods = source->total_cargo_goods;
    storage_ship.data[id].figurehead_id = source->figurehead_id;
    for (u32 i = 0; i < MAX_SHIP_CARGO_SPACE; ++i)
    {
        storage_ship.data[id].cargo_goods[i] = source->cargo_goods[i];
    }
    for (u32 i = 0; i < MAX_SHIP_CARGO_SPACE; ++i)
    {
        storage_ship.data[id].cargo_goods_qty[i] = source->cargo_goods_qty[i];
    }
}
ADD_STORAGE_FUNC(ship, DATA_SHIP)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_price;
    u32 mod_power;
    u32 mod_capacity;
    u32 mod_tacking;
    u32 mod_speed;
    u32 mod_durability;
} DATA_SHIP_MATERIAL;
/** EXPORT TO JS **/
u32 storage_ship_material_used_slots[MAX_SHIP_MATERIALS];
u32* get_storage_ship_material_used_slots_ptr()
{ return (u32*)&storage_ship_material_used_slots[0]; }
STORAGE_STRUCT(ship_material, DATA_SHIP_MATERIAL, data_ship_material, MAX_SHIP_MATERIALS)
FIND_STORAGE_BY_NAME_ID_FUNC(ship_material, DATA_SHIP_MATERIAL, MAX_SHIP_MATERIALS)
void assign_storage_ship_material(u32 id, DATA_SHIP_MATERIAL* source)
{
    storage_ship_material.data[id].id = id;
    storage_ship_material.data[id].name_id = source->name_id;
    storage_ship_material.data[id].base_price = source->base_price;
    storage_ship_material.data[id].mod_power = source->mod_power;
    storage_ship_material.data[id].mod_capacity = source->mod_capacity;
    storage_ship_material.data[id].mod_tacking = source->mod_tacking;
    storage_ship_material.data[id].mod_speed = source->mod_speed;
    storage_ship_material.data[id].mod_durability = source->mod_durability;
}
ADD_STORAGE_FUNC(ship_material, DATA_SHIP_MATERIAL)
void clear_ship_material(u32 id)
{
    storage_ship_material.data[id].name_id = SENTRY;
    storage_ship_material.data[id].base_price = SENTRY;
    storage_ship_material.data[id].mod_power = SENTRY;
    storage_ship_material.data[id].mod_capacity = SENTRY;
    storage_ship_material.data[id].mod_tacking = SENTRY;
    storage_ship_material.data[id].mod_speed = SENTRY;
    storage_ship_material.data[id].mod_durability = SENTRY;
    free_storage_ship_material_slot(id);
}
void clear_all_ship_materials()
{
    for (u32 i = 0; i < MAX_SHIP_MATERIALS; ++i)
    {
        clear_ship_material(i);
    }
}

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_price;
} DATA_GOOD;
/** EXPORT TO JS **/
u32 storage_good_used_slots[MAX_GOODS];
u32* get_storage_good_used_slots_ptr()
{ return (u32*)&storage_good_used_slots[0]; }
STORAGE_STRUCT(good, DATA_GOOD, data_good, MAX_GOODS)
FIND_STORAGE_BY_NAME_ID_FUNC(good, DATA_GOOD, MAX_GOODS)
void assign_storage_good(u32 id, DATA_GOOD* source)
{
    storage_good.data[id].id = id;
    source->id = id;
    storage_good.data[id].name_id = source->name_id;
    storage_good.data[id].base_price = source->base_price;
}
ADD_STORAGE_FUNC(good, DATA_GOOD)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_price;
    u32 power;
} DATA_WEAPON;
/** EXPORT TO JS **/
u32 storage_weapon_used_slots[MAX_WEAPONS];
u32* get_storage_weapon_used_slots_ptr()
{ return (u32*)&storage_weapon_used_slots[0]; }
STORAGE_STRUCT(weapon, DATA_WEAPON, data_weapon, MAX_WEAPONS)
FIND_STORAGE_BY_NAME_ID_FUNC(weapon, DATA_WEAPON, MAX_WEAPONS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_price;
    u32 defense;
} DATA_ARMOR;
/** EXPORT TO JS **/
u32 storage_armor_used_slots[MAX_ARMORS];
u32* get_storage_armor_used_slots_ptr()
{ return (u32*)&storage_armor_used_slots[0]; }
STORAGE_STRUCT(armor, DATA_ARMOR, data_armor, MAX_ARMORS)
FIND_STORAGE_BY_NAME_ID_FUNC(armor, DATA_ARMOR, MAX_ARMORS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_price;
} DATA_SPECIAL_ITEM;
/** EXPORT TO JS **/
u32 storage_special_item_used_slots[MAX_SPECIAL_ITEMS];
u32* get_storage_special_item_used_slots_ptr()
{ return (u32*)&storage_special_item_used_slots[0]; }
STORAGE_STRUCT(special_item, DATA_SPECIAL_ITEM, data_special_item, MAX_SPECIAL_ITEMS)
FIND_STORAGE_BY_NAME_ID_FUNC(special_item, DATA_SPECIAL_ITEM, MAX_SPECIAL_ITEMS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 width;
    u32 height;
    u32 total_npcs;
    u32 total_captains;
    u32 total_layers;
    u32 layers[MAX_LAYERS];
} DATA_WORLD;
/** EXPORT TO JS **/
u32 storage_world_used_slots[MAX_WORLDS];
u32* get_storage_world_used_slots_ptr()
{ return (u32*)&storage_world_used_slots[0]; }
STORAGE_STRUCT(world, DATA_WORLD, data_world, MAX_WORLDS)
FIND_STORAGE_BY_NAME_ID_FUNC(world, DATA_WORLD, MAX_WORLDS)
void add_layer_to_world(u32 layer_id, u32 world_id)
{
    u32 current_i = storage_world.data[world_id].total_layers;
    storage_world.data[world_id].layers[current_i] = layer_id;
    ++storage_world.data[world_id].total_layers;
}
void assign_storage_world(u32 id, DATA_WORLD* source)
{
    storage_world.data[id].id = id;
    storage_world.data[id].name_id = source->name_id;
    storage_world.data[id].width = source->width;
    storage_world.data[id].height = source->height;
    storage_world.data[id].total_npcs = source->total_npcs;
    storage_world.data[id].total_captains = source->total_captains;
    storage_world.data[id].total_layers = source->total_layers;
    for (u32 i = 0; i < MAX_LAYERS; ++i)
    {
        storage_world.data[id].layers[i] = source->layers[i];
    }
}
ADD_STORAGE_FUNC(world, DATA_WORLD)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 npc_id;
    u32 position_x;
    u32 position_y;
    u32 direction;
    u32 is_interactable;
    u32 is_captain;
    u32 interaction_scene;
    u32 is_player;
    u32 inventory_id;
    u32 entity_id;
    u32 captain_id;
    u32 type_id;
} DATA_WORLD_NPC;
/** EXPORT TO JS **/
u32 storage_world_npc_used_slots[MAX_WORLD_NPCS];
u32* get_storage_world_npc_used_slots_ptr()
{ return (u32*)&storage_world_npc_used_slots[0]; }
STORAGE_STRUCT(world_npc, DATA_WORLD_NPC, data_world_npc, MAX_WORLD_NPCS)
FIND_STORAGE_BY_NAME_ID_FUNC(world_npc, DATA_WORLD_NPC, MAX_WORLD_NPCS)
void clear_all_world_npcs()
{
    for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
    {
        free_storage_world_npc_slot(i);
    }
}
void assign_storage_world_npc(u32 id, DATA_WORLD_NPC* source)
{
    storage_world_npc.data[id].id = id;
    source->id = id;
    storage_world_npc.data[id].name_id = source->name_id;
    storage_world_npc.data[id].npc_id = source->npc_id;
    storage_world_npc.data[id].position_x = source->position_x;
    storage_world_npc.data[id].position_y = source->position_y;
    storage_world_npc.data[id].direction = source->direction;
    storage_world_npc.data[id].is_interactable = source->is_interactable;
    storage_world_npc.data[id].is_captain = source->is_captain;
    storage_world_npc.data[id].interaction_scene = source->interaction_scene;
    storage_world_npc.data[id].is_player = source->is_player;
    storage_world_npc.data[id].inventory_id = source->inventory_id;
    storage_world_npc.data[id].entity_id = source->entity_id;
    storage_world_npc.data[id].captain_id = source->captain_id;
    storage_world_npc.data[id].type_id = source->type_id;
}
ADD_STORAGE_FUNC(world_npc, DATA_WORLD_NPC)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 npc_id;
    u32 world_npc_id;
    u32 in_world;
    u32 global_position_x;
    u32 global_position_y;
    u32 in_port;
    u32 on_land;
    u32 in_ocean;
    u32 sailing;
    u32 gold;
    u32 inventory_id;
    u32 player_id;
    u32 general_of_fleet_id;
    u32 stats_id;
    u32 skills[20];
    u32 test_for_pointer[20];
} DATA_CAPTAIN;
/** EXPORT TO JS **/
u32 storage_captain_used_slots[MAX_CAPTAINS];
u32* get_storage_captain_used_slots_ptr()
{ return (u32*)&storage_captain_used_slots[0]; }
STORAGE_STRUCT(captain, DATA_CAPTAIN, data_captain, MAX_CAPTAINS)
FIND_STORAGE_BY_NAME_ID_FUNC(captain, DATA_CAPTAIN, MAX_CAPTAINS)
void assign_storage_captain(u32 id, DATA_CAPTAIN* source)
{
    storage_captain.data[id].id = id;
    source->id = id;
    storage_captain.data[id].name_id = source->name_id;
    storage_captain.data[id].npc_id = source->npc_id;
    storage_captain.data[id].world_npc_id = source->world_npc_id;
    storage_captain.data[id].in_world = source->in_world;
    storage_captain.data[id].global_position_x = source->global_position_x;
    storage_captain.data[id].global_position_y = source->global_position_y;
    storage_captain.data[id].in_port = source->in_port;
    storage_captain.data[id].on_land = source->on_land;
    storage_captain.data[id].in_ocean = source->in_ocean;
    storage_captain.data[id].sailing = source->sailing;
    storage_captain.data[id].gold = source->gold;
    storage_captain.data[id].inventory_id = source->inventory_id;
    storage_captain.data[id].player_id = source->player_id;
    storage_captain.data[id].stats_id = source->stats_id;
    storage_captain.data[id].general_of_fleet_id = source->general_of_fleet_id;
    for (u32 i = 0; i < 20; ++i)
    {
        storage_captain.data[id].skills[i] = source->skills[i];
    }
}
ADD_STORAGE_FUNC(captain, DATA_CAPTAIN)
// ------------------------- POINTER TESTING STARTS ------------------------- //
// NOTE: This test proves that we can get a pointer to something directly into wasm
// NOTE: This test also proves that we can get a pointer AND length in wasm (for dataview ops)
// wasm.exports.do_what_now();
// new Uint32Array(wasm.exports.memory.buffer, wasm.exports.say_what_now(), 56);
typedef struct __attribute__((packed))
{
    DATA_CAPTAIN* some_ref;
} SOME_REF;
SOME_REF some_ref;
void do_what_now()
{
    some_ref.some_ref = &storage_captain.data[0];
}
u32* say_what_now()
{
    args[0].i = (sizeof(DATA_CAPTAIN) / sizeof(u32));
    args[1].i = (sizeof(storage_captain.data[0].test_for_pointer) / sizeof(u32));
    args[2].i = (sizeof(storage_captain.data[0].world_npc_id) / sizeof(u32));
    // We can replace struct_extractor.c with this
    char* test_str =
        "STRUCT_DATA_CAPTAIN->"
        "{\"struct_size\":%d,\"ptr_test\":%d,\"wnpcid\":%d}";
    console_log_format(test_str, args, 3);
    return (u32*)some_ref.some_ref;
}
// ------------------------- POINTER TESTING ENDS ------------------------- //

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    // NOTE: You had this as a bool but it caused alignment issues in JS
    u32 is_block;
    u32 id;
    u32 name_id;
    u32 width;
    u32 height;
    u32 same_value;
    u32 specific_coordinates_size;
    u32 data[MAX_LAYER_SIZE];
} DATA_LAYER;
/** EXPORT TO JS **/
u32 storage_layer_used_slots[MAX_WORLD_NPCS];
u32* get_storage_layer_used_slots_ptr()
{ return (u32*)&storage_layer_used_slots[0]; }
STORAGE_STRUCT(layer, DATA_LAYER, data_layer, MAX_LAYERS)
FIND_STORAGE_BY_NAME_ID_FUNC(layer, DATA_LAYER, MAX_LAYERS)
void clear_layer(u32 id)
{
    for (u32 i = 0; i < MAX_LAYER_SIZE; ++i)
    {
        storage_layer.data[id].data[i] = SENTRY;
    }
    free_storage_layer_slot(id);
}
void clear_all_layers()
{
    for (u32 l = 0; l < MAX_LAYERS; ++l)
    {
        clear_layer(l);
    }
}
void layer_set_value(u32 id, u32 x, u32 y, u32 value)
{
    if (storage_layer.used[id] == false)
    {
        console_log("[E] Tried to get layer not currently in use");
        return;
    }
    u32 layer_width = storage_layer.data[id].width;
    u32 layer_height = storage_layer.data[id].height;
    if (x > layer_width)
    {
        console_log("[E] Tried to get layer coordinate greater than width");
        return;
    }
    if (y > layer_height)
    {
        console_log("[E] Tried to get layer coordinate greater than height");
        return;
    }
    u32 offset = (y * layer_width) + x;
    storage_layer.data[id].data[offset] = value;
}
u32 layer_get_value(u32 id, u32 x, u32 y)
{
    if (storage_layer.used[id] == false)
    {
        console_log("[E] Tried to get layer not currently in use");
        return SENTRY;
    }
    u32 layer_width = storage_layer.data[id].width;
    u32 layer_height = storage_layer.data[id].height;
    if (x > layer_width)
    {
        console_log("[E] Tried to get layer coordinate greater than width");
        return SENTRY;
    }
    if (y > layer_height)
    {
        console_log("[E] Tried to get layer coordinate greater than height");
        return SENTRY;
    }
    u32 offset = (y * layer_width) + x;
    return storage_layer.data[id].data[offset];
}

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 number_held;
    u32 adjusted_price;
    u32 type;
    u32 type_reference;
    u32 inventory_id;
} DATA_INVENTORY_ITEM;
/** EXPORT TO JS **/
u32 storage_inventory_item_used_slots[MAX_WORLD_NPCS];
u32* get_storage_inventory_item_used_slots_ptr()
{ return (u32*)&storage_inventory_item_used_slots[0]; }
STORAGE_STRUCT(inventory_item, DATA_INVENTORY_ITEM, data_inventory_item, MAX_INVENTORY_ITEMS)
FIND_STORAGE_BY_NAME_ID_FUNC(inventory_item, DATA_INVENTORY_ITEM, MAX_INVENTORY_ITEMS)
void clear_inventory_items_by_inventory_id(u32 inventory_id)
{
    for (u32 i = 0; i < MAX_INVENTORY_ITEMS; ++i)
    {
        if (storage_inventory_item.data[i].inventory_id == inventory_id)
        {
            free_storage_inventory_item_slot(i);
        }
    }
}
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 total_items;
    u32 inventory_items[MAX_INVENTORY_ITEMS];
} DATA_INVENTORY;
/** EXPORT TO JS **/
u32 storage_inventory_used_slots[MAX_WORLD_NPCS];
u32* get_storage_inventory_used_slots_ptr()
{ return (u32*)&storage_inventory_used_slots[0]; }
STORAGE_STRUCT(inventory, DATA_INVENTORY, data_inventory, MAX_INVENTORIES)
FIND_STORAGE_BY_NAME_ID_FUNC(inventory, DATA_INVENTORY, MAX_INVENTORIES)
void update_inventory_items(u32 inventory_id)
{
    u32 total_items = 0;
    for (u32 i = 0; i < MAX_INVENTORY_ITEMS; ++i)
    {
        if (
            storage_inventory_item.used[i] == true
            &&
            storage_inventory_item.data[i].inventory_id == inventory_id
        )
        {
            storage_inventory.data[inventory_id].inventory_items[total_items] = storage_inventory_item.data[i].id;
            ++total_items;
        }
        else
        {
            storage_inventory.data[inventory_id].inventory_items[i] = SENTRY;
        }
    }
    storage_inventory.data[inventory_id].total_items = total_items;
}
void add_item_to_inventory(u32 item_id, u32 inventory_id)
{
    storage_inventory_item.data[item_id].inventory_id = inventory_id;
    update_inventory_items(inventory_id);
}
void assign_storage_inventory(u32 id, DATA_INVENTORY* source)
{
    storage_inventory.data[id].id = id;
    source->id = id;
    storage_inventory.data[id].name_id = source->name_id;
    storage_inventory.data[id].total_items = source->total_items;
    for (u32 i = 0; i < MAX_INVENTORY_ITEMS; ++i)
    {
        storage_inventory.data[id].inventory_items[i] = source->inventory_items[i];
    }
}
ADD_STORAGE_FUNC(inventory, DATA_INVENTORY)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 global_location_x;
    u32 global_location_y;
    u32 overall_investment_level;
    u32 market_investment_level;
    u32 shipyard_investment_level;
    u32 base_trade_tax;
} DATA_PORT;
/** EXPORT TO JS **/
u32 storage_port_used_slots[MAX_PORTS];
u32* get_storage_port_used_slots_ptr()
{ return (u32*)&storage_port_used_slots[0]; }
STORAGE_STRUCT(port, DATA_PORT, data_port, MAX_PORTS)
FIND_STORAGE_BY_NAME_ID_FUNC(port, DATA_PORT, MAX_PORTS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 flag_initialized;
    u32 previous_game_mode;
    u32 error_code;
    u32 dialog_id;
    // Note: references ships which are created during in port & cleared after
    // for this specific scene only
    u32 ships_prefab[MAX_SHIP_PREFABS];
    u32 buying_prefab_ship_id;
    // Note: references DATA_NEW_SHIP storage
    u32 new_ship;
    u32 to_invest;
    u32 remodel_ship_id;
    u32 remodel_space_price;
    u32 remodel_material_price;
    u32 remodel_cannon_price;
    u32 remodel_figurehead_price;
} DATA_SCENE_SHIPYARD;
DATA_SCENE_SHIPYARD Scene_Shipyard;
u32* get_data_scene_shipyard_ptr()
{ return (u32*)&Scene_Shipyard; }

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 flag_initialized;
    u32 previous_game_mode;
    u32 error_code;
    u32 dialog_id;
    u32 purchase_food;
    u32 purchase_water;
    u32 purchase_cannonballs;
    u32 price_food;
    u32 price_water;
    u32 price_cannonballs;
    u32 purchase_for_ship_id;
} DATA_SCENE_DOCKYARD;
DATA_SCENE_DOCKYARD Scene_Dockyard;
u32* get_data_scene_dockyard_ptr()
{ return (u32*)&Scene_Dockyard; }
void clear_scene_dockyard()
{
    Scene_Dockyard.purchase_food = 0;
    Scene_Dockyard.purchase_water = 0;
    Scene_Dockyard.purchase_cannonballs = 0;
    Scene_Dockyard.price_food = 0;
    Scene_Dockyard.price_water = 0;
    Scene_Dockyard.price_cannonballs = 0;
    Scene_Dockyard.purchase_for_ship_id = SENTRY;
}

// NOTE: SPECIFICALLY for shipyard scene for remodeling
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 capacity;
    u32 tacking;
    u32 power;
    u32 speed;
    u32 durability;
    u32 material_id;
    u32 cargo_space;
    u32 cannon_space;
    u32 crew_space;
    u32 cannon_type_id;
    u32 figurehead_id;
    u32 space_price;
    u32 material_price;
    u32 cannon_price;
    u32 figurehead_price;
    u32 total_price;
} DATA_REMODEL_SHIP;
DATA_REMODEL_SHIP Remodel_Ship;
u32* get_data_remodel_ship_ptr()
{ return (u32*)&Remodel_Ship; }
void clear_remodel_ship()
{
    Remodel_Ship.material_id = SENTRY;
    Remodel_Ship.cargo_space = SENTRY;
    Remodel_Ship.cannon_space = SENTRY;
    Remodel_Ship.crew_space = SENTRY;
    Remodel_Ship.cannon_type_id = SENTRY;
    Remodel_Ship.figurehead_id = SENTRY;
    Remodel_Ship.space_price = 0;
    Remodel_Ship.material_price = 0;
    Remodel_Ship.cannon_price = 0;
    Remodel_Ship.figurehead_price = 0;
    Remodel_Ship.total_price = SENTRY;
}
void calculate_remodel_ship()
{
    Remodel_Ship.total_price = 0;
    Remodel_Ship.total_price += Remodel_Ship.space_price;
    Remodel_Ship.total_price += Remodel_Ship.material_price;
    Remodel_Ship.total_price += Remodel_Ship.cannon_price;
    Remodel_Ship.total_price += Remodel_Ship.figurehead_price;
}

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 type_id;
    u32 material_id;
    u32 cargo;
    u32 cannons;
    u32 crew;
    u32 cannon_type_id;
    u32 figurehead_id;
} DATA_NEW_SHIP;
/** EXPORT TO JS **/
u32 storage_new_ship_used_slots[MAX_PORTS];
// NOTE: A port can only build one new ship at a time so this works
u32* get_storage_new_ship_used_slots_ptr()
{ return (u32*)&storage_new_ship_used_slots[0]; }
STORAGE_STRUCT(new_ship, DATA_NEW_SHIP, data_new_ship, MAX_PORTS)
FIND_STORAGE_BY_NAME_ID_FUNC(new_ship, DATA_NEW_SHIP, MAX_PORTS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 battle_level;
    u32 navigation_level;
    u32 leadership;
    u32 seamanship;
    u32 knowledge;
    u32 intuition;
    u32 courage;
    u32 swordsmanship;
    u32 charm;
    u32 luck;
} DATA_STATS;
/** EXPORT TO JS **/
u32 storage_stats_used_slots[MAX_STATS];
u32* get_storage_stats_used_slots_ptr()
{ return (u32*)&storage_stats_used_slots[0]; }
STORAGE_STRUCT(stats, DATA_STATS, data_stats, MAX_STATS)
FIND_STORAGE_BY_NAME_ID_FUNC(stats, DATA_STATS, MAX_STATS)
void assign_storage_stats(u32 id, DATA_STATS* source)
{
    storage_stats.data[id].id = id;
    source->id = id;
    storage_stats.data[id].name_id = source->name_id;
    storage_stats.data[id].battle_level = source->battle_level;
    storage_stats.data[id].navigation_level = source->navigation_level;
    storage_stats.data[id].leadership = source->leadership;
    storage_stats.data[id].seamanship = source->seamanship;
    storage_stats.data[id].knowledge = source->knowledge;
    storage_stats.data[id].intuition = source->intuition;
    storage_stats.data[id].courage = source->courage;
    storage_stats.data[id].swordsmanship = source->swordsmanship;
    storage_stats.data[id].charm = source->charm;
    storage_stats.data[id].luck = source->luck;
}
ADD_STORAGE_FUNC(stats, DATA_STATS)
void default_stats(DATA_STATS* source)
{
    source->battle_level = 0;
    source->navigation_level = 0;
    source->leadership = 0;
    source->seamanship = 0;
    source->knowledge = 0;
    source->intuition = 0;
    source->courage = 0;
    source->swordsmanship = 0;
    source->charm = 0;
    source->luck = 0;
}

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 stats_requirements_id;
} DATA_SKILL;
/** EXPORT TO JS **/
u32 storage_skill_used_slots[MAX_SKILLS];
u32* get_storage_skill_used_slots_ptr()
{ return (u32*)&storage_skill_used_slots[0]; }
STORAGE_STRUCT(skill, DATA_SKILL, data_skill, MAX_SKILLS)
FIND_STORAGE_BY_NAME_ID_FUNC(skill, DATA_SKILL, MAX_SKILLS)
void assign_storage_skill(u32 id, DATA_SKILL* source)
{
    storage_skill.data[id].id = id;
    source->id = id;
    storage_skill.data[id].stats_requirements_id = source->stats_requirements_id;
}
ADD_STORAGE_FUNC(skill, DATA_SKILL)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 is_interactable;
    u32 is_solid;
    u32 interaction_on_step_over;
    u32 interaction_scene;
    u32 position_x;
    u32 position_y;
} DATA_ENTITY;
/** EXPORT TO JS **/
u32 storage_entity_used_slots[MAX_ENTITIES];
u32* get_storage_entity_used_slots_ptr()
{ return (u32*)&storage_entity_used_slots[0]; }
STORAGE_STRUCT(entity, DATA_ENTITY, data_entity, MAX_ENTITIES)
FIND_STORAGE_BY_NAME_ID_FUNC(entity, DATA_ENTITY, MAX_ENTITIES)
void assign_storage_entity(u32 id, DATA_ENTITY* source)
{
    storage_entity.data[id].id = id;
    storage_entity.data[id].name_id = source->name_id;
    storage_entity.data[id].is_interactable = source->is_interactable;
    storage_entity.data[id].is_solid = source->is_solid;
    storage_entity.data[id].interaction_on_step_over = source->interaction_on_step_over;
    storage_entity.data[id].interaction_scene = source->interaction_scene;
    storage_entity.data[id].position_x = source->position_x;
    storage_entity.data[id].position_y = source->position_y;
}
ADD_STORAGE_FUNC(entity, DATA_ENTITY    )
void clear_all_entities()
{
    for (u32 i = 0; i < MAX_ENTITIES; ++i)
    {
        free_storage_entity_slot(i);
    }
}

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 total_ships;
    u32 total_captains;
    u32 first_mate_id;
    u32 accountant_id;
    u32 navigator_id;
    u32 general_id;
    u32 ship_ids[MAX_FLEET_SHIPS];
    u32 captain_ids[MAX_FLEET_CAPTAINS];
} DATA_FLEET;
/** EXPORT TO JS **/
u32 storage_fleet_used_slots[MAX_FLEETS];
u32* get_storage_fleet_used_slots_ptr()
{ return (u32*)&storage_fleet_used_slots[0]; }
STORAGE_STRUCT(fleet, DATA_FLEET, data_fleet, MAX_FLEETS)
FIND_STORAGE_BY_NAME_ID_FUNC(fleet, DATA_FLEET, MAX_FLEETS)
void assign_storage_fleet(u32 id, DATA_FLEET* source)
{
    storage_fleet.data[id].id = id;
    storage_fleet.data[id].name_id = source->name_id;
    storage_fleet.data[id].total_ships = source->total_ships;
    storage_fleet.data[id].total_captains = source->total_captains;
    storage_fleet.data[id].first_mate_id = source->first_mate_id;
    storage_fleet.data[id].accountant_id = source->accountant_id;
    storage_fleet.data[id].navigator_id = source->navigator_id;
    storage_fleet.data[id].general_id = source->general_id;
    for (u32 i = 0; i < MAX_FLEET_SHIPS; ++i)
    {
        storage_fleet.data[id].ship_ids[i] = source->ship_ids[i];
    }
    for (u32 i = 0; i < MAX_FLEET_CAPTAINS; ++i)
    {
        storage_fleet.data[id].captain_ids[i] = source->captain_ids[i];
    }
}
ADD_STORAGE_FUNC(fleet, DATA_FLEET)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 ship_id;
    u32 fleet_id;
    u32 captain_id;
    u32 is_flagship;
} DATA_FLEET_SHIP;
/** EXPORT TO JS **/
u32 storage_fleet_ship_used_slots[MAX_FLEET_SHIPS];
u32* get_storage_fleet_ship_used_slots_ptr()
{ return (u32*)&storage_fleet_ship_used_slots[0]; }
STORAGE_STRUCT(fleet_ship, DATA_FLEET_SHIP, data_fleet_ship, MAX_FLEET_SHIPS)
FIND_STORAGE_BY_NAME_ID_FUNC(fleet_ship, DATA_FLEET_SHIP, MAX_FLEET_SHIPS)
void assign_storage_fleet_ship(u32 id, DATA_FLEET_SHIP* source)
{
    storage_fleet_ship.data[id].id = id;
    storage_fleet_ship.data[id].name_id = source->name_id;
    storage_fleet_ship.data[id].ship_id = source->ship_id;
    storage_fleet_ship.data[id].fleet_id = source->fleet_id;
    storage_fleet_ship.data[id].captain_id = source->captain_id;
    storage_fleet_ship.data[id].is_flagship = source->is_flagship;
}
ADD_STORAGE_FUNC(fleet_ship, DATA_FLEET_SHIP)
bool add_fleet_ship_to_fleet(u32 fleet_ship_id, u32 fleet_id)
{
    bool added = false;
    for (u32 i = 0; i < MAX_FLEET_SHIPS; ++i)
    {
        if (storage_fleet.data[fleet_id].ship_ids[i] != SENTRY)
        {
            continue;
        }
        added = true;
        storage_fleet.data[fleet_id].ship_ids[i] = fleet_ship_id;
        // Just to make sure the ship is assigned this fleet
        storage_fleet_ship.data[fleet_ship_id].fleet_id = fleet_id;
        break;
    }
    return added;
}

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 captain_id;
    u32 fleet_id;
} DATA_FLEET_CAPTAIN;
/** EXPORT TO JS **/
u32 storage_fleet_captain_used_slots[MAX_FLEET_CAPTAINS];
u32* get_storage_fleet_captain_used_slots_ptr()
{ return (u32*)&storage_fleet_captain_used_slots[0]; }
STORAGE_STRUCT(fleet_captain, DATA_FLEET_CAPTAIN, data_fleet_captain, MAX_FLEET_CAPTAINS)
FIND_STORAGE_BY_NAME_ID_FUNC(fleet_captain, DATA_FLEET_CAPTAIN, MAX_FLEET_CAPTAINS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 range;
    u32 power;
    u32 base_price;
} DATA_CANNON;
/** EXPORT TO JS **/
u32 storage_cannon_used_slots[MAX_CANNONS];
u32* get_storage_cannon_used_slots_ptr()
{ return (u32*)&storage_cannon_used_slots[0]; }
STORAGE_STRUCT(cannon, DATA_CANNON, data_cannon, MAX_CANNONS)
FIND_STORAGE_BY_NAME_ID_FUNC(cannon, DATA_CANNON, MAX_CANNONS)
void assign_storage_cannon(u32 id, DATA_CANNON* source)
{
    storage_cannon.data[id].id = id;
    storage_cannon.data[id].name_id = source->name_id;
    storage_cannon.data[id].range = source->range;
    storage_cannon.data[id].power = source->power;
    storage_cannon.data[id].base_price = source->base_price;
}
ADD_STORAGE_FUNC(cannon, DATA_CANNON)
void clear_cannon(u32 id)
{
    storage_cannon.data[id].name_id = SENTRY;
    storage_cannon.data[id].range = SENTRY;
    storage_cannon.data[id].power = SENTRY;
    storage_cannon.data[id].base_price = SENTRY;
    free_storage_cannon_slot(id);
}
void clear_all_cannons()
{
    for (u32 i = 0; i < MAX_CANNONS; ++i)
    {
        clear_cannon(i);
    }
}

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 base_price;
} DATA_FIGUREHEAD;
/** EXPORT TO JS **/
u32 storage_figurehead_used_slots[MAX_FIGUREHEADS];
u32* get_storage_figurehead_used_slots_ptr()
{ return (u32*)&storage_figurehead_used_slots[0]; }
STORAGE_STRUCT(figurehead, DATA_FIGUREHEAD, data_figurehead, MAX_FIGUREHEADS)
FIND_STORAGE_BY_NAME_ID_FUNC(figurehead, DATA_FIGUREHEAD, MAX_FIGUREHEADS)
void assign_storage_figurehead(u32 id, DATA_FIGUREHEAD* source)
{
    storage_figurehead.data[id].id = id;
    storage_figurehead.data[id].name_id = source->name_id;
    storage_figurehead.data[id].base_price = source->base_price;
}
ADD_STORAGE_FUNC(figurehead, DATA_FIGUREHEAD)
void clear_figurehead(u32 id)
{
    storage_figurehead.data[id].name_id = SENTRY;
    storage_figurehead.data[id].base_price = SENTRY;
    free_storage_figurehead_slot(id);
}
void clear_all_figureheads()
{
    for (u32 i = 0; i < MAX_FIGUREHEADS; ++i)
    {
        clear_figurehead(i);
    }
}

// ------------------------------------------------------------------------------------------------
// - TIME
// ------------------------------------------------------------------------------------------------
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    // 0-59
    u32 minute;
    // 0-23
    u32 hour;
    // 1-31
    u32 day;
    // 1-12
    u32 month;
    // Starting from 1500
    u32 year;
    // Total days elapsed
    u32 total_days;
    // 1 if night, 0 if day
    u32 is_night;
    // Accumulator for ticks
    u32 ticks_counter;
} DATA_GAME_TIME;
DATA_GAME_TIME Game_Time;
u32* get_data_game_time_ptr()
{ return (u32*)&Game_Time; }
#define TICKS_PER_MINUTE 60      // Adjust based on your desired game speed
#define MINUTES_PER_HOUR 60
#define HOURS_PER_DAY 24
#define DAYS_PER_WEEK 7
#define MONTHS_PER_YEAR 12
// Sunrise/sunset hours (can be adjusted seasonally)
#define SUNRISE_HOUR 6
#define SUNSET_HOUR 18
// Days per month in the 16th century (accounting for Julian calendar)
const u32 DAYS_PER_MONTH[12] = {
    31, // January
    28, // February (handle leap years separately)
    31, // March
    30, // April
    31, // May
    30, // June
    31, // July
    31, // August
    30, // September
    31, // October
    30, // November
    31  // December
};
void initialize_game_time()
{
    Game_Time.minute = 0;
    Game_Time.hour = 8;     // Start at 8 AM
    Game_Time.day = 1;
    Game_Time.month = 1;
    Game_Time.year = 1500;  // Start in year 1500
    Game_Time.total_days = 0;
    Game_Time.is_night = 0;
    Game_Time.ticks_counter = 0;
}
bool is_leap_year(u32 year)
{
    // Julian calendar leap year rule
    return year % 4 == 0;
}
void update_game_time()
{
    Game_Time.ticks_counter++;
    
    if (Game_Time.ticks_counter >= TICKS_PER_MINUTE)
    {
        Game_Time.ticks_counter = 0;
        Game_Time.minute++;
        
        if (Game_Time.minute >= MINUTES_PER_HOUR)
        {
            Game_Time.minute = 0;
            Game_Time.hour++;
            
            // Update day/night cycle
            if (Game_Time.hour == SUNRISE_HOUR)
                Game_Time.is_night = 0;
            else if (Game_Time.hour == SUNSET_HOUR)
                Game_Time.is_night = 1;
            
            if (Game_Time.hour >= HOURS_PER_DAY)
            {
                Game_Time.hour = 0;
                Game_Time.day++;
                Game_Time.total_days++;
                
                u32 max_days = DAYS_PER_MONTH[Game_Time.month - 1];
                if (Game_Time.month == 2 && is_leap_year(Game_Time.year))
                    max_days++;
                
                if (Game_Time.day > max_days)
                {
                    Game_Time.day = 1;
                    Game_Time.month++;
                    
                    if (Game_Time.month > MONTHS_PER_YEAR)
                    {
                        Game_Time.month = 1;
                        Game_Time.year++;
                    }
                }
            }
        }
    }
}
// Check if it's night
bool is_currently_night()
{
    return Game_Time.is_night == 1;
}
// Get current season (1-4, starting with spring)
u32 get_current_season()
{
    return ((Game_Time.month - 1) / 3) + 1;
}
// Get days elapsed since game start
u32 get_days_elapsed()
{
    return Game_Time.total_days;
}

// ------------------------------------------------------------------------------------------------
// - ENUMS - SCENES
// ------------------------------------------------------------------------------------------------
enum GameStrings
{
    EMPTY,

    // Actions
    ACTION, ACTION_CONFIRM, ACTION_BUY, ACTION_SELL, ACTION_EXIT, ACTION_SETUP,
    ACTION_NEXT,

    // Blackjack Actions
    ACTION_DEALER_TURN, ACTION_PLAYER_HIT, ACTION_PLAYER_STAND, ACTION_PLACE_BET,

    // Bank Actions
    ACTION_BANK_DEPOSIT, ACTION_BANK_WITHDRAW, ACTION_BANK_PAY_LOAN,
    ACTION_BANK_TAKE_LOAN, ACTION_BANK_DEPOSIT_SUCCESS,
    ACTION_BANK_WITHDRAW_SUCCESS, ACTION_BANK_TAKE_LOAN_SUCCESS,
    ACTION_BANK_PAY_LOAN_SUCCESS,

    // Shipyard Actions
    ACTION_SHIPYARD_BUY_USED,
    ACTION_SHIPYARD_REMODEL_SHIP,
    ACTION_SHIPYARD_REMODEL_SHIP_MATERIAL,
    ACTION_SHIPYARD_REMODEL_SHIP_FIGUREHEAD,
    ACTION_SHIPYARD_REMODEL_SHIP_CANNON_TYPE,
    ACTION_SHIPYARD_REMODEL_SHIP_SPACE,

    // Dockyard Actions
    ACTION_DOCKYARD_PURCHASE,
    ACTION_DOCKYARD_SET_SAIL,

    // Dialogs
    DIALOG_NPC_RVICE, DIALOG_NPC_LAFOLIE, DIALOG_NPC_NAKOR,
    DIALOG_NPC_TRAVIS, DIALOG_NPC_LOLLER,
    // Dialogs - Blackjack
    DIALOG_BLACKJACK_WELCOME,
    // Dialogs - Bank
    DIALOG_BANK_WELCOME,
    // Dialogs - Shipyard
    DIALOG_SHIPYARD_WELCOME,
    DIALOG_SHIPYARD_PREFAB_PURCHASE_SUCCESS,
    DIALOG_SHIPYARD_REMODEL_SUCCESS,
    // Dialogs - Dockyard
    DIALOG_DOCKYARD_WELCOME,
    DIALOG_DOCKYARD_SUPPLIES_LOADED,
    // Dialogs - Goods Shop
    DIALOG_GOODS_SHOP_WELCOME,
    // Dialogs - Test
    DIALOG_TEST_ONE, DIALOG_TEST_TWO, DIALOG_TEST_THREE,

    // Scenes
    SCENE_BLACKJACK, SCENE_GENERAL_SHOP, SCENE_DOCKYARD, SCENE_OCEAN_BATTLE,
    SCENE_OCEAN_FAKE_BATTLE, SCENE_SHIPYARD,
    SCENE_BANK, SCENE_NPC_RVICE, SCENE_NPC_LAFOLIE, SCENE_NPC_NAKOR,
    SCENE_NPC_TRAVIS, SCENE_NPC_LOLLER, SCENE_GOODS_SHOP,
    SCENE_TEST,

    // Inventories
    INVENTORY_ATHENS_GENERAL_SHOP, INVENTORY_PLAYER_ONE,
    INVENTORY_PLAYER_TWO, INVENTORY_PLAYER_THREE,
    INVENTORY_PLAYER_FOUR, INVENTORY_PLAYER_FIVE, INVENTORY_NPC_LOLLER,
    INVENTORY_NPC_RVICE, INVENTORY_NPC_LAFOLIE, INVENTORY_NPC_NAKOR,
    INVENTORY_NPC_TRAVIS, INVENTORY_NPC_BLACKBEARD, INVENTORY_NPC_DAVEY_JONES,
    INVENTORY_ATHENS_GOODS_SHOP,

    // Inventory Types
    INVENTORY_TYPE_GOOD, INVENTORY_TYPE_ARMOR, INVENTORY_TYPE_WEAPON,
    INVENTORY_TYPE_GENERAL_ITEM, INVENTORY_TYPE_CANNON,
    INVENTORY_TYPE_BASE_SHIP, INVENTORY_TYPE_SHIP,

    // Items
    ITEM_TELESCOPE, ITEM_QUADRANT, ITEM_THEODOLITE, ITEM_SEXTANT,

    // Goods
    GOOD_CLOVE, GOOD_CINNAMON, GOOD_PEPPER, GOOD_NUTMEG, GOOD_PIMENTO,
    GOOD_GINGER, GOOD_VANILLA, GOOD_TEA, GOOD_COFFEE, GOOD_CACAO, GOOD_SUGAR,
    GOOD_CHEESE, GOOD_FISH, GOOD_GRAIN, GOOD_OLIVE_OIL, GOOD_RAISINS,
    GOOD_ROCK_SALT, GOOD_SILK, GOOD_COTTON, GOOD_WOOL, GOOD_FLAX,
    GOOD_COTTON_CLOTH, GOOD_SILK_CLOTH, GOOD_WOOL_CLOTH, GOOD_VELVET,
    GOOD_LINEN_CLOTH, GOOD_CORAL, GOOD_AMBER, GOOD_IVORY, GOOD_PEARL,
    GOOD_TORTOISE_SHELL, GOOD_GOLD, GOOD_SILVER, GOOD_COPPER_ORE,
    GOOD_TIN_ORE, GOOD_IRON_ORE, GOOD_ART, GOOD_CARPET, GOOD_MUSK,
    GOOD_PERFUME, GOOD_GLASS_BEADS, GOOD_DYE, GOOD_PORCELAIN, GOOD_GLASSWARE,
    GOOD_ARMS, GOOD_WOOD, GOOD_CANNONBALLS, GOOD_FOOD, GOOD_WATER,

    // Layers
    LAYER_BACKGROUND, LAYER_NPC, LAYER_ENTITY, LAYER_ONE, LAYER_TWO, LAYER_BLOCK,

    // NPCs
    NPC_TRAVIS, NPC_LAFOLIE, NPC_LOLLER, NPC_NAKOR, NPC_RVICE,
    NPC_BANK_TELLER, NPC_PLAYER_ONE, NPC_PLAYER_TWO, NPC_PLAYER_THREE,
    NPC_PLAYER_FOUR, NPC_PLAYER_FIVE, NPC_SHIPYARD_OWNER,
    NPC_GENERAL_SHOP_OWNER, NPC_BLACKJACK_PLAYER, NPC_OCEAN_BATTLE,
    NPC_EMPTY, NPC_BLACKBEARD, NPC_DAVEY_JONES, NPC_KRAKEN, NPC_SHIP,
    NPC_DOCKYARD_OWNER, NPC_GOODS_SHOP_OWNER,

    // NPC types
    NPC_TYPE_HUMAN, NPC_TYPE_SHIP, NPC_TYPE_MONSTER,

    // Worlds
    WORLD_DINGUS_LAND, WORLD_ATHENS, WORLD_GLOBE_1,

    // Base Ships
    BASE_SHIP_BALSA, BASE_SHIP_HANSA_COG, BASE_SHIP_LIGHT_GALLEY,
    BASE_SHIP_TALLETTE, BASE_SHIP_KANSEN, BASE_SHIP_CARAVELA_LATINA,
    BASE_SHIP_CARAVELA_REDONDA, BASE_SHIP_DHOW, BASE_SHIP_JUNK,
    BASE_SHIP_BRIGANTINE, BASE_SHIP_ATAKABUNE, BASE_SHIP_FLEMISH_GALLEON,
    BASE_SHIP_NAO, BASE_SHIP_XEBEC,
    BASE_SHIP_VENETIAN_GALEASS, BASE_SHIP_PINNACE,
    BASE_SHIP_CARRACK, BASE_SHIP_LA_REALE, BASE_SHIP_BUSS,
    BASE_SHIP_GALLEON, BASE_SHIP_SLOOP, BASE_SHIP_TEKKOUSEN,
    BASE_SHIP_FRIGATE, BASE_SHIP_BARGE, BASE_SHIP_FULL_RIGGED_SHIP,

    // Game State Updates
    UPDATED_STATE_NOTHING, UPDATED_STATE_EVERYTHING, UPDATED_STATE_WORLD,
    UPDATED_STATE_NPCS, UPDATED_STATE_PLAYER, UPDATED_STATE_SCENE,

    // Directions
    DIRECTION_UP, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT,

    // Game Modes
    GAME_MODE_EMPTY,
    GAME_MODE_IN_SCENE,
    GAME_MODE_IN_OCEAN_BATTLE,
    GAME_MODE_IN_PORT,
    GAME_MODE_ON_LAND,
    GAME_MODE_IN_PLAYER_MENU,
    GAME_MODE_SAILING,

    // Errors
    ERROR_GENERAL, ERROR_NOT_CORRECT_SCENE, ERROR_NOT_ENOUGH_GOLD,

    // Blackjack Errors
    ERROR_BLACKJACK_GAME_OVER, ERROR_BLACKJACK_BET_NOT_RIGHT,
    ERROR_BLACKJACK_DEALER_ALREADY_ACTIONED,
    ERROR_BLACKJACK_PLAYER_ALREADY_ACTIONED,
    ERROR_BLACKJACK_GAME_ALREADY_STARTED,

    // Bank Errors
    ERROR_BANK_NOT_ENOUGH_DEPOSIT,
    ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD,
    ERROR_BANK_NOT_ENOUGH_WITHDRAW,
    ERROR_BANK_PAY_EXISTING_LOAN_FIRST,
    ERROR_BANK_NOT_ENOUGH_LOAN,
    ERROR_BANK_WITHDRAW_MORE_THAN_DEPOSIT,
    ERROR_BANK_TOO_MUCH_LOAN,
    ERROR_BANK_NO_LOAN,
    ERROR_BANK_PAY_LOAN_NOT_ENOUGH,
    ERROR_BANK_PAY_LOAN_MORE_THAN_LOAN,

    // Shipyard Errors
    ERROR_SHIPYARD_NO_SHIP_SELECTED,
    ERROR_SHIPYARD_NOT_ENOUGH_GOLD,
    ERROR_SHIPYARD_FLEET_FULL,
    ERROR_SHIPYARD_EMPTY_PREFAB_SLOT,
    ERROR_SHIPYARD_REMODEL_SPACE_GREATER_THAN_REMODEL_CAPACITY,
    ERROR_SHIPYARD_REMODEL_SPACE_GREATER_THAN_SHIP_CAPACITY,
    ERROR_SHIPYARD_NO_SPACE_REMODEL_VALUES,

    // Dockyard Errors
    ERROR_DOCKYARD_NOT_ENOUGH_GOLD,
    ERROR_DOCKYARD_SHIP_NOT_ENOUGH_CARGO_SPACE,

    // Fleet names
    FLEET_NAME_PLAYERS,

    // Ship Materials
    SHIP_MATERIAL_TEAK, SHIP_MATERIAL_CEDAR, SHIP_MATERIAL_BEECH,
    SHIP_MATERIAL_OAK, SHIP_MATERIAL_MAHOGANY,
    SHIP_MATERIAL_COPPER, SHIP_MATERIAL_STEEL,

    // Figureheads
    FIGUREHEAD_NONE, FIGUREHEAD_SEAHORSE, FIGUREHEAD_COMMODORE,
    FIGUREHEAD_UNICORN, FIGUREHEAD_LION, FIGUREHEAD_GIANT_EAGLE,
    FIGUREHEAD_HERO, FIGUREHEAD_NEPTUNE, FIGUREHEAD_DRAGON,
    FIGUREHEAD_ANGEL, FIGUREHEAD_GODDESS, FIGUREHEAD_GRIFFIN,
    FIGUREHEAD_MERMAID, FIGUREHEAD_PHOENIX, FIGUREHEAD_SIREN,
    FIGUREHEAD_TITAN, FIGUREHEAD_WARRIOR, FIGUREHEAD_WIZARD,
    FIGUREHEAD_ZEUS, FIGUREHEAD_KRAKEN, FIGUREHEAD_LEVIATHAN,

    // Cannon Types
    CANNON, CANNON_DEMI, CANNON_PEDERO, CANNON_CULVERIN,
    CANNON_DEMI_CULVERIN, CANNON_SAKER, CANNON_CARRONADE,
    CANNON_HEAVY, CANNON_CARRONADE_STAR,

    // Skills
    SKILL_CELESTIAL_NAVIGATION,

    // Ocean Battle
    OCEAN_BATTLE_END_TURN, OCEAN_BATTLE_EXIT, OCEAN_BATTLE_MOVE,
    OCEAN_BATTLE_BOARD, OCEAN_BATTLE_FIRE_CANNONS,
    OCEAN_BATTLE_RUN_NPC_TURN,

    // Entities
    ENTITY_START_SAILING,

    // Other
    START_SAILING,

    // Loaders
    LOAD_PORT_ATHENS,

    // Ports
    PORT_ATHENS,

    GAME_STRINGS_COUNT,
};

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 world;
    u32 world_name;
    u32 scene;
    u32 game_mode;
    u32 updated_state;
} CURRENT;
CURRENT current;
u32* get_current_ptr()
{ return (u32*)&current; }
void set_current_world(u32 id)
{
    current.world = id;
    current.world_name = storage_world.data[id].name_id;
}
DATA_WORLD* get_current_world()
{
    return &storage_world.data[current.world];
}

// Has the game started?
u32 has_game_started = false;
// Is the game accepting input?
u32 accepting_input = false;
// Previous game mode
u32 previous_game_mode = SENTRY;

#define MAX_PLAYERS 5
u32 players[MAX_PLAYERS];
u32 active_players[MAX_PLAYERS];
u32 captain_to_player[MAX_CAPTAINS];

// -----------------------------------------------------------------------------
// - Scenes
// -----------------------------------------------------------------------------
u32 current_scene_take_action(u32 action)
{
    switch (current.scene)
    {
        case SCENE_NPC_RVICE:
            return scene_npc_rvice(action);
        case SCENE_NPC_LAFOLIE:
            return scene_npc_lafolie(action);
        case SCENE_NPC_NAKOR:
            return scene_npc_nakor(action);
        case SCENE_NPC_TRAVIS:
            return scene_npc_travis(action);
        case SCENE_NPC_LOLLER:
            return scene_npc_loller(action);
        case SCENE_BLACKJACK:
            return scene_blackjack(action);
        case SCENE_GENERAL_SHOP:
            return scene_general_shop(action);
        case SCENE_GOODS_SHOP:
            return scene_goods_shop(action);
        case SCENE_SHIPYARD:
            return scene_shipyard(action);
        case SCENE_DOCKYARD:
            return scene_dockyard(action);
        case SCENE_BANK:
            return scene_bank(action);
        case SCENE_OCEAN_BATTLE:
            return scene_ocean_battle(action);
        default:
            console_log("[I] Possibly missing scene map!");
            break;
    }
    return SENTRY;
}

// -----------------------------------------------------------------------------
// Entities
// -----------------------------------------------------------------------------
u32 check_if_player_stepped_on_entity(u32 player_id)
{
    for (u32 i = 0; i < MAX_GLOBAL_ENTITIES; ++i)
    {
        if (
            storage_entity.data[i].position_x == get_player_in_world_x(player_id)
            &&
            storage_entity.data[i].position_y == get_player_in_world_y(player_id)
            &&
            storage_entity.data[i].is_interactable == true
            &&
            storage_entity.data[i].interaction_on_step_over == true
        )
        {
            if (storage_entity.data[i].interaction_scene == START_SAILING)
            {
                generate_world(WORLD_GLOBE_1);
            }
            return true;
        }
    }
    return SENTRY;
}
u32 check_if_player_triggered_entity(u32 x, u32 y)
{
    for (u32 i = 0; i < MAX_GLOBAL_ENTITIES; ++i)
    {
        if (
            storage_entity.data[i].position_x == x
            &&
            storage_entity.data[i].position_y == y
            &&
            storage_entity.data[i].is_interactable == true
        )
        {
            if (storage_entity.data[i].interaction_scene == LOAD_PORT_ATHENS)
            {
                generate_world(WORLD_ATHENS);
            }
            return true;
        }
    }
    return SENTRY;
}

// -----------------------------------------------------------------------------
// DISTANCES
// -----------------------------------------------------------------------------
u32 distance_between_coordinates(u32 a_x, u32 a_y, u32 b_x, u32 b_y)
{
    u32 dx = (b_x > a_x) ? (b_x - a_x) : (a_x - b_x);
    u32 dy = (b_y > a_y) ? (b_y - a_y) : (a_y - b_y);
    return dx + dy;
}
bool is_coordinate_in_range_of_coordinate(u32 a_x, u32 a_y, u32 b_x, u32 b_y, u32 range)
{
    return distance_between_coordinates(a_x, a_y, b_x, b_y) <= range;
}

// -----------------------------------------------------------------------------
// RNG
// -----------------------------------------------------------------------------
u32 tick_counter = 1;
u32 rng_state = 1;
u32 init_random(u32 seed)
{
    rng_state = seed;
    return rng_state;
}
static u32 xorshift_state = 1;
u32 get_random_number(u32 min, u32 max)
{
    xorshift_state += tick_counter;
    xorshift_state ^= xorshift_state << 13;
    xorshift_state ^= xorshift_state >> 17;
    xorshift_state ^= xorshift_state << 5;
    
    u32 range = max - min + 1;
    // Take upper bits for better distribution
    return min + (xorshift_state >> 16) % range;
}
// Note: This one sucks, do not use
// u32 get_random_number(u32 min, u32 max)
// {
//     // Linear Congruental Generator
//     const u32 a = 1103515245;
//     const u32 c = tick_counter;
//     // rng_state = init_random(tick_counter);
//     rng_state = (a * rng_state + c) & 0x7fffffff;
//     u32 range = max - min + 1;
//     return min + ((rng_state >> 16) & range);
// }
// Note: This one works but is pretty pattern heavy
// u32 get_random_number(u32 min, u32 max)
// {
//     u32 rng_state = init_random(tick_counter);
//     u32 adjusted_max = max;
//     if (min == max)
//     {
//         adjusted_max = 100;
//     }
//     u32 range = adjusted_max - min + 1;
//     u32 result = min + (rng_state % range);
    
//     if (tick_counter == UINT32_MAX)
//     {
//         tick_counter = 1;
//     }
//     else
//     {
//         tick_counter++;
//     }
    
//     return result;
// }

// -----------------------------------------------------------------------------
// - OTHER
// -----------------------------------------------------------------------------
u32 get_ship_available_cargo_space(u32 ship_id)
{
    DATA_SHIP* ship = get_data_ship(ship_id);
    return (ship->cargo_space - ship->total_cargo_goods);
}
u32 add_good_to_ship(u32 good_id, u32 qty, u32 ship_id)
{
    DATA_SHIP* ship = get_data_ship(ship_id);
    DATA_GOOD* good = get_data_good(good_id);
    u32 intended_goods = ship->total_cargo_goods + qty;
    if (intended_goods > ship->cargo_space)
    {
        console_log("[E] Cannot add goods to ship. Not enough cargo space");
        return SENTRY;
    }
    bool already_in = false;
    for (u32 i = 0; i < MAX_SHIP_CARGO_SPACE; ++i)
    {
        if (ship->cargo_goods[i] == good_id)
        {
            if (ship->cargo_goods_qty[i] == SENTRY)
            {
                ship->cargo_goods_qty[i] = 0;
            }
            ship->cargo_goods_qty[i] += qty;
            ship->total_cargo_goods += qty;
            return ship->cargo_goods_qty[i];
        }
    }
    if (!already_in)
    {
        for (u32 i = 0; i < MAX_SHIP_CARGO_SPACE; ++i)
        {
            if (ship->cargo_goods[i] == SENTRY)
            {
                if (ship->cargo_goods_qty[i] == SENTRY)
                {
                    ship->cargo_goods_qty[i] = 0;
                }
                ship->cargo_goods[i] = good_id;
                ship->cargo_goods_qty[i] += qty;
                ship->total_cargo_goods += qty;
                return ship->cargo_goods_qty[i];
            }
        }
    }
    return SENTRY;
}
u32 get_good_qty_from_ship(u32 good_id, u32 ship_id)
{
    DATA_SHIP* ship = get_data_ship(ship_id);
    DATA_GOOD* good = get_data_good(good_id);
    for (u32 i = 0; i < MAX_SHIP_CARGO_SPACE; ++i)
    {
        if (ship->cargo_goods[i] == good_id)
        {
            return ship->cargo_goods_qty[i];
        }
    }
    return 0;
}
u32 get_good_qty_from_fleet_ships(u32 good_id, u32 fleet_id)
{
    u32 total = SENTRY;
    DATA_FLEET* fleet = get_data_fleet(fleet_id);
    for (u32 f = 0; f < MAX_FLEET_SHIPS; ++f)
    {
        if (fleet->ship_ids[f] == SENTRY) { continue; }
        u32 fleet_ship_id = fleet->ship_ids[f];
        DATA_FLEET_SHIP* fleet_ship = get_data_fleet_ship(fleet_ship_id);
        if (total == SENTRY) { total = 0; }
        total += get_good_qty_from_ship(good_id, fleet_ship->ship_id);
    }
    return total;
}
u32 get_ship_total_food(u32 ship_id)
{
    u32 good_id = find_storage_good_by_name_id(GOOD_FOOD);
    return get_good_qty_from_ship(good_id, ship_id);
}
u32 get_ship_total_water(u32 ship_id)
{
    u32 good_id = find_storage_good_by_name_id(GOOD_WATER);
    return get_good_qty_from_ship(good_id, ship_id);
}
u32 get_ship_total_cannonballs(u32 ship_id)
{
    u32 good_id = find_storage_good_by_name_id(GOOD_CANNONBALLS);
    return get_good_qty_from_ship(good_id, ship_id);
}
u32 add_food_to_ship(u32 qty, u32 ship_id)
{
    u32 good_id = find_storage_good_by_name_id(GOOD_FOOD);
    return add_good_to_ship(good_id, qty, ship_id);
}
u32 add_water_to_ship(u32 qty, u32 ship_id)
{
    u32 good_id = find_storage_good_by_name_id(GOOD_WATER);
    return add_good_to_ship(good_id, qty, ship_id);
}
u32 add_cannonballs_to_ship(u32 qty, u32 ship_id)
{
    u32 good_id = find_storage_good_by_name_id(GOOD_CANNONBALLS);
    return add_good_to_ship(good_id, qty, ship_id);
}

// -----------------------------------------------------------------------------
// - INPUT
// -----------------------------------------------------------------------------
void user_input_right()
{
    handle_input(USER_INPUT_RIGHT);
}
void user_input_left()
{
    handle_input(USER_INPUT_LEFT);
}
void user_input_up()
{
    handle_input(USER_INPUT_UP);
}
void user_input_down()
{
    handle_input(USER_INPUT_DOWN);
}
void user_input_a()
{
    handle_input(USER_INPUT_A);
}
void user_input_start()
{
    console_log("START BUTTON PRESSED");
    current.game_mode = GAME_MODE_IN_PLAYER_MENU;
    current.updated_state = UPDATED_STATE_SCENE;
}
void user_input_right_bumper()
{
    // NOTE: For debug purposes. It DOES work!
    // generate_world("athens");
}
void handle_interaction_scene(u32 interaction_scene, u32 world_npc_id)
{
    switch (interaction_scene)
    {
    case SCENE_BLACKJACK:
        scene_blackjack(ACTION);
        break;
    case SCENE_GENERAL_SHOP:
        Scene_General_Shop.inventory_id = storage_world_npc.data[world_npc_id].inventory_id;
        scene_general_shop(ACTION);
        break;
    case SCENE_GOODS_SHOP:
        Scene_Goods_Shop.inventory_id = storage_world_npc.data[world_npc_id].inventory_id;
        scene_goods_shop(ACTION);
        break;
    case SCENE_SHIPYARD:
        // Note: We do not store inventory. We use ships_prefab instead
        scene_shipyard(ACTION);
        break;
    case SCENE_DOCKYARD:
        scene_dockyard(ACTION);
        break;
    case SCENE_OCEAN_FAKE_BATTLE:
        fake_ocean_battle();
        scene_ocean_battle(ACTION);
        break;
    case SCENE_NPC_RVICE:
        scene_npc_rvice(ACTION);
        break;
    case SCENE_NPC_LAFOLIE:
        scene_npc_lafolie(ACTION);
        break;
    case SCENE_NPC_NAKOR:
        scene_npc_nakor(ACTION);
        break;
    case SCENE_NPC_TRAVIS:
        scene_npc_travis(ACTION);
        break;
    case SCENE_NPC_LOLLER:
        scene_npc_loller(ACTION);
        break;
    case SCENE_BANK:
        scene_bank(ACTION);
        break;
    }
}
void handle_input(u32 input)
{
    if (current.game_mode == GAME_MODE_SAILING)
    {
        u32 world_npc_id = get_player_in_world(0);
        u32 current_world_x = storage_world_npc.data[world_npc_id].position_x;
        u32 current_world_y = storage_world_npc.data[world_npc_id].position_y;
        u32 current_world_direction = storage_world_npc.data[world_npc_id].direction;
        u32 intended_x;
        u32 intended_y;
        DATA_WORLD* current_world;
        switch (input)
        {
            case USER_INPUT_UP:
                storage_world_npc.data[world_npc_id].direction = DIRECTION_UP;
                current.updated_state = UPDATED_STATE_NPCS;
                u32 intended_y = 0;
                if (current_world_y > 0)
                {
                    intended_y = current_world_y - 1;
                }
                check_if_player_triggered_entity(current_world_x, intended_y);
                break;
            case USER_INPUT_DOWN:
                storage_world_npc.data[world_npc_id].direction = DIRECTION_DOWN;
                current.updated_state = UPDATED_STATE_NPCS;
                current_world = get_current_world();
                intended_y = 0;
                if (current_world_y < (current_world->height - 1))
                {
                    intended_y = current_world_y + 1;
                }
                check_if_player_triggered_entity(current_world_x, intended_y);
                break;
            case USER_INPUT_LEFT:
                storage_world_npc.data[world_npc_id].direction = DIRECTION_LEFT;
                current.updated_state = UPDATED_STATE_NPCS;
                intended_x = 0;
                if (current_world_x > 0)
                {
                    intended_x = current_world_x - 1;
                }
                check_if_player_triggered_entity(intended_x, current_world_y);
                break;
            case USER_INPUT_RIGHT:
                storage_world_npc.data[world_npc_id].direction = DIRECTION_RIGHT;
                current.updated_state = UPDATED_STATE_NPCS;
                current_world = get_current_world();
                intended_x = 0;
                if (current_world_x < (current_world->width - 1))
                {
                    intended_x = current_world_x + 1;
                }
                check_if_player_triggered_entity(intended_x, current_world_x);
                break;
            default:
                console_log("[I] No button push to handle here.");
                break;
        }
    }
    else if (current.game_mode == GAME_MODE_IN_PORT)
    {
        u32 world_npc_id = get_player_in_world(0);
        u32 current_world_x = storage_world_npc.data[world_npc_id].position_x;
        u32 current_world_y = storage_world_npc.data[world_npc_id].position_y;
        u32 current_world_direction = storage_world_npc.data[world_npc_id].direction;
        switch (input)
        {
            case USER_INPUT_A:
                if (current_world_direction == DIRECTION_UP) 
                {
                    if (current_world_y > 0)
                    {
                        u32 intended_y = current_world_y - 1;
                        for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            u32 other_world_x = storage_world_npc.data[i].position_x;
                            u32 other_world_y = storage_world_npc.data[i].position_y;
                            if (other_world_x == current_world_x && other_world_y == intended_y)
                            {
                                u32 interaction_scene = storage_world_npc.data[i].interaction_scene;
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                }
                else if (current_world_direction == DIRECTION_DOWN)
                {
                    if (current_world_y < storage_world.data[current.world].height)
                    {
                        u32 intended_y = current_world_y + 1;
                        for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            u32 other_world_x = storage_world_npc.data[i].position_x;
                            u32 other_world_y = storage_world_npc.data[i].position_y;
                            if (other_world_x == current_world_x && other_world_y == intended_y)
                            {
                                u32 interaction_scene = storage_world_npc.data[i].interaction_scene;
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                }
                else if (current_world_direction == DIRECTION_LEFT)
                {
                    if (current_world_x > 0)
                    {
                        u32 intended_x = current_world_x - 1;
                        for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            u32 other_world_x = storage_world_npc.data[i].position_x;
                            u32 other_world_y = storage_world_npc.data[i].position_y;
                            if (other_world_x == intended_x && other_world_y == current_world_y)
                            {
                                u32 interaction_scene = storage_world_npc.data[i].interaction_scene;
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                }
                else if (current_world_direction == DIRECTION_RIGHT)
                {
                    if (current_world_x < storage_world.data[current.world].width)
                    {
                        u32 intended_x = current_world_x + 1;
                        for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            u32 other_world_x = storage_world_npc.data[i].position_x;
                            u32 other_world_y = storage_world_npc.data[i].position_y;
                            if (other_world_x == intended_x && other_world_y == current_world_y)
                            {
                                u32 interaction_scene = storage_world_npc.data[i].interaction_scene;
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                }
                break;
            case USER_INPUT_B:
            case USER_INPUT_X:
            case USER_INPUT_Y:
                // printf("Button pressed: %d\n", data->type);
                break;
            case USER_INPUT_UP:
                if (current.game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_up(0);
                    check_if_player_stepped_on_entity(0);
                }
                break;
            case USER_INPUT_DOWN:
                if (current.game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_down(0);
                    check_if_player_stepped_on_entity(0);
                }
                break;
            case USER_INPUT_LEFT:
                if (current.game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_left(0);
                    check_if_player_stepped_on_entity(0);
                }
                break;
            case USER_INPUT_RIGHT:
                if (current.game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_right(0);
                    check_if_player_stepped_on_entity(0);
                }
                break;
            case USER_INPUT_START:
            case USER_INPUT_SELECT:
                // printf("System button: %d\n", data->type);
                break;
            case USER_INPUT_LEFT_BUMPER:
            case USER_INPUT_RIGHT_BUMPER:
                // printf("Bumper pressed: %d\n", data->type);
                break;
            case USER_INPUT_CUSTOM_NUMBER:
                // printf("Custom number: %d\n", data->data.number);
                break;
            case USER_INPUT_CUSTOM_STRING:
                // printf("Custom string: %s\n", data->data.string);
                break;
            default:
                // printf("Unknown input type\n");
                break;
        }
    }
}

// -----------------------------------------------------------------------------
// - SHIPS
// -----------------------------------------------------------------------------
void apply_base_ship_to_ship(u32 ship_id, u32 base_ship_id)
{
    DATA_SHIP* ship = &storage_ship.data[ship_id];
    DATA_BASE_SHIP* base_ship = &storage_base_ship.data[base_ship_id];
    ship->name_id = base_ship->name_id;
    ship->base_ship_id = base_ship_id;
    ship->tacking = base_ship->tacking;
    ship->power = base_ship->power;
    ship->speed = base_ship->speed;
    ship->durability = base_ship->durability;
    ship->price = base_ship->base_price;
    ship->capacity = base_ship->max_capacity;
}
void apply_material_to_ship(u32 ship_id, u32 material_id)
{
    DATA_SHIP* ship = &storage_ship.data[ship_id];
    DATA_BASE_SHIP* base_ship = &storage_base_ship.data[ship->base_ship_id];
    DATA_SHIP_MATERIAL* material = &storage_ship_material.data[material_id];
    if (material_id > base_ship->top_material_id)
    {
        console_log("[E] Material is not compatible with ship");
        return;
    }
    ship->material_id = material_id;
    ship->capacity += material->mod_capacity;
    ship->tacking += material->mod_tacking;
    ship->power += material->mod_power;
    ship->speed += material->mod_speed;
    ship->durability += material->mod_durability;
}

// -----------------------------------------------------------------------------
// - WORLDS & LAYERS
// -----------------------------------------------------------------------------
u32 are_coordinates_blocked(u32 x, u32 y)
{
    for (u32 i = 0; i < MAX_WORLD_NPCS; ++i) {
        // if (storage_world_npc.data[i].is_player == true)
        // {
        //     continue;
        // }
        if (
            storage_world_npc.used[i] == true
            &&
            storage_world_npc.data[i].position_x == x
            &&
            storage_world_npc.data[i].position_y == y
        )
        {
            return 1;
        }
    }

    u32 block_layer_id = find_storage_layer_by_name_id(LAYER_BLOCK);
    if (block_layer_id != SENTRY)
    {
        u32 layer_value = layer_get_value(block_layer_id, x, y);
        if (layer_value > 0 && layer_value != SENTRY)
        {
            console_log("Block layer block");
            return 1;
        }
    }
    return 0;
}

void generate_world(u32 world_name_id)
{
    clear_all_layers();
    clear_all_world_npcs();
    clear_all_entities();
    for (u32 i = 0; i < MAX_SHIP_PREFABS; ++i)
    {
        if (Scene_Shipyard.ships_prefab[i] != SENTRY)
        {
            free_storage_ship_slot(Scene_Shipyard.ships_prefab[i]);
        }
        Scene_Shipyard.ships_prefab[i] = SENTRY;
    }
    clear_scene_dockyard();
    // NOTE: An example of using pointers that have no perf cost
    DATA_WORLD* current_world = get_current_world();
    // TODO: Function for this?
    for (u32 i = 0; i < MAX_LAYERS; ++i)
    {
        current_world->layers[i] = SENTRY;
    }
    current_world->total_layers = 0;

    u32 world_width;
    u32 world_height;
    u32 wnpcid;
    u32 lid;
    u32 npc_id;

    switch (world_name_id)
    {
    case WORLD_GLOBE_1:
        previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_SAILING;
        set_current_world(find_storage_world_by_name_id(WORLD_GLOBE_1));
        world_width = current_world->width;
        world_height = current_world->height;

        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_BACKGROUND;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        storage_layer.data[lid].same_value = 1;
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_NPC;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_ONE;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        // athens I guess
        layer_set_value(lid, 3, 3, 1);
        layer_set_value(lid, 4, 3, 1);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_TWO;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        // town (athens)
        layer_set_value(lid, 4, 3, 1);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_BLOCK;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        storage_layer.data[lid].is_block = true;
        add_layer_to_world(lid, current.world);
        // blocker for land around athens
        layer_set_value(lid, 3, 3, 1);
        layer_set_value(lid, 4, 3, 1);

        npc_id = get_player_npc_id(0);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].captain_id = players[0];
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 0;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].is_captain = true;
        storage_world_npc.data[wnpcid].is_player = true;
        // So we know who the first player is in the world directly
        storage_captain.data[0].world_npc_id = wnpcid;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        u32 entity_id = pull_storage_entity_next_open_slot();
        DATA_ENTITY* entity = get_data_entity(entity_id);
        entity->name_id = PORT_ATHENS;
        entity->is_interactable = true;
        entity->interaction_scene = LOAD_PORT_ATHENS;
        entity->position_x = 4;
        entity->position_y = 3;

        current.updated_state = UPDATED_STATE_WORLD;
        break;
    case WORLD_DINGUS_LAND:
        previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_PORT;
        set_current_world(find_storage_world_by_name_id(WORLD_DINGUS_LAND));
        world_width = current_world->width;
        world_height = current_world->height;

        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_BACKGROUND;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        storage_layer.data[lid].same_value = 1;
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_NPC;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_ONE;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_TWO;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_BLOCK;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        storage_layer.data[lid].is_block = true;
        add_layer_to_world(lid, current.world);
        current.updated_state = UPDATED_STATE_WORLD;
        break;
    case WORLD_ATHENS:
        previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_PORT;

        // Set dockyard purchase prices for this port
        Scene_Dockyard.price_food = 10;
        // water is always free
        Scene_Dockyard.price_water = 0;
        Scene_Dockyard.price_cannonballs = 10;

        set_current_world(find_storage_world_by_name_id(WORLD_ATHENS));

        u32 world_width = current_world->width;
        u32 world_height = current_world->height;

        u32 lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_BACKGROUND;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        storage_layer.data[lid].same_value = 1;
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_NPC;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_ONE;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        // layer_set_value(lid, 0, 0, 36);
        layer_set_value(lid, 0, 0, 33);
        // layer_set_value(lid, 7, 0, 38);
        layer_set_value(lid, 7, 0, 35);
        layer_set_value(lid, 0, 1, 33);
        layer_set_value(lid, 0, 2, 33);
        layer_set_value(lid, 0, 3, 33);
        layer_set_value(lid, 0, 4, 33);
        for (u32 column = 1; column < 7; ++column)
        {
            // layer_set_value(lid, column, 0, 37);
            layer_set_value(lid, column, 0, 34);
        }
        for (u32 column = 1; column < 7; ++column)
        {
            layer_set_value(lid, column, 1, 34);
            layer_set_value(lid, column, 2, 34);
            layer_set_value(lid, column, 3, 34);
            layer_set_value(lid, column, 4, 34);
        }
        layer_set_value(lid, 7, 1, 35);
        layer_set_value(lid, 7, 2, 35);
        layer_set_value(lid, 7, 3, 35);
        layer_set_value(lid, 7, 4, 35);
        layer_set_value(lid, 0, 5, 39);
        for (u32 column = 1; column < 7; ++column)
        {
            layer_set_value(lid, column, 5, 40);
        }
        layer_set_value(lid, 7, 5, 41);
        layer_set_value(lid, 4, 6, 53);
        for (u32 column = 5; column < 10; ++column)
        {
            layer_set_value(lid, column, 6, 54);
        }
        layer_set_value(lid, 10, 6, 50);
        for (u32 row = 7; row < 12; ++row)
        {
            layer_set_value(lid, 4, row, 56);
        }
        layer_set_value(lid, 4, 11, 52);
        for (u32 column = 5; column < 10; ++column)
        {
            layer_set_value(lid, column, 11, 55);
        }
        layer_set_value(lid, 10, 11, 51);
        for (u32 row = 7; row < 11; ++row)
        {
            layer_set_value(lid, 10, row, 57);
        }
        for (u32 row = 7; row < 11; ++row)
        {
            layer_set_value(lid, 5, row, 59);
        }
        for (u32 column = 6; column < 10; ++column)
        {
            for (u32 row = 7; row < 11; ++row)
            {
                layer_set_value(lid, column, row, 58);
            }
        }
        // Building
        layer_set_value(lid, 6, 7, 0);
        layer_set_value(lid, 7, 7, 1);
        layer_set_value(lid, 6, 8, 2);
        layer_set_value(lid, 7, 8, 3);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_TWO;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        // Door
        layer_set_value(lid, 7, 8, 4);
        // Shipyard sign
        layer_set_value(lid, 6, 8, 10);
        // rock
        layer_set_value(lid, 4, 3, 20);
        // house
        layer_set_value(lid, 5, 2, 51);
        layer_set_value(lid, 6, 2, 52);
        layer_set_value(lid, 7, 2, 53);
        layer_set_value(lid, 5, 3, 50);
        layer_set_value(lid, 6, 3, 50);
        layer_set_value(lid, 7, 3, 50);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_BLOCK;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        storage_layer.data[lid].is_block = true;
        add_layer_to_world(lid, current.world);
        // Building
        layer_set_value(lid, 6, 7, 1);
        layer_set_value(lid, 7, 7, 1);
        layer_set_value(lid, 6, 8, 1);
        layer_set_value(lid, 7, 8, 1);
        // rock
        // layer_set_value(lid, 4, 3, 1);

        u32 world_npc_id;

        npc_id = find_storage_npc_by_name_id(NPC_BANK_TELLER);
        u32 wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].position_x = 4;
        storage_world_npc.data[wnpcid].position_y = 0;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_BANK;
        storage_world_npc.data[wnpcid].is_interactable = true;
        ++storage_world.data[current.world].total_npcs;
        
        // inventory
        u32 i_id = pull_storage_inventory_next_open_slot();
        storage_inventory.data[i_id].name_id = INVENTORY_ATHENS_GENERAL_SHOP;
        storage_inventory.data[i_id].total_items = 0;
        // inventory item
        u32 ii_id = pull_storage_inventory_item_next_open_slot();
        storage_inventory_item.data[ii_id].name_id = ITEM_TELESCOPE;
        storage_inventory_item.data[ii_id].number_held = 1;
        storage_inventory_item.data[ii_id].type = INVENTORY_TYPE_GENERAL_ITEM;
        storage_inventory_item.data[ii_id].type_reference = find_storage_general_item_by_name_id(ITEM_TELESCOPE);
        storage_inventory_item.data[ii_id].adjusted_price = 400;
        add_item_to_inventory(ii_id, i_id);
        ii_id = pull_storage_inventory_item_next_open_slot();
        storage_inventory_item.data[ii_id].name_id = ITEM_QUADRANT;
        storage_inventory_item.data[ii_id].number_held = 1;
        storage_inventory_item.data[ii_id].type = INVENTORY_TYPE_GENERAL_ITEM;
        storage_inventory_item.data[ii_id].type_reference = find_storage_general_item_by_name_id(ITEM_QUADRANT);
        storage_inventory_item.data[ii_id].adjusted_price = 430;
        add_item_to_inventory(ii_id, i_id);
        ii_id = pull_storage_inventory_item_next_open_slot();
        storage_inventory_item.data[ii_id].name_id = ITEM_THEODOLITE;
        storage_inventory_item.data[ii_id].number_held = 1;
        storage_inventory_item.data[ii_id].type = INVENTORY_TYPE_GENERAL_ITEM;
        storage_inventory_item.data[ii_id].type_reference = find_storage_general_item_by_name_id(ITEM_THEODOLITE);
        storage_inventory_item.data[ii_id].adjusted_price = 222;
        add_item_to_inventory(ii_id, i_id);
        ii_id = pull_storage_inventory_item_next_open_slot();
        storage_inventory_item.data[ii_id].name_id = ITEM_SEXTANT;
        storage_inventory_item.data[ii_id].number_held = 1;
        storage_inventory_item.data[ii_id].type = INVENTORY_TYPE_GENERAL_ITEM;
        storage_inventory_item.data[ii_id].type_reference = find_storage_general_item_by_name_id(ITEM_SEXTANT);
        storage_inventory_item.data[ii_id].adjusted_price = 666;
        add_item_to_inventory(ii_id, i_id);

        npc_id = find_storage_npc_by_name_id(NPC_GENERAL_SHOP_OWNER);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].position_x = 3;
        storage_world_npc.data[wnpcid].position_y = 1;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_GENERAL_SHOP;
        storage_world_npc.data[wnpcid].is_interactable = true;
        storage_world_npc.data[wnpcid].inventory_id = i_id;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_BLACKJACK_PLAYER);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].position_x = 5;
        storage_world_npc.data[wnpcid].position_y = 0;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_BLACKJACK;
        storage_world_npc.data[wnpcid].is_interactable = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = get_player_npc_id(0);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].captain_id = players[0];
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 0;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].is_captain = true;
        storage_world_npc.data[wnpcid].is_player = true;
        // So we know who the first player is in the world directly
        storage_captain.data[0].world_npc_id = wnpcid;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_OCEAN_BATTLE);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 1;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_OCEAN_FAKE_BATTLE;
        storage_world_npc.data[wnpcid].is_interactable = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_RVICE);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        // TODO: Do not use magic numbers
        storage_world_npc.data[wnpcid].captain_id = 1;
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 2;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_NPC_RVICE;
        storage_world_npc.data[wnpcid].is_interactable = true;
        storage_world_npc.data[wnpcid].is_captain = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_LAFOLIE);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        // TODO: Do not use magic numbers
        storage_world_npc.data[wnpcid].captain_id = 2;
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 3;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_NPC_LAFOLIE;
        storage_world_npc.data[wnpcid].is_interactable = true;
        storage_world_npc.data[wnpcid].is_captain = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_NAKOR);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        // TODO: Do not use magic numbers
        storage_world_npc.data[wnpcid].captain_id = 3;
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 4;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_NPC_NAKOR;
        storage_world_npc.data[wnpcid].is_interactable = true;
        storage_world_npc.data[wnpcid].is_captain = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_TRAVIS);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        // TODO: Do not use magic numbers
        storage_world_npc.data[wnpcid].captain_id = 4;
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 5;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_NPC_TRAVIS;
        storage_world_npc.data[wnpcid].is_interactable = true;
        storage_world_npc.data[wnpcid].is_captain = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_LOLLER);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        // TODO: Do not use magic numbers
        storage_world_npc.data[wnpcid].captain_id = 5;
        storage_world_npc.data[wnpcid].position_x = 0;
        storage_world_npc.data[wnpcid].position_y = 6;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_NPC_LOLLER;
        storage_world_npc.data[wnpcid].is_interactable = true;
        storage_world_npc.data[wnpcid].is_captain = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        npc_id = find_storage_npc_by_name_id(NPC_SHIPYARD_OWNER);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].position_x = 8;
        storage_world_npc.data[wnpcid].position_y = 8;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_SHIPYARD;
        storage_world_npc.data[wnpcid].is_interactable = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);
        for (u32 i = 0; i < MAX_SHIP_PREFABS; ++i)
        {
            Scene_Shipyard.ships_prefab[i] = SENTRY;
        }
        u32 base_ship_id = find_storage_base_ship_by_name_id(BASE_SHIP_BALSA);
        u32 ship_id = pull_storage_ship_next_open_slot();
        apply_base_ship_to_ship(ship_id, base_ship_id);
        apply_material_to_ship(ship_id, base_ship_id);
        storage_ship.data[ship_id].price += 107;
        storage_ship.data[ship_id].crew_space = 30;
        storage_ship.data[ship_id].cannon_space = 10;
        storage_ship.data[ship_id].cargo_space = 70;
        Scene_Shipyard.ships_prefab[0] = ship_id;
        base_ship_id = find_storage_base_ship_by_name_id(BASE_SHIP_HANSA_COG);
        ship_id = pull_storage_ship_next_open_slot();
        apply_base_ship_to_ship(ship_id, base_ship_id);
        apply_material_to_ship(ship_id, base_ship_id);
        storage_ship.data[ship_id].price += 33;
        storage_ship.data[ship_id].crew_space = 30;
        storage_ship.data[ship_id].cannon_space = 10;
        storage_ship.data[ship_id].cargo_space = 70;
        Scene_Shipyard.ships_prefab[1] = ship_id;
        // Set remodel prices specific to Athens
        // TODO: Eventually update this to also account for ship size
        Scene_Shipyard.remodel_space_price = 100;
        Scene_Shipyard.remodel_material_price = 103;
        Scene_Shipyard.remodel_cannon_price = 129;
        Scene_Shipyard.remodel_figurehead_price = 30;

        npc_id = find_storage_npc_by_name_id(NPC_DOCKYARD_OWNER);
        wnpcid = pull_storage_world_npc_next_open_slot();
        storage_world_npc.data[wnpcid].name_id = storage_npc.data[npc_id].name_id;
        storage_world_npc.data[wnpcid].type_id = storage_npc.data[npc_id].type;
        storage_world_npc.data[wnpcid].npc_id = npc_id;
        storage_world_npc.data[wnpcid].position_x = 6;
        storage_world_npc.data[wnpcid].position_y = 11;
        storage_world_npc.data[wnpcid].direction = DIRECTION_DOWN;
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_DOCKYARD;
        storage_world_npc.data[wnpcid].is_interactable = true;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);
        // Note: Keeping this here temporarily for future reference
        // u32 entity_id = pull_storage_entity_next_open_slot();
        // DATA_ENTITY* entity = get_data_entity(entity_id);
        // entity->name_id = ENTITY_START_SAILING;
        // entity->is_interactable = true;
        // entity->interaction_on_step_over = true;
        // entity->interaction_scene = START_SAILING;
        // entity->position_x = 6;
        // entity->position_y = 11;

        // inventory
        i_id = pull_storage_inventory_next_open_slot();
        storage_inventory.data[i_id].name_id = INVENTORY_ATHENS_GOODS_SHOP;
        storage_inventory.data[i_id].total_items = 0;
        // inventory items
        ii_id = pull_storage_inventory_item_next_open_slot();
        DATA_INVENTORY_ITEM *ii = get_data_inventory_item(ii_id);
        ii->name_id = GOOD_AMBER;
        ii->number_held = 1;
        ii->type = INVENTORY_TYPE_GOOD;
        ii->type_reference = find_storage_good_by_name_id(GOOD_AMBER);
        ii->adjusted_price = 400;
        add_item_to_inventory(ii_id, i_id);
        npc_id = find_storage_npc_by_name_id(NPC_GOODS_SHOP_OWNER);
        wnpcid = pull_storage_world_npc_next_open_slot();
        DATA_WORLD_NPC* wnpc = get_data_world_npc(wnpcid);
        wnpc->name_id = storage_npc.data[npc_id].name_id;
        wnpc->type_id = storage_npc.data[npc_id].type;
        wnpc->npc_id = npc_id;
        wnpc->position_x = 3;
        wnpc->position_y = 2;
        wnpc->direction = DIRECTION_DOWN;
        wnpc->interaction_scene = SCENE_GOODS_SHOP;
        wnpc->is_interactable = true;
        wnpc->inventory_id = i_id;
        ++storage_world.data[current.world].total_npcs;
        update_npc_layer(wnpcid);

        current.updated_state = UPDATED_STATE_WORLD;
        break;
    default:
        args[0].i = world_name_id;
        console_log_format("Could not find world %d", args, 1);
    }
}

// -----------------------------------------------------------------------------
// - WORLD NPCS
// -----------------------------------------------------------------------------
void update_npc_layer(u32 world_npc_id)
{
    u32 npc_layer_id = find_storage_layer_by_name_id(LAYER_NPC);
    if (npc_layer_id != SENTRY)
    {
        for (u32 i = 0; i < MAX_LAYER_SIZE; ++i)
        {
            if (storage_layer.data[npc_layer_id].data[i] == world_npc_id)
            {
                storage_layer.data[npc_layer_id].data[i] = SENTRY;
                break;
            }
        }
        layer_set_value(
            npc_layer_id,
            storage_world_npc.data[world_npc_id].position_x,
            storage_world_npc.data[world_npc_id].position_y,
            world_npc_id
        );
    }
}
void move_world_npc_to(u32 world_npc_id, u32 x, u32 y)
{
    if (x >= 0 && x < storage_world.data[current.world].width && are_coordinates_blocked(x, y) != 1)
    {
        storage_world_npc.data[world_npc_id].position_x = x;
        current.updated_state = UPDATED_STATE_NPCS;
    }
    if (y >= 0 && y < storage_world.data[current.world].height && are_coordinates_blocked(x, y) != 1)
    {
        storage_world_npc.data[world_npc_id].position_y = y;
        current.updated_state = UPDATED_STATE_NPCS;
    }
    update_npc_layer(world_npc_id);
}
void move_world_npc_left(u32 world_npc_id)
{
    u32 current_x = storage_world_npc.data[world_npc_id].position_x;
    u32 current_y = storage_world_npc.data[world_npc_id].position_y;
    u32 intended_x = current_x - 1;
    if (current_x > 0 && are_coordinates_blocked(intended_x, current_y) != 1)
    {
        storage_world_npc.data[world_npc_id].position_x = intended_x;
    }
    update_npc_layer(world_npc_id);
    storage_world_npc.data[world_npc_id].direction = DIRECTION_LEFT;
    current.updated_state = UPDATED_STATE_NPCS;
}
void move_world_npc_right(u32 world_npc_id)
{
    u32 current_x = storage_world_npc.data[world_npc_id].position_x;
    u32 current_y = storage_world_npc.data[world_npc_id].position_y;
    u32 intended_x = current_x + 1;
    if (intended_x < storage_world.data[current.world].width && are_coordinates_blocked(intended_x, current_y) != 1)
    {
        storage_world_npc.data[world_npc_id].position_x = intended_x;
    }
    update_npc_layer(world_npc_id);
    storage_world_npc.data[world_npc_id].direction = DIRECTION_RIGHT;
    current.updated_state = UPDATED_STATE_NPCS;
}
void move_world_npc_up(u32 world_npc_id)
{
    u32 current_x = storage_world_npc.data[world_npc_id].position_x;
    u32 current_y = storage_world_npc.data[world_npc_id].position_y;
    u32 intended_y = current_y - 1;
    if (current_y > 0 && are_coordinates_blocked(current_x, intended_y) != 1)
    {
        storage_world_npc.data[world_npc_id].position_y = intended_y;
    }
    u32 npc_layer_id = find_storage_layer_by_name_id(LAYER_NPC);
    update_npc_layer(world_npc_id);
    storage_world_npc.data[world_npc_id].direction = DIRECTION_UP;
    current.updated_state = UPDATED_STATE_NPCS;
}
void move_world_npc_down(u32 world_npc_id)
{
    u32 current_x = storage_world_npc.data[world_npc_id].position_x;
    u32 current_y = storage_world_npc.data[world_npc_id].position_y;
    u32 intended_y = current_y + 1;
    if (intended_y < storage_world.data[current.world].height && are_coordinates_blocked(current_x, intended_y) != 1)
    {
        storage_world_npc.data[world_npc_id].position_y = intended_y;
    }
    u32 npc_layer_id = find_storage_layer_by_name_id(LAYER_NPC);
    update_npc_layer(world_npc_id);
    storage_world_npc.data[world_npc_id].direction = DIRECTION_DOWN;
    current.updated_state = UPDATED_STATE_NPCS;
}

// -----------------------------------------------------------------------------
// PLAYERS
// -----------------------------------------------------------------------------
u32 get_player_gold(u32 player_id)
{
    u32 captain_id = players[player_id];
    return storage_captain.data[captain_id].gold;
}
void set_player_gold(u32 player_id, u32 value)
{
    u32 captain_id = players[player_id];
    storage_captain.data[captain_id].gold = value;
}
void subtract_player_gold(u32 player_id, u32 value)
{
    u32 captain_id = players[player_id];
    storage_captain.data[captain_id].gold -= value;
}
void add_player_gold(u32 player_id, u32 value)
{
    u32 captain_id = players[player_id];
    storage_captain.data[captain_id].gold += value;
}
u32 get_player_npc_id(u32 player_id)
{
    u32 captain_id = players[player_id];
    return storage_captain.data[captain_id].npc_id;
}
u32 get_player_inventory_id(u32 player_id)
{
    u32 captain_id = players[player_id];
    return storage_captain.data[captain_id].inventory_id;
}
u32 get_player_total_items(u32 player_id)
{
    u32 inventory_id = get_player_inventory_id(player_id);
    return storage_inventory.data[inventory_id].total_items;
}
u32 get_player_in_world(u32 player_id)
{
    u32 npc_id = get_player_npc_id(player_id);
    for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
    {
        if (storage_world_npc.data[i].npc_id == npc_id)
        {
            return i;
        }
    }
    return SENTRY;
}
u32 get_player_in_world_x(u32 player_id)
{
    u32 world_npc_id = get_player_in_world(player_id);
    return storage_world_npc.data[world_npc_id].position_x;
}
u32 get_player_in_world_y(u32 player_id)
{
    u32 world_npc_id = get_player_in_world(player_id);
    return storage_world_npc.data[world_npc_id].position_y;
}
void move_player_to(u32 player_id, u32 x, u32 y)
{
    u32 world_npc_id = get_player_in_world(player_id);
    move_world_npc_to(world_npc_id, x, y);
}
void move_player_left(u32 player_id)
{
    u32 world_npc_id = get_player_in_world(player_id);
    move_world_npc_left(world_npc_id);
}
void move_player_right(u32 player_id)
{
    u32 world_npc_id = get_player_in_world(player_id);
    move_world_npc_right(world_npc_id);
}
void move_player_up(u32 player_id)
{
    u32 world_npc_id = get_player_in_world(player_id);
    move_world_npc_up(world_npc_id);
}
void move_player_down(u32 player_id)
{
    u32 world_npc_id = get_player_in_world(player_id);
    move_world_npc_down(world_npc_id);
}

// -----------------------------------------------------------------------------
// GENERAL GAME FUNCTIONS
// -----------------------------------------------------------------------------
void increment_tick_counter(u32* tick)
{
    if (*tick == UINT32_MAX)
    {
        // Reset to 1 instead of 0 to avoid using 0 as a seed
        *tick = 1;
    }
    else
    {
        *tick += 1;
    }
}
u32 artificial_sailing_tick = 0;
void tick()
{
    increment_tick_counter(&tick_counter);

    // Update game time
    update_game_time();

    if (!has_game_started)
    {
        has_game_started = true;
        accepting_input = true;
        initialize_game_time();
        // generate_world(WORLD_DINGUS_LAND);
        generate_world(WORLD_ATHENS);
    }
    else if (current.game_mode == GAME_MODE_IN_PORT)
    {
        // ...
    }
    else if (current.game_mode == GAME_MODE_IN_SCENE)
    {
        // ...
    }
    else if (current.game_mode == GAME_MODE_SAILING)
    {
        ++artificial_sailing_tick;
        if (artificial_sailing_tick % 50 != 0) { return; }
        u32 world_npc_id = get_player_in_world(0);
        u32 current_world_direction = storage_world_npc.data[world_npc_id].direction;
        if (current_world_direction == DIRECTION_UP)
        {
            move_player_up(0);
        }
        else if (current_world_direction == DIRECTION_DOWN)
        {
            move_player_down(0);
        }
        else if (current_world_direction == DIRECTION_LEFT)
        {
            move_player_left(0);
        }
        else if (current_world_direction == DIRECTION_RIGHT)
        {
            move_player_right(0);
        }
    }
}

u32 initialize_npc(u32 name_id, u32 type_id)
{
    DATA_NPC npc;
    CLEAR_STRUCT(&npc, SENTRY);
    npc.name_id = name_id;
    npc.type_id = NPC_TYPE_HUMAN;
    return add_storage_npc(&npc, false);
}
u32 initialize_general_item(u32 name_id, u32 base_price)
{
    DATA_GENERAL_ITEM item;
    CLEAR_STRUCT(&item, SENTRY);
    item.name_id = name_id;
    item.base_price = base_price;
    return add_storage_general_item(&item, true);
}
u32 initialize_good(u32 name_id, u32 base_price)
{
    DATA_GOOD good;
    CLEAR_STRUCT(&good, SENTRY);
    good.name_id = name_id;
    good.base_price = base_price;
    return add_storage_good(&good, true);
}
u32 initialize_world(u32 name_id, u32 width, u32 height)
{
    if (width > MAX_WORLD_WIDTH)
    {
        console_log("[E] Cannot create world greater than max width");
        return SENTRY;
    }
    if (height > MAX_WORLD_HEIGHT)
    {
        console_log("[E] Cannot create world greater than max height");
        return SENTRY;
    }
    DATA_WORLD world;
    CLEAR_STRUCT(&world, SENTRY);
    world.name_id = name_id;
    world.width = width;
    world.height = height;
    world.total_npcs = 0;
    world.total_captains = 0;
    world.total_layers = 0;
    return add_storage_world(&world, true);
}
u32 initialize_inventory(u32 name_id)
{
    DATA_INVENTORY inventory;
    CLEAR_STRUCT(&inventory, SENTRY);
    inventory.name_id = name_id;
    inventory.total_items = 0;
    for (u32 i = 0; i < MAX_INVENTORY_ITEMS; ++i)
    {
        inventory.inventory_items[i] = SENTRY;
    }
    return add_storage_inventory(&inventory, true);
}
u32 initialize_stats()
{
    DATA_STATS stats;
    CLEAR_STRUCT(&stats, SENTRY);
    default_stats(&stats);
    // TODO: Remove this later
    stats.seamanship = 33;
    return add_storage_stats(&stats, true);
}
u32 initialize_skill(u32 name_id)
{
    u32 stats_id = initialize_stats();
    DATA_STATS* stats = &storage_stats.data[stats_id];
    stats->battle_level = 2;
    stats->navigation_level = 22;
    stats->leadership = 3;
    stats->seamanship = 4;
    stats->knowledge = 30;
    stats->intuition = 23;
    stats->courage = 12;
    stats->swordsmanship = 8;
    stats->charm = 33;
    stats->luck = 99;

    DATA_SKILL skill;
    CLEAR_STRUCT(&skill, SENTRY);
    skill.name_id = name_id;
    skill.stats_requirements_id = stats_id;
    return add_storage_skill(&skill, true);
}
u32 initialize_fleet(u32 name_id, u32 general_id)
{
    DATA_FLEET fleet;
    CLEAR_STRUCT(&fleet, SENTRY);
    fleet.name_id = name_id;
    fleet.total_ships = 1;
    fleet.total_captains = 1;
    fleet.general_id = general_id;
    return add_storage_fleet(&fleet, true);
}
u32 initialize_ship(u32 name_id)
{
    DATA_SHIP ship;
    CLEAR_STRUCT(&ship, SENTRY);
    ship.name_id = name_id;
    return add_storage_ship(&ship, true);
    // u32 ship_id = pull_storage_ship_next_open_slot();
    // storage_ship.data[ship_id].name_id = name_id;
    // return ship_id;
}
u32 initialize_fleet_ship(u32 name_id, u32 ship_id)
{
    DATA_FLEET_SHIP fleet_ship;
    CLEAR_STRUCT(&fleet_ship, SENTRY);
    fleet_ship.name_id = name_id;
    fleet_ship.ship_id = ship_id;
    return add_storage_fleet_ship(&fleet_ship, true);
}
u32 initialize_captain(u32 name_id, u32 type_id, u32 inventory_name_id)
{
    u32 npc_id = initialize_npc(name_id, type_id);

    DATA_CAPTAIN captain;
    CLEAR_STRUCT(&captain, SENTRY);
    captain.name_id = name_id;
    captain.npc_id = npc_id;
    captain.gold = 100;
    captain.inventory_id = initialize_inventory(inventory_name_id);
    u32 stats_id = initialize_stats();
    captain.stats_id = stats_id;
    // We need to do this so we can get a captain id to reference later
    u32 captain_id = add_storage_captain(&captain, true);
    u32 fleet_id = initialize_fleet(name_id, captain.id);
    storage_captain.data[captain_id].general_of_fleet_id = fleet_id;
    storage_fleet.data[fleet_id].general_id = captain_id;

    // TODO: This area is using defaults. Later on, split this out!
    u32 base_ship_id = find_storage_base_ship_by_name_id(BASE_SHIP_BALSA);
    u32 ship_material_id = find_storage_ship_material_by_name_id(SHIP_MATERIAL_TEAK);
    u32 ship_id = initialize_ship(BASE_SHIP_BALSA);
    DATA_SHIP* new_ship = &storage_ship.data[ship_id];
    new_ship->base_ship_id = base_ship_id;
    new_ship->price = 400;
    new_ship->material_id = ship_material_id;
    u32 max_capacity = storage_base_ship.data[base_ship_id].max_capacity;
    new_ship->capacity = max_capacity;
    new_ship->tacking = 30;
    new_ship->power = 103;
    new_ship->speed = 333;
    new_ship->crew = 50;
    new_ship->durability = storage_base_ship.data[base_ship_id].durability;
    new_ship->cargo_space = my_floor_percentage(max_capacity, 40);
    new_ship->crew_space = my_floor_percentage(max_capacity, 40);
    new_ship->cannon_space = my_floor_percentage(max_capacity, 20);
    new_ship->total_cargo_goods = 0;

    u32 fleet_ship_id = initialize_fleet_ship(BASE_SHIP_BALSA, ship_id);
    storage_fleet_ship.data[fleet_ship_id].is_flagship = true;
    add_fleet_ship_to_fleet(fleet_ship_id, fleet_id);
    u32 good_food_id = find_storage_good_by_name_id(GOOD_FOOD);
    u32 good_water_id = find_storage_good_by_name_id(GOOD_WATER);
    u32 good_cannonballs_id = find_storage_good_by_name_id(GOOD_CANNONBALLS);
    add_good_to_ship(good_food_id, 10, ship_id);
    add_good_to_ship(good_water_id, 10, ship_id);
    add_good_to_ship(good_cannonballs_id, 10, ship_id);

    if (name_id == NPC_BLACKBEARD)
    {
        ship_id = initialize_ship(BASE_SHIP_BALSA);
        DATA_SHIP* new_ship = &storage_ship.data[ship_id];
        new_ship->base_ship_id = base_ship_id;
        new_ship->price = 400;
        new_ship->material_id = ship_material_id;
        new_ship->capacity = 400;
        new_ship->tacking = 30;
        new_ship->power = 103;
        new_ship->speed = 333;
        new_ship->crew = 50;
        new_ship->total_cargo_goods = 0;
        fleet_ship_id = initialize_fleet_ship(BASE_SHIP_BALSA, ship_id);
        add_fleet_ship_to_fleet(fleet_ship_id, fleet_id);
    }

    return captain_id;
}

void initialize_game()
{
    // NOTE: can do initialization like
    // SCENE some_scene = {.id=0,.flags={SENTRY}...}
    // to initialize arrays as all SENTRY values if you want to

    tick_counter = 1;
    current.game_mode = GAME_MODE_EMPTY;
    clear_all_layers();
    CLEAR_DATA(captain_to_player, MAX_CAPTAINS);

    // Must clear scene_shipyard.ships_prefab otherwise we clear too early
    for (u32 i = 0; i < 10; ++i)
    {
        Scene_Shipyard.ships_prefab[i] = SENTRY;
    }

    initialize_skill(SKILL_CELESTIAL_NAVIGATION);
    // cartography
    // gunnery
    // accounting
    // negotiation

    initialize_general_item(ITEM_TELESCOPE, 200);
    initialize_general_item(ITEM_QUADRANT, 201);
    initialize_general_item(ITEM_THEODOLITE, 202);
    initialize_general_item(ITEM_SEXTANT, 203);

    initialize_good(GOOD_CLOVE, 10);
    initialize_good(GOOD_CINNAMON, 10);
    initialize_good(GOOD_PEPPER, 10);
    initialize_good(GOOD_NUTMEG, 10);
    initialize_good(GOOD_PIMENTO, 10);
    initialize_good(GOOD_GINGER, 10);
    initialize_good(GOOD_VANILLA, 10);
    initialize_good(GOOD_TEA, 10);
    initialize_good(GOOD_COFFEE, 10);
    initialize_good(GOOD_CACAO, 10);
    initialize_good(GOOD_SUGAR, 10);
    initialize_good(GOOD_CHEESE, 10);
    initialize_good(GOOD_FISH, 10);
    initialize_good(GOOD_GRAIN, 10);
    initialize_good(GOOD_OLIVE_OIL, 10);
    initialize_good(GOOD_RAISINS, 10);
    initialize_good(GOOD_ROCK_SALT, 10);
    initialize_good(GOOD_SILK, 10);
    initialize_good(GOOD_COTTON, 10);
    initialize_good(GOOD_WOOL, 10);
    initialize_good(GOOD_FLAX, 10);
    initialize_good(GOOD_COTTON_CLOTH, 10);
    initialize_good(GOOD_SILK_CLOTH, 10);
    initialize_good(GOOD_WOOL_CLOTH, 10);
    initialize_good(GOOD_VELVET, 10);
    initialize_good(GOOD_LINEN_CLOTH, 10);
    initialize_good(GOOD_CORAL, 10);
    initialize_good(GOOD_AMBER, 10);
    initialize_good(GOOD_IVORY, 10);
    initialize_good(GOOD_PEARL, 10);
    initialize_good(GOOD_TORTOISE_SHELL, 10);
    initialize_good(GOOD_GOLD, 100);
    initialize_good(GOOD_SILVER, 100);
    initialize_good(GOOD_COPPER_ORE, 100);
    initialize_good(GOOD_TIN_ORE, 220);
    initialize_good(GOOD_IRON_ORE, 230);
    initialize_good(GOOD_ART, 240);
    initialize_good(GOOD_CARPET, 250);
    initialize_good(GOOD_MUSK, 260);
    initialize_good(GOOD_PERFUME, 270);
    initialize_good(GOOD_GLASS_BEADS, 280);
    initialize_good(GOOD_DYE, 290);
    initialize_good(GOOD_PORCELAIN, 300);
    initialize_good(GOOD_GLASSWARE, 500);
    initialize_good(GOOD_ARMS, 800);
    // Can be used for sailing purposes too
    initialize_good(GOOD_WOOD, 100);
    // For sailing purposes
    initialize_good(GOOD_CANNONBALLS, 20);
    initialize_good(GOOD_FOOD, 20);
    initialize_good(GOOD_WATER, 0);

    initialize_world(WORLD_ATHENS, MAX_WORLD_WIDTH, MAX_WORLD_HEIGHT);
    initialize_world(WORLD_DINGUS_LAND, MAX_WORLD_WIDTH, MAX_WORLD_HEIGHT);
    initialize_world(WORLD_GLOBE_1, MAX_WORLD_WIDTH, MAX_WORLD_HEIGHT);

    clear_all_ship_materials();
    DATA_SHIP_MATERIAL new_ship_material;
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_TEAK;
    new_ship_material.base_price = 100;
    new_ship_material.mod_power = 10;
    new_ship_material.mod_tacking = 10;
    new_ship_material.mod_speed = 10;
    new_ship_material.mod_durability = 10;
    new_ship_material.mod_capacity = 10;
    u32 sm_teak_id = add_storage_ship_material(&new_ship_material, true);
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_CEDAR;
    new_ship_material.base_price = 200;
    new_ship_material.mod_power = 20;
    new_ship_material.mod_tacking = 15;
    new_ship_material.mod_speed = 15;
    new_ship_material.mod_durability = 20;
    new_ship_material.mod_capacity = 10;
    u32 sm_cedar_id = add_storage_ship_material(&new_ship_material, true);
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_BEECH;
    new_ship_material.base_price = 350;
    new_ship_material.mod_power = 25;
    new_ship_material.mod_tacking = 25;
    new_ship_material.mod_speed = 20;
    new_ship_material.mod_durability = 30;
    new_ship_material.mod_capacity = 20;
    u32 sm_beech_id = add_storage_ship_material(&new_ship_material, true);
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_OAK;
    new_ship_material.base_price = 425;
    new_ship_material.mod_power = 30;
    new_ship_material.mod_tacking = 25;
    new_ship_material.mod_speed = 20;
    new_ship_material.mod_durability = 25;
    new_ship_material.mod_capacity = 20;
    u32 sm_oak_id = add_storage_ship_material(&new_ship_material, true);
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_MAHOGANY;
    new_ship_material.base_price = 500;
    new_ship_material.mod_power = 30;
    new_ship_material.mod_tacking = 30;
    new_ship_material.mod_speed = 30;
    new_ship_material.mod_durability = 40;
    new_ship_material.mod_capacity = 30;
    u32 sm_mahogany_id = add_storage_ship_material(&new_ship_material, true);
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_COPPER;
    new_ship_material.base_price = 800;
    new_ship_material.mod_power = 55;
    new_ship_material.mod_tacking = 55;
    new_ship_material.mod_speed = 50;
    new_ship_material.mod_durability = 70;
    new_ship_material.mod_capacity = 50;
    u32 sm_copper_id = add_storage_ship_material(&new_ship_material, true);
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_STEEL;
    new_ship_material.base_price = 1000;
    new_ship_material.mod_power = 70;
    new_ship_material.mod_tacking = 70;
    new_ship_material.mod_speed = 70;
    new_ship_material.mod_durability = 100;
    new_ship_material.mod_capacity = 100;
    u32 sm_steel_id = add_storage_ship_material(&new_ship_material, true);

    clear_all_cannons();
    DATA_CANNON new_cannon;
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON;
    new_cannon.range = 3;
    new_cannon.power = 8;
    new_cannon.base_price = 10;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_DEMI;
    new_cannon.range = 3;
    new_cannon.power = 12;
    new_cannon.base_price = 20;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_PEDERO;
    new_cannon.range = 3;
    new_cannon.power = 16;
    new_cannon.base_price = 30;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_CULVERIN;
    new_cannon.range = 4;
    new_cannon.power = 24;
    new_cannon.base_price = 50;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_DEMI_CULVERIN;
    new_cannon.range = 4;
    new_cannon.power = 30;
    new_cannon.base_price = 80;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_SAKER;
    new_cannon.range = 4;
    new_cannon.power = 40;
    new_cannon.base_price = 120;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_CARRONADE;
    new_cannon.range = 5;
    new_cannon.power = 50;
    new_cannon.base_price = 160;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_CARRONADE;
    new_cannon.range = 6;
    new_cannon.power = 60;
    new_cannon.base_price = 240;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_HEAVY;
    new_cannon.range = 6;
    new_cannon.power = 65;
    new_cannon.base_price = 280;
    add_storage_cannon(&new_cannon, true);
    CLEAR_STRUCT(&new_cannon, SENTRY);
    new_cannon.name_id = CANNON_CARRONADE_STAR;
    new_cannon.range = 7;
    new_cannon.power = 80;
    new_cannon.base_price = 400;
    add_storage_cannon(&new_cannon, true);

    clear_all_figureheads();
    DATA_FIGUREHEAD new_figurehead;
    // name_id, base_price
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_SEAHORSE;
    new_figurehead.base_price = 100;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_COMMODORE;
    new_figurehead.base_price = 120;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_UNICORN;
    new_figurehead.base_price = 140;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_LION;
    new_figurehead.base_price = 160;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_GIANT_EAGLE;
    new_figurehead.base_price = 180;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_HERO;
    new_figurehead.base_price = 200;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_NEPTUNE;
    new_figurehead.base_price = 220;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_DRAGON;
    new_figurehead.base_price = 240;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_ANGEL;
    new_figurehead.base_price = 260;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_GODDESS;
    new_figurehead.base_price = 280;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_GRIFFIN;
    new_figurehead.base_price = 300;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_MERMAID;
    new_figurehead.base_price = 400;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_PHOENIX;
    new_figurehead.base_price = 500;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_SIREN;
    new_figurehead.base_price = 600;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_TITAN;
    new_figurehead.base_price = 700;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_WARRIOR;
    new_figurehead.base_price = 800;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_WIZARD;
    new_figurehead.base_price = 900;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_ZEUS;
    new_figurehead.base_price = 1000;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_KRAKEN;
    new_figurehead.base_price = 1200;
    add_storage_figurehead(&new_figurehead, true);
    CLEAR_STRUCT(&new_figurehead, SENTRY);
    new_figurehead.name_id = FIGUREHEAD_LEVIATHAN;
    new_figurehead.base_price = 1400;
    add_storage_figurehead(&new_figurehead, true);

    DATA_BASE_SHIP new_base_ship;
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_BALSA;
    // Despite size, easy to maneuver
    new_base_ship.top_material_id = sm_cedar_id;
    new_base_ship.base_price = 100;
    new_base_ship.max_capacity = 100;
    new_base_ship.tacking = 20;
    new_base_ship.power = 20;
    new_base_ship.speed = 20;
    new_base_ship.durability = 20;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_HANSA_COG;
    // Not a very good ship
    new_base_ship.top_material_id = sm_cedar_id;
    new_base_ship.base_price = 80;
    new_base_ship.max_capacity = 100;
    new_base_ship.tacking = 17;
    new_base_ship.power = 14;
    new_base_ship.speed = 14;
    new_base_ship.durability = 10;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_LIGHT_GALLEY;
    // Good in shallow waters only
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 130;
    new_base_ship.max_capacity = 150;
    new_base_ship.tacking = 28;
    new_base_ship.power = 30;
    new_base_ship.speed = 25;
    new_base_ship.durability = 30;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_TALLETTE;
    // Only shallow waters but a small crew can use this easily
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 180;
    new_base_ship.max_capacity = 180;
    new_base_ship.tacking = 34;
    new_base_ship.power = 35;
    new_base_ship.speed = 35;
    new_base_ship.durability = 40;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_KANSEN;
    // Shallow waters for short distance trading
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 300;
    new_base_ship.max_capacity = 240;
    new_base_ship.tacking = 40;
    new_base_ship.power = 40;
    new_base_ship.speed = 40;
    new_base_ship.durability = 50;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_CARAVELA_LATINA;
    // Balanced and good for deeper waters
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 500;
    new_base_ship.max_capacity = 320;
    new_base_ship.tacking = 50;
    new_base_ship.power = 52;
    new_base_ship.speed = 51;
    new_base_ship.durability = 60;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_CARAVELA_REDONDA;
    // Easy to handle and smooth sailing even in deep waters
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 700;
    new_base_ship.max_capacity = 500;
    new_base_ship.tacking = 60;
    new_base_ship.power = 65;
    new_base_ship.speed = 60;
    new_base_ship.durability = 70;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_DHOW;
    // Limited cargo but maneuverable
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 800;
    new_base_ship.max_capacity = 400;
    new_base_ship.tacking = 70;
    new_base_ship.power = 70;
    new_base_ship.speed = 70;
    new_base_ship.durability = 75;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_JUNK;
    // Chinese ship
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 680;
    new_base_ship.max_capacity = 420;
    new_base_ship.tacking = 69;
    new_base_ship.power = 69;
    new_base_ship.speed = 69;
    new_base_ship.durability = 69;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_BRIGANTINE;
    // For trading coastal areas
    new_base_ship.top_material_id = sm_beech_id;
    new_base_ship.base_price = 900;
    new_base_ship.max_capacity = 640;
    new_base_ship.tacking = 80;
    new_base_ship.power = 82;
    new_base_ship.speed = 87;
    new_base_ship.durability = 85;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_ATAKABUNE;
    // For Japanese warlords
    new_base_ship.top_material_id = sm_oak_id;
    new_base_ship.base_price = 1200;
    new_base_ship.max_capacity = 640;
    new_base_ship.tacking = 80;
    new_base_ship.power = 82;
    new_base_ship.speed = 87;
    new_base_ship.durability = 85;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_FLEMISH_GALLEON;
    // Decent ship with high payload
    new_base_ship.top_material_id = sm_oak_id;
    new_base_ship.base_price = 1200;
    new_base_ship.max_capacity = 900;
    new_base_ship.tacking = 88;
    new_base_ship.power = 90;
    new_base_ship.speed = 93;
    new_base_ship.durability = 90;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_NAO;
    // mid size ship with large cargo
    new_base_ship.top_material_id = sm_oak_id;
    new_base_ship.base_price = 1800;
    new_base_ship.max_capacity = 1200;
    new_base_ship.tacking = 94;
    new_base_ship.power = 94;
    new_base_ship.speed = 94;
    new_base_ship.durability = 95;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_XEBEC;
    // Large maneuverable ship good for battles
    new_base_ship.top_material_id = sm_copper_id;
    new_base_ship.base_price = 2400;
    new_base_ship.max_capacity = 1000;
    new_base_ship.tacking = 100;
    new_base_ship.power = 100;
    new_base_ship.speed = 100;
    new_base_ship.durability = 120;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_VENETIAN_GALEASS;
    // Large maneuverable ship good for battles
    new_base_ship.top_material_id = sm_copper_id;
    new_base_ship.base_price = 4000;
    new_base_ship.max_capacity = 1400;
    new_base_ship.tacking = 115;
    new_base_ship.power = 115;
    new_base_ship.speed = 120;
    new_base_ship.durability = 140;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_PINNACE;
    // Small size but durable, good for fending off pirates
    new_base_ship.top_material_id = sm_copper_id;
    new_base_ship.base_price = 4500;
    new_base_ship.max_capacity = 1600;
    new_base_ship.tacking = 105;
    new_base_ship.power = 105;
    new_base_ship.speed = 110;
    new_base_ship.durability = 200;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_CARRACK;
    // Large trading ship
    new_base_ship.top_material_id = sm_copper_id;
    new_base_ship.base_price = 6000;
    new_base_ship.max_capacity = 2000;
    new_base_ship.tacking = 140;
    new_base_ship.power = 140;
    new_base_ship.speed = 140;
    new_base_ship.durability = 240;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_LA_REALE;
    // For naval warfare
    new_base_ship.top_material_id = sm_copper_id;
    new_base_ship.base_price = 8000;
    new_base_ship.max_capacity = 2400;
    new_base_ship.tacking = 160;
    new_base_ship.power = 160;
    new_base_ship.speed = 160;
    new_base_ship.durability = 300;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_BUSS;
    // Do not use in open size despite size and durability
    new_base_ship.top_material_id = sm_copper_id;
    new_base_ship.base_price = 8000;
    new_base_ship.max_capacity = 3000;
    new_base_ship.tacking = 110;
    new_base_ship.power = 110;
    new_base_ship.speed = 110;
    new_base_ship.durability = 400;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_GALLEON;
    // Can be battleship or trading
    new_base_ship.top_material_id = sm_steel_id;
    new_base_ship.base_price = 10000;
    new_base_ship.max_capacity = 4000;
    new_base_ship.tacking = 180;
    new_base_ship.power = 180;
    new_base_ship.speed = 180;
    new_base_ship.durability = 600;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_SLOOP;
    // Smaller ship but good capacity
    new_base_ship.top_material_id = sm_steel_id;
    new_base_ship.base_price = 11000;
    new_base_ship.max_capacity = 4400;
    new_base_ship.tacking = 160;
    new_base_ship.power = 160;
    new_base_ship.speed = 160;
    new_base_ship.durability = 580;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_TEKKOUSEN;
    // Huge rowing ship
    new_base_ship.top_material_id = sm_steel_id;
    new_base_ship.base_price = 16000;
    new_base_ship.max_capacity = 5000;
    new_base_ship.tacking = 200;
    new_base_ship.power = 200;
    new_base_ship.speed = 200;
    new_base_ship.durability = 640;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_FRIGATE;
    // Large storage and good mobility
    new_base_ship.top_material_id = sm_steel_id;
    new_base_ship.base_price = 25000;
    new_base_ship.max_capacity = 6000;
    new_base_ship.tacking = 240;
    new_base_ship.power = 240;
    new_base_ship.speed = 240;
    new_base_ship.durability = 720;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_BARGE;
    // Extremely rare
    new_base_ship.top_material_id = sm_steel_id;
    new_base_ship.base_price = 40000;
    new_base_ship.max_capacity = 8000;
    new_base_ship.tacking = 300;
    new_base_ship.power = 300;
    new_base_ship.speed = 300;
    new_base_ship.durability = 860;
    add_storage_base_ship(&new_base_ship, true);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_FULL_RIGGED_SHIP;
    // Ultimate ship
    new_base_ship.top_material_id = sm_steel_id;
    new_base_ship.base_price = 50000;
    new_base_ship.max_capacity = 9000;
    new_base_ship.tacking = 400;
    new_base_ship.power = 400;
    new_base_ship.speed = 400;
    new_base_ship.durability = 1000;
    add_storage_base_ship(&new_base_ship, true);

    // Captains
    initialize_captain(NPC_PLAYER_ONE, NPC_TYPE_HUMAN, INVENTORY_PLAYER_ONE);
    initialize_captain(NPC_PLAYER_TWO, NPC_TYPE_HUMAN, INVENTORY_PLAYER_TWO);
    initialize_captain(NPC_PLAYER_THREE, NPC_TYPE_HUMAN, INVENTORY_PLAYER_THREE);
    initialize_captain(NPC_PLAYER_FOUR, NPC_TYPE_HUMAN, INVENTORY_PLAYER_FOUR);
    initialize_captain(NPC_PLAYER_FIVE, NPC_TYPE_HUMAN, INVENTORY_PLAYER_FIVE);
    initialize_captain(NPC_BLACKBEARD, NPC_TYPE_HUMAN, INVENTORY_NPC_BLACKBEARD);
    initialize_captain(NPC_DAVEY_JONES, NPC_TYPE_HUMAN, INVENTORY_NPC_DAVEY_JONES);
    initialize_captain(NPC_RVICE, NPC_TYPE_HUMAN, INVENTORY_NPC_RVICE);
    initialize_captain(NPC_LAFOLIE, NPC_TYPE_HUMAN, INVENTORY_NPC_LAFOLIE);
    initialize_captain(NPC_LOLLER, NPC_TYPE_HUMAN, INVENTORY_NPC_LOLLER);
    initialize_captain(NPC_NAKOR, NPC_TYPE_HUMAN, INVENTORY_NPC_NAKOR);
    initialize_captain(NPC_TRAVIS, NPC_TYPE_HUMAN, INVENTORY_NPC_TRAVIS);
    // Humans
    initialize_npc(NPC_EMPTY, NPC_TYPE_HUMAN);
    initialize_npc(NPC_GENERAL_SHOP_OWNER, NPC_TYPE_HUMAN);
    initialize_npc(NPC_BANK_TELLER, NPC_TYPE_HUMAN);
    initialize_npc(NPC_BLACKJACK_PLAYER, NPC_TYPE_HUMAN);
    initialize_npc(NPC_OCEAN_BATTLE, NPC_TYPE_HUMAN);
    initialize_npc(NPC_SHIPYARD_OWNER, NPC_TYPE_HUMAN);
    initialize_npc(NPC_DOCKYARD_OWNER, NPC_TYPE_HUMAN);
    initialize_npc(NPC_GOODS_SHOP_OWNER, NPC_TYPE_HUMAN);
    // Monsters
    initialize_npc(NPC_KRAKEN, NPC_TYPE_MONSTER);
    // Ships
    initialize_npc(NPC_SHIP, NPC_TYPE_SHIP);
}

void test()
{
    set_player_gold(0, 90000);
    console_log("Debug ran");

    // u32 base_ship_id = find_storage_base_ship_by_name_id(BASE_SHIP_BALSA);
}

// -----------------------------------------------------------------------------
// BLACKJACK
// -----------------------------------------------------------------------------
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 deck[48];
    u32 deck_index;
    u32 player_deck[10];
    u32 player_deck_iterator;
    u32 dealer_deck[10];
    u32 dealer_deck_iterator;
    u32 player_value;
    u32 dealer_value;
    u32 bet_amount;
    u32 bet_minimum;
    u32 bet_maximum;
    // NOTE: These are flags and should be bool but it causes data alignment
    // issues in javascript when exporting so they are u32 for now
    u32 initialized;
    u32 player_standing;
    u32 dealer_standing;
    u32 player_hitting;
    u32 dealer_hitting;
    u32 player_won;
    u32 dealer_won;
    u32 game_over;
} BLACKJACK;
BLACKJACK blackjack;
u32* get_blackjack_ptr()
{ return (u32*)&blackjack; }
void clear_blackjack_data()
{
    blackjack.bet_amount = SENTRY;
    blackjack.player_standing = false;
    blackjack.dealer_standing = false;
    blackjack.player_hitting = false;
    blackjack.dealer_hitting = false;
    blackjack.player_won = false;
    blackjack.dealer_won = false;
    blackjack.game_over = false;
}
u32 blackjack_get_card_value(u32 card_id)
{
    u32 card = card_id % 13;
    if (card == 0) { card = 11; }
    if (card > 10) { card = 10; }
    return card;
}
u32 blackjack_get_dealers_deck_value()
{
    u32 total = 0;
    for (u32 i = 0; i < 10; ++i)
    {
        if (blackjack.dealer_deck[i] != SENTRY)
        {
            total += blackjack_get_card_value(blackjack.dealer_deck[i]);
        }
    }
    return total;
}
u32 blackjack_get_players_deck_value()
{
    u32 total = 0;
    for (u32 i = 0; i < 10; ++i)
    {
        if (blackjack.dealer_deck[i] != SENTRY)
        {
            total += blackjack_get_card_value(blackjack.player_deck[i]);
        }
    }
    return total;
}
void blackjack_add_card_to_players_deck()
{
    blackjack.player_deck[blackjack.player_deck_iterator] = blackjack.deck[blackjack.deck_index];
    ++blackjack.deck_index;
    ++blackjack.player_deck_iterator;
}
void blackjack_add_card_to_dealer_deck()
{
    blackjack.dealer_deck[blackjack.dealer_deck_iterator] = blackjack.deck[blackjack.deck_index];
    ++blackjack.deck_index;
    ++blackjack.dealer_deck_iterator;
}
void blackjack_setup()
{
    if (blackjack.initialized == true)
    {
        console_log("[E] Tried to initialized blackjack but already setup");
        return;
    }
    u32 deck_index = 0;
    for (u32 i = 0; i < 52; ++i)
    {
        // Skip JACK cards
        if (i % 13 != 10)
        {
            blackjack.deck[deck_index] = i;
            deck_index += 1;
        }
    }
    for (u32 i = 47; i > 0; --i)
    {
        u32 random_index = get_random_number(0, i + 1);
        u32 temp = blackjack.deck[i];
        blackjack.deck[i] = blackjack.deck[random_index];
        blackjack.deck[random_index] = temp;
    }
    blackjack.deck_index = 0;
    blackjack.bet_amount = SENTRY;
    blackjack.player_standing = SENTRY;
    blackjack.dealer_standing = SENTRY;
    blackjack.player_hitting = SENTRY;
    blackjack.dealer_hitting = SENTRY;
    for (u32 i = 0; i < 10; ++i)
    {
        blackjack.player_deck[i] = SENTRY;
        blackjack.dealer_deck[i] = SENTRY;
    }
    blackjack.player_standing = SENTRY;
    blackjack.dealer_standing = SENTRY;
    blackjack.player_deck_iterator = 0;
    blackjack.dealer_deck_iterator = 0;
    blackjack_add_card_to_players_deck();
    blackjack_add_card_to_dealer_deck();
    blackjack_add_card_to_players_deck();
    blackjack_add_card_to_dealer_deck();
    blackjack.initialized = true;
}
void blackjack_dealer_turn()
{
    u32 dealer_total = blackjack_get_dealers_deck_value();
    if (dealer_total >= 17)
    {
        blackjack.dealer_standing = true;
    }
    else
    {
        blackjack.dealer_hitting = true;
        blackjack_add_card_to_dealer_deck();
    }
}
void blackjack_check_winner()
{
    u32 player_total = blackjack_get_players_deck_value();
    u32 dealer_total = blackjack_get_dealers_deck_value();

    if (dealer_total > 21)
    {
        console_log("Dealer over 21");
        blackjack.player_won = true;
        blackjack.game_over = true;
    }
    if (player_total > 21)
    {
        console_log("Player over 21");
        blackjack.dealer_won = true;
        blackjack.game_over = true;
    }
    // If neither player is standing, just skip
    if (blackjack.player_standing != true && blackjack.dealer_standing != true)
    {
        console_log("Nobody is standing");
    }
    // If both players are standing, whoever is closest to 21
    if (blackjack.player_standing == true && blackjack.dealer_standing == true)
    {
        console_log("Both are standing");
        // Double check for either one being over
        if (dealer_total > 21)
        {
            console_log("Dealer over 21 [b]");
            blackjack.player_won = true;
            blackjack.game_over = true;
        }
        else if (player_total > 21)
        {
            console_log("Player over 21 [b]");
            blackjack.dealer_won = true;
            blackjack.game_over = true;
        }
        else if (dealer_total > player_total)
        {
            console_log("dealer more than player");
            blackjack.dealer_won = true;
            blackjack.game_over = true;
        }
        else if (player_total > dealer_total)
        {
            console_log("player more than dealer");
            blackjack.player_won = true;
            blackjack.game_over = true;
        }
        else if (dealer_total == player_total)
        {
            console_log("Samesies");
            // Samesies = house wins
            blackjack.dealer_won = true;
            blackjack.game_over = true;
        }
        else if (dealer_total == 21)
        {
            console_log("dealer 21");
            blackjack.dealer_won = true;
            blackjack.game_over = true;
        }
        else if (player_total == 21)
        {
            console_log("player 21");
            blackjack.player_won = true;
            blackjack.game_over = true;
        }
        else
        {
            console_log("House always wins");
            // Default to house wins (since both are standing)
            blackjack.dealer_won = true;
            blackjack.game_over = true;
        }
    }
}

u32 scene_blackjack(u32 action)
{
    if (Scene_Blackjack.flag_initialized == 0)
    {
        console_log("[I] Setting up scene blackjack");
        current.scene = SCENE_BLACKJACK;
        Scene_Blackjack.flag_initialized = 1;
        Scene_Blackjack.previous_game_mode = current.game_mode;
        blackjack.bet_minimum = 100;
        blackjack.bet_maximum = 10000;
        Scene_Blackjack.dialog_id = DIALOG_BLACKJACK_WELCOME;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != SCENE_BLACKJACK
    )
    {
        Scene_Blackjack.error_code = ERROR_NOT_CORRECT_SCENE;
        console_log("[E] Already in scene and it's not blackjack");
        return SENTRY;
    }
    if (
        blackjack.bet_amount < blackjack.bet_minimum
        ||
        blackjack.bet_amount > blackjack.bet_maximum
        ||
        blackjack.bet_amount > get_player_gold(0)
    )
    {
        Scene_Blackjack.error_code = ERROR_BLACKJACK_BET_NOT_RIGHT;
        console_log("[E] Bet amount is less than min or greater than max");
        return SENTRY;
    }
    switch (action)
    {
    case ACTION_PLACE_BET:
        console_log("[I] Blackjack bet placed. Setting up game");
        if (
            blackjack.player_hitting || blackjack.player_standing
            ||
            blackjack.dealer_hitting || blackjack.dealer_standing
        )
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_GAME_ALREADY_STARTED;
            console_log("[E] Game is already started");
        }
        else if (blackjack.game_over)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_GAME_OVER;
            console_log("[E] Game is already over");
        }
        else
        {
            blackjack_setup();
        }
        break;
    case ACTION_PLAYER_HIT:
        if (blackjack.player_hitting || blackjack.player_standing)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_PLAYER_ALREADY_ACTIONED;
            console_log("[E] Player already took action");
        }
        else if (blackjack.game_over)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_GAME_OVER;
            console_log("[E] Game already over");
        }
        else
        {
            blackjack.player_hitting = true;
            blackjack_add_card_to_players_deck();
            blackjack_check_winner();
        }
        break;
    case ACTION_PLAYER_STAND:
        if (blackjack.player_hitting || blackjack.player_standing)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_PLAYER_ALREADY_ACTIONED;
            console_log("[E] Player already took action");
        }
        else if (blackjack.game_over)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_GAME_OVER;
            console_log("[E] Game already over");
        }
        else
        {
            blackjack.player_standing = true;
            blackjack_check_winner();
        }
        break;
    case ACTION_DEALER_TURN:
        if (blackjack.dealer_hitting || blackjack.dealer_standing)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_DEALER_ALREADY_ACTIONED;
            console_log("[E] Dealer already took action");
        }
        else if (blackjack.game_over)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_GAME_OVER;
            console_log("[E] Game already over");
        }
        else
        {
            blackjack_dealer_turn();
            blackjack_check_winner();
        }
        break;
    case ACTION_NEXT:
        if (blackjack.game_over)
        {
            Scene_Blackjack.error_code = ERROR_BLACKJACK_GAME_OVER;
            console_log("[E] Game already over");
        }
        else if (
            (blackjack.player_standing && blackjack.dealer_standing)
            ||
            (blackjack.player_standing && blackjack.dealer_hitting)
            ||
            (blackjack.player_hitting && blackjack.dealer_standing)
            ||
            (blackjack.player_hitting && blackjack.dealer_hitting)
        )
        {
            console_log("[I] Resetting blackjack turn");
            blackjack.player_standing = false;
            blackjack.dealer_standing = false;
            blackjack.player_hitting = false;
            blackjack.dealer_hitting = false;
        }
        else
        {
            Scene_Blackjack.error_code = ERROR_GENERAL;
            console_log("[E] Not ready to reset blackjack turn");
        }
        break;
    case ACTION_EXIT:
        console_log("[I] Exiting blackjack scene");
        clear_blackjack_data();
        break;
    case ACTION:
        console_log("[I] Nothing to do here");
        break;
    default:
        Scene_Blackjack.error_code = ERROR_GENERAL;
        console_log("[E] Invalid action for blackjack");
        break;
    }
    return SENTRY;
}


// -----------------------------------------------------------------------------
// - GENERAL SHOP SCENE
// -----------------------------------------------------------------------------
u32 scene_general_shop(u32 action)
{
    if (Scene_General_Shop.flag_initialized == 0)
    {
        console_log("[I] Setting up scene general shop");
        current.scene = SCENE_GENERAL_SHOP;
        Scene_General_Shop.flag_initialized = 1;
        Scene_General_Shop.flag_confirmed = 0;
        Scene_General_Shop.previous_game_mode = current.game_mode;
        current.updated_state = UPDATED_STATE_SCENE;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != SCENE_GENERAL_SHOP
    )
    {
        console_log("[E] Already in scene and it's not general shop");
        return SENTRY;
    }
    switch (action)
    {
    case ACTION_BUY:
        console_log("[I] General shop buying.");
        u32 total_price = 0;
        for (u32 c = 0; c < MAX_INVENTORY_ITEMS; ++c)
        {
            u32 qty = Scene_General_Shop.chosen_items[c];
            if (qty == 0 || qty == SENTRY) { continue; }
            u32 id = storage_inventory.data[Scene_General_Shop.inventory_id].inventory_items[c];
            total_price += storage_inventory_item.data[id].adjusted_price;
        }
        u32 player_gold = get_player_gold(0);
        if (total_price > player_gold)
        {
            Scene_General_Shop.error_code = ERROR_NOT_ENOUGH_GOLD;
            Scene_General_Shop.flag_bought = false;
        }
        else
        {
            subtract_player_gold(0, total_price);
            u32 player_inventory_id = get_player_inventory_id(0);
            for (u32 c = 0; c < MAX_INVENTORY_ITEMS; ++c)
            {
                u32 qty = Scene_General_Shop.chosen_items[c];
                if (qty == 0 || qty == SENTRY) { continue; }
                u32 id = storage_inventory.data[Scene_General_Shop.inventory_id].inventory_items[c];
                u32 new_id = pull_storage_inventory_item_next_open_slot();
                // Copy from one struct to another, directly
                storage_inventory_item.data[new_id] = storage_inventory_item.data[id];
                add_item_to_inventory(new_id, player_inventory_id);
            }
            Scene_General_Shop.flag_bought = true;
        }
        current.updated_state = UPDATED_STATE_SCENE;
        break;
    case ACTION_EXIT:
        console_log("[I] Exiting Scene");
        clear_inventory_items_by_inventory_id(Scene_General_Shop.inventory_id);
        Scene_General_Shop.flag_confirmed = 1;
        Scene_General_Shop.flag_initialized = 0;
        Scene_General_Shop.flag_bought = 0;
        Scene_General_Shop.inventory_id = SENTRY;
        current.game_mode = Scene_General_Shop.previous_game_mode;
        current.updated_state = UPDATED_STATE_SCENE;
        current.scene = SENTRY;
        break;
    case ACTION:
        console_log("[I] Nothing to do here");
        break;
    default:
        console_log("[E] Invalid action for general shop");
        break;
    }
    return SENTRY;
}

// -----------------------------------------------------------------------------
// OCEAN BATTLE
// -----------------------------------------------------------------------------
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 dialog_id;
    u32 flag_initialized;
    u32 flag_confirmed;
    u32 previous_game_mode;
    u32 error_code;
} DATA_SCENE_OCEAN_BATTLE;
DATA_SCENE_OCEAN_BATTLE Scene_Ocean_Battle;
u32* get_data_scene_ocean_battle_ptr()
{ return (u32*)&Scene_Ocean_Battle; }
#define MAX_OCEAN_BATTLE_FLEETS 10
#define MAX_OCEAN_BATTLE_FLEET_SHIPS (MAX_OCEAN_BATTLE_FLEETS * MAX_FLEET_SHIPS)
#define MAX_OCEAN_BATTLE_TURN_HISTORY 3000
// Currently at 50 x 2 (x/y)
#define MAX_OCEAN_BATTLE_VALID_COORDS 100
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 turn_order_fleets[MAX_OCEAN_BATTLE_FLEETS];
    u32 turn_order_fleet_ships[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    u32 turn_order_world_npcs[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    u32 turn_order_ships[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    u32 total_fleets;
    u32 attacker_id;
    u32 target_id;
    u32 total_ships;
    u32 turn_order;
    u32 turn_history[MAX_OCEAN_BATTLE_TURN_HISTORY];
    u32 valid_move_coords[MAX_OCEAN_BATTLE_VALID_COORDS];
    u32 total_valid_move_coords;
    u32 valid_cannon_coords[MAX_OCEAN_BATTLE_VALID_COORDS];
    u32 total_valid_cannon_coords;
    u32 valid_boarding_coords[MAX_OCEAN_BATTLE_VALID_COORDS];
    u32 total_valid_boarding_coords;
    u32 intended_move_coords[2];
    u32 intended_cannon_coords[2];
    u32 intended_boarding_coords[2];
    u32 victory;
    u32 player_victory;
    u32 fleet_victory;
    u32 who_won;
    u32 moved;
    u32 attacked;
} DATA_OCEAN_BATTLE;
DATA_OCEAN_BATTLE data_ocean_battle;
u32* get_data_ocean_battle_ptr()
{ return (u32*)&data_ocean_battle; }
void clear_ocean_battle()
{
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
    {
        data_ocean_battle.turn_order_fleets[i] = SENTRY;
    }
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEET_SHIPS; ++i)
    {
        data_ocean_battle.turn_order_fleet_ships[i] = SENTRY;
        data_ocean_battle.turn_order_world_npcs[i] = SENTRY;
        data_ocean_battle.turn_order_ships[i] = SENTRY;
    }
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_TURN_HISTORY; ++i)
    {
        data_ocean_battle.turn_history[i] = SENTRY;
    }
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_VALID_COORDS; ++i)
    {
        data_ocean_battle.valid_move_coords[i] = SENTRY;
        data_ocean_battle.valid_cannon_coords[i] = SENTRY;
        data_ocean_battle.valid_boarding_coords[i] = SENTRY;
    }
    for (u32 i = 0; i < 2; ++i)
    {
        data_ocean_battle.intended_move_coords[i] = SENTRY;
        data_ocean_battle.intended_cannon_coords[i] = SENTRY;
        data_ocean_battle.intended_boarding_coords[i] = SENTRY;
    }
    data_ocean_battle.total_ships = 0;
    data_ocean_battle.total_fleets = 0;
}

void ob_add_fleet(u32 fleet_id)
{
    bool is_already_in = false;
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
    {
        if (data_ocean_battle.turn_order_fleets[i] == fleet_id)
        {
            is_already_in = true;
            return;
        }
    }
    bool added = false;
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
    {
        if (data_ocean_battle.turn_order_fleets[i] != SENTRY) { continue; }
        data_ocean_battle.turn_order_fleets[i] = fleet_id;
        ++data_ocean_battle.total_fleets;
        added = true;
        break;
    }
    if (!added)
    {
        console_log("[E] Could not add fleet to battle");
        return;
    }
    DATA_FLEET* fleet = &storage_fleet.data[fleet_id];
    for (u32 i = 0; i < MAX_FLEET_SHIPS; ++i)
    {
        if (fleet->ship_ids[i] != SENTRY)
        {
            data_ocean_battle.turn_order_fleet_ships[data_ocean_battle.total_ships] = fleet->ship_ids[i];
            DATA_FLEET_SHIP* fleet_ship = &storage_fleet_ship.data[fleet->ship_ids[i]];
            data_ocean_battle.turn_order_ships[data_ocean_battle.total_ships] = fleet_ship->ship_id;
            // create world npcs?
            DATA_WORLD_NPC world_npc;
            CLEAR_STRUCT(&world_npc, SENTRY);
            world_npc.name_id = NPC_SHIP;
            world_npc.position_x = 0;
            world_npc.position_y = 0;
            world_npc.direction = DIRECTION_DOWN;
            world_npc.entity_id = fleet_ship->id;
            world_npc.type_id = NPC_TYPE_SHIP;
            world_npc.is_player = false;
            if (fleet->general_id == 0)
            {
                world_npc.is_player = true;
            }
            u32 wnpcid = add_storage_world_npc(&world_npc, true);
            data_ocean_battle.turn_order_world_npcs[data_ocean_battle.total_ships] = wnpcid;
            ++data_ocean_battle.total_ships;
        }
    }
}
void ob_setup_turn_order()
{
    u32 new_fleet_ships_turn_order[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    u32 new_world_npcs_turn_order[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    u32 new_ships_turn_order[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    // TODO: Replace existing data in struct
    // A few ways you can do this. Since total turn array size is max_fleets
    // x max_fleet_ships you can:
    // - iterate over first ship on each fleet, put them all in the first section
    // -- n+1 and next section (as long as a ship exists for fleet)
    // -- when you want full turn order, just iterate and skip sentry values
    // - sort by highest speed, then highest tack, then so on
    data_ocean_battle.turn_order = 0;
}
void ob_get_moves_in_range()
{
    u32 current_turn_order = data_ocean_battle.turn_order;
    u32 current_fsid = data_ocean_battle.turn_order_fleet_ships[current_turn_order];
    DATA_FLEET_SHIP* current_fs = &storage_fleet_ship.data[current_fsid];
    u32 current_wnpcid = data_ocean_battle.turn_order_world_npcs[current_turn_order];
    DATA_WORLD_NPC* current_wnpc = &storage_world_npc.data[current_wnpcid];
    // MAX_OCEAN_BATTLE_VALID_COORDS
    u32 current_valid_cannon_coords_iterator = 0;
    u32 current_valid_boarding_coords_iterator = 0;
    // console_log("[I] Ready to get valid coords");
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEET_SHIPS; ++i)
    {
        u32 fsid = data_ocean_battle.turn_order_fleet_ships[i];
        if (fsid == SENTRY) { continue; }
        DATA_FLEET_SHIP* fleet_ship = &storage_fleet_ship.data[fsid];
        if (fleet_ship->id == current_fs->id || fleet_ship->fleet_id == current_fs->fleet_id)
        {
            continue;
        }
        u32 ship_id = data_ocean_battle.turn_order_ships[i];
        DATA_SHIP* ship = &storage_ship.data[ship_id];
        if (ship->durability <= 0 || ship->crew <= 0)
        {
            continue;
        }
        u32 wnpcid = data_ocean_battle.turn_order_world_npcs[i];
        DATA_WORLD_NPC* wnpc = &storage_world_npc.data[wnpcid];
        u32 cannon_range = 8;
        u32 boarding_range = 1;
        if (
            is_coordinate_in_range_of_coordinate(
                current_wnpc->position_x,
                current_wnpc->position_y,
                wnpc->position_x,
                wnpc->position_y,
                cannon_range
            )
        )
        {
            data_ocean_battle.valid_cannon_coords[current_valid_cannon_coords_iterator] = wnpc->position_x;
            ++current_valid_cannon_coords_iterator;
            data_ocean_battle.valid_cannon_coords[current_valid_cannon_coords_iterator] = wnpc->position_y;
            ++current_valid_cannon_coords_iterator;
            ++data_ocean_battle.total_valid_cannon_coords;
        }
        else
        {
            args[0].i = wnpc->position_x;
            args[1].i = wnpc->position_y;
            args[2].i = wnpcid;
            console_log_format("Not in range somehow px:%d, py:%d wnpcid:%d", args, 3);
        }
        if (
            is_coordinate_in_range_of_coordinate(
                current_wnpc->position_x,
                current_wnpc->position_y,
                wnpc->position_x,
                wnpc->position_y,
                boarding_range
            )
        )
        {
            data_ocean_battle.valid_boarding_coords[current_valid_boarding_coords_iterator] = wnpc->position_x;
            ++current_valid_boarding_coords_iterator;
            data_ocean_battle.valid_boarding_coords[current_valid_boarding_coords_iterator] = wnpc->position_y;
            ++current_valid_boarding_coords_iterator;
            ++data_ocean_battle.total_valid_boarding_coords;
        }
    }
    u32 move_range = 4;
    u32 start_x = 0;
    u32 start_y = 0;
    DATA_WORLD* current_world = get_current_world();
    u32 end_x = current_world->width;
    u32 end_y = current_world->height;
    u32 current_valid_coords_iterator = 0;
    if ((current_wnpc->position_x - move_range) <= (SENTRY - 100))
    {
        start_x = (current_wnpc->position_x - move_range);
    }
    if ((current_wnpc->position_y - move_range) <= (SENTRY - 100))
    {
        start_y = (current_wnpc->position_y - move_range);
    }
    if ((current_wnpc->position_x + move_range) <= current_world->width)
    {
        end_x = (current_wnpc->position_x + move_range);
    }
    if ((current_wnpc->position_y + move_range) <= current_world->height)
    {
        end_y = (current_wnpc->position_y + move_range);
    }
    u32 cx = current_wnpc->position_x;
    u32 cy = current_wnpc->position_y;
    for (u32 y = start_y; y < end_y; ++y)
    {
        for (u32 x = start_x; x < end_x; ++x)
        {
            if (
                x == current_wnpc->position_x
                &&
                y == current_wnpc->position_y
            ) { continue; }
            if (are_coordinates_blocked(x, y)) { continue; }
            if (!is_coordinate_in_range_of_coordinate(cx, cy, x, y, move_range))
            { continue; }
            data_ocean_battle.valid_move_coords[current_valid_coords_iterator] = x;
            ++current_valid_coords_iterator;
            data_ocean_battle.valid_move_coords[current_valid_coords_iterator] = y;
            ++current_valid_coords_iterator;
            ++data_ocean_battle.total_valid_move_coords;
        }
    }
}
void ob_get_in_range()
{
    ob_get_moves_in_range();
    // TODO: MUST extract from above
    // ob_get_cannons_in_range();
    // ob_get_boardings_in_range();
}
void ob_increment_turn_order()
{
    data_ocean_battle.moved = false;
    data_ocean_battle.attacked = false;
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_VALID_COORDS; ++i)
    {
        data_ocean_battle.valid_move_coords[i] = SENTRY;
        data_ocean_battle.valid_cannon_coords[i] = SENTRY;
        data_ocean_battle.valid_boarding_coords[i] = SENTRY;
    }
    data_ocean_battle.total_valid_move_coords = 0;
    data_ocean_battle.total_valid_cannon_coords = 0;
    data_ocean_battle.total_valid_boarding_coords = 0;
    bool turn_updated = false;
    // TODO: If Kraken, you can't just use total ships. Kraken takes a turn every time
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEET_SHIPS; ++i)
    {
        if (i <= data_ocean_battle.turn_order) { continue; }
        u32 ship_id = data_ocean_battle.turn_order_ships[i];
        if (ship_id == SENTRY)
        {
            continue;
        }
        DATA_SHIP* ship = &storage_ship.data[ship_id];
        if (ship->crew == 0 || ship->durability == 0)
        {
            continue;
        }
        turn_updated = true;
        data_ocean_battle.turn_order = i;
        break;
    }
    if (!turn_updated)
    {
        console_log("[E] Might have reached end of turn order");
        data_ocean_battle.turn_order = 0;
    }
    u32 wnpcid = data_ocean_battle.turn_order_world_npcs[data_ocean_battle.turn_order];
    DATA_WORLD_NPC* wnpc = &storage_world_npc.data[wnpcid];
    if (wnpc->is_player == SENTRY || wnpc->is_player == false)
    {
        ob_get_in_range();
        // TODO: Better move AI
        if (data_ocean_battle.total_valid_move_coords > 0)
        {
            u32 max_moves = data_ocean_battle.total_valid_move_coords - 1;
            u32 rand_move = get_random_number(0, max_moves);
            rand_move *= 2;
            u32 x = data_ocean_battle.valid_move_coords[rand_move];
            u32 y = data_ocean_battle.valid_move_coords[rand_move + 1];
            if (x != SENTRY)
            {
                data_ocean_battle.intended_move_coords[0] = x;
                data_ocean_battle.intended_move_coords[1] = y;
            }
            else
            {
                args[0].i = rand_move;
                console_log_format("somehow got a bad rand move", args, 1);
            }
        }
        // TODO: Better attack AI. For now, use cannons
        if (data_ocean_battle.total_valid_cannon_coords > 0)
        {
            for (u32 i = 0; i < MAX_OCEAN_BATTLE_VALID_COORDS; i += 2)
            {
                u32 x = data_ocean_battle.valid_cannon_coords[i];
                u32 y = data_ocean_battle.valid_cannon_coords[i + 1];
                if (x == SENTRY)
                {
                    continue;
                }
                data_ocean_battle.intended_cannon_coords[0] = x;
                data_ocean_battle.intended_cannon_coords[1] = y;
                break;
            }
            data_ocean_battle.intended_boarding_coords[0] = SENTRY;
            data_ocean_battle.intended_boarding_coords[1] = SENTRY;
        }
        else if (data_ocean_battle.total_valid_boarding_coords > 0)
        {
            for (u32 i = 0; i < MAX_OCEAN_BATTLE_VALID_COORDS; i += 2)
            {
                u32 x = data_ocean_battle.valid_boarding_coords[i];
                u32 y = data_ocean_battle.valid_boarding_coords[i + 1];
                if (x == SENTRY)
                {
                    continue;
                }
                data_ocean_battle.intended_boarding_coords[0] = x;
                data_ocean_battle.intended_boarding_coords[1] = y;
                break;
            }
            data_ocean_battle.intended_cannon_coords[0] = SENTRY;
            data_ocean_battle.intended_cannon_coords[1] = SENTRY;
        }
        console_log("[I] got new coords for npc");
    }
}
void ob_last_man_standing()
{
    // MAX_OCEAN_BATTLE_FLEETS
    // one brute force way to do is to iterate over fleet ships, get ship, if no hull or crew, one ship down
    u32 fleet_ship_count[MAX_OCEAN_BATTLE_FLEETS] = {0};
    u32 fleet_ship_ids[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEET_SHIPS; ++i)
    {
        fleet_ship_ids[i] = SENTRY;
    }

    bool players_fleet_standing = false;
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEET_SHIPS; ++i)
    {
        u32 fleet_ship_id = data_ocean_battle.turn_order_fleet_ships[i];
        u32 ship_id = data_ocean_battle.turn_order_ships[i];
        if (fleet_ship_id == SENTRY) { continue; }
        DATA_SHIP* ship = &storage_ship.data[ship_id];
        if (ship->crew > 0 && ship->durability > 0)
        {
            u32 fleet_id = storage_fleet_ship.data[fleet_ship_id].fleet_id;
            if (storage_fleet.data[fleet_id].general_id == 0)
            {
                players_fleet_standing = true;
            }
            ++fleet_ship_count[fleet_id];
            fleet_ship_ids[i] = fleet_id;
        }
    }

    u32 total_fleets_with_ships = 0;
    for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
    {
        if (fleet_ship_count[i] > 0)
        {
            ++total_fleets_with_ships;
        }
    }

    if (total_fleets_with_ships > 1)
    {
        console_log("[I] Still more than one fleet left in the battle");
    }
    else if (total_fleets_with_ships == 1)
    {
        for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEET_SHIPS; ++i)
        {
            if (fleet_ship_ids[i] != SENTRY)
            {
                data_ocean_battle.fleet_victory = fleet_ship_ids[i];
            }
        }

        if (players_fleet_standing)
        {
            data_ocean_battle.player_victory = true;
        }
        data_ocean_battle.victory = true;
        console_log("[I] One fleet left. Victory condition set.");
    }
    else
    {
        console_log("[E] Got into some unknown state when checking for fleets with ships left in battle");
    }
}
void fake_ocean_battle()
{
    generate_world(WORLD_DINGUS_LAND);
    clear_ocean_battle();
    // Presumably the player I hope
    ob_add_fleet(storage_captain.data[0].general_of_fleet_id);
    u32 blackbeard = find_storage_captain_by_name_id(NPC_BLACKBEARD);
    ob_add_fleet(storage_captain.data[blackbeard].general_of_fleet_id);
    DATA_WORLD* current_world = get_current_world();

    // First place fleets so there are no blockers
    // Formation placement system
    //       1 1 1
    //      1 1 1 1
    //       1 1 1
    // start + 1, +2, +2
    // start + 0, +2, +2, +2
    // start + 1, +2, +2
    // 7 * 3 = 21
    u32 start_x = 0;
    u32 start_y = 0;
    u32 formation[12] = {1, 3, 5, SENTRY, 0, 2, 4, 6, SENTRY, 1, 3, 5};
    u32 formation_x = 0;
    for (u32 f = 0; f < MAX_OCEAN_BATTLE_FLEETS; ++f)
    {
        u32 fleet_id = data_ocean_battle.turn_order_fleets[f];
        u32 total = get_storage_world_npc_total_used_slots();
        for (u32 i = 0; i < total; ++i)
        {
            u32 fleet_ship_id = storage_world_npc.data[i].entity_id;
            if (storage_fleet_ship.data[fleet_ship_id].fleet_id == fleet_id)
            {
                if (formation[formation_x] == SENTRY)
                {
                    start_y += 1;
                    ++formation_x;
                }
                u32 this_x = start_x + formation[formation_x];
                // if (are_coordinates_blocked(this_x, start_y)) { continue; }
                move_world_npc_to(i, this_x, start_y);
                ++formation_x;
            }
        }
        start_x += 8;
        if (start_x > current_world->width)
        {
            start_y += 3;
            start_x = 0;
        }
        if (start_y > current_world->height)
        {
            console_log("[E] We somehow went over the battle map placing ships");
        }
        formation_x = 0;
    }

    // Then place islands for fun
    // value = 42 in layer one
    u32 max_attempts = 300;
    u32 current_attempt = 0;
    u32 max_width = current_world->width - 1;
    u32 max_height = current_world->height - 1;
    while (current_attempt < max_attempts)
    {
        u32 x = get_random_number(0, max_width);
        u32 y = get_random_number(0, max_height);
        if (!are_coordinates_blocked(x, y))
        {
            u32 layer_id = find_storage_layer_by_name_id(LAYER_ONE);
            layer_set_value(layer_id, x, y, 42);
            layer_id = find_storage_layer_by_name_id(LAYER_BLOCK);
            layer_set_value(layer_id, x, y, 1);
        }
        ++current_attempt;
    }
}
u32 scene_ocean_battle(u32 action)
{
    if (Scene_Ocean_Battle.flag_initialized == 0)
    {
        console_log("[I] Setting up ocean battle scene");
        current.scene = SCENE_OCEAN_BATTLE;
        Scene_Ocean_Battle.id = SCENE_OCEAN_BATTLE;
        // Scene_Ocean_Battle.dialog_id = scene_dialog_id; ???
        Scene_Ocean_Battle.flag_initialized = 1;
        Scene_Ocean_Battle.flag_confirmed = 0;
        Scene_Ocean_Battle.previous_game_mode = current.game_mode;
        current.updated_state = UPDATED_STATE_SCENE;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != Scene_Ocean_Battle.id
    )
    {
        console_log("[E] Already in scene and it's not this one");
        return SENTRY;
    }
    /*
    if (!initialized) { initialize }
    if (!setup && !manual_setup) {
        auto setup (use stats of ships to determine order)
    }
    */
    u32 intended_x;
    u32 intended_y;
    switch (action)
    {
    case OCEAN_BATTLE_END_TURN:
        if (data_ocean_battle.victory)
        {
            console_log("[I] Battle already has a victory. Cannot end turn");
            break;
        }
        console_log("[I] Ending Turn");
        u32 wnpcid = data_ocean_battle.turn_order_world_npcs[data_ocean_battle.turn_order];
        DATA_WORLD_NPC* wnpc = &storage_world_npc.data[wnpcid];
        if (wnpc->is_player)
        {
            data_ocean_battle.intended_move_coords[0] = SENTRY;
            data_ocean_battle.intended_move_coords[1] = SENTRY;
            data_ocean_battle.intended_cannon_coords[0] = SENTRY;
            data_ocean_battle.intended_cannon_coords[1] = SENTRY;
            data_ocean_battle.intended_boarding_coords[0] = SENTRY;
            data_ocean_battle.intended_boarding_coords[1] = SENTRY;
            ob_increment_turn_order();
            // Good
            // increment turn order
            // ob_increment_turn_order -> if npc, let them take their full turn
        }
        else
        {
            console_log("[E] Player cannot end a turn when it's not their turn");
        }
        break;
    case OCEAN_BATTLE_FIRE_CANNONS:
        if (data_ocean_battle.victory)
        {
            console_log("[I] Battle already has a victory. Cannot fire cannons");
            break;
        }
        if (data_ocean_battle.attacked)
        {
            console_log("[I] Already attacked with boarding. Cannot attack again");
            break;
        }
        // TODO: Assume someone puts in invalid coords every time. Check.
        intended_x = data_ocean_battle.intended_cannon_coords[0];
        intended_y = data_ocean_battle.intended_cannon_coords[1];
        for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
        {
            if (
                storage_world_npc.data[i].position_x == intended_x
                &&
                storage_world_npc.data[i].position_y == intended_y
            )
            {
                u32 ship_id = storage_world_npc.data[i].entity_id;
                DATA_SHIP* ship = &storage_ship.data[ship_id];
                u32 damage = get_random_number(1, 20);
                if (damage > ship->durability)
                {
                    ship->durability = 0;
                }
                else
                {
                    ship->durability -= damage;
                }
                console_log("[I] Damage dealt");
                break;
            }
        }
        data_ocean_battle.attacked = true;
        console_log("[I] Cannon attack complete");
        ob_last_man_standing();
        break;
    case OCEAN_BATTLE_BOARD:
        if (data_ocean_battle.victory)
        {
            console_log("[I] Battle already has a victory. Cannot fire cannons");
            break;
        }
        if (data_ocean_battle.attacked)
        {
            console_log("[I] Already attacked with cannons. Cannot attack again");
            break;
        }
        // TODO: Assume someone puts in invalid coords every time. Check.
        intended_x = data_ocean_battle.intended_boarding_coords[0];
        intended_y = data_ocean_battle.intended_boarding_coords[1];
        for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
        {
            if (
                storage_world_npc.data[i].position_x == intended_x
                &&
                storage_world_npc.data[i].position_y == intended_y
            )
            {
                u32 ship_id = storage_world_npc.data[i].entity_id;
                DATA_SHIP* ship = &storage_ship.data[ship_id];
                u32 damage = get_random_number(1, 20);
                if (damage > ship->crew)
                {
                    ship->crew = 0;
                }
                else
                {
                    ship->crew -= damage;
                }
                console_log("[I] Damage dealt");
                break;
            }
        }
        data_ocean_battle.attacked = true;
        console_log("[I] Boarding complete");
        ob_last_man_standing();
        break;
    case OCEAN_BATTLE_MOVE:
        if (data_ocean_battle.victory)
        {
            console_log("[I] Battle already has a victory. Cannot fire cannons");
            break;
        }
        if (data_ocean_battle.moved)
        {
            console_log("[I] Already moved. Cannot move again.");
            break;
        }
        // TODO: Assume someone puts in invalid coords every time. Check.
        u32 wnpc_id = data_ocean_battle.turn_order_world_npcs[data_ocean_battle.turn_order];
        storage_world_npc.data[wnpc_id].position_x = data_ocean_battle.intended_move_coords[0];
        storage_world_npc.data[wnpc_id].position_y = data_ocean_battle.intended_move_coords[1];
        data_ocean_battle.moved = true;
        console_log("[I] Move completed");
        break;
    case OCEAN_BATTLE_RUN_NPC_TURN:
        if (data_ocean_battle.victory)
        {
            console_log("[I] Battle already has a victory. Cannot fire cannons");
        }
        if (data_ocean_battle.moved)
        {
            console_log("[I] Already moved. Cannot move again.");
        }
        else if (data_ocean_battle.total_valid_move_coords > 0)
        {
            u32 wnpc_id = data_ocean_battle.turn_order_world_npcs[data_ocean_battle.turn_order];
            storage_world_npc.data[wnpc_id].position_x = data_ocean_battle.intended_move_coords[0];
            storage_world_npc.data[wnpc_id].position_y = data_ocean_battle.intended_move_coords[1];
            data_ocean_battle.moved = true;
            console_log("[I] Move completed");
        }
        // Even NPCs need this check
        if (data_ocean_battle.attacked)
        {
            console_log("[I] Already moved. Cannot attack again.");
        }
        else
        {
            if (data_ocean_battle.total_valid_cannon_coords > 0)
            {
                // TODO: Assume someone puts in invalid coords every time. Check.
                u32 intended_x = data_ocean_battle.intended_cannon_coords[0];
                u32 intended_y = data_ocean_battle.intended_cannon_coords[1];
                if (intended_x != SENTRY)
                {
                    for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
                    {
                        if (
                            storage_world_npc.data[i].position_x == intended_x
                            &&
                            storage_world_npc.data[i].position_y == intended_y
                        )
                        {
                            u32 ship_id = storage_world_npc.data[i].entity_id;
                            DATA_SHIP* ship = &storage_ship.data[ship_id];
                            u32 damage = get_random_number(1, 20);
                            if (damage > ship->durability)
                            {
                                ship->durability = 0;
                            }
                            else
                            {
                                ship->durability -= damage;
                            }
                            console_log("[I] Damage dealt");
                            break;
                        }
                    }
                    data_ocean_battle.attacked = true;
                    console_log("[I] Cannon attack complete");
                }
            }
            else if (data_ocean_battle.total_valid_boarding_coords > 0)
            {
                // TODO: Assume someone puts in invalid coords every time. Check.
                intended_x = data_ocean_battle.intended_boarding_coords[0];
                intended_y = data_ocean_battle.intended_boarding_coords[1];
                if (intended_x != SENTRY)
                {
                    for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
                    {
                        if (
                            storage_world_npc.data[i].position_x == intended_x
                            &&
                            storage_world_npc.data[i].position_y == intended_y
                        )
                        {
                            u32 ship_id = storage_world_npc.data[i].entity_id;
                            DATA_SHIP* ship = &storage_ship.data[ship_id];
                            u32 damage = get_random_number(1, 20);
                            if (damage > ship->crew)
                            {
                                ship->crew = 0;
                            }
                            else
                            {
                                ship->crew -= damage;
                            }
                            console_log("[I] Damage dealt");
                            break;
                        }
                    }
                    data_ocean_battle.attacked = true;
                    console_log("[I] Cannon attack complete");
                }
            }
        }
        ob_last_man_standing();
        if (data_ocean_battle.victory == false)
        {
            ob_increment_turn_order();
        }
        break;
    case OCEAN_BATTLE_EXIT:
        // TODO: Maybe add a check that, if not in victory, peace out?
        console_log("[I] Ocean battle exit. Exiting scene.");
        Scene_Ocean_Battle.flag_confirmed = 1;
        Scene_Ocean_Battle.flag_initialized = 0;
        current.game_mode = Scene_Ocean_Battle.previous_game_mode;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        // Sometimes you need this but, in this scene, why?
        // Excluding for now
        break;
    }
    /*
        case POST_VICTORY_ACTIONS:
            if (!victory) { peace out }
            - add enemy ships to fleet
            - add cargo to existing ships (or re-shuffle cargo)
        case EXIT:
            if (!victory) { peace out }
            - possible to exit without doing any post victory actions
            - reset everything
    */
    console_log("[I] Did anything happen?");
    return SENTRY;
}

// -----------------------------------------------------------------------------
// - SINGLE DIALOG SCENE
// -----------------------------------------------------------------------------
u32 run_scene_single_dialog(u32 action, u32 scene_id, u32 scene_dialog_id)
{
    if (Scene_Single_Dialog.flag_initialized == 0)
    {
        console_log("[I] Setting up single dialog scene");
        current.scene = scene_id;
        Scene_Single_Dialog.id = scene_id;
        Scene_Single_Dialog.dialog_id = scene_dialog_id;
        Scene_Single_Dialog.flag_initialized = 1;
        Scene_Single_Dialog.flag_confirmed = 0;
        Scene_Single_Dialog.previous_game_mode = current.game_mode;
        current.updated_state = UPDATED_STATE_SCENE;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != Scene_Single_Dialog.id
    )
    {
        console_log("[E] Already in scene and it's not this one");
        return SENTRY;
    }
    // If the action is "confirm" && we're not confirmed
    // then confirm and clear the scene
    if (
        action == ACTION_CONFIRM
        &&
        Scene_Single_Dialog.flag_confirmed == 0
    )
    {
        console_log("[I] Single dialog scene confirmation. Exiting scene.");
        Scene_Single_Dialog.flag_confirmed = 1;
        Scene_Single_Dialog.flag_initialized = 0;
        current.game_mode = Scene_Single_Dialog.previous_game_mode;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        // Sometimes you need this but, in this scene, why?
        // Excluding for now
        return SENTRY;
    }
    else if (action != ACTION)
    {
        console_log("[E] Invalid action for this scene");
    }
    // Otherwise return the dialogue id (machine_name)
    return Scene_Single_Dialog.dialog_id;
}
u32 scene_npc_rvice(u32 action)
{
    return run_scene_single_dialog(
        action,
        SCENE_NPC_RVICE,
        DIALOG_NPC_RVICE
    );
}
u32 scene_npc_lafolie(u32 action)
{
    return run_scene_single_dialog(
        action,
        SCENE_NPC_LAFOLIE,
        DIALOG_NPC_LAFOLIE
    );
}
u32 scene_npc_nakor(u32 action)
{
    return run_scene_single_dialog(
        action,
        SCENE_NPC_NAKOR,
        DIALOG_NPC_NAKOR
    );
}
u32 scene_npc_travis(u32 action)
{
    return run_scene_single_dialog(
        action,
        SCENE_NPC_TRAVIS,
        DIALOG_NPC_TRAVIS
    );
}
u32 scene_npc_loller(u32 action)
{
    return run_scene_single_dialog(
        action,
        SCENE_NPC_LOLLER,
        DIALOG_NPC_LOLLER
    );
}


// -----------------------------------------------------------------------------
// - BANK SCENE
// -----------------------------------------------------------------------------
u32 scene_bank(u32 action)
{
    if (Scene_Bank.flag_initialized == 0)
    {
        console_log("[I] Setting up bank scene");
        current.scene = SCENE_BANK;
        bank.deposit_interest_rate = 7;
        bank.loan_interest_rate = 20;
        Scene_Bank.id = SCENE_BANK;
        Scene_Bank.dialog_id = DIALOG_BANK_WELCOME;
        Scene_Bank.flag_initialized = 1;
        Scene_Bank.previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != Scene_Bank.id
    )
    {
        console_log("[E] Already in scene and it's not this one");
        return SENTRY;
    }
    Scene_Bank.error_code = SENTRY;
    switch (action)
    {
    case ACTION_BANK_DEPOSIT:
        if (bank.to_deposit == 0)
        {
            console_log("[E] Need to deposit more than 0 gold");
            Scene_Bank.error_code = ERROR_BANK_NOT_ENOUGH_DEPOSIT;
        }
        else if (bank.to_deposit > get_player_gold(0))
        {
            console_log("[E] Player doesn't have enough gold to deposit");
            Scene_Bank.error_code = ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD;
        }
        else
        {
            console_log("[I] Depositing gold to bank");
            subtract_player_gold(0, bank.to_deposit);
            bank.deposit_amount += bank.to_deposit;
            Scene_Bank.dialog_id = ACTION_BANK_DEPOSIT_SUCCESS;
        }
        break;
    case ACTION_BANK_WITHDRAW:
        if (bank.to_withdraw == 0)
        {
            console_log("[E] Need to withdraw more than 0 gold");
            Scene_Bank.error_code = ERROR_BANK_NOT_ENOUGH_WITHDRAW;
        }
        else if (bank.to_withdraw > bank.deposit_amount)
        {
            console_log("[E] Cannot withdraw more than current account");
            Scene_Bank.error_code = ERROR_BANK_WITHDRAW_MORE_THAN_DEPOSIT;
        }
        else
        {
            console_log("[I] Withdrawing gold from bank");
            bank.deposit_amount -= bank.to_withdraw;
            Scene_Bank.dialog_id = ACTION_BANK_WITHDRAW_SUCCESS;
        }
        break;
    case ACTION_BANK_TAKE_LOAN:
        if (bank.loan_amount > 0)
        {
            console_log("[E] Must first pay off existing loan");
            Scene_Bank.error_code = ERROR_BANK_PAY_EXISTING_LOAN_FIRST;
        }
        else if (bank.to_loan == 0)
        {
            console_log("[E] Need to loan more than 0 gold");
            Scene_Bank.error_code = ERROR_BANK_NOT_ENOUGH_LOAN;
        }
        else if (bank.to_loan > 10000)
        {
            console_log("[E] Cannot loan this amount");
            Scene_Bank.error_code = ERROR_BANK_TOO_MUCH_LOAN;
        }
        else
        {
            console_log("[I] Loaning gold from bank");
            bank.loan_amount = bank.to_loan;
            add_player_gold(0, bank.to_loan);
            Scene_Bank.dialog_id = ACTION_BANK_TAKE_LOAN_SUCCESS;
        }
        break;
    case ACTION_BANK_PAY_LOAN:
        if (bank.loan_amount == 0)
        {
            console_log("[E] No loan from bank");
            Scene_Bank.error_code = ERROR_BANK_NO_LOAN;
        }
        else if (bank.to_pay_loan == 0)
        {
            console_log("[E] Cannot pay loan with 0 gold");
            Scene_Bank.error_code = ERROR_BANK_PAY_LOAN_NOT_ENOUGH;
        }
        else if (bank.to_pay_loan > get_player_gold(0))
        {
            console_log("[E] Not enough player gold to pay loan");
            Scene_Bank.error_code = ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD;
        }
        else if (bank.to_pay_loan > bank.loan_amount)
        {
            console_log("[E] Cannot pay more than the loan amount");
            Scene_Bank.error_code = ERROR_BANK_PAY_LOAN_MORE_THAN_LOAN;
        }
        else
        {
            bank.loan_amount -= bank.to_pay_loan;
            subtract_player_gold(0, bank.to_pay_loan);
            Scene_Bank.dialog_id = ACTION_BANK_PAY_LOAN_SUCCESS;
        }
        break;
    case ACTION_EXIT:
        console_log("[I] Exiting bank scene");
        Scene_Bank.flag_initialized = 0;
        current.game_mode = Scene_Bank.previous_game_mode;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        break;
    }
    return SENTRY;
}

// -----------------------------------------------------------------------------
// - SHIPYARD SCENE
// -----------------------------------------------------------------------------
u32 scene_shipyard(u32 action)
{
    if (Scene_Shipyard.flag_initialized == 0)
    {
        console_log("[I] Setting up shipyard scene");
        current.scene = SCENE_SHIPYARD;
        Scene_Shipyard.id = SCENE_SHIPYARD;
        Scene_Shipyard.dialog_id = DIALOG_SHIPYARD_WELCOME;
        Scene_Shipyard.flag_initialized = 1;
        Scene_Shipyard.previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != Scene_Shipyard.id
    )
    {
        console_log("[E] Already in scene and it's not this one");
        return SENTRY;
    }
    DATA_SHIP* ship;
    DATA_SHIP_MATERIAL* material;
    Scene_Shipyard.error_code = SENTRY;
    u32 total_space;
    if (
        (
            ACTION_SHIPYARD_REMODEL_SHIP
            ||
            ACTION_SHIPYARD_REMODEL_SHIP_MATERIAL
            ||
            ACTION_SHIPYARD_REMODEL_SHIP_FIGUREHEAD
            ||
            ACTION_SHIPYARD_REMODEL_SHIP_CANNON_TYPE
            ||
            ACTION_SHIPYARD_REMODEL_SHIP_SPACE
        )
        &&
        Scene_Shipyard.remodel_ship_id == SENTRY
    )
    {
        console_log("[E] No ship selected to remodel");
        Scene_Shipyard.error_code = ERROR_SHIPYARD_NO_SHIP_SELECTED;
        return SENTRY;
    }
    switch (action)
    {
    case ACTION_SHIPYARD_BUY_USED:
        if (Scene_Shipyard.buying_prefab_ship_id == SENTRY)
        {
            console_log("[E] No ship selected to buy");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_NO_SHIP_SELECTED;
            break;
        }
        if (Scene_Shipyard.ships_prefab[Scene_Shipyard.buying_prefab_ship_id] == SENTRY)
        {
            console_log("[E] No ship in prefab slot");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_EMPTY_PREFAB_SLOT;
            break;
        }
        ship = &storage_ship.data[Scene_Shipyard.buying_prefab_ship_id];
        if (ship->price > get_player_gold(0))
        {
            console_log("[E] Not enough gold to buy ship");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_NOT_ENOUGH_GOLD;
            break;
        }
        // Player is always first captain
        DATA_CAPTAIN* captain = &storage_captain.data[0];
        DATA_FLEET* fleet = &storage_fleet.data[captain->general_of_fleet_id];
        if (fleet->total_ships >= (MAX_FLEET_SHIPS - 1))
        {
            console_log("[E] Fleet is full. Cannot add ship");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_FLEET_FULL;
            break;
        }
        else
        {
            subtract_player_gold(0, ship->price);
            u32 ship_id = Scene_Shipyard.ships_prefab[
                Scene_Shipyard.buying_prefab_ship_id
            ];
            DATA_SHIP* prefab_ship = &storage_ship.data[ship_id];
            u32 fleet_ship_id = initialize_fleet_ship(
                prefab_ship->name_id,
                ship_id
            );
            add_fleet_ship_to_fleet(
                fleet_ship_id,
                captain->general_of_fleet_id
            );
            Scene_Shipyard.ships_prefab[Scene_Shipyard.buying_prefab_ship_id] = SENTRY;
            Scene_Shipyard.dialog_id = DIALOG_SHIPYARD_PREFAB_PURCHASE_SUCCESS;
            console_log("[I] Bought ship");
        }
        break;
    case ACTION_SHIPYARD_REMODEL_SHIP_MATERIAL:
        ship = get_data_ship(Scene_Shipyard.remodel_ship_id);
        Remodel_Ship.material_price = 0;
        if (Remodel_Ship.material_id != ship->material_id)
        {
            material = get_data_ship_material(Remodel_Ship.material_id);
            Remodel_Ship.material_price = Scene_Shipyard.remodel_material_price;
            Remodel_Ship.capacity = material->mod_capacity;
            Remodel_Ship.tacking = material->mod_tacking;
            Remodel_Ship.power = material->mod_power;
            Remodel_Ship.speed = material->mod_speed;
            Remodel_Ship.durability = material->mod_durability;
        }
        else
        {
            Remodel_Ship.capacity = 0;
            Remodel_Ship.tacking = 0;
            Remodel_Ship.power = 0;
            Remodel_Ship.speed = 0;
            Remodel_Ship.durability = 0;
        }
        Scene_Shipyard.error_code = SENTRY;
        calculate_remodel_ship();
        break;
    case ACTION_SHIPYARD_REMODEL_SHIP_FIGUREHEAD:
        ship = get_data_ship(Scene_Shipyard.remodel_ship_id);
        Remodel_Ship.figurehead_price = 0;
        if (Remodel_Ship.figurehead_id != ship->figurehead_id)
        {
            Remodel_Ship.figurehead_price = Scene_Shipyard.remodel_figurehead_price;
            // TODO: Plus the actual cost of the figurehead too
        }
        Scene_Shipyard.error_code = SENTRY;
        calculate_remodel_ship();
        break;
    case ACTION_SHIPYARD_REMODEL_SHIP_CANNON_TYPE:
        ship = get_data_ship(Scene_Shipyard.remodel_ship_id);
        Remodel_Ship.cannon_price = 0;
        if (Remodel_Ship.cannon_type_id != ship->cannon_type_id)
        {
            Remodel_Ship.cannon_type_id = Scene_Shipyard.remodel_cannon_price;
            // TODO: Plus the actual cost of the cannons too * cannon_space
        }
        Scene_Shipyard.error_code = SENTRY;
        calculate_remodel_ship();
        break;
    case ACTION_SHIPYARD_REMODEL_SHIP_SPACE:
        if (
            Remodel_Ship.crew_space == 0
            &&
            Remodel_Ship.cargo_space == 0
            &&
            Remodel_Ship.cannon_space == 0
        )
        {
            console_log("[E] No space adjustment to remodel with");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_NO_SPACE_REMODEL_VALUES;
            break;
        }
        ship = get_data_ship(Scene_Shipyard.remodel_ship_id);
        total_space = 0;
        total_space += Remodel_Ship.crew_space;
        total_space += Remodel_Ship.cargo_space;
        total_space += Remodel_Ship.cannon_space;
        if (
            Remodel_Ship.capacity > 0
            &&
            Remodel_Ship.capacity != SENTRY
            &&
            total_space > Remodel_Ship.capacity
        )
        {
            console_log("[E] Remodel space greater than remodel capacity");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_REMODEL_SPACE_GREATER_THAN_REMODEL_CAPACITY;
            break;
        }
        else if (total_space > ship->capacity)
        {
            console_log("[E] Remodel space greater than ship capacity");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_REMODEL_SPACE_GREATER_THAN_SHIP_CAPACITY;
            break;
        }
        else
        {
            console_log("[I] Remodel space should work out");
            // TODO: if Remodel_Ship.crew_space < ship.crew_space
            //       "Will have to dismiss of crew"
            // TODO: if Remodel_Ship.cargo_space < ship.cargo_space
            //       "Will have to sell cargo at a loss"
            //       OR
            //       Calculate cost of cargo at current port prices and knock
            //       off the difference from remodel space cost

            Scene_Shipyard.error_code = SENTRY;
        }
        break;
    case ACTION_SHIPYARD_REMODEL_SHIP:
        if (Remodel_Ship.total_price > get_player_gold(0))
        {
            console_log("[E] Not enough gold to remodel ship");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_NOT_ENOUGH_GOLD;
            break;
        }
        total_space = 0;
        if (Remodel_Ship.crew_space > 0 && Remodel_Ship.crew_space != SENTRY)
        {
            total_space += Remodel_Ship.crew_space;
        }
        if (Remodel_Ship.cannon_space > 0 && Remodel_Ship.cannon_space != SENTRY)
        {
            total_space += Remodel_Ship.cannon_space;
        }
        if (Remodel_Ship.cargo_space > 0 && Remodel_Ship.cargo_space != SENTRY)
        {
            total_space += Remodel_Ship.cargo_space;
        }
        bool remodel_has_capacity = (
            Remodel_Ship.capacity > 0 && Remodel_Ship.capacity != SENTRY
        );
        if (
            (
                remodel_has_capacity
                &&
                total_space > Remodel_Ship.capacity
            )
            ||
            (
                !remodel_has_capacity
                &&
                total_space > ship->capacity
            )
        )
        {
            console_log("[E] Not enough capacity for remodel");
            Scene_Shipyard.error_code = ERROR_SHIPYARD_REMODEL_SPACE_GREATER_THAN_SHIP_CAPACITY;
            break;
        }
        ship = get_data_ship(Scene_Shipyard.remodel_ship_id);
        if (
            Remodel_Ship.material_id != SENTRY
            &&
            ship->material_id != Remodel_Ship.material_id
        )
        {
            material = get_data_ship_material(ship->material_id);
            ship->power -= material->mod_power;
            ship->capacity -= material->mod_capacity;
            ship->tacking -= material->mod_tacking;
            ship->speed -= material->mod_speed;
            ship->durability -= material->mod_durability;

            ship->material_id = Remodel_Ship.material_id;
            material = get_data_ship_material(Remodel_Ship.material_id);
            ship->power += material->mod_power;
            ship->capacity += material->mod_capacity;
            ship->tacking += material->mod_tacking;
            ship->speed += material->mod_speed;
            ship->durability += material->mod_durability;
        }
        if (
            Remodel_Ship.crew_space != SENTRY
            &&
            ship->crew_space != Remodel_Ship.crew_space
        )
        {
            ship->crew_space = Remodel_Ship.crew_space;
        }
        if (
            Remodel_Ship.cannon_space != SENTRY
            &&
            ship->cannon_space != Remodel_Ship.cannon_space
        )
        {
            ship->cannon_space = Remodel_Ship.cannon_space;
        }
        if (
            Remodel_Ship.cargo_space != SENTRY
            &&
            ship->cargo_space != Remodel_Ship.cargo_space
        )
        {
            ship->cargo_space = Remodel_Ship.cargo_space;
        }
        if (
            Remodel_Ship.cannon_type_id != SENTRY
            &&
            ship->cannon_type_id != Remodel_Ship.cannon_type_id
        )
        {
            ship->cannon_type_id = Remodel_Ship.cannon_type_id;
        }
        if (
            Remodel_Ship.figurehead_id != SENTRY
            &&
            ship->figurehead_id != Remodel_Ship.figurehead_id
        )
        {
            ship->figurehead_id = Remodel_Ship.figurehead_id;
        }
        Scene_Shipyard.error_code = SENTRY;
        subtract_player_gold(0, Remodel_Ship.total_price);
        clear_remodel_ship();
        Scene_Shipyard.dialog_id = DIALOG_SHIPYARD_REMODEL_SUCCESS;
        break;
    case ACTION_EXIT:
        console_log("[I] Exiting shipyard scene");
        Scene_Shipyard.flag_initialized = 0;
        Scene_Shipyard.buying_prefab_ship_id = SENTRY;
        Scene_Shipyard.remodel_space_price = SENTRY;
        Scene_Shipyard.remodel_material_price = SENTRY;
        Scene_Shipyard.remodel_cannon_price = SENTRY;
        Scene_Shipyard.remodel_figurehead_price = SENTRY;
        clear_remodel_ship();
        current.game_mode = Scene_Shipyard.previous_game_mode;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        break;
    }
    // New Ship
    // - Type of ship
    // -- Filtered by location & port & investment
    // -- Choose Hull
    // --- List of available hulls for type of ship
    // -- Choose Capacity
    // --- Cargo
    // --- Cannons
    // --- Crew
    // -- Choose cannon type
    // --- List of cannon types for type of ship X space for cannons
    // SELL SHIP
    // INVEST
    // REPAID

    return SENTRY;
}


// -----------------------------------------------------------------------------
// - DOCKYARD SCENE
// -----------------------------------------------------------------------------
u32 scene_dockyard(u32 action)
{
    if (Scene_Dockyard.flag_initialized == 0)
    {
        console_log("[I] Setting up dockyard scene");
        current.scene = SCENE_DOCKYARD;
        Scene_Dockyard.id = SCENE_DOCKYARD;
        Scene_Dockyard.dialog_id = DIALOG_DOCKYARD_WELCOME;
        Scene_Dockyard.flag_initialized = 1;
        Scene_Dockyard.previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != Scene_Dockyard.id
    )
    {
        console_log("[E] Already in scene and it's not this one");
        return SENTRY;
    }
    switch (action)
    {
    case ACTION_DOCKYARD_PURCHASE:
        if (get_player_gold(0) == 0)
        {
            console_log("[E] Player has zero gold");
            Scene_Dockyard.error_code = ERROR_DOCKYARD_NOT_ENOUGH_GOLD;
            break;
        }
        u32 goods_total = 0;
        goods_total += Scene_Dockyard.purchase_water;
        goods_total += Scene_Dockyard.purchase_food;
        goods_total += Scene_Dockyard.purchase_cannonballs;
        if (goods_total > get_ship_available_cargo_space(Scene_Dockyard.purchase_for_ship_id))
        {
            console_log("[E] Ship does not have enough cargo space for goods");
            Scene_Dockyard.error_code = ERROR_DOCKYARD_SHIP_NOT_ENOUGH_CARGO_SPACE;
            break;
        }
        u32 price_total = 0;
        price_total += Scene_Dockyard.purchase_water * Scene_Dockyard.price_water;
        price_total += Scene_Dockyard.purchase_food * Scene_Dockyard.price_food;
        price_total += Scene_Dockyard.purchase_cannonballs * Scene_Dockyard.price_cannonballs;
        if (price_total > get_player_gold(0))
        {
            console_log("[E] Not enough gold for this purchase");
            Scene_Dockyard.error_code = ERROR_DOCKYARD_NOT_ENOUGH_GOLD;
            break;
        }
        subtract_player_gold(0, price_total);
        add_food_to_ship(Scene_Dockyard.purchase_food, Scene_Dockyard.purchase_for_ship_id);
        add_water_to_ship(Scene_Dockyard.purchase_water, Scene_Dockyard.purchase_for_ship_id);
        add_cannonballs_to_ship(Scene_Dockyard.purchase_cannonballs, Scene_Dockyard.purchase_for_ship_id);
        Scene_Dockyard.dialog_id = DIALOG_DOCKYARD_SUPPLIES_LOADED;
        break;
    case ACTION_DOCKYARD_SET_SAIL:
        // TODO: Check for food/water/crew and make sure you can sail
        console_log("[I] Exiting dockyard scene");
        Scene_Dockyard.flag_initialized = 0;
        clear_scene_dockyard();
        current.game_mode = Scene_Dockyard.previous_game_mode;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        generate_world(WORLD_GLOBE_1);
        break;
    case ACTION_EXIT:
        console_log("[I] Exiting dockyard scene");
        Scene_Dockyard.flag_initialized = 0;
        clear_scene_dockyard();
        current.game_mode = Scene_Dockyard.previous_game_mode;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        break;
    }
    return SENTRY;
}

u32 scene_innkeeper(u32 action)
{
    // Welcome to my Inn. Would you like a room?
    // yes or no
    // That will be X gold? Are you sure?
    // What time do you want to wake up?
    // - Pick a time in 12h format (AM/PM)
    // Make sure you have enough gold
    // I'll show you to your room
    // Black screen & music
    // Wake up in building at said time

    return SENTRY;
}

u32 scene_blacksmith(u32 action)
{
    // Weapons & Armor
    // hello, welcome
    // Buy
    // - just like general shop. show items, receive input for which item you want to buy
    // - are you sure? do you have enough gold?
    // - add to inventory if confirmed
    // Sell
    // - pick item from player inventory
    // - are you sure you want to sell?
    // - sell
    // - if armor/weapon is currently equipped, clear it out, not equipped anymore, warn before doing that too I guess

    return SENTRY;
}


// -----------------------------------------------------------------------------
// - GOODS SHOP SCENE
// -----------------------------------------------------------------------------
u32 scene_goods_shop(u32 action)
{
    if (Scene_Goods_Shop.flag_initialized == 0)
    {
        console_log("[I] Setting up goods shop scene");
        current.scene = SCENE_GOODS_SHOP;
        Scene_Goods_Shop.id = SCENE_GOODS_SHOP;
        Scene_Goods_Shop.dialog_id = DIALOG_GOODS_SHOP_WELCOME;
        Scene_Goods_Shop.flag_initialized = 1;
        Scene_Goods_Shop.previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != Scene_Goods_Shop.id
    )
    {
        console_log("[E] Already in scene and it's not this one");
        return SENTRY;
    }
    switch (action)
    {
    case ACTION_EXIT:
        console_log("[I] Exiting goods shop scene");
        Scene_Goods_Shop.flag_initialized = 0;
        Scene_Goods_Shop.inventory_id = SENTRY;
        current.game_mode = Scene_Goods_Shop.previous_game_mode;
        Scene_Goods_Shop.previous_game_mode = SENTRY;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        break;
    }
    return SENTRY;
    /*
    switch (action)
        case ACTION_BUY_GOODS:
            if (!not enough player gold) { error }
            if (!not enough cargo space) { error }
            - which goods
            - how many of each
            - which ships to distribute goods to
            - subtract gold from player
            - add goods to ship cargo
        case ACTION_SELL_GOODS:
            if (!cargo in fleet) { error }
            - which goods, from which ship, how many
            - remove goods from ship
            - add gold to player
        case ACTION_INVEST:
            if (!not enough player gold) { error }
            - add to investment amount for trade
            - sphere of influence?
            - subtract from player
    */

    return SENTRY;
}


// -----------------------------------------------------------------------------
// - GUILD SCENE
// -----------------------------------------------------------------------------
u32 scene_guild(u32 action)
{
    // TODO: Guilds? Tasks with reputation and guild memberships?
    // guild quests have this structure
    // name_of_quest
    // flags [up to some arbitrary max_quest_flags number]
    // active (bool)
    // if quest == active && some arbitrary condition is met, flags updated
    // quest flags can be anything like talking to an npc, traveling somewhere, exploring something, etc...
    // you essentially have to call a "set_quest_flag(u32 quest_id, u32 flag, u32 value)" function at certain points in the game
    // completion of quests need to run a special function for each quest (or a default one) where certain victory things are handed out like gold, stat boosts, etc...

    return SENTRY;
}


// -----------------------------------------------------------------------------
// - CAFE SCENE
// -----------------------------------------------------------------------------
u32 scene_cafe(u32 action)
{
    // TODO: Cafe -> buy drinks, flirt with waitress, captains, gossip, blackjack
    // Buy a round of drinks
    // - drinks cost X gold each. how many?
    // - choose how many
    // - YAY people cheer
    // - "X people want to join your crew, how many will you take?"
    // - choose how many
    // - assign to ship(s)
    // Flirt
    // - "Hey handsome, whatcha want?" (based on reputation perhaps)
    // - give gift
    // - ask for information
    // - buy drink
    // -- Maybe a singular reputation between you and her
    // to hire a captain, they have to be in the cafe (or wherever), go talk to them
    // - if reputation is high enough
    // -- "Hey I'm so and so, I'm a captain, I'm a pirate" or whatever and then "I could be persuaded to join a crew for the right price"
    // -- offer a price
    // -- "Too low" or "Sure, sounds good"
    // -- captain joins your fleet and you gotta pay them per month

    return SENTRY;
}


// -----------------------------------------------------------------------------
// - TEST SCENE
// -----------------------------------------------------------------------------
u32 scene_test(u32 action)
{
    if (Scene_Test.flag_initialized == 0)
    {
        console_log("[I] Setting up test scene");
        current.scene = SCENE_TEST;
        Scene_Test.id = SCENE_TEST;
        Scene_Test.dialog_id = DIALOG_TEST_ONE;
        Scene_Test.flag_initialized = 1;
        Scene_Test.previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_SCENE;
    }
    if (
        current.scene != SENTRY
        &&
        current.scene != Scene_Test.id
    )
    {
        console_log("[E] Already in scene and it's not this one");
        return SENTRY;
    }
    switch (action)
    {
    case ACTION_CONFIRM:
        console_log("[I] Confirming test scene");
        if (Scene_Test.dialog_id == DIALOG_TEST_ONE)
        {
            Scene_Test.dialog_id = DIALOG_TEST_TWO;
            move_player_right(0);
            move_world_npc_right(2);
        }
        else if (Scene_Test.dialog_id == DIALOG_TEST_TWO)
        {
            Scene_Test.dialog_id = DIALOG_TEST_THREE;
            move_player_down(0);
        }
        else if (Scene_Test.dialog_id == DIALOG_TEST_THREE)
        {
            // DONE!
            console_log("[E] Test scene complete");
            Scene_Test.dialog_id = SENTRY;
            scene_test(ACTION_EXIT);
        }
        break;
    case ACTION_EXIT:
        console_log("[I] Exiting test scene");
        Scene_Test.flag_initialized = 0;
        current.game_mode = Scene_Test.previous_game_mode;
        Scene_Test.previous_game_mode = SENTRY;
        current.scene = SENTRY;
        current.updated_state = UPDATED_STATE_SCENE;
        break;
    }
    return SENTRY;
}