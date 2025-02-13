#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_LINE_LENGTH 1024
#define MAX_ENUM_VALUES 1000

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

void process_enum_line(char* line, char enum_values[][MAX_LINE_LENGTH], int* enum_count) {
    char* token;
    char* rest = line;
    
    // Split the line by commas
    while ((token = strtok_r(rest, ",", &rest))) {
        trim(token);
        remove_comments(token);
        
        // Skip empty tokens and GAME_STRINGS_COUNT
        if (strlen(token) > 0 && !strstr(token, "GAME_STRINGS_COUNT")) {
            strcpy(enum_values[*enum_count], token);
            (*enum_count)++;
        }
    }
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

    FILE* js = fopen("../html/js/game_strings.js", "w");
    FILE* odin = fopen("../game_strings.odin", "w");
    if (!js || !odin) {
        if (js) fclose(js);
        if (odin) fclose(odin);
        fclose(header);
        printf("Could not create output files\n");
        return 1;
    }

    char line[MAX_LINE_LENGTH];
    char enum_values[MAX_ENUM_VALUES][MAX_LINE_LENGTH];
    int enum_count = 0;
    int in_enum = 0;
    int found_opening_brace = 0;
    
    while (fgets(line, sizeof(line), header)) {
        trim(line);
        remove_comments(line);
        
        // Skip empty lines
        if (strlen(line) == 0) continue;
        
        // Look for enum start
        if (!in_enum && strstr(line, "enum GameStrings")) {
            in_enum = 1;
            if (strchr(line, '{')) {
                found_opening_brace = 1;
            }
            continue;
        }
        
        // Look for opening brace if not found yet
        if (in_enum && !found_opening_brace) {
            if (strchr(line, '{')) {
                found_opening_brace = 1;
            }
            continue;
        }
        
        // Process enum values
        if (in_enum && found_opening_brace) {
            // Check for end of enum
            if (strchr(line, '}')) {
                break;
            }
            
            process_enum_line(line, enum_values, &enum_count);
        }
    }

    // Write js output
    fprintf(js, "var GAME_STRINGS = [\n");
    for (int i = 0; i < enum_count; i++) {
        fprintf(js, "    \"%s\"%s\n", 
                enum_values[i], 
                (i < enum_count - 1) ? "," : "");
    }
    fprintf(js, "]\n");

    // Write Odin output
    fprintf(odin, "package game\n\n");
    fprintf(odin, "GameStrings :: enum {\n");
    for (int i = 0; i < enum_count; i++) {
        fprintf(odin, "    %s%s\n", 
                enum_values[i], 
                (i < enum_count - 1) ? "," : "");
    }
    fprintf(odin, "}\n");

    fclose(header);
    fclose(js);
    fclose(odin);
    return 0;
}
