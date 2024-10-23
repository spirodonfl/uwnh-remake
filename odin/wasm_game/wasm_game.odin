package wasm_game

import "core:fmt"
import "core:strings"
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


Position :: struct {
    x, y: i32,
}


Direction :: enum {
    Up,
    Down,
    Left,
    Right,
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

    position: Position,

    direction: Direction,

    gold: i32,

    skills: [MAX_CAPTAIN_SKILLS]Skill,

    stats: Stats,

    inventory: [MAX_CAPTAIN_INVENTORY_SPACE]InventoryItem,

    fleet: i32,

    is_active: bool,

    is_interactable: bool,

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

    case "bank_teller":

        return true, NPC{

            name = "Bank Teller",

            type = NPCType.Other,

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

trigger_npc_interaction :: proc(npc: ^NPC) {

    if !npc.is_interactable {

        console_log("Tried to trigger an interaction on a non-interactable NPC")

    }


    if current_world.name == "athens" {

        scene_found, in_port_bank_scene := get_scene("in_port_bank")

        if scene_found {

            current_scene = in_port_bank_scene

            next_in_scene()

        } else {

            console_log("Could not find in_port_bank scene")

        }

    }

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
    for i: i32 = 0; i < len(world_layers); i += 1 {
        layer := world_layers[i]
        if layer.name == name {
            return true, world_layers[i]
        }
    }
    return false, Layer{}
}
// TODO: Write in markdown that this is how we store world / layer data in code instead of in a file (in memory)
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
    case "bg_layer":
        if current_world.name == "athens" {
            if row <= 10 && column <= 10 {
                return 1
            } else {
                return 2
            }
        }
    case "npc_layer":
        for i: i32 = 0; i < MAX_WORLD_NPCS; i += 1 {
            if world_npcs[i].position.x == row && world_npcs[i].position.y == column && world_npcs[i].is_active {
                return i
            }
        }
        return -1
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
@(export)
get_viewport_width :: proc() -> i32 {
    return viewport_width
}
@(export)
get_viewport_height :: proc() -> i32 {
    return viewport_height
}


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
    world_width: i32 = current_world.width
    world_height: i32 = current_world.height
    x_padding: i32 = 0
    y_padding: i32 = 0
    if viewport_width > world_width {
        x_padding = (viewport_width - world_width) / 2
    }
    if viewport_height > world_height {
        y_padding = (viewport_height - world_height) / 2
    }
    x_offset := x - x_padding
    y_offset := y - y_padding
    x_offset += camera_offset_x
    y_offset += camera_offset_y
    if x_offset < 0 || y_offset < 0 || x_offset >= world_width || y_offset >= world_height {
        return -1
    }
    if world_layers[layer_index].name != "" {
        return get_world_layer_coordinate_value(world_layers[layer_index].name, x_offset, y_offset)
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
is_world_coordinate_in_viewport :: proc(x: i32, y: i32) -> bool {
    return x >= camera_offset_x && x < camera_offset_x + viewport_width &&
           y >= camera_offset_y && y < camera_offset_y + viewport_height
}
is_world_coordinate_halfway_of_viewport :: proc(x: i32, y: i32) -> (bool, bool, bool, bool) {
    halfway_x := camera_offset_x + viewport_width / 2
    halfway_y := camera_offset_y + viewport_height / 2
    more_than_halfway_x := x > halfway_x
    more_than_halfway_y := y > halfway_y
    less_than_halfway_x := x < halfway_x
    less_than_halfway_y := y < halfway_y
    return more_than_halfway_x, more_than_halfway_y, less_than_halfway_x, less_than_halfway_y
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


current_world: World
is_world_empty: bool = false
load_world :: proc(name: string) {
    switch name {
        case "athens":
            empty_world()
            current_world = World{name=name, width=100, height=100}
            world_layers[0] = Layer{name="bg_layer", type=LayerType.Background}
            current_world.total_layers += 1
            world_layers[1] = Layer{name="npc_layer", type=LayerType.NPC}
            current_world.total_layers += 1
            npc_found: bool
            player_npc: NPC
            bank_npc: NPC
            npc_found, player_npc = get_npc("spiro")
            if npc_found {
                world_npcs[0] = player_npc
                world_npcs[0].position.x = 0
                world_npcs[0].position.y = 0
                world_npcs[0].is_active = true
            } else {
                console_log("Could not find main player NPC")
            }
            npc_found, bank_npc = get_npc("bank_teller")
            if npc_found {
                world_npcs[1] = bank_npc
                world_npcs[1].position.x = 3
                world_npcs[1].position.y = 3
                world_npcs[1].is_active = true
                world_npcs[1].is_interactable = true
            } else {
                console_log("Could not find bank teller NPC")
            }
            is_world_empty = false
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
                found_good, good := get_good("art")
                if found_good {
                    shop.goods[0] = good
                    shop.goods[0].adjusted_price = 33
                }
            }
            is_world_empty = false
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


MAX_WORLD_SHOP_GOODS :: 100
Shop :: struct {
    name: string,
    goods: [MAX_WORLD_SHOP_GOODS]Good,
}

get_shop :: proc(name: string) -> (bool, Shop) {

    switch name {

    case "market":

        return true, Shop{name="Market"}

    }


    return false, Shop{}

}

MAX_WORLD_SHOPS :: 20

world_shops: [MAX_WORLD_SHOPS]Shop



empty_world :: proc() {
    for i: i32 = 0; i < MAX_WORLD_LAYERS; i += 1 {
        world_layers[i] = Layer{}
    }
    for i: i32 = 0; i < MAX_WORLD_NPCS; i += 1 {
        world_npcs[i] = NPC{}
        world_npcs[i].is_active = false
    }
    for i: i32 = 0; i < MAX_WORLD_SHOPS; i += 1 {
        world_shops[i] = Shop{}
    }
    for i: i32 = 0; i < MAX_WORLD_ENTITIES; i += 1 {
        world_entities[i] = Entity{}
    }
    is_world_empty = true
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


Entity :: struct {
    name: string,
    is_interactable: bool,
    is_blockable: bool,
    interaction_on_stepover: bool,
}
// Note: We pass in a pointer to the entity so we can modify the entity directly
set_entity_to_trigger_interaction_on_stepover :: proc(entity: ^Entity) {
    entity.interaction_on_stepover = true
    entity.is_blockable = false
    entity.is_interactable = false
}
MAX_WORLD_ENTITIES :: 300
world_entities: [MAX_WORLD_ENTITIES]Entity


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
        return true, Good{name="Art", base_price=20, adjusted_price=0, type=ItemType.Good}
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
    days: i32, // Number of days the ship can sail for given current conditions
    durability: i32, // Wears out over time
    load: i32, // Current and max capacity of all objects
}


MAX_SCENE_CHOICES :: 10
Scene :: struct #packed {
    name: string,
    cursor: string,
    dialogue: string,
    menu: string,
    choices: [MAX_SCENE_CHOICES]string,
    chosen: [MAX_SCENE_CHOICES]i32,
}
current_scene: Scene
@(export)
get_max_scene_choices :: proc() -> i32 {
    return MAX_SCENE_CHOICES
}

@(export)

get_current_scene_name_ptr :: proc() -> rawptr {

    return raw_data(current_scene.name)

}

@(export)

get_current_scene_name_len :: proc() -> i8 {

    // console_log("Current scene name is %s", current_scene.name)

    return i8(len(current_scene.name))

}

@(export)

get_current_scene_cursor_ptr :: proc() -> rawptr {

    // console_log("Current scene cursor is %s", current_scene.cursor)

    return raw_data(current_scene.cursor)

}

@(export)

get_current_scene_cursor_len :: proc() -> i8 {

    return i8(len(current_scene.cursor))

}

@(export)

get_current_scene_dialogue_ptr :: proc() -> rawptr {

    // console_log("Current scene dialogue is %s", current_scene.dialogue)

    return raw_data(current_scene.dialogue)

}

@(export)

get_current_scene_dialogue_len :: proc() -> i8 {

    return i8(len(current_scene.dialogue))

}

@(export)

get_current_scene_menu_ptr :: proc() -> rawptr {

    return raw_data(current_scene.menu)

}

@(export)

get_current_scene_menu_len :: proc() -> i8 {

    return i8(len(current_scene.menu))

}

@(export)

get_current_scene_choices_ptr :: proc(which: i32 = 0) -> rawptr {

    // Since each choice is a string, we have to choose which one and the pointer as the locations will differe based on string length

    return raw_data(current_scene.choices[which])

}

@(export)

get_current_scene_choices_len :: proc(which: i32 = 0) -> i8 {

    // Since each choice is a string, we have to choose which one and the length of that string

    return i8(len(current_scene.choices[which]))

}

@(export)

get_current_scene_chosen_ptr :: proc() -> rawptr {

    return &current_scene.chosen[0]

}

@(export)

get_current_scene_chosen_len :: proc() -> i32 {

    return i32(len(current_scene.chosen))

}

get_scene :: proc(name: string) -> (bool, Scene) {
    switch name {
    case "some_test_scene":
        return true, Scene{name=name, cursor=""}
    case "opening_scene":
        return true, Scene{name=name, cursor=""}
    case "in_port_bank":
        return true, Scene{name=name, cursor=""}
    }
    return false, Scene{}
}
next_in_scene :: proc() {
    switch current_scene.name {
    case "opening_scene":
        switch current_scene.cursor {
        case "":
            current_game_mode = GameMode.InScene
            current_scene.name = "opening_scene"
            current_scene.dialogue = "Welcome to the game. What adventures await you? Dare to find out."
            current_scene.cursor = "intro_text"
            accepting_input = true
        case "intro_text":
            current_game_mode = GameMode.InPort
            current_scene = Scene{}
            load_world("athens")
        }
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
        switch current_scene.cursor {
        case "":
            current_game_mode = GameMode.InScene
            current_scene.name = "in_port_bank"
            current_scene.dialogue = "Welcome to the Marco Polo bank. How can I be of service?"
            accepting_input = true
            if last_key_pressed == "a" {
                current_scene.cursor = "show_choices"
                last_key_pressed = ""
            }
        case "show_choices":
            current_scene.menu = "in_port_bank"
            current_scene.dialogue = ""
            current_scene.choices[0] = "withdraw"
            current_scene.choices[1] = "deposit"
            current_scene.choices[2] = "cancel"
            if last_key_pressed == "a" {
                current_scene.cursor = "tell_balance"
                scene_clear_choices()
                last_key_pressed = ""
            }
        case "tell_balance":
            some_number: i32 = 222
            buffer: [32]u8
            SOMECONSTSTRING :: "MUAHAHAHAH " + "%d" + " sdlfjk"
            ns: string = fmt.bprintf(buffer[:], "MUAHAHAHAH " + "%d" + " sdlfjk", some_number)
            current_scene.dialogue = ns
            if last_key_pressed == "b" {
                current_scene = Scene{}
                current_game_mode = GameMode.InPort
                last_key_pressed = ""
            }
            if last_key_pressed == "a" {
                current_scene.cursor = "show_choices"
                last_key_pressed = ""
            }
        case "deposit":
            // TODO: Deposit money
        case "withdraw":
            // TODO: Withdraw money
        }
        // Welcome to bank. Your balance is {XXXXXXX}. How can I be of service?
        // Deposit, Withdraw
        // If Deposit
        // How much?
        // - User enters how much
        // - Cannot exceed what they have on their person, if it does, warn them, then go back to input
        // If Withdraw
        // - User enters how much
        // - Cannot exceed account balance, if it does, warn them, then go back ot input
    }
}


last_key_pressed: string
last_number_input: i32
last_string_input: string
accepting_input: bool
@(export)
user_input_a :: proc(force: bool = false) {
    if accepting_input || force {
        console_log("User pressed A")
        last_key_pressed = "a"
    }
}
@(export)
user_input_b :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "b"
    }
}
@(export)
user_input_x :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "x"
    }
}
@(export)
user_input_y :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "y"
    }
}
@(export)
user_input_start :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "start"
    }
}
@(export)
user_input_select :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "select"
    }
}
@(export)
user_input_right_bumper :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "right bumper"
    }
}
@(export)
user_input_up :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "up"
    }
}
@(export)
user_input_down :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "down"
    }
}
@(export)
user_input_left :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "left"
    }
}
@(export)
user_input_right :: proc(force: bool = false) {
    if accepting_input || force {
        last_key_pressed = "right"
    }
}
@(export)
user_input_number :: proc(number: i32, force: bool = false) {
    if accepting_input || force {
        last_number_input = number
    }
}
@(export)
user_input_string :: proc(string: string, force: bool = false) {
    if accepting_input || force {
        last_string_input = string
    }
}


