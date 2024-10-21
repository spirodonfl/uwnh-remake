package game

import "../common"
import "../js"

current_string_to_read: string
current_string_to_read_as_u8: []u8
@(export)
get_ptr_to_string :: proc() -> rawptr {
    current_string_to_read = "Poops in my pants"
    current_string_to_read_as_u8 = transmute([]u8)current_string_to_read
    return &current_string_to_read_as_u8[0] if len(current_string_to_read) > 0 else nil
}
@(export)
get_len_of_string :: proc() -> i32 {
    return i32(len(current_string_to_read))
}

default_context :: proc "contextless" () -> runtime.Context {
    context = runtime.default_context()
    context.allocator = runtime.default_wasm_allocator()
    return context
}

// Note: Variadic procedures do NOT work properly in WASM mode. Weird issues of values not being retained
aresult: i32 = 0
tresult: []i32
@(export)
test_variadic_proc :: proc(test: i32, nums: ..i32) -> i32 {
    for n, i in nums {
        js.console_log("n %d %d", n, i)
        js.console_log("o %d %d", nums[n], nums[i])
        js.console_log("a", nums)
        aresult += nums[i]
    }
    // Apparently variadic procedures can create a variable array length which you can then use?
    tresult = nums
    js.console_log("len: %d", len(tresult))
    tresult[0] = 33
    tresult[1] = 34
    tresult[2] = 35
    js.console_log("0: %d", tresult[0])
    js.console_log("1: %d", tresult[1])
    return aresult
}
@(export)
get_variadic_ptr :: proc() -> i32 {
    js.console_log("0: %d", tresult[0])
    return tresult[0]
}


// Note: This works
test_using_one :: proc(entity: ^SomeRandoStruct) {
    using entity.position
    js.console_log("%d %d", x, y)
}


// TODO: Test array programming (simd) on structs. Arrays seem to work
// Vector3 :: [3]f32
// a := Vector3{1, 4, 9}
// b := Vector3{2, 4, 8}
// c := a + b  // {3, 8, 17}
// d := a * b  // {2, 16, 72}
// e := c != d // true


// Procedure overload test
// Note: Works internally but not for export
// bool_to_i32 :: proc(b: bool) -> i32 {
//     if b {
//         return 99
//     }
//     return 98
// }
// int_to_i32  :: proc(i: i32) -> i32 {
//     return i + 1
// }
// @(export)
// to_i32 :: proc{bool_to_i32, int_to_i32}


Vector3 :: struct {
    x, y, z: f32,
}
Quaternion :: distinct quaternion128
// Note: Frog can inherit from SomeRandoEntity
SomeRandoEntity :: struct {
    id:          u64,
    name:        string,
    position:    Vector3,
    orientation: Quaternion,

    derived: any,
}
Frog :: struct {
    using entity: SomeRandoEntity,
    jump_height:  f32,
}


// NOTE: Does not work in WASM mode
@(init)
init_automatic :: proc() {
    js.console_log("Automatically run")
}


// NOTE: This now works with #no_bounds_check but this is not ideal and can sometimes cause memory issues. Better to use static sizes
import "core:mem"
import "base:runtime"
// darray: [dynamic]i32
// darray: []i32
some_n: i32 = 40
darray := make([]i32, some_n)
@(export, link_name="testArrayAppend")
test_array_append :: proc() #no_bounds_check {
    // darray = make([dynamic]i32, 40)
    // some_n: int = 40
    // darray = make([]i32, some_n)
    // darray[0] = 33
    // darray[39] = 40
    // js.console_log("length of test array %d", i32(len(darray)))
    // cleanup in a seperate function: delete(darray)
}
@(export)
use_array :: proc() -> i32 {
    #no_bounds_check darray[0] = 33
    #no_bounds_check return darray[40]
}
@(export)
allocate_new_array :: proc(size: i32) -> rawptr {
    new_array := make([]int, int(size))
    defer delete(new_array)
    #no_bounds_check return &new_array[0]
}
@(export)
copy_array_data :: proc(dest: rawptr, src: rawptr, size: i32) {
    mem.copy(dest, src, size_of(int) * int(size))
}
@(export)
get_array_element :: proc(arr: rawptr, index: i32) -> i32 {
    return (^[^]i32)(arr)[index]
}
@(export)
set_array_element :: proc(arr: rawptr, index: i32, value: i32) {
    (^[^]i32)(arr)[index] = value
}
// Note: This always outputs zero. The fact this doesn't work as I expect is so frustrating and it makes me not want to use dynamic memory sizing at all
@(export)
get_array_length :: proc() -> i32 {
    js.console_log("Test One %d %d", len(darray), 33)
    js.console_log("Test Two %d", size_of(darray))
    return i32(len(darray))
}


