#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <uuid/uuid.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <errno.h>
#include <time.h>

#include "wasm_game.h"
void js_console_log(void* ptr, u32 len)
{
    printf("js console log %s\n", (char *)ptr);
}
void js_output_string_buffer()
{
    printf("js output string buffer %d", 69420);
}
void js_output_array_buffer()
{
    printf("js output array buffer %d", 69420);
}

#define SERVER_MAX_PLAYERS 10
#define COUNTDOWN_SECONDS 120
#define PORT 3333
#define REQUEST_BUFFER_SIZE 2048

#define DB_FILENAME "game.db"

// --------- SQLITE REPLACEMENT
#define MAX_PLAYER_KEY_ENTRIES 10000
#define MAX_SERVER_PLAYER_META_ENTRIES 10000
typedef struct
{
    char* key;
    char* username;
} PlayerKey;
PlayerKey db_player_key[MAX_PLAYER_KEY_ENTRIES];
typedef struct
{
    u32 player_key_id;
    u32 score;
} ServerPlayerMeta;
ServerPlayerMeta db_server_player_meta[MAX_SERVER_PLAYER_META_ENTRIES];
typedef struct
{
    u32 player_key_id; // maps to PlayerKey (db)
    u32 server_player_id; // maps to wasm_game players[] id
} ServerPlayer;

bool write_db_to_file(const char* filename)
{
    FILE* file = fopen(filename, "wb");
    if (!file)
    {
        return false;
    }

    size_t player_key_count = sizeof(db_player_key) / sizeof(PlayerKey);
    fwrite(&player_key_count, sizeof(size_t), 1, file);
    fwrite(&db_player_key, sizeof(PlayerKey), player_key_count, file);

    // todo: meta

    // todo: server player data

    fclose(file);
    return true;
}
bool read_from_db_file(const char* filename)
{
    FILE* file = fopen(filename, "rb");
    if (!file)
    {
        return false;
    }

    size_t player_key_count;
    fread(&player_key_count, sizeof(size_t), 1, file);
    fread(&db_player_key, sizeof(PlayerKey), player_key_count, file);

    fclose(file);
    return true;
}
// --------- SQLITE REPLACEMENT


// --------- UUID REPLACEMENT
u32 generate_ghost_key(u32 value)
{
    struct timespec tms;
    if (clock_gettime(CLOCK_REALTIME, &tms))
    {
        return 0;
    }
    u32 ghost_id = (u32)tms.tv_sec;
    
    // Check for overflow before adding
    if (ghost_id > UINT32_MAX - value) {
        return ghost_id;
    }
    
    ghost_id += value;
    return ghost_id;
}
// --------- UUID REPLACEMENT


typedef struct
{
    uuid_t key;
    char username[64];
} Player;
typedef struct {
    Player players[SERVER_MAX_PLAYERS];
    int player_count;
} GameState;

void serve_file(const char* filename, int client_socket) {
    printf("Attempting to serve file: %s\n", filename);  // Debug log
    
    int fd = open(filename, O_RDONLY);
    if (fd < 0) {
        printf("Failed to open file: %s (errno: %d)\n", filename, errno);  // Debug log
        const char* response = "HTTP/1.1 404 Not Found\r\n"
                             "Content-Type: text/plain\r\n"
                             "Content-Length: 9\r\n\r\n"
                             "Not Found";
        write(client_socket, response, strlen(response));
        return;
    }

    struct stat file_stat;
    fstat(fd, &file_stat);
    
    const char* content_type = "text/plain";
    if (strstr(filename, ".html")) {
        content_type = "text/html";
    } else if (strstr(filename, ".png")) {
        content_type = "image/png";
    } else if (strstr(filename, ".jpg") || strstr(filename, ".jpeg")) {
        content_type = "image/jpeg";
    }
    
    char header[512];
    sprintf(header, "HTTP/1.1 200 OK\r\n"
                   "Content-Type: %s\r\n"
                   "Content-Length: %ld\r\n\r\n", 
                   content_type, file_stat.st_size);
    write(client_socket, header, strlen(header));

    printf("Sending file of size: %ld bytes\n", file_stat.st_size);  // Debug log

    char buffer[4096];
    ssize_t bytes_read;
    size_t total_sent = 0;
    while ((bytes_read = read(fd, buffer, sizeof(buffer))) > 0) {
        ssize_t bytes_written = write(client_socket, buffer, bytes_read);
        if (bytes_written < 0) {
            printf("Error writing to socket: %d\n", errno);  // Debug log
            break;
        }
        total_sent += bytes_written;
    }

    printf("Total bytes sent: %zu\n", total_sent);  // Debug log
    
    if (bytes_read < 0) {
        printf("Error reading file: %d\n", errno);  // Debug log
    }

    close(fd);
    printf("File serving complete\n");  // Debug log
}

