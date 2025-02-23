#include <stdio.h>
#include <string.h>
#include <stddef.h>

#define MAX_FIELD_NAME 256

// Constants
#define MAX_SHIPS 100
#define MAX_TESTS 10
#define MAX_SHIP_CARGO_SPACE 1000
#define MAX_SHIP_MATERIALS 50
#define MAX_WORLDS 200
#define MAX_LAYERS 10
#define MAX_WORLD_WIDTH 100
#define MAX_WORLD_HEIGHT 100

typedef unsigned int u32;

// Metadata definitions
typedef struct {
    const char* type;
    const char* name;
    int is_array;
    int array_size;
} FieldMetadata;

typedef struct {
    const char* name;
    FieldMetadata* fields;
    int field_count;
    size_t size;
} StructMetadata;

typedef struct {
    const char* name;
    int size;
} ArrayMetadata;

// Define struct fields
FieldMetadata data_test_fields[] = {
    {"u32", "good_id", 0, 0},
    {"u32", "name_id", 0, 0},
    {"u32", "purchase_price", 0, 0},
    {"u32", "current_sale_price", 0, 0},
    {"u32", "quantity", 0, 0}
};

FieldMetadata data_ship_fields[] = {
    {"u32", "id", 0, 0},
    {"u32", "name_id", 0, 0},
    {"u32", "base_ship_id", 0, 0},
    {"u32", "price", 0, 0},
    {"u32", "material_id", 0, 0},
    {"u32", "capacity", 0, 0},
    {"u32", "tacking", 0, 0},
    {"u32", "power", 0, 0},
    {"u32", "speed", 0, 0},
    {"u32", "durability", 0, 0},
    {"u32", "crew", 0, 0},
    {"u32", "crew_space", 0, 0},
    {"u32", "cargo_space", 0, 0},
    {"u32", "cannon_space", 0, 0},
    {"u32", "cannons", 0, 0},
    {"u32", "cannon_type_id", 0, 0},
    {"u32", "cargo_goods", 1, MAX_SHIP_CARGO_SPACE},
    {"u32", "cargo_goods_qty", 1, MAX_SHIP_CARGO_SPACE},
    {"u32", "total_cargo_goods", 0, 0},
    {"u32", "figurehead_id", 0, 0},
    {"DATA_TEST", "test", 1, MAX_TESTS}
};

FieldMetadata data_some_struct_fields[] = {
    {"u32", "fields", 0, 0},
    {"DATA_TEST", "test", 1, 10}
};

// Define structs
StructMetadata structs[] = {
    {"DATA_TEST", data_test_fields, sizeof(data_test_fields) / sizeof(FieldMetadata), 0},
    {"DATA_SHIP", data_ship_fields, sizeof(data_ship_fields) / sizeof(FieldMetadata), 0},
    {"DATA_SOME_STRUCT", data_some_struct_fields, sizeof(data_some_struct_fields) / sizeof(FieldMetadata), 0}
};

int struct_count = sizeof(structs) / sizeof(StructMetadata);

// Define arrays
ArrayMetadata arrays[] = {
    {"storage_ship_used_slots", MAX_SHIPS},
    {"storage_ship_material_used_slots", MAX_SHIP_MATERIALS},
    {"world_data", MAX_WORLDS * MAX_LAYERS * MAX_WORLD_WIDTH * MAX_WORLD_HEIGHT} // 200 * 10 * 100 * 100
};

int array_count = sizeof(arrays) / sizeof(ArrayMetadata);

// Compute struct sizes
void calculate_struct_sizes() {
    for (int i = 0; i < struct_count; i++) {
        size_t size = 0;
        for (int j = 0; j < structs[i].field_count; j++) {
            FieldMetadata* f = &structs[i].fields[j];
            if (strcmp(f->type, "u32") == 0) {
                size += f->is_array ? f->array_size * 4 : 4;
            } else {
                for (int k = 0; k < struct_count; k++) {
                    if (strcmp(structs[k].name, f->type) == 0) {
                        if (structs[k].size == 0) {
                            fprintf(stderr, "Error: Struct %s size not resolved yet\n", f->type);
                            exit(1);
                        }
                        size += f->is_array ? f->array_size * structs[k].size : structs[k].size;
                        break;
                    }
                }
            }
        }
        structs[i].size = size;
    }
}

// Convert string to lowercase
void to_lowercase(char* str) {
    for (int i = 0; str[i]; i++) {
        str[i] = tolower(str[i]);
    }
}