@(export)
are_coordinates_blocked :: proc(x: i32, y: i32) -> bool {
    for i: i32 = 0; i < MAX_WORLD_NPCS; i += 1 {
        if world_npcs[i].position.x == x && world_npcs[i].position.y == y && world_npcs[i].is_active {
            // TODO: Write up how this will give false positives because empty NPC{} initializations will have a position of (0, 0) and so this will for empty NPCs
            return true
        }
    }

    if get_world_layer_coordinate_value("block", x, y) > 0 {

        return true

    }

    if entity_id := get_world_layer_coordinate_value("entity", x, y); entity_id > 0 {

        if world_entities[entity_id].is_blockable {

            return true

        }

    }

    return false
}
move_npc_left :: proc(npc: ^NPC, override_block: bool = false) {
    if override_block {
        npc.position.x -= 1
    } else {
        intended_position := npc.position
        intended_position.x -= 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) && intended_position.x >= 0 {
            npc.position.x -= 1
        }
    }
    npc.direction = Direction.Left
}
move_npc_right :: proc(npc: ^NPC, override_block: bool = false) {
    if override_block {
        npc.position.x += 1
    } else {
        intended_position := npc.position
        intended_position.x += 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) && intended_position.x < current_world.width {
            npc.position.x += 1
        }
    }
    npc.direction = Direction.Right
}
move_npc_down :: proc(npc: ^NPC, override_block: bool = false) {
    if override_block {
        npc.position.y += 1
    } else {
        intended_position := npc.position
        intended_position.y += 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) && intended_position.y < current_world.height {
            npc.position.y += 1
        }
    }
    npc.direction = Direction.Down
}
move_npc_up :: proc(npc: ^NPC, override_block: bool = false) {
    if override_block {
        npc.position.y -= 1
    } else {
        intended_position := npc.position
        intended_position.y -= 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) && intended_position.y >= 0 {
            npc.position.y -= 1
        }
    }
    npc.direction = Direction.Up
}
move_npc_to_coordinates :: proc(npc: ^NPC, x: i32, y: i32, override_block: bool = false) {
    if override_block {
        npc.position.x = x
        npc.position.y = y
    } else {
        intended_position := npc.position
        intended_position.x = x
        intended_position.y = y
        if !are_coordinates_blocked(intended_position.x, intended_position.y) && intended_position.x >= 0 && intended_position.y >= 0 && intended_position.x < current_world.width && intended_position.y < current_world.height {
            npc.position.x = x
            npc.position.y = y
        }
    }
}


