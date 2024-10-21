# The Actual Game Code

## Console Logging In Javascript?

WASM is a very simplified set of instructions which don't really interact with JS directly. Unless you add inter-connectivity, so to speak.

It's handy, for debugging, to have console logging available. Ideally, the WASM code can console.log out to JS. You can view what's going on in you WASM by opening up the Chrome inspector tools and watching the output.

We start by allowing our build command to accept a special flag that will enable this logging functionality.

<!-- lit block js_console_log_config -->
``` c
USE_JS :: #config(USE_JS, false)
```
<!-- lit end_block -->

Now we can use `-define:USE_JS=true` in our build command. Example: `odin build -define:USE_JS=true` and our console logging ability will be added to the WASM side.

With that available, we now have to define what the foreign JS call is going to look like. We will essentially map a WASM function to console.log output. To do that, we'll first specify the WASM function that we make available.

<!-- lit block js_console_log_foreign_env -->
``` c
foreign env {
    js_console_log :: proc(ptr: rawptr, len: i32) ---
}
```
<!-- lit end_block -->

You'll note that we pass a rawptr (raw pointer) which, in our case, is essentially a memory address value to the string we're going to console log. We also pass the length of the string. This tell Javascript where to start reading from the wasm memory and for how long to read the memory.

Next we define the usage, very specifically, of `console_log`. We setup a buffer of 4096 individual u8 characters, since strings are represented as u8 characters in raw form. We can then either use a binary print (bprintf) to pass the message and the length to `js_console_log` or, if we're in "normal" / "non-js" mode, we can just print using the normal `fmt` (format) calls for Odin.

<!-- lit block js_console_log -->
``` c
import "core:fmt"

{{{ js_console_log_config }}}

when USE_JS {
    foreign import env "env"

    @(default_calling_convention="contextless")
    {{{ js_console_log_foreign_env }}}

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
```
<!-- lit end_block -->

To use this on the JS side, you would want to map the JS functionality to this `foreign` functionality in WASM.

``` js
const importObject = {
    env: {
        js_console_log: function(ptr, len) {
            const bytes = new Uint8Array(wasm.exports.memory.buffer, ptr, len)
            const message = new TextDecoder('utf-8').decode(bytes)
            console.log(message)
        }
    }
}

fetch('odin.game.wasm')
    .then(function(response) { return response.arrayBuffer() })
    .then(function(bytes) { return WebAssembly.instantiate(bytes, importObject) })
    .then(function(results) {
        var instance = results.instance
        wasm = instance
        // ... MORE STUFF HERE ... //
    })
```

You can see how the `env` object maps `js_console_log` to the `foreign` function in WASM so that WASM can call out to the javascript function. The javascript function then reaches into the wasm memory directly, starting at the ptr (or rawptr) memory address, reads up to a certain length and then decodes the string.

## NPCs

NPCs will have a name which will be stored in `string` format. It's the default format Odin handles strings and it gives us some internal WASM/Odin capabilities we can use. However, when we export the string to JS, we will have to convert it to []u8 since JS & WASM basically operate on "binary" or raw data format. We can deal with that later.

An NPC will live in some x/y space on the world so we can store that.

We also know that we probably only need a maximum of 1000 npcs in any given world so we'll statically set that amount right now in a variable that holds an array of NPCs for us. This is similar to an Arena but more specialized and controlled.

The `fleet` attribute will be used to store the index of the fleet that the NPC owns (if any).

<!-- lit block npc_functionality -->
``` c
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

{{{ get_npc_fleet }}}

{{{ npc_functions}}}
```
<!-- lit end_block -->

Ultimately, there are two type of movement. There is "auto" movement on the ocean which is really the wind carrying the boat automatically in the direction the player or captain has pointed it at. The other is enforced movement where the player/npc are being moved either by their own automatic actions or by user input.