void handle_generate_key(GameState* state, const char* username, char* response) {
    // Generate a unique key using timestamp + some random value
    u32 ghost_key = generate_ghost_key(rand() % 10000);
    
    // Find first empty slot in db_player_key array
    int slot = -1;
    for (int i = 0; i < MAX_PLAYER_KEY_ENTRIES; i++) {
        if (db_player_key[i].key == NULL) {
            slot = i;
            break;
        }
    }
    
    if (slot == -1) {
        sprintf(response, 
            "HTTP/1.1 500 Internal Server Error\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Database full\"}");
        return;
    }
    
    // Allocate memory and store the key and username
    char key_str[32];
    sprintf(key_str, "%u", ghost_key);
    db_player_key[slot].key = strdup(key_str);
    db_player_key[slot].username = strdup(username);
    
    // Save to file
    if (!write_db_to_file(DB_FILENAME)) {
        sprintf(response, 
            "HTTP/1.1 500 Internal Server Error\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Failed to save to database\"}");
        return;
    }

    sprintf(response, 
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n\r\n"
        "{\"keyString\":\"%s\",\"username\":\"%s\"}", 
        key_str, username);
}

bool handle_validate_key(GameState* state, const char* key_str, const char* username, char* response, bool is_validation_route) {
    printf("Validating key: %s for user: %s\n", key_str, username);  // Debug log
    
    // Input validation
    if (!key_str || !username || strlen(key_str) == 0 || strlen(username) == 0 || key_str == NULL || username == NULL) {
        if (is_validation_route) {
            sprintf(response, 
                "HTTP/1.1 400 Bad Request\r\n"
                "Content-Type: application/json\r\n\r\n"
                "{\"success\":false,\"message\":\"Invalid input: missing key or username\"}");
        }
        return false;
    }
    
    // Read latest database state
    if (!read_from_db_file(DB_FILENAME)) {
        if (is_validation_route) {
            sprintf(response, 
                "HTTP/1.1 500 Internal Server Error\r\n"
                "Content-Type: application/json\r\n\r\n"
                "{\"success\":false,\"message\":\"Failed to read database\"}");
        }
        return false;
    }
    printf("Made it here");
    
    // Search for matching key in our db_player_key array
    bool found = false;
    for (int i = 0; i < MAX_PLAYER_KEY_ENTRIES; i++) {
        if (db_player_key[i].key != NULL && db_player_key[i].username != NULL && strlen(db_player_key[i].key) > 0 && strlen(db_player_key[i].username) > 0) {
            if (strcmp(db_player_key[i].key, key_str) == 0) {
                // Found matching key, now check username
                if (strcmp(db_player_key[i].username, username) == 0) {
                    found = true;
                    if (is_validation_route) {
                        sprintf(response, 
                            "HTTP/1.1 200 OK\r\n"
                            "Content-Type: application/json\r\n\r\n"
                            "{\"success\":true,\"message\":\"Key validated, access granted!\"}");
                    }
                    return true;
                } else {
                    printf("Username mismatch: %s != %s\n", db_player_key[i].username, username);
                    if (is_validation_route) {
                        sprintf(response, 
                            "HTTP/1.1 200 OK\r\n"
                            "Content-Type: application/json\r\n\r\n"
                            "{\"success\":false,\"message\":\"Username mismatch\"}");
                    }
                    return false;
                }
            }
        }
    }
    
    printf("No matching key found in database\n");
    if (is_validation_route) {
        sprintf(response, 
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Invalid key\"}");
    }
    return false;
}

