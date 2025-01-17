#include <stdint.h>
#include <stddef.h>
#include <stdarg.h>
#include <stdbool.h>

// #include "rvice_sucks.h"
// uint32_t test_world_data_out(uint32_t t) {
//     // uint32_t offset = t * 4;
//     // return rvice_sucks_bin[offset];
//     return rvice_sucks[t];
// }

#define BUFFER_SIZE 1024

typedef uint32_t u32;

void console_log(const char* message);
void console_log_format(const char* format, ...);
char* string_format(const char* format, ...);
unsigned long strlen(const char* str);
int strcmp(const char* str1, const char* str2);
#define SENTRY UINT32_MAX
__attribute__((visibility("default")))
uint32_t get_sentry()
{
    return SENTRY;
}
extern void js_console_log(void* ptr, uint32_t len);
void console_log(const char* message)
{
    if (message != NULL)
    {
        js_console_log((void*)message, (uint32_t)(sizeof(char) * strlen(message)));
    }
}
char* string_format(const char* format, ...)
{
    static char local_buffer[BUFFER_SIZE];
    char* buf_ptr = local_buffer;
    va_list args;
    va_start(args, format);
    
    const char* fmt_ptr = format;
    while (*fmt_ptr && (buf_ptr - local_buffer) < BUFFER_SIZE - 1)
    {
        if (*fmt_ptr != '%')
        {
            *buf_ptr++ = *fmt_ptr++;
            continue;
        }
        
        fmt_ptr++; // Skip '%'
        switch (*fmt_ptr)
        {
            case 'd':
            {
                int val = va_arg(args, int);
                
                if (val == 0)
                {
                    *buf_ptr++ = '0';
                    break;
                }
                
                char num_buffer[12];
                char* num_ptr = num_buffer;
                
                if (val < 0)
                {
                    *buf_ptr++ = '-';
                    val = -val;
                }
                
                while (val > 0)
                {
                    *num_ptr++ = '0' + (val % 10);
                    val /= 10;
                }
                
                while (num_ptr > num_buffer)
                {
                    *buf_ptr++ = *--num_ptr;
                }
                break;
            }
            case 's':
            {
                char* str = va_arg(args, char*);
                while (*str && (buf_ptr - local_buffer) < BUFFER_SIZE - 1)
                {
                    *buf_ptr++ = *str++;
                }
                break;
            }
            case 'c':
            {
                char c = (char)va_arg(args, int);
                *buf_ptr++ = c;
                break;
            }
        }
        fmt_ptr++;
    }
    
    *buf_ptr = '\0';
    va_end(args);
    return local_buffer;
}
void console_log_format(const char* format, ...)
{
    va_list args;
    va_start(args, format);
    
    // Create a temporary buffer to store arguments
    void* arg_values[BUFFER_SIZE/8];  // Array to store argument values
    int arg_count = 0;
    
    // First pass: collect all arguments
    const char* fmt_ptr = format;
    while (*fmt_ptr)
    {
        if (*fmt_ptr == '%')
        {
            fmt_ptr++;
            switch (*fmt_ptr)
            {
                case 'd':
                    arg_values[arg_count++] = (void*)(long)va_arg(args, int);
                    break;
                case 's':
                    arg_values[arg_count++] = va_arg(args, char*);
                    break;
                case 'c':
                    arg_values[arg_count++] = (void*)(long)va_arg(args, int);
                    break;
            }
        }
        fmt_ptr++;
    }
    va_end(args);
    
    // Second pass: format string with collected arguments
    va_start(args, format);
    // Note: LIMITED arguments but, hey
    char* formatted = string_format(format, arg_values[0], arg_values[1], 
                                  arg_values[2], arg_values[3], arg_values[4]);
    va_end(args);
    
    console_log(formatted);
}
uint32_t max(uint32_t a, uint32_t b)
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

// ------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------
#define MAX_ITEMS 1000
#define MAX_GENERAL_ITEMS 100
#define MAX_WORLD_NPCS 1000
#define MAX_NPCS 100
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
#define MAX_LAYERS 100
#define MAX_WORLD_NPCS 1000
#define MAX_SHIPS 100
#define MAX_SHIP_MATERIALS 100
#define MAX_BASE_SHIPS 100
#define MAX_INVENTORY_ITEMS 100
#define MAX_CAPTAINS 100
#define MAX_SCENE_DATA_SIZE 1000
#define MAX_SCENE_CHOICES 10
#define MAX_SCENE_STATES 100
#define MAX_SCENE_STRINGS 100
// TODO: #define fsibmn
// TODO: #define this_is_a_function_that_calculates_the_purchase_price_of_a_known_shop_vendor_actor
// TODO: #define this_function_announces_that_spiro_is_still_fourty_years_of_age(*twitchChat)
#define MAX_GLOBAL_ENTITIES 10

// ------------------------------------------------------------------------------------------------
// Enums
// Structs
// ------------------------------------------------------------------------------------------------
enum ShouldRedraw
{
    SHOULD_REDRAW_NOTHING,
    SHOULD_REDRAW_EVERYTHING,
    SHOULD_REDRAW_SHIPS,
    SHOULD_REDRAW_NPCS,
    SHOULD_REDRAW_PLAYERS,
};
enum Direction
{
    DIRECTION_UP,
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
};
enum GameMode
{
    GAME_MODE_EMPTY,
    GAME_MODE_IN_SCENE,
    GAME_MODE_IN_OCEAN_BATTLE,
    GAME_MODE_IN_PORT,
    GAME_MODE_ON_LAND,
    GAME_MODE_IN_PLAYER_MENU,
};
enum ResourceType
{
    RESOURCE_NPC,
    RESOURCE_GOOD,
    RESOURCE_STRING,
    RESOURCE_WEAPON,
    RESOURCE_ARMOR,
    RESOURCE_GENERAL_ITEM,
    RESOURCE_SPECIAL_ITEM,
    RESOURCE_TYPE_COUNT,
};

// ENUM ITEM
// STRUCT ITEM
enum ItemType
{
    ITEM_TYPE_GOOD,
    ITEM_TYPE_ARMOR,
    ITEM_TYPE_WEAPON,
    ITEM_TYPE_GENERAL_ITEM,
    ITEM_TYPE_CANNON,
    ITEM_TYPE_BASE_SHIP,
    ITEM_TYPE_SHIP,
};
#define ITEM_FIELDS(X, ...) \
    X(u32, name_id, __VA_ARGS__) \
    X(u32, type, __VA_ARGS__) \
    X(u32, base_price, __VA_ARGS__) \
    X(u32, defense, __VA_ARGS__) \
    X(u32, power, __VA_ARGS__)

enum StringData
{
    STRING_MACHINE_NAME_LENGTH, // Length of machine name
    STRING_TEXT_LENGTH,         // Length of display text
    STRING_DATA_SIZE,
};
// TODO: Gotta sort out string struct
struct String
{
    u32 machine_name_length;
    u32 text_length;
};

#define BASESHIP_FIELDS(X, ...) \
    X(u32, name_id, __VA_ARGS__) \
    X(u32, top_material_id, __VA_ARGS__) \
    X(u32, price, __VA_ARGS__) \
    X(u32, max_capacity, __VA_ARGS__) \
    X(u32, tacking, __VA_ARGS__) \
    X(u32, power, __VA_ARGS__) \
    X(u32, speed, __VA_ARGS__) \
    X(u32, hull, __VA_ARGS__)

// STRUCT SHIP
#define SHIP_FIELDS(X, ...) \
    X(u32, name_id, __VA_ARGS__) \
    X(u32, base_ship_id, __VA_ARGS__) \
    X(u32, price, __VA_ARGS__) \
    X(u32, material_id, __VA_ARGS__) \
    X(u32, capacity, __VA_ARGS__) \
    X(u32, tacking, __VA_ARGS__) \
    X(u32, power, __VA_ARGS__) \
    X(u32, speed, __VA_ARGS__) \
    X(u32, max_crew, __VA_ARGS__) \
    X(u32, max_hull, __VA_ARGS__) \
    X(u32, crew, __VA_ARGS__) \
    X(u32, hull, __VA_ARGS__)

struct ShipMaterial
{
    u32 name_id;
    u32 base_price;
    u32 mod_power;
    u32 mod_capacity;
    u32 mod_tacking;
    u32 mod_speed;
};
struct WorldNPC
{
    u32 npc_id;
    u32 captain_id;
    u32 position_x;
    u32 position_y;
    u32 direction;
    u32 is_interactable;
    u32 is_captain;
    u32 interaction_scene;
    u32 is_player;
    u32 inventory_id;
    u32 entity_id;
};

// ENUM NPCS
// STRUCT NPCS
enum NPCType
{
    NPC_TYPE_EMPTY,
    NPC_TYPE_HUMAN,
    NPC_TYPE_ANIMAL,
    NPC_TYPE_SHIP,
    NPC_TYPE_OTHER,
};
#define NPC_FIELDS(X, ...) \
    X(u32, name_id, __VA_ARGS__) \
    X(u32, type, __VA_ARGS__)

struct Captain
{
    u32 npc_id;
    u32 world_npc_id;
    u32 in_world;
    u32 global_position_x;
    u32 global_position_y;
    u32 in_port;
    u32 on_land;
    u32 in_ocean;
    u32 sailing;
    u32 skills_id;
    u32 stats_id;
    u32 inventory_id;
    u32 player_id;
    u32 gold;
    u32 fleet_id;
    u32 equipped_weapon_id;
    u32 equipped_armor_id;
};
struct World
{
    u32 name_id;
    u32 width;
    u32 height;
    u32 total_npcs;
    u32 total_captains;
    u32 total_layers;
};
struct Figurehead
{
    u32 name_id;
    u32 base_price;
};
struct Cannon
{
    u32 name_id;
    u32 range;
    u32 power;
    u32 base_price;
};
enum LayerType
{
    LAYER_TYPE_MATCHES_WORLD_SIZE,
    LAYER_TYPE_HAS_SPECIFIC_SIZE,
    LAYER_TYPE_HAS_SPECIFIC_COORDINATES,
    LAYER_TYPE_IS_SAME_VALUE,
    LAYER_TYPE_HAS_FUNCTION,
};
struct Layer
{
    u32 name_id;
    // The idea is that you store into the global world data
    u32 global_world_data_offset;
    // Length of data is just width * height
    u32 width;
    u32 height;
    u32 type;
    // Just a simple value, doesn't need global world data storage
    u32 same_value;
    // This will be used if type = specific_coordinates and you will it will be (x,y)*entries
    u32 specific_coordinates_size;
    // If true, then the layer contains block information so NPCS & player cannot pass
    u32 is_block;
};
struct Bank
{
    u32 deposit;
    u32 loan;
    u32 deposit_original_amount;
    u32 deposit_interest_rate;
    u32 deposit_interest;
    u32 loan_original_amount;
    u32 loan_interest_rate;
    u32 loan_interest;
    u32 fdic_insured;
    u32 max_deposit_amount;
    u32 max_loan_amount;
};
struct Inventory
{
    u32 name_id;
    u32 total_items;
};
struct InventoryItem
{
    u32 name_id;
    u32 number_held;
    u32 adjusted_price;
    u32 type;
    u32 type_name_id;
    u32 type_reference;
    u32 inventory_id;
    u32 number_chosen;
};
struct Port
{
    u32 name_id;
    u32 global_location_x;
    u32 global_location_y;
    u32 overall_investment_level;
    u32 market_investment_level;
    u32 shipyard_investment_level;
};
struct Stats
{
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
};
struct Skill
{
    u32 name_id;
    u32 stats_requirements;
};
struct Entity
{
    u32 name_id;
    u32 is_interactable;
    u32 is_solid;
    u32 interaction_on_step_over;
    u32 interaction_scene;
    u32 world_position_x;
    u32 world_position_y;
};
struct Fleet
{
    u32 total_ships;
    u32 total_captains;
    u32 first_mate_id;
    u32 accountant_id;
    u32 navigator_id;
    // As in, the army general, not general general
    u32 general_id;
};
struct FleetShip
{
    u32 ship_id;
    u32 fleet_id;
};
struct FleetCaptain
{
    u32 captain_id; // Reference to Captain
    u32 fleet_id;
};
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

// ------------------------------------------------------------------------------------------------
// SCENES
// ------------------------------------------------------------------------------------------------
enum SceneBank
{
    SCENE_BANK_WELCOME,
    SCENE_BANK_DEPOSIT,
    SCENE_BANK_DEPOSIT_AMOUNT,
    SCENE_BANK_DEPOSIT_CONFIRM,
    SCENE_BANK_DEPOSIT_NOT_ENOUGH_GOLD,
    SCENE_BANK_DEPOSIT_CONFIRMED,
    SCENE_BANK_LOAN,
    SCENE_BANK_LOAN_TAKE_AMOUNT,
    SCENE_BANK_LOAD_PAY_AMOUNT,
    SCENE_BANK_LOAN_TAKE_AMOUNT_CONFIRM,
    SCENE_BANK_LOAN_PAY_AMOUNT_CONFIRM,
    SCENE_BANK_LOAN_PAY_AMOUNT_NOT_ENOUGH_GOLD,
    SCENE_BANK_WITHDRAW,
    SCENE_BANK_WITHDRAW_AMOUNT,
    SCENE_BANK_WITHDRAW_NO_ACCOUNT,
    SCENE_BANK_WITHDRAW_NOT_ENOUGH_GOLD, // IN ACCOUNT
    SCENE_BANK_WITHDRAW_CONFIRM,
    SCENE_BANK_DATA_SIZE,
};
enum SceneBankChoices
{
    SCENE_BANK_CHOICE_CONFIRM,
    SCENE_BANK_CHOICE_BACK,
    SCENE_BANK_CHOICE_DEPOSIT,
    SCENE_BANK_CHOICE_LOAN,
    SCENE_BANK_CHOICE_WITHDRAW,
    SCENE_BANK_CHOICES_DATA_SIZE,
};
enum Scene
{
    SCENE_BLACKJACK,
    SCENE_GENERAL_SHOP,
    SCENE_DOCKYARD,
    SCENE_OCEAN_BATTLE,
    SCENE_BANK,

    // SPECIAL SCENES
    SCENE_NPC_RVICE,
    SCENE_NPC_LAFOLIE,
    SCENE_NPC_NAKOR,
    SCENE_NPC_TRAVIS,
    SCENE_NPC_LOLLER,

    SCENE_DATA_SIZE,
};
enum SceneGeneralShop
{
    SCENE_GENERAL_SHOP_ACTION_INIT,
    SCENE_GENERAL_SHOP_RUN_STATE,
    SCENE_GENERAL_SHOP_CURRENT_INPUT_NUMBER,
    SCENE_GENERAL_SHOP_CURRENT_INPUT_STRING,

    SCENE_GENERAL_SHOP_STATE_WELCOME,
    SCENE_GENERAL_SHOP_STATE_BUYING,
    SCENE_GENERAL_SHOP_STATE_BUYING_CONFIRM,
    SCENE_GENERAL_SHOP_STATE_BUYING_NOT_ENOUGH_GOLD,
    SCENE_GENERAL_SHOP_STATE_BUYING_COMPLETE,
    SCENE_GENERAL_SHOP_STATE_SELLING,
    SCENE_GENERAL_SHOP_STATE_SELLING_CONFIRM,
    SCENE_GENERAL_SHOP_STATE_SELLING_COMPLETE,

    SCENE_GENERAL_SHOP_CHOICE_CONFIRM,
    SCENE_GENERAL_SHOP_CHOICE_BACK,
    SCENE_GENERAL_SHOP_CHOICE_INVEST,
    SCENE_GENERAL_SHOP_CHOICE_BUY,
    SCENE_GENERAL_SHOP_CHOICE_CONFIRM_BUY,
    SCENE_GENERAL_SHOP_CHOICE_SELL,
    SCENE_GENERAL_SHOP_CHOICE_CONFIRM_SELL,

    SCENE_GENERAL_SHOP_DATA_SIZE,
};
enum SceneDockyard
{
    SCENE_DOCKYARD_ACTION_INIT,
    SCENE_DOCKYARD_RUN_STATE,
    SCENE_DOCKYARD_CURRENT_INPUT_NUMBER,
    SCENE_DOCKYARD_CURRENT_INPUT_STRING,

    SCENE_DOCKYARD_STATE_WELCOME,
    SCENE_DOCKYARD_STATE_NEW_SHIP,
    SCENE_DOCKYARD_STATE_USED_SHIP,
    SCENE_DOCKYARD_STATE_SELL,
    SCENE_DOCKYARD_STATE_REMODEL,
    SCENE_DOCKYARD_STATE_INVEST,
    // TODO: States to buy a new ship
    // TODO: Used ship is just premade ships

    SCENE_DOCKYARD_CHOICE_CONFIRM,
    SCENE_DOCKYARD_CHOICE_BACK,

    SCENE_DOCKYARD_DATA_SIZE,
};
enum BasicScene
{
    SCENE_ACTION_INIT,
    SCENE_CURRENT_STATE,
    SCENE_CURRENT_STATE_STRING_ID,
    SCENE_CURRENT_SCENE,
    SCENE_CURRENT_SCENE_STRING_ID,
    SCENE_CURRENT_DIALOGUE_STRING_ID,
    SCENE_CURRENT_TOTAL_CHOICES,
    SCENE_TOTAL_STATES,
    // Note: Opted for total strings instead of CURRENT total strings
    // because you may change states very quickly and clearing & setting
    // strings each time could be memory thrash
    SCENE_TOTAL_STRINGS,
    SCENE_WAITING_FOR_INPUT_NUMBER,
    SCENE_WAITING_FOR_INPUT_STRING,
    SCENE_CURRENT_INVENTORY_ID,
    SCENE_CURRENT_CHOICE,
    SCENE_MAKE_CHOICE,
    SCENE_IS_CHOICE_ENABLED,
    SCENE_GET_CHOICE_STRING_ID,
    SCENE_TRIGGERED_BY_WORLD_NPC_ID,
    SCENE_BASIC_DATA_SIZE,
};
enum SceneNpcStates
{
    SCENE_NPC_STATES_RVICE_TRASH_TALK,
    SCENE_NPC_STATES_LAFOLIE_TRASH_TALK,
    SCENE_NPC_STATES_NAKOR_TRASH_TALK,
    SCENE_NPC_STATES_TRAVIS_TRASH_TALK,
    SCENE_NPC_STATES_LOLLER_TRASH_TALK,

    SCENE_NPC_STATES_DATA_SIZE,
};
enum SceneNpcChoices
{
    SCENE_NPC_CHOICE_CONFIRM,

    SCENE_NPC_CHOICES_DATA_SIZE,
};
enum SceneBlackjackStates
{
    SCENE_BLACKJACK_STATE_HELLO,
    SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT,
    SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_MINIMUM,
    SCENE_BLACKJACK_STATE_BET_AMOUNT_OVER_MAXIMUM,
    SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_ENOUGH_GOLD,
    SCENE_BLACKJACK_STATE_CONFIRM_BET_AMOUNT,
    SCENE_BLACKJACK_STATE_DEAL_CARDS,
    SCENE_BLACKJACK_STATE_PLAYER_HIT_OR_STAND,
    SCENE_BLACKJACK_STATE_PLAYER_DEAL_CARD,
    SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND,
    SCENE_BLACKJACK_STATE_DEALER_DEAL_CARD,
    SCENE_BLACKJACK_STATE_CHECK_WINNER,
    SCENE_BLACKJACK_STATE_PLAYER_WON,
    SCENE_BLACKJACK_STATE_DEALER_WON,
    SCENE_BLACKJACK_STATE_SIZE,
};
enum SceneBlackjackChoices
{
    SCENE_BLACKJACK_CHOICE_CONFIRM,
    SCENE_BLACKJACK_CHOICE_BACK,
    SCENE_BLACKJACK_CHOICE_HIT,
    SCENE_BLACKJACK_CHOICE_STAND,

    SCENE_BLACKJACK_DATA_SIZE,
};
enum SceneOceanBattleStates
{
    SCENE_OCEAN_BATTLE_STATE_SETUP,
    SCENE_OCEAN_BATTLE_STATE_PLACEMENT,
    SCENE_OCEAN_BATTLE_STATE_TAKE_TURN,
    SCENE_OCEAN_BATTLE_STATE_NPC_TAKE_TURN,
    SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN,
    SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK,
    SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK,
    SCENE_OCEAN_BATTLE_STATE_MOVING,
    SCENE_OCEAN_BATTLE_STATE_VICTORY,
    SCENE_OCEAN_BATTLE_STATE_ORDER,
    SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK_CHOOSE_TARGET,
    SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK_CHOOSE_TARGET,

    SCENE_OCEAN_BATTLE_STATE_DATA_SIZE,
};
enum SceneOceanBattleChoices
{
    SCENE_OCEAN_BATTLE_CHOICE_CONFIRM,
    SCENE_OCEAN_BATTLE_CHOICE_BACK,
    SCENE_OCEAN_BATTLE_CHOICE_END_TURN,
    SCENE_OCEAN_BATTLE_CHOICE_CANNON_ATTACK_CHOOSE_TARGET,
    SCENE_OCEAN_BATTLE_CHOICE_CANNON_ATTACK,
    SCENE_OCEAN_BATTLE_CHOICE_CREW_ATTACK,
    SCENE_OCEAN_BATTLE_CHOICE_MOVE,
    SCENE_OCEAN_BATTLE_CHOICE_FIRE,
    SCENE_OCEAN_BATTLE_CHOICE_FIRE_CANNONS,
    SCENE_OCEAN_BATTLE_CHOICE_BOARD_SHIP,
    SCENE_OCEAN_BATTLE_CHOICE_ORDER,

    // TODO: this has to let you go into a state where you pick a ship to focus on
    SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_SHIP,
    SCENE_OCEAN_BATTLE_CHOICE_ORDER_RETREAT,
    // TODO: same as focus on ship
    SCENE_OCEAN_BATTLE_CHOICE_ORDER_DEFEND_SHIP,
    SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_CANNONS,
    SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_BOARDING,
    SCENE_OCEAN_BATTLE_CHOICE_ORDER_ATTACK_AT_WILL,
    // TODO: Ships in your fleet that are *NOT* the flag ship are automated by default
    // if you pass ORDER MANUAL as an order, you can then control each ship
    // once you pass an order, ships go back to automatic
    SCENE_OCEAN_BATTLE_CHOICE_ORDER_MANUAL,

    SCENE_OCEAN_BATTLE_CHOICE_DATA_SIZE,
};

// ------------------------------------------------------------------------------------------------
// OCEAN BATTLE
// ------------------------------------------------------------------------------------------------
enum OceanBattleData
{
    OCEAN_BATTLE_DATA_INITIALIZED,
    OCEAN_BATTLE_DATA_WORLD_ID,
    OCEAN_BATTLE_DATA_WORLD_NAME_ID,
    OCEAN_BATTLE_DATA_CURRENT_FLEET_ORDER_ID,
    OCEAN_BATTLE_DATA_CURRENT_SHIP_NTH_ORDER,
    OCEAN_BATTLE_DATA_CURRENT_SHIP_ID,
    OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX,
    OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY,
    OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID,
    OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID,
    OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED,
    OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED,
    OCEAN_BATTLE_DATA_INTENDED_MOVE_X,
    OCEAN_BATTLE_DATA_INTENDED_MOVE_Y,
    OCEAN_BATTLE_DATA_CURRENT_CANNON_ATTACK_TARGET_ID,
    OCEAN_BATTLE_DATA_CURRENT_BOARD_ATTACK_TARGET_ID,
    OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED,
    OCEAN_BATTLE_DATA_SIZE,
};
// For later. Travis' handler system
// enum Resource {
//     RESOURCE_INDEX,
//     RESOURCE_GEN_ID,
//     RESOURCE_REFERENCES,
//     RESOURCE_SIZE,
// }
// #define STRING_RESOURCES_SIZE (MAX_STRINGS * RESOURCE_SIZE)
// static u32 g_string_resources[STRING_RESOURCES_SIZE];

