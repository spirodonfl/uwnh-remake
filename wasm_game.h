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
#define SENTRY UINT32_MAX
__attribute__((visibility("default")))
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
        for (u32 i = 0; i < MAX_COUNT; ++i) \
        { \
            if (storage_##LOWERSCORE.used[i] == true) \
            { \
                storage_##LOWERSCORE##_used_slots[usi] = i; \
            } \
            else \
            { \
                storage_##LOWERSCORE##_used_slots[usi] = SENTRY; \
            } \
            ++usi; \
        } \
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
    void free_storage_##LOWERSCORE##_slot(u32 id) \
    { \
        if (storage_##LOWERSCORE.used[id] == true) \
        { \
            storage_##LOWERSCORE.used[id] = false; \
            storage_##LOWERSCORE.next_open_slot = id; \
            --storage_##LOWERSCORE.count; \
        } \
        update_storage_##LOWERSCORE##_used_slots(); \
    }

#define ADD_STORAGE_FUNC(LOWERSCORE, UPPERSCORE) \
    void add_storage_##LOWERSCORE(UPPERSCORE* source, bool force_clear) \
    { \
        u32 new_id = pull_storage_##LOWERSCORE##_next_open_slot(); \
        assign_storage_##LOWERSCORE(new_id, source); \
        if (force_clear) \
        { \
            CLEAR_STRUCT(source, SENTRY); \
        } \
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
#define MAX_WEAPONS 100
#define MAX_ARMORS 100
#define MAX_GENERAL_ITEMS 100
#define MAX_SPECIAL_ITEMS 100
#define MAX_STRINGS 1000
#define MAX_STRING_LENGTH 2048
#define MAX_BANKS 100
#define MAX_INVENTORIES 100
#define MAX_PORTS 100
#define MAX_STATS 100
#define MAX_SKILLS 100
#define MAX_ENTITIES 100
#define MAX_FLEETS 100
#define MAX_FLEET_SHIPS 100
#define MAX_FLEET_CAPTAINS 100
#define MAX_CANNONS 100
#define MAX_FIGUREHEADS 100
#define MAX_WORLDS 100
u32 get_max_worlds() { return MAX_WORLDS; }
#define MAX_LAYERS 10
#define MAX_WORLD_NPCS 1000
#define MAX_WORLD_ENTITIES 10
#define MAX_SHIPS 100
#define MAX_SHIP_MATERIALS 100
#define MAX_BASE_SHIPS 100
#define MAX_INVENTORY_ITEMS 100
#define MAX_CAPTAINS 100
#define MAX_SCENE_DATA_SIZE 1000
#define MAX_SCENE_CHOICES 10
#define MAX_SCENE_STATES 100
#define MAX_SCENE_STRINGS 100
#define MAX_GLOBAL_ENTITIES 10
#define MAX_GOODS 100
#define MAX_OCEAN_BATTLE_MOVES 10000
#define MAX_WORLD_WIDTH 50
#define MAX_WORLD_HEIGHT 50
#define MAX_LAYER_SIZE (MAX_WORLD_WIDTH * MAX_WORLD_HEIGHT)

// -----------------------------------------------------------------------------
// FORWARD DECLARATIONS
// -----------------------------------------------------------------------------
u32 get_player_npc_id(u32 player_id);
void set_which_player_you_are(u32 player_id);
u32 which_player_are_you = SENTRY;

void move_player_left(u32 player_id);
void move_player_right(u32 player_id);
void move_player_up(u32 player_id);
void move_player_down(u32 player_id);

void handle_input(u32 input);

u32 get_player_in_world(u32 player_id);
u32 get_player_in_world_x(u32 player_id);
u32 get_player_in_world_y(u32 player_id);

u32 scene_blackjack(u32 action);
u32 scene_general_shop(u32 action);
u32 scene_ocean_battle(u32 action);
u32 scene_npc_rvice(u32 action);
u32 scene_npc_lafolie(u32 action);
u32 scene_npc_nakor(u32 action);
u32 scene_npc_travis(u32 action);
u32 scene_npc_loller(u32 action);
u32 scene_bank(u32 action);

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
// TODO: Yearly interest rates (or something like that)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    // TODO: Why not type_id ??
    u32 type;
    u32 name_id;
} DATA_NPC;
/** EXPORT TO JS **/
u32 storage_npc_used_slots[MAX_NPCS];
u32* get_storage_npc_used_slots_ptr()
{ return (u32*)&storage_npc_used_slots[0]; }
STORAGE_STRUCT(npc, DATA_NPC, data_npc, MAX_NPCS)
FIND_STORAGE_BY_NAME_ID_FUNC(npc, DATA_NPC, MAX_NPCS)

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

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 top_material_id;
    u32 base_price;
    u32 max_capacity;
    u32 tacking;
    u32 power;
    u32 speed;
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
}
ADD_STORAGE_FUNC(ship_material, DATA_SHIP_MATERIAL)

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
    for (u32 i = 0; i < MAX_LAYERS; ++i) {
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
} DATA_CAPTAIN;
/** EXPORT TO JS **/
u32 storage_captain_used_slots[MAX_CAPTAINS];
u32* get_storage_captain_used_slots_ptr()
{ return (u32*)&storage_captain_used_slots[0]; }
STORAGE_STRUCT(captain, DATA_CAPTAIN, data_captain, MAX_CAPTAINS)
FIND_STORAGE_BY_NAME_ID_FUNC(captain, DATA_CAPTAIN, MAX_CAPTAINS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    // NOTE: You had this as a bool but it caused alignment issues in JS
    // TODO: Don't use bool yet
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
    // TODO: Actually use this when adding items to inventory
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
    u32 ships_prefab[10];
    // Note: references DATA_NEW_SHIP storage
    u32 new_ship;
    u32 to_invest;
} DATA_SCENE_SHIPYARD;
DATA_SCENE_SHIPYARD Scene_Shipyard;
u32* get_data_scene_shipyard_ptr()
{ return (u32*)&Scene_Shipyard; }

// NOTE: SPECIFICALLY for shipyard scene for remodeling
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 material_id;
    u32 cargo;
    u32 cannons;
    u32 crew;
    u32 cannon_type_id;
    u32 figurehead_id;
} DATA_REMODEL_SHIP;
DATA_REMODEL_SHIP Remodel_Ship;
u32* get_data_remodel_ship_ptr()
{ return (u32*)&Remodel_Ship; }

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
} DATA_STATS;
/** EXPORT TO JS **/
u32 storage_stats_used_slots[MAX_STATS];
u32* get_storage_stats_used_slots_ptr()
{ return (u32*)&storage_stats_used_slots[0]; }
STORAGE_STRUCT(stats, DATA_STATS, data_stats, MAX_STATS)
FIND_STORAGE_BY_NAME_ID_FUNC(stats, DATA_STATS, MAX_STATS)

