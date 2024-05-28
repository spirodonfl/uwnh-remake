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