In all cases, we want to check for a block. Blocks can come in three forms. One is an entity that is blockable. One is an entry of greater than 0 in the "block" layer of the world. One is another entity already in the intended position of the movement. There is only *one* case where we don't check for and that's when we pass an `override_block` flag to the function as `true`.
<!-- lit block move_npc -->
``` c
are_coordinates_blocked :: proc(x: i32, y: i32) -> bool {
    for i = 0; i < MAX_WORLD_NPCS; i += 1 {
        if world_npcs[i].position.x == x && world_npcs[i].position.y == y {
            return true
        }
    }
    
    if get_world_layer_coordinate_value("block", x, y) > 0 {
        return true
    }

    return false
}
move_npc_left :: proc(npc: NPC, override_block: bool = false) {
    if override_block {
        npc.position.x -= 1
    } else {
        intended_position := npc.position
        intended_position.x -= 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) {
            npc.position.x -= 1
        }
    }
}
move_npc_right :: proc(npc: NPC, override_block: bool = false) {
    if override_block {
        npc.position.x += 1
    } else {
        intended_position := npc.position
        intended_position.x += 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) {
            npc.position.x += 1
        }
    }
}
move_npc_down :: proc(npc: NPC, override_block: bool = false) {
    if override_block {
        npc.position.y += 1
    } else {
        intended_position := npc.position
        intended_position.y += 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) {
            npc.position.y += 1
        }
    }
}
move_npc_up :: proc(npc: NPC, override_block: bool = false) {
    if override_block {
        npc.position.y -= 1
    } else {
        intended_position := npc.position
        intended_position.y -= 1
        if !are_coordinates_blocked(intended_position.x, intended_position.y) {
            npc.position.y -= 1
        }
    }
}
move_npc_to_coordinates :: proc(npc: NPC, x: i32, y: i32, override_block: bool = false) {
    if override_block {
        npc.position.x = x
        npc.position.y = y
    } else {
        intended_position := npc.position
        intended_position.x = x
        intended_position.y = y
        if !are_coordinates_blocked(intended_position.x, intended_position.y) {
            npc.position.x = x
            npc.position.y = y
        }
    }
}
```
<!-- lit end_block -->

## Worlds

A world will be composed of at least one layer. We cover that with the `world_layers` array.

Worlds can also hold NPCs but we cover that by using the `world_npcs` array.

Width and height are simply represented by i32 values.

The `total_layers` attribute comes in handy when we allocate a maximum of 50 (or however many) available layers in an array (memory pool) of layers but want to narrow down our scope to only search through the total number of layers in the world (say 10) so we don't do a search on all 5o (or however many) all the time.

<!-- lit block world_struct -->
``` c
World :: struct {
    name: string,
    width, height: i32,
    total_layers: i32,
}
```
<!-- lit end_block -->

## Layers

<!-- lit block layer_functions -->
``` c
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
```
<!-- lit end_block -->
TODO: I'm not sure how much I like the above. It seems a bit odd to double up via the layer name like that when you could *possibly* combine it into a single call. Something to consider.

Layers have types, which we use an `enum` to pick from.
<!-- lit block layer_type_struct -->
``` c
LayerType :: enum i32 {
    Background,
    Foreground,
    NPC,
    Entity,
    Block,
    Other,
}
```
<!-- lit end_block -->

A layer has a name and a type, simply.
<!-- lit block layer_struct -->
``` c
Layer :: struct {
    name: string,
    type: LayerType,
}
```
<!-- lit end_block -->

We know the most number of layers a world will have is 50 and that's pretty generous so we setup an array for that.
<!-- lit block max_layers -->
``` c
MAX_WORLD_LAYERS : i32 : 50
world_layers: [MAX_WORLD_LAYERS]Layer
```
<!-- lit end_block -->

We also want a way for anything outside the wasm world to be able to get the integer ID of a given layer type so that it can be used elsewhere since we are relying on zero strings being passed into wasm from the outside world. We thus have functions so we can specifically ask for the i32 value of a given LayerType enum.
<!-- lit block layer_enum_functions -->
``` c
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
```
<!-- lit end_block -->

## Setting up worlds

We will use a function that will simply take a world name as input and setup the world dynamically according to our games needs.

<!-- lit block load_world -->
``` c
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
```
<!-- lit end_block -->

Before loading a new world, we need a way to empty any current world, so we have a function for that
<!-- lit block empty_world -->
``` c
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
```
<!-- lit end_block -->

## A note about wasm32 freestanding (w/ Odin)

In freestanding, you're asking for full and total control. That means that, by default, the memory allocator is nil / null since the assumption is that you will manage memory yourself. In case you need a quick way to use Odins default memory allocation, they have a wasm capable one ready to go.

