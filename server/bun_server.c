#include "../c/wasm_game.h"

// Match the exact signatures from wasm_game.h
void js_console_log(void* ptr, u32 len)
{
    char* str = (char*)ptr;
    printf("js console log: %.*s\n", len, str);
}

void js_output_string_buffer(void* ptr, uint32_t len)
{
    char* str = (char*)ptr;
    printf("js output string buffer: %.*s\n", len, str);
}

void js_output_array_buffer(void* ptr, uint32_t len)
{
    uint32_t* arr = (uint32_t*)ptr;
    printf("js output array buffer: ");
    for (uint32_t i = 0; i < len; i++) {
        printf("%u ", arr[i]);
    }
    printf("\n");
}