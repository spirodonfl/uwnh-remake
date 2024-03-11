import { globals } from './globals.js';

export const LocalStreamerbot = {
    ws: null,
    init: function () {
        this.ws = new WebSocket("ws://127.0.0.1:8080/");
        this.ws.onerror = (e) => { this.onerror(e); };
        this.ws.onclose = (e) => { this.onclose(e); };
        this.ws.onopen = (e) => { this.onopen(e); };
        this.ws.onmessage = (e) => { this.onmessage(e); };
    },
    onerror: function (e) {
        console.error('[LocalStreamberbot]', e)
    },
    onclose: function (e) {
        console.error('[LocalStreamerbot]', e);
    },
    onopen: function (e) {
        console.log('[LocalStreamerbot] Open', e);
        this.ws.send(JSON.stringify(
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
    },
    onmessage: function (message) {
        // grab message and parse JSON
        const msg = event.data;
        const wsdata = JSON.parse(msg);
        console.log('[LocalStreamerbot]', wsdata);

        if (wsdata.event && wsdata.event.source === 'Twitch') {
            if (wsdata.data.message && wsdata.data.message.displayName) {
                wsdata.data.message.displayName = wsdata.data.message.displayName.toLowerCase();
            }
            if (wsdata.event.type === 'RewardRedemption') {
                if (wsdata.data.reward.title === 'Kraken') {
                    globals.EVENTBUS.triggerEvent('kraken-twitch-redeemed', {user: wsdata.data.user_login});
                }
                else if (wsdata.data.reward.title === 'Poops') {
                    // TODO: Drop yoshi eggs in the water
                }
                else if (wsdata.data.reward.title === 'Plus5Health') {
                    globals.EVENTBUS.triggerEvent('plus5health-twitch-redeemed', {user: wsdata.data.user_login});
                }
                else if (wsdata.data.reward.title === 'Plus10Health') {
                    globals.EVENTBUS.triggerEvent('plus10health-twitch-redeemed', {user: wsdata.data.user_login});
                }
            } else if (wsdata.event.type === 'Raid') {
                globals.EVENTBUS.triggerEvent('raid-twitch', {raider: wsdata.data.displayName, viewers: wsdata.data.viewers});
            } else if (wsdata.event.type === 'Sub' || wsdata.event.type === 'ReSub') {
                globals.EVENTBUS.triggerEvent('sub-twitch', {user: wsdata.data.displayName});
            } else if (wsdata.event.type === 'GiftSub') {
                globals.EVENTBUS.triggerEvent('giftsub-twitch', {recipient: wsdata.data.recipientDisplayName});
            } else if (wsdata.event.type === 'GiftBomb') {
                if (wsdata.data.isAnonymous === false) {
                    globals.EVENTBUS.triggerEvent('giftbomb-twitch', {user: wsdata.data.displayName, gifts: wsdata.data.gifts});
                } else {
                    globals.EVENTBUS.triggerEvent('giftbomb-twitch-anonymous', {gifts: wsdata.data.gifts});
                }
            } else if (wsdata.event.type === 'Follow') {
                globals.EVENTBUS.triggerEvent('follow-twitch', {user: wsdata.data.displayName});
            } else if (wsdata.event.type === 'Cheer') {
                globals.EVENTBUS.triggerEvent('cheer-twitch', {user: wsdata.data.displayName, bits: wsdata.data.bits});
            } else if (wsdata.event && wsdata.event.type === "ChatMessage") {
                var user = wsdata.data.message.username;
                var role = wsdata.data.message.role;
                var message = wsdata.data.message.message;
                if (message.charAt(0) === '!') {
                    message = message.toLowerCase();
                    message = message.substr(1);
                    globals.EVENTBUS.triggerEvent('chat-message-twitch', {user, role, message});
                }
            }
        }
    },
};

