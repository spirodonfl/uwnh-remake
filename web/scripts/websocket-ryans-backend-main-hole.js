import { globals } from './globals.js';

const RyansBackendMainHoleConfig = {
    "set_filters": {
        "commands": [
            "up", "down", "left", "right", "attack", "spawn", "despawn", "kraken", "reset", "done"
        ],
        "matches": [
            // "^[lurda0-9]+$",
            // "^random [a-zA-Z0-9\\s]+$"
        ]
    },
    "set_rate": 50,
    "set_queue_limit": 10,
};
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
export const RyansBackendMainHole = {
    ws: null,
    init: function () {
        var url = 'wss://spirodon.games/gamesocket/websocket';
        // url += '?';
        // url += 'channel=spirodonfl&';
        // url += 'id=lemnean_sucks_deez_nutz&';
        // url += 'login=spirodonfl&';
        // url += 'name=spirodonf';

        this.ws = new WebSocket(url);
        this.ws.onerror = (e) => { this.onerror(e); };
        this.ws.onclose = (e) => { this.onclose(e); };
        this.ws.onopen = (e) => { this.onopen(e); };
        this.ws.onmessage = (e) => { this.onmessage(e); };
    },
    onerror: function (e) {
        console.error('Ryans Backend Main Hole could not handle the heat', e)
    },
    onclose: function (e) {
        console.error('Ryans Backend Main Hole is closed for business', e);
    },
    onopen: function (e) {
        console.log('Ryans backend main hole is fully gaped', e);
        this.ws.send(JSON.stringify(RyansBackendMainHoleConfig));
    },
    // This function takes the regex portion of Ryans backend and expands
    // the letter prior to any numbers so that the letter is repeated as a command
    expandString: function(input) {
        return input.replace(/([lurda])(\d+)/g, function(match, p1, p2) {
            p2 = Number(p2);
            p2 = p2 <= 9 ? p2 : 9;
            return p1.repeat(p2);
        });
    },
    onmessage: function (message) {
        console.log('Ryans backend main hole is trying to talk to you', message);
        if (message.data) {
            var data = JSON.parse(message.data);
            console.log('Ryans backend main hole is trying to whisper sweet nothings to you', data);
            if (data.errors && data.errors.length > 0) {
                console.error('Ryans backend main hole basically shat the bed', data.errors);
            } else if (data.data.filters) {
                globals.EVENTBUS.triggerEvent('filters-approved', []);
            } else if (data.data.leaderboard) {
                globals.EVENTBUS.triggerEvent('leaderboard-update', [{data: data.data.leaderboard}]);
            } else if (data.data.commands) {
                for (var i = 0; i < data.data.commands.length; ++i) {
                    console.log('RYANCOMMAND', data.data.commands[i]);
                    var user = data.data.commands[i].user.toLowerCase();
                    if (user.length === 0) { continue; }
                    var cmd = data.data.commands[i].cmd;
                    var role = data.data.commands[i].role;

                    if (cmd.length > 0) {
                        if (cmd === 'spawn') {
                            globals.EVENTBUS.triggerEvent('user-spawns', [{data: {user, role}}]);
                        } else if (cmd === 'despawn') {
                            globals.EVENTBUS.triggerEvent('user-despawns', [{data: {user, role}}]);
                        } else if (cmd === 'left') {
                            globals.EVENTBUS.triggerEvent('user-moves-left', [{data: {user, role}}]);
                        } else if (cmd === 'right') {
                            globals.EVENTBUS.triggerEvent('user-moves-right', [{data: {user, role}}]);
                        } else if (cmd === 'up') {
                            globals.EVENTBUS.triggerEvent('user-moves-up', [{data: {user, role}}]);
                        } else if (cmd === 'down') {
                            globals.EVENTBUS.triggerEvent('user-moves-down', [{data: {user, role}}]);
                        } else if (cmd === 'attack') {
                            globals.EVENTBUS.triggerEvent('user-attacks', [{data: {user, role}}]);
                        } else {
                            cmd = cmd.split(' ')[0];
                            console.log('cmd after split', cmd);

                            // Start with specific [full] commands first
                            // Then check for "chained" commands
                            // - should make it easy to read numbers from the chain
                            // if (COMMANDS[cmd] === 0) {
                            //     COMMANDS_TO_FUNCTIONS[cmd](user);
                            //     continue;
                            // }

                            // If we've made it this far, it means that we didn't find an EXACT match to a command
                            cmd = this.expandString(cmd);
                            cmd = cmd.split('');
                            console.log('cmd expanded', cmd);
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
        }
    },
    getLeaderboard() {
        console.log(JSON.stringify({ get_leaderboard: 40 }));
        this.ws.send(JSON.stringify({ "get_leaderboard": 40 }));
    }
};