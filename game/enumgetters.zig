const enums = @import("enums.zig");

// @wasm
pub fn WorldData_ID() u16 {
    return enums.WorldDataEnum.ID.int();
}

// @wasm
pub fn WorldData_Width() u16 {
    return enums.WorldDataEnum.Width.int();
}

// @wasm
pub fn WorldData_Height() u16 {
    return enums.WorldDataEnum.Height.int();
}

// @wasm
pub fn WorldData_TotalLayers() u16 {
    return enums.WorldDataEnum.TotalLayers.int();
}

// @wasm
pub fn WorldData_EntityLayer() u16 {
    return enums.WorldDataEnum.EntityLayer.int();
}

// @wasm
pub fn WorldData_CollisionLayer() u16 {
    return enums.WorldDataEnum.CollisionLayer.int();
}

// @wasm
pub fn EntityData_ID() u16 {
    return enums.EntityDataEnum.ID.int();
}

// @wasm
pub fn EntityData_Type() u16 {
    return enums.EntityDataEnum.Type.int();
}

// @wasm
pub fn EntityData_IsCollision() u16 {
    return enums.EntityDataEnum.IsCollision.int();
}

// @wasm
pub fn EntityData_ComponentHealth() u16 {
    return enums.EntityDataEnum.ComponentHealth.int();
}

// @wasm
pub fn EntityData_ComponentHealthDefaultValue() u16 {
    return enums.EntityDataEnum.ComponentHealthDefaultValue.int();
}

// @wasm
pub fn EntityData_ComponentMovement() u16 {
    return enums.EntityDataEnum.ComponentMovement.int();
}

// @wasm
pub fn EntityData_ComponentAttack() u16 {
    return enums.EntityDataEnum.ComponentAttack.int();
}

// @wasm
pub fn Directions_Left() u16 {
    return enums.DirectionsEnum.Left.int();
}

// @wasm
pub fn Directions_Right() u16 {
    return enums.DirectionsEnum.Right.int();
}

// @wasm
pub fn Directions_Up() u16 {
    return enums.DirectionsEnum.Up.int();
}

// @wasm
pub fn Directions_Down() u16 {
    return enums.DirectionsEnum.Down.int();
}

// @wasm
pub fn Returns_None() u16 {
    return enums.ReturnsEnum.None.int();
}

// @wasm
pub fn Returns_MissingField() u16 {
    return enums.ReturnsEnum.MissingField.int();
}

// @wasm
pub fn Returns_InvalidType() u16 {
    return enums.ReturnsEnum.InvalidType.int();
}

// @wasm
pub fn Returns_EmptyArray() u16 {
    return enums.ReturnsEnum.EmptyArray.int();
}

// @wasm
pub fn Returns_BlockedCollision() u16 {
    return enums.ReturnsEnum.BlockedCollision.int();
}

// @wasm
pub fn Returns_InvalidAttackPosition() u16 {
    return enums.ReturnsEnum.InvalidAttackPosition.int();
}

// @wasm
pub fn Returns_NoMoreHealth() u16 {
    return enums.ReturnsEnum.NoMoreHealth.int();
}

// @wasm
pub fn Returns_AnotherEntityIsThere() u16 {
    return enums.ReturnsEnum.AnotherEntityIsThere.int();
}

// @wasm
pub fn Returns_OutOfBounds() u16 {
    return enums.ReturnsEnum.OutOfBounds.int();
}

// @wasm
pub fn Returns_OddError() u16 {
    return enums.ReturnsEnum.OddError.int();
}

// @wasm
pub fn Components_Health() u16 {
    return enums.ComponentsEnum.Health.int();
}

// @wasm
pub fn Components_Movement() u16 {
    return enums.ComponentsEnum.Movement.int();
}

// @wasm
pub fn Components_Attack() u16 {
    return enums.ComponentsEnum.Attack.int();
}

// @wasm
pub fn DiffListTypes_EntityMovement() u16 {
    return enums.DiffListTypesEnum.EntityMovement.int();
}

// @wasm
pub fn DiffListTypes_World() u16 {
    return enums.DiffListTypesEnum.World.int();
}

// @wasm
pub fn DiffListTypes_Collision() u16 {
    return enums.DiffListTypesEnum.Collision.int();
}

// @wasm
pub fn DiffListTypes_Viewport() u16 {
    return enums.DiffListTypesEnum.Viewport.int();
}

// @wasm
pub fn DiffListTypes_EntityUpdate() u16 {
    return enums.DiffListTypesEnum.EntityUpdate.int();
}