// ------------------------------------------------------------------------------------------------
// FORWARD DECLARATIONS
// ------------------------------------------------------------------------------------------------
uint32_t get_layer_same_value(uint32_t layer_index);
uint32_t get_layer_width(uint32_t layer_index);
uint32_t get_layer_global_world_data_offset(uint32_t layer_index);
const char* get_layer_machine_name(uint32_t layer_index);
uint32_t get_layer_name_id(uint32_t layer_index);
uint32_t get_player_npc_id(uint32_t player_id);
void move_player_left(uint32_t player_id);
void move_player_right(uint32_t player_id);
void move_player_up(uint32_t player_id);
void move_player_down(uint32_t player_id);
void handle_input(uint32_t input);
void should_redraw_everything();
uint32_t get_player_in_world(uint32_t player_id);
uint32_t get_player_in_world_x(uint32_t player_id);
uint32_t get_player_in_world_y(uint32_t player_id);
uint32_t get_world_npc_x(uint32_t world_npc_id);
uint32_t get_world_npc_y(uint32_t world_npc_id);
u32 get_world_npc_direction(u32 id);
u32 get_world_npc_interaction_scene(u32 id);
u32 get_world_npc_is_player(u32 id);
u32 get_world_npc_npc_id(u32 id);
void set_world_npc_x(u32 id, u32 x);
void set_world_npc_y(u32 id, u32 y);
void set_world_npc_direction(u32 id, u32 direction);
void set_world_npc_is_interactable(u32 world_npc_id, u32 is_or_not);
void set_world_npc_interaction_scene(u32 world_npc_id, u32 scene_id);
void set_world_npc_inventory_id(u32 id, u32 value);
void set_world_npc_is_player(u32 world_npc_id, u32 is_or_not);
void set_world_npc_is_captain(u32 world_npc_id, u32 is_or_not);
void set_world_npc_npc_id(u32 world_npc_id, u32 npc_id);
void set_world_npc_captain_id(u32 world_npc_id, u32 captain_id);
void clear_global_world_npcs();
u32 is_world_coordinate_halfway_of_viewport_more_than_x(u32 x);
u32 is_world_coordinate_halfway_of_viewport_more_than_y(u32 y);
u32 is_world_coordinate_halfway_of_viewport_less_than_x(u32 x);
u32 is_world_coordinate_halfway_of_viewport_less_than_y(u32 y);
void update_camera();
u32 get_current_world_height();
u32 get_current_world_width();
u32 scene_blackjack(u32 action);
void clear_current_scene_strings();
void clear_current_scene_states();
void clear_current_scene_choices();
u32 scene_general_shop(u32 action);
u32 get_inventory_item_string_id(u32 inventory_item_id);
u32 get_inventory_item_inventory_id(u32 inventory_item_id);
u32 get_world_npc_inventory_id(u32 world_npc_id);
u32 get_current_scene_inventory_id();
void set_inventory_name_id_by_string(u32 id, char* name);
void set_inventory_total_items(u32 id, u32 value);
void set_inventory_item_inventory_id(u32 id, u32 value);
void set_inventory_item_number_held(u32 id, u32 value);
void set_inventory_item_type_reference_by_string(u32 id, char* name);
void set_inventory_item_inventory_id(u32 id, u32 value);
void set_inventory_item_adjusted_price(u32 id, u32 value);
void set_inventory_item_name_id_by_string(u32 id, char* name);
void set_inventory_item_name_id(u32 id, u32 value);
void inventory_increment_total_items(u32 id);
u32 get_inventory_item_adjusted_price(u32 inventory_item_id);
u32 scene_ocean_battle(u32 action);
u32 scene_npc_rvice(u32 action);
u32 scene_npc_lafolie(u32 action);
u32 scene_npc_nakor(u32 action);
u32 scene_npc_travis(u32 action);
u32 scene_npc_loller(u32 action);
void current_scene_clear_choice_strings();
u32 ocean_battle_is_world_coordinate_in_ship_movement_range(u32 world_x, u32 world_y);
u32 scene_bank(u32 action);
void generate_world(char* world_name);
void test();

// Forward Declare Strings
u32 get_string_id_by_machine_name(const char* machine_name);

// ------------------------------------------------------------------------------------------------
// Resource Management
// ------------------------------------------------------------------------------------------------
#define G_STRING_DATA_SIZE (MAX_STRINGS * MAX_STRING_LENGTH * 2)
static char g_string_data[G_STRING_DATA_SIZE];  // *2 for both machine_name and text
#define G_STRING_INFO_SIZE (MAX_STRINGS * STRING_DATA_SIZE)
u32 g_string_info[G_STRING_INFO_SIZE];
u32 g_string_count = 0;

struct ShipMaterial g_ship_material_structs[MAX_SHIP_MATERIALS];

u32 g_captain_count = 0;
struct Captain g_captain_structs[MAX_CAPTAINS];

u32 g_figurehead_count = 0;
struct Figurehead g_figurehead_structs[MAX_FIGUREHEADS];

u32 g_cannon_count = 0;
struct Cannon g_cannon_structs[MAX_CANNONS];

struct World g_world_structs[MAX_WORLDS];

u32 g_layer_count = 0;
struct Layer g_layer_structs[MAX_LAYERS];

u32 g_inventory_count = 0;
struct Inventory g_inventory_structs[MAX_INVENTORIES];

u32 g_inventory_item_count = 0;
struct InventoryItem g_inventory_item_structs[MAX_INVENTORY_ITEMS * MAX_INVENTORIES];

u32 g_port_count = 0;
struct Port g_port_structs[MAX_PORTS];

u32 g_stats_count = 0;
struct Stats g_stats_structs[MAX_STATS];

u32 g_skills_count = 0;
struct Stats g_skills_structs[MAX_STATS];

u32 g_entity_count = 0;
// TODO: Wait... should we rename other things to MAX_GLOBAL_ ????
struct Entity g_entity_structs[MAX_GLOBAL_ENTITIES];

u32 g_fleet_count = 0;
struct Fleet g_fleet_structs[MAX_FLEETS];

u32 g_fleet_ship_count = 0;
struct FleetShip g_fleet_ship_structs[MAX_FLEET_SHIPS];

u32 g_fleet_captain_count = 0;
struct FleetCaptain g_fleet_captain_structs[MAX_FLEET_CAPTAINS];

u32 g_world_npc_count = 0;
struct WorldNPC g_world_npc_structs[MAX_WORLD_NPCS];

// Note: Bank does not need a resource. It's a single entity that is always present.
struct Bank g_bank;

// The "current_world" global variable is just a resource handler to a world data array
uint32_t current_world;

// Viewport width & height are global variables
uint32_t viewport_width = 0;
uint32_t viewport_height = 0;

// Camera offset is a global variable
uint32_t camera_offset_x = 0;
uint32_t camera_offset_y = 0;

// Current world
uint32_t current_world = SENTRY;
// Current scene
uint32_t current_scene_enum = SENTRY;
// Current game mode
uint32_t current_game_mode = SENTRY;

// Has the game started?
uint32_t has_game_started = false;
// Is the game accepting input?
uint32_t accepting_input = false;
// Previous game mode
uint32_t previous_game_mode = SENTRY;

uint32_t players[10];

uint32_t CurrentScene[MAX_SCENE_DATA_SIZE];
uint32_t CurrentSceneChoices[MAX_SCENE_CHOICES];
uint32_t CurrentSceneChoicesString[MAX_SCENE_CHOICES];
uint32_t CurrentSceneStates[MAX_SCENE_STATES];
uint32_t CurrentSceneStrings[MAX_SCENE_STRINGS];
uint32_t CurrentSceneInventoryItems[MAX_INVENTORY_ITEMS];

uint32_t current_user_input_number;

static uint32_t ocean_battle_data[OCEAN_BATTLE_DATA_SIZE];

// ------------------------------------------------------------------------------------------------
// MACRO - BASE STRUCT STUFF
// ------------------------------------------------------------------------------------------------
#define FIELD_ENTRY(type, field, ...) type field;
#define ACCESSOR_ENTRY(type, field, name, struct_name, max_count) \
    type get_##name##_##field(u32 id) { \
        if (id >= max_count || !storage_##struct_name.used[id]) { \
            console_log("[E] Tried to get " #field " of " #struct_name " with bad id"); \
            return SENTRY; \
        } \
        return storage_##struct_name.data[id].field; \
    } \
    void set_##name##_##field(u32 id, type value) { \
        if (id >= max_count || !storage_##struct_name.used[id]) { \
            console_log("[E] Tried to set " #field " of " #struct_name " with bad id"); \
            return; \
        } \
        storage_##struct_name.data[id].field = value; \
    }

#define DECLARE_STRUCT(struct_name, fields_macro, max_count) \
    struct struct_name { \
        fields_macro(FIELD_ENTRY, struct_name, max_count) \
    }; \

#define DECLARE_STRUCT_WITH_ACCESSORS(struct_name, fields_macro, name, max_count) \
    fields_macro(ACCESSOR_ENTRY, name, struct_name, max_count)

// ------------------------------------------------------------------------------------------------
// MACRO - STORAGE STRUCT
// ------------------------------------------------------------------------------------------------
#define DEFINE_STORAGE_STRUCT(TYPE, MAX_COUNT) \
    struct Storage##TYPE { \
        struct TYPE data[MAX_COUNT]; \
        bool used[MAX_COUNT]; \
        u32 count; \
        u32 next_open_slot; \
    }

DECLARE_STRUCT(BaseShip, BASESHIP_FIELDS, MAX_BASE_SHIPS)
DECLARE_STRUCT(Ship, SHIP_FIELDS, MAX_SHIPS)
DECLARE_STRUCT(NPC, NPC_FIELDS, MAX_NPCS)
DECLARE_STRUCT(Item, ITEM_FIELDS, MAX_ITEMS)

DEFINE_STORAGE_STRUCT(BaseShip, MAX_BASE_SHIPS);
DEFINE_STORAGE_STRUCT(Ship, MAX_SHIPS);
DEFINE_STORAGE_STRUCT(NPC, MAX_NPCS);
DEFINE_STORAGE_STRUCT(Item, MAX_ITEMS);
struct StorageBaseShip storage_BaseShip;
struct StorageShip storage_Ship;
struct StorageNPC storage_NPC;
struct StorageItem storage_Item;
// TODO: What about for Items?
// u32 general_items[MAX_GENERAL_ITEMS];
// u32 general_items_count;

DECLARE_STRUCT_WITH_ACCESSORS(BaseShip, BASESHIP_FIELDS, base_ship, MAX_BASE_SHIPS)
DECLARE_STRUCT_WITH_ACCESSORS(Ship, SHIP_FIELDS, ship, MAX_SHIPS)
DECLARE_STRUCT_WITH_ACCESSORS(Item, ITEM_FIELDS, item, MAX_ITEMS)
DECLARE_STRUCT_WITH_ACCESSORS(NPC, NPC_FIELDS, npc, MAX_NPCS)
// ------------------------------------------------------------------------------------------------
// - MACRO STORAGE SYSTEM
// ------------------------------------------------------------------------------------------------
#define DEFINE_STORAGE_SYSTEM(TYPE, STRUCT) \
    struct STRUCT generate_##TYPE() { \
        struct STRUCT empty; \
        CLEAR_STRUCT(&empty, SENTRY); \
        return empty; \
    }

DEFINE_STORAGE_SYSTEM(base_ship, BaseShip)
DEFINE_STORAGE_SYSTEM(ship, Ship)
DEFINE_STORAGE_SYSTEM(npc, NPC)
DEFINE_STORAGE_SYSTEM(item, Item)

// ------------------------------------------------------------------------------------------------
// - MACRO FIND NEXT OPEN SLOT
// ------------------------------------------------------------------------------------------------
#define DEFINE_FIND_NEXT_OPEN_SLOT(TYPE, STRUCT, MAX_COUNT) \
    void find_##TYPE##_next_open_slot() { \
        u32 found = SENTRY; \
        for (u32 i = 0; i < MAX_COUNT; ++i) { \
            if (storage_##STRUCT.used[i] == false) { \
                storage_##STRUCT.next_open_slot = i; \
                found = true; \
                break; \
            } \
        } \
        if (found == SENTRY) { \
            console_log("[E] Could not find an open slot for " #STRUCT " data"); \
        } \
    }

DEFINE_FIND_NEXT_OPEN_SLOT(base_ship, BaseShip, MAX_BASE_SHIPS)
DEFINE_FIND_NEXT_OPEN_SLOT(ship, Ship, MAX_SHIPS)
DEFINE_FIND_NEXT_OPEN_SLOT(npc, NPC, MAX_NPCS)
DEFINE_FIND_NEXT_OPEN_SLOT(item, Item, MAX_ITEMS)

// ------------------------------------------------------------------------------------------------
// - MACRO ADD CLEAR FUNCTIONS
// ------------------------------------------------------------------------------------------------
#define DEFINE_ADD_CLEAR_FUNCTIONS(TYPE, STRUCT, MAX_COUNT) \
    u32 add_##TYPE(struct STRUCT data) { \
        if (storage_##STRUCT.count >= MAX_COUNT) { \
            console_log("[E] No more left in data for " #STRUCT "s"); \
            return SENTRY; \
        } \
        u32 id = storage_##STRUCT.next_open_slot; \
        storage_##STRUCT.data[id] = data; \
        storage_##STRUCT.used[id] = true; \
        find_##TYPE##_next_open_slot(); \
        ++storage_##STRUCT.count; \
        return id; \
    } \
    \
    void clear_##TYPE(u32 id) { \
        if (storage_##STRUCT.used[id] == true) { \
            CLEAR_STRUCT(&storage_##STRUCT.data[id], SENTRY); \
            storage_##STRUCT.used[id] = false; \
            --storage_##STRUCT.count; \
            storage_##STRUCT.next_open_slot = id; \
        } \
    } \
    \
    void clear_all_##TYPE##s() { \
        for (u32 i = 0; i < MAX_COUNT; ++i) { \
            clear_##TYPE(i); \
        } \
        storage_##STRUCT.count = 0; \
        storage_##STRUCT.next_open_slot = 0; \
    }

DEFINE_ADD_CLEAR_FUNCTIONS(base_ship, BaseShip, MAX_BASE_SHIPS)
DEFINE_ADD_CLEAR_FUNCTIONS(ship, Ship, MAX_SHIPS)
DEFINE_ADD_CLEAR_FUNCTIONS(npc, NPC, MAX_NPCS)
DEFINE_ADD_CLEAR_FUNCTIONS(item, Item, MAX_ITEMS)
// TODO: What about for Items?
// if (data.type == ITEM_TYPE_GENERAL_ITEM)
// {
//     u32 intended_count = storage_items.general_items_count + 1;
//     if (intended_count >= MAX_GENERAL_ITEMS)
//     {
//         console_log("[E] No more left in data for general items");
//         return SENTRY;
//     }
//     storage_items.general_items[intended_count] = id;
//     ++storage_items.general_items_count;
// }

// ------------------------------------------------------------------------------------------------
// - MACRO FIND BY NAME
// ------------------------------------------------------------------------------------------------
#define DEFINE_FIND_BY_NAME(TYPE, STRUCT, MAX_COUNT) \
    u32 get_##TYPE##_id_by_machine_name(char* machine_name) { \
        u32 string_id = get_string_id_by_machine_name(machine_name); \
        if (string_id == SENTRY) { \
            return SENTRY; \
        } \
        for (u32 i = 0; i < MAX_COUNT; ++i) { \
            if (storage_##STRUCT.used[i] && storage_##STRUCT.data[i].name_id == string_id) { \
                return i; \
            } \
        } \
        return SENTRY; \
    }

// Note: If you want a special override then just DONT use this macro and do it manually
DEFINE_FIND_BY_NAME(base_ship, BaseShip, MAX_BASE_SHIPS)
DEFINE_FIND_BY_NAME(ship, Ship, MAX_SHIPS)
DEFINE_FIND_BY_NAME(npc, NPC, MAX_NPCS)
DEFINE_FIND_BY_NAME(item, Item, MAX_ITEMS)

// ------------------------------------------------------------------------------------------------
// - MACRO INCREMENT DECREMENT
// ------------------------------------------------------------------------------------------------
#define DEFINE_INCREMENT_DECREMENT(TYPE, STRUCT, FIELD, MAX_COUNT) \
    void increment_##TYPE##_##FIELD(u32 id) { \
        if (id >= MAX_COUNT || storage_##STRUCT.used[id] == false) { \
            console_log("[E] Tried to increment " #FIELD " of " #STRUCT " with bad id"); \
            return; \
        } \
        ++storage_##STRUCT.data[id].FIELD; \
    } \
    void decrement_##TYPE##_##FIELD(u32 id) { \
        if (id >= MAX_COUNT || storage_##STRUCT.used[id] == false) { \
            console_log("[E] Tried to decrement " #FIELD " of " #STRUCT " with bad id"); \
            return; \
        } \
        if (storage_##STRUCT.data[id].FIELD > 0) { \
            --storage_##STRUCT.data[id].FIELD; \
        } \
    }

DEFINE_INCREMENT_DECREMENT(ship, Ship, hull, MAX_SHIPS)
DEFINE_INCREMENT_DECREMENT(ship, Ship, crew, MAX_SHIPS)

// ------------------------------------------------------------------------------------------------
// - MACRO REDUCE INCREASE BY
// ------------------------------------------------------------------------------------------------
#define DEFINE_REDUCE(TYPE, STRUCT, FIELD, MAX_COUNT) \
    void reduce_##TYPE##_##FIELD(u32 id, u32 amount) { \
        if (id >= MAX_COUNT || storage_##STRUCT.used[id] == false) { \
            console_log("[E] Tried to reduce " #FIELD " of " #STRUCT " with bad id"); \
            return; \
        } \
        if (storage_##STRUCT.data[id].FIELD > amount) { \
            storage_##STRUCT.data[id].FIELD -= amount; \
        } else { \
            storage_##STRUCT.data[id].FIELD = 0; \
        } \
    }

#define DEFINE_INCREASE(TYPE, STRUCT, FIELD, MAX_COUNT) \
    void increase_##TYPE##_##FIELD(u32 id, u32 amount) { \
        if (id >= MAX_COUNT || storage_##STRUCT.used[id] == false) { \
            console_log("[E] Tried to increase " #FIELD " of " #STRUCT " with bad id"); \
            return; \
        } \
        storage_##STRUCT.data[id].FIELD += amount; \
    }

DEFINE_REDUCE(ship, Ship, hull, MAX_SHIPS)
DEFINE_REDUCE(ship, Ship, crew, MAX_SHIPS)
DEFINE_INCREASE(ship, Ship, hull, MAX_SHIPS)
DEFINE_INCREASE(ship, Ship, crew, MAX_SHIPS)

// ------------------------------------------------------------------------------------------------
// GLOBAL FUNCTIONS
// ------------------------------------------------------------------------------------------------
char* my_strcpy(char* dest, const char* src)
{
    char* original_dest = dest;
    while ((*dest++ = *src++) != '\0');
    // Null terminate
    *dest = '\0';
    return original_dest;
}
uint32_t get_string_data_offset(uint32_t index)
{
    return index * MAX_STRING_LENGTH * 2;
}
unsigned long strlen(const char* str)
{
    unsigned long len = 0;
    while (str[len] != '\0') len++;
    return len;
}
int strcmp(const char* str1, const char* str2)
{
    while (*str1 && (*str1 == *str2)) {
        str1++;
        str2++;
    }
    return *(unsigned char*)str1 - *(unsigned char*)str2;
}

// ------------------------------------------------------------------------------------------------
// Resource Initialization
// ------------------------------------------------------------------------------------------------
#define CREATE_INIT_DATA_FUNC(name, data_size, data) \
void init_data_##name() \
{ \
    for (uint32_t i = 0; i < (data_size); ++i) \
    { \
        (data)[i] = SENTRY; \
    } \
}
// CREATE_INIT_DATA_FUNC(fleet_ship, G_FLEET_SHIP_DATA_SIZE, g_fleet_ship_data);

void init_string_data(void)
{
    for (uint32_t i = 0; i < G_STRING_DATA_SIZE; ++i)
    {
        g_string_data[i] = '\0';
    }
}
void init_string_info(void)
{
    for (uint32_t i = 0; i < G_STRING_INFO_SIZE; ++i)
    {
        g_string_info[i] = SENTRY;
    }
}


// ------------------------------------------------------------------------------------------------
// Resource List
// ------------------------------------------------------------------------------------------------
// string
// npc
// general_item
// base_ship
// ship
// ship_material
// weapon
// armor
// special_item
// figurehead
// cannon
// world
// layer
// bank
// inventory
// port
// stats
// skill
// entity
// fleet
// fleet_ship
// fleet_captain
// world_npc
// captain

// ------------------------------------------------------------------------------------------------
// Global Scene Stuff
// ------------------------------------------------------------------------------------------------
uint32_t previous_scene_state;
void clear_current_scene()
{
    for (uint32_t i = 0; i < MAX_SCENE_DATA_SIZE; ++i)
    {
        // TODO: This is hacky. We need a better function or a second function. One clears everything, one clears only critical
        if (i == SCENE_TRIGGERED_BY_WORLD_NPC_ID)
        {
            continue;
        }
        CurrentScene[i] = SENTRY;
    }
    clear_current_scene_choices();
    clear_current_scene_states();
    current_scene_clear_choice_strings();
    clear_current_scene_strings();
}

void clear_current_scene_choices()
{
    for (uint32_t i = 0; i < MAX_SCENE_CHOICES; ++i)
    {
        CurrentSceneChoices[i] = SENTRY;
    }
    CurrentScene[SCENE_CURRENT_TOTAL_CHOICES] = 0;
    current_scene_clear_choice_strings();
}

void clear_current_scene_states()
{
    for (uint32_t i = 0; i < MAX_SCENE_STATES; ++i)
    {
        CurrentSceneStates[i] = SENTRY;
    }
}

void clear_current_scene_strings()
{
    for (uint32_t i = 0; i < MAX_SCENE_STRINGS; ++i)
    {
        CurrentSceneStrings[i] = SENTRY;
    }
}

// TODO: Is this still needed now?
void set_current_scene_data(uint32_t key, uint32_t value)
{
    CurrentScene[SCENE_BASIC_DATA_SIZE + key] = value;
}
// TODO: Is this still needed now?
uint32_t get_current_scene_data(uint32_t key)
{
    return CurrentScene[SCENE_BASIC_DATA_SIZE + key];
}

void set_current_scene_inventory_id(uint32_t value)
{
    CurrentScene[SCENE_CURRENT_INVENTORY_ID] = value;
}
uint32_t get_current_scene_inventory_id()
{
    return CurrentScene[SCENE_CURRENT_INVENTORY_ID];
}

void set_current_scene_string_id(uint32_t value)
{
    CurrentScene[SCENE_CURRENT_SCENE_STRING_ID] = value;
}
uint32_t get_current_scene_string_id()
{
    return CurrentScene[SCENE_CURRENT_SCENE_STRING_ID];
}

void set_current_scene_state(uint32_t value)
{
    CurrentScene[SCENE_CURRENT_STATE] = value;
}
uint32_t get_current_scene_state()
{
    return CurrentScene[SCENE_CURRENT_STATE];
}

void set_current_scene(uint32_t value)
{
    CurrentScene[SCENE_CURRENT_SCENE] = value;
}
uint32_t get_current_scene()
{
    return CurrentScene[SCENE_CURRENT_SCENE];
}

