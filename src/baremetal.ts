import {open, define, DataType} from "ffi-rs";

open({
    library: "markov",
    path: "./markov.so",
});


const markov = define({
    markov_new: {
        library: "markov",
        retType: DataType.External,
        paramsType: []
    },
    markov_free: {
        library: "markov",
        retType: DataType.Void,
        paramsType: [DataType.External]
    },
    markov_train: {
        library: "markov",
        retType: DataType.Void,
        paramsType: [DataType.External, DataType.String]
    },
    markov_getfirst: {
        library: "markov",
        retType: DataType.String,
        paramsType: [DataType.External]
    },
    markov_generate: {
        library: "markov",
        retType: DataType.String,
        paramsType: [DataType.External, DataType.String, DataType.U64]
    },
    markov_libc_free: {
        library: "markov",
        retType: DataType.Void,
        paramsType: [DataType.External]
    },
    markov_writefile: {
        library: "markov",
        retType: DataType.Void,
        paramsType: [DataType.External, DataType.String]
    },
    markov_fromfile: {
        library: "markov",
        retType: DataType.External,
        paramsType: [DataType.String]
    }
});
export default markov;