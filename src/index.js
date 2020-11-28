require("dotenv").load();

const Hissie = require("./Hissie");
const { scales, simpleScales } = require("./scales");

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