void set_current_scene_state_string_id(uint32_t value)
{
    CurrentScene[SCENE_CURRENT_STATE_STRING_ID] = value;
}
uint32_t get_current_scene_state_string_id()
{
    return CurrentScene[SCENE_CURRENT_STATE_STRING_ID];
}

void set_current_scene_triggered_by_world_npc_id(uint32_t id)
{
    CurrentScene[SCENE_TRIGGERED_BY_WORLD_NPC_ID] = id;
}
uint32_t get_current_scene_triggered_by_world_npc_id()
{
    return CurrentScene[SCENE_TRIGGERED_BY_WORLD_NPC_ID];
}

void set_current_scene_dialogue_string_id(uint32_t value)
{
    CurrentScene[SCENE_CURRENT_DIALOGUE_STRING_ID] = value;
}
uint32_t get_current_scene_dialogue_string_id()
{
    return CurrentScene[SCENE_CURRENT_DIALOGUE_STRING_ID];
}

uint32_t get_current_scene_total_choices()
{
    return CurrentScene[SCENE_CURRENT_TOTAL_CHOICES];
}
void set_current_scene_total_choices(uint32_t total)
{
    CurrentScene[SCENE_CURRENT_TOTAL_CHOICES] = total;
}

uint32_t get_current_scene_total_states()
{
    return CurrentScene[SCENE_TOTAL_STATES];
}
void set_current_scene_total_states(uint32_t total)
{
    CurrentScene[SCENE_TOTAL_STATES] = total;
}

uint32_t get_current_scene_choice_enabled(uint32_t choice)
{
    CurrentScene[SCENE_CURRENT_CHOICE] = choice;
    if (CurrentSceneChoices[choice] != SENTRY)
    {
        return CurrentSceneChoices[choice];
    }
    return SENTRY;
}

void set_current_scene_needs_numerical_input(uint32_t on_off)
{
    CurrentScene[SCENE_WAITING_FOR_INPUT_NUMBER] = SENTRY;
    if (on_off == true)
    {
        CurrentScene[SCENE_WAITING_FOR_INPUT_NUMBER] = 1;
    }
}
uint32_t get_current_scene_needs_numerical_input()
{
    return CurrentScene[SCENE_WAITING_FOR_INPUT_NUMBER];
}

