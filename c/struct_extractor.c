#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_LINE_LENGTH 1024
#define MAX_STRUCT_FIELDS 100
#define MAX_FIELD_NAME 256
#define MAX_ARRAY_SIZE 32

typedef struct {
    char name[MAX_FIELD_NAME];
    int is_array;
    int array_size;
} StructField;

void trim(char* str) {
    char* start = str;
    char* end = str + strlen(str) - 1;
    
    while(isspace(*start)) start++;
    while(end > start && isspace(*end)) end--;
    
    *(end + 1) = '\0';
    memmove(str, start, end - start + 2);
}

void remove_comments(char* str) {
    char* comment = strstr(str, "//");
    if (comment) {
        *comment = '\0';
        trim(str);
    }
}

double eval_expression(const char* expression) {
    // Simple expression evaluator for basic arithmetic
    char expr[MAX_LINE_LENGTH];
    strcpy(expr, expression);
    
    double result = 0;
    char* token = strtok(expr, " *+-");
    result = atof(token);
    
    const char* rest = expression + strlen(token);
    while (*rest) {
        while (*rest && isspace(*rest)) rest++;
        char op = *rest++;
        while (*rest && isspace(*rest)) rest++;
        
        token = strtok(NULL, " *+-");
        if (!token) break;
        
        double value = atof(token);
        switch (op) {
            case '*': result *= value; break;
            case '+': result += value; break;
            case '-': result -= value; break;
        }
    }
    
    return result;
}

int extract_define_value(FILE* header, const char* define_name, long original_pos) {
    long current_pos = ftell(header);
    fseek(header, 0, SEEK_SET);
    
    char line[MAX_LINE_LENGTH];
    int value = -1;
    char expression[MAX_LINE_LENGTH];
    
    while (fgets(line, sizeof(line), header)) {
        trim(line);
        char search_str[MAX_LINE_LENGTH];
        snprintf(search_str, sizeof(search_str), "#define %s", define_name);
        
        if (strstr(line, search_str)) {
            char* value_start = line + strlen(search_str);
            while (isspace(*value_start)) value_start++;
            
            // Remove parentheses if present
            char* open_paren = strchr(value_start, '(');
            if (open_paren) {
                char* close_paren = strrchr(value_start, ')');
                if (close_paren) {
                    *close_paren = '\0';
                    value_start = open_paren + 1;
                }
            }
            
            trim(value_start);
            strcpy(expression, value_start);
            
            // Handle expressions with operators
            if (strchr(expression, '*') || strchr(expression, '+') || strchr(expression, '-')) {
                char* saveptr;
                char* token = strtok_r(value_start, " *+-", &saveptr);
                
                while (token) {
                    trim(token);
                    if (!isdigit(token[0])) {
                        int sub_value = extract_define_value(header, token, current_pos);
                        if (sub_value != -1) {
                            char token_str[MAX_LINE_LENGTH];
                            char value_str[32];
                            snprintf(token_str, sizeof(token_str), "%s", token);
                            snprintf(value_str, sizeof(value_str), "%d", sub_value);
                            
                            char* pos = strstr(expression, token_str);
                            if (pos) {
                                size_t token_len = strlen(token_str);
                                size_t value_len = strlen(value_str);
                                memmove(pos + value_len, pos + token_len, 
                                       strlen(pos + token_len) + 1);
                                memcpy(pos, value_str, value_len);
                            }
                        }
                    }
                    token = strtok_r(NULL, " *+-", &saveptr);
                }
                value = (int)eval_expression(expression);
            } else {
                value = atoi(value_start);
            }
            break;
        }
    }
    
    fseek(header, original_pos, SEEK_SET);
    return value;
}

