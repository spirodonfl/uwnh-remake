var twitch_streamerbot_ws = null;
var GAME_MODE = 1; // 0 = realtime && 1 = turn based
var TURN = 0; // TURN 5(aka: 6) = KRAKEN
var SHIPS_TO_PLAYER = [null, null, null, null, null];
var INVULN_PLAYERS = [null, null, null, null, null];
var PLAYERS_CRIT_BUFF = [0, 0, 0, 0, 0];
var SHIPS_TO_PLAYER_COLORCODE = ['#ffffff', '#00ff00', '#ffb2f7', '#ffff00', '#ff6f6f'];
var LEADERBOARD = {};
var KRAKEN_PLAYER = null;
function addToLeaderboard(user) {
    if (rd_streamerbot_ws) {
        rd_streamerbot_ws.send(JSON.stringify({
            increment_score: {
                user: user,
                inc: 1
            }
        }));
    }

    updateLeaderboard();

    // https://spirodon.games/leaderboard
    // {increment_score: {user: "", inc: n}}
    // - TO RESET just increment by a negative number
    // https://github.com/ryanwinchester/twitch_gameserver/blob/main/lib/twitch_gameserver_web/game_socket.ex#L143-L150
}
function updateLeaderboard() {
    if (rd_streamerbot_ws) {
        rd_streamerbot_ws.send(JSON.stringify({
            get_leaderboard: 40,
        }));
    }
}
function killedPlayer(user) {
    console.log('KILLEDPLAYER', user);
    LEADERBOARD[user] = LEADERBOARD[user] + 1 || 1;
    addToLeaderboard(user);
}
function killedKraken(user) {
    KRAKEN_PLAYER = null;
    DISABLE_KRAKEN();
    LEADERBOARD[user] = LEADERBOARD[user] + 3 || 3;
    addToLeaderboard(user);
}
function handleUp(user) {
    if (_GAME) {
        // Get the current player matching against PLAYER_TO_SHIP, get index of PLAYER_TO_SHIP, then call inputs_inputUp with that index
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputUp(player_index);
            INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputUp(0);
    }
}
function handleDown(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputDown(player_index);
            INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputDown(0);
    }
}
function handleLeft(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputLeft(player_index);
            INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputLeft(0);
    }
}
function handleRight(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputRight(player_index);
            INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputRight(0);
    }
}
function handleAttack(user) {
    if (_GAME) {
        console.log('HANDLEATTACK', user);
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        var have_crit = PLAYERS_CRIT_BUFF[player_index];
        if (have_crit) {
            // Javascript match random chance to set to true or false
            PLAYERS_CRIT_BUFF[player_index] = Math.random() < 0.5;
        }
        if (player_index !== -1 && INVULN_PLAYERS[player_index] === null) {
            // Only attack the other two players from SHIPS_TO_PLAYER
            for (var i = 0; i < SHIPS_TO_PLAYER.length; ++i) {
                if (i !== player_index && _GAME.game_entityGetHealth(i) > 0) {
                    if (INVULN_PLAYERS[i] === true) { continue; }
                    _GAME.game_entityAttack(player_index, i, have_crit);

                    var player_element = document.querySelector('[data-entity-id="' + (player_index + 1) + '"]');
                    console.log(player_element);
                    if (player_element) {
                        player_element.style.backgroundImage = "url('" + ENUM_IMAGES[9] + "')";
                    }
                    DOM.addRunOnFrames(60, function() {
                        var player_element = document.querySelector('[data-entity-id="' + (player_index + 1) + '"]');
                        if (player_element) {
                            player_element.style.backgroundImage = "url('" + ENUM_IMAGES[4] + "')";
                        }
                    }, true);

                    if (_GAME.game_entityGetHealth(i) <= 0) {
                        var player_element = document.querySelector('[data-entity-id="' + (i + 1) + '"]');
                        if (!player_element.classList.contains('animating')) {
                            // TODO: Implement flush_user command
                            killedPlayer(user);
                            userDone(SHIPS_TO_PLAYER[i]);
                            // TODO: Fix this
                            /*DOM.addRunOnFrames(20, function() {
                                // TODO: Put this users state into "animating" or something
                                userDone(SHIPS_TO_PLAYER[i]);
                                var player_element = document.querySelector('[data-entity-id="' + (i + 1) + '"]');
                                if (player_element) {
                                    player_element.classList.remove('juicy__shake__1');
                                    player_element.classList.remove('animating');
                                }
                            }, true);
                            if (player_element) {
                                player_element.classList.add('juicy__shake__1');
                                player_element.classList.add('animating');
                            }*/
                        }
                    }
                }
                _GAME.game_entityAttack(player_index, 9-1, have_crit);
                if (_GAME.game_entityGetHealth((9-1)) <= 0) {
                    killedKraken(user);
                }
            }
            for (var i = SHIPS_TO_PLAYER.length; i < 8; ++i) {
                if (
                    _GAME.game_entityAttack(player_index, i, have_crit) === 1 &&
                    _GAME.game_entityGetHealth(i) <= 0
                ) {
                    _GAME.game_entityIncrementHealth(player_index);
                }
            }
        } else {
            console.log('PLAYER NOT FOUND', user);
        }
    }
}
function userSpawn(user) {
    if (_GAME) {
        // First make sure the player isn't already in the game
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index < 0) {
            for (var i = 0; i < SHIPS_TO_PLAYER.length; i++) {
                if (SHIPS_TO_PLAYER[i] === null) {
                    SHIPS_TO_PLAYER[i] = user;
                    INVULN_PLAYERS[i] = true;
                    var player_element = document.querySelector('[data-entity-id="' + (i + 1) + '"]');
                    if (player_element) {
                        player_element.style.backgroundImage = "url('" + ENUM_IMAGES[7] + "')";
                        player_element.classList.add('animating');
                    }
                    DOM.addRunOnFrames(60, function() {
                        EDITOR.updateEntityName(i + 1, user);
                        EDITOR.updateShipEditorName(i + 1, user);
                        _GAME.game_entitySetHealth(i, 10);
                        _GAME.diff_addData(0);

                        var player_element = document.querySelector('[data-entity-id="' + (i + 1) + '"]');
                        if (player_element) {
                            player_element.style.backgroundImage = "url('" + ENUM_IMAGES[4] + "')";
                            player_element.classList.remove('animating');
                        }
                    }, true);
                    break;
                }
            }
        }
    }
}
function userDespawn(user, role, message) {
    if (_GAME) {
        if (role >= 2) {
            var split = message.split(' ');
            if (split.length === 2) {
                var ship_number = parseInt(split[1]);
                if (ship_number >= 1) {
                    ship_number -= 1;
                    if (ship_number >= 0 && ship_number < SHIPS_TO_PLAYER.length) {
                        SHIPS_TO_PLAYER[ship_number] = null;
                        EDITOR.updateEntityName(ship_number + 1, '[EMPTY]');
                        EDITOR.updateShipEditorName(ship_number + 1, '[EMPTY]');
                        _GAME.diff_addData(0);
                    }
                }
            }
        }
    }
    // TODO: Implement flush_user command
}
function userDone(user) {
    if (_GAME) {
        console.log('USERDONE', user);
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            SHIPS_TO_PLAYER[player_index] = null;
            EDITOR.updateEntityName(player_index + 1, '[EMPTY]');
            EDITOR.updateShipEditorName(player_index + 1, '[EMPTY]');
            _GAME.diff_addData(0);
        } else {
            console.log('PLAYER NOT FOUND', user);
        }
    }
    // TODO: Implement flush_user command
}
var COMMANDS = {
    "up": 0,
    "u": 0,
    "down": 0,
    "d": 0,
    "left": 0,
    "l": 0,
    "right": 0,
    "r": 0,
    "attack": 0,
    "a": 0,
    "spawn": 0,
    "despawn": 1,
    "kraken": 1,
    "reset": 1,
    "done": 1,
};
var COMMANDS_TO_FUNCTIONS = {
    "init": function () {
        this.a = this.attack;
        this.u = this.up;
        this.d = this.down;
        this.l = this.left;
        this.r = this.right;
    },
    "allowed": function (user) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (
            GAME_MODE === 0 ||
            (
                GAME_MODE === 1 &&
                (
                    TURN === player_index ||
                    (
                        TURN === 5 &&
                        KRAKEN_PLAYER === user
                    )
                )
            )
        ) {
            console.log("USER " + user + " wants to do something and is allowed to");
            return true;
        }
        console.log("USER " + user + " wants to do something but is NOT ALLOWED GTFO");
        return false;
    },
    "autoKraken": function () {
        if (KRAKEN_PLAYER === null) {
            // TODO: so much hack, get rid of this
            var OCTOPUS_INDEX = 9-1;
            var directions = [0, 1, 2, 3];
            let randomIndex = Math.floor(Math.random() * directions.length);
            let randomDirection = directions[randomIndex];
            if (randomDirection === 0) {
                _GAME.inputs_inputLeft(OCTOPUS_INDEX);
            } else if (randomDirection === 1) {
                _GAME.inputs_inputRight(OCTOPUS_INDEX);
            } else if (randomDirection === 2) {
                _GAME.inputs_inputDown(OCTOPUS_INDEX);
            } else if (randomDirection === 3) {
                _GAME.inputs_inputUp(OCTOPUS_INDEX);
            }
            for (var i = 0; i < 4; ++i) {
                _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                if (_GAME.game_entityGetHealth(i) <= 0 && SHIPS_TO_PLAYER[i] !== null) {
                    userDone(SHIPS_TO_PLAYER[i]);
                }
            }
            this.updateTurn();
        }
    },
    "updateTurn": function () {
        DOM.addRunOnFrames(60, function() {
            var kraken_enabled = OCTOPUS[3];
            console.log('updateTurn:', {TURN, kraken_enabled, has_player: SHIPS_TO_PLAYER[TURN], KRAKEN_PLAYER});
            if (TURN <= 4 && SHIPS_TO_PLAYER[TURN] !== null) {
                ++TURN;
                // for (var s_my_d = 0; s_my_d < 5; ++s_my_d) {
                //     if (SHIPS_TO_PLAYER[s_my_d] !== null) {
                //         TURN = s_my_d;
                //         break;
                //     }
                // }
                if (SHIPS_TO_PLAYER[TURN] == null) {
                    COMMANDS_TO_FUNCTIONS.updateTurn();
                }
            } else if (TURN <= 4 && SHIPS_TO_PLAYER[TURN] === null) {
                // NO PLAYER TO PLAY THIS TURN, MUST MOVE ON
                ++TURN;
                COMMANDS_TO_FUNCTIONS.updateTurn();
            } else if (TURN === 5 && kraken_enabled && KRAKEN_PLAYER === null) {
                // KRAKEN IS ENABLED AND SHOULD BE AUTOMATED HERE
                ++TURN;
                COMMANDS_TO_FUNCTIONS.autoKraken();
            } else if (TURN === 5 && kraken_enabled && KRAKEN_PLAYER !== null) {
                // KRAKEN IS ENABLED AND A TWITCH PLAYER IS CONTROLLING IT
                TURN = 0;
            } else if (TURN === 5 && !kraken_enabled) {
                TURN = 0;
                COMMANDS_TO_FUNCTIONS.updateTurn();
            } else if (TURN >= 6) {
                TURN = 0;
            }
            console.log('updateTurn:', {TURN, kraken_enabled, has_player: SHIPS_TO_PLAYER[TURN], KRAKEN_PLAYER});

            var ship_slots = document.querySelectorAll(".ship_slot");
            for (var s_my_d = 0; s_my_d < ship_slots.length; ++s_my_d) {
                if (ship_slots[s_my_d] instanceof HTMLElement) {
                    ship_slots[s_my_d].classList.remove('active');
                }
            }
            var ship_element = document.querySelector("#ship_" + (TURN + 1));
            if (ship_element instanceof HTMLElement) {
                ship_element.classList.add('active');
            }
        }, true);
    },
    "attack": function (user) {
        if (this.allowed(user)) {
            if (KRAKEN_PLAYER === user) {
                // TODO: Repetitive code, put in function
                for (var i = 0; i < 4; ++i) {
                    if (INVULN_PLAYERS[i] === true) { continue; }
                    _GAME.game_entityAttack(8, i);
                    _GAME.game_entityAttack(8, i);
                    _GAME.game_entityAttack(8, i);
                    if (_GAME.game_entityGetHealth(i) <= 0) {
                        userDone(SHIPS_TO_PLAYER[i]);
                    }
                }
            } else {
                handleAttack(user);
            }
            this.updateTurn();
        }
    },
    "up": function (user) {
        if (this.allowed(user)) {
            if (user === KRAKEN_PLAYER) {
                _GAME.inputs_inputUp(8);
            } else {
                handleUp(user);
            }
            this.updateTurn();
        }
    },
    "down": function (user) {
        if (this.allowed(user)) {
            if (user === KRAKEN_PLAYER) {
                _GAME.inputs_inputDown(8);
            } else {
                handleDown(user);
            }
            this.updateTurn();
        }
    },
    "left": function (user) {
        if (this.allowed(user)) {
            if (user === KRAKEN_PLAYER) {
                _GAME.inputs_inputLeft(8);
            } else {
                handleLeft(user);
            }
            this.updateTurn();
        }
    },
    "right": function (user) {
        if (this.allowed(user)) {
            if (user === KRAKEN_PLAYER) {
                _GAME.inputs_inputRight(8);
            } else {
                handleRight(user);
            }
            this.updateTurn();
        }
    },
    "spawn": function (user) {
        userSpawn(user);
    },
    "done": function (user) {
        userDone(user);
    },
    "despawn": function (user, role, message) {
        userDespawn(user, role, message);
    },
    "reset": function (user, role) {
        if (role >= 2) {
            window.location.reload();
        }
    },
    "kraken": function (user, role) {
        if (role >= 2) {
            ENABLE_KRAKEN();
        }
    }
};
var rd_streamerbot_ws = null;
var waiting_for_ryan = false;
var waiting_for_ryan_timeout = null;
function connect_to_ryan() {
    if (waiting_for_ryan) {
        waiting_for_ryan_timeout = setTimeout(function () {
            console.log('RYANRECONNECT');
            rd_streamerbot_ws = new WebSocket("wss://spirodon.games/gamesocket/websocket");
            rd_streamerbot_ws.onerror = function() {
                rd_streamerbot_ws.close();
                connect_to_ryan();
            };
            rd_streamerbot_ws.onopen = openRyan;
            rd_streamerbot_ws.onmessage = handleRyan;
        }, 1000);
    }
}
function openRyan() {
    console.log('RYANOPEN');
    waiting_for_ryan = false;
    clearTimeout(waiting_for_ryan_timeout);
    updateLeaderboard();
    rd_streamerbot_ws.send(JSON.stringify(
        {
            "set_filters": {
                "commands": [
                    "up", "down", "left", "right", "attack", "spawn", "despawn", "kraken", "reset", "done"
                ],
                "matches": [
                    "^[lurda0-9]+$"
                ]
            },
            "set_rate": 500,
        }
    ));
};
// This function takes the regex portion of Ryans backend and expands
// the letter prior to any numbers so that the letter is repeated as a command
function expandString(input) {
    return input.replace(/([lurda])(\d+)/g, function(match, p1, p2) {
        p2 = Number(p2);
        p2 = p2 <= 9 ? p2 : 9;
        return p1.repeat(p2);
    });
}
function handleRyan(event) {
    if (event.data) {
        var data = JSON.parse(event.data);
        console.log('RYANDATA', data);
        if (data.errors && data.errors.length > 0) {
            console.error('RYANERRORS', data.errors);
        }
        if (data.data.leaderboard) {
            var leaderboard_element = document.getElementById('leaderboard');
            if (leaderboard_element) {
                var leaderboard_html = '';
                for (var i = 0; i < data.data.leaderboard.length; i++) {
                    var key = data.data.leaderboard[i];
                    leaderboard_html += `<div>${key.user}: ${key.total}</div>`;
                }
                leaderboard_element.innerHTML = leaderboard_html;
            }
        }
        if (data.data.commands) {
            for (var i = 0; i < data.data.commands.length; ++i) {
                console.log('RYANCOMMAND', data.data.commands[i]);
                var user = data.data.commands[i].user.toLowerCase();
                if (user.length === 0) { continue; }
                var cmd = data.data.commands[i].cmd;
                // Start with specific [full] commands first
                // Then check for "chained" commands
                // - should make it easy to read numbers from the chain
                if (COMMANDS[cmd] === 0 && COMMANDS_TO_FUNCTIONS[cmd]) {
                    COMMANDS_TO_FUNCTIONS[cmd](user);
                    continue;
                }

                // If we've made it this far, it means that we didn't find an EXACT match to a command
                cmd = expandString(cmd);
                cmd = cmd.split('');
                if (cmd.length > 0) {
                    var last_entry = null;
                    // We assume this means a multi-command
                    for (var j = 0; j < cmd.length; ++j) {
                        if (COMMANDS[cmd[j]] === 0 && COMMANDS_TO_FUNCTIONS[cmd[j]]) {
                            last_entry = cmd[j];
                            COMMANDS_TO_FUNCTIONS[cmd[j]](user);
                        }
                    }
                }
            }
        }
    }
}

