import koffi from "koffi";
import fs from "fs";

const markov = koffi.load("./markov.so");

export const markov_chain = koffi.struct("markov_chain", {
    words: "void *"
});

export const markov_new = markov.func("markov_chain *markov_new(void)");
export const markov_free = markov.func("void markov_free(markov_chain *chain)");
export const markov_train = markov.func("void markov_train(markov_chain *chain, char *text)");
export const markov_generate = markov.func("char *markov_generate(markov_chain *chain, char *first, unsigned long maxparticlelen)");
export const markov_writefile = markov.func("void markov_writefile(markov_chain *chain, char *outpath)");
export const markov_fromfile = markov.func("markov_chain *markov_fromfile(char *inpath)");