``` c
default_context :: proc "contextless" () -> runtime.Context {
    context = runtime.default_context()
    context.allocator = runtime.default_wasm_allocator()
    return context
}
```

So far we've been using fixed size arrays which means we don't truly need this but, if you did, you would use it like so:

``` c
some_function :: proc "contextless" () {
    context = default_context()
    some_array = make([dynamic]i32, context.allocator)
    defer delete(some_array)
    append(&some_array, 36)
}
```

## Viewport & Camera

Since this is a top-down, 2d game, we essentially deal with matrices for worlds and their layers. As such, our renderer can benefit from *some* WASM based functionality to render the game while still maintaining artistic control. In other words, our rendering engine can be separate from the WASM game code but it can ask the game what belongs in any given matrix / grid coordinate of the currently loaded world, peircing through any given layer (or all layers) where it needs. This allows the game to rapidly determine world / location based data for the renderer to consume.

<!-- lit block exported_world_functions -->
``` c
@(export)
get_current_world_height :: proc() -> i32 {
    return current_world.height
}

@(export)
get_current_world_width :: proc() -> i32 {
    return current_world.width
}
```
<!-- lit end_block -->

Our rendering mechanism (whatever it is) needs to know when it should redraw the entire viewport, a portion of the viewport, a layer in the viewport or something else. We can mostly let WASM manage this because WASM will know when a relevant part of the game has been updated. Therefore, we'll store an enum to indicate various re-draw "triggers" and an exportable function so that our renderer can check this.
<!-- lit block should_redraw -->
``` c
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
```
<!-- lit end_block -->

We want to have an exported function so our external renderer can set the viewport size. WASM doesn't care what this is. The renderer does. So it should be set by the renderer.

<!-- lit block base_viewport_functionality -->
``` c
viewport_width: i32 = 8
viewport_height: i32 = 8

@(export)
set_viewport_size :: proc(width: i32, height: i32) {
    viewport_width = width
    viewport_height = height
}
```
<!-- lit end_block -->

<!-- lit block camera_functionality -->
``` c
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
```
<!-- lit end_block -->

Our renderer (whatever it is) will sometimes need to pierce through the viewport (aka: the map) and reach into a specific layer to do things like re-drawing or special rendering. We also need to get the index of the layer which maps to `world_layers` array.
<!-- lit block additional_viewport_functionality -->
``` c
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
```
<!-- lit end_block -->

When our renderer needs to render things it will do so by requesting the value of a given coordinate in the world at a given layer. We account for viewport padding, offset and camera offset so we can determine where in the world we are in relationg to what the renderer is rendering in the viewport right now.
<!-- lit block get_viewport_value_at_coordinates -->
``` c
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
```
<!-- lit end_block -->

We need to do a few things with distance checks. We want to know if a map coordinate is in the viewport (renderers will sometimes use this), we want to know if a map coordinate is halfway of the viewport (we use this for camera movements), we want to know if map coordinates are blocked, we want to know if a given coordinate is in range of another coordinate and a distance function to make this calculation.
<!-- lit block viewport_distances -->
``` c
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
```
<!-- lit end_block -->

## Memory Allocation Note

Ideally, the only memory allocation you need to do is to create statically defined pools or "blocks" to store memory. The most minimal form I can think of right now is simply an array of pointers, structs or values that jump to indices in other arrays. We will have to test allocating and de-allocating (or zeroing out) the arrays.

In order to store game data without embedding it or using the RAM / memory for hard storage, we would have to have functions that return game data in linear(?) fashion, almost as if the game data was stored in a file.

## NPCs

For this game, an NPC is mostly restricted to a character in the game that can move around (or not), have an interaction which the player triggers (or not), or be part of the players "crew".

Captains are essentially "player level" characters and one of them is, indeed a player. There could even be other players (multi-player) who are part of the world too. We will always reserve 10 spots (1 for the main player and 9 for others) to join the game at any time. This is a future addition.
<!-- lit block npc_functions -->
``` c
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
```
<!-- lit end_block -->

## Ports

Port locations will be static so we just have to make sure we know where in the world it is. We can have a dedicated layer for "ports" on the map/world which the player sails on but, in some cases, we may want to get port information at *any* point in the game so we allow for that with simple functions here. In other functions, we may want to restrict the port information to *only* when the right world is loaded.

