import fs from "fs";
import path from "path";
import {DataType, JsExternal, PointerType, freePointer} from "ffi-rs";
import baremetal from "./baremetal";

//if(!fs.existsSync("models")) fs.mkdirSync("models");

export function doesColdchainExist(folder:string, id:string):boolean {
    if(/[^0-9]/.test(id)) throw new Error("ID is non-numeric!");
    return fs.existsSync(path.join(folder, `${id}.mkd`));
}

type MarkovChain = JsExternal;
function coldchainGetOrCreate(folder:string, id:string):MarkovChain {
    if(/[^0-9]/.test(id)) throw new Error("ID is non-numeric!");

    let chain;
    const modelPath = path.join(folder, `${id}.mkd`);
    if(fs.existsSync(modelPath)) chain = baremetal.markov_fromfile([modelPath]);
    else chain = baremetal.markov_new([]);

    return chain;
}

export default class Replika {
    id:string;
    folder:string;
    markov:MarkovChain;

    constructor(folder:string, id:string) {
        this.id = id;
        this.folder = folder;
        this.markov = coldchainGetOrCreate(this.folder, this.id);
    }

    train(text:string) {
        baremetal.markov_train([this.markov, text]);
    }

    generate(maxwordcount:number, startword?:string):Promise<string> {
        return new Promise((resolve, reject) => {
            let word:string = startword ? startword : baremetal.markov_getfirst([this.markov]);
            let result = baremetal.markov_generate([this.markov, word, maxwordcount]);
            if(result == null) reject();
            else resolve(result);
        });
    }

    save() {
        baremetal.markov_writefile([this.markov, path.join(this.folder, `${this.id}.mkd`)]);
    }

    close() {
        this.save();
        baremetal.markov_free([this.markov]);
    }
}
