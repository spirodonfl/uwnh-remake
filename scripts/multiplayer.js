// This file handles player connectivity for multi-player
var MULTIPLAYER = {
    ws: null,
    current_user: {
        id: 0,
        name: 'spirodonfl',
        login: 'spirodonfl',
    },
    spawned: false,
    init: function () {
        // TODO: This
    },
    handleInput: function (e) {
// function handleInput(e) {
//   switch (e.code) {
//     case "KeyW": return MULTIPLAYER.sendUp();
//     case "KeyA": return MULTIPLAYER.sendLeft();
//     case "KeyS": return MULTIPLAYER.sendDown();
//     case "KeyD": return MULTIPLAYER.sendRight();
//     case "KeyC": return MULTIPLAYER.connectToRyahnsBackend();
//     case "KeyP": return MULTIPLAYER.sendSpawn();
//     case "Space": return MULTIPLAYER.sendAttack();
//   }
// }
        console.log('MULTIPLAYER INPUT', e);
        if (e.code === 'KeyW') {
            MULTIPLAYER.sendUp();
        } else if (e.code === 'KeyA') {
            MULTIPLAYER.sendLeft();
        } else if (e.code === 'KeyS') {
            MULTIPLAYER.sendDown();
        } else if (e.code === 'KeyD') {
            MULTIPLAYER.sendRight();
        } else if (e.code === 'KeyC') {
            MULTIPLAYER.connectToRyansBackend();
        } else if (e.code === 'KeyP') {
            MULTIPLAYER.sendSpawn();
        } else if (e.code === 'Space') {
            MULTIPLAYER.sendAttack();
        }
    },
    sendDone() {
        // if (!spawned) { return; }
        MULTIPLAYER.ws.send(JSON.stringify({
            "cmd": "done",
        }));
        // spawned = false;
        // TODO: UI update controls
    },
    sendDown() {
        // if (!spawned) { return; }
        MULTIPLAYER.ws.send(JSON.stringify({
            "cmd": "down",
        }));
    },
    sendUp() {
        // if (!spawned) { return; }
        MULTIPLAYER.ws.send(JSON.stringify({
            "cmd": "up",
        }));
    },
    sendLeft() {
        // if (!spawned) { return; }
        MULTIPLAYER.ws.send(JSON.stringify({
            "cmd": "left",
        }));
    },
    sendRight() {
        // if (!spawned) { return; }
        MULTIPLAYER.ws.send(JSON.stringify({
            "cmd": "right",
        }));
    },
    sendSpawn() {
        // if (spawned) { return; }
        MULTIPLAYER.ws.send(JSON.stringify({
            "cmd": "spawn",
        }));
        // TODO: Ask ryan if we can send messages *back to the player* so we know if they spawned and whatnot
        // spawned = true;
    },
    sendAttack() {
        // if (!spawned) { return; }
        MULTIPLAYER.ws.send(JSON.stringify({
            "cmd": "attack",
        }));
    },
    connectToRyansBackend: function () {
        var url = 'wss://spirodon.games/playersocket/websocket';
        url += '?';
        url += 'channel=spirodonfl&';
        url += 'id=lemnean_sucks_deez_nutz&';
        url += 'login=' + MULTIPLAYER.current_user.login + '&';
        url += 'name=' + MULTIPLAYER.current_user.name;
        MULTIPLAYER.ws = new WebSocket(url);
        MULTIPLAYER.ws.onerror = function(e) {
            console.error(e);
            MULTIPLAYER.ws.close();
        };
        MULTIPLAYER.ws.onclose = function(e) {
            console.log('Connection Closed');
            console.error(e);
        };
        MULTIPLAYER.ws.onmessage = function(event) {
            var data = JSON.parse(event.data);
            console.log('PLAYERINRYANSBACKEND', data);
            var user = data.user;
            if (data.spawn) {
                TWITCH.userSpawn(user);
            } else if (data.moveLeft) {
                TWITCH.handleLeft(user);
            } else if (data.moveRight) {
                TWITCH.handleRight(user);
            } else if (data.moveUp) {
                TWITCH.handleUp(user);
            } else if (data.moveDown) {
                TWITCH.handleDown(user);
            } else if (data.attack) {
                TWITCH.handleAttack(user);
            } else if (data.done) {
                TWITCH.handleDone(user);
            }
            // TODO: Kraken
            // On main server, kraken moves randomly
            // need to send kraken location to all clients
            // do NOT move kraken randomly on client side
        };
        MULTIPLAYER.ws.onopen = function(e) {
            console.log('Connection Open');
            console.info(e);
            MULTIPLAYER.init();
        };
    }
}

window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    for (var [key, value] of params) {
        console.log('HASH');
        console.log(key, value);
    } 
    const multiplayer = params.get('multiplayer');
    const accessToken = params.get('access_token');
    if (multiplayer) {
        const clientId = 'pprdxqu1w21gxcn504lhg7acfe9sop'; // Replace with your client ID
        const redirectUri = encodeURIComponent('https://spirodon.games/game'); // Replace with your redirect URI
        const scope = encodeURIComponent('user:read:email'); // Request user's email
        const responseType = 'token'; // We want an access token
        const state = 'YOUR_STATE'; // Optional, but recommended for CSRF protection

        const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

        // Redirect the user to the Twitch authorization page
        window.location.href = authUrl;
    } else if (accessToken) {
        LOADER.events.addEventListener('loaded', function () {
            if (!_GAME) {
               console.error('GAME NOT LOADED');
               return false;
            }

            TWITCH.init();
            INPUT.MODE = INPUT.MODES.indexOf('Multiplayer');
            EDITOR.updateGameMode();
        });
        // Step  4: Use the access token to make authenticated requests
        console.log('Access token:', accessToken);
        // Example: Fetch user's email
        fetch('https://api.twitch.tv/helix/users', {
            headers: {
                'Client-ID': 'pprdxqu1w21gxcn504lhg7acfe9sop',
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.length) {
                const user = data.data[0];
                console.log('User:', user);
                console.log('User ID', user.id);
                console.log('User login', user.login);
                console.log('User display name', user.display_name);
                MULTIPLAYER.current_user.id = user.id;
                MULTIPLAYER.current_user.login = user.login;
                MULTIPLAYER.current_user.name = user.display_name;
                MULTIPLAYER.connectToRyansBackend();
                MULTIPLAYER.init();
            }
        })
        .catch(error => console.error('Error:', error));
    }
});