function connectws() {
    if ("WebSocket" in window) {
        rd_streamerbot_ws = new WebSocket("wss://spirodon.games/gamesocket/websocket");
        rd_streamerbot_ws.onerror = function() {
            rd_streamerbot_ws.close();
        };
        rd_streamerbot_ws.onclose = function() {
            console.log('RYANCLOSED');
            waiting_for_ryan = true;
            connect_to_ryan();
        };
        rd_streamerbot_ws.onopen = openRyan;
        rd_streamerbot_ws.onmessage = handleRyan;

        const twitch_streamerbot_ws = new WebSocket("ws://127.0.0.1:8080/");
        twitch_streamerbot_ws.onopen = function() {
            twitch_streamerbot_ws.send(JSON.stringify(
                {
                    "request": "Subscribe",
                    "events": {
                        "Twitch": [
                            "ChatMessage",
                            "Cheer",
                            "Sub",
                            "ReSub",
                            "GiftSub",
                            "GiftBomb",
                            "Follow",
                            "Raid",
                            "RewardRedemption",
                        ]
                    },
                    "id": "123"
                }
            ));
        };
        // TODO: Rate throttle the messages
        var alert_element = null;
        twitch_streamerbot_ws.onmessage = function (event) {
            // grab message and parse JSON
            const msg = event.data;
            const wsdata = JSON.parse(msg);
            console.log('STREAMERBOTDATA:', wsdata);

            if (!alert_element) {
                var alert_element = document.createElement('div');
                alert_element.style.position = 'absolute';
                alert_element.style.top = '0';
                alert_element.style.left = '0';
                alert_element.style.width = '100%';
                alert_element.style.height = '100%';
                alert_element.style.backgroundColor = 'rgba(0,0,0,0.5)';
                alert_element.style.color = 'white';
                alert_element.style.zIndex = '3000';
                alert_element.style.display = 'none';
                alert_element.style.justifyContent = 'center';
                alert_element.style.alignItems = 'center';
                alert_element.style.fontSize = '2rem';
                document.body.appendChild(alert_element);
            }

            if (wsdata.event && wsdata.event.source === 'Twitch') {
                if (wsdata.data.message && wsdata.data.message.displayName) {
                    wsdata.data.message.displayName = wsdata.data.message.displayName.toLowerCase();
                }
                if (wsdata.event.type === 'RewardRedemption') {
                    if (wsdata.data.reward.title === 'Kraken') {
                        if (OCTOPUS[3] === false) {
                            ENABLE_KRAKEN();
                        }
                    }
                    else if (wsdata.data.reward.title === 'Poops') {
                        // TODO: Drop yoshi eggs in the water
                    }
                    else if (wsdata.data.reward.title === 'ControlKraken') {
                        KRAKEN_PLAYER = wsdata.data.user_login;
                    }
                    else if (wsdata.data.reward.title === 'Plus5Health') {
                        for (var i = 0; i < SHIPS_TO_PLAYER.length; i++) {
                            if (SHIPS_TO_PLAYER[i] === wsdata.data.user_login) {
                                for (var x = 0; x < 5; ++x) {
                                    _GAME.game_entityIncrementHealth(i);
                                    _GAME.diff_addData(0);
                                }
                            }
                        }
                    }
                    else if (wsdata.data.reward.title === 'Plus10Health') {
                        for (var i = 0; i < SHIPS_TO_PLAYER.length; i++) {
                            if (SHIPS_TO_PLAYER[i] === wsdata.data.user_login) {
                                for (var x = 0; x < 10; ++x) {
                                    _GAME.game_entityIncrementHealth(i);
                                    _GAME.diff_addData(0);
                                }
                            }
                        }
                    }
                } else if (wsdata.event.type === 'Raid') {
                    // alert(`trigger raid event for ${wsdata.data.displayName} ${wsdata.data.viewers}`);
                    alert_element.innerHTML = `THANK YOU FOR THE RAID! ${wsdata.data.displayName} ${wsdata.data.viewers}`;
                    setTimeout(function() {
                        alert_element.style.display = 'none';
                    }, 1000);
                    ENABLE_KRAKEN();
                    _GAME.game_entitySetHealth((9-1), wsdata.data.viewers);
                    OCTOPUS[2] = wsdata.data.viewers;
                } else if (wsdata.event.type === 'Sub' || wsdata.event.type === 'ReSub') {
                    // alert(`trigger sub event for ${wsdata.data.displayName}`);
                    alert_element.innerHTML = `THANK YOU FOR THE SUB! ${wsdata.data.displayName}`;
                    setTimeout(function() {
                        alert_element.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event.type === 'GiftSub') {
                    // alert(`trigger Gift sub event for ${wsdata.data.recipientDisplayName}`);
                    alert_element.innerHTML = `THANK YOU FOR THE GIFT SUB! ${wsdata.data.recipientDisplayName}`;
                    setTimeout(function() {
                        alert_element.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event.type === 'GiftBomb') {
                    if (wsdata.data.isAnonymous === false) {
                        // alert(`trigger gift bomb event for ${wsdata.data.displayName} ${wsdata.data.gifts} subs`);
                        alert_element.innerHTML = `THANK YOU FOR THE GIFT BOMB! ${wsdata.data.displayName} ${wsdata.data.gifts} subs`;
                        setTimeout(function() {
                            alert_element.style.display = 'none';
                        }, 1000);
                    } else {
                        // alert(`trigger gift bomb event for Anonymous ${wsdata.data.gifts} subs`);
                        alert_element.innerHTML = `THANK YOU FOR THE GIFT BOMB! Anonymous ${wsdata.data.gifts} subs`;
                        setTimeout(function() {
                            alert_element.style.display = 'none';
                        }, 1000);
                    }
                } else if (wsdata.event.type === 'Follow') {
                    // alert(`trigger follow event for ${wsdata.data.displayName}`);
                    alert_element.innerHTML = `THANK YOU FOR THE FOLLOW! ${wsdata.data.displayName}`;
                    setTimeout(function() {
                        alert_element.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event.type === 'Cheer') {
                    // alert(`trigger cheer event for ${wsdata.data.message.displayName} ${wsdata.data.message.bits}`);
                    var bits = wsdata.data.message.bits;
                    if (bits >= 5) {
                        var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
                        if (player_index !== -1) {
                            PLAYERS_CRIT_BUFF[player_index] = true;
                        }
                    }
                    alert_element.innerHTML = `THANK YOU FOR THE CHEER! ${wsdata.data.message.displayName} ${wsdata.data.message.bits}`;
                    setTimeout(function() {
                        alert_element.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event.type === 'ChatMessage') {
                    var user = wsdata.data.message.username;
                    var cmd = wsdata.data.message.message.substring(1).toLowerCase();
                    console.log('STREAMERBOTCMD:', cmd);
                    if (COMMANDS[cmd] === 1) {
                        if (COMMANDS_TO_FUNCTIONS[cmd]) {
                            COMMANDS_TO_FUNCTIONS[cmd](user, wsdata.data.message.role, wsdata.data.message.message);

                            if (_GAME) {
                                for (var i = 0; i < SHIPS_TO_PLAYER.length; i++) {
                                    if (_GAME.game_entityGetHealth(i) <= 0) {
                                        SHIPS_TO_PLAYER[i] = null;
                                        document.querySelector('[data-entity-id="' + (i + 1) + '"]').classList.add('juicy__shake__2');
                                        EDITOR.updateEntityName(i + 1, '[EMPTY]');
                                        EDITOR.updateShipEditorName(i + 1, '[EMPTY]');
                                        _GAME.diff_addData(0);
                                    }
                                }
                                if (_GAME.game_entityGetHealth((9-1)) <= 0) {
                                    DISABLE_KRAKEN();
                                }
                            }
                        }
                    }
                }
            }
        };
    }
}

window.addEventListener('load', function() {
    var hash = location.hash.substr(1);
    if (hash && hash === 'twitch') {
        var twitch_elements = document.querySelectorAll('.twitch');
        for (var i = 0; i < twitch_elements.length; i++) {
            if (twitch_elements[i] instanceof HTMLElement) {
                twitch_elements[i].classList.remove('hide');
                if (twitch_elements[i].classList.contains('leaderboard')) {
                    twitch_elements[i].style.right = '0';
                }
            }
        }
        COMMANDS_TO_FUNCTIONS.init();
        connectws();
    }
});
