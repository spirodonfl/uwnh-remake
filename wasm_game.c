#include <stdint.h>
#include <stddef.h>
#include <stdarg.h>
#include <stdbool.h>

#include "rvice_sucks.h"
uint32_t test_world_data_out(uint32_t t) {
    // uint32_t offset = t * 4;
    // return rvice_sucks_bin[offset];
    return rvice_sucks[t];
}

#define BUFFER_SIZE 1024

void console_log(const char* message);
void console_log_format(const char* format, ...);
char* string_format(const char* format, ...);
unsigned long strlen(const char* str);
int strcmp(const char* str1, const char* str2);
#define SENTRY UINT32_MAX
__attribute__((visibility("default")))
uint32_t get_sentry() {
    return SENTRY;
}
extern void js_console_log(void* ptr, uint32_t len);
void console_log(const char* message) {
    if (message != NULL) {
        js_console_log((void*)message, (uint32_t)(sizeof(char) * strlen(message)));
    }
}
char* string_format(const char* format, ...) {
    static char local_buffer[BUFFER_SIZE];
    char* buf_ptr = local_buffer;
    va_list args;
    va_start(args, format);
    
    const char* fmt_ptr = format;
    while (*fmt_ptr && (buf_ptr - local_buffer) < BUFFER_SIZE - 1) {
        if (*fmt_ptr != '%') {
            *buf_ptr++ = *fmt_ptr++;
            continue;
        }
        
        fmt_ptr++; // Skip '%'
        switch (*fmt_ptr) {
            case 'd': {
                int val = va_arg(args, int);
                
                if (val == 0) {
                    *buf_ptr++ = '0';
                    break;
                }
                
                char num_buffer[12];
                char* num_ptr = num_buffer;
                
                if (val < 0) {
                    *buf_ptr++ = '-';
                    val = -val;
                }
                
                while (val > 0) {
                    *num_ptr++ = '0' + (val % 10);
                    val /= 10;
                }
                
                while (num_ptr > num_buffer) {
                    *buf_ptr++ = *--num_ptr;
                }
                break;
            }
            case 's': {
                char* str = va_arg(args, char*);
                while (*str && (buf_ptr - local_buffer) < BUFFER_SIZE - 1) {
                    *buf_ptr++ = *str++;
                }
                break;
            }
            case 'c': {
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
void console_log_format(const char* format, ...) {
    va_list args;
    va_start(args, format);
    
    // Create a temporary buffer to store arguments
    void* arg_values[BUFFER_SIZE/8];  // Array to store argument values
    int arg_count = 0;
    
    // First pass: collect all arguments
    const char* fmt_ptr = format;
    while (*fmt_ptr) {
        if (*fmt_ptr == '%') {
            fmt_ptr++;
            switch (*fmt_ptr) {
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
uint32_t max(uint32_t a, uint32_t b) {
    return a > b ? a : b;
}

// ------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------
#define MAX_NPCS 100
#define MAX_WEAPONS 100
#define MAX_ARMORS 100
#define MAX_GENERAL_ITEMS 100
#define MAX_SPECIAL_ITEMS 100
#define MAX_WORLD_NPCS 1000
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

// ------------------------------------------------------------------------------------------------
// FORWARD DECLARATIONS
// ------------------------------------------------------------------------------------------------
uint32_t get_layer_same_value(uint32_t layer_index);
uint32_t get_layer_width(uint32_t layer_index);
uint32_t get_layer_global_world_data_offset(uint32_t layer_index);
const char* get_layer_machine_name(uint32_t layer_index);
uint32_t get_layer_name_id(uint32_t layer_index);
uint32_t get_npc_id_by_machine_name(char* machine_name);
uint32_t get_player_npc_id(uint32_t player_id);
void move_player_left(uint32_t player_id);
void move_player_right(uint32_t player_id);
void move_player_up(uint32_t player_id);
void move_player_down(uint32_t player_id);
void handle_input(uint32_t input);
void should_redraw_everything();
uint32_t get_player_in_world(uint32_t player_id);
uint32_t get_world_npc_x(uint32_t world_npc_id);
uint32_t get_world_npc_y(uint32_t world_npc_id);
uint32_t is_world_coordinate_halfway_of_viewport_more_than_x(uint32_t x);
uint32_t is_world_coordinate_halfway_of_viewport_more_than_y(uint32_t y);
uint32_t is_world_coordinate_halfway_of_viewport_less_than_x(uint32_t x);
uint32_t is_world_coordinate_halfway_of_viewport_less_than_y(uint32_t y);
void update_camera();
uint32_t get_current_world_height();
uint32_t get_current_world_width();
uint32_t scene_blackjack(uint32_t action);
void clear_current_scene_strings();
void clear_current_scene_states();
void clear_current_scene_choices();
uint32_t scene_general_shop(uint32_t action);
uint32_t get_inventory_item_string_id(uint32_t inventory_item_id);
uint32_t get_inventory_item_inventory_id(uint32_t inventory_item_id);
uint32_t get_world_npc_inventory_id(uint32_t world_npc_id);
uint32_t get_current_scene_inventory_id();
void increment_inventory_total_items(uint32_t inventory_id);
uint32_t get_inventory_item_adjusted_price(uint32_t inventory_item_id);
uint32_t scene_ocean_battle(uint32_t action);
uint32_t scene_npc_rvice(uint32_t action);
uint32_t scene_npc_lafolie(uint32_t action);
uint32_t scene_npc_nakor(uint32_t action);
uint32_t scene_npc_travis(uint32_t action);
uint32_t scene_npc_loller(uint32_t action);
void current_scene_clear_choice_strings();
uint32_t ocean_battle_is_world_coordinate_in_ship_movement_range(uint32_t world_x, uint32_t world_y);
uint32_t scene_bank(uint32_t action);
void test();

// ------------------------------------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------------------------------------
enum ShouldRedraw {
    SHOULD_REDRAW_NOTHING,
    SHOULD_REDRAW_EVERYTHING,
    SHOULD_REDRAW_SHIPS,
    SHOULD_REDRAW_NPCS,
    SHOULD_REDRAW_PLAYERS,
};
enum Direction {
    DIRECTION_UP,
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
};
enum GameMode {
    GAME_MODE_EMPTY,
    GAME_MODE_IN_SCENE,
    GAME_MODE_IN_OCEAN_BATTLE,
    GAME_MODE_IN_PORT,
    GAME_MODE_ON_LAND,
    GAME_MODE_IN_PLAYER_MENU,
};
enum ResourceType {
    RESOURCE_NPC,
    RESOURCE_GOOD,
    RESOURCE_STRING,
    RESOURCE_WEAPON,
    RESOURCE_ARMOR,
    RESOURCE_GENERAL_ITEM,
    RESOURCE_SPECIAL_ITEM,
    RESOURCE_TYPE_COUNT,
};
enum NPCType {
    NPC_TYPE_EMPTY,
    NPC_TYPE_HUMAN,
    NPC_TYPE_ANIMAL,
    NPC_TYPE_SHIP,
    NPC_TYPE_OTHER,
};
enum NPCData {
    NPC_NAME_ID,
    NPC_TYPE,
    NPC_DATA_SIZE,
};
enum GeneralItemData {
    GENERAL_ITEM_NAME_ID,
    GENERAL_ITEM_BASE_PRICE,
    GENERAL_ITEM_DATA_SIZE,
};
enum StringData {
    STRING_MACHINE_NAME_LENGTH, // Length of machine name
    STRING_TEXT_LENGTH,         // Length of display text
    STRING_DATA_SIZE,
};
enum BaseShipData {
    BASE_SHIP_NAME_ID,
    BASE_SHIP_TOP_MATERIAL_ID,
    BASE_SHIP_BASE_PRICE,
    BASE_SHIP_MAX_CAPACITY,
    BASE_SHIP_BASE_TACKING,
    BASE_SHIP_BASE_POWER,
    BASE_SHIP_BASE_SPEED,
    BASE_SHIP_DATA_SIZE,
};
enum ShipData {
    SHIP_NAME_ID,
    // TODO: SHIP CUSTOM NAME
    SHIP_BASE_SHIP_ID,
    SHIP_PRICE,
    SHIP_MATERIAL_ID,
    SHIP_CAPACITY,
    SHIP_TACKING,
    SHIP_POWER,
    SHIP_SPEED,
    SHIP_MAX_CREW,
    SHIP_MAX_HULL,
    SHIP_CREW,
    SHIP_HULL,
    SHIP_DATA_SIZE,
};
enum ShipMaterialData {
    SHIP_MATERIAL_NAME_ID,
    SHIP_MATERIAL_BASE_PRICE,
    SHIP_MATERIAL_MOD_POWER,
    SHIP_MATERIAL_MOD_CAPACITY,
    SHIP_MATERIAL_MOD_TACKING,
    SHIP_MATERIAL_MOD_SPEED,
    SHIP_MATERIAL_DATA_SIZE,
};
enum GoodData {
    GOOD_NAME_ID,
    GOOD_BASE_PRICE,
    GOOD_DATA_SIZE,
};
enum WeaponData {
    WEAPON_NAME_ID,
    WEAPON_BASE_PRICE,
    WEAPON_POWER,
    WEAPON_DATA_SIZE,
};
enum ArmorData {
    ARMOR_NAME_ID,
    ARMOR_BASE_PRICE,
    ARMOR_DEFENSE,
    ARMOR_DATA_SIZE,
};
enum SpecialItemData {
    SPECIAL_ITEM_NAME_ID,
    SPECIAL_ITEM_BASE_PRICE,
    SPECIAL_ITEM_DATA_SIZE,
};
enum WorldNPCData {
    WORLD_NPC_NPC_ID,
    WORLD_NPC_CAPTAIN_ID,
    WORLD_NPC_POSITION_X,
    WORLD_NPC_POSITION_Y,
    WORLD_NPC_DIRECTION,
    WORLD_NPC_IS_INTERACTABLE,
    WORLD_NPC_IS_CAPTAIN,
    WORLD_NPC_INTERACTION_SCENE,
    WORLD_NPC_IS_PLAYER,
    WORLD_NPC_INVENTORY_ID,
    WORLD_NPC_ENTITY_ID,
    WORLD_NPC_DATA_SIZE,
};
enum CaptainData {
    CAPTAIN_NPC_ID,
    CAPTAIN_WORLD_NPC_ID,
    CAPTAIN_IN_WORLD,
    CAPTAIN_GLOBAL_POSITION_X,
    CAPTAIN_GLOBAL_POSITION_Y,
    CAPTAIN_IN_PORT,
    CAPTAIN_ON_LAND,
    CAPTAIN_IN_OCEAN,
    CAPTAIN_SAILING,
    CAPTAIN_SKILLS_ID,
    CAPTAIN_STATS_ID,
    CAPTAIN_INVENTORY_ID,
    CAPTAIN_PLAYER_ID,
    CAPTAIN_GOLD,
    CAPTAIN_FLEET_ID,
    CAPTAIN_EQUIPPED_WEAPON_ID,
    CAPTAIN_EQUIPPED_ARMOR_ID,
    CAPTAIN_DATA_SIZE,
};
enum WorldData {
    WORLD_NAME_ID,
    WORLD_WIDTH,
    WORLD_HEIGHT,
    WORLD_TOTAL_NPCS,
    WORLD_TOTAL_CAPTAINS,
    WORLD_TOTAL_LAYERS,
    WORLD_DATA_SIZE,
};
enum LayerType {
    LAYER_TYPE_MATCHES_WORLD_SIZE,
    LAYER_TYPE_HAS_SPECIFIC_SIZE,
    LAYER_TYPE_HAS_SPECIFIC_COORDINATES,
    LAYER_TYPE_IS_SAME_VALUE,
    LAYER_TYPE_HAS_FUNCTION,
};
enum LayerData {
    LAYER_NAME_ID,
    // The idea is that you store into the global world data
    LAYER_GLOBAL_WORLD_DATA_OFFSET,
    // Length of data is just width * height
    LAYER_WIDTH,
    LAYER_HEIGHT,
    LAYER_TYPE,
    // Just a simple value, doesn't need global world data storage
    LAYER_SAME_VALUE,
    // This will be used if type = specific_coordinates and you will it will be (x,y)*entries
    LAYER_SPECIFIC_COORDINATES_SIZE,
    // If true, then the layer contains block information so NPCS & player cannot pass
    LAYER_IS_BLOCK,
    LAYER_DATA_SIZE,
};
enum BankData {
    BANK_DEPOSIT,
    BANK_LOAN,
    BANK_DEPOSIT_ORIGINAL_AMOUNT,
    BANK_DEPOSIT_INTEREST_RATE,
    BANK_DEPOSIT_INTEREST,
    BANK_LOAN_ORIGINAL_AMOUNT,
    BANK_LOAN_INTEREST_RATE,
    BANK_LOAN_INTEREST,
    BANK_FDIC_INSURED,
    BANK_MAX_DEPOSIT_AMOUNT,
    BANK_MAX_LOAN_AMOUNT,
    BANK_DATA_SIZE,
};
enum SceneBank {
    SCENE_BANK_WELCOME,
    SCENE_BANK_DATA_SIZE,
};
enum SceneBankChoices {
    SCENE_BANK_CHOICE_CONFIRM,
    SCENE_BANK_CHOICES_DATA_SIZE,
};
enum InventoryData {
    INVENTORY_NAME_ID,
    INVENTORY_TOTAL_ITEMS,
    INVENTORY_DATA_SIZE,
};
enum InventoryType {
    INVENTORY_TYPE_GOOD,
    INVENTORY_TYPE_ARMOR,
    INVENTORY_TYPE_WEAPON,
    INVENTORY_TYPE_GENERAL_ITEM,
    INVENTORY_TYPE_CANNON,
    INVENTORY_TYPE_BASE_SHIP,
    INVENTORY_TYPE_SHIP,
};
enum InventoryItemData {
    INVENTORY_ITEM_NAME_ID,
    INVENTORY_ITEM_NUMBER_HELD,
    INVENTORY_ITEM_ADJUSTED_PRICE,
    INVENTORY_ITEM_TYPE, // InventoryType
    INVENTORY_ITEM_TYPE_NAME_ID,
    INVENTORY_ITEM_TYPE_REFERENCE, // Reference to specific item
    INVENTORY_ITEM_INVENTORY_ID, // The inventory that holds this item
    INVENTORY_ITEM_NUMBER_CHOSEN,
    INVENTORY_ITEM_DATA_SIZE,
};
enum PortData {
    PORT_NAME_ID,
    PORT_GLOBAL_LOCATION_X,
    PORT_GLOBAL_LOCATION_Y,
    PORT_OVERALL_INVESTMENT_LEVEL,
    PORT_MARKET_INVESTMENT_LEVEL,
    PORT_SHIPYARD_INVESTMENT_LEVEL,
    PORT_DATA_SIZE,
};
enum StatsData {
    STATS_BATTLE_LEVEL,
    STATS_NAVIGATION_LEVEL,
    STATS_LEADERSHIP,
    STATS_SEAMANSHIP,
    STATS_KNOWLEDGE,
    STATS_INTUITION,
    STATS_COURAGE,
    STATS_SWORDSMANSHIP,
    STATS_CHARM,
    STATS_LUCK,
    STATS_DATA_SIZE,
};
enum SkillData {
    SKILL_NAME_ID,
    SKILL_STATS_REQUIREMENTS,
    SKILL_DATA_SIZE,
};
enum EntityData {
    ENTITY_NAME_ID,
    ENTITY_IS_INTERACTABLE,
    ENTITY_IS_BLOCKABLE,
    ENTITY_INTERACTION_ON_STEP_OVER,
    ENTITY_INTERACTION_SCENE,
    ENTITY_DATA_SIZE,
};
enum FleetData {
    FLEET_TOTAL_SHIPS,
    FLEET_TOTAL_CAPTAINS,
    FLEET_FIRST_MATE_ID,
    FLEET_ACCOUNTANT_ID,
    FLEET_NAVIGATOR_ID,
    FLEET_GENERAL_ID,
    FLEET_DATA_SIZE,
};
enum FleetShipData {
    FLEET_SHIP_SHIP_ID,
    FLEET_SHIP_FLEET_ID,
    FLEET_SHIP_DATA_SIZE,
};
enum FleetCaptainData {
    FLEET_CAPTAIN_CAPTAIN_ID,
    FLEET_CAPTAIN_FLEET_ID,
    FLEET_CAPTAIN_DATA_SIZE,
};
enum CannonData {
    CANNON_NAME_ID,
    CANNON_RANGE,
    CANNON_POWER,
    CANNON_BASE_PRICE,
    CANNON_DATA_SIZE,
};
enum FigureheadData {
    FIGUREHEAD_NAME_ID,
    FIGUREHEAD_BASE_PRICE,
    FIGUREHEAD_DATA_SIZE,
};
enum UserInput {
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
enum Scene {
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
enum SceneGeneralShop {
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
enum SceneDockyard {
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
enum BasicScene {
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
enum SceneNpcStates {
    SCENE_NPC_STATES_RVICE_TRASH_TALK,
    SCENE_NPC_STATES_LAFOLIE_TRASH_TALK,
    SCENE_NPC_STATES_NAKOR_TRASH_TALK,
    SCENE_NPC_STATES_TRAVIS_TRASH_TALK,
    SCENE_NPC_STATES_LOLLER_TRASH_TALK,

    SCENE_NPC_STATES_DATA_SIZE,
};
enum SceneNpcChoices {
    SCENE_NPC_CHOICE_CONFIRM,

    SCENE_NPC_CHOICES_DATA_SIZE,
};
enum SceneBlackjackStates {
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
enum SceneBlackjackChoices {
    SCENE_BLACKJACK_CHOICE_CONFIRM,
    SCENE_BLACKJACK_CHOICE_BACK,
    SCENE_BLACKJACK_CHOICE_HIT,
    SCENE_BLACKJACK_CHOICE_STAND,

    SCENE_BLACKJACK_DATA_SIZE,
};
enum SceneOceanBattleStates {
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
enum SceneOceanBattleChoices {
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
enum OceanBattleData {
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
// #define STRING_RESOURCES_SIZE (MAX_STRINGS * (uint32_t)RESOURCE_SIZE)
// static uint32_t g_string_resources[STRING_RESOURCES_SIZE];

// ------------------------------------------------------------------------------------------------
// Resource Management
// ------------------------------------------------------------------------------------------------
#define G_STRING_DATA_SIZE (MAX_STRINGS * MAX_STRING_LENGTH * 2)
static char g_string_data[G_STRING_DATA_SIZE];  // *2 for both machine_name and text
#define G_STRING_INFO_SIZE (MAX_STRINGS * STRING_DATA_SIZE)
static uint32_t g_string_info[G_STRING_INFO_SIZE];
static uint32_t g_string_count = 0;

#define G_NPC_DATA_SIZE (MAX_NPCS * NPC_DATA_SIZE)
static uint32_t g_npc_data[G_NPC_DATA_SIZE];
static uint32_t g_npc_count = 0;

#define G_GENERAL_ITEM_DATA_SIZE (MAX_GENERAL_ITEMS * GENERAL_ITEM_DATA_SIZE)
static uint32_t g_general_item_data[G_GENERAL_ITEM_DATA_SIZE];
static uint32_t g_general_item_count = 0;

#define G_BASE_SHIP_DATA_SIZE (MAX_BASE_SHIPS * BASE_SHIP_DATA_SIZE)
static uint32_t g_base_ship_data[G_BASE_SHIP_DATA_SIZE];
static uint32_t g_base_ship_count = 0;

#define G_SHIP_DATA_SIZE (MAX_SHIPS * SHIP_DATA_SIZE)
static uint32_t g_ship_data[G_SHIP_DATA_SIZE];
static uint32_t g_ship_count = 0;

#define G_SHIP_MATERIAL_DATA_SIZE (MAX_SHIP_MATERIALS * SHIP_MATERIAL_DATA_SIZE)
static uint32_t g_ship_material_data[G_SHIP_MATERIAL_DATA_SIZE];
static uint32_t g_ship_material_count = 0;

#define G_WEAPON_DATA_SIZE (MAX_WEAPONS * WEAPON_DATA_SIZE)
static uint32_t g_weapon_data[G_WEAPON_DATA_SIZE];
static uint32_t g_weapon_count = 0;

#define G_ARMOR_DATA_SIZE (MAX_ARMORS * ARMOR_DATA_SIZE)
static uint32_t g_armor_data[G_ARMOR_DATA_SIZE];
static uint32_t g_armor_count = 0;

#define G_SPECIAL_ITEM_DATA_SIZE (MAX_SPECIAL_ITEMS * SPECIAL_ITEM_DATA_SIZE)
static uint32_t g_special_item_data[G_SPECIAL_ITEM_DATA_SIZE];
static uint32_t g_special_item_count = 0;

#define G_FIGUREHEAD_DATA_SIZE (MAX_FIGUREHEADS * FIGUREHEAD_DATA_SIZE)
static uint32_t g_figurehead_data[G_FIGUREHEAD_DATA_SIZE];
static uint32_t g_figurehead_count = 0;

#define G_CANNON_DATA_SIZE (MAX_CANNONS * CANNON_DATA_SIZE)
static uint32_t g_cannon_data[G_CANNON_DATA_SIZE];
static uint32_t g_cannon_count = 0;

#define G_CAPTAIN_DATA_SIZE (MAX_CAPTAINS * CAPTAIN_DATA_SIZE)
static uint32_t g_captain_data[G_CAPTAIN_DATA_SIZE];
static uint32_t g_captain_count = 0;

#define G_WORLD_DATA_SIZE (MAX_WORLDS * WORLD_DATA_SIZE)
static uint32_t g_world_data[G_WORLD_DATA_SIZE];
static uint32_t g_world_count = 0;

#define G_LAYER_DATA_SIZE (MAX_LAYERS * (uint32_t)LAYER_DATA_SIZE)
static uint32_t g_layer_data[G_LAYER_DATA_SIZE];
static uint32_t g_layer_count = 0;

#define G_INVENTORY_DATA_SIZE (MAX_INVENTORIES * (uint32_t)INVENTORY_DATA_SIZE)
static uint32_t g_inventory_data[G_INVENTORY_DATA_SIZE];
static uint32_t g_inventory_count = 0;

#define G_INVENTORY_ITEM_DATA_SIZE (MAX_INVENTORY_ITEMS * (uint32_t)INVENTORY_ITEM_DATA_SIZE)
static uint32_t g_inventory_item_data[G_INVENTORY_ITEM_DATA_SIZE];
static uint32_t g_inventory_item_count = 0;

#define G_PORT_DATA_SIZE (MAX_PORTS * (uint32_t)PORT_DATA_SIZE)
static uint32_t g_port_data[G_PORT_DATA_SIZE];
static uint32_t g_port_count = 0;

#define G_STATS_DATA_SIZE (MAX_STATS * (uint32_t)STATS_DATA_SIZE)
static uint32_t g_stats_data[G_STATS_DATA_SIZE];
static uint32_t g_stats_count = 0;

#define G_SKILL_DATA_SIZE (MAX_SKILLS * (uint32_t)SKILL_DATA_SIZE)
static uint32_t g_skill_data[G_SKILL_DATA_SIZE];
static uint32_t g_skill_count = 0;

#define G_ENTITY_DATA_SIZE (MAX_ENTITIES * (uint32_t)ENTITY_DATA_SIZE)
static uint32_t g_entity_data[G_ENTITY_DATA_SIZE];
static uint32_t g_entity_count = 0;

#define G_FLEET_DATA_SIZE (MAX_FLEETS * (uint32_t)FLEET_DATA_SIZE)
static uint32_t g_fleet_data[G_FLEET_DATA_SIZE];
static uint32_t g_fleet_count = 0;

#define G_FLEET_SHIP_DATA_SIZE (MAX_FLEET_SHIPS * (uint32_t)FLEET_SHIP_DATA_SIZE)
static uint32_t g_fleet_ship_data[G_FLEET_SHIP_DATA_SIZE];
static uint32_t g_fleet_ship_count = 0;

#define G_FLEET_CAPTAIN_DATA_SIZE (MAX_FLEET_CAPTAINS * (uint32_t)FLEET_CAPTAIN_DATA_SIZE)
static uint32_t g_fleet_captain_data[G_FLEET_CAPTAIN_DATA_SIZE];
static uint32_t g_fleet_captain_count = 0;

#define G_WORLD_NPC_DATA_SIZE (MAX_WORLD_NPCS * (uint32_t)WORLD_NPC_DATA_SIZE)
static uint32_t g_world_npc_data[G_WORLD_NPC_DATA_SIZE];
static uint32_t g_world_npc_count = 0;

// Note: Bank does not need a resource. It's a single entity that is always present.
#define G_BANK_DATA_SIZE (MAX_BANKS * (uint32_t)BANK_DATA_SIZE)
static uint32_t g_bank_data[G_BANK_DATA_SIZE];

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
// GLOBAL FUNCTIONS
// ------------------------------------------------------------------------------------------------
char* my_strcpy(char* dest, const char* src) {
    char* original_dest = dest;
    while ((*dest++ = *src++) != '\0');
    // Null terminate
    *dest = '\0';
    return original_dest;
}
uint32_t get_string_data_offset(uint32_t index) {
    return index * MAX_STRING_LENGTH * 2;
}
unsigned long strlen(const char* str) {
    unsigned long len = 0;
    while (str[len] != '\0') len++;
    return len;
}
int strcmp(const char* str1, const char* str2) {
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
void init_data_##name() { \
    for (uint32_t i = 0; i < (data_size); ++i) { \
        (data)[i] = SENTRY; \
    } \
}

CREATE_INIT_DATA_FUNC(npc, G_NPC_DATA_SIZE, g_npc_data);
CREATE_INIT_DATA_FUNC(general_item, G_GENERAL_ITEM_DATA_SIZE, g_general_item_data);
CREATE_INIT_DATA_FUNC(base_ship, G_BASE_SHIP_DATA_SIZE, g_base_ship_data);
CREATE_INIT_DATA_FUNC(ship, G_SHIP_DATA_SIZE, g_ship_data);
CREATE_INIT_DATA_FUNC(ship_material, G_SHIP_MATERIAL_DATA_SIZE, g_ship_material_data);
CREATE_INIT_DATA_FUNC(weapon, G_WEAPON_DATA_SIZE, g_weapon_data);
CREATE_INIT_DATA_FUNC(armor, G_ARMOR_DATA_SIZE, g_armor_data);
CREATE_INIT_DATA_FUNC(special_item, G_SPECIAL_ITEM_DATA_SIZE, g_special_item_data);
CREATE_INIT_DATA_FUNC(figurehead, G_FIGUREHEAD_DATA_SIZE, g_figurehead_data);
CREATE_INIT_DATA_FUNC(cannon, G_CANNON_DATA_SIZE, g_cannon_data);
CREATE_INIT_DATA_FUNC(world, G_WORLD_DATA_SIZE, g_world_data);
CREATE_INIT_DATA_FUNC(layer, G_LAYER_DATA_SIZE, g_layer_data);
CREATE_INIT_DATA_FUNC(inventory, G_INVENTORY_DATA_SIZE, g_inventory_data);
CREATE_INIT_DATA_FUNC(inventory_item, G_INVENTORY_ITEM_DATA_SIZE, g_inventory_item_data);
CREATE_INIT_DATA_FUNC(port, G_PORT_DATA_SIZE, g_port_data);
CREATE_INIT_DATA_FUNC(stats, G_STATS_DATA_SIZE, g_stats_data);
CREATE_INIT_DATA_FUNC(skill, G_SKILL_DATA_SIZE, g_skill_data);
CREATE_INIT_DATA_FUNC(entity, G_ENTITY_DATA_SIZE, g_entity_data);
CREATE_INIT_DATA_FUNC(fleet, G_FLEET_DATA_SIZE, g_fleet_data);
CREATE_INIT_DATA_FUNC(fleet_ship, G_FLEET_SHIP_DATA_SIZE, g_fleet_ship_data);
CREATE_INIT_DATA_FUNC(fleet_captain, G_FLEET_CAPTAIN_DATA_SIZE, g_fleet_captain_data);
CREATE_INIT_DATA_FUNC(world_npc, G_WORLD_NPC_DATA_SIZE, g_world_npc_data);
CREATE_INIT_DATA_FUNC(bank, G_BANK_DATA_SIZE, g_bank_data);
CREATE_INIT_DATA_FUNC(captain, G_CAPTAIN_DATA_SIZE, g_captain_data);

void init_string_data(void) {
    for (uint32_t i = 0; i < G_STRING_DATA_SIZE; ++i) {
        g_string_data[i] = '\0';
    }
}
void init_string_info(void) {
    for (uint32_t i = 0; i < G_STRING_INFO_SIZE; ++i) {
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
void clear_current_scene() {
    for (uint32_t i = 0; i < MAX_SCENE_DATA_SIZE; ++i) {
        // TODO: This is hacky. We need a better function or a second function. One clears everything, one clears only critical
        if (i == SCENE_TRIGGERED_BY_WORLD_NPC_ID) {
            continue;
        }
        CurrentScene[i] = SENTRY;
    }
    clear_current_scene_choices();
    clear_current_scene_states();
    current_scene_clear_choice_strings();
    clear_current_scene_strings();
}

void clear_current_scene_choices() {
    for (uint32_t i = 0; i < MAX_SCENE_CHOICES; ++i) {
        CurrentSceneChoices[i] = SENTRY;
    }
    CurrentScene[SCENE_CURRENT_TOTAL_CHOICES] = 0;
    current_scene_clear_choice_strings();
}

void clear_current_scene_states() {
    for (uint32_t i = 0; i < MAX_SCENE_STATES; ++i) {
        CurrentSceneStates[i] = SENTRY;
    }
}

void clear_current_scene_strings() {
    for (uint32_t i = 0; i < MAX_SCENE_STRINGS; ++i) {
        CurrentSceneStrings[i] = SENTRY;
    }
}

// TODO: Is this still needed now?
void set_current_scene_data(uint32_t key, uint32_t value) {
    CurrentScene[SCENE_BASIC_DATA_SIZE + key] = value;
}
// TODO: Is this still needed now?
uint32_t get_current_scene_data(uint32_t key) {
    return CurrentScene[SCENE_BASIC_DATA_SIZE + key];
}

void set_current_scene_inventory_id(uint32_t value) {
    CurrentScene[SCENE_CURRENT_INVENTORY_ID] = value;
}
uint32_t get_current_scene_inventory_id() {
    return CurrentScene[SCENE_CURRENT_INVENTORY_ID];
}

void set_current_scene_string_id(uint32_t value) {
    CurrentScene[SCENE_CURRENT_SCENE_STRING_ID] = value;
}
uint32_t get_current_scene_string_id() {
    return CurrentScene[SCENE_CURRENT_SCENE_STRING_ID];
}

void set_current_scene_state(uint32_t value) {
    CurrentScene[SCENE_CURRENT_STATE] = value;
}
uint32_t get_current_scene_state() {
    return CurrentScene[SCENE_CURRENT_STATE];
}

void set_current_scene(uint32_t value) {
    CurrentScene[SCENE_CURRENT_SCENE] = value;
}
uint32_t get_current_scene() {
    return CurrentScene[SCENE_CURRENT_SCENE];
}

void set_current_scene_state_string_id(uint32_t value) {
    CurrentScene[SCENE_CURRENT_STATE_STRING_ID] = value;
}
uint32_t get_current_scene_state_string_id() {
    return CurrentScene[SCENE_CURRENT_STATE_STRING_ID];
}

void set_current_scene_triggered_by_world_npc_id(uint32_t id) {
    CurrentScene[SCENE_TRIGGERED_BY_WORLD_NPC_ID] = id;
}
uint32_t get_current_scene_triggered_by_world_npc_id() {
    return CurrentScene[SCENE_TRIGGERED_BY_WORLD_NPC_ID];
}

void set_current_scene_dialogue_string_id(uint32_t value) {
    CurrentScene[SCENE_CURRENT_DIALOGUE_STRING_ID] = value;
}
uint32_t get_current_scene_dialogue_string_id() {
    return CurrentScene[SCENE_CURRENT_DIALOGUE_STRING_ID];
}

uint32_t get_current_scene_total_choices() {
    return CurrentScene[SCENE_CURRENT_TOTAL_CHOICES];
}
void set_current_scene_total_choices(uint32_t total) {
    CurrentScene[SCENE_CURRENT_TOTAL_CHOICES] = total;
}

uint32_t get_current_scene_total_states() {
    return CurrentScene[SCENE_TOTAL_STATES];
}
void set_current_scene_total_states(uint32_t total) {
    CurrentScene[SCENE_TOTAL_STATES] = total;
}

uint32_t get_current_scene_choice_enabled(uint32_t choice) {
    CurrentScene[SCENE_CURRENT_CHOICE] = choice;
    if (CurrentSceneChoices[choice] != SENTRY) {
        return CurrentSceneChoices[choice];
    }
    return SENTRY;
}

void set_current_scene_needs_numerical_input(uint32_t on_off) {
    CurrentScene[SCENE_WAITING_FOR_INPUT_NUMBER] = SENTRY;
    if (on_off == true) {
        CurrentScene[SCENE_WAITING_FOR_INPUT_NUMBER] = 1;
    }
}
uint32_t get_current_scene_needs_numerical_input() {
    return CurrentScene[SCENE_WAITING_FOR_INPUT_NUMBER];
}

void current_scene_make_choice(uint32_t choice) {
    CurrentScene[SCENE_CURRENT_CHOICE] = choice;
    if (get_current_scene() == SCENE_BLACKJACK) {
        scene_blackjack(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_GENERAL_SHOP) {
        scene_general_shop(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_OCEAN_BATTLE) {
        scene_ocean_battle(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_NPC_RVICE) {
        scene_npc_rvice(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_NPC_LAFOLIE) {
        scene_npc_lafolie(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_NPC_NAKOR) {
        scene_npc_nakor(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_NPC_TRAVIS) {
        scene_npc_travis(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_NPC_LOLLER) {
        scene_npc_loller(SCENE_MAKE_CHOICE);
    } else if (get_current_scene() == SCENE_BANK) {
        scene_bank(SCENE_MAKE_CHOICE);
    }
}
uint32_t current_scene_get_current_choice() {
    return CurrentScene[SCENE_CURRENT_CHOICE];
}
uint32_t current_scene_add_choice(uint32_t value) {
    uint32_t total_choices = get_current_scene_total_choices();
    CurrentSceneChoices[total_choices] = value;
    set_current_scene_total_choices(total_choices + 1);
    return total_choices;
}
uint32_t current_scene_get_choice(uint32_t which) {
    return CurrentSceneChoices[which];
}
void current_scene_clear_choice_strings() {
    for (uint32_t i = 0; i < MAX_SCENE_CHOICES; ++i) {
        CurrentSceneChoicesString[i] = SENTRY;
    }
}
void current_scene_set_choice_string_id(uint32_t choice, uint32_t string_id) {
    CurrentSceneChoicesString[choice] = string_id;
}
uint32_t get_current_scene_choice_string_id(uint32_t choice) {
    return CurrentSceneChoicesString[choice];
}

void current_scene_add_state(uint32_t value) {
    uint32_t total_states = get_current_scene_total_states();
    CurrentSceneStates[total_states] = value;
    set_current_scene_total_states(total_states + 1);
}
uint32_t current_scene_get_state(uint32_t which) {
    return CurrentSceneStates[which];
}

void set_current_scene_total_strings(uint32_t value) {
    CurrentSceneStrings[SCENE_TOTAL_STRINGS] = value;
}
uint32_t get_current_scene_total_strings() {
    return CurrentScene[SCENE_TOTAL_STRINGS];
}

void map_current_scene_inventory_id() {
    uint32_t world_npc_id = get_current_scene_triggered_by_world_npc_id();
    set_current_scene_inventory_id(get_world_npc_inventory_id(world_npc_id));
}
void clear_current_scene_inventory_items() {
    for (uint32_t i = 0; i < MAX_INVENTORY_ITEMS; ++i) {
        CurrentSceneInventoryItems[i] = SENTRY;
    }
}
void map_current_scene_inventory_items() {
    uint32_t inventory_id = get_current_scene_inventory_id();
    clear_current_scene_inventory_items();
    uint32_t csii = 0;
    for (uint32_t i = 0; i < MAX_INVENTORY_ITEMS; ++i) {
        if (get_inventory_item_inventory_id(i) == inventory_id) {
            CurrentSceneInventoryItems[csii] = i;
            ++csii;
        }
    }
}
uint32_t get_current_scene_inventory_item_string_id(uint32_t inventory_item_id) {
    uint32_t real_inventory_id = CurrentSceneInventoryItems[inventory_item_id];
    return get_inventory_item_string_id(real_inventory_id);
}
uint32_t get_current_scene_inventory_item_adjusted_price(uint32_t inventory_item_id) {
    uint32_t real_inventory_id = CurrentSceneInventoryItems[inventory_item_id];
    return get_inventory_item_adjusted_price(real_inventory_id);
}

void current_scene_add_string(uint32_t value) {
    uint32_t total_strings = get_current_scene_total_strings();
    CurrentSceneStrings[total_strings] = value;
    set_current_scene_total_strings(total_strings + 1);
}
uint32_t current_scene_get_string(uint32_t which) {
    return CurrentSceneStrings[which];
}

// ------------------------------------------------------------------------------------------------
// Global World Data
// ------------------------------------------------------------------------------------------------
#define G_GLOBAL_WORLD_DATA_SIZE 20000
// MAXIMUM_WORLD_WIDTH * MAXIMUM_WORLD_HEIGHT * MAXIMUM_WORLD_LAYERS
uint32_t GLOBAL_WORLD_DATA[G_GLOBAL_WORLD_DATA_SIZE];
uint32_t GLOBAL_WORLD_DATA_ITERATOR;
void add_value_to_global_world_data(uint32_t layer_id, uint32_t x, uint32_t y, uint32_t value) {
    uint32_t layer_width = g_layer_data[layer_id * LAYER_DATA_SIZE + LAYER_WIDTH];
    uint32_t offset = x + y * layer_width;
    offset += g_layer_data[layer_id * LAYER_DATA_SIZE + LAYER_GLOBAL_WORLD_DATA_OFFSET];
    if (offset >= G_GLOBAL_WORLD_DATA_SIZE) {
        console_log("ERROR: Global world data not big enough for layer data");
    }
    GLOBAL_WORLD_DATA[offset] = value;
}
void clear_global_world_data() {
    for (uint32_t i = 0; i < G_GLOBAL_WORLD_DATA_SIZE; ++i) {
        GLOBAL_WORLD_DATA[i] = SENTRY;
    }
    GLOBAL_WORLD_DATA_ITERATOR = 0;
}
uint32_t get_layer_data_by_coordinates(uint32_t layer_id, uint32_t x, uint32_t y) {
    uint32_t layer_width = g_layer_data[layer_id * LAYER_DATA_SIZE + LAYER_WIDTH];
    uint32_t offset = x + y * layer_width;
    offset += g_layer_data[layer_id * LAYER_DATA_SIZE + LAYER_GLOBAL_WORLD_DATA_OFFSET];
    return GLOBAL_WORLD_DATA[offset];
}

// ------------------------------------------------------------------------------------------------
// Resource Creation
// ------------------------------------------------------------------------------------------------
#define CREATE_ENTITY_FUNC(name, data_type, data_size, max_entities, name_id, count, entity_data) \
uint32_t create_##name(data_type data[data_size], ...) { \
    va_list args; \
    va_start(args, data); \
    uint32_t should_clear = va_arg(args, uint32_t); \
    uint32_t value = SENTRY; \
    CREATE_ENTITY(data, entity_data, data_size, max_entities, name_id, count, value); \
    if (should_clear == 1) { \
        CLEAR_DATA(data, data_size); \
    } \
    va_end(args); \
    return value; \
}

#define CREATE_ENTITY(data, entity_data, entity_size, max_entities, name_id, count, value) \
    do { \
        if (data[name_id] == SENTRY) { \
            console_log("Tried to create an entity with an empty name"); \
            value = SENTRY; \
            break; \
        } \
        for (uint32_t i = 0; i < max_entities; ++i) { \
            uint32_t offset = i * entity_size; \
            if (entity_data[offset + name_id] == SENTRY) { \
                for (uint32_t j = 0; j < entity_size; j += 1) { \
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
        for (uint32_t i = 0; i < (size); ++i) { \
            (data)[i] = SENTRY; \
        } \
    } while (0)

#define CLEAR_DATA(data, size) \
    do { \
        for (uint32_t i = 0; i < (size); ++i) { \
            (data)[i] = SENTRY; \
        } \
    } while (0)

#define FREE_ENTITY(entity_type, entity_data, entity_size, max_entities, count) \
void free_##entity_type(uint32_t data_index) { \
    if (data_index >= max_entities) { \
        console_log("Tried to free a " #entity_type " resource that doesn't exist"); \
        return; \
    } \
    uint32_t offset = data_index * entity_size; \
    for (uint32_t i = 0; i < entity_size; ++i) { \
        entity_data[offset + i] = SENTRY; \
    } \
    count -= 1; \
}
// USAGE: FREE_ENTITY(npc, g_npc_data, NPC_DATA_SIZE, MAX_NPCS, g_npc_count);

// Create creation functions based on Macro usage
CREATE_ENTITY_FUNC(npc, uint32_t, NPC_DATA_SIZE, MAX_NPCS, NPC_NAME_ID, g_npc_count, g_npc_data);
CREATE_ENTITY_FUNC(general_item, uint32_t, GENERAL_ITEM_DATA_SIZE, MAX_GENERAL_ITEMS, GENERAL_ITEM_NAME_ID, g_general_item_count, g_general_item_data);
CREATE_ENTITY_FUNC(base_ship, uint32_t, BASE_SHIP_DATA_SIZE, MAX_BASE_SHIPS, BASE_SHIP_NAME_ID, g_base_ship_count, g_base_ship_data);
CREATE_ENTITY_FUNC(ship, uint32_t, SHIP_DATA_SIZE, MAX_SHIPS, SHIP_NAME_ID, g_ship_count, g_ship_data);
CREATE_ENTITY_FUNC(ship_material, uint32_t, SHIP_MATERIAL_DATA_SIZE, MAX_SHIP_MATERIALS, SHIP_MATERIAL_NAME_ID, g_ship_material_count, g_ship_material_data);
CREATE_ENTITY_FUNC(weapon, uint32_t, WEAPON_DATA_SIZE, MAX_WEAPONS, WEAPON_NAME_ID, g_weapon_count, g_weapon_data);
CREATE_ENTITY_FUNC(armor, uint32_t, ARMOR_DATA_SIZE, MAX_ARMORS, ARMOR_NAME_ID, g_armor_count, g_armor_data);
CREATE_ENTITY_FUNC(special_item, uint32_t, SPECIAL_ITEM_DATA_SIZE, MAX_SPECIAL_ITEMS, SPECIAL_ITEM_NAME_ID, g_special_item_count, g_special_item_data);
CREATE_ENTITY_FUNC(world_npc, uint32_t, WORLD_NPC_DATA_SIZE, MAX_WORLD_NPCS, WORLD_NPC_NPC_ID, g_world_npc_count, g_world_npc_data);
CREATE_ENTITY_FUNC(captain, uint32_t, CAPTAIN_DATA_SIZE, MAX_CAPTAINS, CAPTAIN_NPC_ID, g_captain_count, g_captain_data);
CREATE_ENTITY_FUNC(layer, uint32_t, LAYER_DATA_SIZE, MAX_LAYERS, LAYER_NAME_ID, g_layer_count, g_layer_data);
CREATE_ENTITY_FUNC(world, uint32_t, WORLD_DATA_SIZE, MAX_WORLDS, WORLD_NAME_ID, g_world_count, g_world_data);
CREATE_ENTITY_FUNC(inventory, uint32_t, INVENTORY_DATA_SIZE, MAX_INVENTORIES, INVENTORY_NAME_ID, g_inventory_count, g_inventory_data);
CREATE_ENTITY_FUNC(inventory_item, uint32_t, INVENTORY_ITEM_DATA_SIZE, MAX_INVENTORY_ITEMS, INVENTORY_ITEM_NAME_ID, g_inventory_item_count, g_inventory_item_data);
CREATE_ENTITY_FUNC(port, uint32_t, PORT_DATA_SIZE, MAX_PORTS, PORT_NAME_ID, g_port_count, g_port_data);
CREATE_ENTITY_FUNC(stats, uint32_t, STATS_DATA_SIZE, MAX_STATS, STATS_BATTLE_LEVEL, g_stats_count, g_stats_data);
CREATE_ENTITY_FUNC(skill, uint32_t, SKILL_DATA_SIZE, MAX_SKILLS, SKILL_NAME_ID, g_skill_count, g_skill_data);
CREATE_ENTITY_FUNC(entity, uint32_t, ENTITY_DATA_SIZE, MAX_ENTITIES, ENTITY_NAME_ID, g_entity_count, g_entity_data);
CREATE_ENTITY_FUNC(fleet, uint32_t, FLEET_DATA_SIZE, MAX_FLEETS, FLEET_GENERAL_ID, g_fleet_count, g_fleet_data);
CREATE_ENTITY_FUNC(fleet_ship, uint32_t, FLEET_SHIP_DATA_SIZE, MAX_FLEET_SHIPS, FLEET_SHIP_SHIP_ID, g_fleet_ship_count, g_fleet_ship_data);
CREATE_ENTITY_FUNC(fleet_captain, uint32_t, FLEET_CAPTAIN_DATA_SIZE, MAX_FLEET_CAPTAINS, FLEET_CAPTAIN_CAPTAIN_ID, g_fleet_captain_count, g_fleet_captain_data);
CREATE_ENTITY_FUNC(cannon, uint32_t, CANNON_DATA_SIZE, MAX_CANNONS, CANNON_NAME_ID, g_cannon_count, g_cannon_data);
CREATE_ENTITY_FUNC(figurehead, uint32_t, FIGUREHEAD_DATA_SIZE, MAX_FIGUREHEADS, FIGUREHEAD_NAME_ID, g_figurehead_count, g_figurehead_data);


int32_t create_string(const char* machine_name, const char* text) {
    uint32_t machine_name_len = 0;
    uint32_t text_len = 0;
    
    // Calculate lengths
    while (machine_name[machine_name_len] && machine_name_len < MAX_STRING_LENGTH) machine_name_len++;
    while (text[text_len] && text_len < MAX_STRING_LENGTH) text_len++;

    if (machine_name_len >= MAX_STRING_LENGTH || text_len >= MAX_STRING_LENGTH) {
        console_log("String is too long");
        return SENTRY;
    }

    for (uint32_t i = 0; i < MAX_STRINGS; ++i) {
        uint32_t info_offset = i * STRING_DATA_SIZE;
        if (g_string_info[info_offset + (uint32_t)STRING_MACHINE_NAME_LENGTH] == SENTRY) {
            // Calculate the offset for string data
            uint32_t string_offset = i * (MAX_STRING_LENGTH * 2);
            
            // Clear the memory first
            for (uint32_t j = 0; j < MAX_STRING_LENGTH * 2; j++) {
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
uint32_t get_string_id_by_machine_name(const char* machine_name) {
    for (uint32_t i = 0; i < MAX_STRINGS; ++i) {
        uint32_t info_offset = i * STRING_DATA_SIZE;
        // Check if this slot is occupied first
        if (g_string_info[info_offset + (uint32_t)STRING_MACHINE_NAME_LENGTH] == SENTRY) {
            continue;
        }
        
        // Get pointer to the start of this string's machine name
        uint32_t string_offset = i * (MAX_STRING_LENGTH * 2);
        // Note: Machine name is max_string_length + offset
        const char* stored_name = &g_string_data[string_offset];
        
        // console_log_format("Comparing '%s' with '%s'", stored_name, machine_name);
        
        if (strcmp(stored_name, machine_name) == 0) {
            return i;
        }
    }
    console_log_format("== could not find string id by machine name %s ==", machine_name);
    return SENTRY;
}
const char* get_string_text(uint32_t index) {
    if (index >= MAX_STRINGS) return "";
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    uint32_t info_offset = offset + STRING_DATA_SIZE;
    uint32_t length = g_string_info[info_offset + (uint32_t)STRING_TEXT_LENGTH];
    char slice[length + 1];
    for (uint32_t j = 0; j < length; j += 1) {
        slice[j] = g_string_data[offset + j];
    }
    slice[length] = '\0';
    return slice;
}
const char* get_string_machine_name(uint32_t index) {
    if (index >= MAX_STRINGS) {
        console_log("Tried to get a string beyond what the system holds");
        return "";
    }
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    uint32_t info_offset = index * STRING_DATA_SIZE;
    uint32_t length = g_string_info[info_offset + (uint32_t)STRING_MACHINE_NAME_LENGTH];
    char slice[length + 1];
    for (uint32_t j = 0; j < length; j += 1) {
        slice[j] = g_string_data[offset + j];
    }
    slice[length] = '\0';
    return slice;
}
char* get_string_text_ptr(uint32_t index) {
    if (index >= MAX_STRINGS) return NULL;
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    return &g_string_data[offset + (uint32_t)MAX_STRING_LENGTH];
}
uint32_t get_string_text_len(uint32_t index) {
    if (index >= MAX_STRINGS) {
        console_log("Tried to get the length of a string that doesn't exist");
        console_log_format("Index: %d", index);
        return SENTRY;
    }
    uint32_t offset = index * STRING_DATA_SIZE;
    return g_string_info[offset + (uint32_t)STRING_TEXT_LENGTH];
}
char* get_string_machine_name_ptr(uint32_t index) {
    if (index >= MAX_STRINGS) return NULL;
    uint32_t offset = index * MAX_STRING_LENGTH * 2;
    return &g_string_data[offset];
}
uint32_t get_string_machine_name_len(uint32_t index) {
    if (index >= MAX_STRINGS) {
        console_log("Tried to get the length of a string that doesn't exist");
        return SENTRY;
    }
    uint32_t offset = index * STRING_DATA_SIZE;
    return g_string_info[offset + (uint32_t)STRING_MACHINE_NAME_LENGTH];
}

// ------------------------------------------------------------------------------------------------ //
// CANNON FUNCTIONS
// ------------------------------------------------------------------------------------------------ //
void set_cannon_name_id(uint32_t index, uint32_t name_id) {
    if (index >= MAX_CANNONS) return;
    if (name_id >= MAX_STRINGS) return;
    g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_NAME_ID] = name_id;
}
uint32_t get_cannon_name_id(uint32_t index) {
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_NAME_ID];
}
const char* get_cannon_machine_name(uint32_t index) {
    if (index >= MAX_CANNONS) return "";
    uint32_t name_id = get_cannon_name_id(index);
    return get_string_machine_name(name_id);
}
const char* get_cannon_text(uint32_t index) {
    if (index >= MAX_CANNONS) return "";
    uint32_t name_id = get_cannon_name_id(index);
    return get_string_text(name_id);
}
void set_cannon_range(uint32_t index, uint32_t range) {
    if (index >= MAX_CANNONS) return;
    g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_RANGE] = range;
}
uint32_t get_cannon_range(uint32_t index) {
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_RANGE];
}
void set_cannon_power(uint32_t index, uint32_t power) {
    if (index >= MAX_CANNONS) return;
    g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_POWER] = power;
}
uint32_t get_cannon_power(uint32_t index) {
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_POWER];
}
void set_cannon_base_price(uint32_t index, uint32_t base_price) {
    if (index >= MAX_CANNONS) return;
    g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_BASE_PRICE] = base_price;
}
uint32_t get_cannon_base_price(uint32_t index) {
    if (index >= MAX_CANNONS) return SENTRY;
    return g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE + (uint32_t)CANNON_BASE_PRICE];
}
uint32_t get_cannon_pointer(uint32_t index) {
    if (index >= MAX_CANNONS) return SENTRY;
    return (uint32_t)&g_cannon_data[index * (uint32_t)CANNON_DATA_SIZE];
}
uint32_t get_cannon_length(void) {
    return CANNON_DATA_SIZE;
}

// ------------------------------------------------------------------------------------------------
// GENERAL ITEMS
// ------------------------------------------------------------------------------------------------
uint32_t get_general_item_id_by_string_id(uint32_t string_id) {
    for (uint32_t i = 0; i < MAX_GENERAL_ITEMS; ++i) {
        if (g_general_item_data[i * GENERAL_ITEM_DATA_SIZE + GENERAL_ITEM_NAME_ID] == string_id) {
            return i;
        }
    }
    return SENTRY;
}

// ------------------------------------------------------------------------------------------------ //
// DISTANCES
// ------------------------------------------------------------------------------------------------ //
uint32_t distance_between_coordinates(uint32_t a_x, uint32_t a_y, uint32_t b_x, uint32_t b_y) {
    uint32_t dx = (b_x > a_x) ? (b_x - a_x) : (a_x - b_x);
    uint32_t dy = (b_y > a_y) ? (b_y - a_y) : (a_y - b_y);
    return dx + dy;
}
bool is_coordinate_in_range_of_coordinate(uint32_t a_x, uint32_t a_y, uint32_t b_x, uint32_t b_y, uint32_t range) {
    return distance_between_coordinates(a_x, a_y, b_x, b_y) <= range;
}

// ------------------------------------------------------------------------------------------------ //
// RNG
// ------------------------------------------------------------------------------------------------ //
uint32_t tick_counter = 1;
uint32_t rng_state = 1;
uint32_t init_random(uint32_t seed) {
    rng_state = seed;
    return rng_state;
}
uint32_t get_random_number(uint32_t min, uint32_t max) {
    uint32_t rng_state = init_random(tick_counter);
    uint32_t adjusted_max = max;
    if (min == max) {
        adjusted_max = 100;
    }
    uint32_t range = adjusted_max - min + 1;
    uint32_t result = min + (rng_state % range);
    
    if (tick_counter == UINT32_MAX) {
        tick_counter = 1;
    } else {
        tick_counter++;
    }
    
    return result;
}

// ------------------------------------------------------------------------------------------------ //
// INPUT
// ------------------------------------------------------------------------------------------------ //
void user_input_right() {
    handle_input(USER_INPUT_RIGHT);
}
void user_input_left() {
    handle_input(USER_INPUT_LEFT);
}
void user_input_up() {
    handle_input(USER_INPUT_UP);
}
void user_input_down() {
    handle_input(USER_INPUT_DOWN);
}
void user_input_a() {
    handle_input(USER_INPUT_A);
}
void user_input_start() {
    console_log("START BUTTON PRESSED");
    // TODO: Pause the game/tick
}
void user_input_number(uint32_t number) {
    // Note: This is a bit weird but we are essentially setting the user number and then passing off the "event" to the handler
    current_user_input_number = number;
    handle_input(USER_INPUT_CUSTOM_NUMBER);
}
void handle_interaction_scene(uint32_t interaction_scene, uint32_t world_npc_id)
{
    if (interaction_scene == SCENE_BLACKJACK) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_blackjack(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_GENERAL_SHOP) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_general_shop(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_OCEAN_BATTLE) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_ocean_battle(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_NPC_RVICE) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_rvice(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_NPC_LAFOLIE) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_lafolie(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_NPC_NAKOR) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_nakor(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_NPC_TRAVIS) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_travis(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_NPC_LOLLER) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_npc_loller(SCENE_ACTION_INIT);
    } else if (interaction_scene == SCENE_BANK) {
        set_current_scene_triggered_by_world_npc_id(world_npc_id);
        scene_bank(SCENE_ACTION_INIT);
    }
}
void handle_input(uint32_t input) {
    // TODO: If current_game_mode is GAME_MODE_IN_PORT etc...
    // NOTE: Apparenty you have to declare variables up here, NOT INSIDE THE CASE FUNCTIONS THEMSELVES
    if (current_game_mode == GAME_MODE_IN_PORT) {
        uint32_t world_npc_id = get_player_in_world(0);
        uint32_t current_world_x = get_world_npc_x(world_npc_id);
        uint32_t current_world_y = get_world_npc_y(world_npc_id);
        uint32_t current_world_direction = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + (uint32_t)WORLD_NPC_DIRECTION];
        switch (input) {
            case USER_INPUT_A:
                if (current_world_direction == DIRECTION_UP) {
                    if (current_world_y > 0) {
                        uint32_t intended_y = current_world_y - 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
                            if (i == world_npc_id) {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == current_world_x && other_world_y == intended_y) {
                                uint32_t interaction_scene = g_world_npc_data[i * WORLD_NPC_DATA_SIZE + (uint32_t)WORLD_NPC_INTERACTION_SCENE];
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                } else if (current_world_direction == DIRECTION_DOWN) {
                    if (current_world_y < get_current_world_height()) {
                        uint32_t intended_y = current_world_y + 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
                            if (i == world_npc_id) {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == current_world_x && other_world_y == intended_y) {
                                uint32_t interaction_scene = g_world_npc_data[i * WORLD_NPC_DATA_SIZE + (uint32_t)WORLD_NPC_INTERACTION_SCENE];
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                } else if (current_world_direction == DIRECTION_LEFT) {
                    if (current_world_x > 0) {
                        uint32_t intended_x = current_world_x - 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
                            if (i == world_npc_id) {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == intended_x && other_world_y == current_world_y) {
                                uint32_t interaction_scene = g_world_npc_data[i * WORLD_NPC_DATA_SIZE + (uint32_t)WORLD_NPC_INTERACTION_SCENE];
                                handle_interaction_scene(interaction_scene, i);
                            }
                        }
                    }
                } else if (current_world_direction == DIRECTION_RIGHT) {
                    if (current_world_x < get_current_world_width()) {
                        uint32_t intended_x = current_world_x + 1;
                        for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
                            if (i == world_npc_id) {
                                continue;
                            }
                            uint32_t other_world_x = get_world_npc_x(i);
                            uint32_t other_world_y = get_world_npc_y(i);
                            if (other_world_x == intended_x && other_world_y == current_world_y) {
                                uint32_t interaction_scene = g_world_npc_data[i * WORLD_NPC_DATA_SIZE + (uint32_t)WORLD_NPC_INTERACTION_SCENE];
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
                if (current_game_mode != GAME_MODE_IN_SCENE) {
                    move_player_up(0);
                    update_camera();
                }
                break;
            case USER_INPUT_DOWN:
                if (current_game_mode != GAME_MODE_IN_SCENE) {
                    move_player_down(0);
                    update_camera();
                }
                break;
            case USER_INPUT_LEFT:
                if (current_game_mode != GAME_MODE_IN_SCENE) {
                    move_player_left(0);
                    update_camera();
                }
                break;
            case USER_INPUT_RIGHT:
                if (current_game_mode != GAME_MODE_IN_SCENE) {
                    move_player_right(0);
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
// SHOULD REDRAW
// ------------------------------------------------------------------------------------------------ //
enum ShouldRedraw should_redraw = SHOULD_REDRAW_NOTHING;
uint32_t renderer_should_redraw() {
    if (should_redraw > 0) {
        enum ShouldRedraw original_should_redraw = should_redraw;
        should_redraw = SHOULD_REDRAW_NOTHING;
        return original_should_redraw;
    }

    return 0;
}
void should_redraw_everything() {
    should_redraw = SHOULD_REDRAW_EVERYTHING;
}

// ------------------------------------------------------------------------------------------------
// INPUT OUTPUT BUFFERS
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
void to_output_string_buffer(const char* message) {
    if (message != NULL) {
        js_output_string_buffer((void*)message, (uint32_t)(sizeof(char) * strlen(message)));
    }
}
void to_output_array_buffer(uint32_t array[]) {
    for (int i = 0; i < OUTPUT_ARRAY_BUFFER_SIZE; ++i) {
        output_array_buffer[i] = array[i];
    }
    js_output_array_buffer(output_array_buffer, OUTPUT_ARRAY_BUFFER_SIZE * sizeof(uint32_t));
}
void set_input_string_buffer_length(uint32_t length) {
    input_string_buffer_length = length;
}
void set_input_array_buffer_length(uint32_t length) {
    input_array_buffer_length = length;
}
uint8_t* get_input_string_buffer_ptr() {
    return input_string_buffer;
}
uint32_t* get_input_array_buffer_ptr() {
    return input_array_buffer;
}
uint8_t* get_output_string_buffer_ptr() {
    return output_string_buffer;
}
uint32_t* get_output_array_buffer_ptr() {
    return output_array_buffer;
}
uint32_t get_input_string_buffer_len() {
    return INPUT_STRING_BUFFER_SIZE;
}
uint32_t get_input_array_buffer_len() {
    return INPUT_ARRAY_BUFFER_SIZE;
}
char* format_input_string() {
    static char formatted[256];
    // somehow clear formatted using NOT stdlib functions
    for (uint32_t i = 0; i < 256; ++i) {
        formatted[i] = 0;
    }
    
    char* input = (char*)input_string_buffer;
    if (input == NULL) {
        console_log("Warning: Input string is NULL");
        return formatted;
    }
    
    uint32_t len = strlen(input);
    for (uint32_t i = 0; i < len && i < 255; i++) {
        formatted[i] = input[i];
    }
    formatted[255] = '\0';
    
    return formatted;
}
void write_to_output_buffer(char* str) {
    for (uint32_t i = 0; i < OUTPUT_STRING_BUFFER_SIZE; ++i) {
        output_string_buffer[i] = 0;
    }
    for (uint32_t i = 0; i < strlen(str); ++i) {
        output_string_buffer[i] = str[i];
    }
}
uint32_t find_string_id_by_machine_name_from_input() {
    char* input = (char*)input_string_buffer;
    input[input_string_buffer_length] = '\0';
    for (uint32_t i = input_string_buffer_length + 1; i < INPUT_STRING_BUFFER_SIZE; i++) {
        input[i] = '\0';
    }
    if (input == NULL) {
        console_log("Warning: Input string is NULL");
        return SENTRY;
    }
    // input_string_buffer_length
    uint32_t string_id = get_string_id_by_machine_name(input);
    return string_id;
}

// ------------------------------------------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------------------------------------------
void move_camera_down() {
    if (current_world == SENTRY) {
        return;
    }
    uint32_t map_height = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_HEIGHT];
    
    // Calculate the maximum allowed camera offset
    uint32_t max_camera_offset_y = max(0, map_height - viewport_height);
    
    // Check if moving down would exceed the map bounds
    if (camera_offset_y < max_camera_offset_y) {
        camera_offset_y += 1;
        should_redraw_everything();
    }
}
void move_camera_right() {
    if (current_world == SENTRY) {
        return;
    }
    uint32_t map_width = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_WIDTH];
    
    // Calculate the maximum allowed camera offset
    uint32_t max_camera_offset_x = max(0, map_width - viewport_width);
    
    // Check if moving right would exceed the map bounds
    if (camera_offset_x < max_camera_offset_x) {
        camera_offset_x += 1;
        should_redraw_everything();
    }
}
void move_camera_up() {
    if (camera_offset_y > 0) {
        camera_offset_y -= 1;
        should_redraw_everything();
    }
}
void move_camera_left() {
    if (camera_offset_x > 0) {
        camera_offset_x -= 1;
        should_redraw_everything();
    }
}
void update_camera() {
    uint32_t world_npc_id = get_player_in_world(0);
    uint32_t player_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t player_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    if (is_world_coordinate_halfway_of_viewport_more_than_x(player_x)) {
        move_camera_right();
    } else if (is_world_coordinate_halfway_of_viewport_less_than_x(player_x) && camera_offset_x > 0) {
        move_camera_left();
    }
    if (is_world_coordinate_halfway_of_viewport_more_than_y(player_y)) {
        move_camera_down();
    } else if (is_world_coordinate_halfway_of_viewport_less_than_y(player_y) && camera_offset_y > 0) {
        move_camera_up();
    }
    should_redraw_everything();
}

// ------------------------------------------------------------------------------------------------
// VIEWPORT
// ------------------------------------------------------------------------------------------------
void set_viewport_size(uint32_t width, uint32_t height) {
    viewport_width = width;
    viewport_height = height;
}
uint32_t get_viewport_width() {
    return viewport_width;
}
uint32_t get_viewport_height() {
    return viewport_height;
}
uint32_t get_viewport_value_at_coordinates(uint32_t layer_index, uint32_t x, uint32_t y) {
    if (current_world == SENTRY) {
        return SENTRY;
    }
    uint32_t world_width = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_WIDTH];
    uint32_t world_height = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_HEIGHT];
    uint32_t x_padding = 0;
    uint32_t y_padding = 0;
    if (viewport_width > world_width) {
        x_padding = (viewport_width - world_width) / 2;
    }
    if (viewport_height > world_height) {
        y_padding = (viewport_height - world_height) / 2;
    }
    uint32_t x_offset = x - x_padding;
    uint32_t y_offset = y - y_padding;
    x_offset += camera_offset_x;
    y_offset += camera_offset_y;
    if (x_offset < 0 || y_offset < 0 || x_offset >= world_width || y_offset >= world_height) {
        // console_log_format("Off the edge of viewport %d %d %d %d", x_offset, y_offset, world_width, world_height);
        return SENTRY;
    }

    const char* machine_name = get_layer_machine_name(layer_index);
    if (strcmp("npc_layer", machine_name) == 0) {
        for (uint32_t i = 0; i < MAX_WORLD_NPCS; i++) {
            if (g_world_npc_data[i * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X] == x_offset &&
                g_world_npc_data[i * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y] == y_offset) {
                // return g_world_npc_data[i * WORLD_NPC_DATA_SIZE + WORLD_NPC_NPC_ID];
                return i;
            }
        }
        return SENTRY;
    }

    if (get_layer_same_value(layer_index) != SENTRY) {
        return get_layer_same_value(layer_index);
    }
    uint32_t value = get_layer_data_by_coordinates(layer_index, x_offset, y_offset);
    return value;
}
bool is_world_coordinate_in_viewport(uint32_t x, uint32_t y) {
    return x >= camera_offset_x && x < camera_offset_x + viewport_width &&
           y >= camera_offset_y && y < camera_offset_y + viewport_height;
}
uint32_t is_world_coordinate_halfway_of_viewport_more_than_x(uint32_t x) {
    uint32_t halfway_x = camera_offset_x + viewport_width / 2;
    return x > halfway_x;
}
uint32_t is_world_coordinate_halfway_of_viewport_more_than_y(uint32_t y) {
    uint32_t halfway_y = camera_offset_y + viewport_height / 2;
    return y > halfway_y;
}
uint32_t is_world_coordinate_halfway_of_viewport_less_than_x(uint32_t x) {
    uint32_t halfway_x = camera_offset_x + viewport_width / 2;
    return x < halfway_x;
}
uint32_t is_world_coordinate_halfway_of_viewport_less_than_y(uint32_t y) {
    uint32_t halfway_y = camera_offset_y + viewport_height / 2;
    return y < halfway_y;
}
uint32_t get_world_coordinate_x_from_viewport_coordinate(uint32_t x, uint32_t y) {
    if (current_world == SENTRY) {
        return SENTRY;
    }
    uint32_t world_width = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_WIDTH];
    uint32_t world_height = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_HEIGHT];
    uint32_t x_padding = 0;
    uint32_t y_padding = 0;
    if (viewport_width > world_width) {
        x_padding = (viewport_width - world_width) / 2;
    }
    if (viewport_height > world_height) {
        y_padding = (viewport_height - world_height) / 2;
    }
    uint32_t x_offset = x - x_padding;
    uint32_t y_offset = y - y_padding;
    x_offset += camera_offset_x;
    y_offset += camera_offset_y;
    if (x_offset < 0 || y_offset < 0 || x_offset >= world_width || y_offset >= world_height) {
        // console_log_format("Off the edge of viewport %d %d %d %d", x_offset, y_offset, world_width, world_height);
        return SENTRY;
    }

    return x_offset;
}
uint32_t get_world_coordinate_y_from_viewport_coordinate(uint32_t x, uint32_t y) {
    if (current_world == SENTRY) {
        return SENTRY;
    }
    uint32_t world_width = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_WIDTH];
    uint32_t world_height = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_HEIGHT];
    uint32_t x_padding = 0;
    uint32_t y_padding = 0;
    if (viewport_width > world_width) {
        x_padding = (viewport_width - world_width) / 2;
    }
    if (viewport_height > world_height) {
        y_padding = (viewport_height - world_height) / 2;
    }
    uint32_t x_offset = x - x_padding;
    uint32_t y_offset = y - y_padding;
    x_offset += camera_offset_x;
    y_offset += camera_offset_y;
    if (x_offset < 0 || y_offset < 0 || x_offset >= world_width || y_offset >= world_height) {
        // console_log_format("Off the edge of viewport %d %d %d %d", x_offset, y_offset, world_width, world_height);
        return SENTRY;
    }

    return y_offset;
}

// ------------------------------------------------------------------------------------------------ //
// WORLDS & LAYERS
// ------------------------------------------------------------------------------------------------ //
uint32_t get_current_world_width() {
    return g_world_data[current_world * WORLD_DATA_SIZE + WORLD_WIDTH];
}
uint32_t get_current_world_height() {
    return g_world_data[current_world * WORLD_DATA_SIZE + WORLD_HEIGHT];
}
uint32_t get_current_world_total_layers() {
    return g_world_data[current_world * WORLD_DATA_SIZE + WORLD_TOTAL_LAYERS];
}
uint32_t get_layer_width(uint32_t layer_index) {
    return g_layer_data[layer_index * LAYER_DATA_SIZE + LAYER_WIDTH];
}
uint32_t get_layer_height(uint32_t layer_index) {
    return g_layer_data[layer_index * LAYER_DATA_SIZE + LAYER_HEIGHT];
}
uint32_t get_layer_global_world_data_offset(uint32_t layer_index) {
    return g_layer_data[layer_index * LAYER_DATA_SIZE + LAYER_GLOBAL_WORLD_DATA_OFFSET];
}
uint32_t get_layer_is_block(uint32_t layer_index) {
    return g_layer_data[layer_index * LAYER_DATA_SIZE + LAYER_IS_BLOCK];
}
uint32_t get_layer_name_id(uint32_t layer_index) {
    return g_layer_data[layer_index * LAYER_DATA_SIZE + LAYER_NAME_ID];
}
uint32_t get_layer_type(uint32_t layer_index) {
    return g_layer_data[layer_index * LAYER_DATA_SIZE + LAYER_TYPE];
}
uint32_t get_layer_same_value(uint32_t layer_index) {
    return g_layer_data[layer_index * LAYER_DATA_SIZE + LAYER_SAME_VALUE];
}
const char* get_layer_machine_name(uint32_t layer_index) {
    uint32_t name_id = get_layer_name_id(layer_index);
    return get_string_machine_name(name_id);
}
uint32_t find_layer_id_by_string_id(uint32_t string_id) {
    for (uint32_t i = 0; i < MAX_LAYERS; ++i) {
        if (g_layer_data[i * LAYER_DATA_SIZE + LAYER_NAME_ID] == string_id) {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_layer_id_by_machine_name(char* machine_name) {
    for (uint32_t i = 0; i < MAX_LAYERS; ++i) {
        uint32_t offset = i * LAYER_DATA_SIZE;
        uint32_t name_id = g_layer_data[offset + LAYER_NAME_ID];
        const char* grabbed_machine_name = get_string_machine_name(name_id);
        if (strcmp(machine_name, grabbed_machine_name) == 0) {
            return i;
        }
    }
    return SENTRY;
}
uint32_t are_coordinates_blocked(uint32_t x, uint32_t y) {
    for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
        uint32_t offset = i * WORLD_NPC_DATA_SIZE;
        if (g_world_npc_data[offset + WORLD_NPC_IS_PLAYER] == true) {
            continue;
        }
        if (g_world_npc_data[offset + WORLD_NPC_POSITION_X] == x && g_world_npc_data[offset + WORLD_NPC_POSITION_Y] == y) {
            return 1;
        }
    }

    uint32_t block_layer_id = get_layer_id_by_machine_name("block_layer");
    if (block_layer_id != SENTRY) {
        uint32_t layer_value = get_layer_data_by_coordinates(block_layer_id, x, y);
        if (layer_value > 0 && layer_value != SENTRY) {
            return 1;
        }
    }
    return 0;
}

void generate_world(char* world_name)
{
    console_log_format("Generating world %s", world_name);
    if (strcmp(world_name, "athens") == 0)
    {
        previous_game_mode = current_game_mode;
        current_game_mode = GAME_MODE_IN_PORT;

        uint32_t world_name_id = get_string_id_by_machine_name("athens");
        for (uint32_t i = 0; i < MAX_WORLDS; i++) {
            uint32_t index = i * WORLD_DATA_SIZE;
            if (g_world_data[index + WORLD_NAME_ID] == world_name_id) {
                current_world = i;
                break;
            }
        }
        if (current_world == SENTRY) {
            console_log_format("Could not find world %s", world_name);
        }

        // TODO: Clear all layers. No need to keep old ones.
        clear_global_world_data();

        uint32_t world_width = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_WIDTH];
        uint32_t world_height = g_world_data[current_world * WORLD_DATA_SIZE + WORLD_HEIGHT];
        uint32_t layer_id;
        uint32_t layer_data[LAYER_DATA_SIZE];
        CLEAR_DATA(layer_data, LAYER_DATA_SIZE);
        layer_data[LAYER_NAME_ID] = get_string_id_by_machine_name("background_layer");
        layer_data[LAYER_TYPE] = LAYER_TYPE_MATCHES_WORLD_SIZE;
        layer_data[LAYER_WIDTH] = world_width;
        layer_data[LAYER_HEIGHT] = world_height;
        layer_data[LAYER_SAME_VALUE] = 1;
        layer_data[LAYER_IS_BLOCK] = false;
        layer_data[LAYER_GLOBAL_WORLD_DATA_OFFSET] = GLOBAL_WORLD_DATA_ITERATOR;
        layer_id = create_layer(layer_data, true);
        // console_log_format("bg layer is %d", layer_id);
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        g_world_data[current_world * WORLD_DATA_SIZE + WORLD_TOTAL_LAYERS] += 1;
        layer_data[LAYER_NAME_ID] = get_string_id_by_machine_name("npc_layer");
        // TODO: Technically, we do not need to store this layer in the global data at all
        layer_data[LAYER_TYPE] = LAYER_TYPE_MATCHES_WORLD_SIZE;
        layer_data[LAYER_WIDTH] = world_width;
        layer_data[LAYER_HEIGHT] = world_height;
        layer_data[LAYER_IS_BLOCK] = false;
        layer_data[LAYER_GLOBAL_WORLD_DATA_OFFSET] = GLOBAL_WORLD_DATA_ITERATOR;
        layer_id = create_layer(layer_data, true);
        // console_log_format("npc layer is %d", layer_id);
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        g_world_data[current_world * WORLD_DATA_SIZE + WORLD_TOTAL_LAYERS] += 1;
        CLEAR_DATA(layer_data, LAYER_DATA_SIZE);
        layer_data[LAYER_NAME_ID] = get_string_id_by_machine_name("block_layer");
        layer_data[LAYER_TYPE] = LAYER_TYPE_MATCHES_WORLD_SIZE;
        layer_data[LAYER_WIDTH] = world_width;
        layer_data[LAYER_HEIGHT] = world_height;
        layer_data[LAYER_IS_BLOCK] = true;
        layer_data[LAYER_GLOBAL_WORLD_DATA_OFFSET] = GLOBAL_WORLD_DATA_ITERATOR;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        layer_id = create_layer(layer_data, true);
        // console_log_format("block layer is %d", layer_id);
        g_world_data[current_world * WORLD_DATA_SIZE + WORLD_TOTAL_LAYERS] += 1;
        add_value_to_global_world_data(layer_id, 2, 2, 1);
        CLEAR_DATA(layer_data, LAYER_DATA_SIZE);
        layer_data[LAYER_NAME_ID] = get_string_id_by_machine_name("layer_one");
        layer_data[LAYER_TYPE] = LAYER_TYPE_MATCHES_WORLD_SIZE;
        layer_data[LAYER_WIDTH] = world_width;
        layer_data[LAYER_HEIGHT] = world_height;
        layer_data[LAYER_GLOBAL_WORLD_DATA_OFFSET] = GLOBAL_WORLD_DATA_ITERATOR;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        layer_id = create_layer(layer_data, true);
        // console_log_format("layer one is %d", layer_id);
        g_world_data[current_world * WORLD_DATA_SIZE + WORLD_TOTAL_LAYERS] += 1;
        add_value_to_global_world_data(layer_id, 0, 2, 36);
        add_value_to_global_world_data(layer_id, 7, 2, 38);
        add_value_to_global_world_data(layer_id, 0, 3, 33);
        add_value_to_global_world_data(layer_id, 0, 4, 33);
        add_value_to_global_world_data(layer_id, 5, 3, 34);
        add_value_to_global_world_data(layer_id, 5, 4, 34);
        for (uint32_t column = 1; column < 7; ++column) {
            add_value_to_global_world_data(layer_id, column, 2, 37);
        }
        for (uint32_t column = 1; column < 7; ++column) {
            add_value_to_global_world_data(layer_id, column, 3, 34);
            add_value_to_global_world_data(layer_id, column, 4, 34);
        }
        add_value_to_global_world_data(layer_id, 7, 3, 35);
        add_value_to_global_world_data(layer_id, 7, 4, 35);
        add_value_to_global_world_data(layer_id, 0, 5, 39);
        for (uint32_t column = 1; column < 7; ++column) {
            add_value_to_global_world_data(layer_id, column, 5, 40);
        }
        add_value_to_global_world_data(layer_id, 7, 5, 41);

        CLEAR_DATA(layer_data, LAYER_DATA_SIZE);
        layer_data[LAYER_NAME_ID] = get_string_id_by_machine_name("layer_two");
        layer_data[LAYER_TYPE] = LAYER_TYPE_MATCHES_WORLD_SIZE;
        layer_data[LAYER_WIDTH] = world_width;
        layer_data[LAYER_HEIGHT] = world_height;
        layer_data[LAYER_GLOBAL_WORLD_DATA_OFFSET] = GLOBAL_WORLD_DATA_ITERATOR;
        GLOBAL_WORLD_DATA_ITERATOR += (world_width * world_height);
        layer_id = create_layer(layer_data, true);
        // console_log_format("layer one is %d", layer_id);
        g_world_data[current_world * WORLD_DATA_SIZE + WORLD_TOTAL_LAYERS] += 1;
        add_value_to_global_world_data(layer_id, 5, 3, 69);

        // TODO: Why do you have this array here?
        uint32_t npc_data[NPC_DATA_SIZE];
        uint32_t world_npc_data[WORLD_NPC_DATA_SIZE];
        uint32_t npc_id;
        uint32_t world_npc_id;

        npc_id = get_npc_id_by_machine_name("bank_teller");
        CLEAR_DATA(world_npc_data, WORLD_NPC_DATA_SIZE);
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = SENTRY;
        world_npc_data[WORLD_NPC_POSITION_X] = 4;
        world_npc_data[WORLD_NPC_POSITION_Y] = 0;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_BANK;
        world_npc_data[WORLD_NPC_IS_INTERACTABLE] = true;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = false;
        world_npc_id = create_world_npc(world_npc_data, true);

        uint32_t general_item_id;
        uint32_t item_string_id;
        uint32_t inventory_id;
        uint32_t inventory_item_id;
        uint32_t inventory_data[INVENTORY_DATA_SIZE];
        CLEAR_DATA(inventory_data, INVENTORY_DATA_SIZE);
        uint32_t inventory_item_data[INVENTORY_ITEM_DATA_SIZE];
        CLEAR_DATA(inventory_item_data, INVENTORY_ITEM_DATA_SIZE);

        item_string_id = get_string_id_by_machine_name("telescope");
        general_item_id = get_general_item_id_by_string_id(item_string_id);
        inventory_data[INVENTORY_NAME_ID] = get_string_id_by_machine_name("general_shop_inventory");
        inventory_data[INVENTORY_TOTAL_ITEMS] = 0;
        inventory_id = create_inventory(inventory_data, true);
        inventory_item_data[INVENTORY_ITEM_NAME_ID] = item_string_id;
        // TODO: Change NUMBER_HELD/NUMBER_CHOSE to some kind of "quantity" term
        inventory_item_data[INVENTORY_ITEM_NUMBER_HELD] = 22;
        inventory_item_data[INVENTORY_ITEM_TYPE] = INVENTORY_TYPE_GENERAL_ITEM;
        inventory_item_data[INVENTORY_ITEM_TYPE_REFERENCE] = general_item_id;
        inventory_item_data[INVENTORY_ITEM_INVENTORY_ID] = inventory_id;
        inventory_item_data[INVENTORY_ITEM_ADJUSTED_PRICE] = 400;
        // TODO: Do we need to keep this anymore?
        inventory_item_data[INVENTORY_ITEM_NUMBER_CHOSEN] = SENTRY;
        create_inventory_item(inventory_item_data, true);
        increment_inventory_total_items(inventory_id);
        item_string_id = get_string_id_by_machine_name("quadrant");
        general_item_id = get_general_item_id_by_string_id(item_string_id);
        inventory_item_data[INVENTORY_ITEM_NAME_ID] = item_string_id;
        inventory_item_data[INVENTORY_ITEM_NUMBER_HELD] = 2;
        inventory_item_data[INVENTORY_ITEM_TYPE] = INVENTORY_TYPE_GENERAL_ITEM;
        inventory_item_data[INVENTORY_ITEM_TYPE_REFERENCE] = general_item_id;
        inventory_item_data[INVENTORY_ITEM_INVENTORY_ID] = inventory_id;
        inventory_item_data[INVENTORY_ITEM_ADJUSTED_PRICE] = 430;
        inventory_item_data[INVENTORY_ITEM_NUMBER_CHOSEN] = SENTRY;
        create_inventory_item(inventory_item_data, true);
        increment_inventory_total_items(inventory_id);
        item_string_id = get_string_id_by_machine_name("theodolite");
        general_item_id = get_general_item_id_by_string_id(item_string_id);
        inventory_item_data[INVENTORY_ITEM_NAME_ID] = item_string_id;
        inventory_item_data[INVENTORY_ITEM_NUMBER_HELD] = 1;
        inventory_item_data[INVENTORY_ITEM_TYPE] = INVENTORY_TYPE_GENERAL_ITEM;
        inventory_item_data[INVENTORY_ITEM_TYPE_REFERENCE] = general_item_id;
        inventory_item_data[INVENTORY_ITEM_INVENTORY_ID] = inventory_id;
        inventory_item_data[INVENTORY_ITEM_ADJUSTED_PRICE] = 222;
        inventory_item_data[INVENTORY_ITEM_NUMBER_CHOSEN] = SENTRY;
        create_inventory_item(inventory_item_data, true);
        increment_inventory_total_items(inventory_id);
        item_string_id = get_string_id_by_machine_name("sextant");
        general_item_id = get_general_item_id_by_string_id(item_string_id);
        inventory_item_data[INVENTORY_ITEM_NAME_ID] = item_string_id;
        inventory_item_data[INVENTORY_ITEM_NUMBER_HELD] = 2;
        inventory_item_data[INVENTORY_ITEM_TYPE] = INVENTORY_TYPE_GENERAL_ITEM;
        inventory_item_data[INVENTORY_ITEM_TYPE_REFERENCE] = general_item_id;
        inventory_item_data[INVENTORY_ITEM_INVENTORY_ID] = inventory_id;
        inventory_item_data[INVENTORY_ITEM_ADJUSTED_PRICE] = 666;
        inventory_item_data[INVENTORY_ITEM_NUMBER_CHOSEN] = SENTRY;
        create_inventory_item(inventory_item_data, true);
        increment_inventory_total_items(inventory_id);
        npc_id = get_npc_id_by_machine_name("general_shop_owner");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = SENTRY;
        world_npc_data[WORLD_NPC_POSITION_X] = 3;
        world_npc_data[WORLD_NPC_POSITION_Y] = 0;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_INTERACTABLE] = true;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = false;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_GENERAL_SHOP;
        world_npc_data[WORLD_NPC_INVENTORY_ID] = inventory_id;
        create_world_npc(world_npc_data, true);

        npc_id = get_npc_id_by_machine_name("blackjack_player");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = SENTRY;
        world_npc_data[WORLD_NPC_POSITION_X] = 5;
        world_npc_data[WORLD_NPC_POSITION_Y] = 0;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_INTERACTABLE] = true;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = false;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_BLACKJACK;
        create_world_npc(world_npc_data, true);

        npc_id = get_player_npc_id(0);
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = players[0];
        world_npc_data[WORLD_NPC_POSITION_X] = 0;
        world_npc_data[WORLD_NPC_POSITION_Y] = 0;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = true;
        world_npc_data[WORLD_NPC_IS_PLAYER] = true;
        create_world_npc(world_npc_data, true);

        npc_id = get_npc_id_by_machine_name("npc_ocean_battle");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_POSITION_X] = 0;
        world_npc_data[WORLD_NPC_POSITION_Y] = 1;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = false;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_OCEAN_BATTLE;
        create_world_npc(world_npc_data, true);

        npc_id = get_npc_id_by_machine_name("npc_rvice");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = 1;
        world_npc_data[WORLD_NPC_POSITION_X] = 0;
        world_npc_data[WORLD_NPC_POSITION_Y] = 2;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = true;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_NPC_RVICE;
        create_world_npc(world_npc_data, true);

        npc_id = get_npc_id_by_machine_name("npc_lafolie");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = 2;
        world_npc_data[WORLD_NPC_POSITION_X] = 0;
        world_npc_data[WORLD_NPC_POSITION_Y] = 3;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = true;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_NPC_LAFOLIE;
        create_world_npc(world_npc_data, true);

        npc_id = get_npc_id_by_machine_name("npc_nakor");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = 3;
        world_npc_data[WORLD_NPC_POSITION_X] = 0;
        world_npc_data[WORLD_NPC_POSITION_Y] = 4;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = true;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_NPC_NAKOR;
        create_world_npc(world_npc_data, true);

        npc_id = get_npc_id_by_machine_name("npc_travis");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_CAPTAIN_ID] = 4;
        world_npc_data[WORLD_NPC_POSITION_X] = 0;
        world_npc_data[WORLD_NPC_POSITION_Y] = 5;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = true;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_NPC_TRAVIS;
        create_world_npc(world_npc_data, true);

        npc_id = get_npc_id_by_machine_name("npc_loller");
        world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
        world_npc_data[WORLD_NPC_POSITION_X] = 0;
        world_npc_data[WORLD_NPC_POSITION_Y] = 6;
        world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
        world_npc_data[WORLD_NPC_IS_CAPTAIN] = false;
        world_npc_data[WORLD_NPC_INTERACTION_SCENE] = SCENE_NPC_LOLLER;
        create_world_npc(world_npc_data, true);

        should_redraw_everything();
    } else {
        console_log_format("Could not find world %s", world_name);
    }
}

// ------------------------------------------------------------------------------------------------
// NPCS
// ------------------------------------------------------------------------------------------------
uint32_t get_npc_id_by_machine_name(char* machine_name) {
    for (uint32_t i = 0; i < MAX_NPCS; i++) {
        if (g_npc_data[i * NPC_DATA_SIZE + NPC_NAME_ID] == get_string_id_by_machine_name(machine_name)) {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_npc_name_id(uint32_t npc_id) {
    uint32_t offset = npc_id * NPC_DATA_SIZE;
    return g_npc_data[offset + NPC_NAME_ID];
}
uint32_t get_npc_type(uint32_t npc_id) {
    uint32_t offset = npc_id * NPC_DATA_SIZE;
    return g_npc_data[offset + NPC_TYPE];
}

// ------------------------------------------------------------------------------------------------
// WORLD NPCS
// ------------------------------------------------------------------------------------------------
uint32_t get_world_npc_x(uint32_t world_npc_id) {
    return g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
}
uint32_t get_world_npc_y(uint32_t world_npc_id) {
    return g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
}
uint32_t get_world_npc_inventory_id(uint32_t world_npc_id) {
    return g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_INVENTORY_ID];
}
uint32_t get_world_npc_type(uint32_t world_npc_id) {
    uint32_t npc_id = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_NPC_ID];
    if (npc_id != SENTRY) {
        return get_npc_type(npc_id);
    }
    return SENTRY;
}
uint32_t get_world_npc_name_id(uint32_t world_npc_id) {
    uint32_t npc_id = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_NPC_ID];
    if (npc_id != SENTRY) {
        return get_npc_name_id(npc_id);
    }
    return SENTRY;
}
void clear_world_npc(uint32_t world_npc_id) {
    uint32_t offset = world_npc_id * WORLD_NPC_DATA_SIZE;
    for (uint32_t i = 0; i < WORLD_NPC_DATA_SIZE; ++i) {
        g_world_npc_data[offset + i] = SENTRY;
    }
    --g_world_npc_count;
}
uint32_t get_world_npc_entity_id(uint32_t world_npc_id) {
    return g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_ENTITY_ID];
}
void move_world_npc_to(uint32_t world_npc_id, uint32_t x, uint32_t y) {
    console_log_format("Moving world npc id %d to x %d and y %d", world_npc_id, x, y);
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X] = x;
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y] = y;
}
void move_world_npc_left(uint32_t world_npc_id) {
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_x = current_x - 1;
    if (current_x > 0 && are_coordinates_blocked(intended_x, current_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X] = intended_x;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_LEFT;
}
void move_world_npc_right(uint32_t world_npc_id) {
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_x = current_x + 1;
    if (intended_x < get_current_world_width() && are_coordinates_blocked(intended_x, current_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X] = intended_x;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_RIGHT;
}
void move_world_npc_up(uint32_t world_npc_id) {
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_y = current_y - 1;
    if (current_y > 0 && are_coordinates_blocked(current_x, intended_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y] = intended_y;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_UP;
}
void move_world_npc_down(uint32_t world_npc_id) {
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_y = current_y + 1;
    if (intended_y < get_current_world_height() && are_coordinates_blocked(current_x, intended_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y] = intended_y;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
}

// ------------------------------------------------------------------------------------------------
// INVENTORY
// ------------------------------------------------------------------------------------------------
uint32_t get_inventory_total_items(uint32_t inventory_id) {
    uint32_t offset = inventory_id * INVENTORY_DATA_SIZE;
    return g_inventory_data[offset + INVENTORY_TOTAL_ITEMS];
}
uint32_t get_inventory_item_inventory_id(uint32_t inventory_item_id) {
    uint32_t offset = inventory_item_id * INVENTORY_ITEM_DATA_SIZE;
    return g_inventory_item_data[offset + INVENTORY_ITEM_INVENTORY_ID];
}
uint32_t get_inventory_item_adjusted_price(uint32_t inventory_item_id) {
    uint32_t offset = inventory_item_id * INVENTORY_ITEM_DATA_SIZE;
    return g_inventory_item_data[offset + INVENTORY_ITEM_ADJUSTED_PRICE];
}
uint32_t get_inventory_item_string_id(uint32_t inventory_item_id) {
    uint32_t offset = inventory_item_id * INVENTORY_ITEM_DATA_SIZE;
    return g_inventory_item_data[offset + INVENTORY_ITEM_NAME_ID];
}
void increment_inventory_total_items(uint32_t inventory_id) {
    uint32_t offset = inventory_id * INVENTORY_DATA_SIZE;
    ++g_inventory_data[offset + INVENTORY_TOTAL_ITEMS];
}

// ------------------------------------------------------------------------------------------------ //
// PLAYERS
// ------------------------------------------------------------------------------------------------ //
uint32_t get_player_gold(uint32_t player_id) {
    uint32_t captain_id = players[player_id];
    return g_captain_data[captain_id * CAPTAIN_DATA_SIZE + CAPTAIN_GOLD];
}
void set_player_gold(uint32_t player_id, uint32_t value) {
    uint32_t captain_id = players[player_id];
    g_captain_data[captain_id * CAPTAIN_DATA_SIZE + CAPTAIN_GOLD] = value;
}
void subtract_player_gold(uint32_t player_id, uint32_t value) {
    uint32_t captain_id = players[player_id];
    g_captain_data[captain_id * CAPTAIN_DATA_SIZE + CAPTAIN_GOLD] -= value;
}
void add_player_gold(uint32_t player_id, uint32_t value) {
    uint32_t captain_id = players[player_id];
    g_captain_data[captain_id * CAPTAIN_DATA_SIZE + CAPTAIN_GOLD] -= value;
}
uint32_t get_player_npc_id(uint32_t player_id) {
    uint32_t captain_id = players[player_id];
    return g_captain_data[captain_id * CAPTAIN_DATA_SIZE + CAPTAIN_NPC_ID];
}
uint32_t get_player_inventory_id(uint32_t player_id) {
    uint32_t captain_id = players[player_id];
    return g_captain_data[captain_id * CAPTAIN_DATA_SIZE + CAPTAIN_INVENTORY_ID];
}
uint32_t get_player_total_items(uint32_t player_id) {
    uint32_t inventory_id = get_player_inventory_id(player_id);
    uint32_t offset = inventory_id * INVENTORY_DATA_SIZE;
    return g_inventory_data[offset + INVENTORY_TOTAL_ITEMS];
}
uint32_t get_player_inventory_item_by_id(uint32_t item_id)
{
    uint32_t inventory_id = get_player_inventory_id(0);
    for (uint32_t i = 0; i < MAX_INVENTORY_ITEMS; ++i)
    {
        uint32_t offset = i * INVENTORY_ITEM_DATA_SIZE;
        if (i == item_id)
        {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_player_inventory_item_string_id(uint32_t item_id)
{
    uint32_t offset = get_player_inventory_item_by_id(item_id);
    if (offset != SENTRY)
    {
        return g_inventory_item_data[offset + INVENTORY_ITEM_NAME_ID];
    }
    return SENTRY;
}
uint32_t get_player_in_world(uint32_t player_id) {
    uint32_t npc_id = get_player_npc_id(player_id);
    for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
        if (g_world_npc_data[i * WORLD_NPC_DATA_SIZE + WORLD_NPC_NPC_ID] == npc_id) {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_player_in_world_x(uint32_t player_id) {
    uint32_t world_npc_id = get_player_in_world(player_id);
    return g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
}
uint32_t get_player_in_world_y(uint32_t player_id) {
    uint32_t world_npc_id = get_player_in_world(player_id);
    return g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
}
void move_player_to(uint32_t player_id, uint32_t x, uint32_t y) {
    uint32_t world_npc_id = get_player_in_world(player_id);
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X] = x;
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y] = y;
}
void move_player_left(uint32_t player_id) {
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_x = current_x - 1;
    if (current_x > 0 && are_coordinates_blocked(intended_x, current_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X] = intended_x;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_LEFT;
}
void move_player_right(uint32_t player_id) {
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_x = current_x + 1;
    if (intended_x < get_current_world_width() && are_coordinates_blocked(intended_x, current_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X] = intended_x;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_RIGHT;
}
void move_player_up(uint32_t player_id) {
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_y = current_y - 1;
    if (current_y > 0 && are_coordinates_blocked(current_x, intended_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y] = intended_y;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_UP;
}
void move_player_down(uint32_t player_id) {
    uint32_t world_npc_id = get_player_in_world(player_id);
    uint32_t current_x = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_X];
    uint32_t current_y = g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y];
    uint32_t intended_y = current_y + 1;
    if (intended_y < get_current_world_height() && are_coordinates_blocked(current_x, intended_y) != 1) {
        g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_POSITION_Y] = intended_y;
    }
    g_world_npc_data[world_npc_id * WORLD_NPC_DATA_SIZE + WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
}

// ------------------------------------------------------------------------------------------------ //
// BASE SHIPS
// ------------------------------------------------------------------------------------------------ //
uint32_t get_base_ship_id_by_machine_name(char* machine_name) {
    uint32_t string_id = get_string_id_by_machine_name(machine_name);
    for (uint32_t i = 0; i < MAX_BASE_SHIPS; ++i) {
        if (g_base_ship_data[i * BASE_SHIP_DATA_SIZE + BASE_SHIP_NAME_ID] == string_id) {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_base_ship_tacking(uint32_t base_ship_id) {
    uint32_t offset = base_ship_id * BASE_SHIP_DATA_SIZE;
    return g_base_ship_data[offset + BASE_SHIP_BASE_TACKING];
}
uint32_t get_base_ship_power(uint32_t base_ship_id) {
    uint32_t offset = base_ship_id * BASE_SHIP_DATA_SIZE;
    return g_base_ship_data[offset + BASE_SHIP_BASE_POWER];
}
uint32_t get_base_ship_speed(uint32_t base_ship_id) {
    uint32_t offset = base_ship_id * BASE_SHIP_DATA_SIZE;
    return g_base_ship_data[offset + BASE_SHIP_BASE_SPEED];
}
uint32_t get_base_ship_max_capacity(uint32_t base_ship_id) {
    uint32_t offset = base_ship_id * BASE_SHIP_DATA_SIZE;
    return g_base_ship_data[offset + BASE_SHIP_MAX_CAPACITY];
}
uint32_t get_base_ship_base_price(uint32_t base_ship_id) {
    uint32_t offset = base_ship_id * BASE_SHIP_DATA_SIZE;
    return g_base_ship_data[offset + BASE_SHIP_BASE_PRICE];
}
uint32_t get_base_ship_top_material_id(uint32_t base_ship_id) {
    uint32_t offset = base_ship_id * BASE_SHIP_DATA_SIZE;
    return g_base_ship_data[offset + BASE_SHIP_TOP_MATERIAL_ID];
}

// ------------------------------------------------------------------------------------------------ //
// SHIPS
// ------------------------------------------------------------------------------------------------ //
uint32_t get_ship_id_by_machine_name(char* machine_name) {
    uint32_t string_id = get_string_id_by_machine_name(machine_name);
    for (uint32_t i = 0; i < MAX_SHIPS; ++i) {
        if (g_ship_data[i * SHIP_DATA_SIZE + SHIP_NAME_ID] == string_id) {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_ship_base_ship_id(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_BASE_SHIP_ID];
}
uint32_t get_ship_tacking(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_TACKING];
}
uint32_t get_ship_power(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_POWER];
}
uint32_t get_ship_speed(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_SPEED];
}
uint32_t get_ship_capacity(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_CAPACITY];
}
uint32_t get_ship_max_crew(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_MAX_CREW];
}
uint32_t get_ship_max_hull(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_MAX_HULL];
}
uint32_t get_ship_crew(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_CREW];
}
uint32_t get_ship_hull(uint32_t ship_id) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    return g_ship_data[offset + SHIP_HULL];
}
void reduce_ship_hull(uint32_t ship_id, uint32_t damage) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    // Check if damage would cause underflow
    if (damage > g_ship_data[offset + SHIP_HULL]) {
        g_ship_data[offset + SHIP_HULL] = 0;
    } else {
        g_ship_data[offset + SHIP_HULL] -= damage;
    }
}
void reduce_ship_crew(uint32_t ship_id, uint32_t damage) {
    uint32_t offset = ship_id * SHIP_DATA_SIZE;
    // Check if damage would cause underflow
    if (damage > g_ship_data[offset + SHIP_CREW]) {
        g_ship_data[offset + SHIP_CREW] = 0;
    } else {
        g_ship_data[offset + SHIP_CREW] -= damage;
    }
}

// ------------------------------------------------------------------------------------------------ //
// FLEETS
// ------------------------------------------------------------------------------------------------ //
void add_ship_to_fleet(uint32_t fleet_id, uint32_t ship_id) {
    uint32_t offset = fleet_id * FLEET_DATA_SIZE;
    g_fleet_data[offset + FLEET_TOTAL_SHIPS] += 1;
    // TODO: Only need this if the captain of a ship is NOT the same as the fleets general (also a captain)
    // g_fleet_data[offset + FLEET_TOTAL_CAPTAINS] += 1;
    uint32_t fleet_ship_data[FLEET_SHIP_DATA_SIZE];
    CLEAR_DATA(fleet_ship_data, FLEET_SHIP_DATA_SIZE);
    fleet_ship_data[FLEET_SHIP_FLEET_ID] = fleet_id;
    fleet_ship_data[FLEET_SHIP_SHIP_ID] = ship_id;
    create_fleet_ship(fleet_ship_data, true);
}
uint32_t get_fleet_ship_fleet_id(uint32_t fleet_ship_id) {
    uint32_t offset = fleet_ship_id * FLEET_SHIP_DATA_SIZE;
    return g_fleet_ship_data[offset + FLEET_SHIP_FLEET_ID];
}
uint32_t get_fleet_ship_ship_id(uint32_t fleet_ship_id) {
    uint32_t offset = fleet_ship_id * FLEET_SHIP_DATA_SIZE;
    return g_fleet_ship_data[offset + FLEET_SHIP_SHIP_ID];
}
uint32_t get_fleet_total_ships(uint32_t fleet_id) {
    uint32_t offset = fleet_id * FLEET_DATA_SIZE;
    return g_fleet_data[offset + FLEET_TOTAL_SHIPS];
}
uint32_t get_ship_id_by_fleet_ship_id(uint32_t ship_id) {
    for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i) {
        uint32_t offset = i * FLEET_SHIP_DATA_SIZE;
        if (g_fleet_ship_data[offset + FLEET_SHIP_SHIP_ID] == ship_id) {
            return i;
        }
    }
    return SENTRY;
}
uint32_t get_fleet_id_by_general_id(uint32_t general_id) {
    for (uint32_t i = 0; i < MAX_FLEETS; ++i) {
        uint32_t offset = i * FLEET_DATA_SIZE;
        if (g_fleet_data[offset + FLEET_GENERAL_ID] == general_id) {
            return i;
        }
    }
    return SENTRY;
}

// ------------------------------------------------------------------------------------------------ //
// GENERAL GAME FUNCTIONS
// ------------------------------------------------------------------------------------------------ //
uint32_t get_current_game_mode() {
    switch (current_game_mode) {
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

void increment_tick_counter(uint32_t* tick) {
    if (*tick == UINT32_MAX) {
        // Reset to 1 instead of 0 to avoid using 0 as a seed
        *tick = 1;
    } else {
        *tick += 1;
    }
}
void tick() {
    increment_tick_counter(&tick_counter);
    if (!has_game_started) {
        has_game_started = true;
        accepting_input = true;
        generate_world("athens");
    } else if (current_game_mode == GAME_MODE_IN_PORT) {
        // TODO: Anything here?
    } else if (current_game_mode == GAME_MODE_IN_SCENE) {
        // TODO: Anything here?
    }
    // TODO: fsm_tick();
}

void initialize_game() {
    tick_counter = 1;
    current_game_mode = (uint32_t)GAME_MODE_EMPTY;
    clear_current_scene();

    init_string_data();
    init_string_info();
    init_data_npc();
    init_data_general_item();
    init_data_base_ship();
    init_data_ship();
    init_data_ship_material();
    init_data_weapon();
    init_data_armor();
    init_data_special_item();
    init_data_figurehead();
    init_data_cannon();
    init_data_world();
    init_data_layer();
    init_data_inventory();
    init_data_inventory_item();
    init_data_port();
    init_data_stats();
    init_data_skill();
    init_data_entity();
    init_data_fleet();
    init_data_fleet_ship();
    init_data_fleet_captain();
    init_data_world_npc();
    init_data_bank();
    init_data_captain();

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

    uint32_t world_data[WORLD_DATA_SIZE];
    CLEAR_DATA(world_data, WORLD_DATA_SIZE);
    world_data[WORLD_NAME_ID] = get_string_id_by_machine_name("athens");
    world_data[WORLD_WIDTH] = 50;
    world_data[WORLD_HEIGHT] = 50;
    world_data[WORLD_TOTAL_NPCS] = 0;
    world_data[WORLD_TOTAL_CAPTAINS] = 5;
    world_data[WORLD_TOTAL_LAYERS] = 1;
    create_world(world_data, true);

    uint32_t npc_data[NPC_DATA_SIZE];
    CLEAR_DATA(npc_data, NPC_DATA_SIZE);
    uint32_t empty_npc_id;
    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("empty");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    empty_npc_id = create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("general_shop_owner");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("bank_teller");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("blackjack_player");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("npc_ocean_battle");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("ship");
    npc_data[NPC_TYPE] = NPC_TYPE_SHIP;
    uint32_t empty_ship_id = create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("npc_rvice");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    uint32_t npc_rvice_id = create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("npc_lafolie");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    uint32_t npc_lafolie_id = create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("npc_nakor");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    uint32_t npc_nakor_id = create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("npc_travis");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    uint32_t npc_travis_id = create_npc(npc_data, true);

    npc_data[NPC_NAME_ID] = get_string_id_by_machine_name("npc_loller");
    npc_data[NPC_TYPE] = NPC_TYPE_HUMAN;
    uint32_t npc_loller_id = create_npc(npc_data, true);

    uint32_t inventory_data[INVENTORY_DATA_SIZE];
    CLEAR_DATA(inventory_data, INVENTORY_DATA_SIZE);
    inventory_data[INVENTORY_NAME_ID] = get_string_id_by_machine_name("player_ones_inventory");
    inventory_data[INVENTORY_TOTAL_ITEMS] = 0;
    uint32_t inventory_id = create_inventory(inventory_data, true);

    uint32_t captain_data[CAPTAIN_DATA_SIZE];
    CLEAR_DATA(captain_data, CAPTAIN_DATA_SIZE);
    captain_data[CAPTAIN_NPC_ID] = empty_npc_id;
    captain_data[CAPTAIN_PLAYER_ID] = 0;
    captain_data[CAPTAIN_GOLD] = 99;
    captain_data[CAPTAIN_INVENTORY_ID] = inventory_id;
    uint32_t captain_id = create_captain(captain_data, true);
    players[0] = captain_id;

    CLEAR_DATA(inventory_data, INVENTORY_DATA_SIZE);
    inventory_data[INVENTORY_NAME_ID] = get_string_id_by_machine_name("npc_rvice");
    inventory_data[INVENTORY_TOTAL_ITEMS] = 0;
    inventory_id = create_inventory(inventory_data, true);
    CLEAR_DATA(captain_data, CAPTAIN_DATA_SIZE);
    captain_data[CAPTAIN_NPC_ID] = npc_rvice_id;
    captain_data[CAPTAIN_PLAYER_ID] = 0;
    captain_data[CAPTAIN_GOLD] = 100;
    captain_data[CAPTAIN_INVENTORY_ID] = inventory_id;
    create_captain(captain_data, true);
    CLEAR_DATA(inventory_data, INVENTORY_DATA_SIZE);
    inventory_data[INVENTORY_NAME_ID] = get_string_id_by_machine_name("npc_lafolie");
    inventory_data[INVENTORY_TOTAL_ITEMS] = 0;
    inventory_id = create_inventory(inventory_data, true);
    CLEAR_DATA(captain_data, CAPTAIN_DATA_SIZE);
    captain_data[CAPTAIN_NPC_ID] = npc_lafolie_id;
    captain_data[CAPTAIN_PLAYER_ID] = 0;
    captain_data[CAPTAIN_GOLD] = 100;
    captain_data[CAPTAIN_INVENTORY_ID] = inventory_id;
    create_captain(captain_data, true);
    CLEAR_DATA(inventory_data, INVENTORY_DATA_SIZE);
    inventory_data[INVENTORY_NAME_ID] = get_string_id_by_machine_name("npc_nakor");
    inventory_data[INVENTORY_TOTAL_ITEMS] = 0;
    inventory_id = create_inventory(inventory_data, true);
    CLEAR_DATA(captain_data, CAPTAIN_DATA_SIZE);
    captain_data[CAPTAIN_NPC_ID] = npc_nakor_id;
    captain_data[CAPTAIN_PLAYER_ID] = 0;
    captain_data[CAPTAIN_GOLD] = 100;
    captain_data[CAPTAIN_INVENTORY_ID] = inventory_id;
    create_captain(captain_data, true);
    CLEAR_DATA(inventory_data, INVENTORY_DATA_SIZE);
    inventory_data[INVENTORY_NAME_ID] = get_string_id_by_machine_name("npc_travis");
    inventory_data[INVENTORY_TOTAL_ITEMS] = 0;
    inventory_id = create_inventory(inventory_data, true);
    CLEAR_DATA(captain_data, CAPTAIN_DATA_SIZE);
    captain_data[CAPTAIN_NPC_ID] = npc_travis_id;
    captain_data[CAPTAIN_PLAYER_ID] = 0;
    captain_data[CAPTAIN_GOLD] = 100;
    captain_data[CAPTAIN_INVENTORY_ID] = inventory_id;
    create_captain(captain_data, true);

    uint32_t general_item_data[GENERAL_ITEM_DATA_SIZE];
    CLEAR_DATA(general_item_data, GENERAL_ITEM_DATA_SIZE);
    general_item_data[GENERAL_ITEM_NAME_ID] = get_string_id_by_machine_name("telescope");
    general_item_data[GENERAL_ITEM_BASE_PRICE] = 200;
    create_general_item(general_item_data, true);
    general_item_data[GENERAL_ITEM_NAME_ID] = get_string_id_by_machine_name("quadrant");
    general_item_data[GENERAL_ITEM_BASE_PRICE] = 200;
    create_general_item(general_item_data, true);
    general_item_data[GENERAL_ITEM_NAME_ID] = get_string_id_by_machine_name("theodolite");
    general_item_data[GENERAL_ITEM_BASE_PRICE] = 200;
    create_general_item(general_item_data, true);
    general_item_data[GENERAL_ITEM_NAME_ID] = get_string_id_by_machine_name("sextant");
    general_item_data[GENERAL_ITEM_BASE_PRICE] = 200;
    create_general_item(general_item_data, true);

    uint32_t base_ship_data[BASE_SHIP_DATA_SIZE];
    CLEAR_DATA(base_ship_data, BASE_SHIP_DATA_SIZE);
    base_ship_data[BASE_SHIP_NAME_ID] = get_string_id_by_machine_name("balsa");
    base_ship_data[BASE_SHIP_TOP_MATERIAL_ID] = 0;
    base_ship_data[BASE_SHIP_BASE_PRICE] = 100;
    base_ship_data[BASE_SHIP_MAX_CAPACITY] = 100;
    base_ship_data[BASE_SHIP_BASE_TACKING] = 100;
    base_ship_data[BASE_SHIP_BASE_POWER] = 100;
    base_ship_data[BASE_SHIP_BASE_SPEED] = 100;
    create_base_ship(base_ship_data, true);

    // TODO: Import from wells fargo
    g_bank_data[BANK_DEPOSIT_INTEREST_RATE] = 33;
    g_bank_data[BANK_LOAN_INTEREST_RATE] = 69;
    g_bank_data[BANK_FDIC_INSURED] = false;
    g_bank_data[BANK_MAX_DEPOSIT_AMOUNT] = 100000;
    g_bank_data[BANK_MAX_LOAN_AMOUNT] = 10000;

    test();
}

void test() {
    set_player_gold(0, 1000);
    console_log("Debug ran");

    uint32_t base_ship_id = get_base_ship_id_by_machine_name("balsa");

    uint32_t fleet_data[FLEET_DATA_SIZE];
    CLEAR_DATA(fleet_data, FLEET_DATA_SIZE);
    fleet_data[FLEET_TOTAL_SHIPS] = 0;
    fleet_data[FLEET_TOTAL_CAPTAINS] = 1;
    // TODO: This should be the player captain id. Right now, that happens to be manually set to 0 so we'll just use that for now
    fleet_data[FLEET_GENERAL_ID] = players[0];
    uint32_t fleet_id = create_fleet(fleet_data, true);

    uint32_t ship_data[SHIP_DATA_SIZE];
    CLEAR_DATA(ship_data, SHIP_DATA_SIZE);
    uint32_t ship_id;
    uint32_t second_ship_id;
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, ship_id);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    second_ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, second_ship_id);

    uint32_t npc_id;
    fleet_data[FLEET_TOTAL_SHIPS] = 0;
    fleet_data[FLEET_TOTAL_CAPTAINS] = 1;
    npc_id = get_npc_id_by_machine_name("npc_rvice");
    fleet_data[FLEET_GENERAL_ID] = npc_id;
    fleet_id = create_fleet(fleet_data, true);
    // TODO: Why can you not just reference the same ship IDs as above and get the same ship data? Why do we have to restate the data?
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("rvices_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, ship_id);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("rvices_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    second_ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, second_ship_id);

    fleet_data[FLEET_TOTAL_SHIPS] = 0;
    fleet_data[FLEET_TOTAL_CAPTAINS] = 1;
    npc_id = get_npc_id_by_machine_name("npc_rvice");
    fleet_data[FLEET_GENERAL_ID] = npc_id;
    fleet_id = create_fleet(fleet_data, true);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, ship_id);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    second_ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, second_ship_id);

    fleet_data[FLEET_TOTAL_SHIPS] = 0;
    fleet_data[FLEET_TOTAL_CAPTAINS] = 1;
    npc_id = get_npc_id_by_machine_name("npc_rvice");
    fleet_data[FLEET_GENERAL_ID] = npc_id;
    fleet_id = create_fleet(fleet_data, true);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, ship_id);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    second_ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, second_ship_id);

    fleet_data[FLEET_TOTAL_SHIPS] = 0;
    fleet_data[FLEET_TOTAL_CAPTAINS] = 1;
    npc_id = get_npc_id_by_machine_name("npc_rvice");
    fleet_data[FLEET_GENERAL_ID] = npc_id;
    fleet_id = create_fleet(fleet_data, true);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, ship_id);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    second_ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, second_ship_id);

    fleet_data[FLEET_TOTAL_SHIPS] = 0;
    fleet_data[FLEET_TOTAL_CAPTAINS] = 1;
    npc_id = get_npc_id_by_machine_name("npc_rvice");
    fleet_data[FLEET_GENERAL_ID] = npc_id;
    fleet_id = create_fleet(fleet_data, true);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, ship_id);
    ship_data[SHIP_NAME_ID] = get_string_id_by_machine_name("player_ship");
    ship_data[SHIP_BASE_SHIP_ID] = base_ship_id;
    ship_data[SHIP_PRICE] = 100;
    ship_data[SHIP_MATERIAL_ID] = 0;
    ship_data[SHIP_CAPACITY] = 100;
    ship_data[SHIP_TACKING] = 100;
    ship_data[SHIP_POWER] = 100;
    ship_data[SHIP_SPEED] = 100;
    ship_data[SHIP_CREW] = 100;
    ship_data[SHIP_HULL] = 99;
    second_ship_id = create_ship(ship_data, true);
    add_ship_to_fleet(fleet_id, second_ship_id);
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
uint32_t blackjack_get_player_deck_card(uint32_t index) {
    return blackjack_player_deck[index];
}
uint32_t blackjack_get_dealer_deck_card(uint32_t index) {
    return blackjack_dealer_deck[index];
}
uint32_t blackjack_get_card_value(uint32_t card_id) {
    uint32_t card = card_id % 13;
    if (card == 0) {
        return 11;
    }
    if (card > 10) {
        return 10;
    }
    return card;
}
uint32_t blackjack_get_dealers_deck_value() {
    uint32_t total = 0;
    for (uint32_t i = 0; i < 10; ++i) {
        if (blackjack_dealer_deck[i] != SENTRY) {
            total += blackjack_get_card_value(blackjack_dealer_deck[i]);
        }
    }
    return total;
}
uint32_t blackjack_get_players_deck_value() {
    uint32_t total = 0;
    for (uint32_t i = 0; i < 10; ++i) {
        if (blackjack_player_deck[i] != SENTRY) {
            total += blackjack_get_card_value(blackjack_player_deck[i]);
        }
    }
    return total;
}
void blackjack_randomize_deck() {
    uint32_t deck_index = 0;
    for (uint32_t i = 0; i < 52; ++i) {
        // Skip JACK cards
        if (i % 13 != 10) {
            blackjack_deck[deck_index] = i;
            deck_index += 1;
        }
    }
    for (uint32_t i = 47; i > 0; --i) {
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
    for (uint32_t i = 0; i < 10; ++i) {
        blackjack_player_deck[i] = SENTRY;
        blackjack_dealer_deck[i] = SENTRY;
    }
}
void blackjack_add_card_to_players_deck() {
    blackjack_player_deck[blackjack_player_deck_iterator] = blackjack_deck[blackjack_deck_index];
    blackjack_deck_index += 1;
    blackjack_player_deck_iterator += 1;
}
void blackjack_add_card_to_dealer_deck() {
    blackjack_dealer_deck[blackjack_dealer_deck_iterator] = blackjack_deck[blackjack_deck_index];
    blackjack_deck_index += 1;
    blackjack_dealer_deck_iterator += 1;
}
void blackjack_start_game() {
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
void blackjack_dealer_turn() {
    uint32_t dealer_total = blackjack_get_dealers_deck_value();
    console_log_format("dealer total %d", dealer_total);
    if (dealer_total >= 17) {
        blackjack_dealer_standing = true;
    }
}
uint32_t blackjack_check_winner() {
    uint32_t player_total = blackjack_get_players_deck_value();
    uint32_t dealer_total = blackjack_get_dealers_deck_value();
    // return 1 = player won
    // return 2 = dealer won
    // return 3 = nobody won

    // If either player is over 21, other player wins
    if (dealer_total > 21) {
        console_log("Dealer over 21");
        return 1;
    }
    if (player_total > 21) {
        console_log("Player over 21");
        return 2;
    }
    // If neither player is standing, just skip
    if (blackjack_player_standing != true && blackjack_dealer_standing != true) {
        console_log("Nobody is standing");
        return 3;
    }
    // If both players are standing, whoever is closest to 21
    if (blackjack_player_standing == true && blackjack_dealer_standing == true) {
        console_log("Both are standing");
        // Double check for either one being over
        if (dealer_total > 21) {
            console_log("Dealer over 21 [b]");
            return 1;
        } else if (player_total > 21) {
            console_log("Player over 21 [b]");
            return 2;
        } else if (dealer_total > player_total) {
            console_log("dealer more than player");
            return 2;
        } else if (player_total > dealer_total) {
            console_log("player more than dealer");
            return 1;
        } else if (dealer_total == player_total) {
            console_log("Samesies");
            // Samesies = house wins
            return 2;
        } else if (dealer_total == 21) {
            console_log("dealer 21");
            return 2;
        } else if (player_total == 21) {
            console_log("player 21");
            return 1;
        } else {
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
uint32_t scene_blackjack(uint32_t action) {
    // TODO: Consider putting all strings in a scene array so you
    // don't have to thrash the entire string pool to find the
    // strings you want every time
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT) {
        clear_current_scene();
        set_current_scene(SCENE_BLACKJACK);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_blackjack"));
        set_current_scene_state(SCENE_BLACKJACK_STATE_HELLO);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_blackjack(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state()) {
        // Note: Curly brackets here is REQUIRED to scope the "choices" variable otherwise it doesn't work
        case SCENE_BLACKJACK_STATE_HELLO: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("welcome_to_blackjack");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK) {
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
        case SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT: {
            // Note: Keeping the same choices as "hello" for now
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_ask_for_bet_amount");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    set_current_scene_needs_numerical_input(true);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        // TODO: Can you NOT duplicate break calls?
                        if (current_user_input_number == SENTRY) {
                            console_log("No user input number!");
                            break;
                        } else if (current_user_input_number < blackjack_bet_minimum) {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_MINIMUM);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        } else if (current_user_input_number > blackjack_bet_maximum) {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_BET_AMOUNT_OVER_MAXIMUM);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        } else if (current_user_input_number > get_player_gold(0)) {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_ENOUGH_GOLD);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        } else {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_CONFIRM_BET_AMOUNT);
                            scene_blackjack(SCENE_ACTION_INIT);
                            should_redraw_everything();
                            break;
                        }
                    }
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK) {
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
        case SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_MINIMUM: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_not_minimum_bet");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK) {
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
        case SCENE_BLACKJACK_STATE_BET_AMOUNT_OVER_MAXIMUM: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_bet_too_much");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK) {
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
        case SCENE_BLACKJACK_STATE_BET_AMOUNT_NOT_ENOUGH_GOLD: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_not_enough_gold");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK) {
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
        case SCENE_BLACKJACK_STATE_CONFIRM_BET_AMOUNT: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    // TODO: Formatted string with
                    // current_user_input_number as %d
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_confirm_bet");
                    set_current_scene_needs_numerical_input(false);
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_DEAL_CARDS);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_BACK) {
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
        case SCENE_BLACKJACK_STATE_DEAL_CARDS: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_HIT_OR_STAND);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_PLAYER_HIT_OR_STAND: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_HIT),
                get_string_id_by_machine_name("blackjack_hit")
            );
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_BLACKJACK_CHOICE_STAND),
                get_string_id_by_machine_name("blackjack_stay")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_player_turn");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_HIT) {
                        blackjack_add_card_to_players_deck();
                        set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_DEAL_CARD);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    } else if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_STAND) {
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
        case SCENE_BLACKJACK_STATE_PLAYER_DEAL_CARD: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_deal_player_card");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    blackjack_dealer_turn();
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_dealer_turn");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        // if (blackjack_dealer_standing == true) {
                        //     // TODO: Another dialogue
                        //     console_log("{B}Dealer Standing");
                        // } else {
                        //     // TODO: Another dialogue
                        //     blackjack_add_card_to_dealer_deck();
                        //     console_log("{B}Dealer hitting");
                        // }
                        if (blackjack_dealer_standing == true) {
                            set_current_scene_state(SCENE_BLACKJACK_STATE_CHECK_WINNER);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        } else {
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
        case SCENE_BLACKJACK_STATE_DEALER_DEAL_CARD: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    blackjack_add_card_to_dealer_deck();
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_deal_dealer_card");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_BLACKJACK_STATE_CHECK_WINNER);
                        scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_CHECK_WINNER: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_check_winner");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
                        uint32_t winner = blackjack_check_winner();
                        if (winner == 1) {
                            // If player won, show player won state
                            set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_WON);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        } else if (winner == 2) {
                            // If dealer won, show dealer won state
                            set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_WON);
                            scene_blackjack(SCENE_ACTION_INIT);
                            break;
                        } else if (winner == 3) {
                            // If nobody won, confirm at least player OR dealer is not standing
                            if (blackjack_player_standing != true) {
                                set_current_scene_state(SCENE_BLACKJACK_STATE_PLAYER_HIT_OR_STAND);
                                scene_blackjack(SCENE_ACTION_INIT);
                                break;
                            } else if (blackjack_dealer_standing != true) {
                                set_current_scene_state(SCENE_BLACKJACK_STATE_DEALER_HIT_OR_STAND);
                                scene_blackjack(SCENE_ACTION_INIT);
                                break;
                            }
                        } else {
                            console_log("Hopefully we never get here");
                        }
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_BLACKJACK_STATE_PLAYER_WON: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_player_won");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
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
        case SCENE_BLACKJACK_STATE_DEALER_WON: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("blackjack_dealer_won");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_BLACKJACK_CHOICE_CONFIRM) {
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
uint32_t scene_general_shop(uint32_t action) {
    // TODO: When the scene exits, we need to clear g_inventory_item_data where INVENTORY_ID == scenes inventory id
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT) {
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
    switch (get_current_scene_state()) {
        case SCENE_GENERAL_SHOP_STATE_WELCOME: {
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
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("welcome_to_general_shop");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }   
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BUY) {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_SELL) {
                        // TODO: This
                        // set_current_scene_state(SCENE_BLACKJACK_STATE_ASK_FOR_BET_AMOUNT);
                        // scene_blackjack(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK) {
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
        case SCENE_GENERAL_SHOP_STATE_BUYING: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BUY),
                get_string_id_by_machine_name("buy")
            );
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("general_shop_buy");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BUY) {
                        uint32_t item_id = input_array_buffer[0];
                        uint32_t qty = input_array_buffer[1];
                        uint32_t player_gold = get_player_gold(0);
                        uint32_t real_item_id = CurrentSceneInventoryItems[item_id];
                        uint32_t real_item_offset = real_item_id * INVENTORY_ITEM_DATA_SIZE;
                        uint32_t base_price = g_inventory_item_data[real_item_offset + INVENTORY_ITEM_ADJUSTED_PRICE];
                        uint32_t total_price = base_price * qty;
                        if (player_gold >= total_price) {
                            set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING_CONFIRM);
                            scene_general_shop(SCENE_ACTION_INIT);
                            break;
                        } else {
                            set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING_NOT_ENOUGH_GOLD);
                            scene_general_shop(SCENE_ACTION_INIT);
                            break;
                        }
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK) {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_WELCOME);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_GENERAL_SHOP_STATE_BUYING_CONFIRM: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("confirm_buy");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING_COMPLETE);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK) {   
                        set_current_scene(SCENE_GENERAL_SHOP_STATE_BUYING);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_GENERAL_SHOP_STATE_BUYING_NOT_ENOUGH_GOLD: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("not_enough_gold");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK) {
                        set_current_scene_state(SCENE_GENERAL_SHOP_STATE_BUYING);
                        scene_general_shop(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_GENERAL_SHOP_STATE_BUYING_COMPLETE: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_GENERAL_SHOP_CHOICE_BACK),
                get_string_id_by_machine_name("exit")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t item_id = input_array_buffer[0];
                    uint32_t qty = input_array_buffer[1];
                    uint32_t player_gold = get_player_gold(0);
                    uint32_t real_item_id = CurrentSceneInventoryItems[item_id];
                    uint32_t real_item_offset = real_item_id * INVENTORY_ITEM_DATA_SIZE;
                    uint32_t base_price = g_inventory_item_data[real_item_offset + INVENTORY_ITEM_ADJUSTED_PRICE];
                    uint32_t total_price = base_price * qty;
                    subtract_player_gold(0, total_price);
                    uint32_t inventory_id = get_player_inventory_id(0);
                    uint32_t inventory_item_data[INVENTORY_ITEM_DATA_SIZE];
                    CLEAR_DATA(inventory_item_data, INVENTORY_ITEM_DATA_SIZE);
                    inventory_item_data[INVENTORY_ITEM_NUMBER_HELD] = qty;
                    inventory_item_data[INVENTORY_ITEM_INVENTORY_ID] = inventory_id;
                    create_inventory_item(inventory_item_data, true);
                    increment_inventory_total_items(inventory_id);

                    uint32_t string_id = get_string_id_by_machine_name("buy_complete");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_GENERAL_SHOP_CHOICE_BACK) {
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
void clear_ocean_battle_data(uint32_t data[OCEAN_BATTLE_DATA_SIZE]) {
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_SIZE; ++i) {
        data[i] = SENTRY;
    }
}
void clear_ocean_battle_fleets() {
    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i) {
        ocean_battle_fleets[i] = SENTRY;
    }
}
void add_fleet_to_battle(uint32_t fleet_id) {
    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i) {
        if (ocean_battle_fleets[i] == SENTRY) {
            ocean_battle_fleets[i] = fleet_id;
        }
    }
}
uint32_t ocean_battle_total_targets_within_cannon_range() {
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
    uint32_t total = SENTRY;
    // TODO: Properly get cannon range
    uint32_t cannon_range = 8;
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i) {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id) {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id) {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0) {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range)) {
                ++total;
            }
        }
    }
    return total;
}
uint32_t ocean_battle_total_targets_within_boarding_range() {
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
    uint32_t total = 0;
    // TODO: Properly get cannon range
    uint32_t boarding_range = 2;
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i) {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id) {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id) {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0) {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            console_log("ocean battle targets within boarding range");
            console_log_format("target_npc_id:%d %d %d", target_npc_id, a_x, a_y);
            console_log_format("world_npc_id:%d %d %d", world_npc_id, b_x, b_y);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, boarding_range)) {
                ++total;
            }
        }
    }
    return total;
}
uint32_t get_current_ocean_battle_turn_npc_id() {
    return ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
}
uint32_t get_current_ocean_battle_turn_npc_x() {
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_x(world_npc_id);
}
uint32_t get_current_ocean_battle_turn_npc_y() {
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_y(world_npc_id);
}
uint32_t ocean_battle_find_world_npc_id_by_coordinates(uint32_t x, uint32_t y) {
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i) {
        if (ocean_battle_turn_order[i] != SENTRY) {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            if (a_x == x && a_y == y) {
                return target_npc_id;
            }
        }
    }
    return SENTRY;
}
#define MAX_VALID_MOVEMENT_COORDINATES 100
uint32_t ocean_battle_valid_movement_coordinates[MAX_VALID_MOVEMENT_COORDINATES];
uint32_t ocean_battle_total_valid_movement_coordinates = 0;
uint32_t ocean_battle_get_total_valid_movement_coordinates() {
    return ocean_battle_total_valid_movement_coordinates;
}
uint32_t ocean_battle_get_valid_movement_coordinate_x(uint32_t index) {
    uint32_t offset = index * 2;
    return ocean_battle_valid_movement_coordinates[offset];
}
uint32_t ocean_battle_get_valid_movement_coordinate_y(uint32_t index) {
    uint32_t offset = index * 2;
    return ocean_battle_valid_movement_coordinates[offset + 1];
}
void ocean_battle_build_valid_move_coordinates() {
    uint32_t x = get_current_ocean_battle_turn_npc_x();
    uint32_t y = get_current_ocean_battle_turn_npc_y();
    console_log_format("current turn npc y %d", y);
    // TODO: Why does 5 lead to the right range (of 2)?
    uint32_t movement_range = 5;
    uint32_t x_diff = 0;
    uint32_t y_diff = 0;
    if (x -= movement_range < 0) {
        if (x > movement_range) {
            x_diff = x - movement_range;
        } else {
            x_diff = movement_range - x;
        }
        x = 0;
    } else {
        x -= movement_range;
    }
    if (y -= movement_range < 0) {
        if (y > movement_range) {
            y_diff = y - movement_range;
        } else {
            y_diff = movement_range - y;
        }
        y = 0;
    } else {
        y -= movement_range;
    }
    for (uint32_t i = 0; i < MAX_VALID_MOVEMENT_COORDINATES; ++i) {
        ocean_battle_valid_movement_coordinates[i] = SENTRY;
    }
    ocean_battle_total_valid_movement_coordinates = 0;
    uint32_t iterator = 0;
    uint32_t full_range = movement_range * 2;
    while (x < (full_range + x_diff)) {
        for (uint32_t inner_y = y; inner_y < ((movement_range * 2) + y_diff); ++inner_y) {
            if (ocean_battle_is_world_coordinate_in_ship_movement_range(x, inner_y)) {
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
void ocean_battle_set_intended_boarding_coordinates(uint32_t x, uint32_t y) {
    ocean_battle_intended_boarding_coordinates[0] = x;
    ocean_battle_intended_boarding_coordinates[1] = y;
}
uint32_t get_total_valid_boarding_coordinates() {
    return ocean_battle_total_valid_boarding_coordinates;
}
void ocean_battle_build_valid_boarding_coordinates() {
    for (uint32_t i = 0; i < MAX_VALID_BOARDING_COORDINATES; ++i) {
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
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i) {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id) {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id) {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0) {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, boarding_range)) {
                ocean_battle_valid_boarding_coordinates[total] = a_x;
                ++total;
                ocean_battle_valid_boarding_coordinates[total] = a_y;
                ++total;
                ++ocean_battle_total_valid_boarding_coordinates;
            }
        }
    }
}
uint32_t ocean_battle_get_valid_boarding_coordinates_x(uint32_t which) {
    uint32_t offset = which * 2;
    return ocean_battle_valid_boarding_coordinates[offset];
}
uint32_t ocean_battle_get_valid_boarding_coordinates_y(uint32_t which) {
    uint32_t offset = which * 2;
    return ocean_battle_valid_boarding_coordinates[offset + 1];
}
uint32_t ocean_battle_is_valid_boarding_coordinates(uint32_t x, uint32_t y) {
    for (uint32_t i = 0; i < MAX_VALID_BOARDING_COORDINATES; i += 2) {
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
void ocean_battle_set_intended_cannon_coordinates(uint32_t x, uint32_t y) {
    ocean_battle_intended_cannon_coordinates[0] = x;
    ocean_battle_intended_cannon_coordinates[1] = y;
}
uint32_t get_total_valid_cannon_coordinates() {
    return ocean_battle_total_valid_cannon_coordinates;
}
void ocean_battle_build_valid_cannon_coordinates() {
    for (uint32_t i = 0; i < MAX_VALID_CANNON_COORDINATES; ++i) {
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
    for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i) {
        if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id) {
            uint32_t target_npc_id = ocean_battle_turn_order[i];
            uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
            uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
            uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
            if (target_fleet_id == attacker_fleet_id) {
                continue;
            }
            if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0) {
                continue;
            }
            uint32_t a_x = get_world_npc_x(target_npc_id);
            uint32_t a_y = get_world_npc_y(target_npc_id);
            uint32_t b_x = get_world_npc_x(world_npc_id);
            uint32_t b_y = get_world_npc_y(world_npc_id);
            if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range)) {
                ocean_battle_valid_cannon_coordinates[total] = a_x;
                ++total;
                ocean_battle_valid_cannon_coordinates[total] = a_y;
                ++total;
                ++ocean_battle_total_valid_cannon_coordinates;
            }
        }
    }
}
uint32_t ocean_battle_get_valid_cannon_coordinates_x(uint32_t which) {
    uint32_t offset = which * 2;
    return ocean_battle_valid_cannon_coordinates[offset];
}
uint32_t ocean_battle_get_valid_cannon_coordinates_y(uint32_t which) {
    uint32_t offset = which * 2;
    return ocean_battle_valid_cannon_coordinates[offset + 1];
}
uint32_t ocean_battle_is_valid_cannon_coordinates(uint32_t x, uint32_t y) {
    for (uint32_t i = 0; i < MAX_VALID_CANNON_COORDINATES; i += 2) {
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
void scene_ocean_battle_increment_turn_order() {
    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = false;
    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = false;
    ++ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX];
    if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] >= ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY]) {
        ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] = 0;
    }
}
uint32_t scene_ocean_battle(uint32_t action) {
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT) {
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
    switch (get_current_scene_state()) {
        case SCENE_OCEAN_BATTLE_STATE_SETUP: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("setting_up_ocean_battle");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();

                    // TODO: add_fleet_to_battle
                    // players fleet
                    // two captain fleets
                    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS; ++i) {
                        if (ocean_battle_fleets[i] != SENTRY) {
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_FLEET_ORDER_ID] = i;
                            break;
                        }
                    }
                    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_SHIP_NTH_ORDER] = 0;
                    for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i) {
                        uint32_t offset = i * FLEET_SHIP_DATA_SIZE;
                        if (g_fleet_ship_data[offset + FLEET_SHIP_FLEET_ID] == ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_FLEET_ORDER_ID]) {
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_SHIP_ID] = i;
                            break;
                        }
                    }
                    for (uint32_t i = 0; i < MAX_OCEAN_BATTLE_FLEETS * MAX_FLEET_SHIPS; ++i) {
                        ocean_battle_turn_order[i] = SENTRY;
                    }
                    console_log("PLACEMENT PHASE");
                    uint32_t world_npc_data[WORLD_NPC_DATA_SIZE];
                    CLEAR_DATA(world_npc_data, WORLD_NPC_DATA_SIZE);
                    uint32_t npc_id;
                    uint32_t world_npc_id;
                    uint32_t obto = 0;
                    // TODO: Update this so only the active fleets in the battle are placed
                    for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i) {
                        uint32_t offset = i * FLEET_SHIP_DATA_SIZE;
                        if (g_fleet_ship_data[offset + FLEET_SHIP_FLEET_ID] != SENTRY) {
                            // [BATTLE SHIP CLEAR]
                            npc_id = get_npc_id_by_machine_name("ship");
                            world_npc_data[WORLD_NPC_NPC_ID] = npc_id;
                            // Note: This is the RAW fleet ship id
                            world_npc_data[WORLD_NPC_ENTITY_ID] = i;
                            // TODO: Get actual captain ID
                            world_npc_data[WORLD_NPC_CAPTAIN_ID] = 0;
                            world_npc_data[WORLD_NPC_POSITION_X] = 2 + i;
                            world_npc_data[WORLD_NPC_POSITION_Y] = 6;
                            world_npc_data[WORLD_NPC_DIRECTION] = DIRECTION_DOWN;
                            world_npc_data[WORLD_NPC_IS_INTERACTABLE] = false;
                            world_npc_data[WORLD_NPC_IS_CAPTAIN] = false;
                            world_npc_id = create_world_npc(world_npc_data, true);
                            ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY];
                            ocean_battle_turn_order[obto] = world_npc_id;
                            ++obto;
                        }
                    }
                    ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX] = 0;
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_TAKE_TURN: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t players_fleet_id = get_fleet_id_by_general_id(players[0]);
                    uint32_t world_npc_id = get_current_ocean_battle_turn_npc_id();
                    uint32_t attacker_ship_id = get_world_npc_entity_id(world_npc_id);
                    uint32_t attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
                    uint32_t attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
                    bool npcs_turn = true;
                    if (attacker_fleet_id == players_fleet_id) {
                        npcs_turn = false;
                        uint32_t moved_and_attacked = SENTRY;
                        if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] == true && ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] == true) {
                            moved_and_attacked = 1;
                        }
                        if (moved_and_attacked != SENTRY) {
                            console_log("PLAYERS TURN ENDS");
                            scene_ocean_battle_increment_turn_order();
                            npcs_turn = true;
                            world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
                            attacker_ship_id = get_world_npc_entity_id(world_npc_id);
                            attacker_fleet_ship_id = get_ship_id_by_fleet_ship_id(attacker_ship_id);
                            attacker_fleet_id = get_fleet_ship_fleet_id(attacker_fleet_ship_id);
                            if (attacker_fleet_id == players_fleet_id) {
                                console_log("NPCS TRUN FALSE");
                                npcs_turn = false;
                            }
                        }
                        if (npcs_turn == false) {
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        }
                    }
                    if (npcs_turn == true) {
                        // TODO: SCENE_OCEAN_BATTLE_STATE_NPC_TAKE_TURN
                        // TODO: Break out NPC actions (move & attack) so we can animate them in renderer
                        // TODO: Board ship attack for npcs as a random choice (between fire cannon and board ship)
                        // TODO: Have NPC ships capable of running away when health is low
                        console_log("NPC TAKES ACTION");
                        world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
                        if (get_ship_hull(attacker_ship_id) > 0 && get_ship_crew(attacker_ship_id) > 0) {
                            uint32_t rando = get_random_number(1, 4);
                            if (rando == 1) {
                                move_world_npc_down(world_npc_id);
                            } else if (rando == 2) {
                                move_world_npc_up(world_npc_id);
                            } else if (rando == 3) {
                                move_world_npc_left(world_npc_id);
                            } else if (rando == 4) {
                                move_world_npc_right(world_npc_id);
                            }
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] = true;
                        }

                        // TODO: Make this an actual range value based on the ship & other heuristics
                        uint32_t movement_range = 2;
                        uint32_t cannon_range = 6;
                        bool attacking = false;
                        if (get_ship_hull(attacker_ship_id) > 0 && get_ship_crew(attacker_ship_id) > 0) {
                            for (uint32_t i = 0; i < OCEAN_BATTLE_DATA_TOTAL_SHIPS_IN_PLAY; ++i) {
                                if (ocean_battle_turn_order[i] != SENTRY && ocean_battle_turn_order[i] != world_npc_id) {
                                    uint32_t target_npc_id = ocean_battle_turn_order[i];
                                    uint32_t target_ship_id = get_world_npc_entity_id(target_npc_id);
                                    uint32_t target_fleet_ship_id = get_ship_id_by_fleet_ship_id(target_ship_id);
                                    uint32_t target_fleet_id = get_fleet_ship_fleet_id(target_fleet_ship_id);
                                    if (target_fleet_id == attacker_fleet_id) {
                                        continue;
                                    }
                                    if (get_ship_hull(target_ship_id) <= 0 || get_ship_crew(target_ship_id) <= 0) {
                                        continue;
                                    }
                                    uint32_t a_x = get_world_npc_x(target_npc_id);
                                    uint32_t a_y = get_world_npc_y(target_npc_id);
                                    uint32_t b_x = get_world_npc_x(world_npc_id);
                                    uint32_t b_y = get_world_npc_y(world_npc_id);
                                    if (is_coordinate_in_range_of_coordinate(a_x, a_y, b_x, b_y, cannon_range)) {
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
                        if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] && ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED]) {
                            moved_and_attacked = 1;
                        }
                        if (!attacking || moved_and_attacked != SENTRY) {
                            scene_ocean_battle_increment_turn_order();
                            should_redraw_everything();
                        }
                    }
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        break;
                    }
                    break;
                }
            }
            break;
        }
        case SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK: {
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        // TODO: Why are we running the damage actions in confirm here?
                        uint32_t damage = get_random_number(1, 33);
                        uint32_t ship_id = get_world_npc_entity_id(ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID]);
                        reduce_ship_hull(ship_id, damage);
                        if (get_ship_hull(ship_id) <= 0) {
                            ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED];
                            if (ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED] >= 3) {
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
        case SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK: {
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        // TODO: Why are we running the damage actions in confirm here?
                        uint32_t damage = get_random_number(1, 33);
                        uint32_t ship_id = get_world_npc_entity_id(ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID]);
                        reduce_ship_crew(ship_id, damage);
                        if (get_ship_crew(ship_id) <= 0) {
                            ++ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED];
                            if (ocean_battle_data[OCEAN_BATTLE_DATA_TOTAL_SHIPS_DESTROYED] >= 3) {
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
        case SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK_CHOOSE_TARGET: {
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        uint32_t x = ocean_battle_intended_cannon_coordinates[0];
                        uint32_t y = ocean_battle_intended_cannon_coordinates[1];
                        if (ocean_battle_is_valid_cannon_coordinates(x, y) != SENTRY) {
                            ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = get_current_ocean_battle_turn_npc_id();
                            ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = ocean_battle_find_world_npc_id_by_coordinates(x, y);
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_CANNON_ATTACK);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        } else {
                            console_log("Invalid cannon attack coordinates");
                        }
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK) {
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
        case SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK_CHOOSE_TARGET: {
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        uint32_t x = ocean_battle_intended_boarding_coordinates[0];
                        uint32_t y = ocean_battle_intended_boarding_coordinates[1];
                        if (ocean_battle_is_valid_boarding_coordinates(x, y) != SENTRY) {
                            ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID] = get_current_ocean_battle_turn_npc_id();
                            ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID] = ocean_battle_find_world_npc_id_by_coordinates(x, y);
                            ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_ATTACKED] = true;
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_BOARD_ATTACK);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        } else {
                            console_log("Invalid boarding attack coordinates");
                        }
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK) {
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
        case SCENE_OCEAN_BATTLE_STATE_PLAYER_TAKE_TURN: {
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
                    uint32_t cc = current_scene_get_current_choice();
                    uint32_t choice = current_scene_get_choice(cc);
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_FIRE_CANNONS) {
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
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_BOARD_SHIP) {
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
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        scene_ocean_battle_increment_turn_order();
                        set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_TAKE_TURN);
                        scene_ocean_battle(SCENE_ACTION_INIT);
                        should_redraw_everything();
                        break;
                    }
                    if (choice == SCENE_OCEAN_BATTLE_CHOICE_MOVE) {
                        if (ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_MOVED] != true) {
                            set_current_scene_state(SCENE_OCEAN_BATTLE_STATE_MOVING);
                            scene_ocean_battle(SCENE_ACTION_INIT);
                            should_redraw_everything();
                        }
                        break;
                    }
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_ORDER) {
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
        case SCENE_OCEAN_BATTLE_STATE_ORDER: {
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_BACK) {
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
        case SCENE_OCEAN_BATTLE_STATE_MOVING: {
            switch (action) {
                case SCENE_ACTION_INIT: {
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
                case SCENE_MAKE_CHOICE: {
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
        case SCENE_OCEAN_BATTLE_STATE_VICTORY: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("ocean_battle_victory");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_OCEAN_BATTLE_CHOICE_CONFIRM) {
                        // If you confirm a victory then just go back to normal game mode
                        clear_current_scene();
                        current_game_mode = GAME_MODE_IN_PORT;
                        should_redraw_everything();
                        // TODO: You have to clear the world npcs that are ships
                        // [BATTLE SHIP CLEAR]
                        // TODO: Update this so only the active fleets in the battle are placed
                        for (uint32_t i = 0; i < MAX_FLEET_SHIPS; ++i) {
                            uint32_t offset = i * FLEET_SHIP_DATA_SIZE;
                            if (g_fleet_ship_data[offset + FLEET_SHIP_FLEET_ID] != SENTRY) {
                                for (uint32_t wn = 0; wn < MAX_WORLD_NPCS; ++wn) {
                                    uint32_t wn_offset = wn * WORLD_NPC_DATA_SIZE;
                                    if (g_world_npc_data[wn_offset + WORLD_NPC_ENTITY_ID] == i) {
                                        // TODO: THIS IS TEMPORARY
                                        // we reset the ships stats so we can
                                        // start a new fresh battle down the road
                                        uint32_t ship_id = get_world_npc_entity_id(wn);
                                        uint32_t offset = ship_id * SHIP_DATA_SIZE;
                                        g_ship_data[offset + SHIP_HULL] = 99;
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
void set_ocean_battle_data_intended_move_x(uint32_t x) {
    ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_X] = x;
}
void set_ocean_battle_data_intended_move_y(uint32_t y) {
    ocean_battle_data[OCEAN_BATTLE_DATA_INTENDED_MOVE_Y] = y;
}
uint32_t get_ocean_battle_attacker_world_npc_id() {
    return ocean_battle_data[OCEAN_BATTLE_DATA_ATTACKER_WORLD_NPC_ID];
}
uint32_t get_ocean_battle_target_world_npc_id() {
    return ocean_battle_data[OCEAN_BATTLE_DATA_TARGET_WORLD_NPC_ID];
}
uint32_t ocean_battle_is_world_coordinate_in_ship_movement_range(uint32_t world_x, uint32_t world_y) {
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    uint32_t current_ship_id = get_world_npc_entity_id(world_npc_id);
    // TODO: Setup an actual movement range
    uint32_t movement_range = 2;
    uint32_t b_x = SENTRY;
    uint32_t b_y = SENTRY;
    for (uint32_t i = 0; i < MAX_WORLD_NPCS; ++i) {
        uint32_t offset = i * WORLD_NPC_DATA_SIZE;
        if (g_world_npc_data[offset + WORLD_NPC_ENTITY_ID] == current_ship_id) {
            b_x = g_world_npc_data[offset + WORLD_NPC_POSITION_X];
            b_y = g_world_npc_data[offset + WORLD_NPC_POSITION_Y];
            break;
        }
    }
    if (b_x == SENTRY || b_y == SENTRY) {
        console_log("Could not find ship in world");
        return SENTRY;
    }
    return is_coordinate_in_range_of_coordinate(world_x, world_y, b_x, b_y, movement_range);
}
uint32_t get_ocean_battle_current_turn_ship_x() {
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_x(world_npc_id);
}
uint32_t get_ocean_battle_current_turn_ship_y() {
    uint32_t world_npc_id = ocean_battle_turn_order[ocean_battle_data[OCEAN_BATTLE_DATA_CURRENT_TURN_INDEX]];
    return get_world_npc_y(world_npc_id);
}


// TODO: Software renderer. Blit pixels out. Load on initalize game. Ask for pixels for a *thing*, get pixels out, render to *other thing*


uint32_t scene_npc_rvice(uint32_t action) {
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT) {
        clear_current_scene();
        set_current_scene(SCENE_NPC_RVICE);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_rvice"));
        set_current_scene_state(SCENE_NPC_STATES_RVICE_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_rvice(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state()) {
        case SCENE_NPC_STATES_RVICE_TRASH_TALK: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_rvice_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM) {
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
uint32_t scene_npc_lafolie(uint32_t action) {
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT) {
        clear_current_scene();
        set_current_scene(SCENE_NPC_LAFOLIE);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_lafolie"));
        set_current_scene_state(SCENE_NPC_STATES_LAFOLIE_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_lafolie(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state()) {
        case SCENE_NPC_STATES_LAFOLIE_TRASH_TALK: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_lafolie_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM) {
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
uint32_t scene_npc_nakor(uint32_t action) {
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT) {
        clear_current_scene();
        set_current_scene(SCENE_NPC_NAKOR);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_nakor"));
        set_current_scene_state(SCENE_NPC_STATES_NAKOR_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_nakor(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state()) {
        case SCENE_NPC_STATES_NAKOR_TRASH_TALK: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_nakor_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM) {
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
uint32_t scene_npc_travis(uint32_t action) {
    //
    // THERE IS AN ISSUE WITH TOP DOWN AUTOMATA (OR LAST IN FIRST OUT)
    //
    // STEP BY STEP
    // clear_current_scene() && set_current_scene() && set_current_scene_string_id()
    // set_current_scene_state()
    // set_game_mode_to_IN_SCENE
    // [[initialize_first_state]]
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT) {
        clear_current_scene();
        set_current_scene(SCENE_NPC_TRAVIS);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_npc_travis"));
        set_current_scene_state(SCENE_NPC_STATES_TRAVIS_TRASH_TALK);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_npc_travis(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state()) {
        case SCENE_NPC_STATES_TRAVIS_TRASH_TALK: {
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT: {
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_travis_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE: {
                    if (current_scene_get_choice(cc) == SCENE_NPC_CHOICE_CONFIRM) {
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
            clear_current_scene_choices();
            current_scene_set_choice_string_id(
                current_scene_add_choice(SCENE_OCEAN_BATTLE_CHOICE_CONFIRM),
                get_string_id_by_machine_name("confirm")
            );
            uint32_t cc = current_scene_get_current_choice();
            switch (action) {
                case SCENE_ACTION_INIT:
                {
                    uint32_t string_id = get_string_id_by_machine_name("scene_state_npc_loller_trash_talk");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                    break;
                }
                case SCENE_MAKE_CHOICE:
                {
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
// g_bank_data
// enum BankData
uint32_t bank_add_deposit(uint32_t amount)
{
    // TODO: Check that we haven't deposited more than we can handle, unlike rvices ballz
    g_bank_data[BANK_DEPOSIT_ORIGINAL_AMOUNT] += amount;
    return g_bank_data[BANK_DEPOSIT_ORIGINAL_AMOUNT];
}
uint32_t bank_take_loan(uint32_t amount)
{
    // Never add. You can only take one load per time
    g_bank_data[BANK_LOAN_ORIGINAL_AMOUNT] = amount;
    return g_bank_data[BANK_LOAN_ORIGINAL_AMOUNT];
}
void bank_update_yearly()
{
    // TODO: Every year, add interest rate amounts to deposit and loan original amounts
}
uint32_t get_bank_deposit_interest_rate()
{
    return g_bank_data[BANK_DEPOSIT_INTEREST_RATE];
}
uint32_t get_bank_loan_interest_rate()
{
    return g_bank_data[BANK_LOAN_INTEREST_RATE];
}
uint32_t get_bank_deposit_original_amount()
{
    return g_bank_data[BANK_DEPOSIT_ORIGINAL_AMOUNT];
}
uint32_t get_bank_loan_original_amount()
{
    return g_bank_data[BANK_LOAN_ORIGINAL_AMOUNT];
}
uint32_t get_bank_deposit_max_amount()
{
    return g_bank_data[BANK_MAX_DEPOSIT_AMOUNT];
}
uint32_t get_bank_loan_max_amount()
{
    return g_bank_data[BANK_MAX_LOAN_AMOUNT];
}

uint32_t scene_bank(uint32_t action)
{
    if (get_current_scene() == SENTRY && action == SCENE_ACTION_INIT)
    {
        clear_current_scene();
        set_current_scene(SCENE_BANK);
        set_current_scene_string_id(get_string_id_by_machine_name("scene_digi_tal_bank"));
        set_current_scene_state(SCENE_BANK_WELCOME);
        current_game_mode = GAME_MODE_IN_SCENE;
        scene_bank(SCENE_ACTION_INIT);
        return SENTRY;
    }
    switch (get_current_scene_state())
    {
        case SCENE_BANK_WELCOME:
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
                    uint32_t string_id = get_string_id_by_machine_name("welcome_to_digi_tal_bank");
                    set_current_scene_state_string_id(string_id);
                    set_current_scene_dialogue_string_id(string_id);
                    should_redraw_everything();
                }
                case SCENE_MAKE_CHOICE:
                {
                    uint32_t cc = current_scene_get_current_choice();
                    if (current_scene_get_choice(cc) == SCENE_BANK_CHOICE_CONFIRM)
                    {
                        current_game_mode = GAME_MODE_IN_PORT;
                        clear_current_scene();
                        should_redraw_everything();
                        break;
                    }
                    break;
                }
            }
        }
    }

    return SENTRY;
}

// TODO: Dockyard/shipyard
// TODO: Inn -> sleep, set alarm for a specific time
// TODO: Weapon/Armor shop
// TODO: Trade shop -> heuristics on economic factors that influence price
// TODO: Guilds? Tasks with reputation and guild memberships?
// TODO: Library? What even is this? Read books and gain info or something?
// TODO: Cafe -> buy drinks, flirt with waitress, hire crew, hire captains, get gossip
// TODO: Duels -> recycle card based system from original game???
// TODO: Autopilot captains -> they can auto sail your fleet to a port (pathfinding)
// TODO: Jail -> world/map, houses React pirates. Maybe React pirates are their own faction
// TODO: Houses to buy (pre-furnished to start, later on, furniture microtransactions w/ crypto mining for each furniture purchased so Spiro makes boatloads of cash)
// TODO: Bulletin boards with messages to other players (post office??)
// TODO: "Send" your ships to other players which become AI controlled and help other players
// TODO: "Item in a bottle" -> send out an item and random player receives it later