// Structure to hold parsed authentication data
typedef struct {
    char* keystring;
    char* username;
} AuthData;

// Function to parse authentication data from buffer
AuthData parse_auth_data(const char* buffer, u32* out_index) {
    AuthData auth = {0};
    
    // Find the start of the body after HTTP headers
    const char* body_start = strstr(buffer, "\r\n\r\n");
    if (!body_start) {
        *out_index = 0;
        return auth;
    }
    body_start += 4;  // Skip the \r\n\r\n
    
    u32 indx = body_start - buffer;  // Get the correct starting position
    u8 keystring_length = buffer[indx];
    u8 username_length = buffer[indx + 1];
    indx += 2;
    
    // Allocate and copy keystring
    auth.keystring = (char*)malloc(keystring_length + 1);
    for (u32 c = 0; c < keystring_length; ++c) {
        auth.keystring[c] = buffer[indx + c];
    }
    auth.keystring[keystring_length] = '\0';
    
    // Move index past keystring
    indx += keystring_length;
    
    // Allocate and copy username
    auth.username = (char*)malloc(username_length + 1);
    for (u32 c = 0; c < username_length; ++c) {
        auth.username[c] = buffer[indx + c];
    }
    auth.username[username_length] = '\0';
    
    // Set output index to where we stopped reading
    *out_index = indx + username_length;
    
    return auth;
}

// Function to parse raw u32 values from buffer
u32* parse_raw_data(const char* buffer, u32 start_index, size_t buffer_size, u32* out_count) {
    u32 max_values = (buffer_size - start_index) / 4; // Each u32 takes 4 bytes
    u32* values = (u32*)malloc(max_values * sizeof(u32));
    u32 count = 0;
    u32 indx = start_index;
    
    // Read until we can't form another complete u32 (need 4 bytes)
    while (indx + 3 < buffer_size) {
        values[count] = (buffer[indx] << 24) |
                       (buffer[indx + 1] << 16) |
                       (buffer[indx + 2] << 8) |
                       (buffer[indx + 3]);
        indx += 4;
        count++;
    }
    
    *out_count = count;
    return values;
}

void handle_http_request(const char* request, int client_socket) {
    printf("Parsing request: %.100s\n", request);  // Debug log - show first 100 chars
    
    // Extract the path from the HTTP request
    char path[256] = {0};
    if (sscanf(request, "GET %255s", path) != 1) {
        printf("Failed to parse request path\n");
        return;
    }
    
    // Remove any query parameters
    char* query = strchr(path, '?');
    if (query) *query = '\0';
    
    // Convert URL path to file path
    char file_path[256] = ".";  // Serve from current directory
    if (strcmp(path, "/") == 0) {
        strcat(file_path, "/index.html");
    } else {
        strcat(file_path, path);
    }
    
    printf("Attempting to serve: %s\n", file_path);  // Debug log
    serve_file(file_path, client_socket);
}

ssize_t receive_full_request(int socket, char** buffer) {
    size_t total_size = 0;
    size_t buffer_size = REQUEST_BUFFER_SIZE;
    *buffer = malloc(buffer_size);
    if (!*buffer) {
        return -1;
    }
    
    while (1) {
        // Check if we need to expand the buffer
        if (total_size >= buffer_size - REQUEST_BUFFER_SIZE) {
            buffer_size *= 2;
            char* new_buffer = realloc(*buffer, buffer_size);
            if (!new_buffer) {
                free(*buffer);
                return -1;  // Memory allocation failed
            }
            *buffer = new_buffer;
        }
        
        // Receive next chunk
        ssize_t bytes_read = recv(socket, *buffer + total_size, REQUEST_BUFFER_SIZE, 0);
        
        if (bytes_read < 0) {
            free(*buffer);
            return -1;  // Error
        }
        
        if (bytes_read == 0) {
            break;  // Connection closed
        }
        
        total_size += bytes_read;
        
        // Check for complete request by looking for end of headers
        if (total_size >= 4 && 
            strstr(*buffer + total_size - bytes_read, "\r\n\r\n")) {
            break;
        }
        
        // Implement maximum size limit (2MB)
        if (total_size > 2048 * 2048) {
            free(*buffer);
            return -2;  // Request too large
        }
    }
    
    return total_size;
}

