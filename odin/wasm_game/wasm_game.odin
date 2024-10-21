package wasm_game

import "core:fmt"
USE_JS :: #config(USE_JS, false)

when USE_JS {
    foreign import env "env"
    @(default_calling_convention="contextless")
    foreign env {
        js_console_log :: proc(ptr: rawptr, len: i32) ---
    }

    buffer: [4096]u8
    console_log :: proc(message: string, args: ..any) {
        if len(args) == 0 {
            js_console_log(raw_data(message), i32(len(message)))
        } else {
            formatted := fmt.bprintf(buffer[:], message, ..args)
            js_console_log(raw_data(formatted), i32(len(formatted)))
        }
    }
} else {
    buffer: [4096]u8
    console_log :: proc(message: string, args: ..any) {
        if len(args) == 0 {
            fmt.println(message)
        } else {
            fmt.printf(message, ..args)
            fmt.println()
        }
    }
}


NPCType :: enum i32 {
    Captain,
    Other,
}
MAX_CAPTAIN_SKILLS :: 10
MAX_CAPTAIN_INVENTORY_SPACE :: 300
NPC :: struct {
    type: NPCType,
    is_player: bool,
    name: string,
    position: struct {
        x, y: i32,
    },
    gold: i32,
    skills: [MAX_CAPTAIN_SKILLS]Skill,
    stats: Stats,
    inventory: [MAX_CAPTAIN_INVENTORY_SPACE]InventoryItem,
    fleet: i32,
}
MAX_WORLD_NPCS : i32 : 1000
world_npcs: [MAX_WORLD_NPCS]NPC
MAX_GLOBAL_CAPTAINS : i32 : 300
global_captains: [MAX_GLOBAL_CAPTAINS]NPC
get_npc_fleet :: proc(npc: NPC) -> (bool, Fleet) {
    if npc.fleet < 0 || npc.fleet >= MAX_GLOBAL_CAPTAINS {
        console_log("NPC does not have a valid fleet")
        return false, Fleet{}
    }

    if global_fleets[npc.fleet].ships[0].captain.name == "" {
        console_log("NPC fleet has no ships")
        return false, Fleet{}
    }

    if global_fleets[npc.fleet].flagship.captain.name != npc.name {
        console_log("NPC is not the captain of their fleet")
        return false, Fleet{}
    }

    return true, global_fleets[npc.fleet]
}

get_npc :: proc(name: string) -> (bool, NPC) {

    switch name {

    case "spiro":

        return true, NPC{

            name = "Spiro",

            type = NPCType.Captain,

            is_player = false,

            position = {x = 0, y = 0},

            gold = 0,

            skills = [MAX_CAPTAIN_SKILLS]Skill{},

            stats = Stats{},

            inventory = [MAX_CAPTAIN_INVENTORY_SPACE]InventoryItem{},

            fleet = 0,

        }

    }


    return false, NPC{}

}


get_global_captain :: proc(name: string) -> (bool, NPC) {

    for i := 0; i < len(global_captains); i += 1 {

        if global_captains[i].name == name {

            return true, global_captains[i]

        }

    }


    return false, NPC{}

}


get_player :: proc(offset: i32 = 0) -> (bool, NPC) {

    current_offset: i32 = 0

    for i := 0; i < len(global_captains); i += 1 {

        if global_captains[i].is_player && current_offset == offset {

            return true, global_captains[i]

        }

        current_offset += 1

    }


    return false, NPC{}

}



World :: struct {
    name: string,
    width, height: i32,
    total_layers: i32,
}


LayerType :: enum i32 {
    Background,
    Foreground,
    NPC,
    Entity,
    Block,
    Other,
}


Layer :: struct {
    name: string,
    type: LayerType,
}


get_world_layer :: proc(name: string) -> (bool, Layer) {
    switch name {
    case "layer_one":
        if current_world.name == "world_one" {
            return true, Layer{name="test_world_one_layer_one", type=LayerType.Background}
        }
    }
    return false, Layer{}
}
get_world_layer_coordinate_value :: proc(name: string, row: i32, column: i32) -> i32 {
    switch name {
    case "layer_one":
        if current_world.name == "world_one" {
            if row == 0 && column == 0 {
                return 33
            } else if row > 0 && column < 20 {
                // From rows 1+ and columns 0 - 19, return
                return 34
            }
        }
    }
    return -1
}


