const Scale = require("./Scale");
const express = require("express");
const http = require("http");

module.exports = class HealthStatus extends Scale{
	onReady(hissie){
		console.log(`Logged in as ${hissie.user.username}#${hissie.user.discriminator}`);

		this.server = express();
		this.server.get("/", (_, res) => res.sendStatus(200));

		this.port = process.env.PORT || 8080;
		const rawServer = this.server.listen(this.port);


		const addr = `${process.env.ADDRESS || 'http://localhost'}:${this.port}`;
		console.log(`Address: ${addr}`);


		this.interval = setInterval(() => {
			http.get(addr);
		}, 200000);


		process.on("beforeExit", () => {
			clearInterval(this.interval);
			rawServer.close();
		});
	}
};