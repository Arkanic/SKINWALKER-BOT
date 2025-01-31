import Replika from "./replika"

interface ReplikaBox {
    replika: Replika;
    cleartimeout: NodeJS.Timeout;
}

export default class ReplikaManager {
    replikas:{[unit:string]:ReplikaBox};
    maxidle:number;

    constructor(maxidle:number) {
        this.replikas = {};
        this.maxidle = maxidle;
    }

    private add(id:string) {
        if(this.replikas[id]) {
            clearTimeout(this.replikas[id].cleartimeout);
            this.replikas[id].cleartimeout = setTimeout(() => {
                this.remove(id);
            }, this.maxidle);
        }

        let replika:ReplikaBox = {
            replika: new Replika(id),
            cleartimeout: setTimeout(() => {
                this.remove(id);
            }, this.maxidle)
        }

        this.replikas[id] = replika;
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
        this.add(id);
        return this.replikas[id].replika.generate(maxwordcount, startword);
    }

    closeall() {
        for(let i in this.replikas) {
            this.remove(i);
        }
    }
}