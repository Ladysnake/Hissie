import { Scale } from "@scalize/Scale"
import { MessageToolbox } from "@scalize/MessageToolbox"

/*
/!\
Only works thx to webpack/ webpack
*/
const allScales= require.context(".", true, /index\.js$/);

const loadAllScales = hissie => {
    const messageToolbox = MessageToolbox.from(hissie);

    allScales.keys()
    .map(key => allScales(key))
    .filter(esm => esm.default)
    .forEach(esm => {
        Scale.from(esm.default)
        .installFor(hissie, messageToolbox);
    });
};

export { loadAllScales }