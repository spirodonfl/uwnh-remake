#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

// Base64 encoding table
static const char base64_table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Function to encode data to base64
char* base64_encode(const unsigned char* data, size_t input_length, size_t* output_length) {
    *output_length = 4 * ((input_length + 2) / 3);
    char* encoded_data = malloc(*output_length + 1);
    
    if (encoded_data == NULL) return NULL;
    
    for (size_t i = 0, j = 0; i < input_length;) {
        uint32_t octet_a = i < input_length ? data[i++] : 0;
        uint32_t octet_b = i < input_length ? data[i++] : 0;
        uint32_t octet_c = i < input_length ? data[i++] : 0;
        
        uint32_t triple = (octet_a << 16) + (octet_b << 8) + octet_c;
        
        encoded_data[j++] = base64_table[(triple >> 18) & 0x3F];
        encoded_data[j++] = base64_table[(triple >> 12) & 0x3F];
        encoded_data[j++] = base64_table[(triple >> 6) & 0x3F];
        encoded_data[j++] = base64_table[triple & 0x3F];
    }
    
    // Add padding if necessary
    for (size_t i = 0; i < (3 - input_length % 3) % 3; i++) {
        encoded_data[*output_length - 1 - i] = '=';
    }
    
    encoded_data[*output_length] = '\0';
    return encoded_data;
}

// Function to read entire file into memory
unsigned char* read_file(const char* filename, size_t* length) {
    FILE* file = fopen(filename, "rb");
    if (!file) {
        printf("Could not open file: %s\n", filename);
        return NULL;
    }
    
    fseek(file, 0, SEEK_END);
    *length = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    unsigned char* buffer = malloc(*length);
    if (!buffer) {
        fclose(file);
        return NULL;
    }
    
    size_t bytes_read = fread(buffer, 1, *length, file);
    fclose(file);
    
    if (bytes_read != *length) {
        free(buffer);
        return NULL;
    }
    
    return buffer;
}

int main() {
    // Read WASM file
    size_t wasm_length;
    unsigned char* wasm_data = read_file("wasm_game.wasm", &wasm_length);
    if (!wasm_data) {
        printf("Error reading WASM file\n");
        return 1;
    }

    // Read Atlas file
    size_t atlas_length;
    unsigned char* atlas_data = read_file("atlas.png", &atlas_length);
    if (!atlas_data) {
        printf("Error reading Atlas file\n");
        free(wasm_data);
        return 1;
    }

    // Encode WASM to base64
    size_t base64_wasm_length;
    char* base64_wasm = base64_encode(wasm_data, wasm_length, &base64_wasm_length);
    free(wasm_data);
    
    if (!base64_wasm) {
        printf("Error encoding WASM to base64\n");
        free(atlas_data);
        return 1;
    }

    // Encode Atlas to base64
    size_t base64_atlas_length;
    char* base64_atlas = base64_encode(atlas_data, atlas_length, &base64_atlas_length);
    free(atlas_data);
    
    if (!base64_atlas) {
        printf("Error encoding Atlas to base64\n");
        free(base64_wasm);
        return 1;
    }

    // Copy HTML file with both injections
    FILE* source = fopen("wasm_game.html", "rb");
    FILE* dest = fopen("index.html", "wb");
    if (!source || !dest) {
        printf("Error opening HTML files\n");
        free(base64_wasm);
        free(base64_atlas);
        return 1;
    }

    char buffer[1024];
    char* wasm_placeholder = "<!-- WASM_FILE_HERE -->";
    char* atlas_placeholder = "<!-- ATLAS_FILE_HERE -->";

    while (fgets(buffer, sizeof(buffer), source)) {
        char* placeholder_pos;
        
        if ((placeholder_pos = strstr(buffer, wasm_placeholder))) {
            // Write everything before the placeholder
            *placeholder_pos = '\0';
            fputs(buffer, dest);
            // Write the base64 WASM data
            fputs(base64_wasm, dest);
            // Write everything after the placeholder
            fputs(placeholder_pos + strlen(wasm_placeholder), dest);
        }
        else if ((placeholder_pos = strstr(buffer, atlas_placeholder))) {
            // Write everything before the placeholder
            *placeholder_pos = '\0';
            fputs(buffer, dest);
            // Write the base64 Atlas data
            fputs(base64_atlas, dest);
            // Write everything after the placeholder
            fputs(placeholder_pos + strlen(atlas_placeholder), dest);
        }
        else {
            fputs(buffer, dest);
        }
    }

    fclose(source);
    fclose(dest);
    free(base64_wasm);
    free(base64_atlas);

    printf("Successfully embedded WASM and Atlas in HTML\n");
    return 0;
}