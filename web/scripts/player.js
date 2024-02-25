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
        url += 'id=rvice_sucks_deez_nutz&';
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
        };
        MULTIPLAYER.ws.onopen = function(e) {
            console.log('Connection Open');
            console.info(e);
            MULTIPLAYER.init();
        };
    }
}
