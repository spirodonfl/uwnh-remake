window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    for (var [key, value] of params) {
        console.log('HASH');
        console.log(key, value);
    } 
    const multiplayer = params.get('multiplayer');
    const accessToken = params.get('access_token');
    if (multiplayer) {
        const clientId = 'pprdxqu1w21gxcn504lhg7acfe9sop'; // Replace with your client ID
        const redirectUri = encodeURIComponent('https://spirodon.games/game'); // Replace with your redirect URI
        const scope = encodeURIComponent('user:read:email'); // Request user's email
        const responseType = 'token'; // We want an access token
        const state = 'YOUR_STATE'; // Optional, but recommended for CSRF protection

        const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

        // Redirect the user to the Twitch authorization page
        window.location.href = authUrl;
    } else if (accessToken) {
        LOADER.events.addEventListener('loaded', function () {
            if (!_GAME) {
               console.error('GAME NOT LOADED');
               return false;
            }

            TWITCH.init();
            INPUT.MODE = INPUT.MODES.indexOf('Multiplayer');
            EDITOR.updateGameMode();
        });
        // Step  4: Use the access token to make authenticated requests
        console.log('Access token:', accessToken);
        // Example: Fetch user's email
        fetch('https://api.twitch.tv/helix/users', {
            headers: {
                'Client-ID': 'pprdxqu1w21gxcn504lhg7acfe9sop',
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.length) {
                const user = data.data[0];
                console.log('User:', user);
                console.log('User ID', user.id);
                console.log('User login', user.login);
                console.log('User display name', user.display_name);
                MULTIPLAYER.current_user.id = user.id;
                MULTIPLAYER.current_user.login = user.login;
                MULTIPLAYER.current_user.name = user.display_name;
                MULTIPLAYER.connectToRyansBackend();
                MULTIPLAYER.init();
            }
        })
        .catch(error => console.error('Error:', error));
    }
});
