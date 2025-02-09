# General

* Need to cleanup battle code in WASM. Some of it is a mess
* Need to randomize placement of islands on dingus land
* Need to sort out placing fleet ships in certain areas of the map
* X:18 Y:3 for the alpha-d background image you can use over top of background_element when doing valid move/cannon/boarding coord highlights
- background-image: var(--atlas-image), var(--atlas-image)
- background-position: calc(whatever 18*3), calc(background image position)
- will have to update the viewport.outerHTML = updateRender to detect when we're highlighting and do that appropriately

# Animations

renderOceanBattleCannonAttack, renderOceanBattleBoardAttack, renderOceanBattleMove have to be put into requestAnimationFrame instead of setTimeout like they are right now. This will make the animations smoother. The issue with this is that requestAnimationFrame re-renders the entire grid every frame so we can also do other animations like the background and whatnot. Unfortunately this means storing certain data outside of the rendering function so that the renderer can reference it and re-render accordingly.

The `updatedRender` function should essentially read from a list of animations and render them. Ultimately, it must execute independent render functions, not handle the animations itself. This is because the updatedRender function is like a frame loop, not the actual mechanism to make things move.

You would need an array of animation functions and once the animation is complete, it would be removed from the array. How would we do this in javascript?

var animations = [];
animations.push(renderOceanBattleCannonAttack);
animations.push(renderOceanBattleBoardAttack);
animations.push(renderOceanBattleMove);

how do we remove from the array?

animations.splice(animations.indexOf(renderOceanBattleCannonAttack), 1);

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