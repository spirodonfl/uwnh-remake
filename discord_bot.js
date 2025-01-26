const GAME_URL = "https://spirodonfl.github.io/uwnh-remake/";
const SPECIAL_ROLE = "CanPlayGame";
const DISCORD_GATEWAY = "wss://gateway.discord.gg/?v=10&encoding=json";

const ws = new WebSocket(DISCORD_GATEWAY);
let heartbeatInterval;
let sequence = null;

// Handle WebSocket connection
ws.onopen = () => {
    console.log("Connected to Discord Gateway");
};

// Handle incoming messages
ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    sequence = data.s || sequence;

    switch (data.op) {
        case 10: // Hello
            heartbeatInterval = data.d.heartbeat_interval;
            identify();
            startHeartbeat();
            break;
        
        case 0: // Dispatch
            if (data.t === "MESSAGE_CREATE") {
                handleMessage(data.d);
            }
            break;
    }
};

function startHeartbeat() {
    setInterval(() => {
        ws.send(JSON.stringify({
            op: 1,
            d: sequence
        }));
    }, heartbeatInterval);
}

function identify() {
    ws.send(JSON.stringify({
        op: 2,
        d: {
            token: process.env.BOT_TOKEN,
            intents: 513, // Guilds + GuildMessages
            properties: {
                os: "linux",
                browser: "bun",
                device: "bun"
            }
        }
    }));
}

async function handleMessage(message) {
    if (message.author.bot) return;
    
    // Check if user has the special role
    const hasRole = message.member.roles.some(role => 
        role.name === SPECIAL_ROLE
    );

    if (!hasRole) {
        sendMessage(message.channel_id, {
            content: "You don't have the necessary permissions to use this command.",
            message_reference: { message_id: message.id }
        });
        return;
    }

    if (message.content.startsWith("!getKey")) {
        const response = await fetch("http://localhost:3333/generateKey", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: message.author.username })
        });
        const data = await response.json();
        
        sendMessage(message.channel_id, {
            content: `Here is your link to play the game: ${GAME_URL}?is_multiplayer=true&key=${data.key}`,
            message_reference: { message_id: message.id }
        });
    }
}

async function sendMessage(channelId, message) {
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
            "Authorization": `Bot ${process.env.BOT_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    });
}

// Error handling
ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
};

ws.onclose = () => {
    console.log("Disconnected from Discord Gateway");
    clearInterval(heartbeatInterval);
};