void current_scene_make_choice(uint32_t choice)
{
    CurrentScene[SCENE_CURRENT_CHOICE] = choice;
    if (get_current_scene() == SCENE_BLACKJACK)
    {
        scene_blackjack(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_GENERAL_SHOP)
    {
        scene_general_shop(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_OCEAN_BATTLE)
    {
        scene_ocean_battle(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_NPC_RVICE)
    {
        scene_npc_rvice(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_NPC_LAFOLIE)
    {
        scene_npc_lafolie(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_NPC_NAKOR)
    {
        scene_npc_nakor(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_NPC_TRAVIS)
    {
        scene_npc_travis(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_NPC_LOLLER)
    {
        scene_npc_loller(SCENE_MAKE_CHOICE);
    }
    else if (get_current_scene() == SCENE_BANK)
    {
        scene_bank(SCENE_MAKE_CHOICE);
    }
}
uint32_t current_scene_get_current_choice()
{
    return CurrentScene[SCENE_CURRENT_CHOICE];
}
uint32_t current_scene_add_choice(uint32_t value)
{
    uint32_t total_choices = get_current_scene_total_choices();
    CurrentSceneChoices[total_choices] = value;
    set_current_scene_total_choices(total_choices + 1);
    return total_choices;
}
uint32_t current_scene_get_choice(uint32_t which)
{
    return CurrentSceneChoices[which];
}
void current_scene_clear_choice_strings()
{
    for (uint32_t i = 0; i < MAX_SCENE_CHOICES; ++i)
    {
        CurrentSceneChoicesString[i] = SENTRY;
    }
}
void current_scene_set_choice_string_id(uint32_t choice, uint32_t string_id)
{
    CurrentSceneChoicesString[choice] = string_id;
}
uint32_t get_current_scene_choice_string_id(uint32_t choice)
{
    return CurrentSceneChoicesString[choice];
}

void current_scene_add_state(uint32_t value)
{
    uint32_t total_states = get_current_scene_total_states();
    CurrentSceneStates[total_states] = value;
    set_current_scene_total_states(total_states + 1);
}
uint32_t current_scene_get_state(uint32_t which)
{
    return CurrentSceneStates[which];
}

void set_current_scene_total_strings(uint32_t value)
{
    CurrentSceneStrings[SCENE_TOTAL_STRINGS] = value;
}
uint32_t get_current_scene_total_strings()
{
    return CurrentScene[SCENE_TOTAL_STRINGS];
}

void map_current_scene_inventory_id()
{
    uint32_t world_npc_id = get_current_scene_triggered_by_world_npc_id();
    set_current_scene_inventory_id(get_world_npc_inventory_id(world_npc_id));
}
void clear_current_scene_inventory_items()
{
    for (uint32_t i = 0; i < MAX_INVENTORY_ITEMS; ++i)
    {
        CurrentSceneInventoryItems[i] = SENTRY;
    }
}
void map_current_scene_inventory_items()
{
    uint32_t inventory_id = get_current_scene_inventory_id();
    clear_current_scene_inventory_items();
    uint32_t csii = 0;
    for (uint32_t i = 0; i < MAX_INVENTORY_ITEMS; ++i)
    {
        if (get_inventory_item_inventory_id(i) == inventory_id)
        {
            CurrentSceneInventoryItems[csii] = i;
            ++csii;
        }
    }
}
uint32_t get_current_scene_inventory_item_string_id(uint32_t inventory_item_id)
{
    uint32_t real_inventory_id = CurrentSceneInventoryItems[inventory_item_id];
    return get_inventory_item_string_id(real_inventory_id);
}
uint32_t get_current_scene_inventory_item_adjusted_price(uint32_t inventory_item_id)
{
    uint32_t real_inventory_id = CurrentSceneInventoryItems[inventory_item_id];
    return get_inventory_item_adjusted_price(real_inventory_id);
}

void current_scene_add_string(uint32_t value)
{
    uint32_t total_strings = get_current_scene_total_strings();
    CurrentSceneStrings[total_strings] = value;
    set_current_scene_total_strings(total_strings + 1);
}
uint32_t current_scene_get_string(uint32_t which)
{
    return CurrentSceneStrings[which];
}

// ------------------------------------------------------------------------------------------------
// Global World Data
// ------------------------------------------------------------------------------------------------
#define G_GLOBAL_WORLD_DATA_SIZE 50000
// MAXIMUM_WORLD_WIDTH * MAXIMUM_WORLD_HEIGHT * MAXIMUM_WORLD_LAYERS
uint32_t GLOBAL_WORLD_DATA[G_GLOBAL_WORLD_DATA_SIZE];
uint32_t GLOBAL_WORLD_DATA_ITERATOR;
void add_value_to_global_world_data(uint32_t layer_id, uint32_t x, uint32_t y, uint32_t value)
{
    uint32_t layer_width = get_layer_width(layer_id);
    uint32_t offset = x + y * layer_width;
    offset += get_layer_global_world_data_offset(layer_id);
    if (offset >= G_GLOBAL_WORLD_DATA_SIZE)
    {
        console_log("ERROR: Global world data not big enough for layer data");
    }
    GLOBAL_WORLD_DATA[offset] = value;
}
void clear_global_world_data()
{
    for (uint32_t i = 0; i < G_GLOBAL_WORLD_DATA_SIZE; ++i)
    {
        GLOBAL_WORLD_DATA[i] = SENTRY;
    }
    GLOBAL_WORLD_DATA_ITERATOR = 0;
}
uint32_t get_layer_data_by_coordinates(uint32_t layer_id, uint32_t x, uint32_t y)
{
    uint32_t layer_width = get_layer_width(layer_id);
    uint32_t offset = x + y * layer_width;
    offset += get_layer_global_world_data_offset(layer_id);
    return GLOBAL_WORLD_DATA[offset];
}

// ------------------------------------------------------------------------------------------------
// Entities
// ------------------------------------------------------------------------------------------------
uint32_t check_if_player_stepped_on_entity(u32 player_id)
{
    for (u32 i = 0; i < MAX_GLOBAL_ENTITIES; ++i)
    {
        if (
            g_entity_structs[i].world_position_x == get_player_in_world_x(player_id) &&
            g_entity_structs[i].world_position_y == get_player_in_world_y(player_id) &&
            g_entity_structs[i].is_interactable == true &&
            g_entity_structs[i].interaction_on_step_over == true
        )
        {
            // TODO: interaction_scene
            generate_world("dingus_land");
            return true;
        }
    }
    return SENTRY;
}
void set_default_entity(u32 entity_id)
{
    g_entity_structs[entity_id].name_id = SENTRY;
    g_entity_structs[entity_id].is_interactable = SENTRY;
    g_entity_structs[entity_id].is_solid = SENTRY;
    g_entity_structs[entity_id].interaction_on_step_over = SENTRY;
    g_entity_structs[entity_id].interaction_scene = SENTRY;
    g_entity_structs[entity_id].world_position_x = SENTRY;
    g_entity_structs[entity_id].world_position_y = SENTRY;
}
void init_structs_entities()
{
    for (u32 i = 0; i < MAX_GLOBAL_ENTITIES; ++i)
    {
        set_default_entity(i);
    }
}

// ------------------------------------------------------------------------------------------------
// Resource Creation
// ------------------------------------------------------------------------------------------------
#define CREATE_ENTITY_FUNC(name, data_type, data_size, max_entities, name_id, count, entity_data) \
uint32_t create_##name(data_type data[data_size], ...) \
{ \
    va_list args; \
    va_start(args, data); \
    uint32_t should_clear = va_arg(args, uint32_t); \
    uint32_t value = SENTRY; \
    CREATE_ENTITY(data, entity_data, data_size, max_entities, name_id, count, value); \
    if (should_clear == 1) \
    { \
        CLEAR_DATA(data, data_size); \
    } \
    va_end(args); \
    return value; \
}

#define CREATE_ENTITY(data, entity_data, entity_size, max_entities, name_id, count, value) \
    do { \
        if (data[name_id] == SENTRY) \
        { \
            console_log("Tried to create an entity with an empty name"); \
            value = SENTRY; \
            break; \
        } \
        for (uint32_t i = 0; i < max_entities; ++i) \
        { \
            uint32_t offset = i * entity_size; \
            if (entity_data[offset + name_id] == SENTRY) \
            { \
                for (uint32_t j = 0; j < entity_size; j += 1) \
                { \
                    entity_data[offset + j] = data[j]; \
                } \
                count += 1; \
                value = i; \
                break; \
            } \
        } \
    } while (0)

#define CLEAR_DATA(data, size) \
    do { \
        for (uint32_t i = 0; i < (size); ++i) \
        { \
            (data)[i] = SENTRY; \
        } \
    } while (0)

#define CLEAR_DATA(data, size) \
    do { \
        for (uint32_t i = 0; i < (size); ++i) \
        { \
            (data)[i] = SENTRY; \
        } \
    } while (0)

#define FREE_ENTITY(entity_type, entity_data, entity_size, max_entities, count) \
void free_##entity_type(uint32_t data_index) \
{ \
    if (data_index >= max_entities) \
    { \
        console_log("Tried to free a " #entity_type " resource that doesn't exist"); \
        return; \
    } \
    uint32_t offset = data_index * entity_size; \
    for (uint32_t i = 0; i < entity_size; ++i) \
    { \
        entity_data[offset + i] = SENTRY; \
    } \
    count -= 1; \
}
// USAGE: FREE_ENTITY(npc, g_npc_data, NPC_DATA_SIZE, MAX_NPCS, g_npc_count);

// Create creation functions based on Macro usage
// CREATE_ENTITY_FUNC(fleet_ship, uint32_t, FLEET_SHIP_DATA_SIZE, MAX_FLEET_SHIPS, FLEET_SHIP_SHIP_ID, g_fleet_ship_count, g_fleet_ship_data);


int32_t create_string(const char* machine_name, const char* text)
{
    uint32_t machine_name_len = 0;
    uint32_t text_len = 0;
    
    // Calculate lengths
    while (machine_name[machine_name_len] && machine_name_len < MAX_STRING_LENGTH) machine_name_len++;
    while (text[text_len] && text_len < MAX_STRING_LENGTH) text_len++;

    if (machine_name_len >= MAX_STRING_LENGTH || text_len >= MAX_STRING_LENGTH)
    {
        console_log("String is too long");
        return SENTRY;
    }

    for (uint32_t i = 0; i < MAX_STRINGS; ++i)
    {
        uint32_t info_offset = i * STRING_DATA_SIZE;
        if (g_string_info[info_offset + (uint32_t)STRING_MACHINE_NAME_LENGTH] == SENTRY)
        {
            // Calculate the offset for string data
            uint32_t string_offset = i * (MAX_STRING_LENGTH * 2);
            
            // Clear the memory first
            for (uint32_t j = 0; j < MAX_STRING_LENGTH * 2; j++)
            {
                g_string_data[string_offset + j] = '\0';
            }
            
            // Copy machine name
            my_strcpy(&g_string_data[string_offset], machine_name);
            // Copy text after machine name
            my_strcpy(&g_string_data[string_offset + MAX_STRING_LENGTH], text);
            
            // Store lengths
            g_string_info[info_offset + (uint32_t)STRING_MACHINE_NAME_LENGTH] = machine_name_len;
            g_string_info[info_offset + (uint32_t)STRING_TEXT_LENGTH] = text_len;
            
            g_string_count += 1;
            return i;
        }
    }
    return SENTRY;
}
// TODO: Update this for string
// void free_string(uint32_t data_index) {
//     if (data_index >= MAX_STRINGS) {
//         console_log("Tried to free a string resource that doesn't exist");
//         return;
//     }
//     uint32_t offset = data_index * STRING_DATA_SIZE;
//     g_string_info[offset + (uint32_t)STRING_MACHINE_NAME_LENGTH] = SENTRY;
//     g_string_info[offset + (uint32_t)STRING_TEXT_LENGTH] = SENTRY;
//     offset = data_index * MAX_STRING_LENGTH * 2;
//     for (uint32_t i = 0; i < MAX_STRING_LENGTH * 2; ++i) {
//         g_string_data[offset + i] = '\0';
//     }
//     g_string_count -= 1;
// }

// ------------------------------------------------------------------------------------------------ //
// STRING FUNCTIONS
// ------------------------------------------------------------------------------------------------ //
u32 get_string_id_by_machine_name(const char* machine_name)
{
    for (uint32_t i = 0; i < MAX_STRINGS; ++i)
    {
        uint32_t info_offset = i * STRING_DATA_SIZE;
        // Check if this slot is occupied first
        if (g_string_info[info_offset + (uint32_t)STRING_MACHINE_NAME_LENGTH] == SENTRY)
        {
            continue;
        }
        
        // Get pointer to the start of this string's machine name
        uint32_t string_offset = i * (MAX_STRING_LENGTH * 2);
        // Note: Machine name is max_string_length + offset
        const char* stored_name = &g_string_data[string_offset];
        
        // console_log_format("Comparing '%s' with '%s'", stored_name, machine_name);
        
        if (strcmp(stored_name, machine_name) == 0)
        {
            return i;
        }
    }
    console_log_format("== could not find string id by machine name %s ==", machine_name);
    return SENTRY;
}
const char* get_string_text(uint32_t index)
{
    if (index >= MAX_STRINGS) return "";
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    uint32_t info_offset = offset + STRING_DATA_SIZE;
    uint32_t length = g_string_info[info_offset + (uint32_t)STRING_TEXT_LENGTH];
    char slice[length + 1];
    for (uint32_t j = 0; j < length; j += 1)
    {
        slice[j] = g_string_data[offset + j];
    }
    slice[length] = '\0';
    return slice;
}
const char* get_string_machine_name(uint32_t index)
{
    if (index >= MAX_STRINGS)
    {
        console_log("Tried to get a string beyond what the system holds");
        return "";
    }
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    uint32_t info_offset = index * STRING_DATA_SIZE;
    uint32_t length = g_string_info[info_offset + (uint32_t)STRING_MACHINE_NAME_LENGTH];
    char slice[length + 1];
    for (uint32_t j = 0; j < length; j += 1)
    {
        slice[j] = g_string_data[offset + j];
    }
    slice[length] = '\0';
    return slice;
}
char* get_string_text_ptr(uint32_t index)
{
    if (index >= MAX_STRINGS) return NULL;
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    return &g_string_data[offset + (uint32_t)MAX_STRING_LENGTH];
}
uint32_t get_string_text_len(uint32_t index)
{
    if (index >= MAX_STRINGS)
    {
        console_log("Tried to get the length of a string that doesn't exist");
        console_log_format("Index: %d", index);
        return SENTRY;
    }
    uint32_t offset = index * STRING_DATA_SIZE;
    return g_string_info[offset + (uint32_t)STRING_TEXT_LENGTH];
}
char* get_string_machine_name_ptr(uint32_t index)
{
    if (index >= MAX_STRINGS) return NULL;
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    return &g_string_data[offset];
}
uint32_t get_string_machine_name_len(uint32_t index)
{
    if (index >= MAX_STRINGS)
    {
        console_log("Tried to get the length of a string that doesn't exist");
        return SENTRY;
    }
    uint32_t offset = index * STRING_DATA_SIZE;
    return g_string_info[offset + (uint32_t)STRING_MACHINE_NAME_LENGTH];
}

// ------------------------------------------------------------------------------------------------ //
// - CANNONS
// ------------------------------------------------------------------------------------------------ //
void set_cannon_name_id(uint32_t index, uint32_t name_id)
{
    if (index >= MAX_CANNONS) return;
    if (name_id >= MAX_STRINGS) return;
    g_cannon_structs[index].name_id = name_id;
}
uint32_t get_cannon_name_id(uint32_t index)
{
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_structs[index].name_id;
}
const char* get_cannon_machine_name(uint32_t index)
{
    if (index >= MAX_CANNONS) return "";
    uint32_t name_id = get_cannon_name_id(index);
    return get_string_machine_name(name_id);
}
const char* get_cannon_text(uint32_t index)
{
    if (index >= MAX_CANNONS) return "";
    uint32_t name_id = get_cannon_name_id(index);
    return get_string_text(name_id);
}
void set_cannon_range(uint32_t index, uint32_t range)
{
    if (index >= MAX_CANNONS) return;
    g_cannon_structs[index].range = range;
}
uint32_t get_cannon_range(uint32_t index)
{
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_structs[index].range;
}
void set_cannon_power(uint32_t index, uint32_t power)
{
    if (index >= MAX_CANNONS) return;
    g_cannon_structs[index].power = power;
}
uint32_t get_cannon_power(uint32_t index)
{
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_structs[index].power;
}
void set_cannon_base_price(uint32_t index, uint32_t base_price)
{
    if (index >= MAX_CANNONS) return;
    g_cannon_structs[index].base_price = base_price;
}
uint32_t get_cannon_base_price(uint32_t index)
{
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_structs[index].base_price;
}

// ------------------------------------------------------------------------------------------------ //
// - DISTANCES
// ------------------------------------------------------------------------------------------------ //
uint32_t distance_between_coordinates(uint32_t a_x, uint32_t a_y, uint32_t b_x, uint32_t b_y)
{
    uint32_t dx = (b_x > a_x) ? (b_x - a_x) : (a_x - b_x);
    uint32_t dy = (b_y > a_y) ? (b_y - a_y) : (a_y - b_y);
    return dx + dy;
}
bool is_coordinate_in_range_of_coordinate(uint32_t a_x, uint32_t a_y, uint32_t b_x, uint32_t b_y, uint32_t range)
{
    return distance_between_coordinates(a_x, a_y, b_x, b_y) <= range;
}

// ------------------------------------------------------------------------------------------------ //
// - RNG
// ------------------------------------------------------------------------------------------------ //
uint32_t tick_counter = 1;
uint32_t rng_state = 1;
uint32_t init_random(uint32_t seed)
{
    rng_state = seed;
    return rng_state;
}
uint32_t get_random_number(uint32_t min, uint32_t max)
{
    uint32_t rng_state = init_random(tick_counter);
    uint32_t adjusted_max = max;
    if (min == max)
    {
        adjusted_max = 100;
    }
    uint32_t range = adjusted_max - min + 1;
    uint32_t result = min + (rng_state % range);
    
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

// ------------------------------------------------------------------------------------------------ //
// - INPUT
// ------------------------------------------------------------------------------------------------ //
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
    // TODO: Pause the game/tick
}
void user_input_right_bumper()
{
    generate_world("athens");
}
void user_input_number(uint32_t number)
{
    // Note: This is a bit weird but we are essentially setting the user number and then passing off the "event" to the handler
    current_user_input_number = number;
    handle_input(USER_INPUT_CUSTOM_NUMBER);
}
void handle_interaction_scene(uint32_t interaction_scene, uint32_t world_npc_id)
{
    if (interaction_scene == SCENE_BLACKJACK)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_blackjack(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_GENERAL_SHOP)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_general_shop(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_OCEAN_BATTLE)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_ocean_battle(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_NPC_RVICE)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_rvice(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_NPC_LAFOLIE)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_lafolie(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_NPC_NAKOR)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_nakor(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_NPC_TRAVIS)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_travis(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_NPC_LOLLER)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_loller(SCENE_ACTION_INIT);
    }
    else if (interaction_scene == SCENE_BANK)
    {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_bank(SCENE_ACTION_INIT);
    }
}
void handle_input(uint32_t input)
{
    // TODO: If current_game_mode is GAME_MODE_IN_PORT etc...
    // NOTE: Apparenty you have to declare variables up here, NOT INSIDE THE CASE FUNCTIONS THEMSELVES
    if (current_game_mode == GAME_MODE_IN_PORT)
    {
        uint32_t world_npc_id = get_player_in_world(0);
        uint32_t current_world_x = get_world_npc_x(world_npc_id);
        uint32_t current_world_y = get_world_npc_y(world_npc_id);
        uint32_t current_world_direction = get_world_npc_direction(world_npc_id);
        switch (input)
        {
            case USER_INPUT_A:
                if (current_world_direction == DIRECTION_UP) 
                {
                    if (current_world_y > 0)
                    {
                        uint32_t intended_y = current_world_y - 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == current_world_x && other_world_y == intended_y)
                            {
                                uint32_t interaction_scene = get_world_npc_interaction_scene(i);
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                }
                else if (current_world_direction == DIRECTION_DOWN)
                {
                    if (current_world_y < get_current_world_height())
                    {
                        uint32_t intended_y = current_world_y + 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == current_world_x && other_world_y == intended_y)
                            {
                                uint32_t interaction_scene = get_world_npc_interaction_scene(i);
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                }
                else if (current_world_direction == DIRECTION_LEFT)
                {
                    if (current_world_x > 0)
                    {
                        uint32_t intended_x = current_world_x - 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == intended_x && other_world_y == current_world_y)
                            {
                                uint32_t interaction_scene = get_world_npc_interaction_scene(i);
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                }
                else if (current_world_direction == DIRECTION_RIGHT)
                {
                    if (current_world_x < get_current_world_width())
                    {
                        uint32_t intended_x = current_world_x + 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i)
                        {
                            if (i == world_npc_id)
                            {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == intended_x && other_world_y == current_world_y)
                            {
                                uint32_t interaction_scene = get_world_npc_interaction_scene(i);
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
                if (current_game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_up(0);
                    check_if_player_stepped_on_entity(0);
                    update_camera();
                }
                break;
            case USER_INPUT_DOWN:
                if (current_game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_down(0);
                    check_if_player_stepped_on_entity(0);
                    update_camera();
                }
                break;
            case USER_INPUT_LEFT:
                if (current_game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_left(0);
                    check_if_player_stepped_on_entity(0);
                    update_camera();
                }
                break;
            case USER_INPUT_RIGHT:
                if (current_game_mode != GAME_MODE_IN_SCENE)
                {
                    move_player_right(0);
                    check_if_player_stepped_on_entity(0);
                    update_camera();
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

// ------------------------------------------------------------------------------------------------ //
// - SHOULD REDRAW
// ------------------------------------------------------------------------------------------------ //
enum ShouldRedraw should_redraw = SHOULD_REDRAW_NOTHING;
uint32_t renderer_should_redraw()
{
    if (should_redraw > 0)
    {
        enum ShouldRedraw original_should_redraw = should_redraw;
        should_redraw = SHOULD_REDRAW_NOTHING;
        return original_should_redraw;
    }

    return 0;
}
void should_redraw_everything()
{
    should_redraw = SHOULD_REDRAW_EVERYTHING;
}

// ------------------------------------------------------------------------------------------------
// - INPUT OUTPUT BUFFERS
// ------------------------------------------------------------------------------------------------
extern void js_output_string_buffer(void* ptr, uint32_t len);
extern void js_output_array_buffer(void* ptr, uint32_t len);
uint32_t input_string_buffer_length;
uint32_t input_array_buffer_length;
#define OUTPUT_ARRAY_BUFFER_SIZE 100
uint32_t output_array_buffer[OUTPUT_ARRAY_BUFFER_SIZE];
#define OUTPUT_STRING_BUFFER_SIZE 1024
uint8_t* output_string_buffer;
#define INPUT_ARRAY_BUFFER_SIZE 100
#define INPUT_STRING_BUFFER_SIZE 1024
uint32_t input_array_buffer[INPUT_ARRAY_BUFFER_SIZE];
uint8_t input_string_buffer[INPUT_STRING_BUFFER_SIZE];
void to_output_string_buffer(const char* message)
{
    if (message != NULL)
    {
        js_output_string_buffer((void*)message, (uint32_t)(sizeof(char) * strlen(message)));
    }
}
void to_output_array_buffer(uint32_t array[])
{
    for (int i = 0; i < OUTPUT_ARRAY_BUFFER_SIZE; ++i)
    {
        output_array_buffer[i] = array[i];
    }
    js_output_array_buffer(output_array_buffer, OUTPUT_ARRAY_BUFFER_SIZE * sizeof(uint32_t));
}
void set_input_string_buffer_length(uint32_t length)
{
    input_string_buffer_length = length;
}
void set_input_array_buffer_length(uint32_t length)
{
    input_array_buffer_length = length;
}
uint8_t* get_input_string_buffer_ptr()
{
    return input_string_buffer;
}
uint32_t* get_input_array_buffer_ptr()
{
    return input_array_buffer;
}
uint8_t* get_output_string_buffer_ptr()
{
    return output_string_buffer;
}
uint32_t* get_output_array_buffer_ptr()
{
    return output_array_buffer;
}
uint32_t get_input_string_buffer_len()
{
    return INPUT_STRING_BUFFER_SIZE;
}
uint32_t get_input_array_buffer_len()
{
    return INPUT_ARRAY_BUFFER_SIZE;
}
char* format_input_string()
{
    static char formatted[256];
    // somehow clear formatted using NOT stdlib functions
    for (uint32_t i = 0; i < 256; ++i)
    {
        formatted[i] = 0;
    }
    
    char* input = (char*)input_string_buffer;
    if (input == NULL)
    {
        console_log("Warning: Input string is NULL");
        return formatted;
    }
    
    uint32_t len = strlen(input);
    for (uint32_t i = 0; i < len && i < 255; i++)
    {
        formatted[i] = input[i];
    }
    formatted[255] = '\0';
    
    return formatted;
}
void write_to_output_buffer(char* str)
{
    for (uint32_t i = 0; i < OUTPUT_STRING_BUFFER_SIZE; ++i)
    {
        output_string_buffer[i] = 0;
    }
    for (uint32_t i = 0; i < strlen(str); ++i)
    {
        output_string_buffer[i] = str[i];
    }
}
uint32_t find_string_id_by_machine_name_from_input()
{
    char* input = (char*)input_string_buffer;
    input[input_string_buffer_length] = '\0';
    for (uint32_t i = input_string_buffer_length + 1; i < INPUT_STRING_BUFFER_SIZE; i++)
    {
        input[i] = '\0';
    }
    if (input == NULL)
    {
        console_log("Warning: Input string is NULL");
        return SENTRY;
    }
    // input_string_buffer_length
    u32 string_id = get_string_id_by_machine_name(input);
    return string_id;
}

// ------------------------------------------------------------------------------------------------
// - CAMERA
// ------------------------------------------------------------------------------------------------
void reset_camera()
{
    camera_offset_x =0;
    camera_offset_y =0;
}
void move_camera_down()
{
    if (current_world == SENTRY)
    {
        return;
    }
    u32 map_height = get_current_world_height();
    
    // Calculate the maximum allowed camera offset
    uint32_t max_camera_offset_y = max(0, map_height - viewport_height);
    
    // Check if moving down would exceed the map bounds
    if (camera_offset_y < max_camera_offset_y)
    {
        camera_offset_y += 1;
        should_redraw_everything();
    }
}
void move_camera_right()
{
    if (current_world == SENTRY)
    {
        return;
    }
    u32 map_width = get_current_world_width();
    
    // Calculate the maximum allowed camera offset
    uint32_t max_camera_offset_x = max(0, map_width - viewport_width);
    
    // Check if moving right would exceed the map bounds
    if (camera_offset_x < max_camera_offset_x)
    {
        camera_offset_x += 1;
        should_redraw_everything();
    }
}
void move_camera_up()
{
    if (camera_offset_y > 0)
    {
        camera_offset_y -= 1;
        should_redraw_everything();
    }
}
void move_camera_left()
{
    if (camera_offset_x > 0)
    {
        camera_offset_x -= 1;
        should_redraw_everything();
    }
}
void update_camera()
{
    uint32_t world_npc_id = get_player_in_world(0);
    uint32_t player_x = get_world_npc_x(world_npc_id);
    uint32_t player_y = get_world_npc_y(world_npc_id);
    if (is_world_coordinate_halfway_of_viewport_more_than_x(player_x))
    {
        move_camera_right();
    }
    else if (is_world_coordinate_halfway_of_viewport_less_than_x(player_x) && camera_offset_x > 0)
    {
        move_camera_left();
    }
    if (is_world_coordinate_halfway_of_viewport_more_than_y(player_y))
    {
        move_camera_down();
    }
    else if (is_world_coordinate_halfway_of_viewport_less_than_y(player_y) && camera_offset_y > 0)
    {
        move_camera_up();
    }
    should_redraw_everything();
}
u32 get_camera_offset_x()
{
    return camera_offset_x;
}
u32 get_camera_offset_y()
{
    return camera_offset_y;
}

// ------------------------------------------------------------------------------------------------
// - VIEWPORT
// ------------------------------------------------------------------------------------------------
void set_viewport_size(uint32_t width, uint32_t height)
{
    viewport_width = width;
    viewport_height = height;
}
uint32_t get_viewport_width()
{
    return viewport_width;
}
uint32_t get_viewport_height()
{
    return viewport_height;
}
uint32_t get_viewport_value_at_coordinates(uint32_t layer_index, uint32_t x, uint32_t y)
{
    if (current_world == SENTRY)
    {
        return SENTRY;
    }
    u32 world_width = get_current_world_width();
    u32 world_height = get_current_world_height();
    uint32_t x_padding = 0;
    uint32_t y_padding = 0;
    if (viewport_width > world_width)
    {
        x_padding = (viewport_width - world_width) / 2;
    }
    if (viewport_height > world_height)
    {
        y_padding = (viewport_height - world_height) / 2;
    }
    uint32_t x_offset = x - x_padding;
    uint32_t y_offset = y - y_padding;
    x_offset += camera_offset_x;
    y_offset += camera_offset_y;
    if (x_offset < 0 || y_offset < 0 || x_offset >= world_width || y_offset >= world_height)
    {
        // console_log_format("Off the edge of viewport %d %d %d %d", x_offset, y_offset, world_width, world_height);
        return SENTRY;
    }

    const char* machine_name = get_layer_machine_name(layer_index);
    if (strcmp("npc_layer", machine_name) == 0)
    {
        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i)
        {
            if (
                get_world_npc_x(i) == x_offset &&
                get_world_npc_y(i) == y_offset
            )
            {
                return i;
            }
        }
        return SENTRY;
    }

    if (strcmp("entity_layer", machine_name) == 0)
    {
        for (u32 i = 0; i < 10; ++i)
        {
            if (
                g_entity_structs[i].world_position_x == x_offset &&
                g_entity_structs[i].world_position_y == y_offset
            )
            {
                return i;
            }
        }
        return SENTRY;
    }

    if (get_layer_same_value(layer_index) != SENTRY)
    {
        return get_layer_same_value(layer_index);
    }
    uint32_t value = get_layer_data_by_coordinates(layer_index, x_offset, y_offset);
    return value;
}
bool is_world_coordinate_in_viewport(uint32_t x, uint32_t y)
{
    return x >= camera_offset_x && x < camera_offset_x + viewport_width &&
           y >= camera_offset_y && y < camera_offset_y + viewport_height;
}
uint32_t is_world_coordinate_halfway_of_viewport_more_than_x(uint32_t x)
{
    uint32_t halfway_x = camera_offset_x + viewport_width / 2;
    return x > halfway_x;
}
uint32_t is_world_coordinate_halfway_of_viewport_more_than_y(uint32_t y)
{
    uint32_t halfway_y = camera_offset_y + viewport_height / 2;
    return y > halfway_y;
}
uint32_t is_world_coordinate_halfway_of_viewport_less_than_x(uint32_t x)
{
    uint32_t halfway_x = camera_offset_x + viewport_width / 2;
    return x < halfway_x;
}
uint32_t is_world_coordinate_halfway_of_viewport_less_than_y(uint32_t y)
{
    uint32_t halfway_y = camera_offset_y + viewport_height / 2;
    return y < halfway_y;
}
uint32_t get_world_coordinate_x_from_viewport_coordinate(uint32_t x, uint32_t y)
{
    if (current_world == SENTRY)
    {
        return SENTRY;
    }
    u32 world_width = get_current_world_width();
    u32 world_height = get_current_world_height();
    uint32_t x_padding = 0;
    uint32_t y_padding = 0;
    if (viewport_width > world_width)
    {
        x_padding = (viewport_width - world_width) / 2;
    }
    if (viewport_height > world_height)
    {
        y_padding = (viewport_height - world_height) / 2;
    }
    uint32_t x_offset = x - x_padding;
    uint32_t y_offset = y - y_padding;
    x_offset += camera_offset_x;
    y_offset += camera_offset_y;
    if (x_offset < 0 || y_offset < 0 || x_offset >= world_width || y_offset >= world_height)
    {
        // console_log_format("Off the edge of viewport %d %d %d %d", x_offset, y_offset, world_width, world_height);
        return SENTRY;
    }

    return x_offset;
}
uint32_t get_world_coordinate_y_from_viewport_coordinate(uint32_t x, uint32_t y)
{
    if (current_world == SENTRY)
    {
        return SENTRY;
    }
    u32 world_width = get_current_world_width();
    u32 world_height = get_current_world_height();
    uint32_t x_padding = 0;
    uint32_t y_padding = 0;
    if (viewport_width > world_width)
    {
        x_padding = (viewport_width - world_width) / 2;
    }
    if (viewport_height > world_height)
    {
        y_padding = (viewport_height - world_height) / 2;
    }
    uint32_t x_offset = x - x_padding;
    uint32_t y_offset = y - y_padding;
    x_offset += camera_offset_x;
    y_offset += camera_offset_y;
    if (x_offset < 0 || y_offset < 0 || x_offset >= world_width || y_offset >= world_height)
    {
        // console_log_format("Off the edge of viewport %d %d %d %d", x_offset, y_offset, world_width, world_height);
        return SENTRY;
    }

    return y_offset;
}

// ------------------------------------------------------------------------------------------------ //
// - WORLDS & LAYERS
// ------------------------------------------------------------------------------------------------ //
u32 get_world_id_by_machine_name(char* machine_name)
{
    u32 world_id = SENTRY;
    u32 world_name_id = get_string_id_by_machine_name(machine_name);
    for (u32 i = 0; i < MAX_WORLDS; i++)
    {
        if (g_world_structs[i].name_id == world_name_id)
        {
            world_id = i;
            break;
        }
    }

    return world_id;
}
u32 get_current_world_width()
{
    return g_world_structs[current_world].width;
}
uint32_t get_current_world_height()
{
    return g_world_structs[current_world].height;
}
uint32_t get_current_world_total_layers()
{
    return g_world_structs[current_world].total_layers;
}
uint32_t get_current_world_name_id()
{
    return g_world_structs[current_world].name_id;
}
uint32_t get_layer_width(uint32_t layer_index)
{
    return g_layer_structs[layer_index].width;
}
uint32_t get_layer_height(uint32_t layer_index)
{
    return g_layer_structs[layer_index].height;
}
uint32_t get_layer_global_world_data_offset(uint32_t layer_index)
{
    return g_layer_structs[layer_index].global_world_data_offset;
}
uint32_t get_layer_is_block(uint32_t layer_index)
{
    return g_layer_structs[layer_index].is_block;
}
uint32_t get_layer_name_id(uint32_t layer_index)
{
    return g_layer_structs[layer_index].name_id;
}
uint32_t get_layer_type(uint32_t layer_index)
{
    return g_layer_structs[layer_index].type;
}
uint32_t get_layer_same_value(uint32_t layer_index)
{
    return g_layer_structs[layer_index].same_value;
}
const char* get_layer_machine_name(uint32_t layer_index)
{
    uint32_t name_id = get_layer_name_id(layer_index);
    return get_string_machine_name(name_id);
}
uint32_t find_layer_id_by_string_id(uint32_t string_id)
{
    for (uint32_t i = 0; i < MAX_LAYERS; ++i)
    {
        if (get_layer_name_id(i) == string_id)
        {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_layer_id_by_machine_name(char* machine_name)
{
    for (uint32_t i = 0; i < MAX_LAYERS; ++i) {
        uint32_t name_id = get_layer_name_id(i);
        const char* grabbed_machine_name = get_string_machine_name(name_id);
        if (strcmp(machine_name, grabbed_machine_name) == 0)
        {
            return i;
        }
    }
    return SENTRY;
}
uint32_t are_coordinates_blocked(uint32_t x, uint32_t y)
{
    for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
        if (get_world_npc_is_player(i) == true)
        {
            continue;
        }
        if (get_world_npc_x(i) == x && get_world_npc_y(i) == y)
        {
            return 1;
        }
    }

    uint32_t block_layer_id = get_layer_id_by_machine_name("block_layer");
    if (block_layer_id != SENTRY)
    {
        uint32_t layer_value = get_layer_data_by_coordinates(block_layer_id, x, y);
        if (layer_value > 0 && layer_value != SENTRY)
        {
            return 1;
        }
    }
    return 0;
}
void set_layer_name_id(u32 id, u32 value)
{
    g_layer_structs[id].name_id = value;
}
void set_layer_type(u32 id, u32 value)
{
    g_layer_structs[id].type = value;
}
void set_layer_width(u32 id, u32 value)
{
    g_layer_structs[id].width = value;
}
void set_layer_height(u32 id, u32 value)
{
    g_layer_structs[id].height = value;
}
void set_layer_same_value(u32 id, u32 value)
{
    g_layer_structs[id].same_value = value;
}
void set_layer_global_world_data_offset(u32 id, u32 value)
{
    g_layer_structs[id].global_world_data_offset = value;
}
void set_layer_is_block(u32 id, u32 value)
{
    g_layer_structs[id].is_block = value;
}
void clear_layer(u32 id)
{
    CLEAR_STRUCT(&g_layer_structs[id], SENTRY);
    --g_layer_count;
}
void clear_global_layers()
{
    for (u32 i = 0; i < MAX_LAYERS; ++i)
    {
        clear_layer(i);
    }
    g_layer_count = 0;
}

// GENERATE WORLDS
void generate_world(char* world_name)
{
    console_log_format("Generating world %s", world_name);

    reset_camera();
    clear_global_layers();
    clear_global_world_npcs();
    clear_global_world_data();
    init_structs_entities();

    if (strcmp(world_name, "dingus_land") == 0)
    {
        previous_game_mode = current_game_mode;
        current_game_mode = GAME_MODE_IN_PORT;
        current_world = get_world_id_by_machine_name("dingus_land");
        if (current_world == SENTRY)
        {
            console_log_format("Could not find world %s", world_name);
        }
        u32 world_width = get_current_world_width();
        u32 world_height = get_current_world_height();

        u32 layer_id;
        
        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("background_layer"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_same_value(g_layer_count, 1);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;

        // NPC LAYER
        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("npc_layer"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;

        // LAYER ONE
        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("layer_one"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        layer_id = g_layer_count;
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;
        add_value_to_global_world_data(layer_id, 2, 2, 36);

        uint32_t npc_id;
        npc_id = get_npc_id_by_machine_name("bank_teller");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        set_world_npc_x(g_world_npc_count, 4);
        set_world_npc_y(g_world_npc_count, 0);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_BANK);
        set_world_npc_is_interactable(g_world_npc_count, true);
        ++g_world_npc_count;
        npc_id = get_player_npc_id(0);
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 0);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_captain(g_world_npc_count, true);
        set_world_npc_is_player(g_world_npc_count, true);
        ++g_world_npc_count;

        should_redraw_everything();
    }
    else if (strcmp(world_name, "athens") == 0)
    {
        previous_game_mode = current_game_mode;
        current_game_mode = GAME_MODE_IN_PORT;

        current_world = get_world_id_by_machine_name("athens");
        if (current_world == SENTRY)
        {
            console_log_format("Could not find world %s", world_name);
        }

        // TODO: Clear all layers. No need to keep old ones.
        clear_global_world_data();

        u32 world_width = get_current_world_width();
        u32 world_height = get_current_world_height();
        u32 layer_id;

        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("background_layer"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_same_value(g_layer_count, 1);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;
        
        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("npc_layer"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_same_value(g_layer_count, 1);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;
        
        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("block_layer"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_is_block(g_layer_count, true);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        layer_id = g_layer_count;
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;
        add_value_to_global_world_data(layer_id, 2, 2, 1);

        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("layer_one"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        layer_id = g_layer_count;
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;
        add_value_to_global_world_data(layer_id, 0, 0, 36);
        add_value_to_global_world_data(layer_id, 7, 0, 38);
        add_value_to_global_world_data(layer_id, 0, 1, 33);
        add_value_to_global_world_data(layer_id, 0, 2, 33);
        add_value_to_global_world_data(layer_id, 0, 3, 33);
        add_value_to_global_world_data(layer_id, 0, 4, 33);
        for (uint32_t column = 1; column < 7; ++column)
        {
            add_value_to_global_world_data(layer_id, column, 0, 37);
        }
        for (uint32_t column = 1; column < 7; ++column)
        {
            add_value_to_global_world_data(layer_id, column, 1, 34);
            add_value_to_global_world_data(layer_id, column, 2, 34);
            add_value_to_global_world_data(layer_id, column, 3, 34);
            add_value_to_global_world_data(layer_id, column, 4, 34);
        }
        add_value_to_global_world_data(layer_id, 7, 1, 35);
        add_value_to_global_world_data(layer_id, 7, 2, 35);
        add_value_to_global_world_data(layer_id, 7, 3, 35);
        add_value_to_global_world_data(layer_id, 7, 4, 35);
        add_value_to_global_world_data(layer_id, 0, 5, 39);
        for (uint32_t column = 1; column < 7; ++column)
        {
            add_value_to_global_world_data(layer_id, column, 5, 40);
        }
        add_value_to_global_world_data(layer_id, 7, 5, 41);

        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("layer_two"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;
        add_value_to_global_world_data(layer_id, 5, 3, 69);
        add_value_to_global_world_data(layer_id, 4, 3, 71);
        add_value_to_global_world_data(layer_id, 4, 4, 72);

        uint32_t npc_id;

        npc_id = get_npc_id_by_machine_name("bank_teller");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        set_world_npc_x(g_world_npc_count, 4);
        set_world_npc_y(g_world_npc_count, 0);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_BANK);
        set_world_npc_is_interactable(g_world_npc_count, true);
        ++g_world_npc_count;

        // Inventory
        set_inventory_name_id_by_string(g_inventory_count, "general_shop_inventory");
        set_inventory_total_items(g_inventory_count, 0);
        // Inventory Item
        set_inventory_item_number_held(g_inventory_item_count, 22);
        set_inventory_item_type_reference_by_string(g_inventory_item_count, "telescope");
        set_inventory_item_inventory_id(g_inventory_item_count, g_inventory_count);
        set_inventory_item_adjusted_price(g_inventory_item_count, 400);
        inventory_increment_total_items(g_inventory_count);
        ++g_inventory_count;
        // Inventory Item
        set_inventory_item_number_held(g_inventory_item_count, 23);
        set_inventory_item_type_reference_by_string(g_inventory_item_count, "quadrant");
        set_inventory_item_inventory_id(g_inventory_item_count, g_inventory_count);
        set_inventory_item_adjusted_price(g_inventory_item_count, 430);
        inventory_increment_total_items(g_inventory_count);
        ++g_inventory_count;
        // Inventory Item
        set_inventory_item_number_held(g_inventory_item_count, 24);
        set_inventory_item_type_reference_by_string(g_inventory_item_count, "theodolite");
        set_inventory_item_inventory_id(g_inventory_item_count, g_inventory_count);
        set_inventory_item_adjusted_price(g_inventory_item_count, 222);
        inventory_increment_total_items(g_inventory_count);
        ++g_inventory_count;
        // Inventory Item
        set_inventory_item_number_held(g_inventory_item_count, 99);
        set_inventory_item_type_reference_by_string(g_inventory_item_count, "sextant");
        set_inventory_item_inventory_id(g_inventory_item_count, g_inventory_count);
        set_inventory_item_adjusted_price(g_inventory_item_count, 666);
        inventory_increment_total_items(g_inventory_count);
        ++g_inventory_count;
        npc_id = get_npc_id_by_machine_name("general_shop_owner");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        set_world_npc_x(g_world_npc_count, 3);
        set_world_npc_y(g_world_npc_count, 0);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_interactable(g_world_npc_count, true);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_GENERAL_SHOP);
        set_world_npc_inventory_id(g_world_npc_count, g_inventory_count);
        ++g_world_npc_count;

        npc_id = get_npc_id_by_machine_name("blackjack_player");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        set_world_npc_x(g_world_npc_count, 5);
        set_world_npc_y(g_world_npc_count, 0);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_interactable(g_world_npc_count, true);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_BLACKJACK);
        ++g_world_npc_count;

        npc_id = get_player_npc_id(0);
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        set_world_npc_captain_id(g_world_npc_count, players[0]);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 0);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_captain(g_world_npc_count, true);
        set_world_npc_is_player(g_world_npc_count, true);
        ++g_world_npc_count;

        npc_id = get_npc_id_by_machine_name("npc_ocean_battle");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 1);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_OCEAN_BATTLE);
        ++g_world_npc_count;

        npc_id = get_npc_id_by_machine_name("npc_rvice");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        // TODO: Bad hard coded value?
        set_world_npc_captain_id(g_world_npc_count, 1);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 2);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_captain(g_world_npc_count, true);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_NPC_RVICE);
        ++g_world_npc_count;

        npc_id = get_npc_id_by_machine_name("npc_lafolie");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        // TODO: Bad hard coded value?
        set_world_npc_captain_id(g_world_npc_count, 2);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 3);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_captain(g_world_npc_count, true);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_NPC_LAFOLIE);
        ++g_world_npc_count;

        npc_id = get_npc_id_by_machine_name("npc_nakor");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        // TODO: Bad hard coded value?
        set_world_npc_captain_id(g_world_npc_count, 3);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 4);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_captain(g_world_npc_count, true);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_NPC_NAKOR);
        ++g_world_npc_count;

        npc_id = get_npc_id_by_machine_name("npc_travis");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        // TODO: Bad hard coded value?
        set_world_npc_captain_id(g_world_npc_count, 4);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 5);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_captain(g_world_npc_count, true);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_NPC_TRAVIS);
        ++g_world_npc_count;

        npc_id = get_npc_id_by_machine_name("npc_loller");
        set_world_npc_npc_id(g_world_npc_count, npc_id);
        // TODO: Bad hard coded value?
        set_world_npc_captain_id(g_world_npc_count, 4);
        set_world_npc_x(g_world_npc_count, 0);
        set_world_npc_y(g_world_npc_count, 5);
        set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
        set_world_npc_is_captain(g_world_npc_count, true);
        set_world_npc_interaction_scene(g_world_npc_count, SCENE_NPC_LOLLER);
        ++g_world_npc_count;

        set_layer_name_id(g_layer_count, get_string_id_by_machine_name("entity_layer"));
        set_layer_type(g_layer_count, LAYER_TYPE_MATCHES_WORLD_SIZE);
        set_layer_width(g_layer_count, world_width);
        set_layer_height(g_layer_count, world_height);
        set_layer_global_world_data_offset(g_layer_count, GLOBAL_WORLD_DATA_ITERATOR);
        ++g_layer_count;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        ++g_world_structs[current_world].total_layers;

        init_structs_entities();
        g_entity_structs[0].name_id = get_string_id_by_machine_name("load_test_world");
        g_entity_structs[0].is_interactable = true;
        g_entity_structs[0].interaction_on_step_over = true;
        g_entity_structs[0].world_position_x = 8;
        g_entity_structs[0].world_position_y = 8;

        should_redraw_everything();

        // TODO
        // When offloading existing world you must clear out
        // world npcs
        // inventories per npc
        // layer_data ?
        // global_world_data
        // then you're free to load a new world
    }
    else
    {
        console_log_format("Could not find world %s", world_name);
    }
}

// ------------------------------------------------------------------------------------------------
// - CAPTAINS
// ------------------------------------------------------------------------------------------------
void set_captain_npc_id(u32 id, u32 npc_id)
{
    g_captain_structs[id].npc_id = npc_id;
}
void set_captain_gold(u32 id, u32 amount)
{
    g_captain_structs[id].gold = amount;
}
void set_captain_player_id(u32 id, u32 player_id)
{
    g_captain_structs[id].player_id = player_id;
}
void set_captain_inventory_id(u32 id, u32 inventory_id)
{
    g_captain_structs[id].inventory_id = inventory_id;
}
u32 get_captain_gold(u32 id)
{
    return g_captain_structs[id].gold;
}
u32 get_captain_npc_id(u32 id)
{
    return g_captain_structs[id].npc_id;
}
u32 get_captain_inventory_id(u32 id)
{
    return g_captain_structs[id].inventory_id;
}

// ------------------------------------------------------------------------------------------------
// - WORLD NPCS
// ------------------------------------------------------------------------------------------------
void set_world_npc_entity_id(u32 world_npc_id, u32 entity_id)
{
    g_world_npc_structs[world_npc_id].entity_id = entity_id;
}
void set_world_npc_captain_id(u32 world_npc_id, u32 captain_id)
{
    g_world_npc_structs[world_npc_id].captain_id = captain_id;
}
void set_world_npc_npc_id(u32 world_npc_id, u32 npc_id)
{
    g_world_npc_structs[world_npc_id].npc_id = npc_id;
}
void set_world_npc_is_captain(u32 world_npc_id, u32 is_or_not)
{
    g_world_npc_structs[world_npc_id].is_captain = is_or_not;
}
void set_world_npc_is_player(u32 world_npc_id, u32 is_or_not)
{
    g_world_npc_structs[world_npc_id].is_player = is_or_not;
}
void set_world_npc_inventory_id(u32 id, u32 value)
{
    g_world_npc_structs[id].inventory_id = value;
}
void set_world_npc_is_interactable(u32 world_npc_id, u32 is_or_not)
{
    g_world_npc_structs[world_npc_id].is_interactable = is_or_not;
}
void set_world_npc_interaction_scene(u32 world_npc_id, u32 scene_id)
{
    g_world_npc_structs[world_npc_id].interaction_scene = scene_id;
}
u32 get_world_npc_direction(u32 id)
{
    return g_world_npc_structs[id].direction;
}
u32 get_world_npc_npc_id(u32 id)
{
    return g_world_npc_structs[id].npc_id;
}
u32 get_world_npc_interaction_scene(u32 id)
{
    return g_world_npc_structs[id].interaction_scene;
}
uint32_t get_world_npc_x(uint32_t id)
{
    return g_world_npc_structs[id].position_x;
}
uint32_t get_world_npc_y(uint32_t id)
{
    return g_world_npc_structs[id].position_y;
}
uint32_t get_world_npc_inventory_id(uint32_t id)
{
    return g_world_npc_structs[id].inventory_id;
}
u32 get_world_npc_is_player(u32 id)
{
    return g_world_npc_structs[id].is_player;
}
uint32_t get_world_npc_type(uint32_t id)
{
    uint32_t npc_id = get_world_npc_npc_id(id);
    if (npc_id != SENTRY)
    {
        return get_npc_type(npc_id);
    }
    return SENTRY;
}
uint32_t get_world_npc_name_id(uint32_t id)
{
    uint32_t npc_id = get_world_npc_npc_id(id);
    if (npc_id != SENTRY)
    {
        return get_npc_name_id(npc_id);
    }
    return SENTRY;
}
void clear_world_npc(uint32_t id)
{
    CLEAR_STRUCT(&g_world_npc_structs[id], SENTRY);
    --g_world_npc_count;
}
void clear_global_world_npcs()
{
    for (u32 i = 0; i < MAX_WORLD_NPCS; ++i)
    {
        clear_world_npc(i);
    }
    g_world_npc_count = 0;
}
uint32_t get_world_npc_entity_id(uint32_t id)
{
    return g_world_npc_structs[id].entity_id;
}
void move_world_npc_to(uint32_t id, uint32_t x, uint32_t y)
{
    g_world_npc_structs[id].position_x = x;
    g_world_npc_structs[id].position_y = y;
}
void move_world_npc_left(uint32_t id)
{
    uint32_t current_x = get_world_npc_x(id);
    uint32_t current_y = get_world_npc_y(id);
    uint32_t intended_x = current_x - 1;
    if (current_x > 0 && are_coordinates_blocked(intended_x, current_y) != 1)
    {
        set_world_npc_x(id, intended_x);
    }
    set_world_npc_direction(id, DIRECTION_LEFT);
}
void move_world_npc_right(uint32_t id)
{
    uint32_t current_x = get_world_npc_x(id);
    uint32_t current_y = get_world_npc_y(id);
    uint32_t intended_x = current_x + 1;
    if (intended_x < get_current_world_width() && are_coordinates_blocked(intended_x, current_y) != 1)
    {
        set_world_npc_x(id, intended_x);
    }
    set_world_npc_direction(id, DIRECTION_RIGHT);
}
void move_world_npc_up(uint32_t id)
{
    uint32_t current_x = get_world_npc_x(id);
    uint32_t current_y = get_world_npc_y(id);
    uint32_t intended_y = current_y - 1;
    if (current_y > 0 && are_coordinates_blocked(current_x, intended_y) != 1)
    {
        set_world_npc_y(id, intended_y);
    }
    set_world_npc_direction(id, DIRECTION_UP);
}
void move_world_npc_down(uint32_t id)
{
    uint32_t current_x = get_world_npc_x(id);
    uint32_t current_y = get_world_npc_y(id);
    uint32_t intended_y = current_y + 1;
    if (intended_y < get_current_world_height() && are_coordinates_blocked(current_x, intended_y) != 1)
    {
        set_world_npc_y(id, intended_y);
    }
    set_world_npc_direction(id, DIRECTION_DOWN);
}
void set_world_npc_direction(u32 id, u32 direction)
{
    g_world_npc_structs[id].direction = direction;
}
void set_world_npc_x(u32 id, u32 x)
{
    g_world_npc_structs[id].position_x = x;
}
void set_world_npc_y(u32 id, u32 y)
{
    g_world_npc_structs[id].position_y = y;
}

// ------------------------------------------------------------------------------------------------
// - INVENTORY
// ------------------------------------------------------------------------------------------------
u32 get_inventory_total_items(u32 id)
{
    return g_inventory_structs[id].total_items;
}
void set_inventory_name_id(u32 id, u32 value)
{
    g_inventory_structs[id].name_id = value;
}
void set_inventory_name_id_by_string(u32 id, char* name)
{
    u32 string_id = get_string_id_by_machine_name(name);
    if (string_id == SENTRY)
    {
        console_log("[E] Could not find string to set inventory name id");
        return;
    }

    set_inventory_name_id(id, string_id);
}
void set_inventory_total_items(u32 id, u32 value)
{
    g_inventory_structs[id].total_items = value;
}
void inventory_increment_total_items(u32 id)
{
    u32 intended_total = get_inventory_total_items(id);
    ++intended_total;
    if (intended_total > MAX_INVENTORY_ITEMS)
    {
        console_log("Cannot increment inventory total items beyond MAX_INVENTORY_ITEMS");
        return;
    }
    ++g_inventory_structs[id].total_items;
}

u32 get_inventory_item_inventory_id(u32 id)
{
    return g_inventory_item_structs[id].inventory_id;
}
u32 get_inventory_item_adjusted_price(u32 id)
{
    return g_inventory_item_structs[id].adjusted_price;
}
u32 get_inventory_item_string_id(u32 id)
{
    return g_inventory_item_structs[id].name_id;
}
void set_inventory_item_inventory_id(u32 id, u32 value)
{
    g_inventory_item_structs[id].inventory_id = value;
}
void set_inventory_item_name_id_by_string(u32 id, char* name)
{
    u32 string_id = get_string_id_by_machine_name(name);
    if (string_id == SENTRY)
    {
        console_log("[E] Could not find string to set inventory item name id");
        return;
    }

    set_inventory_item_name_id(id, string_id);
}
void set_inventory_item_name_id(u32 id, u32 value)
{
    g_inventory_item_structs[id].name_id = value;
}
void set_inventory_item_number_held(u32 id, u32 value)
{
    g_inventory_item_structs[id].number_held = value;
}
void set_inventory_item_adjusted_price(u32 id, u32 value)
{
    g_inventory_item_structs[id].adjusted_price = value;
}
void set_inventory_item_type_reference(u32 id, u32 value)
{
    g_inventory_item_structs[id].type_reference = value;
}
void set_inventory_item_type_reference_by_string(u32 id, char* name)
{
    u32 item_id = SENTRY;
    u32 name_id = get_string_id_by_machine_name(name);
    if (name_id == SENTRY)
    {
        console_log("Tried to find a string for inventory type reference but could not");
        return;
    }
    // Have to find the item we want by its name
    for (u32 i = 0; i < MAX_ITEMS; ++i)
    {
        if (get_item_name_id(i) == name_id)
        {
            item_id = i;
            break;
        }
    }
    if (item_id == SENTRY)
    {
        console_log("Could not find an item by string id to add to inventory item reference");
        return;
    }
    // TODO: Ok but... can we get the name from the type reference? Would we want to override the base name with a custom one here perhaps?
    // Set the inventory name to the same name as the item we ended up finding for this
    set_inventory_item_name_id(id, name_id);
    set_inventory_item_type_reference(id, item_id);
}

// ------------------------------------------------------------------------------------------------ //
// - PLAYERS
// ------------------------------------------------------------------------------------------------ //
uint32_t get_player_gold(uint32_t player_id)
{
    u32 captain_id = players[player_id];
    return get_captain_gold(captain_id);
}
void set_player_gold(uint32_t player_id, uint32_t value)
{
    u32 captain_id = players[player_id];
    set_captain_gold(captain_id, value);
}
void subtract_player_gold(uint32_t player_id, uint32_t value)
{
    u32 captain_id = players[player_id];
    u32 current_gold = get_captain_gold(captain_id);
    current_gold -= value;
    set_captain_gold(captain_id, current_gold);
}
void add_player_gold(uint32_t player_id, uint32_t value)
{
    u32 captain_id = players[player_id];
    u32 current_gold = get_captain_gold(captain_id);
    current_gold += value;
    set_captain_gold(captain_id, current_gold);
}
uint32_t get_player_npc_id(uint32_t player_id)
{
    u32 captain_id = players[player_id];
    return get_captain_npc_id(captain_id);
}
uint32_t get_player_inventory_id(uint32_t player_id)
{
    uint32_t captain_id = players[player_id];
    return get_captain_inventory_id(captain_id);
}
uint32_t get_player_total_items(uint32_t player_id)
{
    uint32_t inventory_id = get_player_inventory_id(player_id);
    return get_inventory_total_items(inventory_id);
}
u32 get_player_inventory_item_by_id(u32 item_id)
{
    u32 inventory_id = get_player_inventory_id(0);
    // TODO: What the hell is this function?
    return SENTRY;
}
u32 get_player_inventory_item_string_id(u32 item_id)
{
    //u32 offset = get_player_inventory_item_by_id(item_id);
    return g_inventory_item_structs[item_id].name_id;
}
uint32_t get_player_in_world(uint32_t player_id)
{
    uint32_t npc_id = get_player_npc_id(player_id);
    for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i)
    {
        if (get_world_npc_npc_id(i) == npc_id)
        {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_player_in_world_x(uint32_t player_id)
{
    uint32_t world_npc_id = get_player_in_world(player_id);
    return get_world_npc_x(world_npc_id);
}
uint32_t get_player_in_world_y(uint32_t player_id)
{
    uint32_t world_npc_id = get_player_in_world(player_id);
    return get_world_npc_y(world_npc_id);
}
void move_player_to(uint32_t player_id, uint32_t x, uint32_t y)
{
    uint32_t world_npc_id = get_player_in_world(player_id);
    set_world_npc_x(world_npc_id, x);
    set_world_npc_y(world_npc_id, y);
}
void move_player_left(uint32_t player_id)
{
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = get_world_npc_x(world_npc_id);
    uint32_t current_y = get_world_npc_y(world_npc_id);
    uint32_t intended_x = current_x - 1;
    if (current_x > 0 && are_coordinates_blocked(intended_x, current_y) != 1)
    {
        set_world_npc_x(world_npc_id, intended_x);
    }
    set_world_npc_direction(world_npc_id, DIRECTION_LEFT);
}
void move_player_right(uint32_t player_id)
{
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = get_world_npc_x(world_npc_id);
    uint32_t current_y = get_world_npc_y(world_npc_id);
    uint32_t intended_x = current_x + 1;
    if (intended_x < get_current_world_width() && are_coordinates_blocked(intended_x, current_y) != 1) 
    {
        set_world_npc_x(world_npc_id, intended_x);
    }
    set_world_npc_direction(world_npc_id, DIRECTION_RIGHT);
}
void move_player_up(uint32_t player_id)
{
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = get_world_npc_x(world_npc_id);
    uint32_t current_y = get_world_npc_y(world_npc_id);
    uint32_t intended_y = current_y - 1;
    if (current_y > 0 && are_coordinates_blocked(current_x, intended_y) != 1)
    {
        set_world_npc_y(world_npc_id, intended_y);
    }
    set_world_npc_direction(world_npc_id, DIRECTION_UP);
}
void move_player_down(uint32_t player_id)
{
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = get_world_npc_x(world_npc_id);
    uint32_t current_y = get_world_npc_y(world_npc_id);
    uint32_t intended_y = current_y + 1;
    if (intended_y < get_current_world_height() && are_coordinates_blocked(current_x, intended_y) != 1)
    {
        set_world_npc_y(world_npc_id, intended_y);
    }
    set_world_npc_direction(world_npc_id, DIRECTION_DOWN);
}

// ------------------------------------------------------------------------------------------------ //
// - BASE SHIPS
// ------------------------------------------------------------------------------------------------ //
u32 get_base_ship_id_by_name_id(u32 name_id)
{
    for (u32 i = 0; i < MAX_BASE_SHIPS; ++i)
    {
        if (get_base_ship_name_id(i) == name_id)
        {
            return i;
        }
    }
    return SENTRY;
}

// ------------------------------------------------------------------------------------------------ //
// FLEETS
// ------------------------------------------------------------------------------------------------ //
void set_fleet_ship_fleet_id(u32 id, u32 value)
{
    g_fleet_ship_structs[id].fleet_id = value;
}
void set_fleet_ship_ship_id(u32 id, u32 value)
{
    g_fleet_ship_structs[id].ship_id = value;
}
void add_ship_to_fleet(u32 fleet_id, u32 ship_id)
{
    g_fleet_structs[fleet_id].total_ships += 1;
    // TODO: Only need this if the captain of a ship is NOT the same as the fleets general (also a captain)
    // g_fleet_data[offset + FLEET_TOTAL_CAPTAINS] += 1;
    set_fleet_ship_fleet_id(g_fleet_ship_count, fleet_id);
    set_fleet_ship_ship_id(g_fleet_ship_count, ship_id);
    ++g_fleet_ship_count;
}
u32 get_fleet_ship_fleet_id(u32 fleet_ship_id)
{
    return g_fleet_ship_structs[fleet_ship_id].fleet_id;
}
u32 get_fleet_ship_ship_id(u32 fleet_ship_id)
{
    return g_fleet_ship_structs[fleet_ship_id].ship_id;
}
uint32_t get_fleet_total_ships(uint32_t fleet_id)
{
    return g_fleet_structs[fleet_id].total_ships;
}
uint32_t get_ship_id_by_fleet_ship_id(uint32_t ship_id)
{
    for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i)
    {
        if (get_fleet_ship_ship_id(i) == ship_id)
        {
            return i;
        }
    }
    return SENTRY;
}
u32 get_fleet_general_id(u32 id)
{
    return g_fleet_structs[id].general_id;
}
u32 get_fleet_id_by_general_id(u32 general_id)
{
    for (u32 i = 0; i < MAX_FLEETS; ++i)
    {
        if (get_fleet_general_id(i) == general_id)
        {
            return i;
        }
    }
    return SENTRY;
}
void set_fleet_total_ships(u32 id, u32 value)
{
    if (value > MAX_FLEET_SHIPS)
    {
        console_log("Setting too many total ships in fleet");
        return;
    }
    g_fleet_structs[id].total_ships = value;
}
void set_fleet_total_captains(u32 id, u32 value)
{
    if (value > MAX_FLEET_CAPTAINS)
    {
        console_log("Setting too many total captains in fleet");
        return;
    }
    g_fleet_structs[id].total_captains = value;
}
void set_fleet_general_id(u32 id, u32 value)
{
    g_fleet_structs[id].general_id = value;
}
// TODO: void set_fleet_general_id_by_string(u32 id, char* name)

// ------------------------------------------------------------------------------------------------ //
// GENERAL GAME FUNCTIONS
// ------------------------------------------------------------------------------------------------ //
u32 get_current_game_mode()
{
    switch (current_game_mode)
    {
        case GAME_MODE_EMPTY:
            return get_string_id_by_machine_name("empty");
        case GAME_MODE_IN_PORT:
            return get_string_id_by_machine_name("in_port");
        case GAME_MODE_IN_SCENE:
            return get_string_id_by_machine_name("in_scene");
        case GAME_MODE_IN_PLAYER_MENU:
            return get_string_id_by_machine_name("in_player_menu");
        case GAME_MODE_IN_OCEAN_BATTLE:
            return get_string_id_by_machine_name("in_ocean_battle");
        default:
            console_log("Could not find game mode?");
    }
    return SENTRY;
}

void increment_tick_counter(uint32_t* tick)
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
        generate_world("athens");
    }
    else if (current_game_mode == GAME_MODE_IN_PORT)
    {
        // TODO: Anything here?
    }
    else if (current_game_mode == GAME_MODE_IN_SCENE)
    {
        // TODO: Anything here?
    }
    // TODO: fsm_tick();
}

void initialize_game()
{
    tick_counter = 1;
    current_game_mode = (uint32_t)GAME_MODE_EMPTY;
    clear_current_scene();

    clear_all_npcs();
    init_string_data();
    init_string_info();
    // TODO: Remove this in favor of clear_all_entities()
    init_structs_entities();

    create_string("empty", "Empty");
    create_string("you_have_x_gold", "You have %d gold.");
    create_string("hello", "Hello");
    create_string("player_menu", "Player Menu");
    create_string("inside", "Inside");
    create_string("general_shop", "General Shop");
    create_string("invest", "Invest");
    create_string("general", "General");
    create_string("not_enough_gold", "You don't have enough gold for this");
    create_string("general_item", "General Item");
    create_string("exit", "Exit");
    create_string("buy", "Buy");
    create_string("sell", "Sell");
    create_string("cancel", "Cancel");
    create_string("confirm", "Confirm");
    create_string("yes", "Yes");
    create_string("no", "No");
    create_string("withdraw", "Withdraw");
    create_string("deposit", "Deposit");
    create_string("loan", "Loan");
    create_string("play", "Play");
    create_string("number_input", "Number Input");
    create_string("digi_tal_bank", "Digi Tal Bank");
    create_string("welcome_to_digi_tal_bank", "Welcome to the Global Digi Tal Bank");
    create_string("loan_details", "We offer loans up to 10,000 gold at a %d%% interest rate per year. Are you interested?");
    create_string("take_loan_amount", "How much of a loan would you like to take? Remember, the maximum is 10,000.");
    create_string("confirm_loan_amount", "Are you sure you want to take a loan for %d gold?");
    create_string("loan_taken", "Congratulations on your loan. May you be prosperous.");
    create_string("pay_loan_no_money", "You don't have enough gold to pay down your loan");
    create_string("withdraw_no_account", "You don't have an active deposit account with us to withdraw from");
    create_string("deposit_no_money", "I would love to take your money but you don't seem to have any");
    create_string("deposit_to_new_account", "We offer a %d%% interest rate per year on deposits. Are you interested?");
    create_string("deposit_to_existing_account", "Your account currently has %d gold. How much would you like to deposit?");
    create_string("deposit_amount", "How much would you like to deposit?");
    create_string("confirm_deposit_amount", "Are you sure you want to deposit %d gold?");
    create_string("deposit_confirmed", "I've added your gold to your account. Thank you for your business.");
    create_string("withdraw_from_account", "Your account currently has %d gold. Would you like to withdraw some gold?");
    create_string("withdraw_amount", "How much do you want to withdraw?");
    create_string("confirm_withdraw_amount", "Are you sure you want to withdraw %d gold? Your account will have %d gold remaining.");
    create_string("withdraw_too_much", "You cannot withdraw more than you have in your account");
    create_string("confirm_withdraw_amount_will_empty", "Are you sure you want to withdraw %d gold? This will empty your account.");
    create_string("withdraw_confirmed", "Here is your gold from your account. Thank you for your business.");
    create_string("welcome_to_general_shop", "Welcome to the General Shop");
    create_string("confirm_purchase", "Are you sure you want to purchase these for %d gold?");
    create_string("thank_you_for_your_purchase", "Thank you for your purchase");
    create_string("general_shop_buy", "Here's what I have to offer today");
    create_string("general_shop_sell", "What would you like to sell?");
    create_string("confirm_buy", "This will cost you %d gold. Are you sure?");
    create_string("buy_not_enough_money", "I would love nothing more than to take your money but you don't seem to have enough");
    create_string("buy_confirmed", "Thank you for your purchase");
    create_string("confirm_sell", "Are you sure you want to sell these for %d gold?");
    create_string("sell_confirmed", "I'll take those items off your hands. Here is your gold.");
    create_string("welcome_to_blackjack", "If you're up for it we can play a round of blackjack. Minimum bet is 5, maximum is 10,000");
    create_string("blackjack_ask_to_place_bet", "Would you like to place a bet?");
    create_string("blackjack_ask_for_bet_amount", "How much would you like to bet?");
    create_string("blackjack_confirm_bet", "Are you sure you want to bet %d gold?");
    create_string("blackjack_not_minimum_bet", "You didn't bet the minimum amount of 5 gold");
    create_string("blackjack_bet_too_much", "You are betting more than the maximum amount of 10,000 gold");
    create_string("blackjack_play", "You can hit or stay");
    create_string("blackjack_player_hit", "You're going to hit? Nice.");
    create_string("blackjack_deal_deck", "Dealing the deck");
    create_string("blackjack_player_turn", "It's your turn. Hit or stand");
    create_string("blackjack_dealer_turn", "My turn");
    create_string("blackjack_check_winner", "Has one of us won yet?");
    create_string("blackjack_deal_player_card", "Let's see what you get");
    create_string("blackjack_deal_dealer_card", "Let's see what I get");
    create_string("blackjack_not_enough_gold", "You don't have enough gold for that bet");
    create_string("blackjack_hit", "Hit");
    create_string("blackjack_stay", "Stand");
    create_string("blackjack_player_won", "Congratulations! You won!");
    create_string("blackjack_dealer_won", "Oof! Better luck next time jabroni.");
    create_string("buy_complete", "Thank you for your purchase");
    create_string("sell_complete", "I'll take those items off your hands. Here is your gold.");
    create_string("in_ocean", "In Ocean");
    create_string("in_scene", "In Scene");
    create_string("in_ocean_battle", "In Ocean Battle");
    create_string("in_port", "In Port");
    create_string("on_land", "On Land");
    create_string("in_player_menu", "In Player Menu");
    create_string("background_layer", "Background Layer");
    create_string("npc_layer", "NPC Layer");
    create_string("block_layer", "Block Layer");
    create_string("layer_one", "Layer 1");
    create_string("layer_two", "Layer 2");
    create_string("layer_three", "Layer 3");
    create_string("layer_four", "Layer 4");
    create_string("layer_five", "Layer 5");
    create_string("layer_six", "Layer 6");
    create_string("layer_seven", "Layer 7");
    create_string("player_one", "Player 1");
    create_string("player_ones_inventory", "Player 1's Inventory");
    create_string("bank_teller", "Bank Teller");
    create_string("general_shop_owner", "General Shop Owner");
    create_string("general_shop_inventory", "General Shop Inventory");
    create_string("blackjack_player", "Blackjack Player");
    create_string("athens", "Athens");
    create_string("telescope", "Telescope");
    create_string("quadrant", "Quadrant");
    create_string("theodolite", "Theodolite");
    create_string("sextant", "Sextant");
    create_string("beech", "Beech");
    create_string("balsa", "Balsa");
    create_string("hansa_cog", "Hansa Cog");
    create_string("light_galley", "Light Galley");
    create_string("tallette", "Tallette");
    create_string("kansen", "Kansen");
    create_string("caravela_latina", "Caravela Latina");
    create_string("caravela_redonda", "Caravela Redonda");
    create_string("dhow", "Dhow");
    create_string("junk", "Junk");
    create_string("brigantine", "Brigantine");
    create_string("atakabune", "Atakabune");
    create_string("flemish_galleon", "Flemish Galleon");
    create_string("nao", "Nao");
    create_string("xebec", "Xebec");
    create_string("venetian_galeass", "Venetian Galeass");
    create_string("pinnace", "Pinnace");
    create_string("carrack", "Carrack");
    create_string("la_reale", "La Reale");
    create_string("buss", "Buss");
    create_string("galleon", "Galleon");
    create_string("sloop", "Sloop");
    create_string("tekkousen", "Tekkousen");
    create_string("frigate", "Frigate");
    create_string("barge", "Barge");
    create_string("full_rigged_ship", "Full-Rigged Ship");
    create_string("seahorse", "Seahorse");
    create_string("commodore", "Commodore");
    create_string("unicorn", "Unicorn");
    create_string("lion", "Lion");
    create_string("giant_eagle", "Giant Eagle");
    create_string("hero", "Hero");
    create_string("neptune", "Neptune");
    create_string("dragon", "Dragon");
    create_string("angel", "Angel");
    create_string("goddess", "Goddess");
    create_string("cannon", "Cannon");
    create_string("demi_cannon", "Demi-Cannon");
    create_string("cannon_pedero", "Cannon Pedero");
    create_string("culverin", "Culverin");
    create_string("demi_culverin", "Demi-Culverin");
    create_string("saker", "Saker");
    create_string("carronade", "Carronade");
    create_string("heavy_cannon", "Heavy Cannon");
    create_string("pocket_watch", "Pocket Watch");
    create_string("rat_poison", "Rat Poison");
    create_string("cat", "Cat");
    create_string("lime_juice", "Lime Juice");
    create_string("balm", "Balm");
    create_string("scene_digi_tal_bank", "Digi Tal Bank Scene");
    create_string("scene_general_shop", "General Shop Scene");
    create_string("scene_player_menu", "Player Menu Scene");
    create_string("scene_blackjack", "Blackjack Scene");
    create_string("scene_ocean_battle", "Ocean Battle Scene");
    create_string("welcome_to_general_shop", "Welcome to my shop. I have awesome stuff to sell. How can I help you?");
    create_string("player_ship", "Player Ship");
    create_string("npc_ocean_battle", "NPC Ocean Battle");
    create_string("ship", "General Ship");
    create_string("npc_rvice", "Rvice");
    create_string("npc_lafolie", "Lafolie");
    create_string("npc_nakor", "Nakor");
    create_string("npc_travis", "Travis");
    create_string("npc_loller", "Loller");
    create_string("nakors_ship", "Nakors Ship");
    create_string("lollers_ship", "Lollers Ship");
    create_string("rvices_ship", "Rvices Ship");
    create_string("lafolies_ship", "Lafolies Ship");
    create_string("setting_up_ocean_battle", "Setting up ocean battle");
    create_string("ship_is_attacking_with_cannon", "Ship is attaking with cannon");
    create_string("ship_is_attacking_with_boarding", "Ship is boarding!");
    create_string("rvices_ship", "SS STANDARD - ALSO RVICE WAS WRONG ALWAYS IS ALWAYS HAS BEEN");
    create_string("move", "Move");
    create_string("fire", "Fire");
    create_string("fire_cannons", "Fire Cannons");
    create_string("board_ship", "Board Ship");
    create_string("order", "Order");
    create_string("ocean_battle_players_turn", "Ocean Battle - Players Turn");
    create_string("ocean_battle_moving", "Ocean Battle - Moving");
    create_string("ocean_battle_victory", "Ocean Battle - VICTORY");
    create_string("scene_npc_rvice", "I suck");
    create_string("scene_state_npc_rvice_trash_talk", "RVICE: Write more if/else statements");
    create_string("scene_npc_lafolie", "I suck");
    create_string("scene_state_npc_lafolie_trash_talk", "LAFOLIE: You can't even use a stack");
    create_string("scene_npc_nakor", "I suck");
    create_string("scene_state_npc_nakor_trash_talk", "NAKOR: I know you suck.");
    create_string("scene_npc_travis", "I suck");
    create_string("scene_state_npc_travis_trash_talk", "TRAVIS: Bro can't even macro in C");
    create_string("scene_state_npc_loller_trash_talk", "LOLLER: My mom hurts me.");
    create_string("scene_npc_loller", "I suck");
    create_string("ocean_battle_board_attack_choose_target", "Ocean Battle - Choose Target To Board");
    create_string("ocean_battle_cannon_attack_choose_target", "Ocean Battle - Choose Target For Cannon Fire");
    create_string("ocean_battle_order_focus_on_ship", "Focus on Ship");
    create_string("ocean_battle_order_retreat", "Retreat");
    create_string("ocean_battle_order_defend_ship", "Defend Ship");
    create_string("ocean_battle_order_focus_on_cannons", "Focus on Cannons");
    create_string("ocean_battle_order_focus_on_boarding", "Focus on Boarding");
    create_string("ocean_battle_order_attack_at_will", "Attack at Will");
    create_string("ocean_battle_order_manual", "Manual");
    create_string("ocean_battle_ordering", "Ordering Fleet");
    create_string("ocean_battle_end_turn", "End Turn");
    create_string("entity_layer", "Entity Layer");
    create_string("load_test_world", "Load Test World");
    create_string("dingus_land", "Dingus Land");

    struct World game_world;
    CLEAR_STRUCT(&game_world, SENTRY);
    game_world.name_id = get_string_id_by_machine_name("athens");
    game_world.width = 50;
    game_world.height = 50;
    game_world.total_npcs = 0;
    game_world.total_captains = 0;
    game_world.total_layers = 1;
    // TODO: create_world, add to g_world_structs[iterator], then CLEAR_STRUCT
    g_world_structs[0] = game_world;
    CLEAR_STRUCT(&game_world, SENTRY);
    game_world.name_id = get_string_id_by_machine_name("dingus_land");
    game_world.width = 50;
    game_world.height = 50;
    game_world.total_npcs = 0;
    game_world.total_captains = 0;
    game_world.total_layers = 1;
    g_world_structs[1] = game_world;

    struct NPC npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("empty");
    npc.type = NPC_TYPE_HUMAN;
    u32 empty_npc_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("general_shop_owner");
    npc.type = NPC_TYPE_HUMAN;
    u32 general_shop_owner_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("bank_teller");
    npc.type = NPC_TYPE_HUMAN;
    u32 bank_teller_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("blackjack_player");
    u32 blackjack_player_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("npc_ocean_battle");
    u32 npc_ocean_battle_id = add_npc(npc);

    // TODO: This is a weird way to reference a ship but I think we're doing this
    // so that the ocean battle can pop an NPC out on the screen with a value
    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("ship");
    npc.type = NPC_TYPE_SHIP;
    u32 ship_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("npc_rvice");
    npc.type = NPC_TYPE_HUMAN;
    u32 npc_rvice_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("npc_lafolie");
    npc.type = NPC_TYPE_HUMAN;
    u32 npc_lafolie_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("npc_nakor");
    npc.type = NPC_TYPE_HUMAN;
    u32 npc_nakor_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("npc_travis");
    npc.type = NPC_TYPE_HUMAN;
    u32 npc_travis_id = add_npc(npc);

    npc = generate_npc();
    npc.name_id = get_string_id_by_machine_name("npc_loller");
    npc.type = NPC_TYPE_HUMAN;
    u32 npc_loller_id = add_npc(npc);

    set_inventory_name_id_by_string(g_inventory_count, "player_ones_inventory");
    set_inventory_total_items(g_inventory_count, 0);
    set_captain_npc_id(g_captain_count, empty_npc_id);
    set_captain_player_id(g_captain_count, 0);
    set_captain_gold(g_captain_count, 99);
    set_captain_inventory_id(g_captain_count, g_inventory_count);
    players[0] = g_captain_count;
    ++g_captain_count;
    ++g_inventory_count;

    set_inventory_name_id(g_inventory_count, get_npc_name_id(npc_rvice_id));
    set_inventory_total_items(g_inventory_count, 0);
    set_captain_npc_id(g_captain_count, npc_rvice_id);
    set_captain_player_id(g_captain_count, 0);
    set_captain_gold(g_captain_count, 100);
    set_captain_inventory_id(g_captain_count, g_inventory_count);
    ++g_captain_count;
    ++g_inventory_count;

    set_inventory_name_id(g_inventory_count, get_npc_name_id(npc_lafolie_id));
    set_inventory_total_items(g_inventory_count, 0);
    set_captain_npc_id(g_captain_count, npc_lafolie_id);
    set_captain_player_id(g_captain_count, 0);
    set_captain_gold(g_captain_count, 100);
    set_captain_inventory_id(g_captain_count, g_inventory_count);
    ++g_captain_count;
    ++g_inventory_count;

    set_inventory_name_id(g_inventory_count, get_npc_name_id(npc_nakor_id));
    set_inventory_total_items(g_inventory_count, 0);
    set_captain_npc_id(g_captain_count, npc_nakor_id);
    set_captain_player_id(g_captain_count, 0);
    set_captain_gold(g_captain_count, 100);
    set_captain_inventory_id(g_captain_count, g_inventory_count);
    ++g_captain_count;
    ++g_inventory_count;

    set_inventory_name_id(g_inventory_count, get_npc_name_id(npc_travis_id));
    set_inventory_total_items(g_inventory_count, 0);
    set_captain_npc_id(g_captain_count, npc_travis_id);
    set_captain_player_id(g_captain_count, 0);
    set_captain_gold(g_captain_count, 100);
    set_captain_inventory_id(g_captain_count, g_inventory_count);
    ++g_captain_count;
    ++g_inventory_count;

    set_inventory_name_id(g_inventory_count, get_npc_name_id(npc_loller_id));
    set_inventory_total_items(g_inventory_count, 0);
    set_captain_npc_id(g_captain_count, npc_loller_id);
    set_captain_player_id(g_captain_count, 0);
    set_captain_gold(g_captain_count, 100);
    set_captain_inventory_id(g_captain_count, g_inventory_count);
    ++g_captain_count;
    ++g_inventory_count;

    struct Item item = generate_item();
    item.name_id = get_string_id_by_machine_name("telescope");
    item.base_price = 200;
    item.type = ITEM_TYPE_GENERAL_ITEM;
    add_item(item);
    item.name_id = get_string_id_by_machine_name("quadrant");
    item.base_price = 201;
    item.type = ITEM_TYPE_GENERAL_ITEM;
    add_item(item);
    item.name_id = get_string_id_by_machine_name("theodolite");
    item.base_price = 202;
    item.type = ITEM_TYPE_GENERAL_ITEM;
    add_item(item);
    item.name_id = get_string_id_by_machine_name("sextant");
    item.base_price = 203;
    item.type = ITEM_TYPE_GENERAL_ITEM;
    add_item(item);

    struct BaseShip base_ship = generate_base_ship();
    base_ship.name_id = get_string_id_by_machine_name("balsa");
    // TODO: Set actual material id
    base_ship.top_material_id = 0;
    base_ship.price = 100;
    base_ship.max_capacity = 100;
    base_ship.tacking = 100;
    base_ship.power = 100;
    base_ship.speed = 100;
    base_ship.hull = 100;
    add_base_ship(base_ship);

    base_ship = generate_base_ship();
    base_ship.name_id = get_string_id_by_machine_name("hansa_cog");
    // TODO: Set actual material id
    base_ship.top_material_id = 0;
    base_ship.price = 100;
    base_ship.max_capacity = 100;
    base_ship.tacking = 100;
    base_ship.power = 100;
    base_ship.speed = 100;
    base_ship.hull = 100;
    add_base_ship(base_ship);

    g_bank.deposit_interest_rate = 33;
    g_bank.loan_interest_rate = 69;
    g_bank.fdic_insured = false;
    g_bank.max_deposit_amount = 100000;
    g_bank.max_loan_amount = 10000;

    test();
}

void test()
{
    set_player_gold(0, 1000);
    console_log("Debug ran");

    u32 base_ship_id = get_base_ship_id_by_machine_name("balsa");

    set_fleet_total_ships(g_fleet_count, 0);
    set_fleet_total_captains(g_fleet_count, 1);
    // TODO: This should be the player captain id. Right now, that happens to be manually set to 0 so we'll just use that for now
    set_fleet_general_id(g_fleet_count, players[0]);
    u32 fleet_id = g_fleet_count;
    ++g_fleet_count;

    struct Ship ship = generate_ship();
    ship.name_id = get_string_id_by_machine_name("player_ship");
    ship.base_ship_id = base_ship_id;
    ship.price = get_base_ship_price(base_ship_id) + 13;
    // TODO: Set actual material id
    ship.material_id = 0;
    ship.capacity = get_base_ship_max_capacity(base_ship_id) / 2;
    ship.tacking = get_base_ship_tacking(base_ship_id) + 10;
    ship.power = get_base_ship_power(base_ship_id) + 10;
    ship.speed = get_base_ship_speed(base_ship_id) + 10;
    ship.crew = get_base_ship_max_capacity(base_ship_id) / 2;
    ship.hull = get_base_ship_hull(base_ship_id) + 10;
    add_ship_to_fleet(fleet_id, add_ship(ship));
    add_ship_to_fleet(fleet_id, add_ship(ship));

    set_fleet_total_ships(g_fleet_count, 0);
    set_fleet_total_captains(g_fleet_count, 1);
    set_fleet_general_id(g_fleet_count, get_npc_id_by_machine_name("npc_rvice"));
    fleet_id = g_fleet_count;
    ++g_fleet_count;
    ship.name_id = get_string_id_by_machine_name("rvices_ship");
    add_ship_to_fleet(fleet_id, add_ship(ship));
    add_ship_to_fleet(fleet_id, add_ship(ship));

    set_fleet_total_ships(g_fleet_count, 0);
    set_fleet_total_captains(g_fleet_count, 1);
    set_fleet_general_id(g_fleet_count, get_npc_id_by_machine_name("npc_lafolie"));
    fleet_id = g_fleet_count;
    ++g_fleet_count;
    ship.name_id = get_string_id_by_machine_name("lafolies_ship");
    add_ship_to_fleet(fleet_id, add_ship(ship));
    add_ship_to_fleet(fleet_id, add_ship(ship));

    set_fleet_total_ships(g_fleet_count, 0);
    set_fleet_total_captains(g_fleet_count, 1);
    set_fleet_general_id(g_fleet_count, get_npc_id_by_machine_name("npc_nakor"));
    fleet_id = g_fleet_count;
    ++g_fleet_count;
    ship.name_id = get_string_id_by_machine_name("nakors_ship");
    add_ship_to_fleet(fleet_id, add_ship(ship));
    add_ship_to_fleet(fleet_id, add_ship(ship));

    set_fleet_total_ships(g_fleet_count, 0);
    set_fleet_total_captains(g_fleet_count, 1);
    set_fleet_general_id(g_fleet_count, get_npc_id_by_machine_name("npc_loller"));
    fleet_id = g_fleet_count;
    ++g_fleet_count;
    ship.name_id = get_string_id_by_machine_name("lollers_ship");
    add_ship_to_fleet(fleet_id, add_ship(ship));
    add_ship_to_fleet(fleet_id, add_ship(ship));
}

// ------------------------------------------------------------------------------------------------ //
// BLACKJACK
// ------------------------------------------------------------------------------------------------ //
uint32_t blackjack_deck[48];
uint32_t blackjack_player_deck[10];
uint32_t blackjack_player_deck_iterator;
uint32_t blackjack_dealer_deck[10];
uint32_t blackjack_dealer_deck_iterator;
uint32_t blackjack_player_value;
uint32_t blackjack_dealer_value;
uint32_t blackjack_deck_index;
uint32_t blackjack_bet_amount;
uint32_t blackjack_bet_minimum = 5;
uint32_t blackjack_bet_maximum = 10000;
uint32_t blackjack_player_standing;
uint32_t blackjack_dealer_standing;
uint32_t blackjack_player_hitting;
uint32_t blackjack_dealer_hitting;
uint32_t blackjack_get_player_deck_card(uint32_t index)
{
    return blackjack_player_deck[index];
}
uint32_t blackjack_get_dealer_deck_card(uint32_t index)
{
    return blackjack_dealer_deck[index];
}
uint32_t blackjack_get_card_value(uint32_t card_id)
{
    uint32_t card = card_id % 13;
    if (card == 0)
    {
        return 11;
    }
    if (card > 10)
    {
        return 10;
    }
    return card;
}
uint32_t blackjack_get_dealers_deck_value()
{
    uint32_t total = 0;
    for (uint32_t i = 0; i < 10; ++i)
    {
        if (blackjack_dealer_deck[i] != SENTRY)
        {
            total += blackjack_get_card_value(blackjack_dealer_deck[i]);
        }
    }
    return total;
}
uint32_t blackjack_get_players_deck_value()
{
    uint32_t total = 0;
    for (uint32_t i = 0; i < 10; ++i)
    {
        if (blackjack_player_deck[i] != SENTRY)
        {
            total += blackjack_get_card_value(blackjack_player_deck[i]);
        }
    }
    return total;
}
void blackjack_randomize_deck()
{
    uint32_t deck_index = 0;
    for (uint32_t i = 0; i < 52; ++i)
    {
        // Skip JACK cards
        if (i % 13 != 10)
        {
            blackjack_deck[deck_index] = i;
            deck_index += 1;
        }
    }
    for (uint32_t i = 47; i > 0; --i)
    {
        uint32_t random_index = get_random_number(0, i + 1);
        uint32_t temp = blackjack_deck[i];
        blackjack_deck[i] = blackjack_deck[random_index];
        blackjack_deck[random_index] = temp;
    }
    blackjack_deck_index = 0;
    blackjack_bet_amount = SENTRY;
    blackjack_player_standing = SENTRY;
    blackjack_dealer_standing = SENTRY;
    blackjack_player_hitting = SENTRY;
    blackjack_dealer_hitting = SENTRY;
    for (uint32_t i = 0; i < 10; ++i)
    {
        blackjack_player_deck[i] = SENTRY;
        blackjack_dealer_deck[i] = SENTRY;
    }
}
void blackjack_add_card_to_players_deck()
{
    blackjack_player_deck[blackjack_player_deck_iterator] = blackjack_deck[blackjack_deck_index];
    blackjack_deck_index += 1;
    blackjack_player_deck_iterator += 1;
}
void blackjack_add_card_to_dealer_deck()
{
    blackjack_dealer_deck[blackjack_dealer_deck_iterator] = blackjack_deck[blackjack_deck_index];
    blackjack_deck_index += 1;
    blackjack_dealer_deck_iterator += 1;
}
void blackjack_start_game()
{
    blackjack_randomize_deck();
    blackjack_player_standing = SENTRY;
    blackjack_dealer_standing = SENTRY;
    blackjack_player_deck_iterator = 0;
    blackjack_dealer_deck_iterator = 0;
    blackjack_add_card_to_players_deck();
    blackjack_add_card_to_dealer_deck();
    blackjack_add_card_to_players_deck();
    blackjack_add_card_to_dealer_deck();
}
void blackjack_dealer_turn()
{
    uint32_t dealer_total = blackjack_get_dealers_deck_value();
    console_log_format("dealer total %d", dealer_total);
    if (dealer_total >= 17)
    {
        blackjack_dealer_standing = true;
    }
}
uint32_t blackjack_check_winner()
{
    uint32_t player_total = blackjack_get_players_deck_value();
    uint32_t dealer_total = blackjack_get_dealers_deck_value();
    // return 1 = player won
    // return 2 = dealer won
    // return 3 = nobody won

    // If either player is over 21, other player wins
    if (dealer_total > 21)
    {
        console_log("Dealer over 21");
        return 1;
    }
    if (player_total > 21)
    {
        console_log("Player over 21");
        return 2;
    }
    // If neither player is standing, just skip
    if (blackjack_player_standing != true && blackjack_dealer_standing != true)
    {
        console_log("Nobody is standing");
        return 3;
    }
    // If both players are standing, whoever is closest to 21
    if (blackjack_player_standing == true && blackjack_dealer_standing == true)
    {
        console_log("Both are standing");
        // Double check for either one being over
        if (dealer_total > 21)
        {
            console_log("Dealer over 21 [b]");
            return 1;
        }
        else if (player_total > 21)
        {
            console_log("Player over 21 [b]");
            return 2;
        }
        else if (dealer_total > player_total)
        {
            console_log("dealer more than player");
            return 2;
        }
        else if (player_total > dealer_total)
        {
            console_log("player more than dealer");
            return 1;
        }
        else if (dealer_total == player_total)
        {
            console_log("Samesies");
            // Samesies = house wins
         
           return 2;
        }
        else if (dealer_total == 21)
        {
            console_log("dealer 21");
            return 2;
        }
        else if (player_total == 21)
        {
            console_log("player 21");
            return 1;
        }
        else
        {
            console_log("House always wins");
            // Default to house wins (since both are standing)
            return 2;
        }
        console_log("??? NOTHING >????");
    }
    console_log_format("WTF? dealer_standing:%d player_standing:%d", blackjack_dealer_standing, blackjack_player_standing);
    return 3;
}

// TODO: Immediate bust out if anybody goes over 21
// TODO: Immediate bust out if dealer gets 21 right out the gate (but NOT player)
uint32_t scene_blackjack(uint32_t action)
{
    // TODO: Consider putting all strings in a scene array so you
    // don't have to thrash the entire string pool to find the
    // strings you want every time
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_BLACKJACK);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_blackjack"));
        set_current_scene_state(SCENE_BLACKJACK_STATE_HELLO);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_blackjack(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        // Note: Curly brackets here is REQUIRED to scope the "choices" variable otherwise it doesn't work
        case SCENE_BLACKJACK_STATE_HELLO:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("welcome_to_blackjack");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK)
                    {
                        clear_current_scene();
                        // TODO: Go back to previous_game_mode
                        current_game_mode = GAME_MODE_IN_PORT;
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT:
        {
            // Note: Keeping the same choices as "hello" for now
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_ask_for_bet_amount");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    set_current_scene_needs_numerical_input(true);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        // TODO: Can you NOT duplicate break calls?
                        if (current_user_input_number == SENTRY)
                        {
                            console_log("No user input number!");
                            break;
                        }
                        else if (current_user_input_number < blackjack_bet_minimum)
                        {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_MINIMUM);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        }
                        else if (current_user_input_number > blackjack_bet_maximum)
                        {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_BET_AMOUNT_OVER_MAXIMUM);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        }
                        else if (current_user_input_number > get_player_gold(0))
                        {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_ENOUGH_GOLD);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        }
                        else
                        {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_CONFIRM_BET_AMOUNT);
                            scene_blackjack(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK)
                    {
                        clear_current_scene();
                        // TODO: Go back to previous_game_mode
                        current_game_mode = GAME_MODE_IN_PORT;
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_MINIMUM:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_not_minimum_bet");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK)
                    {
                        // Go back to bet amount
                        set_current_scene_state(SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_BET_AMOUNT_OVER_MAXIMUM:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_bet_too_much");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK)
                    {
                        // Go back to bet amount
                        set_current_scene_state(SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_ENOUGH_GOLD:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_not_enough_gold");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK)
                    {
                        clear_current_scene();
                        // TODO: Go back to previous_game_mode
                        current_game_mode = GAME_MODE_IN_PORT;
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_CONFIRM_BET_AMOUNT:
        {
            uint32_t cc = current_scene_get_current_choice();
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    // TODO: Formatted string with
                    // current_user_input_number as %d
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_confirm_bet");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_DEAL_CARDS);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK)
                    {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    // TODO: This is so weird. Why?
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_DEAL_CARDS:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    blackjack_start_game();
                    blackjack_bet_amount = current_user_input_number;
                    // TODO: Formatted string with
                    // current_user_input_number as %d
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_deal_deck");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_HIT_OR_STAND);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_PLAYER_HIT_OR_STAND:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_HIT),
                        get_string_id_by_machine_name("blackjack_hit")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BLACKJACK_CHOICE_STAND),
                        get_string_id_by_machine_name("blackjack_stay")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_player_turn");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_HIT)
                    {
                        blackjack_add_card_to_players_deck();
                        set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_DEAL_CARD);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    else if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_STAND)
                    {
                        blackjack_player_standing = true;
                        set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_PLAYER_DEAL_CARD:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_deal_player_card");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    blackjack_dealer_turn();
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_dealer_turn");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        // if (blackjack_dealer_standing == true) {
                        //     // TODO: Another dialogue
                        //     console_log("{B}Dealer Standing");
                        // } else {
                        //     // TODO: Another dialogue
                        //     blackjack_add_card_to_dealer_deck();
                        //     console_log("{B}Dealer hitting");
                        // }
                        if (blackjack_dealer_standing == true)
                        {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_CHECK_WINNER);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        }
                        else
                        {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_DEAL_CARD);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_DEALER_DEAL_CARD:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    blackjack_add_card_to_dealer_deck();
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_deal_dealer_card");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_CHECK_WINNER);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_CHECK_WINNER:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_check_winner");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        uint32_t winner = blackjack_check_winner();
                        if (winner == 1)
                        {
                            // If player won, show player won state
                            set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_WON);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        }
                        else if (winner == 2)
                        {
                            // If dealer won, show dealer won state
                            set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_WON);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        }
                        else if (winner == 3)
                        {
                            // If nobody won, confirm at least player OR dealer is not standing
                            if (blackjack_player_standing != true)
                            {
                                set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_HIT_OR_STAND);
                                scene_blackjack(SCENE_ACTION_INIT);
                                break;
                            }
                            else if (blackjack_dealer_standing != true)
                            {
                                set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND);
                                scene_blackjack(SCENE_ACTION_INIT);
                                break;
                            }
                        }
                        else
                        {
                            console_log("Hopefully we never get here");
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_PLAYER_WON:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_player_won");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        add_player_gold(0, blackjack_bet_amount);
                        blackjack_bet_amount = 0;
                        set_current_scene_state(SCENE_BLACKJACK_STATE_HELLO);
                        scene_blackjack(SCENE_ACTION_INIT);
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_DEALER_WON:
        {
            uint32_t cc = current_scene_get_current_choice();
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_dealer_won");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM)
                    {
                        subtract_player_gold(0, blackjack_bet_amount);
                        blackjack_bet_amount = 0;
                        set_current_scene_state(SCENE_BLACKJACK_STATE_HELLO);
                        scene_blackjack(SCENE_ACTION_INIT);
                    }
                    break;
                }
            }
            break;
        }
    }
    return SENTRY;
}


// ------------------------------------------------------------------------------------------------ //
// EXPERIMENTS
// ------------------------------------------------------------------------------------------------ //
// Note: I tried this and I was hoping I could get a dynamic string buffer but, instead, I have to pre-allocate a buffer and add to it.
// char test_output_string_buffer[4];
// __attribute__((visibility("default")))
// void f32_to_string(float text) {
//     // Inline conversion of f32 bytes to char*
//     for (uint32_t i = 0; i < 4; ++i) {
//         test_output_string_buffer[i] = ((char*)&text)[i];
//     }
// }


// ------------------------------------------------------------------------------------------------ //
// GENERAL SHOP SCENE
// ------------------------------------------------------------------------------------------------ //
uint32_t scene_general_shop(uint32_t action)
{
    // TODO: When the scene exits, we need to clear g_inventory_item_data where INVENTORY_ID == scenes inventory id
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_GENERAL_SHOP);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_general_shop"));
        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_WELCOME);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_general_shop(SCENE_ACTION_INIT);
        map_current_scene_inventory_id();
        map_current_scene_inventory_items();
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_GENERAL_SHOP_STATE_WELCOME:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BUY),
                        get_string_id_by_machine_name("buy")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_SELL),
                        get_string_id_by_machine_name("sell")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("welcome_to_general_shop");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }   
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BUY)
                    {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_SELL)
                    {
                        // TODO: This
                        // set_current_scene_state(SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT);
                        // scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK)
                    {
                        clear_current_scene();
                        // TODO: Go back to previous_game_mode
                        current_game_mode = GAME_MODE_IN_PORT;
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_GENERAL_SHOP_STATE_BUYING:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BUY),
                        get_string_id_by_machine_name("buy")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("general_shop_buy");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BUY)
                    {
                        uint32_t item_id = input_array_buffer[0];
                        uint32_t qty = input_array_buffer[1];
                        uint32_t player_gold = get_player_gold(0);
                        uint32_t real_item_id = CurrentSceneInventoryItems[item_id];
                        uint32_t base_price = get_inventory_item_adjusted_price(real_item_id);
                        uint32_t total_price = base_price * qty;
                        if (player_gold >= total_price)
                        {
                            set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING_CONFIRM);
                            scene_general_shop(SCENE_ACTION_INIT);
                            break;
                        }
                        else
                        {
                            set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING_NOT_ENOUGH_GOLD);
                            scene_general_shop(SCENE_ACTION_INIT);
                            break;
                        }
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK)
                    {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_WELCOME);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_GENERAL_SHOP_STATE_BUYING_CONFIRM:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("confirm_buy");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING_COMPLETE);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK)
                    {
                        set_current_scene(SCENE_GENERAL_SHOP_STATE_BUYING);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_GENERAL_SHOP_STATE_BUYING_NOT_ENOUGH_GOLD:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("not_enough_gold");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK)
                    {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_GENERAL_SHOP_STATE_BUYING_COMPLETE:
        {
            u32 cc = current_scene_get_current_choice();
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    u32 item_id = input_array_buffer[0];
                    u32 qty = input_array_buffer[1];
                    u32 player_gold = get_player_gold(0);
                    u32 real_item_id = CurrentSceneInventoryItems[item_id];
                    u32 base_price = get_inventory_item_adjusted_price(real_item_id);
                    u32 total_price = base_price * qty;
                    subtract_player_gold(0, total_price);
                    u32 inventory_id = get_player_inventory_id(0);
                    // TODO: This is bad. We're creating a new inventory item every time. Are we even freeing this after?
                    set_inventory_item_number_held(g_inventory_item_count, qty);
                    set_inventory_item_inventory_id(g_inventory_item_count, inventory_id);
                    ++g_inventory_item_count;
                    inventory_increment_total_items(inventory_id);

                    u32 string_id = get_string_id_by_machine_name("buy_complete");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK)
                    {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
        }
        // case SCENE_GENERAL_SHOP_STATE_SELLING: {}
        // case SCENE_GENERAL_SHOP_STATE_SELL_CONFIRM: {}
        // case SCENE_GENERAL_SHOP_STATE_SELL_NOT_ENOUGH_GOLD: {}
        // case SCENE_GENERAL_SHOP_STATE_SELLING_COMPLETE: {}
    }
    return SENTRY;
}

