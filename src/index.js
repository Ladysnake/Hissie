require("dotenv").load();

const App = require("./App");
const { scales, simpleScales } = require("./scales");

App.from(process.env.HissieToken)
	.addScales(scales)
	.addSimpleScales(simpleScales)
	.run();