void process_field(char* line, StructField* field, FILE* header, long original_pos) {
    char* bracket = strchr(line, '[');
    if (bracket) {
        field->is_array = 1;
        *bracket = '\0';
        char* end_bracket = strchr(bracket + 1, ']');
        if (end_bracket) {
            *end_bracket = '\0';
            char* size_str = bracket + 1;
            trim(size_str);
            
            // First try to parse as direct number
            field->array_size = atoi(size_str);
            
            // If not a direct number, try to get from define
            if (field->array_size == 0) {
                field->array_size = extract_define_value(header, size_str, original_pos);
            }
        }
    } else {
        field->is_array = 0;
        field->array_size = 0;
    }
    
    char* last_space = strrchr(line, ' ');
    if (last_space) {
        strcpy(field->name, last_space + 1);
        trim(field->name);
        char* semicolon = strchr(field->name, ';');
        if (semicolon) {
            *semicolon = '\0';
        }
    }
}


void to_lowercase(char* str) {
    for (int i = 0; str[i]; i++) {
        str[i] = tolower(str[i]);
    }
}

void write_js_global_array(FILE* out, const char* array_name, int array_size) {
    char lowercase_array_name[MAX_FIELD_NAME];
    strncpy(lowercase_array_name, array_name, MAX_FIELD_NAME - 1);
    lowercase_array_name[MAX_FIELD_NAME - 1] = '\0';
    to_lowercase(lowercase_array_name);
    // get_current_inventory_items_ptr
    fprintf(out, "function game_get_%s(wasm_exports, input_array) {\n", array_name);
    fprintf(out, "    var ptr = null;\n");
    fprintf(out, "    if (!input_array || input_array.length === 0) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr();\n", lowercase_array_name);
    fprintf(out, "    } else if (input_array.length === 1) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0]);\n", lowercase_array_name);
    fprintf(out, "    } else if (input_array.length === 2) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1]);\n", lowercase_array_name);
    fprintf(out, "    } else if (input_array.length === 3) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1], input_array[2]);\n", lowercase_array_name);
    fprintf(out, "    } else if (input_array.length === 4) {\n");
    fprintf(out, "        ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);\n", lowercase_array_name);
    fprintf(out, "    }\n");
    fprintf(out, "    return new Uint32Array(wasm_exports.memory.buffer, ptr, %d);\n", array_size);
    fprintf(out, "}\n\n");
}