// THIS WORKS FOR ARRAYS!
test_one_array: [7]i32
// Note: []i32 and [dynamic]i32 are effectively the same thing
test_three_array: [dynamic]i32
test_three_array_length: i32 = 0
@(export)
test_initialize_test_arrays :: proc() {
    test_one_array[0] = 11
    test_one_array[1] = 22
    context = default_context()
    test_three_array = make([dynamic]i32, context.allocator)
    defer delete(test_three_array)
    // Note: Making the variable here doesn't seem to work. Maybe it's short lived within function scope and that's why?
    // #no_bounds_check {
    //    js.console_log("pre-init-check %d", test_three_array[0])
        // append_to_array(&inner_array, &test_three_array_length, 36)
        // append_to_array(&inner_array, &test_three_array_length, 37)
        // append_to_array(&inner_array, &test_three_array_length, 38)
        // append_to_array(&inner_array, &test_three_array_length, 39)
        // append_to_array(&inner_array, &test_three_array_length, 40)
        append(&test_three_array, 36)
        append(&test_three_array, 37)
        append(&test_three_array, 38)
        append(&test_three_array, 39)
        append(&test_three_array, 40)
        js.console_log("test length: %d", len(test_three_array))
        js.console_log("test value at 0: %d", test_three_array[0])
    //}
}
@(export)
append_to_array :: proc(the_array: ^$T, the_array_cursor: ^i32, value: i32) {
    #no_bounds_check {
        the_array[the_array_cursor^] = value
        the_array_cursor^ += 1
    }
}
@(export)
reset_test_array_three :: proc() {
    context = runtime.default_context()
    js.console_log("test length 2: %d", len(test_three_array))
    // free(&test_three_array)
    // free_all()
    // delete(test_three_array)
    free_all(context.allocator)
    // THIS WORKS
    test_three_array = make([dynamic]i32, context.allocator)
    js.console_log("test length 2: %d", len(test_three_array))
    // reset_an_array(&test_three_array)
}
reset_an_array :: proc(the_array: ^$T) {
    #no_bounds_check {
        // free(the_array) // Note: does not truly work ??
        delete(the_array^) // Note: This might work by deleting the backing memory but the array values still exist somewhere
        the_array^ = new_array
        the_array^ = make([dynamic]i32)
        // x: i32 = 0
        // for x <= test_three_array_length {
        //     // the_array[x] = -1
        //     the_array[x] = 0
        //     x += 1
        // }
    }
}
@(export)
test_get_length_of_test_array_one :: proc() -> i32 {
    return i32(len(test_one_array))
}
@(export)
test_get_length_of_test_array_three :: proc() -> i32 {
    return test_three_array_length
}
@(export)
test_get_pointer_to_test_array_three :: proc() -> rawptr {
    #no_bounds_check {
        return &test_three_array[0]
    }
}
@(export)
test_get_index_value_of_test_array_three :: proc(index: i32) -> i32 {
    #no_bounds_check {
        return test_three_array[index]
    }
}
@(export)
test_delete_index_value_of_test_array_three :: proc(index: i32) {
    #no_bounds_check {
        test_three_array[index] = -1
    }
}



