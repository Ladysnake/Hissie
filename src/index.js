require("dotenv").load();

const App = require("./App");
const { scales, simpleScales } = require("./scales");

(async () => {
	try{
		await App.from(process.env.HissieToken)
		.addScales(scales)
		.addSimpleScales(simpleScales)
		.run();
	}catch(e){
		console.error(e);
	}
})();