// ------------------------------------------------------------------------------------------------ //
// OCEAN BATTLE
// ------------------------------------------------------------------------------------------------ //
#define MAX_OCEAN_BATTLE_FLEETS 10
static uint32_t ocean_battle_fleets[MAX_OCEAN_BATTLE_FLEETS];
static uint32_t ocean_battle_turn_order[MAX_OCEAN_BATTLE_FLEETS * MAX_FLEET_SHIPS];
void clear_ocean_battle_data(uint32_t data[OCEAN_BATTLE_DATA_SIZE])
{
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_SIZE; ++i)
    {
        data[i] = SENTRY;
    }
}
void clear_ocean_battle_fleets()
{
    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
    {
        ocean_battle_fleets[i] = SENTRY;
    }
}
void add_fleet_to_battle(uint32_t fleet_id)
{
    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
    {
        if (ocean_battle_fleets[i] == SENTRY)
        {
            ocean_battle_fleets[i] = fleet_id;
        }
    }
}
uint32_t ocean_battle_total_targets_within_cannon_range()
{
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
    uint32_t total = SENTRY;
    // TODO: Properly get cannon range
    uint32_t cannon_range = 8;
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i)
    {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
        {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id)
            {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
            {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range))
            {
                ++total;
            }
        }
    }
    return total;
}
uint32_t ocean_battle_total_targets_within_boarding_range()
{
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
    uint32_t total = 0;
    // TODO: Properly get cannon range
    uint32_t boarding_range = 2;
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i)
    {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
        {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id)
            {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
            {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            console_log("ocean battle targets within boarding range");
            console_log_format("target_npc_id:%d %d %d", target_npc_id, a_x, a_y);
            console_log_format("world_npc_id:%d %d %d", world_npc_id, b_x, b_y);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, boarding_range))
            {
                ++total;
            }
        }
    }
    return total;
}
uint32_t get_current_ocean_battle_turn_npc_id()
{
    return ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
}
uint32_t get_current_ocean_battle_turn_npc_x()
{
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_x(world_npc_id);
}
uint32_t get_current_ocean_battle_turn_npc_y()
{
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_y(world_npc_id);
}
uint32_t ocean_battle_find_world_npc_id_by_coordinates(uint32_t x, uint32_t y)
{
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i)
    {
        if (ocean_battle_turn_order[i] != SENTRY)
        {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            if (a_x == x && a_y == y)
            {
                return target_npc_id;
            }
        }
    }
    return SENTRY;
}
#define MAX_VALID_MOVEMENT_COORDINATES 100
uint32_t ocean_battle_valid_movement_coordinates[MAX_VALID_MOVEMENT_COORDINATES];
uint32_t ocean_battle_total_valid_movement_coordinates = 0;
uint32_t ocean_battle_get_total_valid_movement_coordinates()
{
    return ocean_battle_total_valid_movement_coordinates;
}
uint32_t ocean_battle_get_valid_movement_coordinate_x(uint32_t index)
{
    uint32_t offset = index * 2;
    return ocean_battle_valid_movement_coordinates[offset];
}
uint32_t ocean_battle_get_valid_movement_coordinate_y(uint32_t index)
{
    uint32_t offset = index * 2;
    return ocean_battle_valid_movement_coordinates[offset + 1];
}
void ocean_battle_build_valid_move_coordinates()
{
    uint32_t x = get_current_ocean_battle_turn_npc_x();
    uint32_t y = get_current_ocean_battle_turn_npc_y();
    console_log_format("current turn npc y %d", y);
    // TODO: Why does 5 lead to the right range (of 2)?
    uint32_t movement_range = 5;
    uint32_t x_diff = 0;
    uint32_t y_diff = 0;
    if (x -= movement_range < 0)
    {
        if (x > movement_range)
        {
            x_diff = x - movement_range;
        }
        else
        {
            x_diff = movement_range - x;
        }
        x = 0;
    }
    else
    {
        x -= movement_range;
    }
    if (y -= movement_range < 0)
    {
        if (y > movement_range)
        {
            y_diff = y - movement_range;
        }
        else
        {
            y_diff = movement_range - y;
        }
        y = 0;
    }
    else
    {
        y -= movement_range;
    }
    for (uint32_t i = 0; i < MAX_VALID_MOVEMENT_COORDINATES; ++i)
    {
        ocean_battle_valid_movement_coordinates[i] = SENTRY;
    }
    ocean_battle_total_valid_movement_coordinates = 0;
    uint32_t iterator = 0;
    uint32_t full_range = movement_range * 2;
    while (x < (full_range + x_diff))
    {
        for (uint32_t inner_y = y; inner_y < ((movement_range * 2) + y_diff); ++inner_y)
        {
            if (ocean_battle_is_world_coordinate_in_ship_movement_range(x, inner_y))
            {
                ocean_battle_valid_movement_coordinates[iterator] = x;
                ++iterator;
                ocean_battle_valid_movement_coordinates[iterator] = inner_y;
                ++iterator;
                ++ocean_battle_total_valid_movement_coordinates;
            }
        }
        ++x;
    }
}
#define MAX_VALID_BOARDING_COORDINATES 100
uint32_t ocean_battle_valid_boarding_coordinates[MAX_VALID_BOARDING_COORDINATES];
uint32_t ocean_battle_total_valid_boarding_coordinates = 0;
uint32_t ocean_battle_intended_boarding_coordinates[2];
void ocean_battle_set_intended_boarding_coordinates(uint32_t x, uint32_t y)
{
    ocean_battle_intended_boarding_coordinates[0] = x;
    ocean_battle_intended_boarding_coordinates[1] = y;
}
uint32_t get_total_valid_boarding_coordinates()
{
    return ocean_battle_total_valid_boarding_coordinates;
}
void ocean_battle_build_valid_boarding_coordinates()
{
    for (uint32_t i = 0; i < MAX_VALID_BOARDING_COORDINATES; ++i)
    {
        ocean_battle_valid_boarding_coordinates[i] = SENTRY;
    }
    uint32_t world_npc_id = get_current_ocean_battle_turn_npc_id();
    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
    ocean_battle_total_valid_boarding_coordinates = 0;
    uint32_t total = 0;
    // TODO: Properly get boarding range
    uint32_t boarding_range = 1;
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i)
    {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
        {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id)
            {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
            {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, boarding_range))
            {
                ocean_battle_valid_boarding_coordinates[total] = a_x;
                ++total;
                ocean_battle_valid_boarding_coordinates[total] = a_y;
                ++total;
                ++ocean_battle_total_valid_boarding_coordinates;
            }
        }
    }
}
uint32_t ocean_battle_get_valid_boarding_coordinates_x(uint32_t which)
{
    uint32_t offset = which * 2;
    return ocean_battle_valid_boarding_coordinates[offset];
}
uint32_t ocean_battle_get_valid_boarding_coordinates_y(uint32_t which)
{
    uint32_t offset = which * 2;
    return ocean_battle_valid_boarding_coordinates[offset + 1];
}
uint32_t ocean_battle_is_valid_boarding_coordinates(uint32_t x, uint32_t y)
{
    for (uint32_t i = 0; i < MAX_VALID_BOARDING_COORDINATES; i += 2)
    {
        if (
            ocean_battle_valid_boarding_coordinates[i] != SENTRY &&
            ocean_battle_valid_boarding_coordinates[i] == x &&
            ocean_battle_valid_boarding_coordinates[i + 1] == y
        ) {
            return true;
        }
    }
    return SENTRY;
}
#define MAX_VALID_CANNON_COORDINATES 100
uint32_t ocean_battle_valid_cannon_coordinates[MAX_VALID_CANNON_COORDINATES];
uint32_t ocean_battle_total_valid_cannon_coordinates = 0;
uint32_t ocean_battle_intended_cannon_coordinates[2];
void ocean_battle_set_intended_cannon_coordinates(uint32_t x, uint32_t y)
{
    ocean_battle_intended_cannon_coordinates[0] = x;
    ocean_battle_intended_cannon_coordinates[1] = y;
}
uint32_t get_total_valid_cannon_coordinates()
{
    return ocean_battle_total_valid_cannon_coordinates;
}
void ocean_battle_build_valid_cannon_coordinates()
{
    for (uint32_t i = 0; i < MAX_VALID_CANNON_COORDINATES; ++i)
    {
        ocean_battle_valid_cannon_coordinates[i] = SENTRY;
    }
    uint32_t world_npc_id = get_current_ocean_battle_turn_npc_id();
    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
    ocean_battle_total_valid_cannon_coordinates = 0;
    uint32_t total = 0;
    // TODO: Properly get cannon range
    uint32_t cannon_range = 8;
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i)
    {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
        {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id)
            {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
            {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range))
            {
                ocean_battle_valid_cannon_coordinates[total] = a_x;
                ++total;
                ocean_battle_valid_cannon_coordinates[total] = a_y;
                ++total;
                ++ocean_battle_total_valid_cannon_coordinates;
            }
        }
    }
}
uint32_t ocean_battle_get_valid_cannon_coordinates_x(uint32_t which)
{
    uint32_t offset = which * 2;
    return ocean_battle_valid_cannon_coordinates[offset];
}
uint32_t ocean_battle_get_valid_cannon_coordinates_y(uint32_t which)
{
    uint32_t offset = which * 2;
    return ocean_battle_valid_cannon_coordinates[offset + 1];
}
uint32_t ocean_battle_is_valid_cannon_coordinates(uint32_t x, uint32_t y)
{
    for (uint32_t i = 0; i < MAX_VALID_CANNON_COORDINATES; i += 2)
    {
        if (
            ocean_battle_valid_cannon_coordinates[i] != SENTRY &&
            ocean_battle_valid_cannon_coordinates[i] == x &&
            ocean_battle_valid_cannon_coordinates[i + 1] == y
        ) {
            return true;
        }
    }
    return SENTRY;
}
void scene_ocean_battle_increment_turn_order()
{
    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = false;
    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = false;
    ++ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX];
    if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] >= ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY])
    {
        ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] = 0;
    }
}
uint32_t scene_ocean_battle(uint32_t action)
{
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_ocean_battle_data(ocean_battle_data);
        clear_ocean_battle_fleets();
        clear_current_scene();
        set_current_scene(SCENE_OCEAN_BATTLE);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_ocean_battle"));
        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_SETUP);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_ocean_battle(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_OCEAN_BATTLE_STATE_SETUP:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("setting_up_ocean_battle");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();

                    // TODO: add_fleet_to_battle
                    // players fleet
                    // two captain fleets
                    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i)
                    {
                        if (ocean_battle_fleets[i] != SENTRY)
                        {
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_FLEET_ORDER_ID] = i;
                            break;
                        }
                    }
                    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_SHIP_NTH_ORDER] = 0;
                    for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i)
                    {
                        if (get_fleet_ship_fleet_id(i) == ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_FLEET_ORDER_ID])
                        {
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_SHIP_ID] = i;
                            break;
                        }
                    }
                    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS * MAX_FLEET_SHIPS; ++i)
                    {
                        ocean_battle_turn_order[i] = SENTRY;
                    }
                    console_log("PLACEMENT PHASE");
                    uint32_t npc_id;
                    uint32_t obto = 0;
                    // TODO: Update this so only the active fleets in the battle are placed
                    for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i)
                    {
                        if (get_fleet_ship_fleet_id(i) != SENTRY)
                        {
                            // [BATTLE SHIP CLEAR]
                            npc_id = get_npc_id_by_machine_name("ship");
                            set_world_npc_npc_id(g_world_npc_count, npc_id);
                            // Note: This is the RAW fleet ship id
                            set_world_npc_entity_id(g_world_npc_count, i);
                            // TODO: Get actual captain ID
                            set_world_npc_captain_id(g_world_npc_count, 0);
                            set_world_npc_x(g_world_npc_count, 2 + i);
                            set_world_npc_y(g_world_npc_count, 6);
                            set_world_npc_direction(g_world_npc_count, DIRECTION_DOWN);
                            ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY];
                            ocean_battle_turn_order[obto] = g_world_npc_count;
                            ++obto;
                            ++g_world_npc_count;
                        }
                    }
                    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] = 0;
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_TAKE_TURN:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t players_fleet_id = get_fleet_id_by_general_id(players[0]);
                    uint32_t world_npc_id = get_current_ocean_battle_turn_npc_id();
                    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
                    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
                    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
                    bool npcs_turn = true;
                    if (attacker_fleet_id == players_fleet_id)
                    {
                        npcs_turn = false;
                        uint32_t moved_and_attacked = SENTRY;
                        if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] == true && ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] == true)
                        {
                            moved_and_attacked = 1;
                        }
                        if (moved_and_attacked != SENTRY)
                        {
                            console_log("PLAYERS TURN ENDS");
                            scene_ocean_battle_increment_turn_order();
                            npcs_turn = true;
                            world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
                            attacker_ship_id = get_world_npc_entity_id(world_npc_id);
                            attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
                            attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
                            if (attacker_fleet_id == players_fleet_id)
                            {
                                console_log("NPCS TRUN FALSE");
                                npcs_turn = false;
                            }
                        }
                        if (npcs_turn == false)
                        {
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        }
                    }
                    if (npcs_turn == true)
                    {
                        // TODO: SCENE_OCEAN_BATTLE_STATE_NPC_TAKE_TURN
                        // TODO: Break out NPC actions (move & attack) so we can animate them in renderer
                        // TODO: Board ship attack for npcs as a random choice (between fire cannon and board ship)
                        // TODO: Have NPC ships capable of running away when health is low
                        console_log("NPC TAKES ACTION");
                        world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
                        if (get_ship_hull(attacker_ship_id) > 0 && get_ship_crew(attacker_ship_id) > 0)
                        {
                            uint32_t rando = get_random_number(1, 4);
                            if (rando == 1)
                            {
                                move_world_npc_down(world_npc_id);
                            }
                            else if (rando == 2)
                            {
                                move_world_npc_up(world_npc_id);
                            }
                            else if (rando == 3)
                            {
                                move_world_npc_left(world_npc_id);
                            }
                            else if (rando == 4)
                            {
                                move_world_npc_right(world_npc_id);
                            }
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = true;
                        }

                        // TODO: Make this an actual range value based on the ship & other heuristics
                        uint32_t movement_range = 2;
                        uint32_t cannon_range = 6;
                        bool attacking = false;
                        if (get_ship_hull(attacker_ship_id) > 0 && get_ship_crew(attacker_ship_id) > 0)
                        {
                            for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i)
                            {
                                if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id)
                                {
                                    uint32_t target_npc_id = ocean_battle_turn_order[i];
                                    uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
                                    uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
                                    uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
                                    if (target_fleet_id == attacker_fleet_id)
                                    {
                                        continue;
                                    }
                                    if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0)
                                    {
                                        continue;
                                    }
                                    uint32_t a_x = get_world_npc_x(target_npc_id);
                                    uint32_t a_y = get_world_npc_y(target_npc_id);
                                    uint32_t b_x = get_world_npc_x(world_npc_id);
                                    uint32_t b_y = get_world_npc_y(world_npc_id);
                                    if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range))
                                    {
                                        ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = world_npc_id;
                                        ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = target_npc_id;
                                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK);
                                        scene_ocean_battle(SCENE_ACTION_INIT);
                                        should_redraw_everything();
                                        attacking = true;
                                    }
                                }
                            }
                        }
                        ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;

                        uint32_t moved_and_attacked = SENTRY;
                        if (
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] &&
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED]
                        ) {
                            moved_and_attacked = 1;
                        }
                        if (!attacking || moved_and_attacked != SENTRY)
                        {
                            scene_ocean_battle_increment_turn_order();
                            should_redraw_everything();
                        }
                    }
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("ship_is_attacking_with_cannon");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        // TODO: Why are we running the damage actions in confirm here?
                        uint32_t damage = get_random_number(1, 33);
                        uint32_t ship_id = get_world_npc_entity_id(ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID]);
                        reduce_ship_hull(ship_id, damage);
                        if (get_ship_hull(ship_id) <= 0)
                        {
                            ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED];
                            if (ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED] >= 3)
                            {
                                // TODO: This is an arbitrary victory condition until
                                set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_VICTORY);
                                scene_ocean_battle(SCENE_ACTION_INIT);
                                should_redraw_everything();
                                break;
                            }
                        }
                        ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = SENTRY;
                        ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = SENTRY;
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("ship_is_attacking_with_boarding");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        // TODO: Why are we running the damage actions in confirm here?
                        uint32_t damage = get_random_number(1, 33);
                        uint32_t ship_id = get_world_npc_entity_id(ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID]);
                        reduce_ship_crew(ship_id, damage);
                        if (get_ship_crew(ship_id) <= 0)
                        {
                            ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED];
                            if (ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED] >= 3)
                            {
                                // TODO: This is an arbitrary victory condition until
                                set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_VICTORY);
                                scene_ocean_battle(SCENE_ACTION_INIT);
                                should_redraw_everything();
                                break;
                            }
                        }
                        ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = SENTRY;
                        ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = SENTRY;
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK_CHOOSE_TARGET:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    ocean_battle_build_valid_cannon_coordinates();
                    uint32_t string_id = get_string_id_by_machine_name("ocean_battle_cannon_attack_choose_target");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_CANNON_ATTACK_TARGET_ID] = SENTRY;
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        uint32_t x = ocean_battle_intended_cannon_coordinates[0];
                        uint32_t y = ocean_battle_intended_cannon_coordinates[1];
                        if (ocean_battle_is_valid_cannon_coordinates(x, y) != SENTRY)
                        {
                            ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = get_current_ocean_battle_turn_npc_id();
                            ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = ocean_battle_find_world_npc_id_by_coordinates(x, y);
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        }
                        else
                        {
                            console_log("Invalid cannon attack coordinates");
                        }
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK)
                    {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    console_log_format("No valid choice for ATTACK CHOOSE TARGET %d", current_scene_get_choice(cc));
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK_CHOOSE_TARGET:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    ocean_battle_build_valid_boarding_coordinates();
                    uint32_t string_id = get_string_id_by_machine_name("ocean_battle_board_attack_choose_target");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_BOARD_ATTACK_TARGET_ID] = SENTRY;
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        uint32_t x = ocean_battle_intended_boarding_coordinates[0];
                        uint32_t y = ocean_battle_intended_boarding_coordinates[1];
                        if (ocean_battle_is_valid_boarding_coordinates(x, y) != SENTRY)
                        {
                            ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = get_current_ocean_battle_turn_npc_id();
                            ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = ocean_battle_find_world_npc_id_by_coordinates(x, y);
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        }
                        else
                        {
                            console_log("Invalid boarding attack coordinates");
                        }
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK)
                    {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    console_log_format("No valid choice for ATTACK CHOOSE TARGET %d", current_scene_get_choice(cc));
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_MOVE),
                        get_string_id_by_machine_name("move")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_FIRE_CANNONS),
                        get_string_id_by_machine_name("fire_cannons")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BOARD_SHIP),
                        get_string_id_by_machine_name("board_ship")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER),
                        get_string_id_by_machine_name("order")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("ocean_battle_end_turn")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("ocean_battle_players_turn");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    uint32_t choice = current_scene_get_choice(cc);
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_FIRE_CANNONS)
                    {
                        if (
                            ocean_battle_total_targets_within_cannon_range() > 0 &&
                            ocean_battle_total_targets_within_cannon_range() != SENTRY &&
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] != true
                        ) {
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK_CHOOSE_TARGET);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_BOARD_SHIP)
                    {
                        if (
                            ocean_battle_total_targets_within_boarding_range() > 0 &&
                            ocean_battle_total_targets_within_boarding_range() != SENTRY &&
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] != true
                        ) {
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK_CHOOSE_TARGET);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        } else {
                            if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] == true)
                            {
                                console_log("You've already attacked. You cannot board ships.");
                            }
                            else
                            {
                                console_log("Nothing within range");
                            }
                        }
                    }
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        scene_ocean_battle_increment_turn_order();
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_MOVE)
                    {
                        if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] != true)
                        {
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_MOVING);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        }
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_ORDER)
                    {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_ORDER);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_ORDER:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_SHIP),
                        get_string_id_by_machine_name("ocean_battle_order_focus_on_ship")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_RETREAT),
                        get_string_id_by_machine_name("ocean_battle_order_retreat")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_DEFEND_SHIP),
                        get_string_id_by_machine_name("ocean_battle_order_defend_ship")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_CANNONS),
                        get_string_id_by_machine_name("ocean_battle_order_focus_on_cannons")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_FOCUS_ON_BOARDING),
                        get_string_id_by_machine_name("ocean_battle_order_focus_on_boarding")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_ATTACK_AT_WILL),
                        get_string_id_by_machine_name("ocean_battle_order_attack_at_will")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_ORDER_MANUAL),
                        get_string_id_by_machine_name("ocean_battle_order_manual")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("ocean_battle_ordering");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK)
                    {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_MOVING:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("ocean_battle_moving");
                    ocean_battle_build_valid_move_coordinates();
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        // console_log_format("intended x %d and y %d", ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X], ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y]);
                        move_world_npc_to(ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]], ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X], ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y]);
                        ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = true;
                        // TODO: Check blocked somehow? Maybe in renderer?
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_VICTORY:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("ocean_battle_victory");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM)
                    {
                        // If you confirm a victory then just go back to normal game mode
                        clear_current_scene();
                        current_game_mode = GAME_MODE_IN_PORT;
                        should_redraw_everything();
                        // TODO: You have to clear the world npcs that are ships
                        // [BATTLE SHIP CLEAR]
                        // TODO: Update this so only the active fleets in the battle are placed
                        for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i)
                        {
                            if (get_fleet_ship_fleet_id(i) != SENTRY)
                            {
                                for (uint32_t wn = 0; wn < MAX_WORLD_NPCS; ++wn)
                                {
                                    if (get_world_npc_entity_id(wn) == i)
                                    {
                                        // TODO: THIS IS TEMPORARY
                                        // we reset the ships stats so we can
                                        // start a new fresh battle down the road
                                        uint32_t ship_id = get_world_npc_entity_id(wn);
                                        set_ship_hull(ship_id, 99);
                                        clear_world_npc(wn);
                                    }
                                }
                            }
                        }
                        break;
                    }
                    break;
                }
            }
            break;
        }
    }
    return SENTRY;
}
void set_ocean_battle_data_intended_move_x(uint32_t x)
{
    ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X] = x;
}
void set_ocean_battle_data_intended_move_y(uint32_t y)
{
    ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y] = y;
}
uint32_t get_ocean_battle_attacker_world_npc_id()
{
    return ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID];
}
uint32_t get_ocean_battle_target_world_npc_id()
{
    return ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID];
}
uint32_t ocean_battle_is_world_coordinate_in_ship_movement_range(uint32_t world_x, uint32_t world_y)
{
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    uint32_t current_ship_id = get_world_npc_entity_id(world_npc_id);
    // TODO: Setup an actual movement range
    uint32_t movement_range = 2;
    uint32_t b_x = SENTRY;
    uint32_t b_y = SENTRY;
    for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i)
    {
        if (get_world_npc_entity_id(i) == current_ship_id)
        {
            b_x = get_world_npc_x(i);
            b_y = get_world_npc_y(i);
            break;
        }
    }
    if (b_x == SENTRY || b_y == SENTRY)
    {
        console_log("Could not find ship in world");
        return SENTRY;
    }
    return is_coordinate_in_range_of_coordinate(world_x, world_y, b_x, b_y, movement_range);
}
uint32_t get_ocean_battle_current_turn_ship_x()
{
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_x(world_npc_id);
}
uint32_t get_ocean_battle_current_turn_ship_y()
{
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_y(world_npc_id);
}


