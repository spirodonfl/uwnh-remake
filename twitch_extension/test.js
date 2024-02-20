async function getCurrentUser(auth) { 
    let token = auth.helixToken;
    let userId = window.Twitch.ext.viewer.id;
    return fetch(`https://api.twitch.tv/helix/users?id=${userId}`, {
    headers: {
        "Client-Id": "0vpbl0c5ofnfk1m4ydwnfhiz065z3r",
        "Authorization": `Extension ${token}`,
    }})
    .then(res => res.json())
    .then(res => res.data[0])
}

window.Twitch.ext.onAuthorized(async (auth) => {
    let currentUser = await getCurrentUser(auth);
    console.log(currentUser);
    console.log(currentUser.login);
    console.log(currentUser.display_name);
    var player_ryans_backend = new WebSocket('wss://spirodon.games/playersocket/websocket');
    player_ryans_backend.onerror = function() {
        console.log('S_MY_D');
        player_ryans_backend.close();
    };
    player_ryans_backend.onclose = function() {
        console.log('S-ED_MY_D');
    };
    player_ryans_backend.onmessage = function(event) {
        var data = JSON.parse(event.data);
        console.log('PLAYERINRYANSBACKEND', data);
    };
    player_ryans_backend.onopen = function() {
        player_ryans_backend.send(JSON.stringify({
            "command": "down",
            "ts": 1708315762,
            "user": {
                "display_name": currentUser.display_name,
                "user_login": currentUser.login,
                "channel": "spirodonfl"
            }
        }));
    };
});

