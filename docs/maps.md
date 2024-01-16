# Maps

This is like game maps. Cities, world, etc...

## Area

``` javascript
{
    width: 20,
    height: 20,
    tiles: [[], []] // where tiles.length will be map.width and then each entry will be map.height long, each one referencing a tile
}
```

## Tiles

``` json
{
    "name": "tile-grass",
    "image": 32, // reference to image I guess
    // Below should actually go into the map.tiles array but defaults can be taken from here
    "interactable": false,
    "interaction": {
        "id": 32, // reference to script
        "onOver": true, // when you step on this
        "onInteract": true, // when you click or interact with this (but are beside it or on it)
    },
    "wall": true, // cannot pass through or on this
}
```