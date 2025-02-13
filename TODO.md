# General

* Need to cleanup battle code in WASM. Some of it is a mess
* Need to randomize placement of islands on dingus land
* Need to sort out placing fleet ships in certain areas of the map
* Add more error codes to scenes like you have in the bank scene
* Grab all game dataviews into wasm and store them globally so you don't have to read them over and over
* Further to above, also auto sort out their name strings (ids and strings)
* In PLAYER.updateData (JS) we have an area where we get a dataview into all the fleet ships of the fleet of the captain. It would be nice to pre-store those in a global array instead of dynamically like that but we have to account for the fact that get_max_fleet_ships would only for a single fleet so we'd have to store max_fleet_ships * fleets so it might actually be best to dynamically generate those on demand. In comparison, think of goods or armor which are consistent across the game and can be long lived or permanent in memory
* The atlas size is an issue. You tried going 12800x12800 to store a bunch of characters and whatnot. Unfortunately it will not work because it's too large for the browser to use when you apply the image over itself for layered approach. You should break it up into different atlas for different purposes to keep the individual image sizes small. It was also causing a lot of lag anyways when it was too large.

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