// TODO: Software renderer. Blit pixels out. Load on initalize game. Ask for pixels for a *thing*, get pixels out, render to *other thing*


uint32_t scene_npc_rvice(uint32_t action)
{
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_NPC_RVICE);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_rvice"));
        set_current_scene_state(SCENE_NPC_STATES_RVICE_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_rvice(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_NPC_STATES_RVICE_TRASH_TALK:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT: {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_rvice_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM)
                    {
                        current_game_mode = GAME_MODE_IN_PORT;
                        clear_current_scene();
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        break;
    }
    return SENTRY;
}
uint32_t scene_npc_lafolie(uint32_t action)
{
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_NPC_LAFOLIE);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_lafolie"));
        set_current_scene_state(SCENE_NPC_STATES_LAFOLIE_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_lafolie(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_NPC_STATES_LAFOLIE_TRASH_TALK:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_lafolie_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM)
                    {
                        current_game_mode = GAME_MODE_IN_PORT;
                        clear_current_scene();
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        break;
    }
    return SENTRY;
}
uint32_t scene_npc_nakor(uint32_t action)
{
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_NPC_NAKOR);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_nakor"));
        set_current_scene_state(SCENE_NPC_STATES_NAKOR_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_nakor(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_NPC_STATES_NAKOR_TRASH_TALK:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_nakor_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM)
                    {
                        current_game_mode = GAME_MODE_IN_PORT;
                        clear_current_scene();
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        break;
    }
    return SENTRY;
}
uint32_t scene_npc_travis(uint32_t action)
{
    //
    // THERE IS AN ISSUE WITH TOP DOWN AUTOMATA (OR LAST IN FIRST OUT)
    //
    // STEP BY STEP
    // clear_current_scene() && set_current_scene() && set_current_scene_string_id()
    // set_current_scene_state()
    // set_game_mode_to_IN_SCENE
    // [[initialize_first_state]]
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_NPC_TRAVIS);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_travis"));
        set_current_scene_state(SCENE_NPC_STATES_TRAVIS_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_travis(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_NPC_STATES_TRAVIS_TRASH_TALK:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_travis_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM)
                    {
                        current_game_mode = GAME_MODE_IN_PORT;
                        clear_current_scene();
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        break;
    }
    return SENTRY;
}
uint32_t scene_npc_loller(uint32_t action)
{
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_NPC_LOLLER);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_loller"));
        set_current_scene_state(SCENE_NPC_STATES_LOLLER_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_loller(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_NPC_STATES_LOLLER_TRASH_TALK:
        {
            switch (action) {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_loller_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM)
                    {
                        current_game_mode = GAME_MODE_IN_PORT;
                        clear_current_scene();
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
            break;
        }
        break;
    }
    return SENTRY;
}

// ------------------------------------------------------------------------------------------------ //
// BANK
// ------------------------------------------------------------------------------------------------ //
u32 bank_add_deposit(u32 amount)
{
    u32 intended_total = g_bank.deposit_original_amount + amount;
    if (intended_total > g_bank.max_deposit_amount)
    {
        console_log("Tried to add more than the maximum deposit amount");
        return SENTRY;
    }
    g_bank.deposit_original_amount += amount;
    return g_bank.deposit_original_amount;
}
u32 bank_take_loan(u32 amount)
{
    // Never add. You can only take one load per time
    g_bank.loan_original_amount = amount;
    return g_bank.loan_original_amount;
}
void bank_update_yearly()
{
    // TODO: Every year, add interest rate amounts to deposit and loan original amounts
}
u32 get_bank_deposit_interest_rate()
{
    return g_bank.deposit_interest_rate;
}
u32 get_bank_loan_interest_rate()
{
    return g_bank.loan_interest_rate;
}
u32 get_bank_deposit_original_amount()
{
    return g_bank.deposit_original_amount;
}
u32 get_bank_loan_original_amount()
{
    return g_bank.loan_original_amount;
}
u32 get_bank_deposit_max_amount()
{
    return g_bank.max_deposit_amount;
}
u32 get_bank_loan_max_amount()
{
    return g_bank.max_loan_amount;
}

uint32_t scene_bank(uint32_t action)
{
    switch (get_current_scene_state())
    {
        case SENTRY:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene();
                    set_current_scene(SCENE_BANK);
                    set_current_scene_string_id(get_string_id_by_machine_name("scene_digi_tal_bank"));
                    set_current_scene_state(SCENE_BANK_WELCOME);
                    current_game_mode = GAME_MODE_IN_SCENE;
                    scene_bank(SCENE_ACTION_INIT);
                    return SENTRY;
                }
            }
        }
        case SCENE_BANK_WELCOME:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_LOAN),
                        get_string_id_by_machine_name("loan")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_DEPOSIT),
                        get_string_id_by_machine_name("deposit")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_WITHDRAW),
                        get_string_id_by_machine_name("withdraw")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id = get_string_id_by_machine_name("welcome_to_digi_tal_bank");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    uint32_t choice = current_scene_get_choice(cc);
                    switch (choice)
                    {
                        case SCENE_BANK_CHOICE_BACK:
                        {
                            current_game_mode = GAME_MODE_IN_PORT;
                            clear_current_scene();
                            should_redraw_everything();
                            break;
                        }
                        case SCENE_BANK_CHOICE_DEPOSIT:
                        {
                            set_current_scene_state(SCENE_BANK_DEPOSIT_AMOUNT);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                        case SCENE_BANK_CHOICE_LOAN:
                        {
                            // TODO: If loan already taken, don't do anything
                            set_current_scene_state(SCENE_BANK_LOAN);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                        case SCENE_BANK_CHOICE_WITHDRAW:
                        {
                            set_current_scene_state(SCENE_BANK_WITHDRAW);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BANK_DEPOSIT_AMOUNT:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id;
                    // TODO: "deposit_to_existing_account"
                    string_id = get_string_id_by_machine_name("welcome_to_digi_tal_bank");
                    if (get_bank_deposit_original_amount() > 0)
                    {
                        string_id = get_string_id_by_machine_name("deposit_to_new_account");
                    }
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    set_current_scene_needs_numerical_input(true);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    uint32_t choice = current_scene_get_choice(cc);
                    switch (choice)
                    {
                        case SCENE_BANK_CHOICE_BACK:
                        {
                            set_current_scene_needs_numerical_input(false);
                            set_current_scene_state(SCENE_BANK_WELCOME);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                        case SCENE_BANK_CHOICE_CONFIRM:
                        {
                            if (current_user_input_number == SENTRY || current_user_input_number <= 0)
                            {
                                console_log("[E] No user input # ?");
                                // Note: Purposefully just not doing anything
                                break;
                            }
                            else if (get_player_gold(0) < current_user_input_number)
                            {
                                set_current_scene_state(SCENE_BANK_DEPOSIT_NOT_ENOUGH_GOLD);
                            }
                            else
                            {
                                set_current_scene_state(SCENE_BANK_DEPOSIT_CONFIRM);
                            }
                            set_current_scene_needs_numerical_input(false);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BANK_DEPOSIT_NOT_ENOUGH_GOLD:
        {
            switch(action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id;
                    string_id = get_string_id_by_machine_name("deposit_no_money");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    uint32_t choice = current_scene_get_choice(cc);
                    switch (choice)
                    {
                        case SCENE_BANK_CHOICE_BACK:
                        {
                            set_current_scene_state(SCENE_BANK_DEPOSIT_AMOUNT);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BANK_DEPOSIT_CONFIRM:
        {
            switch(action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_BACK),
                        get_string_id_by_machine_name("exit")
                    );
                    uint32_t string_id;
                    string_id = get_string_id_by_machine_name("confirm_deposit_amount");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    uint32_t choice = current_scene_get_choice(cc);
                    switch (choice)
                    {
                        case SCENE_BANK_CHOICE_CONFIRM:
                        {
                            set_current_scene_state(SCENE_BANK_DEPOSIT_CONFIRMED);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                        case SCENE_BANK_CHOICE_BACK:
                        {
                            set_current_scene_state(SCENE_BANK_DEPOSIT_AMOUNT);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BANK_DEPOSIT_CONFIRMED:
        {
            switch(action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id;
                    string_id = get_string_id_by_machine_name("deposit_confirmed");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    uint32_t choice = current_scene_get_choice(cc);
                    switch (choice)
                    {
                        case SCENE_BANK_CHOICE_CONFIRM:
                        {
                            set_current_scene_state(SCENE_BANK_WELCOME);
                            scene_bank(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BANK_LOAN:
        {
            switch (action)
            {
                case SCENE_ACTION_INIT:
                {
                    clear_current_scene_choices();
                    current_scene_set_choice_string_id(
                        current_scene_add_choice(SCENE_BANK_CHOICE_CONFIRM),
                        get_string_id_by_machine_name("confirm")
                    );
                    uint32_t string_id;
                    // TODO: Wrong string
                    string_id = get_string_id_by_machine_name("deposit_confirmed");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
                    break;
                }
            }
            break;
        }
        // case SCENE_BANK_LOAN_TAKE_AMOUNT:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_LOAD_PAY_AMOUNT:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_LOAN_TAKE_AMOUNT_CONFIRM:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_LOAN_PAY_AMOUNT_CONFIRM:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_LOAN_PAY_AMOUNT_NOT_ENOUGH_GOLD:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_WITHDRAW:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_WITHDRAW_AMOUNT:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_WITHDRAW_NO_ACCOUNT:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_WITHDRAW_NOT_ENOUGH_GOLD:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
        // case SCENE_BANK_WITHDRAW_CONFIRM:
        // {
        //     switch (action)
        //     {
        //         case SCENE_ACTION_INIT:
        //         {
        //             break;
        //         }
        //         case SCENE_MAKE_CHOICE:
        //         {
        //             break;
        //         }
        //     }
        //     break;
        // }
    }

    return SENTRY;
}

uint32_t scene_shipyard(uint32_t action)
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

    return SENTRY;
}

uint32_t scene_innkeeper(uint32_t action)
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

uint32_t scene_blacksmith(uint32_t action)
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

uint32_t scene_goods_shop(uint32_t action)
{
    // TODO: Trade shop -> heuristics on economic factors that influence price
    // Note: trade shop just needs to know list of goods, their local value, at the end, you pick X goods, Y number of them, input on which ships get which goods and how many after you validate you have room for it to beging with
    // Note: trade shop selling is essentially all goods in all ships, N goods, X number of each good, sell, done

    return SENTRY;
}

uint32_t scene_guild(uint32_t action)
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

uint32_t scene_cafe(uint32_t action)
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


// NOTE: How to bit pack and unpack
uint32_t pack(uint32_t a, uint32_t b) {
    // Ensure values are within range
    if (a > 100 || b > 100) return 0; // or handle error
    
    // Pack 'a' into the lower 7 bits, 'b' into the next 7 bits
    return (b << 7) | a;
}
uint32_t unpack_lower(uint32_t packed) {
    return packed & 0x7F;  // 0x7F is 1111111 in binary, masking out the lower 7 bits
}
uint32_t unpack_upper(uint32_t packed) {
    return (packed >> 7) & 0x7F;  // Shift right by 7, then mask to get the upper 7 bits
}



// FOR THE FUTURE - BIT FLAGGING FOR MULTIPLE ACTIVE THINGS
// typedef enum {
//     SCENE_BANK_WELCOME                 = 1 << 0,
//     SCENE_BANK_DEPOSIT                 = 1 << 1,
//     SCENE_BANK_DEPOSIT_AMOUNT          = 1 << 2,
//     SCENE_BANK_DEPOSIT_CONFIRM         = 1 << 3,
//     SCENE_BANK_DEPOSIT_NOT_ENOUGH_GOLD = 1 << 4,
//     SCENE_BANK_DEPOSIT_CONFIRMED       = 1 << 5,
//     SCENE_BANK_LOAN                    = 1 << 6,
//     SCENE_BANK_LOAN_TAKE_AMOUNT        = 1 << 7,
//     SCENE_BANK_LOAN_PAY_AMOUNT         = 1 << 8,
//     SCENE_BANK_LOAN_TAKE_AMOUNT_CONFIRM = 1 << 9,
//     SCENE_BANK_LOAN_PAY_AMOUNT_CONFIRM = 1 << 10,
//     SCENE_BANK_LOAN_PAY_AMOUNT_NOT_ENOUGH_GOLD = 1 << 11,
//     SCENE_BANK_WITHDRAW                = 1 << 12,
//     SCENE_BANK_WITHDRAW_AMOUNT         = 1 << 13,
//     SCENE_BANK_WITHDRAW_NO_ACCOUNT     = 1 << 14,
//     SCENE_BANK_WITHDRAW_NOT_ENOUGH_GOLD = 1 << 15,
//     SCENE_BANK_WITHDRAW_CONFIRM        = 1 << 16,
// } SceneBank;

// // Use uint32_t for efficiency since we're using up to 16 bits here
// typedef uint32_t SceneBankFlags;

// // Setting flags
// SceneBankFlags sceneStatus = 0;
// sceneStatus |= SCENE_BANK_WELCOME;
// sceneStatus |= SCENE_BANK_DEPOSIT;

// // Checking if a flag is set
// if (sceneStatus & SCENE_BANK_WELCOME) {
//     // Welcome scene is active
// }

// // Clearing a flag
// sceneStatus &= ~SCENE_BANK_WELCOME;