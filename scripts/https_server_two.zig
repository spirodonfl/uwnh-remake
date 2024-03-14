const std = @import("std");

var clients: std.ArrayList(std.net.StreamServer.Client) = undefined;
var oauthToken: []const u8 = undefined;

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    clients = std.ArrayList(std.net.StreamServer.Client).init(allocator);

    var server = try std.net.StreamServer.init(.{ .reuse_address = true });
    defer server.deinit();

    try server.listen("127.0.0.1", 3000);

    while (true) {
        const client = try server.accept();
        clients.append(client) catch unreachable;

        var buf: [1024]u8 = undefined;
        const n = try client.read(buf[0..]);
        const request = std.mem.sliceTo(buf[0..n], 0);

        if (std.mem.startsWith(u8, request, "GET /websocket HTTP/1.1")) {
            try handleWebSocketHandshake(client);
            try listenForWebSocketMessages(client);
        } else if (std.mem.startsWith(u8, request, "GET /twitch HTTP/1.1")) {
            try client.writeAll("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nTwitch data");
        } else if (std.mem.startsWith(u8, request, "GET /oauth/callback")) {
            oauthToken = try extractOAuthToken(request);
            try client.writeAll("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nOAuth token received");
        } else {
            // Serve static files
            const path = std.fs.path.join(allocator, &[_][]const u8{".", request[4..]}) catch unreachable;
            defer allocator.free(path);

            if (std.fs.cwd().openFile(path, .{}) catch |err| {
                if (err == std.fs.File.OpenError.FileNotFound) {
                    try client.writeAll("HTTP/1.1 404 Not Found\r\n\r\n");
                } else {
                    try client.writeAll("HTTP/1.1 500 Internal Server Error\r\n\r\n");
                }
                continue;
            }) |file| {
                defer file.close();
                const fileSize = try file.getEndPos();
                var fileContent = try allocator.alloc(u8, fileSize);
                defer allocator.free(fileContent);
                try file.readAll(fileContent);
                try client.writeAll("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n");
                try client.writeAll(fileContent);
            }
        }
    }
}

fn handleWebSocketHandshake(client: std.net.StreamServer.Client) !void {
    var buf: [1024]u8 = undefined;
    const n = try client.read(buf[0..]);
    const request = std.mem.sliceTo(buf[0..n], 0);

    const key = std.mem.trim(u8, std.mem.sliceTo(request, std.mem.indexOf(u8, request, "Sec-WebSocket-Key: ") orelse return error.KeyNotFound), "\r\n");
    const acceptKey = try std.crypto.hash.sha1(allocator, key);
    defer allocator.free(acceptKey);

    try client.writeAll("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ");
    try client.writeAll(acceptKey);
    try client.writeAll("\r\n\r\n");
}

fn listenForWebSocketMessages(client: std.net.StreamServer.Client) !void {
    var buf: [1024]u8 = undefined;
    while (true) {
        const n = try client.read(buf[0..]);
        const message = std.mem.sliceTo(buf[0..n], 0);

        // Process the WebSocket message
        // Assuming a simple text message for demonstration
        if (std.mem.startsWith(u8, message, "0x81")) { // Assuming a text message
            const payload = message[6..]; // Skip the WebSocket frame header
            try broadcastMessage(payload);
        }
    }
}

fn broadcastMessage(message: []const u8) !void {
    for (clients.items) |client| {
        try client.writeAll("0x81"); // WebSocket text frame header
        try client.writeAll(std.fmt.bufPrint(allocator, "{:02X}\r\n\r\n", .{message.len})); // Length of the payload
        try client.writeAll(message);
    }
}

fn extractOAuthToken(request: []const u8) ![]const u8 {
    const tokenStart = std.mem.indexOf(u8, request, "code=") orelse return error.TokenNotFound;
    const tokenEnd = std.mem.indexOf(u8, request[tokenStart..], "&") orelse request.len;
    return request[tokenStart + 5 .. tokenEnd];
}

// POTENTIAL GOOGLE FLOW
const std = @import("std");

pub fn main() !void {
    const clientId = "YOUR_CLIENT_ID";
    const redirectUri = "YOUR_REDIRECT_URI";
    const scope = "https://www.googleapis.com/auth/youtube.force-ssl";
    const authUrl = std.fmt.allocPrint(allocator, "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope={}", .{clientId, redirectUri, scope}) catch unreachable;

    // Redirect the user to `authUrl`
}

fn handleRedirect(request: []const u8) ![]const u8 {
    const codeStart = std.mem.indexOf(u8, request, "code=") orelse return error.CodeNotFound;
    const codeEnd = std.mem.indexOf(u8, request[codeStart..], "&") orelse request.len;
    return request[codeStart + 5 .. codeEnd];
}

fn exchangeCodeForTokens(code: []const u8) !void {
    const clientId = "YOUR_CLIENT_ID";
    const clientSecret = "YOUR_CLIENT_SECRET";
    const redirectUri = "YOUR_REDIRECT_URI";
    const tokenUrl = "https://oauth2.googleapis.com/token";

    // Construct the POST request body
    const body = std.fmt.allocPrint(allocator, "code={}&client_id={}&client_secret={}&redirect_uri={}&grant_type=authorization_code", .{code, clientId, clientSecret, redirectUri}) catch unreachable;

    // Make the POST request to `tokenUrl` with `body` as the request body
    // Parse the response to extract the access token and refresh token
}
