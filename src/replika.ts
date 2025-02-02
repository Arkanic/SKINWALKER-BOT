import fs from "fs";
import path from "path";
import {DataType, JsExternal, PointerType, freePointer} from "ffi-rs";
import baremetal from "./baremetal";

if(!fs.existsSync("models")) fs.mkdirSync("models");

type MarkovChain = JsExternal;
function coldchainGetOrCreate(id:string):MarkovChain {
    if(/[^0-9]/.test(id)) throw new Error("ID is non-numeric!");

    let chain;
    const modelPath = path.join("models", `${id}.mkd`);
    if(fs.existsSync(modelPath)) chain = baremetal.markov_fromfile([modelPath]);
    else chain = baremetal.markov_new([]);

    return chain;
}

export default class Replika {
    id:string;
    markov:MarkovChain;

    constructor(id:string) {
        this.id = id;
        this.markov = coldchainGetOrCreate(this.id);
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
        baremetal.markov_writefile([this.markov, path.join("models", `${this.id}.mkd`)]);
    }

    close() {
        this.save();
        baremetal.markov_free([this.markov]);
    }
}