GameMode :: enum i32 {
    Empty,
    InScene,
    InOceanBattle,
    OpeningTitle,
    InPort,
    InOcean,
    NewLoadOptionsMenu,
    NewMenu,
    LoadMenu,
    OptionsMenu,
    NewCharacterMenu,
    OnLand,
}
current_game_mode: GameMode

@(export)

get_current_game_mode :: proc() -> i32 {

    return i32(current_game_mode)

}

set_game_mode_to_new_menu :: proc() -> bool {

    if is_world_empty != false {

        console_log("Attempted to go to the new game menu while world is loaded")

        return false

    }


    if current_game_mode == GameMode.NewLoadOptionsMenu {

        current_game_mode = GameMode.NewMenu

        return true

    }


    console_log("Tried to go to new game menu while not in the right game mode")

    return false

}

set_game_mode_to_new_load_options_menu :: proc() -> bool {

    if current_game_mode == GameMode.OpeningTitle || current_game_mode == GameMode.NewMenu || current_game_mode == GameMode.LoadMenu || current_game_mode == GameMode.OptionsMenu {

        current_game_mode = GameMode.NewLoadOptionsMenu

        return true

    }


    console_log("Tried to go to the new/load/options menu but you were not in the opening title of the game")

    return false

}

set_game_mode_to_opening_title :: proc() -> bool {

    if is_world_empty != false {

        console_log("Attempted to go to the opening title while world is loaded")

        return false

    }


    current_game_mode = GameMode.OpeningTitle

    return true

}

