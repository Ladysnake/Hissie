const App = require("./App");
const { scales, simpleScales } = require("./scales");

// Creating the bot and config, then logging in
require('dotenv').load();

App.from(process.env.HissieToken)
	.addScales(scales)
	.addSimpleScales(simpleScales)
	.run();