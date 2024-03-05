let RyansBackendSecondaryHole = {
    init: function (login, name) {
        var url = 'wss://spirodon.games/playersocket/websocket';
        url += '?';
        url += 'channel=spirodonfl&';
        url += 'id=lemnean_sucks_deez_nutz&';
        url += 'login=' + login + '&';
        url += 'name=' + name;
        RyansBackendSecondaryHole = new WebSocket(url);
        RyansBackendSecondaryHole.onerror = function (e) {
            console.error('Ryans Backend Main Hole could not handle the heat', e);
        }
        RyansBackendSecondaryHole.onclose = function (e) {
            console.error('Ryans Backend Main Hole is closed for business', e);
        }
        RyansBackendSecondaryHole.onopen = function (e) {
            console.log('Ryans backend main hole is fully gaped', e);
        }
        RyansBackendSecondaryHole.onmessage = function (message) {
            console.log('Ryans backend main hole is trying to talk to you', message);
            if (message.data) {
                var data = JSON.parse(message.data);
                console.log('Ryans backend main hole is trying to whisper sweet nothings to you', data);
                if (data.errors && data.errors.length > 0) {
                    console.error('Ryans backend main hole basically shat the bed', data.errors);
                }
            }
            // RyansBackendSecondaryHole.send(JSON.stringify({"cmd": "some_command"}));
        }
        RyansBackendSecondaryHole.getLeaderboard = function () {}
    }
};

export { RyansBackendSecondaryHole };