/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 id;
    u32 name_id;
    u32 stats_requirements;
} DATA_SKILL;
/** EXPORT TO JS **/
u32 storage_skill_used_slots[MAX_SKILLS];
u32* get_storage_skill_used_slots_ptr()
{ return (u32*)&storage_skill_used_slots[0]; }
STORAGE_STRUCT(skill, DATA_SKILL, data_skill, MAX_SKILLS)
FIND_STORAGE_BY_NAME_ID_FUNC(skill, DATA_SKILL, MAX_SKILLS)

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
    for (u32 i = 0; i < MAX_FLEET_SHIPS; ++i) {
        storage_fleet.data[id].ship_ids[i] = source->ship_ids[i];
    }
    for (u32 i = 0; i < MAX_FLEET_CAPTAINS; ++i) {
        storage_fleet.data[id].captain_ids[i] = source->captain_ids[i];
    }
}
ADD_STORAGE_FUNC(fleet, DATA_FLEET)
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
        break;
    }
    return added;
}

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

    // Dialogs
    DIALOG_NPC_RVICE, DIALOG_NPC_LAFOLIE, DIALOG_NPC_NAKOR,
    DIALOG_NPC_TRAVIS, DIALOG_NPC_LOLLER,
    DIALOG_BLACKJACK_WELCOME,
    DIALOG_BANK_WELCOME,

    // Scenes
    SCENE_BLACKJACK, SCENE_GENERAL_SHOP, SCENE_DOCKYARD, SCENE_OCEAN_BATTLE,
    SCENE_BANK, SCENE_NPC_RVICE, SCENE_NPC_LAFOLIE, SCENE_NPC_NAKOR,
    SCENE_NPC_TRAVIS, SCENE_NPC_LOLLER,

    // Inventories
    INVENTORY_ATHENS_GENERAL_SHOP, INVENTORY_PLAYER_ONES_INVENTORY,
    INVENTORY_PLAYER_TWOS_INVENTORY, INVENTORY_PLAYER_THREES_INVENTORY,
    INVENTORY_PLAYER_FOURS_INVENTORY, INVENTORY_PLAYER_FIVES_INVENTORY,
    INVENTORY_NPC_RVICE, INVENTORY_NPC_LAFOLIE, INVENTORY_NPC_NAKOR,
    INVENTORY_NPC_TRAVIS,

    // Inventory Types
    INVENTORY_TYPE_GOOD, INVENTORY_TYPE_ARMOR, INVENTORY_TYPE_WEAPON,
    INVENTORY_TYPE_GENERAL_ITEM, INVENTORY_TYPE_CANNON,
    INVENTORY_TYPE_BASE_SHIP, INVENTORY_TYPE_SHIP,

    // Items
    ITEM_TELESCOPE, ITEM_QUADRANT, ITEM_THEODOLITE, ITEM_SEXTANT,

    // Layers
    LAYER_BACKGROUND, LAYER_NPC, LAYER_ENTITY, LAYER_ONE, LAYER_TWO, LAYER_BLOCK,

    // NPCs
    NPC_TRAVIS, NPC_LAFOLIE, NPC_LOLLER, NPC_NAKOR, NPC_RVICE,
    NPC_BANK_TELLER, NPC_PLAYER_ONE, NPC_PLAYER_TWO, NPC_PLAYER_THREE,
    NPC_PLAYER_FOUR, NPC_PLAYER_FIVE,
    NPC_GENERAL_SHOP_OWNER, NPC_BLACKJACK_PLAYER, NPC_OCEAN_BATTLE,
    NPC_EMPTY, NPC_BLACKBEARD, NPC_DAVEY_JONES, NPC_KRAKEN, NPC_SHIP,

    // NPC types
    NPC_TYPE_HUMAN, NPC_TYPE_SHIP,

    // Worlds
    WORLD_DINGUS_LAND, WORLD_ATHENS,

    // Base Ships
    BASE_SHIP_BALSA,

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

    // Fleet names
    FLEET_NAME_PLAYERS,

    // Ship Materials
    SHIP_MATERIAL_TEAK, SHIP_MATERIAL_OAK,

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
        case SCENE_BANK:
            return scene_bank(action);
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
            storage_entity.data[i].position_x == get_player_in_world_x(player_id) &&
            storage_entity.data[i].position_y == get_player_in_world_y(player_id) &&
            storage_entity.data[i].is_interactable == true &&
            storage_entity.data[i].interaction_on_step_over == true
        )
        {
            // TODO: interaction_scene
            generate_world(WORLD_DINGUS_LAND);
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
u32 get_random_number(u32 min, u32 max)
{
    u32 rng_state = init_random(tick_counter);
    u32 adjusted_max = max;
    if (min == max)
    {
        adjusted_max = 100;
    }
    u32 range = adjusted_max - min + 1;
    u32 result = min + (rng_state % range);
    
    if (tick_counter == UINT32_MAX)
    {
        tick_counter = 1;
    }
    else
    {
        tick_counter++;
    }
    
    return result;
}

// -----------------------------------------------------------------------------
// INPUT
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

    // TODO: Pause the game / tick
    // TODO: Only allow certain actions in certain contexts for start
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
    if (interaction_scene == SCENE_BLACKJACK)
    {
        scene_blackjack(ACTION);
    }
    else if (interaction_scene == SCENE_GENERAL_SHOP)
    {
        Scene_General_Shop.inventory_id = storage_world_npc.data[world_npc_id].inventory_id;
        scene_general_shop(ACTION);
    }
    else if (interaction_scene == SCENE_OCEAN_BATTLE)
    {
        // clear_ocean_battle_fleets();
        // add_fleet_to_battle(get_fleet_id_by_general_id(players[0]));
        // add_fleet_to_battle(get_fleet_id_by_general_id(find_storage_npc_by_name_id(NPC_TRAVIS)));
        // add_fleet_to_battle(get_fleet_id_by_general_id(find_storage_npc_by_name_id(NPC_LOLLER)));
        // add_fleet_to_battle(get_fleet_id_by_general_id(players[1]));
        // add_fleet_to_battle(get_fleet_id_by_general_id(find_storage_npc_by_name_id(NPC_LAFOLIE)));
        // add_fleet_to_battle(get_fleet_id_by_general_id(find_storage_npc_by_name_id(NPC_NAKOR)));
        // scene_ocean_battle(SCENE_ACTION_INIT);
        console_log("TODO: Ocean battle scene");
    }
    else if (interaction_scene == SCENE_NPC_RVICE)
    {
        scene_npc_rvice(ACTION);
    }
    else if (interaction_scene == SCENE_NPC_LAFOLIE)
    {
        scene_npc_lafolie(ACTION);
    }
    else if (interaction_scene == SCENE_NPC_NAKOR)
    {
        scene_npc_nakor(ACTION);
    }
    else if (interaction_scene == SCENE_NPC_TRAVIS)
    {
        scene_npc_travis(ACTION);
    }
    else if (interaction_scene == SCENE_NPC_LOLLER)
    {
        scene_npc_loller(ACTION);
    }
    else if (interaction_scene == SCENE_BANK)
    {
        scene_bank(ACTION);
    }
}
void handle_input(u32 input)
{
    // NOTE: Apparenty you have to declare variables up here, NOT INSIDE THE CASE FUNCTIONS THEMSELVES
    if (current.game_mode == GAME_MODE_IN_PORT)
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
// WORLDS & LAYERS
// -----------------------------------------------------------------------------
u32 are_coordinates_blocked(u32 x, u32 y)
{
    for (u32 i = 0; i < MAX_WORLD_NPCS; ++i) {
        if (storage_world_npc.data[i].is_player == true)
        {
            continue;
        }
        if (
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
    // TODO: Function for this?
    for (u32 i = 0; i < MAX_LAYERS; ++i)
    {
        storage_world.data[current.world].layers[i] = SENTRY;
    }

    if (world_name_id == WORLD_DINGUS_LAND)
    {
        previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_PORT;
        set_current_world(find_storage_world_by_name_id(WORLD_DINGUS_LAND));
        u32 world_width = storage_world.data[current.world].width;
        u32 world_height = storage_world.data[current.world].height;

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
    }
    else if (world_name_id == WORLD_ATHENS)
    {
        previous_game_mode = current.game_mode;
        current.game_mode = GAME_MODE_IN_PORT;

        set_current_world(find_storage_world_by_name_id(WORLD_ATHENS));

        u32 world_width = storage_world.data[current.world].width;
        u32 world_height = storage_world.data[current.world].height;

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
        layer_set_value(lid, 0, 0, 36);
        layer_set_value(lid, 7, 0, 38);
        layer_set_value(lid, 0, 1, 33);
        layer_set_value(lid, 0, 2, 33);
        layer_set_value(lid, 0, 3, 33);
        layer_set_value(lid, 0, 4, 33);
        for (u32 column = 1; column < 7; ++column)
        {
            layer_set_value(lid, column, 0, 37);
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
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_TWO;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        add_layer_to_world(lid, current.world);
        layer_set_value(lid, 5, 3, 69);
        layer_set_value(lid, 4, 3, 71);
        layer_set_value(lid, 4, 4, 72);
        lid = pull_storage_layer_next_open_slot();
        storage_layer.data[lid].name_id = LAYER_BLOCK;
        storage_layer.data[lid].width = world_width;
        storage_layer.data[lid].height = world_height;
        storage_layer.data[lid].is_block = true;
        add_layer_to_world(lid, current.world);
        layer_set_value(lid, 2, 2, 1);

        u32 npc_id;
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
        storage_world_npc.data[wnpcid].is_captain = true;
        ++storage_world.data[current.world].total_npcs;
        
        // inventory
        u32 i_id = get_storage_inventory_next_open_slot();
        storage_inventory.data[i_id].name_id = INVENTORY_ATHENS_GENERAL_SHOP;
        storage_inventory.data[i_id].total_items = 0;

        // inventory item
        u32 ii_id = pull_storage_inventory_item_next_open_slot();
        storage_inventory_item.data[ii_id].name_id = ITEM_TELESCOPE;
        storage_inventory_item.data[ii_id].number_held = 22;
        storage_inventory_item.data[ii_id].type = INVENTORY_TYPE_GENERAL_ITEM;
        storage_inventory_item.data[ii_id].type_reference = find_storage_general_item_by_name_id(ITEM_TELESCOPE);
        storage_inventory_item.data[ii_id].adjusted_price = 400;
        add_item_to_inventory(ii_id, i_id);
        ii_id = pull_storage_inventory_item_next_open_slot();
        storage_inventory_item.data[ii_id].name_id = ITEM_QUADRANT;
        storage_inventory_item.data[ii_id].number_held = 2;
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
        storage_inventory_item.data[ii_id].number_held = 2;
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
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_BLACKJACK;
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
        storage_world_npc.data[wnpcid].interaction_scene = SCENE_OCEAN_BATTLE;
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
        current.updated_state = UPDATED_STATE_WORLD;
    }
    else
    {
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
void set_which_player_you_are(u32 player_id)
{
    which_player_are_you = player_id;
}
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
void tick()
{
    increment_tick_counter(&tick_counter);
    if (!has_game_started)
    {
        has_game_started = true;
        accepting_input = true;
        generate_world(WORLD_DINGUS_LAND);
    }
    else if (current.game_mode == GAME_MODE_IN_PORT)
    {
        // TODO: Anything here?
    }
    else if (current.game_mode == GAME_MODE_IN_SCENE)
    {
        // TODO: Anything here?
    }
    // TODO: fsm_tick();
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

    DATA_WORLD athens;
    CLEAR_STRUCT(&athens, SENTRY);
    athens.name_id = WORLD_ATHENS;
    athens.width = 50;
    athens.height = 50;
    athens.total_npcs = 0;
    athens.total_captains = 0;
    athens.total_layers = 0;
    add_storage_world(&athens, true);
    athens.name_id = WORLD_DINGUS_LAND;
    athens.width = 100;
    athens.height = 100;
    athens.total_npcs = 0;
    athens.total_captains = 0;
    athens.total_layers = 0;
    add_storage_world(&athens, true);

    u32 player_one_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[player_one_npc_id].name_id = NPC_PLAYER_ONE;
    storage_npc.data[player_one_npc_id].type = NPC_TYPE_HUMAN;
    u32 player_two_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[player_two_npc_id].name_id = NPC_PLAYER_TWO;
    storage_npc.data[player_two_npc_id].type = NPC_TYPE_HUMAN;
    u32 player_three_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[player_three_npc_id].name_id = NPC_PLAYER_THREE;
    storage_npc.data[player_three_npc_id].type = NPC_TYPE_HUMAN;
    u32 player_four_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[player_four_npc_id].name_id = NPC_PLAYER_FOUR;
    storage_npc.data[player_four_npc_id].type = NPC_TYPE_HUMAN;
    u32 player_five_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[player_five_npc_id].name_id = NPC_PLAYER_FIVE;
    storage_npc.data[player_five_npc_id].type = NPC_TYPE_HUMAN;
    u32 empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_EMPTY;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_BLACKBEARD;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_DAVEY_JONES;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_KRAKEN;
    // TODO: NPC TYPE MONSTER
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_GENERAL_SHOP_OWNER;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_BANK_TELLER;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_BLACKJACK_PLAYER;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_OCEAN_BATTLE;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    empty_npc_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_SHIP;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    u32 npc_rvice_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_RVICE;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    u32 npc_lafolie_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_LAFOLIE;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    u32 npc_nakor_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_NAKOR;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    u32 npc_travis_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_TRAVIS;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;
    u32 npc_loller_id = pull_storage_npc_next_open_slot();
    storage_npc.data[empty_npc_id].name_id = NPC_LOLLER;
    storage_npc.data[empty_npc_id].type = NPC_TYPE_HUMAN;

    u32 inventory_id = pull_storage_inventory_next_open_slot();
    storage_inventory.data[inventory_id].name_id = INVENTORY_PLAYER_ONES_INVENTORY;
    storage_inventory.data[inventory_id].total_items = 0;

    u32 captain_id;
    // TODO: Down the road, we need to separate the inventory and whatnot or we will override player ones stuff
    for (u32 c = 0; c < MAX_PLAYERS; ++c)
    {
        captain_id = pull_storage_captain_next_open_slot();
        if (c == 0)
        {
            storage_captain.data[captain_id].npc_id = player_one_npc_id;
        }
        else if (c == 1)
        {
            storage_captain.data[captain_id].npc_id = player_two_npc_id;
        }
        else if (c == 2)
        {
            storage_captain.data[captain_id].npc_id = player_three_npc_id;
        }
        else if (c == 3)
        {
            storage_captain.data[captain_id].npc_id = player_four_npc_id;
        }
        else if (c == 4)
        {
            storage_captain.data[captain_id].npc_id = player_five_npc_id;
        }
        storage_captain.data[captain_id].player_id = 0;
        storage_captain.data[captain_id].gold = 99;
        storage_captain.data[captain_id].inventory_id = inventory_id;
        players[c] = captain_id;
        captain_to_player[captain_id] = c;
    }
    
    inventory_id = pull_storage_inventory_next_open_slot();
    storage_inventory.data[inventory_id].name_id = INVENTORY_NPC_RVICE;
    storage_inventory.data[inventory_id].total_items = 0;
    captain_id = pull_storage_captain_next_open_slot();
    storage_captain.data[captain_id].npc_id = npc_rvice_id;
    storage_captain.data[captain_id].player_id = 0;
    storage_captain.data[captain_id].gold = 100;
    storage_captain.data[captain_id].inventory_id = inventory_id;
    inventory_id = pull_storage_inventory_next_open_slot();
    storage_inventory.data[inventory_id].name_id = INVENTORY_NPC_LAFOLIE;
    storage_inventory.data[inventory_id].total_items = 0;
    captain_id = pull_storage_captain_next_open_slot();
    storage_captain.data[captain_id].npc_id = npc_lafolie_id;
    storage_captain.data[captain_id].player_id = 0;
    storage_captain.data[captain_id].gold = 100;
    storage_captain.data[captain_id].inventory_id = inventory_id;
    inventory_id = pull_storage_inventory_next_open_slot();
    storage_inventory.data[inventory_id].name_id = INVENTORY_NPC_NAKOR;
    storage_inventory.data[inventory_id].total_items = 0;
    captain_id = pull_storage_captain_next_open_slot();
    storage_captain.data[captain_id].npc_id = npc_nakor_id;
    storage_captain.data[captain_id].player_id = 0;
    storage_captain.data[captain_id].gold = 100;
    storage_captain.data[captain_id].inventory_id = inventory_id;
    inventory_id = pull_storage_inventory_next_open_slot();
    storage_inventory.data[inventory_id].name_id = INVENTORY_NPC_TRAVIS;
    storage_inventory.data[inventory_id].total_items = 0;
    captain_id = pull_storage_captain_next_open_slot();
    storage_captain.data[captain_id].npc_id = npc_travis_id;
    storage_captain.data[captain_id].player_id = 0;
    storage_captain.data[captain_id].gold = 100;
    storage_captain.data[captain_id].inventory_id = inventory_id;

    u32 general_item_id = pull_storage_general_item_next_open_slot();
    storage_general_item.data[general_item_id].name_id = ITEM_TELESCOPE;
    storage_general_item.data[general_item_id].base_price = 200;
    general_item_id = pull_storage_general_item_next_open_slot();
    storage_general_item.data[general_item_id].name_id = ITEM_QUADRANT;
    storage_general_item.data[general_item_id].base_price = 201;
    general_item_id = pull_storage_general_item_next_open_slot();
    storage_general_item.data[general_item_id].name_id = ITEM_THEODOLITE;
    storage_general_item.data[general_item_id].base_price = 203;
    general_item_id = pull_storage_general_item_next_open_slot();
    storage_general_item.data[general_item_id].name_id = ITEM_SEXTANT;
    storage_general_item.data[general_item_id].base_price = 222;

    DATA_SHIP_MATERIAL new_ship_material;
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    new_ship_material.name_id = SHIP_MATERIAL_OAK;
    new_ship_material.base_price = 100;
    new_ship_material.mod_power = 30;
    new_ship_material.mod_tacking = 30;
    new_ship_material.mod_speed = 30;
    add_storage_ship_material(&new_ship_material, false);

    DATA_BASE_SHIP new_base_ship;
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    new_base_ship.name_id = BASE_SHIP_BALSA;
    new_base_ship.top_material_id = new_ship_material.id;
    new_base_ship.base_price = 100;
    new_base_ship.max_capacity = 100;
    new_base_ship.tacking = 100;
    new_base_ship.power = 100;
    new_base_ship.speed = 100;
    add_storage_base_ship(&new_base_ship, false);
    DATA_SHIP new_ship;
    CLEAR_STRUCT(&new_ship, SENTRY);
    new_ship.name_id = BASE_SHIP_BALSA;
    new_ship.base_ship_id = new_base_ship.id;
    new_ship.price = 400;
    new_ship.material_id = new_ship_material.id;
    new_ship.capacity = 400;
    new_ship.tacking = 30;
    new_ship.power = 103;
    new_ship.speed = 333;
    add_storage_ship(&new_ship, false);

    DATA_FLEET new_fleet;
    CLEAR_STRUCT(&new_fleet, SENTRY);
    new_fleet.name_id = FLEET_NAME_PLAYERS;
    new_fleet.total_ships = 1;
    new_fleet.total_captains = 1;
    // Always first captain which is 0 always
    new_fleet.general_id = 0;
    add_storage_fleet(&new_fleet, false);
    DATA_FLEET_SHIP new_fleet_ship;
    CLEAR_STRUCT(&new_fleet_ship, SENTRY);
    new_fleet_ship.name_id = BASE_SHIP_BALSA;
    new_fleet_ship.ship_id = new_ship.id;
    new_fleet_ship.fleet_id = new_fleet.id;
    new_fleet_ship.is_flagship = true;
    add_storage_fleet_ship(&new_fleet_ship, false);
    add_fleet_ship_to_fleet(new_fleet_ship.id, new_fleet.id);
    // Because we didn't clear these before so we could retain their IDs
    CLEAR_STRUCT(&new_ship_material, SENTRY);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    CLEAR_STRUCT(&new_ship, SENTRY);
    CLEAR_STRUCT(&new_base_ship, SENTRY);
    CLEAR_STRUCT(&new_fleet, SENTRY);
    CLEAR_STRUCT(&new_fleet_ship, SENTRY);
}

void test()
{
    set_player_gold(0, 1000);
    console_log("Debug ran");

    u32 base_ship_id = find_storage_base_ship_by_name_id(BASE_SHIP_BALSA);
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
    bool initialized;
    bool player_standing;
    bool dealer_standing;
    bool player_hitting;
    bool dealer_hitting;
    bool player_won;
    bool dealer_won;
    bool game_over;
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
#define MAX_OCEAN_BATTLE_FLEETS 10
#define MAX_OCEAN_BATTLE_FLEET_SHIPS (MAX_OCEAN_BATTLE_FLEETS * MAX_FLEET_SHIPS)
#define MAX_OCEAN_BATTLE_TURN_HISTORY 3000
#define MAX_OCEAN_BATTLE_VALID_COORDS 100
/** EXPORT TO JS **/
typedef struct __attribute__((packed))
{
    u32 turn_order_fleets[MAX_OCEAN_BATTLE_FLEETS];
    u32 turn_order_fleet_ships[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    u32 turn_order_world_npcs[MAX_OCEAN_BATTLE_FLEET_SHIPS];
    u32 total_fleets;
    u32 attacker_id;
    u32 target_id;
    u32 total_ships_in_play;
    u32 turn_history[MAX_OCEAN_BATTLE_TURN_HISTORY];
    u32 valid_move_coords[MAX_OCEAN_BATTLE_VALID_COORDS];
    u32 valid_cannon_coords[MAX_OCEAN_BATTLE_VALID_COORDS];
    u32 valid_boarding_coords[MAX_OCEAN_BATTLE_VALID_COORDS];
    u32 intended_move_coords[2];
    u32 intended_cannon_coords[2];
    u32 intended_boarding_coords[2];
} DATA_OCEAN_BATTLE;
DATA_OCEAN_BATTLE data_ocean_battle;
u32* get_data_ocean_battle_ptr()
{ return (u32*)&data_ocean_battle; }
// void clear_ocean_battle_data(u32 data[OCEAN_BATTLE_DATA_SIZE])
// {
//     CLEAR_DATA(data, OCEAN_BATTLE_DATA_SIZE);
// }
// void clear_ocean_battle_turn_order()
// {
//     CLEAR_DATA(ocean_battle_turn_order, MAX_OCEAN_BATTLE_TURN_ORDERS);
// }
// void clear_ocean_battle_fleets()
// {
//     CLEAR_DATA(ocean_battle_fleets, MAX_OCEAN_BATTLE_FLEETS);
//     ocean_battle_total_fleets = 0;
// }
// void add_fleet_to_battle(u32 fleet_id)
// {
//     for (u32 i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
//     {
//         if (ocean_battle_fleets[i] == SENTRY)
//         {
//             ocean_battle_fleets[i] = fleet_id;
//             break;
//         }
//     }
//     ++ocean_battle_total_fleets;
// }
// u32 get_current_ocean_battle_turn_world_npc_id()
// {
//     return ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
// }
// u32 get_current_ocean_battle_turn_player_id()
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     u32 ship_id = storage_world_npc.data[world_npc_id].entity_id;
//     u32 fleet_id = get_fleet_id_by_ship_id(ship_id);
//     u32 general_id = get_fleet_general_id(fleet_id);
//     if (general_id != SENTRY)
//     {
//         return captain_to_player[general_id];
//     }
//     return SENTRY;
// }
// u32 ocean_battle_total_targets_within_cannon_range()
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     u32 attacker_ship_id = storage_world_npc.data[world_npc_id].entity_id;
//     u32 attacker_fleet_ship_id = get_fleet_ship_id_by_ship_id(attacker_ship_id);
//     u32 attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
//     u32 total = SENTRY;
//     // TODO: Properly get cannon range
//     u32 cannon_range = 8;
//     for (u32 i = 0; i < ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY]; ++i)
//     {
//         if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
//         {
//             u32 target_npc_id = ocean_battle_turn_order[i];
//             u32 target_ship_id = storage_world_npc.data[target_npc_id].entity_id;
//             u32 target_fleet_ship_id = get_fleet_ship_id_by_ship_id(target_ship_id);
//             u32 target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
//             if (target_fleet_id == attacker_fleet_id)
//             {
//                 continue;
//             }
//             if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
//             {
//                 continue;
//             }
//             u32 a_x = storage_world_npc.data[target_npc_id].position_x;
//             u32 a_y = storage_world_npc.data[target_npc_id].position_y;
//             u32 b_x = storage_world_npc.data[world_npc_id].position_x;
//             u32 b_y = storage_world_npc.data[world_npc_id].position_y;
//             // TODO: Don't target npcs that are in your own fleet or an ally
//             if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range))
//             {
//                 ++total;
//             }
//         }
//     }
//     return total;
// }
// u32 ocean_battle_total_targets_within_boarding_range()
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     u32 attacker_ship_id = storage_world_npc.data[world_npc_id].entity_id;
//     u32 attacker_fleet_ship_id = get_fleet_ship_id_by_ship_id(attacker_ship_id);
//     u32 attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
//     u32 total = 0;
//     // TODO: Properly get cannon range
//     u32 boarding_range = 2;
//     for (u32 i = 0; i < ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY]; ++i)
//     {
//         if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
//         {
//             u32 target_npc_id = ocean_battle_turn_order[i];
//             u32 target_ship_id = storage_world_npc.data[target_npc_id].entity_id;
//             u32 target_fleet_ship_id = get_fleet_ship_id_by_ship_id(target_ship_id);
//             u32 target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
//             if (target_fleet_id == attacker_fleet_id)
//             {
//                 continue;
//             }
//             if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
//             {
//                 continue;
//             }
//             u32 a_x = storage_world_npc.data[target_npc_id].position_x;
//             u32 a_y = storage_world_npc.data[target_npc_id].position_y;
//             u32 b_x = storage_world_npc.data[world_npc_id].position_x;
//             u32 b_y = storage_world_npc.data[world_npc_id].position_y;
//             console_log("ocean battle targets within boarding range");
//             // TODO: Don't target ships in fleet or allies
//             if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, boarding_range))
//             {
//                 ++total;
//             }
//         }
//     }
//     return total;
// }
// u32 get_current_ocean_battle_turn_npc_x()
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     return storage_world_npc.data[world_npc_id].position_x;
// }
// u32 get_current_ocean_battle_turn_npc_y()
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     return storage_world_npc.data[world_npc_id].position_y;
// }
// u32 ocean_battle_find_world_npc_id_by_coordinates(u32 x, u32 y)
// {
//     for (u32 i = 0; i < ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY]; ++i)
//     {
//         if (ocean_battle_turn_order[i] != SENTRY)
//         {
//             u32 target_npc_id = ocean_battle_turn_order[i];
//             u32 a_x = storage_world_npc.data[target_npc_id].position_x;
//             u32 a_y = storage_world_npc.data[target_npc_id].position_y;
//             if (a_x == x && a_y == y)
//             {
//                 return target_npc_id;
//             }
//         }
//     }
//     return SENTRY;
// }
// u32 ocean_battle_get_total_valid_movement_coordinates()
// {
//     return ocean_battle_total_valid_movement_coordinates;
// }
// void ocean_battle_set_total_valid_movement_coordinates(u32 value)
// {
//     ocean_battle_total_valid_movement_coordinates = value;
// }
// u32 ocean_battle_get_valid_movement_coordinates_x(u32 index)
// {
//     u32 offset = index * 2;
//     return ocean_battle_valid_movement_coordinates[offset];
// }
// u32 ocean_battle_get_valid_movement_coordinates_y(u32 index)
// {
//     u32 offset = index * 2;
//     return ocean_battle_valid_movement_coordinates[offset + 1];
// }
// void ocean_battle_build_valid_move_coordinates()
// {
//     u32 x = get_current_ocean_battle_turn_npc_x();
//     u32 y = get_current_ocean_battle_turn_npc_y();
//     // TODO: Why does 5 lead to the right range (of 2)?
//     u32 movement_range = 5;
//     u32 x_diff = 0;
//     u32 y_diff = 0;
//     if (x -= movement_range < 0)
//     {
//         if (x > movement_range)
//         {
//             x_diff = x - movement_range;
//         }
//         else
//         {
//             x_diff = movement_range - x;
//         }
//         x = 0;
//     }
//     else
//     {
//         x -= movement_range;
//     }
//     if (y -= movement_range < 0)
//     {
//         if (y > movement_range)
//         {
//             y_diff = y - movement_range;
//         }
//         else
//         {
//             y_diff = movement_range - y;
//         }
//         y = 0;
//     }
//     else
//     {
//         y -= movement_range;
//     }
//     for (u32 i = 0; i < MAX_VALID_MOVEMENT_COORDINATES; ++i)
//     {
//         ocean_battle_valid_movement_coordinates[i] = SENTRY;
//     }
//     ocean_battle_total_valid_movement_coordinates = 0;
//     u32 iterator = 0;
//     u32 full_range = movement_range * 2;
//     while (x < (full_range + x_diff))
//     {
//         for (u32 inner_y = y; inner_y < ((movement_range * 2) + y_diff); ++inner_y)
//         {
//             if (
//                 ocean_battle_is_world_coordinate_in_ship_movement_range(x, inner_y)
//                 &&
//                 !are_coordinates_blocked(x, inner_y)
//             )
//             {
//                 ocean_battle_valid_movement_coordinates[iterator] = x;
//                 ++iterator;
//                 ocean_battle_valid_movement_coordinates[iterator] = inner_y;
//                 ++iterator;
//                 ++ocean_battle_total_valid_movement_coordinates;
//             }
//         }
//         ++x;
//     }
// }
// u32 ocean_battle_is_valid_movement_coordinates(u32 x, u32 y)
// {
//     for (u32 i = 0; i < MAX_VALID_MOVEMENT_COORDINATES; i += 2)
//     {
//         if (
//             ocean_battle_valid_movement_coordinates[i] != SENTRY &&
//             ocean_battle_valid_movement_coordinates[i] == x &&
//             ocean_battle_valid_movement_coordinates[i + 1] == y
//         ) {
//             return true;
//         }
//     }
//     return SENTRY;
// }
// void ocean_battle_set_valid_movement_coordinates(u32 id, u32 x, u32 y)
// {
//     u32 offset = id * 2;
//     ocean_battle_valid_movement_coordinates[offset] = x;
//     ocean_battle_valid_movement_coordinates[offset + 1] = y;
// }
// void ocean_battle_set_intended_boarding_coordinates(u32 x, u32 y)
// {
//     ocean_battle_intended_boarding_coordinates[0] = x;
//     ocean_battle_intended_boarding_coordinates[1] = y;
// }
// u32 ocean_battle_get_total_valid_boarding_coordinates()
// {
//     return ocean_battle_total_valid_boarding_coordinates;
// }
// void ocean_battle_set_total_valid_boarding_coordinates(u32 value)
// {
//     ocean_battle_total_valid_boarding_coordinates = value;
// }
// void ocean_battle_build_valid_boarding_coordinates()
// {
//     for (u32 i = 0; i < MAX_VALID_BOARDING_COORDINATES; ++i)
//     {
//         ocean_battle_valid_boarding_coordinates[i] = SENTRY;
//     }
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     u32 attacker_ship_id = storage_world_npc.data[world_npc_id].entity_id;
//     u32 attacker_fleet_ship_id = get_fleet_ship_id_by_ship_id(attacker_ship_id);
//     u32 attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
//     ocean_battle_total_valid_boarding_coordinates = 0;
//     u32 total = 0;
//     // TODO: Properly get boarding range
//     u32 boarding_range = 1;
//     for (u32 i = 0; i < ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY]; ++i)
//     {
//         if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
//         {
//             u32 target_npc_id = ocean_battle_turn_order[i];
//             u32 target_ship_id = storage_world_npc.data[target_npc_id].entity_id;
//             u32 target_fleet_ship_id = get_fleet_ship_id_by_ship_id(target_ship_id);
//             u32 target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
//             if (target_fleet_id == attacker_fleet_id)
//             {
//                 continue;
//             }
//             if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
//             {
//                 continue;
//             }
//             u32 a_x = storage_world_npc.data[target_npc_id].position_x;
//             u32 a_y = storage_world_npc.data[target_npc_id].position_y;
//             u32 b_x = storage_world_npc.data[world_npc_id].position_x;
//             u32 b_y = storage_world_npc.data[world_npc_id].position_y;
//             if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, boarding_range))
//             {
//                 ocean_battle_valid_boarding_coordinates[total] = a_x;
//                 ++total;
//                 ocean_battle_valid_boarding_coordinates[total] = a_y;
//                 ++total;
//                 ++ocean_battle_total_valid_boarding_coordinates;
//             }
//         }
//     }
// }
// void ocean_battle_set_valid_boarding_coordinates(u32 id, u32 x, u32 y)
// {
//     u32 offset = id * 2;
//     ocean_battle_valid_boarding_coordinates[offset] = x;
//     ocean_battle_valid_boarding_coordinates[offset + 1] = y;
// }
// u32 ocean_battle_get_valid_boarding_coordinates_x(u32 which)
// {
//     u32 offset = which * 2;
//     return ocean_battle_valid_boarding_coordinates[offset];
// }
// u32 ocean_battle_get_valid_boarding_coordinates_y(u32 which)
// {
//     u32 offset = which * 2;
//     return ocean_battle_valid_boarding_coordinates[offset + 1];
// }
// u32 ocean_battle_is_valid_boarding_coordinates(u32 x, u32 y)
// {
//     for (u32 i = 0; i < MAX_VALID_BOARDING_COORDINATES; i += 2)
//     {
//         if (
//             ocean_battle_valid_boarding_coordinates[i] != SENTRY &&
//             ocean_battle_valid_boarding_coordinates[i] == x &&
//             ocean_battle_valid_boarding_coordinates[i + 1] == y
//         ) {
//             return true;
//         }
//     }
//     return SENTRY;
// }
// void ocean_battle_set_intended_cannon_coordinates(u32 x, u32 y)
// {
//     ocean_battle_intended_cannon_coordinates[0] = x;
//     ocean_battle_intended_cannon_coordinates[1] = y;
// }
// u32 ocean_battle_get_total_valid_cannon_coordinates()
// {
//     return ocean_battle_total_valid_cannon_coordinates;
// }
// void ocean_battle_set_total_valid_cannon_coordinates(u32 value)
// {
//     ocean_battle_total_valid_cannon_coordinates = value;
// }
// void ocean_battle_build_valid_cannon_coordinates()
// {
//     for (u32 i = 0; i < MAX_VALID_CANNON_COORDINATES; ++i)
//     {
//         ocean_battle_valid_cannon_coordinates[i] = SENTRY;
//     }

//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     u32 attacker_ship_id = storage_world_npc.data[world_npc_id].entity_id;
//     u32 attacker_fleet_ship_id = get_fleet_ship_id_by_ship_id(attacker_ship_id);
//     u32 attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);

//     ocean_battle_total_valid_cannon_coordinates = 0;
//     u32 total = 0;
//     // TODO: Properly get cannon range
//     u32 cannon_range = 8;
//     for (u32 i = 0; i < ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY]; ++i)
//     {
//         if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
//         {
//             u32 target_npc_id = ocean_battle_turn_order[i];
//             u32 target_ship_id = storage_world_npc.data[target_npc_id].entity_id;
//             u32 target_fleet_ship_id = get_fleet_ship_id_by_ship_id(target_ship_id);
//             u32 target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
//             u32 a_x = storage_world_npc.data[target_npc_id].position_x;
//             u32 a_y = storage_world_npc.data[target_npc_id].position_y;
//             if (target_fleet_id == attacker_fleet_id)
//             {
//                 continue;
//             }
//             if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
//             {
//                 continue;
//             }
//             u32 b_x = storage_world_npc.data[world_npc_id].position_x;
//             u32 b_y = storage_world_npc.data[world_npc_id].position_y;
//             if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range))
//             {
//                 ocean_battle_valid_cannon_coordinates[total] = a_x;
//                 ++total;
//                 ocean_battle_valid_cannon_coordinates[total] = a_y;
//                 ++total;
//                 ++ocean_battle_total_valid_cannon_coordinates;
//             }
//         }
//     }
// }
// void ocean_battle_set_valid_cannon_coordinates(u32 id, u32 x, u32 y)
// {
//     u32 offset = id * 2;
//     ocean_battle_valid_cannon_coordinates[offset] = x;
//     ocean_battle_valid_cannon_coordinates[offset + 1] = y;
// }
// u32 ocean_battle_get_valid_cannon_coordinates_x(u32 which)
// {
//     u32 offset = which * 2;
//     return ocean_battle_valid_cannon_coordinates[offset];
// }
// u32 ocean_battle_get_valid_cannon_coordinates_y(u32 which)
// {
//     u32 offset = which * 2;
//     return ocean_battle_valid_cannon_coordinates[offset + 1];
// }
// u32 ocean_battle_is_valid_cannon_coordinates(u32 x, u32 y)
// {
//     for (u32 i = 0; i < MAX_VALID_CANNON_COORDINATES; i += 2)
//     {
//         if (
//             ocean_battle_valid_cannon_coordinates[i] != SENTRY &&
//             ocean_battle_valid_cannon_coordinates[i] == x &&
//             ocean_battle_valid_cannon_coordinates[i + 1] == y
//         ) {
//             return true;
//         }
//     }
//     return SENTRY;
// }
// void scene_ocean_battle_increment_turn_order()
// {
//     ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = false;
//     ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = false;
//     u32 current = ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX];
//     u32 next = SENTRY;
//     for (u32 i = (current + 1); i < MAX_OCEAN_BATTLE_TURN_ORDERS; ++i)
//     {
//         if (ocean_battle_turn_order[i] != SENTRY)
//         {
//             next = i;
//             break;
//         }
//     }
//     ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] = next;
//     if (next == SENTRY)
//     {
//         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] = 0;
//     }
// }
// void set_ocean_battle_data_intended_move_x(u32 x)
// {
//     ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X] = x;
// }
// void set_ocean_battle_data_intended_move_y(u32 y)
// {
//     ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y] = y;
// }
// void set_ocean_battle_data_intended_boarding_x(u32 x)
// {
//     ocean_battle_intended_boarding_coordinates[0] = x;
// }
// void set_ocean_battle_data_intended_boarding_y(u32 y)
// {
//     ocean_battle_intended_boarding_coordinates[1] = y;
// }
// void set_ocean_battle_data_intended_cannon_x(u32 x)
// {
//     ocean_battle_intended_cannon_coordinates[0] = x;
// }
// void set_ocean_battle_data_intended_cannon_y(u32 y)
// {
//     ocean_battle_intended_cannon_coordinates[1] = y;
// }
// void set_ocean_battle_data_manual_setup(u32 value)
// {
//     ocean_battle_data[OCEAN_BATTLE_DATA_MANUAL_SETUP] = value;
// }
// u32 get_ocean_battle_data_manual_setup()
// {
//     return ocean_battle_data[OCEAN_BATTLE_DATA_MANUAL_SETUP];
// }
// u32 get_ocean_battle_data_intended_move_x()
// {
//     return ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X];
// }
// u32 get_ocean_battle_data_intended_move_y()
// {
//     return ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y];
// }
// u32 get_ocean_battle_attacker_world_npc_id()
// {
//     return ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID];
// }
// u32 get_ocean_battle_target_world_npc_id()
// {
//     return ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID];
// }
// u32 ocean_battle_is_world_coordinate_in_ship_movement_range(u32 world_x, u32 world_y)
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     u32 current_ship_id = storage_world_npc.data[world_npc_id].entity_id;
//     // TODO: Setup an actual movement range
//     u32 movement_range = 2;
//     u32 b_x = SENTRY;
//     u32 b_y = SENTRY;
//     for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
//     {
//         if (storage_world_npc.data[i].entity_id == current_ship_id)
//         {
//             b_x = storage_world_npc.data[i].position_x;
//             b_y = storage_world_npc.data[i].position_y;
//             break;
//         }
//     }
//     if (b_x == SENTRY || b_y == SENTRY)
//     {
//         console_log("Could not find ship in world");
//         return SENTRY;
//     }
//     return is_coordinate_in_range_of_coordinate(world_x, world_y, b_x, b_y, movement_range);
// }
// u32 get_ocean_battle_current_turn_ship_x()
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     return storage_world_npc.data[world_npc_id].position_y;
// }
// u32 get_ocean_battle_current_turn_ship_y()
// {
//     u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
//     return storage_world_npc.data[world_npc_id].position_y;
// }
u32 scene_ocean_battle(u32 action)
{
    /*
    if (!initialized) { initialize }
    if (!setup && !manual_setup) {
        auto setup (use stats of ships to determine order)
    }
    switch (action)
        case TAKE_TURN:
            if (victory) { peace out }
            if (turn === NPC)
                - auto figure out actions based on available targets or just move towards a goal
                - store actions of NPC to render
            if (turn === PLAYER)
                waiting for actions
        case CANNON:
            if (victory) { peace out }
            if (attacked && moved) { fail, can't do any more }
            attacked = true
            store actions (do not execute until end turn is submitted)
        case BOARD:
            if (victory) { peace out }
            if (attacked && moved) { fail, can't do any more }
            attacked = true
            store actions (do not execute until end turn is submitted)
        case MOVE:
            if (victory) { peace out }
            if (attacked && moved) { fail, can't do any more }
            moved = true
            store actions (do not execute until end turn is submitted)
        case END_TURN:
            if (victory) { peace out }
            - can be npc or player, doesn't matter
            - check for victory conditions
            -- if victory, set victory flag
            -- if victory, go to post victory
            - clear actions in turn
            - reset attacked & moved
            - increment turn order
        case POST_VICTORY_ACTIONS:
            if (!victory) { peace out }
            - add enemy ships to fleet
            - add cargo to existing ships (or re-shuffle cargo)
        case EXIT:
            if (!victory) { peace out }
            - possible to exit without doing any post victory actions
            - reset everything
    */

    // if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    // {
    //     if (ocean_battle_data[OCEAN_BATTLE_DATA_MANUAL_SETUP] == SENTRY || ocean_battle_data[OCEAN_BATTLE_DATA_MANUAL_SETUP] == false)
    //     {
    //         clear_ocean_battle_data(ocean_battle_data);
    //         clear_ocean_battle_turn_order();
    //     }
    //     // Assumption is that we've run clear_ocean_battle_fleets
    //     // before this point and our fleets are already setup
    //     clear_current_scene();
    //     set_current_scene(SCENE_OCEAN_BATTLE);
    //     set_current_scene_string_id(get_string_id_by_machine_name("scene_ocean_battle"));
    //     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_SETUP);
    //     current.game_mode = GAME_MODE_IN_SCENE;
    //     scene_ocean_battle(SCENE_ACTION_INIT);
    //     return SENTRY;
    // }
    // switch (get_current_scene_state())
    // {
    //     case SCENE_OCEAN_BATTLE_STATE_SETUP:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                     get_string_id_by_machine_name("confirm")
    //                 );
    //                 u32 string_id = get_string_id_by_machine_name("setting_up_ocean_battle");
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 should_redraw_everything();

    //                 if (ocean_battle_data[OCEAN_BATTLE_DATA_MANUAL_SETUP] == SENTRY || ocean_battle_data[OCEAN_BATTLE_DATA_MANUAL_SETUP] == false)
    //                 {
    //                     console_log("PLACEMENT PHASE");
    //                     u32 world_npc_data[WORLD_NPC_DATA_SIZE];
    //                     CLEAR_DATA(world_npc_data, WORLD_NPC_DATA_SIZE);
    //                     u32 npc_id;
    //                     u32 world_npc_id;
    //                     u32 ocean_battle_turn_order_iterator = 0;
    //                     for (u32 i = 0; i < MAX_FLEET_SHIPS; ++i)
    //                     {
    //                         for (u32 f = 0; f < ocean_battle_total_fleets; ++f)
    //                         {
    //                             u32 this_fleet_id = ocean_battle_fleets[f];
    //                             if (this_fleet_id != SENTRY && mda_fleet_ship[this_fleet_id][i] != SENTRY)
    //                             {
    //                                 // ship_id = mda_fleet_ship[this_fleet_id][i]
    //                                 npc_id = get_npc_id_by_machine_name("ship");
    //                                 world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
    //                                 // the ship id here
    //                                 world_npc_data[WORLD_NPC_ENTITY_ID] = mda_fleet_ship[this_fleet_id][i];
    //                                 world_npc_data[WORLD_NPC_CAPTAIN_ID] = 0;
    //                                 world_npc_data[WORLD_NPC_POSITION_X] = 2 + i;
    //                                 world_npc_data[WORLD_NPC_POSITION_Y] = 6 + f + i;
    //                                 world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
    //                                 world_npc_data[WORLD_NPC_IS_INTERACTABLE] = false;
    //                                 world_npc_data[WORLD_NPC_IS_CAPTAIN] = false;
    //                                 world_npc_id = add_world_npc(world_npc_data);
    //                                 ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY];
    //                                 ocean_battle_turn_order[ocean_battle_turn_order_iterator] = world_npc_id;
    //                                 ++ocean_battle_turn_order_iterator;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] = 0;
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 console_log("Making a choice in ocean battle");
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     console_log("Choice made");
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_TAKE_TURN:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                     get_string_id_by_machine_name("confirm")
    //                 );

    //                 // If the current ship has moved & attack, auto increment
    //                 // or if the current ship has no hull or no crew
    //                 u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
    //                 u32 attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    //                 while (
    //                     (
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] == true
    //                         &&
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] == true
    //                     )
    //                     ||
    //                     get_ship_hull(attacker_ship_id) == 0
    //                     ||
    //                     get_ship_crew(attacker_ship_id) == 0
    //                 )
    //                 {
    //                     scene_ocean_battle_increment_turn_order();
    //                     world_npc_id = get_current_ocean_battle_turn_world_npc_id();
    //                     attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    //                 }

    //                 // Maybe it's good to find if the current turn is npc or player by the following
    //                 u32 attacker_fleet_id = get_fleet_id_by_ship_id(attacker_ship_id);
    //                 u32 attacker_general_id = get_fleet_general_id(attacker_fleet_id);
    //                 bool npcs_turn = true;
    //                 if (attacker_general_id == SENTRY)
    //                 {
    //                     console_log("During ocean battle, we got a general id with SENTRY value for a fleet");
    //                 }
    //                 else
    //                 {
    //                     u32 attacker_player_id = captain_to_player[attacker_general_id];
    //                     if (attacker_player_id != SENTRY)
    //                     {
    //                         npcs_turn = false;
    //                         set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN);
    //                         scene_ocean_battle(SCENE_ACTION_INIT);
    //                         should_redraw_everything();
    //                     }
    //                 }
    //                 if (npcs_turn == true)
    //                 {
    //                     // TODO: SCENE_OCEAN_BATTLE_STATE_NPC_TAKE_TURN
    //                     // TODO: Break out NPC actions (move & attack) so we can animate them in renderer
    //                     // TODO: Board ship attack for npcs as a random choice (between fire cannon and board ship)
    //                     // TODO: Have NPC ships capable of running away when health is low
    //                     console_log("NPC TAKES ACTION");
    //                     world_npc_id = get_current_ocean_battle_turn_world_npc_id();
    //                     center_camera_on(
    //                         get_world_npc_position_x(world_npc_id),
    //                         get_world_npc_position_y(world_npc_id)
    //                     );
    //                     if (get_ship_hull(attacker_ship_id) > 0 && get_ship_crew(attacker_ship_id) > 0)
    //                     {
    //                         u32 rando = get_random_number(1, 4);
    //                         if (rando == 1)
    //                         {
    //                             move_world_npc_down(world_npc_id);
    //                         }
    //                         else if (rando == 2)
    //                         {
    //                             move_world_npc_up(world_npc_id);
    //                         }
    //                         else if (rando == 3)
    //                         {
    //                             move_world_npc_left(world_npc_id);
    //                         }
    //                         else if (rando == 4)
    //                         {
    //                             move_world_npc_right(world_npc_id);
    //                         }
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = true;
    //                     }

    //                     // TODO: Make this an actual range value based on the ship & other heuristics
    //                     u32 movement_range = 2;
    //                     u32 cannon_range = 6;
    //                     bool attacking = false;
    //                     if (get_ship_hull(attacker_ship_id) > 0 && get_ship_crew(attacker_ship_id) > 0)
    //                     {
    //                         for (u32 i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i)
    //                         {
    //                             if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
    //                             {
    //                                 u32 target_npc_id = ocean_battle_turn_order[i];
    //                                 u32 target_ship_id = get_world_npc_entity_id(target_npc_id);
    //                                 u32 target_fleet_ship_id = get_fleet_ship_id_by_ship_id(target_ship_id);
    //                                 u32 target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
    //                                 if (target_fleet_id == attacker_fleet_id)
    //                                 {
    //                                     continue;
    //                                 }
    //                                 if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
    //                                 {
    //                                     continue;
    //                                 }
    //                                 u32 a_x = get_world_npc_position_x(target_npc_id);
    //                                 u32 a_y = get_world_npc_position_y(target_npc_id);
    //                                 u32 b_x = get_world_npc_position_x(world_npc_id);
    //                                 u32 b_y = get_world_npc_position_y(world_npc_id);
    //                                 if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range))
    //                                 {
    //                                     ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = world_npc_id;
    //                                     ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = target_npc_id;
    //                                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK);
    //                                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                                     should_redraw_everything();
    //                                     attacking = true;
    //                                 }
    //                             }
    //                         }
    //                     }
    //                     ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;

    //                     u32 moved_and_attacked = SENTRY;
    //                     if (
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] &&
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED]
    //                     ) {
    //                         moved_and_attacked = 1;
    //                     }
    //                     if (!attacking || moved_and_attacked != SENTRY)
    //                     {
    //                         scene_ocean_battle_increment_turn_order();
    //                         should_redraw_everything();
    //                     }
    //                 }
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                     get_string_id_by_machine_name("confirm")
    //                 );
    //                 u32 string_id = get_string_id_by_machine_name("ship_is_attacking_with_cannon");
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     // TODO: Why are we running the damage actions in confirm here?
    //                     u32 damage = get_random_number(1, 33);
    //                     u32 ship_id = get_world_npc_entity_id(ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID]);
    //                     reduce_ship_hull(ship_id, damage);
    //                     if (get_ship_hull(ship_id) <= 0)
    //                     {
    //                         ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED];
    //                         if (ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED] >= 3)
    //                         {
    //                             // TODO: This is an arbitrary victory condition
    //                             set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_VICTORY);
    //                             scene_ocean_battle(SCENE_ACTION_INIT);
    //                             should_redraw_everything();
    //                             break;
    //                         }
    //                     }
    //                     ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = SENTRY;
    //                     ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = SENTRY;
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                     get_string_id_by_machine_name("confirm")
    //                 );
    //                 u32 string_id = get_string_id_by_machine_name("ship_is_attacking_with_boarding");
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     // TODO: Why are we running the damage actions in confirm here?
    //                     u32 damage = get_random_number(1, 33);
    //                     u32 ship_id = get_world_npc_entity_id(ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID]);
    //                     reduce_ship_crew(ship_id, damage);
    //                     if (get_ship_crew(ship_id) <= 0)
    //                     {
    //                         ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED];
    //                         if (ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED] >= 3)
    //                         {
    //                             // TODO: This is an arbitrary victory condition until
    //                             set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_VICTORY);
    //                             scene_ocean_battle(SCENE_ACTION_INIT);
    //                             should_redraw_everything();
    //                             break;
    //                         }
    //                     }
    //                     ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = SENTRY;
    //                     ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = SENTRY;
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK_CHOOSE_TARGET:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                     get_string_id_by_machine_name("confirm")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BACK),
    //                     get_string_id_by_machine_name("exit")
    //                 );
    //                 console_log("Building valid cannon attack coordinates");
    //                 ocean_battle_build_valid_cannon_coordinates();
    //                 u32 string_id = get_string_id_by_machine_name("ocean_battle_cannon_attack_choose_target");
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_CANNON_ATTACK_TARGET_ID] = SENTRY;
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     u32 x = ocean_battle_intended_cannon_coordinates[0];
    //                     u32 y = ocean_battle_intended_cannon_coordinates[1];
    //                     if (ocean_battle_is_valid_cannon_coordinates(x, y) != SENTRY)
    //                     {
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = get_current_ocean_battle_turn_world_npc_id();
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = ocean_battle_find_world_npc_id_by_coordinates(x, y);
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;
    //                         set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK);
    //                         scene_ocean_battle(SCENE_ACTION_INIT);
    //                         should_redraw_everything();
    //                     }
    //                     else
    //                     {
    //                         console_log("Invalid cannon attack coordinates");
    //                     }
    //                     break;
    //                 }
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK)
    //                 {
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 args[0].i = current_scene_get_choice(cc);
    //                 console_log_format("No valid choice for ATTACK CHOOSE TARGET %d", args, 1);
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK_CHOOSE_TARGET:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                     get_string_id_by_machine_name("confirm")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BACK),
    //                     get_string_id_by_machine_name("exit")
    //                 );
    //                 ocean_battle_build_valid_boarding_coordinates();
    //                 u32 string_id = get_string_id_by_machine_name("ocean_battle_board_attack_choose_target");
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_BOARD_ATTACK_TARGET_ID] = SENTRY;
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     u32 x = ocean_battle_intended_boarding_coordinates[0];
    //                     u32 y = ocean_battle_intended_boarding_coordinates[1];
    //                     if (ocean_battle_is_valid_boarding_coordinates(x, y) != SENTRY)
    //                     {
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = get_current_ocean_battle_turn_world_npc_id();
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = ocean_battle_find_world_npc_id_by_coordinates(x, y);
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;
    //                         set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK);
    //                         scene_ocean_battle(SCENE_ACTION_INIT);
    //                         should_redraw_everything();
    //                     }
    //                     else
    //                     {
    //                         console_log("Invalid boarding attack coordinates");
    //                     }
    //                     break;
    //                 }
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK)
    //                 {
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 args[0].i = current_scene_get_choice(cc);
    //                 console_log_format("No valid choice for ATTACK CHOOSE TARGET %d", args, 1);
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 u32 player_id = get_current_ocean_battle_turn_player_id();
    //                 if (
    //                     (which_player_are_you != SENTRY && player_id == which_player_are_you)
    //                     ||
    //                     which_player_are_you == SENTRY
    //                 )
    //                 {
    //                     current_scene_set_choice_string_id(
    //                         current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_MOVE),
    //                         get_string_id_by_machine_name("move")
    //                     );
    //                     current_scene_set_choice_string_id(
    //                         current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_FIRE_CANNONS),
    //                         get_string_id_by_machine_name("fire_cannons")
    //                     );
    //                     current_scene_set_choice_string_id(
    //                         current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BOARD_SHIP),
    //                         get_string_id_by_machine_name("board_ship")
    //                     );
    //                     current_scene_set_choice_string_id(
    //                         current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER),
    //                         get_string_id_by_machine_name("order")
    //                     );
    //                     current_scene_set_choice_string_id(
    //                         current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                         get_string_id_by_machine_name("ocean_battle_end_turn")
    //                     );
    //                 }
    //                 args[0].i = (player_id + 1);
    //                 if (args[0].i == 0)
    //                 {
    //                     console_log("[E] BRO WTF");
    //                 }
    //                 u32 world_npc_id = get_current_ocean_battle_turn_world_npc_id();
    //                 center_camera_on(
    //                     get_world_npc_position_x(world_npc_id),
    //                     get_world_npc_position_y(world_npc_id)
    //                 );
    //                 u32 string_id = create_string(
    //                     "scene_ocean_battle_current_players_turn",
    //                     string_format(
    //                         get_string_text(
    //                             get_string_id_by_machine_name("ocean_battle_players_turn")
    //                         ),
    //                         args,
    //                         1
    //                     )
    //                 );
    //                 args[0].i = player_id;
    //                 console_log_format("Player id in scene state is %d", args, 1);
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 u32 choice = current_scene_get_choice(cc);
    //                 if (choice == SCENE_OCEAN_BATTLE_CHOICE_FIRE_CANNONS)
    //                 {
    //                     console_log("Player made choice to fire cannons");
    //                     if (
    //                         ocean_battle_total_targets_within_cannon_range() > 0 &&
    //                         ocean_battle_total_targets_within_cannon_range() != SENTRY &&
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] != true
    //                     ) {
    //                         set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK_CHOOSE_TARGET);
    //                         clear_string_by_id(get_current_scene_state_string_id());
    //                         scene_ocean_battle(SCENE_ACTION_INIT);
    //                         should_redraw_everything();
    //                         break;
    //                     }
    //                 }
    //                 if (choice == SCENE_OCEAN_BATTLE_CHOICE_BOARD_SHIP)
    //                 {
    //                     if (
    //                         ocean_battle_total_targets_within_boarding_range() > 0 &&
    //                         ocean_battle_total_targets_within_boarding_range() != SENTRY &&
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] != true
    //                     ) {
    //                         set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK_CHOOSE_TARGET);
    //                         clear_string_by_id(get_current_scene_state_string_id());
    //                         scene_ocean_battle(SCENE_ACTION_INIT);
    //                         should_redraw_everything();
    //                         break;
    //                     } else {
    //                         if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] == true)
    //                         {
    //                             console_log("You've already attacked. You cannot board ships.");
    //                         }
    //                         else
    //                         {
    //                             console_log("Nothing within range");
    //                         }
    //                     }
    //                 }
    //                 if (choice == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     scene_ocean_battle_increment_turn_order();
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                     clear_string_by_id(get_current_scene_state_string_id());
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 if (choice == SCENE_OCEAN_BATTLE_CHOICE_MOVE)
    //                 {
    //                     if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] != true)
    //                     {
    //                         set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_MOVING);
    //                         clear_string_by_id(get_current_scene_state_string_id());
    //                         scene_ocean_battle(SCENE_ACTION_INIT);
    //                         should_redraw_everything();
    //                     }
    //                     break;
    //                 }
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_ORDER)
    //                 {
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_ORDER);
    //                     clear_string_by_id(get_current_scene_state_string_id());
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_ORDER:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_SHIP),
    //                     get_string_id_by_machine_name("ocean_battle_order_focus_on_ship")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_RETREAT),
    //                     get_string_id_by_machine_name("ocean_battle_order_retreat")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_DEFEND_SHIP),
    //                     get_string_id_by_machine_name("ocean_battle_order_defend_ship")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_CANNONS),
    //                     get_string_id_by_machine_name("ocean_battle_order_focus_on_cannons")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_BOARDING),
    //                     get_string_id_by_machine_name("ocean_battle_order_focus_on_boarding")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_ATTACK_AT_WILL),
    //                     get_string_id_by_machine_name("ocean_battle_order_attack_at_will")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_MANUAL),
    //                     get_string_id_by_machine_name("ocean_battle_order_manual")
    //                 );
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BACK),
    //                     get_string_id_by_machine_name("exit")
    //                 );
    //                 u32 string_id = get_string_id_by_machine_name("ocean_battle_ordering");
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK)
    //                 {
    //                     set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN);
    //                     scene_ocean_battle(SCENE_ACTION_INIT);
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_MOVING:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 u32 player_id = get_current_ocean_battle_turn_player_id();
    //                 if (
    //                     (which_player_are_you != SENTRY && player_id == which_player_are_you)
    //                     ||
    //                     which_player_are_you == SENTRY
    //                 )
    //                 {
    //                     current_scene_set_choice_string_id(
    //                         current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                         get_string_id_by_machine_name("confirm")
    //                     );
    //                 }
    //                 u32 string_id = get_string_id_by_machine_name("ocean_battle_moving");
    //                 ocean_battle_build_valid_move_coordinates();
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
    //                     // console_log_format("intended x %d and y %d", ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X], ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y]);
    //                     if (
    //                         !are_coordinates_blocked(
    //                             ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X],
    //                             ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y]
    //                         )
    //                     )
    //                     {
    //                         move_world_npc_to(
    //                             get_current_ocean_battle_turn_world_npc_id(),
    //                             ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X],
    //                             ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y]
    //                         );
    //                         ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = true;
    //                         set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
    //                         scene_ocean_battle(SCENE_ACTION_INIT);
    //                     }
    //                     else
    //                     {
    //                         console_log("Cannot move there. Blocked.");
    //                     }
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    //     case SCENE_OCEAN_BATTLE_STATE_VICTORY:
    //     {
    //         switch (action)
    //         {
    //             case SCENE_ACTION_INIT:
    //             {
    //                 clear_current_scene_choices();
    //                 current_scene_set_choice_string_id(
    //                     current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
    //                     get_string_id_by_machine_name("confirm")
    //                 );
    //                 u32 string_id = get_string_id_by_machine_name("ocean_battle_victory");
    //                 set_current_scene_state_string_id(string_id);
    //                 set_current_scene_dialogue_string_id(string_id);
    //                 should_redraw_everything();
    //                 break;
    //             }
    //             case SCENE_MAKE_CHOICE:
    //             {
    //                 u32 cc = current_scene_get_current_choice();
    //                 if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
    //                 {
    //                     // TODO: Cleanup here
    //                     // clear_current_scene();
    //                     // current.game_mode = GAME_MODE_IN_PORT;
    //                     // Unless you need to do things like post-victory management
    //                     // - take ships, take cargo kinda thing
    //                     // THEN cleanup world npcs && current scene
    //                     // keep ship damage the way it was so you have to deal with after the battle as a challenge
    //                     should_redraw_everything();
    //                     break;
    //                 }
    //                 break;
    //             }
    //         }
    //         break;
    //     }
    // }
    return SENTRY;
}

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

