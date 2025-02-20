#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

unsigned char* read_file(const char* filename, size_t* length)
{
    FILE* file = fopen(filename, "rb");
    if (!file)
    {
        printf("Could not open file: %s\n", filename);
        return NULL;
    }
    
    fseek(file, 0, SEEK_END);
    *length = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    unsigned char* buffer = malloc(*length);
    if (!buffer)
    {
        fclose(file);
        return NULL;
    }
    
    size_t bytes_read = fread(buffer, 1, *length, file);
    fclose(file);
    
    if (bytes_read != *length)
    {
        free(buffer);
        return NULL;
    }
    
    return buffer;
}

int main()
{
    // Read WASM file
    size_t wasm_length;
    unsigned char* wasm_data = read_file("wasm_game.wasm", &wasm_length);
    if (!wasm_data)
    {
        printf("Error reading WASM file\n");
        return 1;
    }

    // Write to JavaScript file
    FILE* dest = fopen("../html/js/wasm_as_array.js", "wb");
    if (!dest)
    {
        printf("Error opening output file\n");
        free(wasm_data);
        return 1;
    }

    // Write the array declaration
    fprintf(dest, "var wasmU8 = [");
    
    // Write each byte as a number
    for (size_t i = 0; i < wasm_length; i++)
    {
        // raw int version
        fprintf(dest, "%u", wasm_data[i]);
        // hex version
        // fprintf(dest, "0x%02x", wasm_data[i]);
        if (i < wasm_length - 1)
            fprintf(dest, ",");
        
        // Add newline every 20 numbers for readability
        // if ((i + 1) % 20 == 0)
        //     fprintf(dest, "\n");
    }
    
    fprintf(dest, "];\n");
    fclose(dest);
    free(wasm_data);

    printf("Successfully created WASM array in JavaScript file\n");
    return 0;
}
