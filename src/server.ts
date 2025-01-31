import {Client, Events, GatewayIntentBits} from "discord.js";

import token from "../config";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on(Events.MessageCreate, async message => {
    console.log(message.content);
});

client.once(Events.ClientReady, readyClient => {
    console.log(`logged in as ${readyClient.user.tag}`);
});

client.login(token);