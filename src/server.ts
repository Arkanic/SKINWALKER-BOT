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
    if(message.author.id == client.user!.id) return;
    if(!message.content.startsWith("fake")) {
        console.log(`[train] ${message.author.username}`);
        return replikas.train(message.author.id, message.content);
    }
    let parts = message.content.split(" ");
    parts.shift();
    if(parts.length < 1) return;
    let content = parts.join(" ");
    message.guild?.members.search({query: content, limit: 1}).then((members) => {
        if(members.size <= 0) return message.react("❌");
        const member = members.first()!
        replikas.generate(member.id, 500).then((generated) => {
            console.log(`[generate] ${member.user.username}`);
            message.channel.send(generated.substring(0, 2000));
        }).catch((e) => {
            message.react("❌");
        });
    });
});

client.once(Events.ClientReady, readyClient => {
    console.log(`logged in as ${readyClient.user.tag}`);
});

client.login(token);


let handleCloseHasRun = 0;
function handleClose(error:any, origin:any) {
    if(handleCloseHasRun) return;
    handleCloseHasRun = 1;
    console.log("closing");
    console.log(error, origin)
    replikas.closeall();
    process.exit();
}

process.on("exit", handleClose);
process.on("SIGTERM", handleClose);
process.on("SIGINT", handleClose);
process.on("uncaughtException", handleClose);