@(export)
get_id_of_layer_type_background :: proc() -> i32 {
    return i32(LayerType.Background)
}
@(export)
get_id_of_layer_type_foreground :: proc() -> i32 {
    return i32(LayerType.Foreground)
}
@(export)
get_id_of_layer_type_npc :: proc() -> i32 {
    return i32(LayerType.NPC)
}
@(export)
get_id_of_layer_type_block :: proc() -> i32 {
    return i32(LayerType.Block)
}
@(export)
get_id_of_layer_type_entity :: proc() -> i32 {
    return i32(LayerType.Entity)
}
@(export)
get_id_of_layer_type_other :: proc() -> i32 {
    return i32(LayerType.Other)
}


SHOULD_REDRAW :: enum i32 {
    Nothing,
    Everything,
    Ships,
    NPCs,
}
should_redraw: i32 = 0
@(export)
renderer_should_redraw :: proc() -> i32 {
    if should_redraw > 0 {
        original_should_redraw := should_redraw
        should_redraw = i32(SHOULD_REDRAW.Nothing)
        return original_should_redraw
    }
    return 0
}


@(export)
get_current_world_height :: proc() -> i32 {
    return current_world.height
}
@(export)
get_current_world_width :: proc() -> i32 {
    return current_world.width
}


viewport_width: i32 = 8
viewport_height: i32 = 8
@(export)
set_viewport_size :: proc(width: i32, height: i32) {
    viewport_width = width
    viewport_height = height
}


// TODO: Maybe generate an array for this on load_world?
@(export)
get_total_current_world_layers_by_type :: proc(type_id: i32) -> i32 {
    total: i32 =  0
    for i: i32 = 0; i < current_world.total_layers; i += 1 {
        if i32(world_layers[i].type) == type_id {
            total += 1
        }
    }
    return total
}
@(export)
get_current_world_layer_index_by_type :: proc(type_id: i32, offset: i32 = 0) -> i32 {
    total_layers: i32 = get_total_current_world_layers_by_type(type_id)
    if offset > 0 && offset > total_layers {
        console_log("Attempted to offset beyond total available layers for type")
        return -1
    }
    offset_cursor: i32 = 0
    for i: i32 = 0; i < current_world.total_layers; i += 1 {
        if i32(world_layers[i].type) == type_id {
            if total_layers > 0 && offset_cursor == offset {
                return i
            } else if total_layers > 0 && offset_cursor < offset {
                offset_cursor += 1
            } else if total_layers > 0 && offset_cursor > offset {
                console_log("Catastrophic failure. This should never happen. Your cursor offset exceeded input offset")
                return -1
            } else {
                return i
            }
        }
    }
    return -1
}


@(export)
get_viewport_value_at_coordinates :: proc(layer_index: i32, x: i32, y: i32) -> i32 {
    map_width: i32 = current_world.width
    map_height: i32 = current_world.height
    x_padding: i32 = 0
    y_padding: i32 = 0
    if viewport_width > map_width {
        x_padding = (viewport_width - map_width) / 2
    }
    if viewport_height > map_height {
        y_padding = (viewport_height - map_height) / 2
    }
    x_offset := x - x_padding
    y_offset := y - y_padding
    x_offset += camera_offset_x
    y_offset += camera_offset_y
    if x_offset < 0 || y_offset < 0 || x_offset >= map_width || y_offset >= map_height {
        return -1
    }
    if world_layers[layer_index].name != "" {
        return get_world_layer_coordinate_value(world_layers[layer_index].name, x, y)
    }
    return -1
}


camera_offset_x: i32 = 0
camera_offset_y: i32 = 0
move_camera_down :: proc() {
    map_height := current_world.height
    // Calculate the maximum allowed camera offset
    max_camera_offset_y := max(0, map_height - viewport_height)
    // Check if moving down would exceed the map bounds
    if camera_offset_y < max_camera_offset_y {
        camera_offset_y += 1
        should_redraw = i32(SHOULD_REDRAW.Everything)
    }
}
move_camera_right :: proc() {
    map_width := current_world.width
    // Calculate the maximum allowed camera offset
    max_camera_offset_x := max(0, map_width - viewport_width)
    // Check if moving right would exceed the map bounds
    if camera_offset_x < max_camera_offset_x {
        camera_offset_x += 1
        should_redraw = i32(SHOULD_REDRAW.Everything)
    }
}
move_camera_up :: proc() {
    if camera_offset_y > 0 {
        camera_offset_y -= 1
        should_redraw = i32(SHOULD_REDRAW.Everything)
    }
}
move_camera_left :: proc() {
    if camera_offset_x > 0 {
        camera_offset_x -= 1
        should_redraw = i32(SHOULD_REDRAW.Everything)
    }
}


