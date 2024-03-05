const RyansBackendMainHoleConfig = {
    "set_filters": {
        "commands": [
            "up", "down", "left", "right", "attack", "spawn", "despawn", "kraken", "reset", "done"
        ],
        "matches": [
            "^[lurda0-9]+$",
            "^random [a-zA-Z0-9\\s]+$"
        ]
    },
    "set_rate": 50,
};
const RyansBackendMainHoleGetLeaderboard = { get_leaderboard: 40 };
const RyansBackendMainHoleIncrementLeaderboardScore = function (user) {
    return {
        increment_score: {
            user: user,
            inc: 1
        }
    }
};
/**
{
    "broadcast": {
        "payload": {
            "players": this.SHIPS_TO_PLAYER,
            "health": health,
            "kraken": this.KRAKEN_PLAYER,
            "player_coords": player_coords,
            "kraken_coords": kraken_coords,
            "kraken_health": kraken_health,
            "kraken_on": OCTOPUS[3],
        },
    }
}
{
    "send": {
        "user": "spirodonfl",
        "payload": { "spawn": true }
    }
}
*/
let RyansBackendMainHole = {
    init: function () {
        RyansBackendMainHole = new WebSocket("wss://spirodon.games/gamesocket/websocket");
        RyansBackendMainHole.onerror = function (e) {
            console.error('Ryans Backend Main Hole could not handle the heat', e);
        }
        RyansBackendMainHole.onclose = function (e) {
            console.error('Ryans Backend Main Hole is closed for business', e);
        }
        RyansBackendMainHole.onopen = function (e) {
            console.log('Ryans backend main hole is fully gaped', e);
            RyansBackendMainHole.send(JSON.stringify(RyansBackendMainHoleConfig));
        }
        RyansBackendMainHole.onmessage = function (message) {
            console.log('Ryans backend main hole is trying to talk to you', message);
            if (message.data) {
                var data = JSON.parse(message.data);
                console.log('Ryans backend main hole is trying to whisper sweet nothings to you', data);
                if (data.errors && data.errors.length > 0) {
                    console.error('Ryans backend main hole basically shat the bed', data.errors);
                }
                if (data.data.filters) {
                    // Means we setup our filters & whatnot
                    RyansBackendMainHole.getLeaderboard();
                } else if (data.data.commands) {
                    for (var i = 0; i < data.data.commands.length; ++i) {
                        console.log('RYANCOMMAND', data.data.commands[i]);
                        var user = data.data.commands[i].user.toLowerCase();
                        if (user.length === 0) { continue; }
                        var cmd = data.data.commands[i].cmd;
                        var role = data.data.commands[i].role;

                        cmd = cmd.split(' ')[0];

                        // Start with specific [full] commands first
                        // Then check for "chained" commands
                        // - should make it easy to read numbers from the chain
                        // if (COMMANDS[cmd] === 0) {
                        //     COMMANDS_TO_FUNCTIONS[cmd](user);
                        //     continue;
                        // }

                        // If we've made it this far, it means that we didn't find an EXACT match to a command
                        cmd = expandString(cmd);
                        cmd = cmd.split('');
                        if (cmd.length > 0) {
                            var last_entry = null;
                            // We assume this means a multi-command
                            for (var j = 0; j < cmd.length; ++j) {
                                // if (COMMANDS[cmd[j]] === 0 && COMMANDS_TO_FUNCTIONS[cmd[j]]) {
                                //     last_entry = cmd[j];
                                //     COMMANDS_TO_FUNCTIONS[cmd[j]](user);
                                // }
                            }
                        }
                    }
                }
            }
        }
        RyansBackendMainHole.getLeaderboard = function () {
            RyansBackendMainHole.send(JSON.stringify(RyansBackendMainHoleGetLeaderboard));
        }
    }
};

export { RyansBackendMainHole };