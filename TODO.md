# General

## BATTLE UI

* You can do move, cannon and boarding all at the same time (in the interface) which is very confusing visually. If you're in one mode, ensure you get out of it before you can enable another mode.
* Actions can be done twice (for npcs and for player) so it's getting very confusing
* You can use the move/board/cannon for npc turns which *might* be confusing. For now, disable it.
* Minimap (the snes version has this, slight overlay over top with dots)
* Sword over top of boardable targets, box/border over top of cannonable targets, then a "reticle" comes up and you select one of the targets (cannon or board) and select it. Reticle starts at your current location
* You should disable buttons once you've done the action (move, cannon, board)
* Hover over ships to get their details
* Top bar with list of ships in order which you can also hover over, with a hotkey to show it or hide, either via the popup (which should have a hotkey) or a hotkey just for that
* Popup (you have this already with the F key) for battle commands which may or may not do subsequent popups but they cannot be full screen or you lose your place in the ocean battle
* Deal with victory condition

# SOON

* When going between worlds, sometimes you get an error with placement of NPCs in the JS side of things because the "shouldUpdate" call doesn't happen on time (too early)
* Find all cases of document.querySelector("ui-ocean-battle") (and similar) and make them shorter in name
* Goods shop selling
* Need to cleanup battle code in WASM. Some of it is a mess
* Need to sort out placing fleet ships in certain areas of the map
* Add more error codes to scenes like you have in the bank scene
* Grab all game dataviews into wasm and store them globally so you don't have to read them over and over
* In PLAYER.updateData (JS) we have an area where we get a dataview into all the fleet ships of the fleet of the captain. It would be nice to pre-store those in a global array instead of dynamically like that but we have to account for the fact that get_max_fleet_ships would only for a single fleet so we'd have to store max_fleet_ships * fleets so it might actually be best to dynamically generate those on demand. In comparison, think of goods or armor which are consistent across the game and can be long lived or permanent in memory
* The atlas size is an issue. You tried going 12800x12800 to store a bunch of characters and whatnot. Unfortunately it will not work because it's too large for the browser to use when you apply the image over itself for layered approach. You should break it up into different atlas for different purposes to keep the individual image sizes small. It was also causing a lot of lag anyways when it was too large.
* Button trigger to show a light display of current time
* In goods shop, you are setting the "number_held" of any good in the inventory to 1 however you may want a mechanic where there are only so many available goods at a port and, when you've bought it all up, it's done for a while (maybe for a month or a week or a day)
* In sailing, around the line here: if (current.game_mode == GAME_MODE_SAILING), you have some inputs to set the ship direction and then the tick function auto moves the ship every tick. You should probaly add some button mechanics. Which ones though?
* Animate idle + walking npcs. Ships are already animated idle but maybe do animated attacks
* Better attack animations + icons for boarding and cannons

# Game Mechanics

* General scene (like an opening scene)
* Guild quests (need to figure out quests first, then guilds, then give them out, track them, complete them, etc...)
* Global captains need to zip around (if not in your fleet)
* - Either sailing or in a port
* - If you are in the same port as them, find them in cafe or inn and talk to them
* Pay crew and captain(s) per month!! or year!!
* - captains can stay in port so you can chat with them at any point in any port. random appearances of limited set of captains in port in case the world is too small to have them all
* rando people can gossip, along with waitress, rando information presented, probably just an array of different information to pick from
* Implement bank dialog
* Implement bank yearly interest rates and stuff now that you have date/time
* Goods shop
* - Investment level should affect goods available and prices
* - Taxes on goods traded
* - Sphere of influence should affect taxes ?
* - Tax free trade license ?

# Future (NOT NOW)

* Library? Reading & donations increase hidden luck score
* Duels -> recycle card based system from original game???
* Autopilot captains -> they can auto sail your fleet to a port (pathfinding)
* Jail -> world/map, houses React pirates. Maybe React pirates are their own faction
* Houses to buy (pre-furnished to start, later on, furniture microtransactions w/ crypto mining for each furniture purchased so Spiro makes boatloads of cash)
* Bulletin boards with messages to other players (post office??)
* "Send" your ships to other players which become AI controlled and help other players
* "Item in a bottle" -> send out an item and random player receives it later

# Animations

The current animations implementation does indeed work and it's blinking fast. Unfortunately, it's ugly to read and I think we can do better. I need to reconsider how I approach it. For now, keep running with it until a much clearer and superior pattern emerges.

# Multiplayer server

Server WASM will run setup phase after adding in all fleets. This includes placement of islands and players. Use WASM ocean battle functions for that.

Ideally, each client (player) is player 0 on their local WASM since that's the way it functions anyways.

You would have to map all five npc players on the server WASM to a client player. Player 0 on server = player 0 client. Player 1 on server = player 1 on client but player 1 on client is their own player 0 and player 0 on server is players 1's player 2.

SERVER
WASM PLAYER 1 = CLIENT PLAYER 1
WASM PLAYER 2 = CLIENT PLAYER 2
etc...

CLIENT
PLAYER 1
- SERVER PLAYER 1 = LOCAL PLAYER 1
- SERVER PLAYER 2 = LOCAL PLAYER 2 (typically automated in single player game)
- SERVER PLAYER 3 = LOCAL PLAYER 3 ...
- etc...

PLAYER 2
- SERVER PLAYER 1 = LOCAL PLAYER 2 (typically automated in single player game)
- SERVER PLAYER 2 = LOCAL PLAYER 1
- SERVER PLAYER 3 = LOCAL PLAYER 3 ...
- etc...

PLAYER 3
- SERVER PLAYER 1 = LOCAL PLAYER 2 (typically automated in single player game)
- SERVER PLAYER 2 = LOCAL PLAYER 3 ...
- SERVER PLAYER 3 = LOCAL PLAYER 1
- etc...

The question now is, how does the server push the state to clients? Well, that's easy. Sockets or SSE solves it. The real question is how do you stop the battle from doing automated things on the client? But wait. Would it even run automatic stuff on the client? We have to figure this out.

Ok figured it out - multiplayer is now a lot easier and the reason is because we re-factored the animations to be mostly JS driven since CSS could not keep up with our calcs and updates on a repeated basis.

This means that you can literally generate the viewport for each individual player, along with their multiplayer menu (a special menu system for multiplayer mode), with SSE and be done.


# FUTURE FUTURE

Software renderer. Blit pixels out. Load on initalize game. Ask for pixels for a *thing*, get pixels out, render to *other thing*

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

# A note on push vs pull in event management on the browser with JS and event listeners

Pull: By avoiding event listeners entirely, you eliminate the risk of memory leaks from forgotten removeEventListener calls. This guarantees resources are freed when they should be, meeting your strict GC requirement. The constant polling cost is predictable and minimal, especially in a game loop already running at 60 FPS. It integrates seamlessly with frame-based logic, avoiding the unpredictable spikes of event-driven callbacks.

Push: Requires flawless listener management. Even a single oversight (e.g., replacing DOM content without cleanup) can trap resources in memory, which you want to avoid at all costs. While it has lower idle CPU usage, frequent events can overwhelm the main thread, potentially causing jank. Managing this (e.g., via debouncing) adds complexity without fully solving the GC issue.

## Tradeoff

The pull method’s main drawback is the frame-delayed responsiveness (e.g., 16ms at 60 FPS). For most 2D games, this is imperceptible, but if your game demands instant reactions, it might feel slightly less snappy. You can mitigate this by running your game loop at a higher frame rate (e.g., 120 FPS reduces the delay to 8ms).

On a regular site (no request animation frame), just use set interval.