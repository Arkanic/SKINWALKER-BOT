import {Client, Events, GatewayIntentBits, GuildMember} from "discord.js";
import ReplikaManager from "./replikaManager";

import {token, modelpath} from "../config";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let replikas = new ReplikaManager(modelpath, 1000 * 60 * 30); // users sit for 30 min in memory

client.on(Events.MessageCreate, async message => {
    if(message.author.id == client.user!.id) return;
    if(!message.guild) return; // is a dm

    if(!message.content.startsWith("fake")) { // not asking to generate, so lets feed the model
        console.log(`[train] ${message.author.username}`);
        return replikas.train(message.author.id, message.content);
    }

    let parts = message.content.split(" ");
    parts.shift();
    if(parts.length < 1) return;
    let content = parts.join(" ");
    
    let member:GuildMember | undefined;
    if(content.startsWith("<@") && content.endsWith(">")) { // traditional @whatever
        member = await message.guild?.members.fetch(content.slice(2, content.length - 1))
    } else if(!/[^0-9]/.test(content)) { // id sent as text
        member = await message.guild?.members.fetch(content);
    } else { // username sent as text
        let members = await message.guild?.members.search({query: content, limit: 1})
        if(members.size > 0) member = members.first();
    }
    
    if(!member) return message.react("❌");
    replikas.generate(member.id, 500).then((generated) => {
        console.log(`[generate] ${member.user.username}`);
        message.channel.send(generated.substring(0, 2000));
    }).catch((e) => {
        message.react("❌");
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