<!-- lit block port_struct -->
``` c
Port :: struct {
    name: string,
    location: struct {
        x: i32, y: i32,
    },
}
```
<!-- lit end_block -->
<!-- lit block get_port_function -->
``` c
get_port :: proc(name: string) -> (bool, Port) {
    switch name {
    case "athens":
        return true, Port{name=name}
    }

    return false, Port{}
}
```
<!-- lit end_block -->

A port also has shops, which have goods, and NPCs, which are just identified by world and layers.

## Goods

Any good has a base price and then an adjusted price based on game conditions like investment amount, market fluctuations, etc, which we can calculate later on.
<!-- lit block good_struct -->
``` c
Good :: struct {
    type: ItemType,
    name: string,
    base_price: i32,
    adjusted_price: i32,
}
```
<!-- lit end_block -->

Goods are also technically an item so we assign them an ItemType too.
<!-- lit block good_functions -->
``` c
get_good :: proc(name: string) -> (bool, Good) {
    switch name {
    case "art":
        return true, Good{name=name, base_price=20, adjusted_price=0, type=ItemType.Good}
    }

    return false, Good{}
}
```
<!-- lit end_block -->

## Shops

<!-- lit block shop_struct -->
``` c
Shop :: struct {
    name: string
}
```
<!-- lit end_block -->

<!-- lit block shop_functions -->
``` c
get_shop :: proc(name: string) -> (bool, Shop) {
    switch name {
    case "market":
        return true, Shop{name=name}
    }

    return false, Shop{}
}
```
<!-- lit end_block -->

## Ships

Each ship will have a type and some basic information.

TODO: Determine what base information should go into the Ship struct by default

<!-- lit block ship_struct -->
``` c
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
```
<!-- lit end_block -->

## Entities

General entities don't really have specific use cases. They may be used for "catch all" purposes. Note that nothing inherits from Entity since we treat all entities as their own "thing".

TODO: Determine what basic information belongs to an Entity

TODO: Update Entity interactions to point to a Scene in accordance with the bool triggers

Note: interaction on stepover is to trigger an interaction / scene when the player steps over the entity. This is a *forced* override of all other options. You cannot be blockable and/or interactable AND be a stepover trigger. We make this rule easy to follow by adding a function for it.

<!-- lit block entity_struct -->
``` c
Entity :: struct {
    name: string,
    is_interactable: bool,
    is_blockable: bool,
    interaction_on_stepover: bool,
}

set_entity_to_trigger_interaction_on_stepover :: proc(entity: Entity) {
    entity.interaction_on_stepover = true
    entity.is_blockable = false
    entity.is_interactable = false
}
```
<!-- lit end_block -->

## Player (or Captain)

The player will have the following things as part of their gameplay.

* Inventory - Items
* Inventory - Armor
* Inventory - Weapons
* Fleet - Captains (NPCs)
* Fleet - Ships
* Fleet - Crew
* Stats

### Captains - Inventory

An inventory item is a reference to an item, armor, weapon (or whatever else) along with the number the player currently holds of said item. Note: Some items only allow you to hold one of them (or some other limited amount). The `ItemType` enum is a catch-all which we use for all types of items so we can differentiate them a bit easier.
<!-- lit block inventory_items -->
``` c
InventoryItem :: struct {
    type: ItemType,
    number_held: i32,
}
```
<!-- lit end_block -->

Now we need functions to manage our players inventory. Adding an item to the inventory requires finding an open space.
<!-- lit block inventory_functions -->
``` c
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
```
<!-- lit end_block -->

We also need some simple mechanisms to add and remove gold to a captain / player.
<!-- lit block cash_functions -->
``` c
add_gold :: proc(captain: NPC, amount: i32) {
    captain.gold += amount
}

remove_gold :: proc(captain: NPC, amount: i32) {
    if (captain.gold >= amount) {
        captain.gold -= amount
    }
}
```
<!-- lit end_block -->

### Player - Weapon

A player can only equip one weapon at a time (for now) so it's really easy to store which item, if any, is equipped. We make sure the passed in InventoryItem is of type "Weapon" and then set it to equipped.

