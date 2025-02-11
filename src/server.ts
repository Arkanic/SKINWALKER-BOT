import fs from "fs";
import path from "path";
import {Client, Events, GatewayIntentBits, GuildMember} from "discord.js";
import ReplikaManager from "./replikaManager";

import {token, modelpath} from "../config";

if(!fs.existsSync(modelpath)) fs.mkdirSync(modelpath, {recursive: true});

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
        replikas.addUsernameTranslation(message.author.username, message.author.id);
        return replikas.train(message.author.id, message.content);
    }

    let parts = message.content.split(" ");
    parts.shift();
    if(parts.length < 1) return;
    let content = parts.join(" ");
    
    let id:string = "";
    if(content.startsWith("<@") && content.endsWith(">")) { // traditional @whatever
        let portion = content.slice(2, content.length - 1);
        if(!/[^0-9]/.test(portion)) id = portion;
    } else if(!/[^0-9]/.test(content)) { // id sent as text
        id = content;
    } else { // username sent as text
        let result = replikas.translateUsername(content);
        id = result ? result : "";
    }

    replikas.generate(id, 500).then((generated) => {
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
