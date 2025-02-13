#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <json-c/json.h>
#include <websockets/libwebsockets.h>
#include <pthread.h>

#define GAME_URL "https://spirodonfl.github.io/uwnh-remake/"
#define SPECIAL_ROLE "CanPlayGame"
#define DISCORD_API_URL "https://discord.com/api/v10"
#define DISCORD_GATEWAY_URL "wss://gateway.discord.gg/?v=10&encoding=json"

// Structure to store response data from HTTP request
struct ResponseData {
    char *data;
    size_t size;
};

// Bot state
static struct {
    char *token;
    struct lws_context *ws_context;
    struct lws *ws_client;
    int heartbeat_interval;
    int last_sequence;
    pthread_t heartbeat_thread;
} bot_state = {0};

// Callback function for CURL
static size_t write_callback(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t realsize = size * nmemb;
    struct ResponseData *mem = (struct ResponseData *)userp;
    
    char *ptr = realloc(mem->data, mem->size + realsize + 1);
    if (!ptr) return 0;
    
    mem->data = ptr;
    memcpy(&(mem->data[mem->size]), contents, realsize);
    mem->size += realsize;
    mem->data[mem->size] = 0;
    
    return realsize;
}

// Function to make HTTP requests to Discord API
static json_object* discord_request(const char* endpoint, const char* method, const char* payload) {
    CURL *curl = curl_easy_init();
    struct ResponseData response = {0};
    response.data = malloc(1);
    
    if (curl) {
        char url[256];
        snprintf(url, sizeof(url), "%s%s", DISCORD_API_URL, endpoint);
        
        struct curl_slist *headers = NULL;
        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "Authorization: Bot %s", bot_state.token);
        headers = curl_slist_append(headers, auth_header);
        headers = curl_slist_append(headers, "Content-Type: application/json");
        
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, method);
        if (payload) {
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload);
        }
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
        
        CURLcode res = curl_easy_perform(curl);
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
        
        if (res == CURLE_OK) {
            return json_tokener_parse(response.data);
        }
    }
    
    free(response.data);
    return NULL;
}

// Function to send a message to a Discord channel
static void send_message(const char* channel_id, const char* content) {
    char payload[512];
    snprintf(payload, sizeof(payload), "{\"content\":\"%s\"}", content);
    char endpoint[64];
    snprintf(endpoint, sizeof(endpoint), "/channels/%s/messages", channel_id);
    json_object* response = discord_request(endpoint, "POST", payload);
    if (response) json_object_put(response);
}

// Heartbeat thread function
static void* heartbeat_thread(void* arg) {
    while (1) {
        char payload[64];
        snprintf(payload, sizeof(payload), "{\"op\":1,\"d\":%d}", bot_state.last_sequence);
        lws_write(bot_state.ws_client, (unsigned char*)payload, strlen(payload), LWS_WRITE_TEXT);
        sleep(bot_state.heartbeat_interval / 1000);
    }
    return NULL;
}