@(export)
is_map_coordinate_in_viewport :: proc(x: i32, y: i32) -> bool {
    return x >= camera_offset_x && x < camera_offset_x + viewport_width &&
           y >= camera_offset_y && y < camera_offset_y + viewport_height
}
is_map_coordinate_halfway_of_viewport :: proc(x: i32, y: i32) -> (bool, bool, bool, bool) {
    halfway_x := camera_offset_x + viewport_width / 2
    halfway_y := camera_offset_y + viewport_height / 2
    more_than_halfway_x := x > halfway_x
    more_than_halfway_y := y > halfway_y
    less_than_halfway_x := x < halfway_x
    less_than_halfway_y := y < halfway_y
    return more_than_halfway_x, more_than_halfway_y, less_than_halfway_x, less_than_halfway_y
}
@(export)
are_coordinates_blocked :: proc(map_id: i32, x: i32, y: i32) -> bool {
    // TODO: Get maps "block" layer and see if x&&y have a value greater than 0
    // TODO: Also get maps "npc" layer and see if x&&y have a value greater than 0
    // TODO: Get maps "entity" layer and see if x&&y have a value greater than 0 and, if they do, get entity and check "is_interactable"
    return false
}
@(export)
is_coordinate_in_range_of_coordinate :: proc(a_x: i32, a_y: i32, b_x: i32, b_y: i32, range: i32) -> bool {
    return distance_between_coordinates(a_x, a_y, b_x, b_y, range) <= range
}
@(export)
distance_between_coordinates :: proc(a_x: i32, a_y: i32, b_x: i32, b_y: i32, range: i32) -> i32 {
    dx := abs(b_x - a_x)
    dy := abs(b_y - a_y)
    manhattan_distance := dx + dy
    return manhattan_distance
}


MAX_WORLD_LAYERS : i32 : 50
world_layers: [MAX_WORLD_LAYERS]Layer


InventoryItem :: struct {
    type: ItemType,
    number_held: i32,
}


ItemType :: enum i32 {
    Item,
    Armor,
    Weapon,
    Good,
}
Item :: struct {
    type: ItemType,
    name: string,
    base_price: i32,
    adjusted_price: i32,
}
get_item :: proc(name: string) -> (bool, Item) {
    switch name {
    case "lime_juice":
        return true, Item{name="Lime Juice", type=ItemType.Item, base_price=100}
    }
    return false, Item{}
}
use_item :: proc(name: string) {
    switch name {
    case "lime_juice":
        // TODO: Removes scurvy from the crew
    }
}


MAX_WORLD_SHOPS :: 20
world_shops: [MAX_WORLD_SHOPS]Shop
MAX_WORLD_SHOP_GOODS :: 100
world_shop_goods: [MAX_WORLD_SHOP_GOODS * MAX_WORLD_SHOPS]Good
current_world: World
load_world :: proc(name: string) {
    switch name {
        case "world_one":
            empty_world()
            current_world = World{name=name, width=100, height=100}
            layer_found, layer := get_world_layer("layer_one")
            if layer_found {
                world_layers[0] = layer
                current_world.total_layers += 1
                console_log("layer name: %s", world_layers[0].name)
            } else {
                console_log("Could not find layer! %s", "layer_one")
            }
            npc_found, npc := get_npc("spiro")
            if npc_found {
                world_npcs[0] = npc
                world_npcs[0].position.x = 0
                world_npcs[0].position.y = 0
            }
            shop_found, shop := get_shop("market")
            if shop_found {
                world_shops[0] = shop
            }
            good_found, good := get_good("art")
            if good_found {
                world_shop_goods[0] = good
            }
        case "test_world_two":
            current_world = World{name=name, width=20, height=20}
            world_layers[0] = Layer{name="test_world_two_layer_one", type=LayerType.Background}
            world_npcs[0] = NPC{name="ship_1", position={x=0, y=0}}
            world_npcs[1] = NPC{name="ship_2", position={x=2, y=2}}
    }
}