@(export)

get_game_mode_in_empty :: proc() -> i32 {

    return i32(GameMode.Empty)

}

@(export)

get_game_mode_in_opening_title :: proc() -> i32 {

    return i32(GameMode.OpeningTitle)

}

@(export)

get_game_mode_in_new_load_options_menu :: proc() -> i32 {

    return i32(GameMode.NewLoadOptionsMenu)

}

@(export)

get_game_mode_in_new_menu :: proc() -> i32 {

    return i32(GameMode.NewMenu)

}

@(export)

get_game_mode_in_load_menu :: proc() -> i32 {

    return i32(GameMode.LoadMenu)

}

@(export)

get_game_mode_in_options_menu :: proc() -> i32 {

    return i32(GameMode.OptionsMenu)

}

@(export)

get_game_mode_in_new_character_menu :: proc() -> i32 {

    return i32(GameMode.NewCharacterMenu)

}

@(export)

get_game_mode_in_scene :: proc() -> i32 {

    return i32(GameMode.InScene)

}

@(export)

get_game_mode_in_port :: proc() -> i32 {

    return i32(GameMode.InPort)

}



@(export)
test_something :: proc() {
    console_log("Running a test")
    load_world("world_one")
    load_world("world_one")
}


BattleShip :: struct {
    ship: ^Ship,
    npc_owner: ^NPC,
    position: Position,
}
MAX_FLEETS_IN_OCEAN_BATTLE :: 10
OceanBattleTurnOrder: [MAX_FLEETS_IN_OCEAN_BATTLE * MAX_SHIPS_IN_FLEET]BattleShip
clear_ocean_battle_turn_order :: proc() {
    for i := 0; i < len(OceanBattleTurnOrder); i += 1 {
        OceanBattleTurnOrder[i] = BattleShip{}
    }
}
add_ship_to_ocean_battle :: proc(npc: ^NPC, ship: ^Ship) {
    for i: i32 = 0; i < len(OceanBattleTurnOrder); i += 1 {
        if OceanBattleTurnOrder[i].npc_owner.name == "" {
            OceanBattleTurnOrder[i] = BattleShip{ship=ship, npc_owner=npc}
        }
    }
}
clear_ships_from_ocean_battle :: proc() {
    for i: i32 = 0; i < len(OceanBattleTurnOrder); i += 1 {
        OceanBattleTurnOrder[i] = BattleShip{}
    }
}


