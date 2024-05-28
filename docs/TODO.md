# TODO

* Extract functions from game.zig into their own struct
* Rename structs to better match their use cases
* Fix UI based issues on front-end and see if you can merge cleanup branch into main
** Collision issues
** Movements stop after mass multiplayer input
* Finish fully implementing the "Travis Service", subsequently and forever called as such. Rename all references to the the Travis Service
** entity.zig is the crux of this
** The Vroman Compartmentalized Entropy Integration Service
* THEN integrate FSM, export functions, enough to allow for UI based FSM editing

# TODO (maybes uwu?)

* When you look at the move component, you're suddenly realizing something... do you actually need to have multiples of these components? Could you not just overwrite the `parent` and `entity_id` parameters, call the move functions, then release for the next?
** Is it possible for two entities to compete over one component? In a turn based game, no. In a real time game, possibly. Need to think on this more.

# TODO (Turn Based)

* If you have moved or attacked, you cannot move or attack again if it's the same turn
* I guess Kraken needs its own auto-movement unless player is attached? Maybe?
* Turn tracker (record actions taken on each turn) at the game level
* Eventual "auto management" of entities who do not have players controlling them. This is for Twitch
* Allow local host to control all players so you could manually move the gameplay along
* messages.zig and events.zig seems redundant but it's *meant* to be a way for the game to receive general events, pass individual messages to entities that need it, then process the entity messages. Confirm this is actually reasonable.
* Most likely you don't want all entities to be able to take actions in the turn. At least not visibly. Need to think about this. You probably just want entities defined as "player_driven" or not and, if player driven, wait for input, otherwise just automate them... most likely. That way you could attach "player_driven" to any entity on the fly and let the player (or players) take control as necessary