void write_js_class(FILE* out, const char* struct_name, StructField* fields, int field_count) {
    char lowercase_name[MAX_FIELD_NAME];
    strncpy(lowercase_name, struct_name, MAX_FIELD_NAME - 1);
    lowercase_name[MAX_FIELD_NAME - 1] = '\0';
    to_lowercase(lowercase_name);

    fprintf(out, "class GAME_%s {\n", struct_name);
    fprintf(out, "    constructor(wasm_exports, input_array) {\n");
    fprintf(out, "        this._memory = wasm_exports.memory;\n");
    fprintf(out, "        if (!input_array || input_array.length === 0) {\n");
    fprintf(out, "            this._ptr = wasm.exports.get_%s_ptr();\n", lowercase_name);
    fprintf(out, "        } else if (input_array.length === 1) {\n");
    fprintf(out, "            this._ptr = wasm.exports.get_%s_ptr(input_array[0]);\n", lowercase_name);
    fprintf(out, "        } else if (input_array.length === 2) {\n");
    fprintf(out, "            this._ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1]);\n", lowercase_name);
    fprintf(out, "        } else if (input_array.length === 3) {\n");
    fprintf(out, "            this._ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1], input_array[2]);\n", lowercase_name);
    fprintf(out, "        } else if (input_array.length === 4) {\n");
    fprintf(out, "            this._ptr = wasm.exports.get_%s_ptr(input_array[0], input_array[1], input_array[2], input_array[3]);\n", lowercase_name);
    fprintf(out, "        }\n");
    // fprintf(out, "        this._ptr = ptr;\n");
    fprintf(out, "        this._view = new DataView(this._memory.buffer);\n");
    fprintf(out, "    }\n\n");

    int offset = 0;
    for (int i = 0; i < field_count; i++) {
        if (fields[i].is_array) {
            // For arrays, create a new view each time to handle memory growth
            fprintf(out, "    get %s() {\n", fields[i].name);
            // fprintf(out, "        const view = new DataView(this._memory.buffer);\n");
            fprintf(out, "        return new Uint32Array(this._memory.buffer, this._ptr + %d * 4, %d);\n", 
                    offset, fields[i].array_size);
            fprintf(out, "    }\n\n");
            offset += fields[i].array_size;
        } else {
            // For single values, use DataView for direct memory access
            fprintf(out, "    get %s() {\n", fields[i].name);
            // fprintf(out, "        const view = new DataView(this._memory.buffer);\n");
            fprintf(out, "        return this._view.getUint32(this._ptr + %d * 4, true);\n", offset);
            fprintf(out, "    }\n");
            fprintf(out, "    set %s(value) {\n", fields[i].name);
            fprintf(out, "        this._view.setUint32(this._ptr + %d * 4, value, true);\n", offset);
            fprintf(out, "    }\n\n");
            offset++;
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

int main(int argc, char* argv[]) {
    if (argc != 2) {
        printf("Usage: %s <header_file>\n", argv[0]);
        return 1;
    }

    FILE* header = fopen(argv[1], "r");
    if (!header) {
        printf("Could not open file: %s\n", argv[1]);
        return 1;
    }

    FILE* js = fopen("../html/js/structs.js", "w");
    if (!js) {
        fclose(header);
        printf("Could not create output file\n");
        return 1;
    }

    char line[MAX_LINE_LENGTH];
    StructField fields[MAX_STRUCT_FIELDS];
    int field_count = 0;
    int in_struct = 0;
    int should_export = 0;
    char struct_name[MAX_FIELD_NAME] = {0};
    
    while (fgets(line, sizeof(line), header)) {
        trim(line);
        
        if (strstr(line, "/** EXPORT TO JS **/")) {
            should_export = 1;
            continue;
        }
        
        // Check struct processing first
        if (in_struct) {
            if (strstr(line, "}")) {
                char* name_start = strchr(line, '}') + 1;
                while (*name_start && isspace(*name_start)) name_start++;
                char* semicolon = strchr(name_start, ';');
                if (semicolon) *semicolon = '\0';
                strcpy(struct_name, name_start);
                trim(struct_name);
                
                write_js_class(js, struct_name, fields, field_count);
                
                in_struct = 0;
                should_export = 0;
                continue;
            }
            
            if (strstr(line, "u32 ")) {
                StructField field = {0};
                long current_pos = ftell(header);
                process_field(line, &field, header, current_pos);
                fields[field_count++] = field;
            }
        }
        // Then check global exports
        else if (should_export) {
            if (strstr(line, "typedef struct")) {
                in_struct = 1;
                field_count = 0;
                should_export = 0;  // Reset export flag after struct start
                continue;
            }
            else if (strstr(line, "u32 ")) {
                // Handle global array
                char* bracket = strchr(line, '[');
                if (bracket) {
                    char array_name[MAX_FIELD_NAME] = {0};
                    char size_name[MAX_FIELD_NAME] = {0};
                    
                    // Extract array name
                    char* name_start = strstr(line, "u32 ") + 4;
                    size_t name_len = bracket - name_start;
                    strncpy(array_name, name_start, name_len);
                    trim(array_name);
                    
                    // Extract size define name
                    bracket++;
                    char* end_bracket = strchr(bracket, ']');
                    if (end_bracket) {
                        strncpy(size_name, bracket, end_bracket - bracket);
                        trim(size_name);
                        
                        // Get the actual size value from define
                        long current_pos = ftell(header);
                        int array_size = extract_define_value(header, size_name, current_pos);
                        if (array_size > 0) {
                            write_js_global_array(js, array_name, array_size);
                        }
                    }
                }
                should_export = 0;
                continue;
            }
        }
    }

    fclose(header);
    fclose(js);
    return 0;
}
