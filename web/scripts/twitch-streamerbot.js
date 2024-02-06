var twitch_streamerbot_ws = null;
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
                    alert_element.innerHTML = `THANK YOU FOR THE CHEER! ${wsdata.data.message.displayName} ${wsdata.data.message.bits}`;
                    setTimeout(function() {
                        alert_element.style.display = 'none';
                    }, 1000);
                } else if (wsdata.event.type === 'ChatMessage') {
                    // alert(`trigger chat message event for ${wsdata.data.message.displayName} ${wsdata.data.message.message}`);
                    // alert_element.innerHTML = `${wsdata.data.message.displayName} says: ${wsdata.data.message.message}`;
                    // alert_element.style.display = 'flex';
                    if (wsdata.data.message.message === '!up') {
                        if (_GAME) {
                            _GAME.inputs_inputUp(0);
                        }
                    } else if (wsdata.data.message.message === '!down') {
                        if (_GAME) {
                            _GAME.inputs_inputDown(0);
                        }
                    } else if (wsdata.data.message.message === '!left') {
                        if (_GAME) {
                            _GAME.inputs_inputLeft(0);
                        }
                    } else if (wsdata.data.message.message === '!right') {
                        if (_GAME) {
                            _GAME.inputs_inputRight(0);
                        }
                    } else if (wsdata.data.message.message === '!attack') {
                        if (_GAME) {
                            _GAME.game_entityAttack(0, 1);
                        }
                    } else if (wsdata.data.message.message === '!cup') {
                        if (_GAME) {
                            _GAME.inputs_inputUp(1);
                        }
                    } else if (wsdata.data.message.message === '!cdown') {
                        if (_GAME) {
                            _GAME.inputs_inputDown(1);
                        }
                    } else if (wsdata.data.message.message === '!cleft') {
                        if (_GAME) {
                            _GAME.inputs_inputLeft(1);
                        }
                    } else if (wsdata.data.message.message === '!cright') {
                        if (_GAME) {
                            _GAME.inputs_inputRight(1);
                        }
                    } else if (wsdata.data.message.message === '!cattack') {
                        if (_GAME) {
                            _GAME.game_entityAttack(1, 0);
                        }
                    }
                }
            }
        };
    }
}

window.addEventListener('load', function() {
    connectws();
});