// WebSocket callback
static int ws_callback(struct lws *wsi, enum lws_callback_reasons reason,
                      void *user, void *in, size_t len) {
    switch (reason) {
        case LWS_CALLBACK_CLIENT_ESTABLISHED: {
            // Send identify payload
            char identify[512];
            snprintf(identify, sizeof(identify),
                    "{\"op\":2,\"d\":{\"token\":\"%s\",\"intents\":513,\"properties\":{\"$os\":\"linux\",\"$browser\":\"custom\",\"$device\":\"custom\"}}}",
                    bot_state.token);
            lws_write(wsi, (unsigned char*)identify, strlen(identify), LWS_WRITE_TEXT);
            break;
        }
        
        case LWS_CALLBACK_CLIENT_RECEIVE: {
            json_object *msg = json_tokener_parse((char*)in);
            if (!msg) break;
            
            int op = json_object_get_int(json_object_object_get(msg, "op"));
            if (op == 10) {
                // Handle HELLO
                json_object *d = json_object_object_get(msg, "d");
                bot_state.heartbeat_interval = json_object_get_int(json_object_object_get(d, "heartbeat_interval"));
                pthread_create(&bot_state.heartbeat_thread, NULL, heartbeat_thread, NULL);
            }
            else if (op == 0) {
                // Handle dispatch events
                const char *t = json_object_get_string(json_object_object_get(msg, "t"));
                if (strcmp(t, "MESSAGE_CREATE") == 0) {
                    json_object *d = json_object_object_get(msg, "d");
                    const char *content = json_object_get_string(json_object_object_get(d, "content"));
                    
                    if (strncmp(content, "!getKey", 7) == 0) {
                        // Handle getKey command
                        json_object *author = json_object_object_get(d, "author");
                        const char *username = json_object_get_string(json_object_object_get(author, "username"));
                        
                        // Check for special role
                        int has_role = 0;
                        json_object *member = json_object_object_get(d, "member");
                        if (member) {
                            json_object *roles = json_object_object_get(member, "roles");
                            int roles_len = json_object_array_length(roles);
                            for (int i = 0; i < roles_len; i++) {
                                const char *role_name = json_object_get_string(json_object_array_get_idx(roles, i));
                                if (strcmp(role_name, SPECIAL_ROLE) == 0) {
                                    has_role = 1;
                                    break;
                                }
                            }
                        }
                        
                        if (!has_role) {
                            const char *channel_id = json_object_get_string(json_object_object_get(d, "channel_id"));
                            send_message(channel_id, "You don't have the necessary permissions to use this command.");
                            break;
                        }
                        
                        // Make request to key generation service
                        char payload[256];
                        snprintf(payload, sizeof(payload), "{\"username\":\"%s\"}", username);
                        json_object *key_response = discord_request("http://localhost:3333/generateKey", "POST", payload);
                        
                        if (key_response) {
                            const char *key = json_object_get_string(json_object_object_get(key_response, "key"));
                            char response[512];
                            snprintf(response, sizeof(response), 
                                    "Here is your link to play the game: %s?is_multiplayer=true&key=%s",
                                    GAME_URL, key);
                            
                            const char *channel_id = json_object_get_string(json_object_object_get(d, "channel_id"));
                            send_message(channel_id, response);
                            
                            json_object_put(key_response);
                        }
                    }
                }
            }
            
            bot_state.last_sequence = json_object_get_int(json_object_object_get(msg, "s"));
            json_object_put(msg);
            break;
        }
    }
    return 0;
}

int main(void) {
    // Initialize bot state
    bot_state.token = getenv("BOT_TOKEN");
    if (!bot_state.token) {
        fprintf(stderr, "BOT_TOKEN environment variable not set\n");
        return 1;
    }
    
    // Initialize libwebsockets
    struct lws_context_creation_info info = {0};
    info.port = CONTEXT_PORT_NO_LISTEN;
    info.protocols = (struct lws_protocols[]) {
        {
            "discord-gateway",
            ws_callback,
            0,
            0,
        },
        { NULL, NULL, 0, 0 }
    };
    info.gid = -1;
    info.uid = -1;
    
    bot_state.ws_context = lws_create_context(&info);
    if (!bot_state.ws_context) {
        fprintf(stderr, "Failed to create websocket context\n");
        return 1;
    }
    
    struct lws_client_connect_info ccinfo = {0};
    ccinfo.context = bot_state.ws_context;
    ccinfo.address = "gateway.discord.gg";
    ccinfo.port = 443;
    ccinfo.path = "/?v=10&encoding=json";
    ccinfo.host = ccinfo.address;
    ccinfo.origin = ccinfo.address;
    ccinfo.protocol = "discord-gateway";
    ccinfo.ssl_connection = LCCSCF_USE_SSL;
    
    bot_state.ws_client = lws_client_connect_via_info(&ccinfo);
    if (!bot_state.ws_client) {
        fprintf(stderr, "Failed to connect to Discord gateway\n");
        return 1;
    }
    
    // Main event loop
    while (1) {
        lws_service(bot_state.ws_context, 50);
    }
    
    // Cleanup
    lws_context_destroy(bot_state.ws_context);
    return 0;
}