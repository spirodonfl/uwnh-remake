#include <stdint.h> // for uint32_t

// Define a structure to represent memory blocks
typedef struct {
    uint32_t size; // Size of this block
    uint8_t is_free; // 1 if free, 0 if allocated
    // The actual memory follows this header
} MemoryBlock;

// Pointer to the start of our heap memory
static uint8_t* heap_start = NULL;
static uint32_t heap_size = 0; // Current size of the heap

// Initialize the heap - this would typically be called at program start
void heap_init(uint8_t* memory, uint32_t size) {
    heap_start = memory;
    heap_size = size;
    
    // Initialize the first block as free with full size
    MemoryBlock* first_block = (MemoryBlock*)heap_start;
    first_block->size = size - sizeof(MemoryBlock);
    first_block->is_free = 1;
}

// Simple malloc-like function
void* my_malloc(size_t size) {
    MemoryBlock* current = (MemoryBlock*)heap_start;
    while ((uint8_t*)current < heap_start + heap_size) {
        if (current->is_free && current->size >= size) {
            if (current->size > size + sizeof(MemoryBlock)) {
                // Split the block if it's much larger than requested
                MemoryBlock* next = (MemoryBlock*)((uint8_t*)current + sizeof(MemoryBlock) + size);
                next->size = current->size - size - sizeof(MemoryBlock);
                next->is_free = 1;
                current->size = size;
            }
            current->is_free = 0;
            return (uint8_t*)current + sizeof(MemoryBlock);
        }
        current = (MemoryBlock*)((uint8_t*)current + sizeof(MemoryBlock) + current->size);
    }
    return NULL; // No suitable block found
}

// Free memory
void my_free(void* ptr) {
    if (ptr == NULL) return;
    MemoryBlock* block = (MemoryBlock*)((uint8_t*)ptr - sizeof(MemoryBlock));
    block->is_free = 1;

    // Coalesce adjacent free blocks (simplified)
    MemoryBlock* next = (MemoryBlock*)((uint8_t*)block + sizeof(MemoryBlock) + block->size);
    if ((uint8_t*)next < heap_start + heap_size && next->is_free) {
        block->size += sizeof(MemoryBlock) + next->size;
    }
}

// Custom realloc function
void* my_realloc(void* ptr, size_t new_size) {
    if (ptr == NULL) return my_malloc(new_size);
    if (new_size == 0) {
        my_free(ptr);
        return NULL;
    }

    MemoryBlock* old_block = (MemoryBlock*)((uint8_t*)ptr - sizeof(MemoryBlock));
    if (old_block->size >= new_size) {
        // If the current block has enough space, just return it
        return ptr;
    }

    // If not, allocate new space and move data
    void* new_ptr = my_malloc(new_size);
    if (new_ptr == NULL) return NULL;

    // Copy the content from old to new
    uint32_t copy_size = old_block->size < new_size ? old_block->size : new_size;
    for (uint32_t i = 0; i < copy_size; i++) {
        ((uint8_t*)new_ptr)[i] = ((uint8_t*)ptr)[i];
    }

    // Free old memory
    my_free(ptr);
    return new_ptr;
}

// Example usage in main for testing (you'd need to setup memory for WASM)
// int main() {
//     uint8_t memory[1024]; // Example memory area
//     heap_init(memory, 1024);
//     int* arr = my_malloc(sizeof(int) * 5);
//     arr = my_realloc(arr, sizeof(int) * 10);
//     if(arr) {
//         for(int i = 0; i < 10; i++) arr[i] = i;
//     }
//     my_free(arr);
//     return 0;
// }


// USING SPECIAL STRUCT
typedef struct {
    int* items;  // Now this is a pointer to an array of integers
    int count;   // Number of items currently stored
    int capacity; // Total capacity of the array
} Numbers;

#include <stdint.h>

// Custom realloc function for the Numbers structure
void realloc_numbers(Numbers* num, size_t new_capacity) {
    if (new_capacity < num->count) {
        // If new capacity is less than current count, do nothing or adjust count?
        new_capacity = num->count; // Ensure capacity isn't reduced below count
    }

    if (new_capacity == num->capacity) {
        // No need to reallocate if the capacity is unchanged
        return;
    }

    // Allocate new memory
    int* new_items = my_malloc(new_capacity * sizeof(int));
    if (new_items == NULL) {
        // Handle allocation failure, perhaps by keeping the old array
        return;
    }

    // Copy existing data
    for (int i = 0; i < num->count; i++) {
        new_items[i] = num->items[i];
    }

    // Free the old memory
    my_free(num->items);

    // Update the structure
    num->items = new_items;
    num->capacity = new_capacity;
}

// Assuming you have these functions from your previous setup:
void* my_malloc(size_t size);
void my_free(void* ptr);