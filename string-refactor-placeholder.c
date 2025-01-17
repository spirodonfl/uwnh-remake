// Instead of pointers, use fixed arrays and track valid ranges
#define MAX_STRING_LENGTH 256
#define MAX_STRINGS 1000

struct String {
    u8 data[MAX_STRING_LENGTH];  // Fixed array instead of pointer
    u32 length;
    u32 is_used;
};

// Global string storage
struct String g_strings[MAX_STRINGS];
u32 g_string_count;

// Get string by offset
struct String* get_string(u32 string_offset) {
    if (string_offset >= MAX_STRINGS) return NULL;
    return &g_strings[string_offset];
}

// Find next available string slot
u32 allocate_string_slot() {
    for (u32 i = 0; i < MAX_STRINGS; i++) {
        if (!g_strings[i].is_used) {
            g_strings[i].is_used = 1;
            return i;
        }
    }
    return SENTRY;
}

// Store string in array and return offset
u32 store_string(u8* data, u32 length) {
    u32 offset = allocate_string_slot();
    if (offset == SENTRY) return SENTRY;
    
    struct String* str = &g_strings[offset];
    
    // Copy data into fixed array
    for (u32 i = 0; i < length && i < MAX_STRING_LENGTH; i++) {
        str->data[i] = data[i];
    }
    str->length = length;
    
    return offset;
}

// Get NPC by machine name using array offsets
u32 get_npc_id_by_machine_name(u32 name_string_offset) {
    struct String* name = get_string(name_string_offset);
    if (!name || !name->is_used) return SENTRY;
    
    u32 string_id = get_string_id_by_machine_name(name->data, name->length);
    if (string_id == SENTRY) {
        console_log("[E] Could not find string id for npc machine name");
        return SENTRY;
    }
    
    for (u32 i = 0; i < MAX_NPCS; i++) {
        if (get_npc_name_id(i) == string_id) {
            return i;
        }
    }
    return SENTRY;
}




// NPC storage using fixed arrays
struct NPC {
    u32 name_string_offset;  // Reference to string by offset
    u32 type;
    u32 is_used;
    // ... other fields
};

struct NPCStorage {
    struct NPC npcs[MAX_NPCS];
    u32 count;
};

// Global NPC storage
struct NPCStorage g_npc_storage;

// Add NPC using array storage
u32 add_npc(u32 name_string_offset, u32 type) {
    for (u32 i = 0; i < MAX_NPCS; i++) {
        if (!g_npc_storage.npcs[i].is_used) {
            g_npc_storage.npcs[i].name_string_offset = name_string_offset;
            g_npc_storage.npcs[i].type = type;
            g_npc_storage.npcs[i].is_used = 1;
            g_npc_storage.count++;
            return i;
        }
    }
    return SENTRY;
}




// Example usage in initialize_game():

void initialize_game() {
    tick_counter = 1;
    current_game_mode = (uint32_t)GAME_MODE_EMPTY;
    clear_current_scene();

    // Initialize storage
    for (u32 i = 0; i < MAX_STRINGS; i++) {
        g_strings[i].is_used = 0;
        g_strings[i].length = 0;
    }
    g_string_count = 0;

    // Store strings - using array literals for byte data
    u8 empty_name[] = {'e','m','p','t','y'};
    u32 empty_offset = store_string(empty_name, 5);
    
    u8 gold_msg[] = {'Y','o','u',' ','h','a','v','e',' ','%','d',' ','g','o','l','d','.'};
    u32 gold_msg_offset = store_string(gold_msg, 17);
    
    u8 hello[] = {'H','e','l','l','o'};
    u32 hello_offset = store_string(hello, 5);

    // Alternative method using cast from string literal
    u32 player_menu_offset = store_string((u8*)"Player Menu", 11);
    
    // These offsets would then be used to reference the strings later
    // For example, storing in your string lookup table or using directly
    
    // Example of using a stored string:
    struct String* hello_str = get_string(hello_offset);
    if (hello_str && hello_str->is_used) {
        // Use hello_str->data and hello_str->length
    }
}



// Helper function to store string literals
u32 store_string_literal(const char* literal) {
    u32 len = 0;
    while (literal[len] != '\0') len++;
    return store_string((u8*)literal, len);
}

// Then you could use it like this:
void initialize_game() {
    // ... initialization code ...

    // Much simpler string storage
    u32 empty_offset = store_string_literal("empty");
    u32 gold_msg_offset = store_string_literal("You have %d gold.");
    u32 hello_offset = store_string_literal("Hello");
    u32 player_menu_offset = store_string_literal("Player Menu");
    
    // ... rest of initialization ...
}



void create_string(const char* machine_name, const char* display_name) {
    u32 machine_offset = store_string_literal(machine_name);
    u32 display_offset = store_string_literal(display_name);
    
    // Store the relationship between machine name and display name
    // (You'd need to adapt your string lookup system to use these offsets)
}