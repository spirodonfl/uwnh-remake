import { globals } from './globals.js';

export const RyansBackendSecondaryHole = {
    ws: null,
    open: false,
    init: function (login, name) {
        var url = 'wss://spirodon.games/playersocket/websocket';
        url += '?';
        url += 'channel=spirodonfl&';
        url += 'id=lemnean_sucks_deez_nutz&';
        url += 'login=' + login + '&';
        url += 'name=' + name;
    
        this.ws = new WebSocket(url);
        this.ws.onerror = (e) => { this.onerror(e); };
        this.ws.onclose = (e) => { this.onclose(e); };
        this.ws.onopen = (e) => { this.onopen(e); };
        this.ws.onmessage = (e) => { this.onmessage(e); };
    },

    onerror(e) {
        console.error('Ryans Backend Main Hole could not handle the heat', e);
        if (this.ws.readyState === 1) {
            this.open = true;
        } else {
            this.open = false;
        }
    },

    onclose(e) {
        console.error('Ryans Backend Main Hole is closed for business', e);
        if (this.ws.readyState === 1) {
            this.open = true;
        } else {
            this.open = false;
        }
    },

    onopen(e) {
        console.log('Ryans backend main hole is fully gaped', [e, this.ws]);
        if (this.ws.readyState === 1) {
            this.open = true;
            globals.EVENTBUS.triggerEvent(
                'opened-ryans-backend-secondary-hole', {}
            );
        } else {
            this.open = false;
        }
    },

    onmessage(message) {
        console.log('Ryans backend main hole is trying to talk to you', message);
        if (message.data) {
            var data = JSON.parse(message.data);
            console.log('Ryans backend main hole is trying to whisper sweet nothings to you', data);
            if (data.errors && data.errors.length > 0) {
                console.error('Ryans backend main hole basically shat the bed', data.errors);
            } else {
                globals.EVENTBUS.triggerEvent(
                    'message-from-ryans-backend-secondary-hole',
                    [{data:data}]
                );
            }
        }
        // RyansBackendSecondaryHole.send(JSON.stringify({"cmd": "some_command"}));
    },

    getLeaderboard() {
        console.log('sending get leaderboard');
        this.ws.send(JSON.stringify({ get_leaderboard: 40 }));
    }
};
