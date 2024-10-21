package common

MAX_MESSAGES :: 100

log_messages: [MAX_MESSAGES]i32

log_count: i32 = 0

Message_Code :: enum i32 {
    EMPTY,
    ERROR_RESERVED_VALUE,
    ERROR_GENERAL,
}

convert_message_code :: proc(code: Message_Code) -> i32 {
    converted := i32(code)
    max := max(i32)
    return max - converted
}

is_value_reserved :: proc(value: i32) -> bool {
    for log_code in Message_Code {
        if convert_message_code(log_code) == value {
            add_log_message(.ERROR_RESERVED_VALUE, true)
        }
    }
    return false
}

@(export)
add_log_message :: proc(message: Message_Code, should_panic: Maybe(bool) = false) {
    if log_count >= MAX_MESSAGES {
        for i in 0..<MAX_MESSAGES-1 {
            log_messages[i] = log_messages[i+1]
        }
        log_count = MAX_MESSAGES - 1
    }

    log_messages[log_count] = convert_message_code(message)
    log_count += 1

    if should_panic.? {
        panic("__PANIC__")
    }
}

@(export)
read_log_message :: proc(index: i32) -> i32 {
    if i32(index) >= log_count {
        add_log_message(.ERROR_RESERVED_VALUE, true)
        return 0
    }

    return log_messages[index]
}

@(export)
clear_all_log_messages :: proc() {
    for i in 0..<MAX_MESSAGES {
        log_messages[i] = 0
    }
    log_count = 0
}