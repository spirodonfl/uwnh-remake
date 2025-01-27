import { v4 as uuidv4, parse as uuidParse } from "uuid";
import database from "bun:sqlite";
const db = database.open("game.sqlite");

const GAME_URL = "https://spirodonfl.github.io/uwnh-remake/";
const SPECIAL_ROLE = "CanPlayGame";
const DISCORD_GATEWAY = "wss://gateway.discord.gg/?v=10&encoding=json";

const ws = new WebSocket(DISCORD_GATEWAY);
let heartbeatInterval;
let sequence = null;
let lastHeartbeatAck = true;
let heartbeatIntervalId;

ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    // console.log(data);
    sequence = data.s || sequence;

    switch (data.op) {
        case 10: // Hello
            heartbeatInterval = data.d.heartbeat_interval;
            // console.log("Identifying...");
            identify();
            // console.log("Starting heartbeat...");
            startHeartbeat();
            break;
        case 11: // Heartbeat ACK
            lastHeartbeatAck = true;
            break;
    }

    if (data.t === "MESSAGE_CREATE")
    {
        handleMessage(data.d);
    }
};
function startHeartbeat() {
    // Send first heartbeat
    ws.send(JSON.stringify({
        op: 1,
        d: sequence
    }));
    lastHeartbeatAck = false;

    // Store the interval ID
    heartbeatIntervalId = setInterval(() => {
        if (!lastHeartbeatAck) {
            ws.close();
            return;
        }
        lastHeartbeatAck = false;
        ws.send(JSON.stringify({
            op: 1,
            d: sequence
        }));
    }, heartbeatInterval);
}


function identify() {
    const GUILDS = 1 << 0;                    // For basic guild information
    const GUILD_MEMBERS = 1 << 1;             // For accessing member roles
    const GUILD_MESSAGES = 1 << 9;            // For receiving messages
    const MESSAGE_CONTENT = 1 << 15;          // For reading message content

    const intents = GUILDS | GUILD_MEMBERS | GUILD_MESSAGES | MESSAGE_CONTENT;
    ws.send(JSON.stringify({
        op: 2,
        d: {
            token: Bun.env.BOT_TOKEN,
            intents: intents,
            properties: {
                os: "linux",
                browser: "bun",
                device: "bun"
            }
        }
    }));
}

async function getRoleName(guildId, roleId) {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: {
            "Authorization": `Bot ${Bun.env.BOT_TOKEN}`,
            "Content-Type": "application/json"
        }
    });
    const roles = await response.json();
    return roles.find(role => role.id === roleId)?.name;
}

async function handleMessage(message) {
    if (message.author.bot) return;

    // console.log("Hello!");
    
    // Get guild roles
    const roles = await Promise.all(
        message.member.roles.map(roleId => getRoleName(message.guild_id, roleId))
    );
    
    const hasRole = roles.includes(SPECIAL_ROLE);

    // console.log("Has role? " + hasRole);

    if (!hasRole) {
        sendMessage(message.channel_id, {
            content: "You don't have the necessary permissions to use this command.",
            message_reference: { message_id: message.id }
        });
        return;
    }

    // console.log("Message", message);

    if (message.content.startsWith("!getKey"))
    {
        console.log("Command !getKey received");
        // const response = await fetch(`${BUN.env.HOST}/generateKey`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ username: message.author.username })
        // });
        // const data = await response.json();
        var keystring = uuidv4();
        var key = uuidParse(keystring);

        db.run(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [message.author.username]);
        db.run(`INSERT INTO keys (key, username) VALUES (?, ?)`, [key, message.author.username]);
        
        sendMessage(message.channel_id, {
            content: `Here is your link to play the game: ${GAME_URL}?host=${Bun.env.HOST}&is_multiplayer=true&key=${keystring}`,
            message_reference: { message_id: message.id }
        });
    }
    else if (message.content.startsWith("!poo"))
    {
        sendMessage(message.channel_id, {
            content: "SHITS AND FARTS",
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
    clearInterval(heartbeatIntervalId);
};