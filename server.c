// clang -o game_server game_server.c -lsqlite3 -luuid -ljson-c
// ./game_server
//
// POTENTIAL STATIC LINKED VERSION TO RUN THIS ON ANOTHER UBUNTU SERVER?
// clang -static game_server.c -o game_server -lsqlite3 -luuid -ljson-c -lunwind -static-libgcc
//
// WINDOWS CLANG
// clang -target x86_64-pc-windows-gnu main.c -o program.exe

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sqlite3.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <uuid/uuid.h>
#include <json-c/json.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <errno.h>

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

#define MAX_PLAYERS 10
#define COUNTDOWN_SECONDS 120
#define PORT 3333
#define BUFFER_SIZE 1024

typedef struct {
    uuid_t key;
    char username[64];
} Player;

typedef struct {
    Player players[MAX_PLAYERS];
    int player_count;
    sqlite3* db;
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

void init_database(sqlite3* db) {
    char* err_msg = 0;
    const char* sql = 
        "CREATE TABLE IF NOT EXISTS users ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT,"
        "username TEXT UNIQUE,"
        "score INTEGER DEFAULT 0);"
        
        "CREATE TABLE IF NOT EXISTS keys ("
        "key BLOB PRIMARY KEY,"
        "username TEXT,"
        "FOREIGN KEY(username) REFERENCES users(username));";

    int rc = sqlite3_exec(db, sql, 0, 0, &err_msg);
    if (rc != SQLITE_OK) {
        fprintf(stderr, "SQL error: %s\n", err_msg);
        sqlite3_free(err_msg);
    }
}

void handle_generate_key(GameState* state, const char* username, char* response) {
    uuid_t key;
    char key_str[37];
    uuid_generate(key);
    uuid_unparse(key, key_str);

    char* sql = "INSERT OR IGNORE INTO users (username) VALUES (?);";
    sqlite3_stmt* stmt;
    sqlite3_prepare_v2(state->db, sql, -1, &stmt, 0);
    sqlite3_bind_text(stmt, 1, username, -1, SQLITE_STATIC);
    sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    sql = "INSERT INTO keys (key, username) VALUES (?, ?);";
    sqlite3_prepare_v2(state->db, sql, -1, &stmt, 0);
    sqlite3_bind_blob(stmt, 1, key, sizeof(uuid_t), SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, username, -1, SQLITE_STATIC);
    sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    sprintf(response, 
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n\r\n"
        "{\"keyString\":\"%s\",\"username\":\"%s\"}", 
        key_str, username);
}

void handle_validate_key(GameState* state, const char* key_str, const char* username, char* response) {
    printf("Validating key: %s for user: %s\n", key_str, username);  // Debug log
    
    uuid_t key;
    if (uuid_parse(key_str, key) < 0) {
        printf("Failed to parse UUID\n");  // Debug log
        sprintf(response, 
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Invalid UUID format\"}");
        return;
    }
    
    char* sql = "SELECT username FROM keys WHERE key = ?;";
    sqlite3_stmt* stmt;
    int rc = sqlite3_prepare_v2(state->db, sql, -1, &stmt, 0);
    if (rc != SQLITE_OK) {
        printf("SQL prepare error: %s\n", sqlite3_errmsg(state->db));  // Debug log
        sprintf(response, 
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Database error\"}");
        return;
    }
    
    rc = sqlite3_bind_blob(stmt, 1, key, sizeof(uuid_t), SQLITE_STATIC);
    if (rc != SQLITE_OK) {
        printf("SQL bind error: %s\n", sqlite3_errmsg(state->db));  // Debug log
        sqlite3_finalize(stmt);
        sprintf(response, 
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Database error\"}");
        return;
    }
    
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        const char* db_username = (const char*)sqlite3_column_text(stmt, 0);
        printf("Found username in DB: %s\n", db_username);  // Debug log
        if (strcmp(db_username, username) == 0) {
            sprintf(response, 
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: application/json\r\n\r\n"
                "{\"success\":true,\"message\":\"Key validated, access granted!\"}");
        } else {
            printf("Username mismatch: %s != %s\n", db_username, username);  // Debug log
            sprintf(response, 
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: application/json\r\n\r\n"
                "{\"success\":false,\"message\":\"Username mismatch\"}");
        }
    } else {
        printf("No matching key found in database\n");  // Debug log
        sprintf(response, 
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Invalid key\"}");
    }
    sqlite3_finalize(stmt);
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

int main() {
    GameState state = {0};
    sqlite3_open("game.db", &state.db);
    init_database(state.db);

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

    char buffer[BUFFER_SIZE] = {0};
    char response[BUFFER_SIZE] = {0};

    printf("Server started on port %d\n", PORT);

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t addr_len = sizeof(client_addr);
        
        printf("Waiting for new connection...\n");  // Debug log
        int new_socket = accept(server_fd, (struct sockaddr *)&client_addr, &addr_len);
        if (new_socket < 0) {
            perror("Accept failed");
            continue;
        }
        printf("New connection accepted\n");  // Debug log

        // Set socket timeout
        struct timeval tv = {.tv_sec = 5, .tv_usec = 0};
        setsockopt(new_socket, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
        setsockopt(new_socket, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));

        ssize_t bytes_read = recv(new_socket, buffer, BUFFER_SIZE - 1, 0);
        if (bytes_read <= 0) {
            printf("Receive error or connection closed: %d\n", errno);  // Debug log
            close(new_socket);
            continue;
        }
        buffer[bytes_read] = '\0';
        printf("Received request:\n%s\n", buffer);  // Debug log

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
                
                printf("Parsing JSON body: %s\n", body_start);  // Debug log
                
                struct json_object *parsed_json;
                parsed_json = json_tokener_parse(body_start);
                
                if (parsed_json) {
                    struct json_object *key_obj, *username_obj;
                    const char *key_str = NULL, *username = NULL;
                    
                    if (json_object_object_get_ex(parsed_json, "keyString", &key_obj)) {
                        key_str = json_object_get_string(key_obj);
                    }
                    if (json_object_object_get_ex(parsed_json, "username", &username_obj)) {
                        username = json_object_get_string(username_obj);
                    }
                    
                    if (key_str && username) {
                        printf("Validating key: %s for user: %s\n", key_str, username);  // Debug log
                        handle_validate_key(&state, key_str, username, response);
                    } else {
                        printf("Missing fields - key_str: %s, username: %s\n", 
                               key_str ? key_str : "null", 
                               username ? username : "null");  // Debug log
                        sprintf(response, 
                            "HTTP/1.1 400 Bad Request\r\n"
                            "Content-Type: application/json\r\n\r\n"
                            "{\"success\":false,\"message\":\"Missing key or username\"}");
                    }
                    
                    json_object_put(parsed_json);
                } else {
                    printf("Failed to parse JSON: %s\n", body_start);  // Debug log
                    sprintf(response, 
                        "HTTP/1.1 400 Bad Request\r\n"
                        "Content-Type: application/json\r\n\r\n"
                        "{\"success\":false,\"message\":\"Invalid JSON\"}");
                }
            } else {
                printf("No request body found\n");  // Debug log
                sprintf(response, 
                    "HTTP/1.1 400 Bad Request\r\n"
                    "Content-Type: application/json\r\n\r\n"
                    "{\"success\":false,\"message\":\"Missing request body\"}");
            }
            send(new_socket, response, strlen(response), 0);
        } else if (strstr(buffer, "POST /getgamestate")) {
            sprintf(response, 
                "HTTP/1.1 400 Bad Request\r\n"
                "Content-Type: application/json\r\n\r\n"
                "{\"success\":false,\"message\":\"Missing request body\"}");
            send(new_socket, response, strlen(response), 0);
        } else {
            printf("Unsupported request type\n");  // Debug log
            const char* not_found = "HTTP/1.1 404 Not Found\r\n"
                                  "Content-Type: text/plain\r\n"
                                  "Content-Length: 9\r\n\r\n"
                                  "Not Found";
            send(new_socket, not_found, strlen(not_found), 0);
        }

        printf("Closing client socket\n");  // Debug log
        close(new_socket);
        memset(buffer, 0, BUFFER_SIZE);
        memset(response, 0, BUFFER_SIZE);
    }

    close(server_fd);
    sqlite3_close(state.db);
    return 0;
}







// NOTE: You tried going the wasm3 route but it caused so many issues
// it's better to do a shared header file, hoist the macros into the header so you can get
// the macro functions, then share the .h file here and use it for the server too
// clang -static server.c -o game_server  -lsqlite3     -luuid     -ljson-c     -pthread     -static-libgcc     -lm     -ldl