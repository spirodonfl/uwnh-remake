var twitch_streamerbot_ws = null;
var SHIPS_TO_PLAYER = [null, null, null, null, null];
var PLAYERS_CRIT_BUFF = [0, 0, 0, 0, 0];
var LEADERBOARD = {};
function addToLeaderboard(user) {
    LEADERBOARD = Object.fromEntries(
        Object.entries(LEADERBOARD).sort(([,a],[,b]) => b-a)
    );
    var leaderboard_element = document.getElementById('leaderboard');
    if (leaderboard_element) {
        var leaderboard_html = '';
        for (var key in LEADERBOARD) {
            if (LEADERBOARD.hasOwnProperty(key)) {
                leaderboard_html += `<div>${key}: ${LEADERBOARD[key]}</div>`;
            }
        }
        leaderboard_element.innerHTML = leaderboard_html;
    }
    // https://spirodon.games/leaderboard
    // {increment_score: {user: "", inc: n}}
    // - TO RESET just increment by a negative number
    // https://github.com/ryanwinchester/twitch_gameserver/blob/main/lib/twitch_gameserver_web/game_socket.ex#L143-L150
    if (rd_streamerbot_ws) {
        rd_streamerbot_ws.send(JSON.stringify({
            increment_score: {
                user: user,
                inc: 1
            }
        }));
    }
}
function killedPlayer(user) {
    LEADERBOARD[user] = LEADERBOARD[user] + 1 || 1;
    addToLeaderboard(user);
}
function killedKraken(user) {
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
        }
        // _GAME.inputs_inputUp(0);
    }
}
function handleDown(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputDown(player_index);
        }
        // _GAME.inputs_inputDown(0);
    }
}
function handleLeft(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputLeft(player_index);
        }
        // _GAME.inputs_inputLeft(0);
    }
}
function handleRight(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputRight(player_index);
        }
        // _GAME.inputs_inputRight(0);
    }
}
function handleAttack(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        var have_crit = PLAYERS_CRIT_BUFF[player_index];
        if (have_crit) {
            // Javascript match random chance to set to true or false
            PLAYERS_CRIT_BUFF[player_index] = Math.random() < 0.5;
        }
        if (player_index !== -1) {
            // Only attack the other two players from SHIPS_TO_PLAYER
            for (var i = 0; i < SHIPS_TO_PLAYER.length; i++) {
                if (i !== player_index && _GAME.game_entityGetHealth(i) > 0) {
                    _GAME.game_entityAttack(player_index, i, have_crit);
                    if (_GAME.game_entityGetHealth(i) <= 0) {
                        killedPlayer(user);
                    }
                }
                _GAME.game_entityAttack(player_index, 9-1, have_crit);
                if (_GAME.game_entityGetHealth((9-1)) <= 0) {
                    killedKraken(user);
                }
            }
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
                    EDITOR.updateEntityName(i + 1, user);
                    EDITOR.updateShipEditorName(i + 1, user);
                    _GAME.game_entitySetHealth(i, 8);
                    _GAME.diff_addData(0);
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
}
function userDone(user) {
    if (_GAME) {
        var player_index = SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            SHIPS_TO_PLAYER[player_index] = null;
            EDITOR.updateEntityName(player_index + 1, '[EMPTY]');
            EDITOR.updateShipEditorName(player_index + 1, '[EMPTY]');
            _GAME.diff_addData(0);
        }
    }
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
    "spawn": 1,
    "despawn": 1,
    "kraken": 1,
    "reset": 1,
    "done": 1,
};
var rd_streamerbot_ws = null;
function connectws() {
    if ("WebSocket" in window) {
        rd_streamerbot_ws = new WebSocket("wss://spirodon.games/gamesocket/websocket");
        rd_streamerbot_ws.onopen = function() {
            rd_streamerbot_ws.send(JSON.stringify(
                {
                    "set_filters": {
                        "commands": [
                            "up", "down", "left", "right", "attack", "spawn", "despawn", "kraken"
                        ],
                        "matches": [
                            "^[lurda]+$"
                        ]
                    },
                    "set_rate": 500,
                }
            ));
        };
        rd_streamerbot_ws.onmessage = function (event) {
            if (event.data) {
                var data = JSON.parse(event.data);
                console.log('RYANDATA', data);
                if (data.errors && data.errors.length > 0) {
                    console.error('RYANERRORS', data.errors);
                }
                if (data.commands) {
                    for (var i = 0; i < data.commands.length; ++i) {
                        console.log('RYANCOMMAND', data.commands[i]);
                        var user = data.commands[i].user.toLowerCase();
                        var cmd = data.commands[i].cmd;
                        if (cmd.length >= 1 && COMMANDS[cmd] === 0) {
                            if (cmd === 'attack') {
                                handleAttack(user);
                                continue;
                            } else if (cmd == 'up') {
                                handleUp(user);
                            } else if (cmd == 'down') {
                                handleDown(user);
                            } else if (cmd == 'left') {
                                handleLeft(user);
                            } else if (cmd == 'right') {
                                console.log('RYANRIGHT', user);
                                handleRight(user);
                            } else if (cmd == 'spawn') {
                                console.log('RYANSPAWN', user);
                            } else if (cmd == 'despawn') {

                            } else if (cmd == 'kraken') {

                            } else if (cmd == 'reset') {

                            } else if (cmd == 'done') {

                            }
                        } else {
                            cmd = cmd.split('');
                            // console.log(cmd);
                            if (cmd.length > 1 && user.length > 0) {
                                // We assume this means a multi-command
                                for (var j = 0; j < cmd.length; ++j) {
                                    if (COMMANDS[cmd[j]] === 0) {
                                        if (cmd[j] === 'u') {
                                            handleUp(user);
                                        } else if (cmd[j] === 'd') {
                                            handleDown(user);
                                        } else if (cmd[j] === 'l') {
                                            handleLeft(user);
                                        } else if (cmd[j] === 'r') {
                                            handleRight(user);
                                        } else if (cmd[j] === 'a') {
                                            handleAttack(user);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

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
                } else if (wsdata.event.type === 'Raid') {
                    // alert(`trigger raid event for ${wsdata.data.displayName} ${wsdata.data.viewers}`);
                    alert_element.innerHTML = `THANK YOU FOR THE RAID! ${wsdata.data.displayName} ${wsdata.data.viewers}`;
                    setTimeout(function() {
                        alert_element.style.display = 'none';
                    }, 1000);
                    ENABLE_KRAKEN();
                    _GAME.game_entitySetHealth((9-1), wsdata.data.viewers);
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
                        // alert(`trigger chat message event for ${wsdata.data.message.displayName} ${wsdata.data.message.message}`);
                        // alert_element.innerHTML = `${wsdata.data.message.displayName} says: ${wsdata.data.message.message}`;
                        // alert_element.style.display = 'flex';
                        if (cmd === 'up' || cmd === 'u') {
                            // handleUp(user);
                        } else if (cmd === 'down' || cmd === 'd') {
                            // handleDown(user);
                        } else if (cmd === 'left' || cmd === 'l') {
                            // handleLeft(user);
                        } else if (cmd === 'right' || cmd === 'r') {
                            // handleRight(user);
                        } else if (cmd === 'attack' || cmd === 'a') {
                            // handleAttack(user);
                        } else if (cmd === 'spawn') {
                            userSpawn(user);
                        } else if (cmd.startsWith('done')) {
                            userDone(user);
                        } else if (cmd.startsWith('despawn')) {
                            userDespawn(user, wsdata.data.message.role, wsdata.data.message.message);
                        } else if (cmd === 'reset') {
                            if (wsdata.data.message.role >= 2) {
                                window.location.reload();
                            }
                        } else if (cmd === 'kraken') {
                            if (wsdata.data.message.role >= 2) {
                                ENABLE_KRAKEN();
                            }
                        }

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
        connectws();
    }
});
