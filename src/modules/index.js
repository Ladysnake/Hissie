import { BotModule } from "@modular/BotModule"

/*
/!\
Only works thx to webpack/ webpack
*/
const allModules = require.context(".", true, /index\.js$/);

const loadAllModules = hissie => {
    allModules.keys()
    .map(key => allModules(key))
    .filter(esm => esm.default)
    .forEach(esm => {
        BotModule.from(esm.default)
        .installFor(hissie);
    });
};

export { loadAllModules }