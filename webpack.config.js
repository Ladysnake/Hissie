/****************************************************************\
 * Imports
\****************************************************************/
const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");



/****************************************************************\
 * Base definitions
\****************************************************************/
const dev = (process.env["NODE_ENV"] === "dev");
const thisPath = __dirname;
const libsRegex = /(node_modules|bower_components)/g;
const resolvePath = (...args) => path.resolve(thisPath, ...args);
const config = {
    resolve: {
        alias: {},
        extensions: []
    },
    entry: {},
    output: {},
    plugins: [],
    module: {
        rules: [],
        //noParse: _ => libsRegex.test(_),
    },
    mode: dev ? "development" : "production",
};



/****************************************************************\
 * Target
\****************************************************************/
config.target = "node";



/****************************************************************\
 * Aliases
\****************************************************************/
config.resolve.alias["@js"] = resolvePath("./src/");
config.resolve.alias["@dist"] = resolvePath("./dist/");
config.resolve.alias["@scalize"] = resolvePath("./src/scalize/");
config.resolve.alias["@scales"] = resolvePath("./src/scales/");

config.resolve.extensions.push(".js");
config.resolve.extensions.push(".json");



/****************************************************************\
 * Entries
\****************************************************************/
// config.entry["hissie"] = "@js/hissie.js";
config.entry["modulesTest"] = "@js/modules.exp.js";


/****************************************************************\
 * Output
\****************************************************************/
config.output.path = resolvePath("dist/");
config.output.filename = "[name].js";



/****************************************************************\
 * Loaders
\****************************************************************/
config.module.rules.push({
    test: /\.js$/,
    exclude: libsRegex,
    use: [
        "babel-loader",
    ],
});



/****************************************************************\
 * Plugins
\****************************************************************/
config.plugins.push(new CleanWebpackPlugin([config.output.path], {
    root: resolvePath("."),
    verbose: true,
    dry: false,
    exclude: [".gitkeep"],
}));


/****************************************************************\
 * Export
\****************************************************************/
module.exports = config;