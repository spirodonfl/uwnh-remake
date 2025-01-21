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
    int fd = open(filename, O_RDONLY);
    if (fd < 0) {
        const char* response = "HTTP/1.1 404 Not Found\r\n"
                             "Content-Type: text/plain\r\n"
                             "Content-Length: 9\r\n\r\n"
                             "Not Found";
        write(client_socket, response, strlen(response));
        return;
    }

    struct stat file_stat;
    fstat(fd, &file_stat);
    
    char header[512];
    sprintf(header, "HTTP/1.1 200 OK\r\n"
                   "Content-Type: text/html\r\n"
                   "Content-Length: %ld\r\n\r\n", 
                   file_stat.st_size);
    write(client_socket, header, strlen(header));

    char buffer[4096];
    ssize_t bytes_read;
    while ((bytes_read = read(fd, buffer, sizeof(buffer))) > 0) {
        write(client_socket, buffer, bytes_read);
    }

    close(fd);
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

void handle_validate_key(GameState* state, const char* key_str, 
                        const char* username, char* response) {
    uuid_t key;
    uuid_parse(key_str, key);
    
    char* sql = "SELECT username FROM keys WHERE key = ?;";
    sqlite3_stmt* stmt;
    sqlite3_prepare_v2(state->db, sql, -1, &stmt, 0);
    sqlite3_bind_blob(stmt, 1, key, sizeof(uuid_t), SQLITE_STATIC);
    
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        const char* db_username = (const char*)sqlite3_column_text(stmt, 0);
        if (strcmp(db_username, username) == 0) {
            sprintf(response, 
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: application/json\r\n\r\n"
                "{\"success\":true,\"message\":\"Key validated, access granted!\"}");
        }
    } else {
        sprintf(response, 
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n\r\n"
            "{\"success\":false,\"message\":\"Invalid key or username mismatch\"}");
    }
    sqlite3_finalize(stmt);
}

int main() {
    GameState state = {0};
    sqlite3_open("game.db", &state.db);
    init_database(state.db);

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in address = {
        .sin_family = AF_INET,
        .sin_addr.s_addr = INADDR_ANY,
        .sin_port = htons(PORT)
    };

    bind(server_fd, (struct sockaddr *)&address, sizeof(address));
    listen(server_fd, 3);

    char buffer[BUFFER_SIZE] = {0};
    char response[BUFFER_SIZE] = {0};

    printf("Server started on port %d\n", PORT);

    while (1) {
        int new_socket = accept(server_fd, NULL, NULL);
        read(new_socket, buffer, BUFFER_SIZE);

        if (strstr(buffer, "GET /index.html") || strstr(buffer, "GET /")) {
            serve_file("index.html", new_socket);
        } else if (strstr(buffer, "POST /generatekey")) {
            handle_generate_key(&state, "username", response);
            write(new_socket, response, strlen(response));
        } else if (strstr(buffer, "POST /validatekey")) {
            handle_validate_key(&state, "key_str", "username", response);
            write(new_socket, response, strlen(response));
        } else {
            sprintf(response, "HTTP/1.1 404 Not Found\r\n\r\n");
            write(new_socket, response, strlen(response));
        }

        close(new_socket);
        memset(buffer, 0, BUFFER_SIZE);
        memset(response, 0, BUFFER_SIZE);
    }

    sqlite3_close(state.db);
    return 0;
}
