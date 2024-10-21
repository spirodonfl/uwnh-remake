package common

read_from_array :: proc(arr: $T/[]$E, index: i32) -> i32 {
    if len(arr) == 0 {
        return 0
    }
    if index < 0 || index > i32(len(arr)) {
        return 0
    }

    return arr[index]
}