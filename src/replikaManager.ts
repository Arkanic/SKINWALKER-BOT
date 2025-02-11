import fs from "fs";
import path from "path";
import Replika, {doesColdchainExist} from "./replika"

interface ReplikaBox {
    replika: Replika;
    cleartimeout: NodeJS.Timeout;
}

export default class ReplikaManager {
    replikas:{[unit:string]:ReplikaBox};
    usernames:{[unit:string]:string};
    maxidle:number;
    folder:string;

    private usernamesLastSaved = 0;

    constructor(folder:string, maxidle:number) {
        this.replikas = {};
        this.usernames = {};
        this.maxidle = maxidle;
        this.folder = folder;

        this.readUsernameTranslation();
    }

    private exists(id:string) {
        if(this.replikas[id]) return true;
        else return doesColdchainExist(this.folder, id);
    }

    private add(id:string) {
        if(this.replikas[id]) {
            clearTimeout(this.replikas[id].cleartimeout);
            this.replikas[id].cleartimeout = setTimeout(() => {
                this.remove(id);
            }, this.maxidle);
        } else {
            let replika:ReplikaBox = {
                replika: new Replika(this.folder, id),
                cleartimeout: setTimeout(() => {
                    this.remove(id);
                }, this.maxidle)
            }
            this.replikas[id] = replika;
        }
    }

    private remove(id:string) {
        let replika = this.replikas[id];
        clearInterval(replika.cleartimeout);
        replika.replika.close();

        delete this.replikas[id];
    }

    train(id:string, content:string) {
        this.add(id);
        this.replikas[id].replika.train(content);
    }

    generate(id:string, maxwordcount:number, startword?:string):Promise<string> {
        if(!this.exists(id)) return new Promise((resolve, reject) => reject());
        this.add(id);
        return this.replikas[id].replika.generate(maxwordcount, startword);
    }

    private readUsernameTranslation() {
        const usernamesPath = path.join(this.folder, "usernames.json");
        if(!fs.existsSync(usernamesPath)) return;

        let raw = fs.readFileSync(usernamesPath).toString();
        this.usernames = JSON.parse(raw);
    }

    private saveUsernameTranslation() {
        let serialized = JSON.stringify(this.usernames);
        fs.writeFileSync(path.join(this.folder, "usernames.json"), serialized);
    }

    // add to map of username -> id's. This is saved as json, and has the potential to have "dead references" if a user changes
    // their username. This will be overwritten if a new entry comes along with the same name.
    addUsernameTranslation(username:string, id:string) {
        let lc = username.toLowerCase();
        let newUsername = !!this.usernames[lc];
        this.usernames[lc] = id;
        if(newUsername) this.saveUsernameTranslation();
    }

    translateUsername(username:string):string | undefined {
        let lc = username.toLowerCase();
        if(!this.usernames[lc]) return undefined;
        return this.usernames[lc];
    }

    closeall() {
        for(let i in this.replikas) {
            this.remove(i);
        }
        this.saveUsernameTranslation();
    }
}
