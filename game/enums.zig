fn EnumHelpers(comptime T: type) type {
    return struct {
        pub fn int(self: T) @typeInfo(T).Enum.tag_type {
            return @intFromEnum(self);
        }
    };
}

pub const StringsEnum = enum(u16) {
    Hello = 0,
    World = 1,
    pub usingnamespace EnumHelpers(@This());
};

pub const EntitiesEnum = enum(u16) {
    Player = 0,
    Enemy = 1,
    NPC = 2,
    pub usingnamespace EnumHelpers(@This());
};

pub const WorldsEnum = enum(u16) {
    World1 = 0,
    World2 = 1,
    pub usingnamespace EnumHelpers(@This());
};

pub const DiffListEnum = enum(u16) {
    EntityMovement = 0,
    World = 1,
    Collision = 2,
    Viewport = 3,
    EntityUpdate = 4,
    pub usingnamespace EnumHelpers(@This());
};

// Note: Returning errors and other debug information
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
    pub usingnamespace EnumHelpers(@This());
};

pub const DirectionsEnum = enum(u16) {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3,
    pub usingnamespace EnumHelpers(@This());
};

pub const WorldLayersEnum = enum(u16) {
    Base = 0,
    Collision = 1,
    Entities = 2,
    pub usingnamespace EnumHelpers(@This());
};

pub const Components = enum(u16) {
    Health = 0,
    Movement = 0,
    pub usingnamespace EnumHelpers(@This());

};

pub const EmbeddedDataType = enum { world, entity };

pub const WorldDataEnum = enum(u16) {
    ID = 0,
    Width = 1,
    Height = 2,
    pub usingnamespace EnumHelpers(@This());
};

pub const EntityDataEnum = enum(u16) {
    ID = 0,
    ComponentHealth = 1,
    ComponentHealthDefaultValue = 2,
    pub usingnamespace EnumHelpers(@This());
};
