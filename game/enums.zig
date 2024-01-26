pub const StringsEnum = enum(u16) {
    Hello = 0,
    World = 1,
};

pub const EntitiesEnum = enum(u16) {
    Player = 0,
    Enemy = 1,
    NPC = 2,
};

pub const WorldsEnum = enum(u16) {
    World1 = 0,
    World2 = 1,
};

pub const ScriptsEnum = enum(u16) {
    Script1 = 0,
    Script2 = 1,
};

pub const DiffListEnum = enum(u16) {
    EntityMovement = 0,
    World = 1,
    Collision = 2,
    Viewport = 3,
    EntityUpdate = 4,
};

pub const ReturnEnum = enum(u16) {
    None = 0,
    MissingField = 1,
    InvalidType = 2,
    EmptyArray = 3,
    BlockedCollision = 4,
    InvalidAttackPosition = 5,
    NoMoreHealth = 6,
    AnotherEntityIsThere = 7,
    OutOfBounds = 8,
    OddError = 9,
};
pub const DirectionsEnum = enum(u16) {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3,
};
pub const SoundsEnum = enum(u16) {
    ParticularSong = 0,
    ParticularSound = 1
};

pub const WorldLayersEnum = enum(u16) {
    Base = 0,
    Collision = 1,
    Entities = 2,
};

pub const Components = enum(u16) {
    Health = 0,
    Movement = 0,
    // ...
};