add_to_inventory :: proc(captain: NPC, item: InventoryItem) {
    // TODO: Does this item exist in inventory already? If so, +1
    // TODO: Does this item exist in inventory already? If not, find open slot in "player_inventory", add and set to 1
}
remove_from_inventory :: proc(captain: NPC, item: InventoryItem) {
    // TODO: Does this item exist in inventory already? If so, -1
    // Did we just -1 and now it's 0 (or less than), then completely remove from inventory
    // TODO: If item does not exist in inventory, do nothing
}
has_in_inventory :: proc(captain: NPC, item: InventoryItem) -> (bool, InventoryItem) {
    // TODO: Iterate over player_inventory and return the item if found
    return false, InventoryItem{}
}


Shop :: struct {
    name: string
}


get_shop :: proc(name: string) -> (bool, Shop) {
    switch name {
    case "market":
        return true, Shop{name=name}
    }
    return false, Shop{}
}


empty_world :: proc() {
    for i: i32 = 0; i < MAX_WORLD_LAYERS; i += 1 {
        world_layers[i] = Layer{}
    }
    for i: i32 = 0; i < MAX_WORLD_NPCS; i += 1 {
        world_npcs[i] = NPC{}
    }
    for i: i32 = 0; i < MAX_WORLD_SHOPS; i += 1 {
        world_shops[i] = Shop{}
    }
    for i: i32 = 0; i < MAX_WORLD_SHOP_GOODS; i += 1 {
        world_shop_goods[i] = Good{}
    }
}


Port :: struct {
    name: string,
    location: struct {
        x: i32, y: i32,
    },
}


get_port :: proc(name: string) -> (bool, Port) {
    switch name {
    case "athens":
        return true, Port{name=name}
    }
    return false, Port{}
}


Weapon :: struct {
    type: ItemType,
    name: string,
    base_price: i32,
    adjusted_price: i32,
    attack: i32,
}


get_weapon :: proc(name: string) -> (bool, Weapon) {
    switch name {
    case "dagger":
        return true, Weapon{name="Dagger", base_price=400, attack=5, type=ItemType.Weapon}
    }
    return false, Weapon{}
}


Armor :: struct {
    type: ItemType,
    name: string,
    base_price: i32,
    adjusted_price: i32,
    defense: i32,
}


get_armor :: proc(name: string) -> (bool, Armor) {
    switch name {
    case "leather_armor":
        return true, Armor{name="Leather Armor", base_price=1000, defense=10, type=ItemType.Armor}
    }
    return false, Armor{}
}


Skill :: struct {
    name: string,
    requirements: Stats,
}


get_skill :: proc(name: string) -> (bool, Skill) {
    switch name {
    case "celestial_navigation":
        return true, Skill{name="Celestial Navigation", requirements=Stats{Seamanship=70, Knowledge=80, Intuition=70}}
    }
    return false, Skill{}
}


Stats :: struct {
    BattleLevel: i32,
    NavigationLevel: i32,
    Leadership: i32,
    Seamanship: i32,
    Knowledge: i32,
    Intuition: i32,
    Courage: i32,
    Swordsmanship: i32,
    Charm: i32,
    Luck: i32,
}


scene_clear_choices :: proc() {
    for i := 0; i < len(current_scene.choices); i += 1 {
        current_scene.choices[i] = ""
    }
}


Good :: struct {
    type: ItemType,
    name: string,
    base_price: i32,
    adjusted_price: i32,
}


get_good :: proc(name: string) -> (bool, Good) {
    switch name {
    case "art":
        return true, Good{name=name, base_price=20, adjusted_price=0, type=ItemType.Good}
    }
    return false, Good{}
}


