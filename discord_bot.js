// Requires bun install discord.js
import { Client, GatewayIntentBits } from "discord.js";

const GAME_URL = "https://spirodonfl.github.io/uwnh-remake/";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const SPECIAL_ROLE = "CanPlayGame";

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async message => {
    if (message.author.bot) return; // Ignore messages from bots

    if (!message.member.roles.cache.some(role => role.name === SPECIAL_ROLE)) {
        message.reply("You don't have the necessary permissions to use this command.");
        return;
    }

    const username = message.author.username;

    if (message.content.startsWith("!getKey")) {
        const response = await fetch("http://localhost:3333/generateKey", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        
        await message.reply({
            content: `Here is your link to play the game: ${GAME_URL}?is_multiplayer=true&key=${data.key}`,
            ephemeral: true // This makes the message only visible to the user who sent the command
        });
    }
});

// When running this, you would do `BOT_TOKEN=your_token_here bun discord_bot.js`
client.login(process.env.BOT_TOKEN);