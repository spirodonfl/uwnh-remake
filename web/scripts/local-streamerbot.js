        this.streamerbot_ws = new WebSocket("ws://127.0.0.1:8080/");
        this.streamerbot_ws.onopen = function() {
            TWITCH.streamerbot_ws.send(JSON.stringify(
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
        this.streamerbot_ws.onmessage = function (event) {
            // grab message and parse JSON
            const msg = event.data;
            const wsdata = JSON.parse(msg);
            console.log('STREAMERBOTDATA:', wsdata);

            if (!TWITCH.ALERT_ELEMENT) {
                TWITCH.ALERT_ELEMENT = document.createElement('div');
                TWITCH.ALERT_ELEMENT.id = 'alert_element';
                TWITCH.ALERT_ELEMENT.style.position = 'absolute';
                TWITCH.ALERT_ELEMENT.style.top = '0';
                TWITCH.ALERT_ELEMENT.style.left = '0';
                TWITCH.ALERT_ELEMENT.style.width = '100%';
                TWITCH.ALERT_ELEMENT.style.height = '100%';
                TWITCH.ALERT_ELEMENT.style.backgroundColor = 'rgba(0,0,0,0.5)';
                TWITCH.ALERT_ELEMENT.style.color = 'white';
                TWITCH.ALERT_ELEMENT.style.zIndex = '3000';
                TWITCH.ALERT_ELEMENT.style.display = 'none';
                TWITCH.ALERT_ELEMENT.style.justifyContent = 'center';
                TWITCH.ALERT_ELEMENT.style.alignItems = 'center';
                TWITCH.ALERT_ELEMENT.style.fontSize = '2rem';
                document.body.appendChild(TWITCH.ALERT_ELEMENT);
            }

            if (wsdata.event && wsdata.event.source === 'Twitch') {
                if (wsdata.data.message && wsdata.data.message.displayName) {
                    wsdata.data.message.displayName = wsdata.data.message.displayName.toLowerCase();
                }
                if (wsdata.event.type === 'RewardRedemption') {
                    TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE REDEEM! ${wsdata.data.reward.title}`;
                    if (wsdata.data.reward.title === 'Kraken') {
                        ENABLE_KRAKEN();
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
                    else if (wsdata.data.reward.title === 'Randomize Map') {
                        TWITCH.randomizeCollisions(wsdata.data.user_input);
                    }
                } else if (wsdata.event.type === 'Raid') {
                    TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE RAID! ${wsdata.data.displayName} ${wsdata.data.viewers}`;
                    setTimeout(function() {
                        TWITCH.ALERT_ELEMENT.style.display = 'none';
                    }, 1000);
                    ENABLE_KRAKEN();
                    _GAME.game_entitySetHealth((9-1), wsdata.data.viewers);
                    OCTOPUS[2] = wsdata.data.viewers;
                } else if (wsdata.event.type === 'Sub' || wsdata.event.type === 'ReSub') {
                    // alert(`trigger sub event for ${wsdata.data.displayName}`);
                    TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE SUB! ${wsdata.data.displayName}`;
                    setTimeout(function() {
                        TWITCH.ALERT_ELEMENT.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event.type === 'GiftSub') {
                    // alert(`trigger Gift sub event for ${wsdata.data.recipientDisplayName}`);
                    TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE GIFT SUB! ${wsdata.data.recipientDisplayName}`;
                    setTimeout(function() {
                        TWITCH.ALERT_ELEMENT.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event.type === 'GiftBomb') {
                    if (wsdata.data.isAnonymous === false) {
                        // alert(`trigger gift bomb event for ${wsdata.data.displayName} ${wsdata.data.gifts} subs`);
                        TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE GIFT BOMB! ${wsdata.data.displayName} ${wsdata.data.gifts} subs`;
                        setTimeout(function() {
                            TWITCH.ALERT_ELEMENT.style.display = 'none';
                        }, 1000);
                    } else {
                        // alert(`trigger gift bomb event for Anonymous ${wsdata.data.gifts} subs`);
                        TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE GIFT BOMB! Anonymous ${wsdata.data.gifts} subs`;
                        setTimeout(function() {
                            TWITCH.ALERT_ELEMENT.style.display = 'none';
                        }, 1000);
                    }
                } else if (wsdata.event.type === 'Follow') {
                    // alert(`trigger follow event for ${wsdata.data.displayName}`);
                    TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE FOLLOW! ${wsdata.data.displayName}`;
                    setTimeout(function() {
                        TWITCH.ALERT_ELEMENT.style.display = 'none';
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
                    TWITCH.ALERT_ELEMENT.innerHTML = `THANK YOU FOR THE CHEER! ${wsdata.data.message.displayName} ${wsdata.data.message.bits}`;
                    setTimeout(function() {
                        TWITCH.ALERT_ELEMENT.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event && wsdata.event.type === "ChatMessage") {
                    var user = wsdata.data.message.username;
                    var role = wsdata.data.message.role;
                    var message = wsdata.data.message.message;
                    message = message.toLowerCase();
                    message = message.substr(1);
                    if (message && COMMANDS[message] === 1) {
                        if (message === 'up') {
                            COMMANDS_TO_FUNCTIONS.up(user);
                        } else if (message === 'down') {
                            COMMANDS_TO_FUNCTIONS.down(user);
                        } else if (message === 'left') {
                            COMMANDS_TO_FUNCTIONS.left(user);
                        } else if (message === 'right') {
                            COMMANDS_TO_FUNCTIONS.right(user);
                        } else if (message === 'attack') {
                            COMMANDS_TO_FUNCTIONS.attack(user);
                        } else if (message === 'spawn') {
                            COMMANDS_TO_FUNCTIONS.spawn(user);
                        } else if (message === 'done') {
                            COMMANDS_TO_FUNCTIONS.done(user);
                        } else if (message === 'despawn') {
                            COMMANDS_TO_FUNCTIONS.despawn(user);
                        } else if (message === 'kraken') {
                            COMMANDS_TO_FUNCTIONS.kraken(user, role);
                        } else if (message === 'reset') {
                            COMMANDS_TO_FUNCTIONS.reset(user, role);
                        } else {
                            console.log('UNKNOWN COMMAND', message);
                        }
                    }
                }
            }
        }
    },
    handleInput: function (inputEvent) {
        if (inputEvent.shiftKey === true) {
            if (inputEvent.code === 'KeyG') {
                // TODO: GAME_MODE should actually be this.GAME_MODE when you switch to the class
                if (TWITCH.GAME_MODE === 0) {
                    TWITCH.GAME_MODE = 1;
                    EDITOR.updateGameMode();
                    COMMANDS_TO_FUNCTIONS.updateTurn();
                } else {
                    TWITCH.GAME_MODE = 0;
                    EDITOR.updateGameMode();
                }
                // TODO: Add other shortcut combos for
                // * random map
                // * despawn someone
                // * spawn ghost NPC
                // * spawn kraken
                // * despawn kraken
                // * pause the game
                // * highlighting a specific user/entity
            } else if (event.code === 'KeyP') {
                TWITCH.PAUSED = !TWITCH.PAUSED;
                EDITOR.updateGameMode();
            } else if (event.code === 'KeyH') {
                var twitch_sidebar = document.getElementById('twitch_sidebar');
                twitch_sidebar.classList.toggle('hide');
            } else if (event.code === 'KeyK') {
                if (OCTOPUS[3] === false) {
                    ENABLE_KRAKEN();
                } else {
                    DISABLE_KRAKEN();
                }
            }
        }
