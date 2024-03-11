import { globals } from './globals.js';

const RyansBackendMainHoleConfig = {
    "set_filters": {
        "commands": [
            "up", "down", "left", "right", "attack", "spawn", 
            "despawn", "kraken", "reset", "done", "setrole",
            "enable_kraken", "disable_kraken",
        ],
        "matches": [
            // "^[lurda0-9]+$",
            // "^random [a-zA-Z0-9\\s]+$"
        ]
    },
    "set_rate": 50,
    "set_queue_limit": 10,
};

export const RyansBackendMainHole = {
    ws: null,
    init: function () {
        let url = 'wss://spirodon.games/gamesocket/websocket';

        if (this.ws === null) {
            this.ws = new WebSocket(url);
            this.ws.onerror = (e) => { this.onerror(e); };
            this.ws.onclose = (e) => { this.onclose(e); };
            this.ws.onopen = (e) => { this.onopen(e); };
            this.ws.onmessage = (e) => { this.onmessage(e); };
        } else {
            console.log('Already connected');
        }
    },
    onerror: function (e) {
        console.error('Ryans Backend Main Hole could not handle the heat', e);
    },
    onclose: function (e) {
        console.error('Ryans Backend Main Hole is closed for business', e);
        this.ws = null;
    },
    onopen: function (e) {
        console.log('Ryans backend main hole is fully gaped', e);
        this.ws.send(JSON.stringify(RyansBackendMainHoleConfig));
        globals.EVENTBUS.triggerEvent('opened-ryans-backend-main-hole', {});
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
            let data = JSON.parse(message.data);
            console.log('Ryans backend main hole is trying to whisper sweet nothings to you', data);
            if (data.errors && data.errors.length > 0) {
                console.error('Ryans backend main hole basically shat the bed', data.errors);
            } else if (data.data.filters) {
                globals.EVENTBUS.triggerEvent('filters-approved', []);
            } else if (data.data.leaderboard) {
                globals.EVENTBUS.triggerEvent('leaderboard-update', {data: data.data.leaderboard});
            } else if (data.data.commands) {
                for (let i = 0; i < data.data.commands.length; ++i) {
                    console.log('RYANCOMMAND', data.data.commands[i]);
                    let user = data.data.commands[i].user.toLowerCase();
                    if (user.length === 0) { continue; }
                    let cmd = data.data.commands[i].cmd;
                    let roles = data.data.commands[i].roles;

                    if (cmd.length > 0) {
                        if (cmd === 'spawn') {
                            globals.EVENTBUS.triggerEvent('user-spawns', {user, roles});
                        } else if (cmd === 'despawn') {
                            globals.EVENTBUS.triggerEvent('user-despawns', {user, roles});
                        } else if (cmd === 'left') {
                            globals.EVENTBUS.triggerEvent('user-moves-left', {user, roles});
                        } else if (cmd === 'right') {
                            globals.EVENTBUS.triggerEvent('user-moves-right', {user, roles});
                        } else if (cmd === 'up') {
                            globals.EVENTBUS.triggerEvent('user-moves-up', {user, roles});
                        } else if (cmd === 'down') {
                            globals.EVENTBUS.triggerEvent('user-moves-down', {user, roles});
                        } else if (cmd === 'attack') {
                            globals.EVENTBUS.triggerEvent('user-attacks', {user, roles});
                        } else if (
                            cmd === 'enable_kraken'
                            && (
                                roles.indexOf('mod') > -1
                                || roles.indexOf('vip') > -1
                                || roles.indexOf('broadcaster') > -1
                            )
                        ){
                            globals.EVENTBUS.triggerEvent('enable-kraken', {user, roles});
                        } else if (
                            cmd === 'disable_kraken'
                            && (
                                roles.indexOf('mod') > -1
                                || roles.indexOf('vip') > -1
                                || roles.indexOf('broadcaster') > -1
                            )
                        ){
                            globals.EVENTBUS.triggerEvent('disable-kraken', {user, roles});
                        } else if (
                            cmd === 'reset'
                            && (
                                roles.indexOf('mod') > -1
                                || roles.indexOf('vip') > -1
                                || roles.indexOf('broadcaster') > -1
                            )
                        ){
                            // TODO: This is duplicated in the multiplayer-host side. DRY
                            this.ws.send(JSON.stringify({
                                "broadcast": {
                                    "payload": {
                                        "reset": true,
                                    }
                                }
                            }));
                            window.location.reload();
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
                                let last_entry = null;
                                // We assume this means a multi-command
                                for (let j = 0; j < cmd.length; ++j) {
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
