import {Client, Events, GatewayIntentBits} from "discord.js";
import ReplikaManager from "./replikaManager";

import token from "../config";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let replikas = new ReplikaManager(1000 * 60 * 30); // users sit for 30 min in memory

client.on(Events.MessageCreate, async message => {
    replikas.train(message.author.id, message.content);
});

client.once(Events.ClientReady, readyClient => {
    console.log(`logged in as ${readyClient.user.tag}`);
});

client.login(token);


let handleCloseHasRun = 0;
function handleClose() {
    if(handleCloseHasRun) return;
    handleCloseHasRun = 1;
    console.log("closing");
    replikas.closeall();
    process.exit();
}

process.on("exit", handleClose);
process.on("SIGTERM", handleClose);
process.on("SIGINT", handleClose);
process.on("uncaughtException", handleClose);