// Generate JavaScript class for structs
void write_js_class(FILE* out, StructMetadata* meta) {
    char lowercase_name[MAX_FIELD_NAME];
    strncpy(lowercase_name, meta->name, MAX_FIELD_NAME - 1);
    lowercase_name[MAX_FIELD_NAME - 1] = '\0';
    to_lowercase(lowercase_name);

    fprintf(out, "class GAME_%s {\n", meta->name);
    fprintf(out, "    constructor(wasm_exports, input) {\n");
    fprintf(out, "        this.wasm_exports = wasm_exports;\n");
    fprintf(out, "        this._memory = wasm_exports.memory;\n");
    fprintf(out, "        if (typeof input === 'number') {\n");
    fprintf(out, "            this._ptr = input;\n");
    fprintf(out, "        } else {\n");
    fprintf(out, "            if (!input || input.length === 0) {\n");
    fprintf(out, "                this._ptr = wasm.exports.get_%s_ptr();\n", lowercase_name);
    fprintf(out, "            } else if (input.length === 1) {\n");
    fprintf(out, "                this._ptr = wasm.exports.get_%s_ptr(input[0]);\n", lowercase_name);
    fprintf(out, "            } else if (input.length === 2) {\n");
    fprintf(out, "                this._ptr = wasm.exports.get_%s_ptr(input[0], input[1]);\n", lowercase_name);
    fprintf(out, "            } else if (input.length === 3) {\n");
    fprintf(out, "                this._ptr = wasm.exports.get_%s_ptr(input[0], input[1], input[2]);\n", lowercase_name);
    fprintf(out, "            } else if (input.length === 4) {\n");
    fprintf(out, "                this._ptr = wasm.exports.get_%s_ptr(input[0], input[1], input[2], input[3]);\n", lowercase_name);
    fprintf(out, "            }\n");
    fprintf(out, "        }\n");
    fprintf(out, "        this._view = new DataView(this._memory.buffer);\n");
    fprintf(out, "    }\n\n");

    size_t offset = 0;
    for (int i = 0; i < meta->field_count; i++) {
        FieldMetadata* f = &meta->fields[i];
        if (strcmp(f->type, "u32") == 0) {
            if (f->is_array) {
                fprintf(out, "    get %s() {\n", f->name);
                fprintf(out, "        return new Uint32Array(this._memory.buffer, this._ptr + %zu, %d);\n", 
                        offset, f->array_size);
                fprintf(out, "    }\n\n");
                offset += f->array_size * 4;
            } else {
                fprintf(out, "    get %s() {\n", f->name);
                fprintf(out, "        return this._view.getUint32(this._ptr + %zu, true);\n", offset);
                fprintf(out, "    }\n");
                fprintf(out, "    set %s(value) {\n", f->name);
                fprintf(out, "        this._view.setUint32(this._ptr + %zu, value, true);\n", offset);
                fprintf(out, "    }\n\n");
                offset += 4;
            }
        } else {
            size_t struct_size = 0;
            for (int j = 0; j < struct_count; j++) {
                if (strcmp(structs[j].name, f->type) == 0) {
                    struct_size = structs[j].size;
                    break;
                }
            }
            if (struct_size == 0) {
                fprintf(stderr, "Error: Struct %s not found for field %s\n", f->type, f->name);
                continue;
            }
            if (f->is_array) {
                fprintf(out, "    get %s() {\n", f->name);
                fprintf(out, "        return (index) => {\n");
                fprintf(out, "            if (index < 0 || index >= %d) throw new Error('Index out of bounds');\n", 
                        f->array_size);
                fprintf(out, "            const ptr = this._ptr + %zu + index * %zu;\n", offset, struct_size);
                fprintf(out, "            return new GAME_%s(this.wasm_exports, ptr);\n", f->type);
                fprintf(out, "        };\n");
                fprintf(out, "    }\n\n");
                offset += f->array_size * struct_size;
            } else {
                fprintf(out, "    get %s() {\n", f->name);
                fprintf(out, "        return new GAME_%s(this.wasm_exports, this._ptr + %zu);\n", f->type, offset);
                fprintf(out, "    }\n\n");
                offset += struct_size;
            }
        }
    }

    fprintf(out, "    getName() {\n");
    fprintf(out, "        if (!this.name_id) { return 'Unknown'; }\n");
    fprintf(out, "        if (!GAME_STRINGS || !GAME_STRINGS[this.name_id]) { return 'NoGameString'; }\n");
    fprintf(out, "        if (!STRINGS || !STRINGS[GAME_STRINGS[this.name_id]]) { return GAME_STRINGS[this.name_id]; }\n");
    fprintf(out, "        else { return STRINGS[GAME_STRINGS[this.name_id]]; }\n");
    fprintf(out, "    }\n\n");
    fprintf(out, "}\n\n");
}

