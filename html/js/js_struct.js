// -----------------------------------------------------------------
// - STRUCTS
// -----------------------------------------------------------------
// NOTE: This is for future use in case you want to merge this with
// the wasm classes you auto generate or create data structures for
// yourself for something else
function InitStruct(struct)
{
    var s = 0;
    for (var m in struct) { struct[m] = s; ++s; }
}
function StructSomeData()
{
    this.buffer = new Uint32Array(3);
    /*
    NOTE: In the future, could be mixed like this
    this.buffer = new ArrayBuffer(9); // 1 byte (uint8) + 4 bytes (uint32) + 4 bytes (float32)
    this.uint8View = new Uint8Array(this.buffer);
    this.uint32View = new Uint32Array(this.buffer, 4); // Offset 4 for alignment
    this.float32View = new Float32Array(this.buffer, 8); // Offset 8 for alignment
    Usage:
    struct.uint8View[StructScreenData.SOME_ENUM_OR_NAME] = 1;
    */
}
StructSomeData.INITIALIZED = null;
StructSomeData.RENDERED = null;
StructSomeData.LAST_INPUT_MODE = null;
InitStruct(StructSomeData);
var SOME_DATA = new StructSomeData();