SomeRandoStruct :: struct {
    hp: i32 "tagged field to do potential code generation with",
    position: struct {
        x: i32,
        y: i32,
    },
    name: string,
    name_as_u8: []u8
}
EMPTY_STRUCT := SomeRandoStruct{
    hp = -1,
    position = {x = -1, y = -1},
    name = "",
}
update_name_as_u8 :: proc(s: ^SomeRandoStruct) {
    s.name_as_u8 = transmute([]u8)s.name
}
rando_structs: [10]SomeRandoStruct
@(export)
test_init_structs :: proc() {
    rando_structs[0] = SomeRandoStruct{
        hp = 98,
        position = {x = 99, y = 3},
        name = "super duper"
    }
    rando_structs[1] = SomeRandoStruct{
        hp = 101,
        position = {x = 102, y = 110},
        name = "super duper"
    }
    js.console_log("length of structs %d", i32(len(rando_structs)))
    update_name_as_u8(&rando_structs[0])
    update_name_as_u8(&rando_structs[1])
    rando_structs[0] = EMPTY_STRUCT
    js.console_log("length of structs %d", i32(len(rando_structs)))
}
@(export)
test_get_struct_stuff :: proc() -> i32 {
    return rando_structs[1].position.x
}
@(export)
test_get_struct_string :: proc() -> rawptr {
    #no_bounds_check return &rando_structs[1].name_as_u8[0]
}
@(export)
test_get_struct_string_length :: proc() -> i32 {
    return i32(len(rando_structs[0].name_as_u8))
}



// Arena :: struct {
//     buffer: []byte,
//     offset: uintptr,
// }

// init_arena :: proc(size: int) -> Arena {
//     buffer := make([]byte, size)
//     return Arena{buffer = buffer, offset = 0}
// }

// align_forward :: proc(addr: uintptr, align: uintptr) -> uintptr {
//     return (addr + (align - 1)) & ~(align - 1)
// }

// arena_allocator :: proc(arena: ^Arena, size: int, alignment: int) -> ([]byte, mem.Allocator_Error) {
//     align := uintptr(alignment)
//     aligned_offset := align_forward(arena.offset, align)
//     new_offset := aligned_offset + uintptr(size)

//     if new_offset > uintptr(len(arena.buffer)) {
//         return nil, .Out_Of_Memory
//     }
    
//     result := arena.buffer[aligned_offset:new_offset]
//     arena.offset = new_offset
//     return result, .None
// }

// arena_allocator_proc :: proc(allocator_data: rawptr, mode: mem.Allocator_Mode,
//                              size, alignment: int,
//                              old_memory: rawptr, old_size: int,
//                              location := #caller_location) -> ([]byte, mem.Allocator_Error) {
//     arena := cast(^Arena)allocator_data
//     #partial switch mode {
//     case .Alloc, .Alloc_Non_Zeroed:
//         return arena_allocator(arena, size, alignment)
//     case .Free:
//         return nil, .None
//     case .Free_All:
//         arena.offset = 0
//         return nil, .None
//     case:
//         return nil, .Mode_Not_Implemented
//     }
// }

// create_arena_allocator :: proc(arena: ^Arena) -> mem.Allocator {
//     return mem.Allocator{
//         procedure = arena_allocator_proc,
//         data = arena,
//     }
// }

// import "core:fmt"
// arena: Arena
// structs: []SomeRandoStruct

// @(export)
// init_struct_arena :: proc() -> bool {
//     arena = init_arena(1024 * 1024)  // 1MB arena
//     context.allocator = create_arena_allocator(&arena)
//     return true
// }

// @(export)
// init_structs :: proc "contextless" (count: i32) -> bool {
//     context = runtime.default_context()
//     if count <= 0 do return false

//     structs = make([]SomeRandoStruct, int(count))

//     for i in 0..<int(count) {
//         #no_bounds_check structs[i] = SomeRandoStruct{
//             hp = i32(i * 10),
//             position = {x = i32(i * 2), y = i32(i * 3)},
//             name = fmt.tprintf("Struct %d", i),
//         }
//         // update_name_as_u8(&structs[i])
//     }

//     return true
// }

// @(export)
// get_struct_count :: proc() -> i32 {
//     return i32(len(structs))
// }

// @(export)
// clear_arena :: proc() -> bool {
//     arena.offset = 0
//     structs = nil
//     return true
// }

// @(export)
// get_struct_data :: proc(index: i32) -> (hp: i32, x: i32, y: i32, name_ptr: rawptr, name_len: i32) {
//     if index < 0 || int(index) >= len(structs) {
//         return 0, 0, 0, nil, 0
//     }
//     s := &structs[index]
//     return s.hp, s.position.x, s.position.y, &s.name_as_u8[0], i32(len(s.name_as_u8))
// }


