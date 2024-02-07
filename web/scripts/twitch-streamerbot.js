var twitch_streamerbot_ws = null;
var SHIPS_TO_PLAYER = [null, null, null, null, null];
var PLAYERS_CRIT_BUFF = [0, 0, 0, 0, 0];
function connectws() {
    if ("WebSocket" in window) {
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
                        ]
                    },
                    "id": "123"
                }
            ));
        };
        // TODO: Rate throttle the messages
        twitch_streamerbot_ws.onmessage = function (event) {
            // grab message and parse JSON
            const msg = event.data;
            const wsdata = JSON.parse(msg);
            console.log(wsdata);

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

            // TODO: Chain commands like !uudrrd
            // TODO: Redeem twitch channel points to be a boss ship
            // TODO: !move u2r2d!
            // TODO: Per user ships
            // check for events to trigger
            // TODO: Raiders spawn a new ship, health points are equal to # of raiders, go kill raider ship
            // Good idea from Elco - keep current count of viewers in cache, after raid, compare new count, diff = # of raiders
            // TODO: !spawn command for chat users who WANT to participate
            // TODO: Queue system for spawn/respawn in case of massive user count
            // TODO: Add sea mines
            // TODO: damage = Math.floor(Math.random() * 10);
            // TODO: ARENA - level up with viewer minutes, visit merchants by spending channel points to upgrade your player, then challenge players at top of leaderboard
            // TODO: During emote only, use channel points to send commands
            if (wsdata.event.source === 'Twitch') {
                if (wsdata.event.type === 'Sub' || wsdata.event.type === 'ReSub') {
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
                    // alert(`trigger chat message event for ${wsdata.data.message.displayName} ${wsdata.data.message.message}`);
                    // alert_element.innerHTML = `${wsdata.data.message.displayName} says: ${wsdata.data.message.message}`;
                    // alert_element.style.display = 'flex';
                    if (wsdata.data.message.message === '!up' || wsdata.data.message.message === '!u') {
                        if (_GAME) {
                            // Get the current player matching against PLAYER_TO_SHIP, get index of PLAYER_TO_SHIP, then call inputs_inputUp with that index
                            var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
                            if (player_index !== -1) {
                                _GAME.inputs_inputUp(player_index);
                            }
                            // _GAME.inputs_inputUp(0);
                        }
                    } else if (wsdata.data.message.message === '!down' || wsdata.data.message.message === '!d') {
                        if (_GAME) {
                            var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
                            if (player_index !== -1) {
                                _GAME.inputs_inputDown(player_index);
                            }
                            // _GAME.inputs_inputDown(0);
                        }
                    } else if (wsdata.data.message.message === '!left' || wsdata.data.message.message === '!l') {
                        if (_GAME) {
                            var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
                            if (player_index !== -1) {
                                _GAME.inputs_inputLeft(player_index);
                            }
                            // _GAME.inputs_inputLeft(0);
                        }
                    } else if (wsdata.data.message.message === '!right' || wsdata.data.message.message === '!r') {
                        if (_GAME) {
                            var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
                            if (player_index !== -1) {
                                _GAME.inputs_inputRight(player_index);
                            }
                            // _GAME.inputs_inputRight(0);
                        }
                    } else if (wsdata.data.message.message === '!attack' || wsdata.data.message.message === '!a') {
                        if (_GAME) {
                            var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
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
                                    }
                                }
                            }
                            // _GAME.game_entityAttack(0, 1);
                            // _GAME.game_entityAttack(0, 2);
                        }
                    } else if (wsdata.data.message.message === '!spawn') {
                        // First make sure the player isn't already in the game
                        var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
                        if (player_index < 0) {
                            for (var i = 0; i < SHIPS_TO_PLAYER.length; i++) {
                                if (SHIPS_TO_PLAYER[i] === null) {
                                    SHIPS_TO_PLAYER[i] = wsdata.data.message.displayName;
                                    EDITOR.updateEntityName(i + 1, wsdata.data.message.displayName);
                                    EDITOR.updateShipEditorName(i + 1, wsdata.data.message.displayName);
                                    _GAME.game_entitySetHealth(i, 8);
                                    _GAME.diff_addData(0);
                                    break;
                                }
                            }
                        }
                    } else if (wsdata.data.message.message.startsWith('!done')) {
                        var player_index = SHIPS_TO_PLAYER.indexOf(wsdata.data.message.displayName);
                        if (player_index !== -1) {
                            SHIPS_TO_PLAYER[player_index] = null;
                            EDITOR.updateEntityName(player_index + 1, '[EMPTY]');
                            EDITOR.updateShipEditorName(player_index + 1, '[EMPTY]');
                            _GAME.diff_addData(0);
                        }
                    } else if (wsdata.data.message.message.startsWith('!despawn')) {
                        if (wsdata.data.message.role >= 2) {
                            var split = wsdata.data.message.message.split(' ');
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
                    } else if (wsdata.data.message.message === '!reset') {
                        if (wsdata.data.message.role >= 2) {
                            window.location.reload();
                        }
                    }

                    for (var i = 0; i < SHIPS_TO_PLAYER.length; i++) {
                        if (_GAME.game_entityGetHealth(i) <= 0) {
                            SHIPS_TO_PLAYER[i] = null;
                            document.querySelector('[data-entity-id="' + (i + 1) + '"]').classList.add('juicy__shake__2');
                            EDITOR.updateEntityName(i + 1, '[EMPTY]');
                            EDITOR.updateShipEditorName(i + 1, '[EMPTY]');
                            _GAME.diff_addData(0);
                        }
                    }

                    // var reset_game = false;
                    // if (_GAME.game_entityGetHealth(0) <= 0 && _GAME.game_entityGetHealth(1) <= 0) {
                    //     alert_element.innerHTML = `PLAYER 3 WON! GAME OVER!`;
                    //     alert_element.style.display = 'flex';
                    //     reset_game = true;
                    // } else if (_GAME.game_entityGetHealth(1) <= 0 && _GAME.game_entityGetHealth(2) <= 0) {
                    //     alert_element.innerHTML = `PLAYER 1 WON! GAME OVER!`;
                    //     alert_element.style.display = 'flex';
                    //     reset_game = true;
                    // } else if (_GAME.game_entityGetHealth(0) <= 0 && _GAME.game_entityGetHealth(2) <= 0) {
                    //     alert_element.innerHTML = `PLAYER 2 WON! GAME OVER!`;
                    //     alert_element.style.display = 'flex';
                    //     reset_game = true;
                    // }

                    // if (reset_game) {
                    //     setTimeout(function () {
                    //         window.location.reload();
                    //     }, 3000);
                    // }
                }
            }
        };
    }
}

window.addEventListener('load', function() {
    connectws();
});