u32 scene_shipyard(u32 action)
{
    // Buy Used
    // - Simply a list of pre-fabbed ships
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
    // Sell Ship
    // Invest
    // Remodel
    // - Capacity
    // -- Cargo
    // -- Cannons
    // -- Crew
    // - Figurehead
    // -- List of figureheads available
    // - Hull
    // -- Available hulls for type of ship
    // - Sails?
    // - Cannons
    // -- List of cannon types for type of ship X space for cannons

    /*
    if (!initialized) { initialize }
    switch (action)
        case ACTION_BUY_USED:
            Take used ship as-is and add to players fleet
        case ACTION_BUY_NEW_SHIP:
            if (building_new_ship_already) { fail }
            ensure enough gold and all that
            generate ship from data and add to fleet
        case ACTION_SELL_SHIP:
            clear cargo on ship
            clear ship
            if has captain then set captain to unassigned
            cannot sell flagship
            remove ship from fleet
        case INVEST:
            same as goods/trade
            - sphere of influence?
            - increase shipyard level and potentially unlock stuff
        case REMODEL:
            - which ship
            - what is remodeled (capacity, cargo, etc...)
    */

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
    // TODO: Need global time tracker her

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

u32 scene_goods_shop(u32 action)
{
    // TODO: Trade shop -> heuristics on economic factors that influence price
    // Note: trade shop just needs to know list of goods, their local value, at the end, you pick X goods, Y number of them, input on which ships get which goods and how many after you validate you have room for it to beging with
    // Note: trade shop selling is essentially all goods in all ships, N goods, X number of each good, sell, done

    /*
    if (!initialized) { initialize }
    - when initializing, check current investment level or other flags to unlock special trade goods
    - ensure you apply local trade taxes to goods before storing prices
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
// TODO: Pay crew and captain(s) per month!! or year!!
// -- captain can stay in port so you can chat with them at any point in any port. random appearances of limited set of captains in port in case the world is too small to have them all
// - rando people can gossip, along with waitress, rando information presented, probably just an array of different information to pick from

// FUTURE, NOT NOW
// TODO: Library? What even is this? Read books and gain info or something?
// TODO: Duels -> recycle card based system from original game???
// TODO: Autopilot captains -> they can auto sail your fleet to a port (pathfinding)
// TODO: Jail -> world/map, houses React pirates. Maybe React pirates are their own faction
// TODO: Houses to buy (pre-furnished to start, later on, furniture microtransactions w/ crypto mining for each furniture purchased so Spiro makes boatloads of cash)
// TODO: Bulletin boards with messages to other players (post office??)
// TODO: "Send" your ships to other players which become AI controlled and help other players
// TODO: "Item in a bottle" -> send out an item and random player receives it later



// TODO: Software renderer. Blit pixels out. Load on initalize game. Ask for pixels for a *thing*, get pixels out, render to *other thing*
// NOTE: How to bit pack and unpack
u32 pack(u32 a, u32 b) {
    // Ensure values are within range
    if (a > 100 || b > 100) return 0; // or handle error
    
    // Pack 'a' into the lower 7 bits, 'b' into the next 7 bits
    return (b << 7) | a;
}
u32 unpack_lower(u32 packed) {
    return packed & 0x7F;  // 0x7F is 1111111 in binary, masking out the lower 7 bits
}
u32 unpack_upper(u32 packed) {
    return (packed >> 7) & 0x7F;  // Shift right by 7, then mask to get the upper 7 bits
}