// Generate JavaScript function for arrays
void write_js_global_array(FILE* out, ArrayMetadata* meta) {
    char lowercase_name[MAX_FIELD_NAME];
    strncpy(lowercase_name, meta->name, MAX_FIELD_NAME - 1);
    lowercase_name[MAX_FIELD_NAME - 1] = '\0';
    to_lowercase(lowercase_name);

    fprintf(out, "function game_get_%s(wasm_exports, input_array) {\n", meta->name);
    fprintf(out, "    var ptr = null;\n");
    fprintf(out, "    if (!input_array || input_array.length === 0) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr();\n", lowercase_name);
    fprintf(out, "    } else if (input_array.length === 1) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0]);\n", lowercase_name);
    fprintf(out, "    } else if (input_array.length === 2) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1]);\n", lowercase_name);
    fprintf(out, "    } else if (input_array.length === 3) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1], input_array[2]);\n", lowercase_name);
    fprintf(out, "    } else if (input_array.length === 4) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);\n", lowercase_name);
    fprintf(out, "    }\n");
    fprintf(out, "    return new Uint32Array(wasm_exports.memory.buffer, ptr, %d);\n", meta->size);
    fprintf(out, "}\n\n");
}

// Generate additional JS functions for world editing
void write_js_world_functions(FILE* out) {
    fprintf(out, "function set_world_layer_value(wasm_exports, world_id, layer_id, x, y, value) {\n");
    fprintf(out, "    const world_ptr = wasm.exports.get_world_data_ptr();\n");
    fprintf(out, "    const world_size = %d * %d * %d; // MAX_LAYERS * MAX_WORLD_WIDTH * MAX_WORLD_HEIGHT\n", 
            MAX_LAYERS, MAX_WORLD_WIDTH, MAX_WORLD_HEIGHT);
    fprintf(out, "    const offset = world_id * world_size + layer_id * %d * %d + y * %d + x;\n", 
            MAX_WORLD_WIDTH, MAX_WORLD_HEIGHT, MAX_WORLD_WIDTH);
    fprintf(out, "    const view = new DataView(wasm_exports.memory.buffer);\n");
    fprintf(out, "    view.setUint32(world_ptr + offset * 4, value, true);\n");
    fprintf(out, "}\n\n");

    fprintf(out, "function export_world_data(wasm_exports) {\n");
    fprintf(out, "    const world_ptr = wasm.exports.get_world_data_ptr();\n");
    fprintf(out, "    const total_size = %d * %d * %d * %d; // MAX_WORLDS * MAX_LAYERS * MAX_WORLD_WIDTH * MAX_WORLD_HEIGHT\n", 
            MAX_WORLDS, MAX_LAYERS, MAX_WORLD_WIDTH, MAX_WORLD_HEIGHT);
    fprintf(out, "    const data = new Uint32Array(wasm_exports.memory.buffer, world_ptr, total_size);\n");
    fprintf(out, "    const blob = new Blob([data.buffer.slice(world_ptr, world_ptr + total_size * 4)], { type: 'application/octet-stream' });\n");
    fprintf(out, "    const url = URL.createObjectURL(blob);\n");
    fprintf(out, "    const a = document.createElement('a');\n");
    fprintf(out, "    a.href = url;\n");
    fprintf(out, "    a.download = 'world_data.bin';\n");
    fprintf(out, "    document.body.appendChild(a);\n");
    fprintf(out, "    a.click();\n");
    fprintf(out, "    document.body.removeChild(a);\n");
    fprintf(out, "    URL.revokeObjectURL(url);\n");
    fprintf(out, "    return url;\n");
    fprintf(out, "}\n\n");
}

int main(int argc, char* argv[]) {
    FILE* js = fopen("../html/js/structs.js", "w");
    if (!js) {
        printf("Could not create output file\n");
        return 1;
    }

    calculate_struct_sizes();

    // Generate JavaScript output
    for (int i = 0; i < struct_count; i++) {
        write_js_class(js, &structs[i]);
    }
    for (int i = 0; i < array_count; i++) {
        write_js_global_array(js, &arrays[i]);
    }
    write_js_world_functions(js);

    fclose(js);
    printf("Exported to ../html/js/structs.js\n");
    return 0;
}

/*
// game_bindings.odin
package game_bindings

// Import wasm_game.h as a C header
#foreign_import "wasm_game.h"

// Define types to match C
u32 :: u32

// Foreign block to import C functions directly
foreign {
    layer_set_value :: proc(layer_id: u32, x: u32, y: u32, value: u32) --- // Matches C signature
}

// Example usage
main :: proc() {
    layer_set_value(0, 10, 10, 42) // Calls the C function directly
}
*/