require("dotenv").load();

const Hissie = require("./Hissie");
const { scales, simpleScales } = require("./scales");

/*
	TODO: fix numberToDieImg
	TODO: fix RichAnwsers#googleSearch
	TODO: fix RichAnwsers#playAudio
	TODO: fix RichAnwsers#stopAudio
*/

(async () => {
	try{
		await Hissie.from(process.env.HissieToken)
		.addScales(scales)
		.addSimpleScales(simpleScales)
		.run();
	}catch(e){
		console.error(e);
	}
})();