Arena :: struct {
    data:   rawptr,
    offset: uintptr,
    size:   uintptr,
    allocator: mem.Allocator,
}

init_arena :: proc(size: int) -> Arena {
    context = default_context()
    data, _ := mem.alloc(size, 8, context.allocator)
    return Arena{
        data = data,
        offset = 0,
        size = uintptr(size),
        allocator = context.allocator,
    }
}

arena_alloc :: proc(arena: ^Arena, size: int, alignment: int) -> rawptr {
    aligned_offset := (arena.offset + uintptr(alignment) - 1) & ~(uintptr(alignment) - 1)
    if aligned_offset + uintptr(size) > arena.size {
        return nil // Out of memory
    }
    ptr := rawptr(uintptr(arena.data) + aligned_offset)
    arena.offset = aligned_offset + uintptr(size)
    return ptr
}

arena_reset :: proc(arena: ^Arena) {
    arena.offset = 0
}

arena_destroy :: proc(arena: ^Arena) {
    mem.free(arena.data, arena.allocator)
    arena^ = {}
}

arena_allocator :: proc(arena: ^Arena) -> mem.Allocator {
    return mem.Allocator{
        procedure = arena_allocator_proc,
        data = arena,
    }
}

arena_allocator_proc :: proc(allocator_data: rawptr, mode: mem.Allocator_Mode,
                             size, alignment: int,
                             old_memory: rawptr, old_size: int,
                             location := #caller_location) -> ([]byte, mem.Allocator_Error) {
    arena := cast(^Arena)allocator_data
    #partial switch mode {
    case .Alloc, .Alloc_Non_Zeroed:
        ptr := arena_alloc(arena, size, alignment)
        if ptr == nil {
            return nil, .Out_Of_Memory
        }
        return mem.byte_slice(ptr, size), nil
    case .Free:
        return nil, .Mode_Not_Implemented
    case .Free_All:
        arena_reset(arena)
        return nil, nil
    case .Resize, .Resize_Non_Zeroed:
        return nil, .Mode_Not_Implemented
    case .Query_Features:
        set := (^mem.Allocator_Mode_Set)(old_memory)
        if set != nil {
            set^ = {.Alloc, .Alloc_Non_Zeroed, .Free_All}
        }
        return nil, nil
    case .Query_Info:
        return nil, .Mode_Not_Implemented
    }
    return nil, .Mode_Not_Implemented
}

my_arena: Arena
test_arena_array_pointer: ^[dynamic]i32

@(export)
init_my_arena :: proc() {
    my_arena = init_arena(1024 * 1024)  // 1MB arena
}

@(export)
test_arena_allocation :: proc() {
    context.allocator = arena_allocator(&my_arena)
    test_arena_array := make([dynamic]i32)
    append(&test_arena_array, 33)
    js.console_log("test_arena_array %d", test_arena_array[0])
    test_arena_array_pointer = &test_arena_array
}
@(export)
test_arena_index_value :: proc(index: i32) -> i32 {
    return test_arena_array_pointer[index]
}

@(export)
test_arena_free :: proc() {
    arena_reset(&my_arena)
    arena_destroy(&my_arena)
    //free_all(my_arena.allocator)
}


// NOTE: 27384 is the maximum size of an array before wasm throws up an error in the browser
ptr_to_array: ^[27384]i32
ptr_to_second_array: ^[27384]i32
@(export)
test_generating_array_on_the_fly :: proc() -> i32 {
    an_array: [27384]i32
    // Note: Enabling this second array will essentially fail because there's no more space. The first array took it all
    // contextless -> default_context doesn't help
    // an_two_array: [27384]i32
    // Note: This doesn't seem to have much effect on the memory (if any)
    defer delete(an_array[:])
    an_array[0] = 333333
    an_array[1] = 333334
    ptr_to_array = &an_array
    return i32(len(ptr_to_array))
}
@(export)
test_specific_ptr_to_array_after_function_is_done :: proc() -> i32 {
    // an_array: [25000]i32 // Note: This does indeed free up the value but the array _block_ is still there
    return ptr_to_array[0]
}