package common

import "../js"

EnumEntity :: enum i32 {
    ID,
    Type,
    Direction,
    Interactable,
    InteractableID,
}

EnumInteractionType :: enum i32 {
    None,
    Dialog, // ID would lead to specific dialog id which triggers a dialog box with text
    Menu, // ID would lead to EnumMenuType.bank, EnumMenuType.settings etc...
    Scene, // ID would lead to scene with things like dialogs, confirmations, entries, choices, etc...
}

EnumDirections :: enum i32 {
    North,
    South,
    West,
    East,
}
direction_north :: proc() -> i32 {
    return i32(EnumDirections.North)
}
direction_south :: proc() -> i32 {
    return i32(EnumDirections.South)
}
direction_west :: proc() -> i32 {
    return i32(EnumDirections.West)
}
direction_east :: proc() -> i32 {
    return i32(EnumDirections.East)
}