<!-- lit block player_weapon -->
``` c
player_weapon_equipped: InventoryItem
set_player_weapon_equipped :: proc(item: InventoryItem) -> InventoryItem {
    if InventoryItem.Type == ItemType.Weapon {
        player_weapon_equipped = InventoryItem
    }

    console_log("Tried to equip an inventory item that was not a weapon")
}
```
<!-- lit end_block -->

### Player - Armor

A player can only equip one armor at a time (for now) so it's really easy to store which item, if any, is equipped. We make sure the passed in InventoryItem is of type "Armor" and then set it to equipped.

<!-- lit block player_armor -->
``` c
player_armor_equipped: InventoryItem
set_player_armor_equipped :: proc(item: InventoryItem) -> InventoryItem {
    if InventoryItem.Type == ItemType.Armor {
        player_armor_equipped = InventoryItem
    }

    console_log("Tried to equip an inventory item that was not armor")
}
```
<!-- lit end_block -->

### Captains - Stats

I will be borrowing a lot of the SNES version of the game.

#### Battle Level
Experience earned by participating in battles. Increases courage, swordsmanship, and damage output in duels.

#### Navigation Level
Experience earned by exploring the ocean and discovering new ports. Increases leadership, seamanship, and knowledge.

#### Leadership
Represents a navigator's ability to lead. Improves sailing, health conditions, and combat skills. Also mitigates effects of storms.

#### Seamanship
Represents a navigator's seafaring proficiency. Improves sailing ability, resulting in more speed for the player's whole fleet.

#### Knowledge
Represents a navigator's respect for knowledge and wisdom. Increases crew resistance to scurvy, allowing them to last longer.

#### Intuition
Represents a navigator's natural instincts. Increases the chances of finding treasure. Also makes discovered villages friendlier.

#### Courage
Represents a navigator's sense of courage. Increases combat abilities, making it a valuable trait for naval battles.

#### Swordsmanship
Represents a navigator's talent in wielding a sword. Increases combat abilities and slightly enhances base attack power in duels.

#### Charm
Represents a navigator's charisma. Helps haggle for better discounts. Also makes hiring crewmen and befriending villagers much easier.

#### Luck
Represents a navigator's personal luck. It fluctuates each time and cannot be viewed by normal means. Helps locate clear springs.

<!-- lit block strats_struct -->
``` c
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
```
<!-- lit end_block -->

### Captains - Skills

Skills are extra features of captains and/or the player so they will be associated to only them. Each one provides additional advantages to the game which are described below.

#### Celestial Navigation
Determines the location of known ports by observing the position of the stars. Enables first mates to auto sail and causes captains to steer ships faster.

Requirements: 70+ Seamanship, 80+ Knowledge, 70+ Intuition

#### Cartography
Any character with this skill can sign a contract with a cartographer to receive sums of gold in exchange for exploring uncharted parts of the world map.

Requirements: 75+ Seamanship, 75+ Knowledge, 75+ Intuition

#### Gunnery
This skill improves a character's proficiency in naval combat, further boosting gun accuracy and normal rush attacks.

Requirements: 75+ Leadership, 65+ Knowledge, 80+ Courage

#### Accounting
An essential skill for bookkeepers, it allows them to discern the best market prices between different ports for additional profit.

Requirements: 90+ Knowledge

#### Negotiation
A social skill used by bookkeepers and commodores. Helps persuade merchants to accept the lowest possible price when purchasing their wares.

Requirements: 80+ Knowledge

<!-- lit block skill_struct -->
``` c
Skill :: struct {
    name: string,
    requirements: Stats,
}
```
<!-- lit end_block -->

<!-- lit block skill_functions -->
``` c
get_skill :: proc(name: string) -> (bool, Skill) {
    switch name {
    case "celestial_navigation":
        return true, Skill{name="Celestial Navigation", requirements=Stats{Seamanship=70, Knowledge=80, Intuition=70}}
    }

    return false, Skill{}
}
```
<!-- lit end_block -->

We associate the skill of a captain / player as an attribute of the NPC struct (especially since players possess NPCs, so to speak).

### Captains - Fleet

A captain/player can only captain one ship at a time. Players being set as captain means removing any NPC captain currently on the ship.

NPCs can also have fleets and essentially can act as automated players so we have to account for that as well. They can have captains under them, specialized ship builds, their own stats, etc...