MAX_SHIPS_IN_FLEET : i32 : 30
Fleet :: struct {
    ships: [MAX_SHIPS_IN_FLEET]FleetShip,
    flagship: FleetShip,
}
MAX_SHIP_INVENTORY_SPACE : i32 : 10
ShipInventoryItemType :: enum i32 {
    Wood,
    Cannonballs,
    Water,
    Good,
}
ShipInventoryItem :: struct {
    type: ShipInventoryItemType,
    number_held: i32,
}
FleetShip :: struct {
    base: Ship,
    cargo: i32,
    crew: i32,
    inventory: [MAX_SHIP_INVENTORY_SPACE]ShipInventoryItem,
    captain: NPC,
    // Is player the captain of *this* particular ship
    player_is_captain: bool,
}
CannonType :: enum i32 {
    Cannon,
    Demi_Cannon,
    Cannon_Pedero,
    Culverin,
    Demi_Culverin,
    Saker,
    Carronade,
    Heavy_Cannon,
    Super_Carronade,
}
Cannon :: struct {
    type: CannonType,
    range: i32,
    power: i32,
    base_price: i32,
}
FigureHead :: enum i32 {
    Seahorse,
    Commodore,
    Unicorn,
    Lion,
    Giant_Eagle,
    Hero,
    Neptune,
    Dragon,
    Angel,
    Goddess,
}
global_fleets: [MAX_GLOBAL_CAPTAINS]Fleet


ShipType :: enum i32 {
    Balsa,
    Hansa_Cog,
    Light_Galley,
    Tallete,
    Kansen,
    Caravela_Latina,
    Caravela_Redonda,
    Dhow,
    Junk,
    Brigantine,
    Atakabune,
    Flemish_Galleon,
    Nao,
    Xebec,
    Venetian_Galeass,
    Pinnace,
    Carrack,
    La_Reale,
    Buss,
    Galleon,
    Sloop,
    Tekkousen,
    Frigate,
    Barge,
    Full_Rigged_Ship,
}
ShipMaterial :: enum i32 {
    Copper,
    Beech,
    Used,
    Steel,
}
Ship :: struct {
    type: ShipType,
    power: i32, // Ability to move forward
    strength: i32,
    top_material: ShipMaterial,
    cargo: i32,
    crew: i32,
    arms: i32,
    tacking: i32,
    price: i32,
    days: i32,
    durability: i32, // Wears out over time
    load: i32, // Current and max capacity of all objects
}


MAX_SCENE_CHOICES :: 10
Scene :: struct {
    name: string,
    cursor: string,
    dialogue: string,
    menu: string,
    choices: [MAX_SCENE_CHOICES]string,
    chosen: [MAX_SCENE_CHOICES]i32,
}
current_scene: Scene

@(export)

get_current_scene_name_ptr :: proc() -> rawptr {

    return &current_scene.name

}

@(export)

get_current_scene_name_len :: proc() -> i32 {

    return i32(len(current_scene.name))

}

@(export)

get_current_scene_cursor_ptr :: proc() -> rawptr {

    return &current_scene.cursor

}

@(export)

get_current_scene_cursor_len :: proc() -> i32 {

    return i32(len(current_scene.cursor))

}

@(export)

get_current_scene_dialogue_ptr :: proc() -> rawptr {

    return &current_scene.dialogue

}

@(export)

get_current_scene_dialogue_len :: proc() -> i32 {

    return i32(len(current_scene.dialogue))

}

@(export)

get_current_scene_menu_ptr :: proc() -> rawptr {

    return &current_scene.menu

}

@(export)

get_current_scene_menu_len :: proc() -> i32 {

    return i32(len(current_scene.menu))

}

@(export)

get_current_scene_choices_ptr :: proc() -> rawptr {

    return &current_scene.choices

}

@(export)

get_current_scene_choices_len :: proc() -> i32 {

    return i32(len(current_scene.choices))

}

@(export)

get_current_scene_chosen_ptr :: proc() -> rawptr {

    return &current_scene.chosen

}

@(export)

get_current_scene_chosen_len :: proc() -> i32 {

    return i32(len(current_scene.chosen))

}