has_game_started: bool = false

@(export)
tick :: proc () {
    if !has_game_started {
        has_game_started = true
        set_game_mode_to_opening_title()
        accepting_input = true
    } else if current_game_mode == GameMode.OpeningTitle {
        if last_key_pressed == "a" {
            set_game_mode_to_new_load_options_menu()
            last_key_pressed = ""
        }
    } else if current_game_mode == GameMode.NewLoadOptionsMenu {
        if last_key_pressed == "a" {
            set_game_mode_to_new_menu()
            // TODO: Normally we'd go to character selection here but we can skip for now
            last_key_pressed = ""
        }
    } else if current_game_mode == GameMode.NewMenu {
        if last_key_pressed == "a" {
            last_key_pressed = ""
            scene_found, opening_scene := get_scene("opening_scene")
            if scene_found {
                current_scene = opening_scene
                next_in_scene()
            } else {
                console_log("Could not find opening scene")
            }
        }
        if last_key_pressed == "b" {
            set_game_mode_to_new_load_options_menu()
            last_key_pressed = ""
        }
    } else if current_game_mode == GameMode.LoadMenu {
        // TODO: This. You need to choose a save on the rendering side, you will need a function to load the game and then move on
        if last_key_pressed == "b" {
            set_game_mode_to_new_load_options_menu()
            last_key_pressed = ""
        }
    } else if current_game_mode == GameMode.OptionsMenu {
        // TODO: This. Functions for updating the game can be accepted in this state
        if last_key_pressed == "b" {
            set_game_mode_to_new_load_options_menu()
            last_key_pressed = ""
        }
    } else if current_game_mode == GameMode.NewCharacterMenu {
        // TODO: This. You will need a menu to choose your "look", your name, your stats and your starting area / country
    } else if current_game_mode == GameMode.InPort {
        player_moved: bool = false
        if last_key_pressed == "left" {
            // TODO: Remove magic number and actually reference the player NPC
            move_npc_left(&world_npcs[0])
            player_moved = true
            last_key_pressed = ""
        }
        if last_key_pressed == "right" {
            // TODO: Remove magic number and actually reference the player NPC
            move_npc_right(&world_npcs[0])
            player_moved = true
            last_key_pressed = ""
        }
        if last_key_pressed == "up" {
            // TODO: Remove magic number and actually reference the player NPC
            move_npc_up(&world_npcs[0])
            player_moved = true
            last_key_pressed = ""
        }
        if last_key_pressed == "down" {
            // TODO: Remove magic number and actually reference the player NPC
            move_npc_down(&world_npcs[0])
            player_moved = true
            last_key_pressed = ""
        }
        mt_x, mt_y, lt_x, lt_y := is_world_coordinate_halfway_of_viewport(world_npcs[0].position.x, world_npcs[0].position.y)
        if mt_x {
            move_camera_right()
        } else if lt_x && camera_offset_x > 0 {
            move_camera_left()
        }
        if mt_y {
            move_camera_down()
        } else if lt_y && camera_offset_y > 0 {
            move_camera_up()
        }
        // TODO: Check for entity and/or NPC interaction and clean this up
        if last_key_pressed == "a" {
            if world_npcs[0].direction == Direction.Right {
                console_log("GOOD")
                intended_direction_x: i32 = world_npcs[0].position.x + 1
                intended_direction_y: i32 = world_npcs[1].position.y
                if world_npcs[1].position.x == intended_direction_x && world_npcs[1].position.y == intended_direction_y {
                    if world_npcs[1].is_interactable {
                        last_key_pressed = ""
                        trigger_npc_interaction(&world_npcs[1])
                    }
                }
            }
        }
    } else if current_game_mode == GameMode.InScene {
        next_in_scene()
    }
}


@(export)
initialize_game :: proc() {
    current_game_mode = GameMode.Empty
}
