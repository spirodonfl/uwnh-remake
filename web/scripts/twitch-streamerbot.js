// TODO: Apply a keyboard shortcut along with the #twitch hash to enable twitch mode
var TWITCH = {
    ryans_ws: null,
    streamerbot_ws: null,
    GAME_MODE: 0, // 0 = realtime && 1 = turn based
    TURN: 0, // TURN 5(aka: 6) = KRAKEN
    TURN_FRAMES_TRIGGERED: false,
    SHIPS_TO_PLAYER: [null, null, null, null, null],
    INVULN_PLAYERS: [null, null, null, null, null],
    PLAYERS_CRIT_BUFF: [0, 0, 0, 0, 0],
    SHIPS_TO_PLAYER_COLORCODE: ['#ffffff', '#00ff00', '#ffb2f7', '#ffff00', '#ff6f6f'],
    LEADERBOARD: {},
    KRAKEN_PLAYER: null,
    PAUSED: false,
    ALERT_ELEMENT: false,
    init: function () {
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

        this.ryans_ws = new WebSocket("wss://spirodon.games/gamesocket/websocket");
        this.ryans_ws.onerror = function() {
            TWITCH.ryans_ws.close();
        };
        this.ryans_ws.onclose = function() {
            console.log('RYANCLOSED');
        };
        this.ryans_ws.onopen = function() {
            TWITCH.ryans_ws.send(JSON.stringify(
                {
                    "set_filters": {
                        "commands": [
                            "up", "down", "left", "right", "attack", "spawn", "despawn", "kraken", "reset", "done"
                        ],
                        "matches": [
                            "^[lurda0-9]+$",
                            "^random [a-zA-Z0-9\\s]+$"
                        ]
                    },
                    "set_rate": 500,
                }
            ));
            TWITCH.updateLeaderboard();
        };
        // AKA: handleRyan
        this.ryans_ws.onmessage = function (event) {
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
                        var role = data.data.commands[i].role;

                        cmd = cmd.split(' ')[0];
                        if (cmd === 'random') {
                            if (role === "vip" || role === "mod" || role === "broadcaster" || user === "spirodonfl") {
                                role = 3;
                            } else {
                                role = 1;
                            }
                            COMMANDS_TO_FUNCTIONS.random(user, role, data.data.commands[i].cmd);
                            continue;
                        }

                        // Start with specific [full] commands first
                        // Then check for "chained" commands
                        // - should make it easy to read numbers from the chain
                        if (COMMANDS[cmd] === 0) {
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
        };

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
    },
    addToLeaderboard: function(user) {
        if (this.ryans_ws) {
            this.ryans_ws.send(JSON.stringify({
                increment_score: {
                    user: user,
                    inc: 1
                }
            }));
        }

        this.updateLeaderboard();

        // https://spirodon.games/leaderboard
        // {increment_score: {user: "", inc: n}}
        // - TO RESET just increment by a negative number
        // https://github.com/ryanwinchester/twitch_gameserver/blob/main/lib/twitch_gameserver_web/game_socket.ex#L143-L150
    },
    updateLeaderboard: function() {
        if (this.ryans_ws) {
            this.ryans_ws.send(JSON.stringify({
                get_leaderboard: 40,
            }));
        }
    },
    killedPlayer: function(user) {
        console.log('KILLEDPLAYER', user);
        this.LEADERBOARD[user] = this.LEADERBOARD[user] + 1 || 1;
        this.addToLeaderboard(user);
    },
    killedKraken: function(user) {
        this.KRAKEN_PLAYER = null;
        DISABLE_KRAKEN();
        this.LEADERBOARD[user] = this.LEADERBOARD[user] + 3 || 3;
        this.addToLeaderboard(user);
    },
    handleUp: function(user) {
        // Get the current player matching against PLAYER_TO_SHIP, get index of PLAYER_TO_SHIP, then call inputs_inputUp with that index
        var player_index = this.SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputUp(player_index);
            this.INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputUp(0);
    },
    handleDown: function(user) {
        var player_index = this.SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputDown(player_index);
            this.INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputDown(0);
    },
    handleLeft: function(user) {
        var player_index = this.SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputLeft(player_index);
            this.INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputLeft(0);
    },
    handleRight: function(user) {
        var player_index = this.SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            _GAME.inputs_inputRight(player_index);
            this.INVULN_PLAYERS[player_index] = null;
        }
        // _GAME.inputs_inputRight(0);
    },
    handleAttack: function(user) {
        console.log('HANDLEATTACK', user);
        var player_index = this.SHIPS_TO_PLAYER.indexOf(user);
        var have_crit = this.PLAYERS_CRIT_BUFF[player_index];
        if (have_crit) {
            // Javascript match random chance to set to true or false
            this.PLAYERS_CRIT_BUFF[player_index] = Math.random() < 0.5;
        }
        if (player_index !== -1 && this.INVULN_PLAYERS[player_index] === null) {
            // Only attack the other two players from SHIPS_TO_PLAYER
            for (var i = 0; i < this.SHIPS_TO_PLAYER.length; ++i) {
                if (i !== player_index && _GAME.game_entityGetHealth(i) > 0) {
                    if (this.INVULN_PLAYERS[i] === true) { continue; }
                    var successful_attack = _GAME.game_entityAttack(player_index, i, have_crit);
                    if (successful_attack) {
                        var player_element = document.querySelector('[data-entity-id="' + (player_index + 1) + '"]');
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
                                if (TWITCH.SHIPS_TO_PLAYER[i] !== null) {
                                    TWITCH.killedPlayer(user);
                                    TWITCH.userDone(TWITCH.SHIPS_TO_PLAYER[i]);
                                }
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
                }
                var successful_attack_on_kraken = _GAME.game_entityAttack(player_index, 9-1, have_crit);
                if (successful_attack_on_kraken) {
                    if (_GAME.game_entityGetHealth((9-1)) <= 0) {
                        TWITCH.killedKraken(user);
                    }
                }
            }
            for (var i = TWITCH.SHIPS_TO_PLAYER.length; i < 8; ++i) {
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
    },
    userSpawn: function (user) {
        // First make sure the player isn't already in the game
        var player_index = this.SHIPS_TO_PLAYER.indexOf(user);
        if (player_index < 0) {
            for (var i = 0; i < this.SHIPS_TO_PLAYER.length; i++) {
                if (this.SHIPS_TO_PLAYER[i] === null) {
                    this.SHIPS_TO_PLAYER[i] = user;
                    this.INVULN_PLAYERS[i] = true;
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
    },
    userDespawn: function (user, role, message) {
        if (role >= 2) {
            var split = message.split(' ');
            if (split.length === 2) {
                var ship_number = parseInt(split[1]);
                if (ship_number >= 1) {
                    ship_number -= 1;
                    if (ship_number >= 0 && ship_number < this.SHIPS_TO_PLAYER.length) {
                        this.SHIPS_TO_PLAYER[ship_number] = null;
                        EDITOR.updateEntityName(ship_number + 1, '[EMPTY]');
                        EDITOR.updateShipEditorName(ship_number + 1, '[EMPTY]');
                        _GAME.diff_addData(0);
                    }
                }
            }
        }
    },
    userDone: function (user) {
        console.log('USERDONE', user);
        var player_index = this.SHIPS_TO_PLAYER.indexOf(user);
        if (player_index !== -1) {
            this.SHIPS_TO_PLAYER[player_index] = null;
            EDITOR.updateEntityName(player_index + 1, '[EMPTY]');
            EDITOR.updateShipEditorName(player_index + 1, '[EMPTY]');
            _GAME.diff_addData(0);
        } else {
            console.log('PLAYER NOT FOUND', user);
        }
    },
    randomizeCollisions: function (seed_string) {
        var seed = cyrb128(seed_string);
        var random = splitmix32(seed[0]);
        TWITCH.PAUSED = true;
        var collision_blocks_added = 0;
        var collision_blocks_total = 60;
        var y = 0;
        var x = 0;
        var cwi = _GAME.game_getCurrentWorldIndex();
        var layer = 0;
        for (var i = 0; i < (DOM.width * DOM.height); ++i) {
            var viewport_y = Math.floor(i / DOM.width);
            var viewport_x = i % DOM.width;
            if (_GAME.viewport_getData(viewport_x, viewport_y)) {
                var collision = _GAME.game_getWorldAtViewport(2, viewport_x, viewport_y);
                if (collision === 1) {
                    var translated_x = _GAME.game_translateViewportXToWorldX(viewport_x);
                    var translated_y = _GAME.game_translateViewportYToWorldY(viewport_y);
                    _GAME.game_setWorldData(0, 2, translated_x, translated_y, 0);
                }
            }
        }
        for (var i = 0; i < (DOM.width * DOM.height); ++i) {
            var viewport_y = Math.floor(i / DOM.width);
            var viewport_x = i % DOM.width;
            if (_GAME.viewport_getData(viewport_x, viewport_y)) {
                var spot_available = true;
                var entity_id = _GAME.game_getWorldAtViewport(1, viewport_x, viewport_y);
                if (entity_id !== 0) {
                    spot_available = false;
                }
                var collision = _GAME.game_getWorldAtViewport(2, viewport_x, viewport_y);
                if (collision === 0) {
                    var translated_x = _GAME.game_translateViewportXToWorldX(viewport_x);
                    var translated_y = _GAME.game_translateViewportYToWorldY(viewport_y);
                    if (
                        random() < 0.1
                        && spot_available
                        && collision_blocks_added < collision_blocks_total
                    ) {
                        _GAME.game_setWorldData(0, 2, translated_x, translated_y, 1);
                        ++collision_blocks_added;
                    }
                }
                if (collision_blocks_added >= collision_blocks_total) {
                    break;
                }
            }
        }
        _GAME.diff_addData(0);
        TWITCH.PAUSED = false;
    },
};

// TODO: PROBABLY BELONGS IN A HELPER CLASS
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}
function splitmix32(a) {
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
          t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
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
    "spawn": 0,
    "despawn": 1,
    "kraken": 1,
    "reset": 1,
    "done": 1,
    // "random": 1,
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
        var player_index = TWITCH.SHIPS_TO_PLAYER.indexOf(user);
        if (
            !TWITCH.PAUSED &&
            (
                TWITCH.GAME_MODE === 0 ||
                (
                    TWITCH.GAME_MODE === 1 &&
                    (
                        TWITCH.TURN === player_index ||
                        (
                            TWITCH.TURN === 5 &&
                            TWITCH.KRAKEN_PLAYER === user
                        )
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
        if (TWITCH.KRAKEN_PLAYER === null && !TWITCH.PAUSED) {
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
            for (var i = 0; i < 5; ++i) {
                var attack_worked = false;
                attack_worked = _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                attack_worked = _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                attack_worked = _GAME.game_entityAttack(OCTOPUS_INDEX, i);
                if (
                    attack_worked
                    && _GAME.game_entityGetHealth(i) <= 0
                    && TWITCH.SHIPS_TO_PLAYER[i] !== null
                    && TWITCH.INVULN_PLAYERS[i] !== true
                ) {
                    // TODO: Track if user is already dead so you don't re-process
                    console.log('USERDONED', TWITCH.SHIPS_TO_PLAYER[i]);
                    TWITCH.userDone(TWITCH.SHIPS_TO_PLAYER[i]);
                }
            }
            this.updateTurn();
        }
    },
    "updateTurn": function () {
        if (TWITCH.GAME_MODE === 1 && (TWITCH.TURN_FRAMES_TRIGGERED === false || DOM.frameCallbacks[TWITCH.TURN_FRAMES_TRIGGERED] === false)) {
            TWITCH.TURN_FRAMES_TRIGGERED = DOM.addRunOnFrames(60, function() {
                var kraken_enabled = OCTOPUS[3];
                if (TWITCH.TURN <= 4 && TWITCH.SHIPS_TO_PLAYER[TWITCH.TURN] !== null) {
                    ++TWITCH.TURN;
                    // for (var s_my_d = 0; s_my_d < 5; ++s_my_d) {
                    //     if (SHIPS_TO_PLAYER[s_my_d] !== null) {
                    //         TURN = s_my_d;
                    //         break;
                    //     }
                    // }
                    if (TWITCH.SHIPS_TO_PLAYER[TWITCH.TURN] == null) {
                        COMMANDS_TO_FUNCTIONS.updateTurn();
                    }
                } else if (TWITCH.TURN <= 4 && TWITCH.SHIPS_TO_PLAYER[TWITCH.TURN] === null) {
                    // NO PLAYER TO PLAY THIS TURN, MUST MOVE ON
                    ++TWITCH.TURN;
                    COMMANDS_TO_FUNCTIONS.updateTurn();
                } else if (TWITCH.TURN === 5 && kraken_enabled && TWITCH.KRAKEN_PLAYER === null) {
                    // KRAKEN IS ENABLED AND SHOULD BE AUTOMATED HERE
                    ++TWITCH.TURN;
                    COMMANDS_TO_FUNCTIONS.autoKraken();
                } else if (TWITCH.TURN === 5 && kraken_enabled && TWITCH.KRAKEN_PLAYER !== null) {
                    // KRAKEN IS ENABLED AND A TWITCH PLAYER IS CONTROLLING IT
                    TWITCH.TURN = 0;
                } else if (TWITCH.TURN === 5 && !kraken_enabled) {
                    TWITCH.TURN = 0;
                    COMMANDS_TO_FUNCTIONS.updateTurn();
                } else if (TWITCH.TURN >= 6) {
                    TWITCH.TURN = 0;
                }

                var ship_slots = document.querySelectorAll(".ship_slot");
                for (var s_my_d = 0; s_my_d < ship_slots.length; ++s_my_d) {
                    if (ship_slots[s_my_d] instanceof HTMLElement) {
                        ship_slots[s_my_d].classList.remove('active');
                    }
                }
                var ship_element = document.querySelector("#ship_" + (TWITCH.TURN + 1));
                if (ship_element instanceof HTMLElement) {
                    ship_element.classList.add('active');
                }
            }, true);
        }
    },
    "attack": function (user) {
        if (this.allowed(user)) {
            if (TWITCH.KRAKEN_PLAYER === user) {
                // TODO: Repetitive code, put in function
                for (var i = 0; i < 4; ++i) {
                    if (TWITCH.INVULN_PLAYERS[i] === true) { continue; }
                    _GAME.game_entityAttack(8, i);
                    _GAME.game_entityAttack(8, i);
                    _GAME.game_entityAttack(8, i);
                    if (_GAME.game_entityGetHealth(i) <= 0) {
                        TWITCH.userDone(TWITCH.SHIPS_TO_PLAYER[i]);
                    }
                }
            } else {
                TWITCH.handleAttack(user);
            }
            this.updateTurn();
        }
    },
    "up": function (user) {
        if (this.allowed(user)) {
            if (user === TWITCH.KRAKEN_PLAYER) {
                _GAME.inputs_inputUp(8);
            } else {
                TWITCH.handleUp(user);
            }
            this.updateTurn();
        }
    },
    "down": function (user) {
        if (this.allowed(user)) {
            if (user === TWITCH.KRAKEN_PLAYER) {
                _GAME.inputs_inputDown(8);
            } else {
                TWITCH.handleDown(user);
            }
            this.updateTurn();
        }
    },
    "left": function (user) {
        if (this.allowed(user)) {
            if (user === TWITCH.KRAKEN_PLAYER) {
                _GAME.inputs_inputLeft(8);
            } else {
                TWITCH.handleLeft(user);
            }
            this.updateTurn();
        }
    },
    "right": function (user) {
        if (this.allowed(user)) {
            if (user === TWITCH.KRAKEN_PLAYER) {
                _GAME.inputs_inputRight(8);
            } else {
                TWITCH.handleRight(user);
            }
            this.updateTurn();
        }
    },
    "spawn": function (user) {
        TWITCH.userSpawn(user);
    },
    "done": function (user) {
        TWITCH.userDone(user);
    },
    "despawn": function (user, role, message) {
        TWITCH.userDespawn(user, role, message);
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
    },
    "random": function (user, role, message) {
        console.log('RANDOMROLE', role);
        if (role >= 2) {
            var split = message.split(' ');
            if (split.length >= 2) {
                var slice = split.slice(1);
                slice = slice.join(' ');
                console.log('RANDOMCOLLISIONSLICE', slice);
                TWITCH.randomizeCollisions(slice);
            }
        }
    },
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

window.addEventListener('load', function() {
    var hash = location.hash.substr(1);
    if (hash && hash === 'twitch') {
        LOADER.events.addEventListener('loaded', function () {
            if (!_GAME) {
               console.error('GAME NOT LOADED');
               return false;
            }

            TWITCH.init();
            EDITOR.updateGameMode();
        });
    }
});

function TEST_PLAYER_IN_RYANS_BACKEND() {
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
                "display_name": "RyanWinchester_",
                "user_login": "ryanwinchester_",
                "channel": "spirodonfl"
            }
        }));
    };
}