get_scene :: proc(name: string) -> (bool, Scene) {
    switch name {
    case "some_test_scene":
        return true, Scene{name=name, cursor=""}
    }
    return false, Scene{}
}
next_in_scene :: proc() {
    switch current_scene.name {
    case "some_test_scene":
        if current_scene.cursor == "" {
            current_scene.dialogue = "Hello from someone"
            // TODO: Set game mode to 'IN_DIALOGUE'
            current_scene.cursor = "continue"
        } else if current_scene.cursor == "continue" {
            // TODO: Set game mode to 'WAITING PLAYER DIALOGUE'
            if last_key_pressed == "a" || last_key_pressed == "b" {
                current_scene.cursor = "confirm"
                // Reset last key pressed
                last_key_pressed = ""
            }
        } else if current_scene.cursor == "confirm" {
            // TODO: Set game mode to 'WAITING PLAYER CONFIRMATION'
            if last_key_pressed == "a" {
                current_scene.cursor = "fini"
                // Reset last key pressed
                last_key_pressed = ""
            }
        } else if current_scene.cursor == "fini" {
            current_scene = Scene{}
            // TODO: Set game mode to 'IN GAME'
        }
    case "in_inventory_menu":
        if current_scene.cursor == "" {
            current_scene.menu = "inventory"
            current_scene.cursor = "menu"
        } else if current_scene.cursor == "menu" {
            if last_key_pressed == "a" {
                // TODO: Some item in inventory was selected
                current_scene.cursor = "selected item"
            } else if last_key_pressed == "b" {
                current_scene = Scene{}
                // TODO: Set game mode to 'IN GAME'
            }
        } else if current_scene.cursor == "selected item" {
            if last_key_pressed == "a" {
                // TODO: User is confirming usage of item?
                current_scene.cursor = "confirm"
            } else if last_key_pressed == "b" {
                current_scene.cursor = "menu"
            }
        } else if current_scene.cursor == "confirm" {
            if last_key_pressed == "a" {
                // TODO: User is using item in posession
                // Go back to previous good step
                current_scene.cursor = "selected item"
            }
        }
    case "in_port_market":
        // TODO: This
        // Hello, welcome to my market, wanna see what I have?
        // No, Yes
        // Yes = get goods / open menu
        // Go back or select a good
        // Would you like to purchase good @ said price?
        // No (haggle), Yes
        // No = How much would you pay for this?
        // - User inputs price
        // - If price meets threshold, say yes
        // - If price does not, let user suggest a different price
        // Yes (or after haggle) = how many lots do you want to buy?
        // - User inputs # of lots
        // Which ship should I put these into?
        // - User chooses ship
        // - Check that the ship has the cargo space, if not, "This ship doesn't have the cargo space", user presses button, back to ship select
        // Confirm you want to buy X for Y per lot into Z ship?
        // - User confirms
        // If confirmation then add lots of type {good} into {ship} cargo
    case "in_port_bank":
        current_scene.choices[0] = "withdraw"
        current_scene.choices[1] = "deposit"
        current_scene.choices[2] = "cancel"
        // TODO: This
        // Welcome to bank. Your balance is {XXXXXXX}. How can I be of service?
        // Deposit, Withdraw
        // If Deposit
        // How much?
        // - User enters how much
        // - Cannot exceed what they have on their person, if it does, warn them, then go back to input
        // If Withdraw
        // - User enters how much
        // - Cannot exceed account balance, if it does, warn them, then go back ot input
        scene_clear_choices()
    }
}


last_key_pressed: string
last_number_input: i32
last_string_input: string
accepting_input: bool
user_input_a :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "a"
    }
}
user_input_b :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "b"
    }
}
user_input_x :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "x"
    }
}
user_input_y :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "y"
    }
}
user_input_start :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "start"
    }
}
user_input_select :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "select"
    }
}
user_input_right_bumper :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "right bumper"
    }
}
user_input_up :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "up"
    }
}
user_input_down :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "down"
    }
}
user_input_left :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "left"
    }
}
user_input_number :: proc(number: i32, force: bool = false) {
    if accepting_input || force {
        last_number_input = number
    }
}
user_input_string :: proc(string: string, force: bool = false) {
    if accepting_input || force {
        last_string_input = string
    }
}


GameMode :: enum i32 {
    Empty,
    In_Scene,
    In_Ocean_Battle,
    Opening_Title,
    In_Port,
    In_Ocean,
    New_Load_Options_Menu,
    New_Menu,
    Load_Menu,
    Options_Menu,
    New_Character_Menu,
    On_Land,
}
current_game_mode: GameMode


@(export)
test_something :: proc() {
    console_log("Running a test")
    load_world("world_one")
    load_world("world_one")
}


tick :: proc () {}

