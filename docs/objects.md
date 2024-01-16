# Objects

I guess I need to start with housing the structure / data of various objects or entities or whatever in the game so... here we go! It's a ME! MARIO!

YOUR ASS IS MINE!

Items do not have a value, not even a base one. Each commercial point where you can buy/sell will store its own inventory and base value which then has economic supply/trade percentage applied over top.

## Items?

``` json
{
    "name": "weapon-1",
    "type": "weapon",
    "subType": "sword",
    "otherTypes": ["katana", "..."],
    "consumable": false,
    "description": "Awesome weapon from Atlantis",
    "stats": "weapon stats should be injected here",
    "id": "unique ID... for what purpose?",
    "customizations": {
        "hiltColor": "green",
        "color": "blue",
        "..."
    }
}
```

## Weapon

``` json
{
    "stats": {
        "attack": 100,
        "weight": 2,
        "size": 1
    },
    "customizations": {
        "hiltColor": "color"
    }
}
```

## Food

This should be applicable to other cargo types like carpet, cheese etc etc

``` json
{
    "name": "apple-1",
    "type": "food",
    "subType": "fruit",
    "otherTypes": ["cargo"],
    "consumable": true,
    "description": "A red apple",
    "stats": {"weight": 2, "size": 1}, // should actually be a default "food" stats object plus modifiers
    "id": "unique ID... for what purpose?",
    "customizations": {} // should actually be a default "food" customizations object plus modifiers
}
```

## Vehicles

``` json
{
    "name": "Galleon",
    "type": "ship",
    "subType": "galleon",
    "description": "A ship for dudes with massive penises",
    "stats": {}, // default ship stats here + modifiers
}

{
    "name": "Airship Galleon",
    "type": "airship",
    "subType": "galleon",
    "description": "An airship for dudes with massive penises that dwarf already massive peni-i",
    "stats": {}, // default ship stats here + modifiers
}
```

## Player

``` json
{
    "name": "custom name",
    "character_id": 12, // maybe this player takes after a character in our character list? Possibly
    "stats": {}, // base stats + modifiers
    "inventory": []
}
```

## NPC

``` json
{
    "name": "some npc",
    "description": "poop",
    "type": "pirate", // or merchant or whatever
    "stats": {}, // some default stats + modifiers I guess
    "inventory": [] // npcs can have inventory too
}
```

## Characters

I suppose these would playable characters? Characters who can join your crew? Different from NPCs who cannot be part of anything.

``` json
{
    "name": "Teddy R",
    "type": "secondary", // not the main player
    "description": "A dude with a massive penis",
    "stats": {
        "what": "I guess... default player stats?"
    },
    "inventory": [] // yeah probably an array of things
}
```

## Area

``` json
{
    "name": "name of area",
    "type": "village|port|city|town|metropolis|castle",
    "stats": {
        // will be default stats + modifier based on a number of factors like player investment
        "economy": 22, // economy level, can be invested in
        "industy": 18,
        "mostly allied with": "any kingdom/nation"
    }
}
```

## Store

``` json
{
    "name": "name of store",
    "inventory": []
}
```

## Item

Like a lamp or treasure chest I guess

``` json
{
    "name": "treasure chest",
    "type": "relevant?", // not sure
    "interaction": false, // or an ID of an interaction script?
}
```

## Game

The standard game object. I suppose you will need to keep track of a few things.

``` json
{
    "time_of_day": "hh:mm:ss",
    "day": "dd",
    "month": "mm",
    "year": "yyyy",
    "player": {
        "location": "x,y",
        "map": "map reference",
        "player_data": {} // inventory, stats, ships, fleet, money, etc...
    },
    "characters": {}, // say a character is travelling with their ships carrying cargo to India or something
    "areas": {}, // at least names (if customizable), buildings (if customizable), investment state, influence, economic status, store inventory, etc...
}
```

I am probably missing something around "interacted" events or other triggered things that should not be triggered again. Perhaps storing state machine states would do the trick here.