int main() {
    GameState state = {0};

    // THIS IS GAME FUNCTIONALITY
    initialize_game();

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("Socket creation failed");
        return 1;
    }

    // Enable socket reuse and keep-alive
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0 ||
        setsockopt(server_fd, SOL_SOCKET, SO_KEEPALIVE, &opt, sizeof(opt)) < 0) {
        perror("setsockopt failed");
        return 1;
    }

    struct sockaddr_in address = {
        .sin_family = AF_INET,
        .sin_addr.s_addr = INADDR_ANY,
        .sin_port = htons(PORT)
    };

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("Bind failed");
        close(server_fd);
        return 1;
    }

    if (listen(server_fd, SOMAXCONN) < 0) {
        perror("Listen failed");
        close(server_fd);
        return 1;
    }

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t addr_len = sizeof(client_addr);
        
        printf("Waiting for new connection...\n");
        int new_socket = accept(server_fd, (struct sockaddr *)&client_addr, &addr_len);
        if (new_socket < 0) {
            perror("Accept failed");
            continue;
        }
        printf("New connection accepted\n");

        // Set socket timeout
        struct timeval tv = {.tv_sec = 5, .tv_usec = 0};
        setsockopt(new_socket, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
        setsockopt(new_socket, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));

        char* buffer;
        ssize_t request_size = receive_full_request(new_socket, &buffer);
        
        if (request_size < 0) {
            if (request_size == -2) {
                // Request too large
                const char* error = "HTTP/1.1 413 Payload Too Large\r\n"
                                  "Content-Type: application/json\r\n\r\n"
                                  "{\"success\":false,\"message\":\"Request too large\"}";
                send(new_socket, error, strlen(error), 0);
            } else {
                // Other error
                const char* error = "HTTP/1.1 500 Internal Server Error\r\n"
                                  "Content-Type: application/json\r\n\r\n"
                                  "{\"success\":false,\"message\":\"Internal server error\"}";
                send(new_socket, error, strlen(error), 0);
            }
            close(new_socket);
            continue;
        }

        printf("Received request of size: %ld\n", request_size);
        char response[REQUEST_BUFFER_SIZE] = {0};

        if (strncmp(buffer, "GET ", 4) == 0) {
            handle_http_request(buffer, new_socket);
        } else if (strstr(buffer, "POST /generatekey")) {
            handle_generate_key(&state, "username", response);
            send(new_socket, response, strlen(response), 0);
        } else if (strstr(buffer, "POST /validatekey")) {
            // Parse JSON body from request
            char* body_start = strstr(buffer, "\r\n\r\n");
            if (body_start) {
                body_start += 4;  // Skip the \r\n\r\n

                u32 data_start_index = body_start ? body_start - buffer : -1;
                AuthData auth = parse_auth_data(buffer, &data_start_index);
                printf("keystring is %s\n", auth.keystring);
                printf("username is %s\n", auth.username);

                u32 value_count;
                u32* raw_values = parse_raw_data(buffer, data_start_index, request_size, &value_count);
                for (u32 i = 0; i < value_count; ++i) {
                    printf("raw value %d\n", raw_values[i]);
                }
                free(raw_values);

                // u32 indx = body_start ? body_start - buffer : -1;
                // u8 keystring_length = buffer[indx];
                // u8 username_length = buffer[indx+1];
                // indx += 2;
                // u32 total = keystring_length + username_length;
                // printf("Total body length %d\n", total);
                // printf("first value %d\n", keystring_length);
                // printf("second value %d\n", username_length);
                // printf("index %d\n", indx);

                // char keystring[keystring_length + 1];
                // for (u32 c = 0; c < keystring_length; ++c)
                // {
                //     keystring[c] = (char)buffer[indx + c];
                // }
                // keystring[keystring_length] = '\0';
                // printf("keystring is %s\n", (char *)keystring);

                // indx += keystring_length;
                // char username[username_length + 1];
                // for (u32 c = 0; c < username_length; ++c)
                // {
                //     username[c] = (char)buffer[indx + c];
                // }
                // username[username_length] = '\0';
                // printf("username is %s\n", (char *)username);
                // indx += username_length;

                // u32 remaining = (buffer[indx] << 24) |
                //     (buffer[indx + 1] << 16) |
                //     (buffer[indx + 2] << 8) |
                //     (buffer[indx + 3]);
                // indx += 4;
                // printf("DEBUG -> rest of data %d\n", remaining);
                // // iterate from indx to remaining and every 4 iterations, add a u32 value
                // u32 rest_of_data[remaining];
                // for (u32 c = 0; c < remaining; ++c)
                // {
                //     rest_of_data[c] = (buffer[indx] << 24) |
                //         (buffer[indx + 1] << 16) |
                //         (buffer[indx + 2] << 8) |
                //         (buffer[indx + 3]);
                //     indx += 4;
                // }
                // printf("DEBUG -> rod 1 %d\n", rest_of_data[0]);
                // printf("DEBUG -> rod 2 %d\n", rest_of_data[1]);
                
                if (strlen(auth.keystring) > 0 && strlen(auth.username) > 0)
                {
                    printf("Validating key: %s for user: %s\n", auth.keystring, auth.username);  // Debug log
                    handle_validate_key(&state, auth.keystring, auth.username, response, true);
                }
                else
                {
                    sprintf(response, 
                        "HTTP/1.1 400 Bad Request\r\n"
                        "Content-Type: application/json\r\n\r\n"
                        "{\"success\":false,\"message\":\"Missing key or username\"}");
                }
                // TODO: Does this actually free the memory?
                free(auth.keystring);
                free(auth.username);
            } else {
                printf("No request body found\n");  // Debug log
                sprintf(response, 
                    "HTTP/1.1 400 Bad Request\r\n"
                    "Content-Type: application/json\r\n\r\n"
                    "{\"success\":false,\"message\":\"Missing request body\"}");
            }
            send(new_socket, response, strlen(response), 0);
        } else if (strstr(buffer, "POST /getgamestate")) {
            // First validate, then send game state
            // if (!handle_validate_key(&state, keystring, username, response, false)) {
            //     sprintf(response, 
            //         "HTTP/1.1 401 Unauthorized\r\n"
            //         "Content-Type: application/json\r\n\r\n"
            //         "{\"success\":false,\"message\":\"Invalid credentials\"}");
            //     send(new_socket, response, strlen(response), 0);
            //     continue;
            // }
            // g_storage_ships[MAX_SHIPS]
            char gamedata[256] = "";
            u32 gamestatedata[10] = {6, 69, 69, 69, 69, 69, 69, 69, 429496700, 69};
            for (int i = 0; i < 10; ++i)
            {
                char buffer[32];
                sprintf(buffer, "%d%s", gamestatedata[i], (i < 9 ? "," : ""));
                strcat(gamedata, buffer);
            }
            sprintf(response, 
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: application/json\r\n\r\n"
                "{\"success\":true,\"message\":\"Missing request body\",\"data\":[%s]}",
                gamedata);
            send(new_socket, response, strlen(response), 0);
        } else {
            printf("Unsupported request type\n");
            const char* not_found = "HTTP/1.1 404 Not Found\r\n"
                                  "Content-Type: text/plain\r\n"
                                  "Content-Length: 9\r\n\r\n"
                                  "Not Found";
            send(new_socket, not_found, strlen(not_found), 0);
        }

        printf("Closing client socket\n");
        close(new_socket);
        free(buffer);  // Free the dynamically allocated buffer
        memset(response, 0, REQUEST_BUFFER_SIZE);
    }

    close(server_fd);
    return 0;
}