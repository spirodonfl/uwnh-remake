const std = @import("std");

fn EnumHelpers(comptime T: type) type {
    return struct {
        pub fn int(self: T) @typeInfo(T).Enum.tag_type {
            return @intFromEnum(self);
        }
        pub fn length() usize {
            return std.enums.directEnumArrayLen(T, 0);
        }
    };
}

pub const ComponentMovementState = enum(u16) {
    Idle,
    Moving,
    pub usingnamespace EnumHelpers(@This());
};

pub const ComponentMovementEvent = enum(u16) {
    Move,
    Moved,
    pub usingnamespace EnumHelpers(@This());
};

pub const StringsEnum = enum(u16) {
    Hello,
    World,
    pub usingnamespace EnumHelpers(@This());
};

pub const EntityTypesEnum = enum(u16) {
    Player,
    Enemy,
    NPC,
    Kraken,
    MultiPlayer,
    pub usingnamespace EnumHelpers(@This());
};

pub const WorldsEnum = enum(u16) {
    World1,
    World2,
    pub usingnamespace EnumHelpers(@This());
};

pub const DiffListTypesEnum = enum(u16) {
    EntityMovement,
    World,
    Collision,
    Viewport,
    EntityUpdate,
    pub usingnamespace EnumHelpers(@This());
};

// Note: Returning errors and other debug information
pub const ReturnsEnum = enum(u16) {
    None,
    MissingField,
    InvalidType,
    EmptyArray,
    BlockedCollision,
    InvalidAttackPosition,
    NoMoreHealth,
    AnotherEntityIsThere,
    OutOfBounds,
    OddError,
    pub usingnamespace EnumHelpers(@This());
};

pub const DirectionsEnum = enum(u16) {
    Left,
    Right,
    Up,
    Down,
    pub usingnamespace EnumHelpers(@This());
};

pub const ComponentsEnum = enum(u16) {
    Health,
    Movement,
    Attack,
    pub usingnamespace EnumHelpers(@This());
};

pub const EmbeddedDataType = enum { world, entity, world_layer };

pub const WorldDataEnum = enum(u16) {
    ID,
    Width,
    Height,
    TotalLayers,
    EntityLayer,
    CollisionLayer,
    pub usingnamespace EnumHelpers(@This());
};

pub const EntityDataEnum = enum(u16) {
    ID,
    Type,
    IsCollision,
    ComponentHealth,
    ComponentHealthDefaultValue,
    ComponentMovement,
    ComponentAttack,
    pub usingnamespace EnumHelpers(@This());
};

pub const GameMessagesEventsEnum = enum(u16) {
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
    Attack,
    Spawn,
    DeSpawn,
    pub usingnamespace EnumHelpers(@This());
};