Reference [here](https://koei.fandom.com/wiki/Uncharted_Waters:_New_Horizons/Ships)

<!-- lit block fleet_struct -->
``` c
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
```
<!-- lit end_block -->

We need a function to get the fleet of an NPC. We error check a lot of things to make sure the fleet exists and that the NPC is the captain of the fleet.
<!-- lit block get_npc_fleet -->
``` c
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
```
<!-- lit end_block -->

## Interactions & Scenes

Scenes are going to do things like load a world / zone / grid, place NPCs & player, move them around, initiate dialogue or carry on dialogue, open menus, ask for input or confirmations and then offload.

Therefore, an interaction is technically a scene. For example, if interacting with a shop owner, the initial dialogue, followed by a menu to buy, sell or leave, followed by the further interactions therein, would all be part of a scene.

It means, in some cases that menus & dialogues have to wait for particular confirmations or input from the user. For example, you may need a player to confirm something so you have to wait for a confirmation "button" to be used. You may need a player to enter text or choose a number in a range. You may simply need a player to press *any* button to keep the interaction going, such as dialogues.

## Scenes

A scene contains a sequence of events so I initially thought of an iteration counter (in i32 form) which you could just jump around to. However, since scenes are internal, I updated the usage to be a string so it's easier to tell what's going on.

Initially you were considering using a "confirmation" and "dialogue" struct with functions but, once you fleshed out the system, you realized that a "scene" encapsulates everything you need in simpler code.

A scene is, essentially, a finite state machine. In our case, it will have a name to reference it by. The cursor is a string which essentially determines the current state of the scene. The `dialogue` is any current dialogue that should be showing depending on the state of the scene. The `menu` attribute tells you if there's a current menu that should be displaying or interacted with. Choices would be any available choices that a player can make given the current state of the scene.
<!-- lit block scene_struct -->
``` c
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
```
<!-- lit end_block -->

We need a way to reach into the struct and return or export the data we need to manage the scene on the rendering side. In order to do that we have to know where the attributes live in memory and the length of the data.
<!-- lit block exported_scene_struct_functions -->
``` c
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
```
<!-- lit end_block -->

<!-- lit block scene_functionality -->
``` c
{{{ scene_struct }}}

{{{ exported_scene_struct_functions }}}

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
```
<!-- lit end_block -->

We need a way to clear choices when a scene has ended so we'll setup a little helper function for it.

<!-- lit block scene_clear_choices -->
``` c
scene_clear_choices :: proc() {
    for i := 0; i < len(current_scene.choices); i += 1 {
        current_scene.choices[i] = ""
    }
}
```
<!-- lit end_block -->

## User Input

TODO: This

TODO: Are we next to something that we can interact with, did we press the right button for the interaction, then run scene by running "get_scene" first and moving along

<!-- lit block user_input_stuff -->
``` c
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
```
<!-- lit end_block -->

## Items

An item will have a type, a name, a base price and an adjusted price for market conditions. Some items can be "used" or "consumed" for effects. Others are passive. The "use_item" function will handle the usage of items.

<!-- lit block items -->
``` c
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
```
<!-- lit end_block -->

## Weapons

Weapons have a base price, an adjusted price (in case of market impact) and a simple attack number.

<!-- lit block weapon_struct -->
``` c
Weapon :: struct {
    type: ItemType,
    name: string,
    base_price: i32,
    adjusted_price: i32,
    attack: i32,
}
```
<!-- lit end_block -->

<!-- lit block weapon_functions -->
``` c
get_weapon :: proc(name: string) -> (bool, Weapon) {
    switch name {
    case "dagger":
        return true, Weapon{name="Dagger", base_price=400, attack=5, type=ItemType.Weapon}
    }

    return false, Weapon{}
}
```
<!-- lit end_block -->

## Armors

Armors have a base price, an adjusted price (in case of market impact) and a simple defense number.

<!-- lit block armor_struct -->
``` c
Armor :: struct {
    type: ItemType,
    name: string,
    base_price: i32,
    adjusted_price: i32,
    defense: i32,
}
```
<!-- lit end_block -->

<!-- lit block armor_functions -->
``` c
get_armor :: proc(name: string) -> (bool, Armor) {
    switch name {
    case "leather_armor":
        return true, Armor{name="Leather Armor", base_price=1000, defense=10, type=ItemType.Armor}
    }

    return false, Armor{}
}
```
<!-- lit end_block -->

## Tests

<!-- lit block tests -->
``` c
@(export)
test_something :: proc() {
    console_log("Running a test")
    load_world("world_one")
    load_world("world_one")
}
```
<!-- lit end_block -->

## Game Mode

<!-- lit block game_mode -->
``` c
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
```
<!-- lit end_block -->

## Game Options

TODO: What game options should I make available?

## Battles - Ocean

Essentially, in battles, it goes back and forth between the players fleet and the enemies fleet. Allies can exist on the battle too (more than two fleets total). They also get turns.

Each tick should respect the turn and only within a finite state machine where each ship must make a movement and/or an attack.

If a ship moves AND attacks, the turn is automatically ended (so long as its an automated ship from another fleet).

It doesn't matter which order you move or attack. Sometimes you attack first for a long range advantage, then move, or vice versa. Just depends.

You can manually end your turn.

Attacks are ranged or melee.

If you get right up to the captains ship of an opposing fleet you can challenge them to a duel. There is some kind of calculated chance that they will accept (TODO: Figure this out).

During a duel, you will attack with your weapon and defend with your sword. TODO: Figure out what the duel will be. Card based system from original game might not cut it here.

You'll have to load a world that somewhat represents the surroundings of where you were sailing.

TODO: I also don't know if I like this battle ship structure either. Try it first.
``` c
BattleShip :: struct {
    ship: Ship,
    npc_owner: NPC,
    position: struct {
        x, y: i32
    },
}
MAX_FLEETS_IN_OCEAN_BATTLE :: 10
OceanBattleTurnOrder: [MAX_FLEETS_IN_OCEAN_BATTLE * MAX_SHIPS_IN_FLEET]BattleShip
clear_ocean_battle_turn_order :: proc() {
    for i := 0; i < len(OceanBattleTurnOrder); i += 1 {
        OceanBattleTurnOrder[i] = BattleShip{}
    }
}
add_ship_to_ocean_battle :: proc() {
    // TODO: Find empty spot and add battle ship
}
```

## Battles - On Ship

Some battles take place directly on the ship.

TODO: Finish this

## Battles - On Land

Some battles take place on land as you explore the land.

TODO: Finish this

## Bar - Blackjack

In the bar, you can bet your money on blackjack and try your hand to see if you can win.

TODO: Finish this

## Tick (or the game loop)

TODO: Flesh this out

* At any point in game, move global captains around (ports or sailing) and take actions, including ones that could affect markets, move goods around, items / weapons / armor, or more
* During sailing, move any visible fleet (but honestly this could be any global fleet in sailing)
* During battle, turn by turn order of ships that get to go next (more or less)

<!-- lit block tick -->
``` c
tick :: proc () {}
```
<!-- lit end_block -->

# The final output!

<!-- lit output wasm_game.odin -->
``` c
package wasm_game

{{{ js_console_log }}}

{{{ npc_functionality }}}

{{{ world_struct }}}

{{{ layer_type_struct }}}

{{{ layer_struct }}}

{{{ layer_functions }}}

{{{ layer_enum_functions }}}

{{{ should_redraw }}}

{{{ exported_world_functions }}}

{{{ base_viewport_functionality }}}

{{{ additional_viewport_functionality }}}

{{{ get_viewport_value_at_coordinates }}}

{{{ camera_functionality }}}

{{{ viewport_distances }}}

{{{ max_layers }}}

{{{ inventory_items }}}

{{{ items }}}

{{{ load_world }}}

{{{ inventory_functions }}}

{{{ shop_struct }}}

{{{ shop_functions }}}

{{{ empty_world }}}

{{{ port_struct }}}

{{{ get_port_function }}}

{{{ weapon_struct }}}

{{{ weapon_functions }}}

{{{ armor_struct }}}

{{{ armor_functions }}}

{{{ skill_struct }}}

{{{ skill_functions }}}

{{{ strats_struct }}}

{{{ scene_clear_choices }}}

{{{ good_struct }}}

{{{ good_functions }}}

{{{ fleet_struct }}}

{{{ ship_struct }}}

{{{ scene_functionality }}}

{{{ user_input_stuff }}}

{{{ game_mode }}}

{{{ tests }}}

{{{ tick }}}
```
<!-- lit end_output -->