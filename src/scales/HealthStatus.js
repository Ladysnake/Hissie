const Scale = require("./Scale");
const express = require("express");
const http = require("http");

module.exports = class HealthStatus extends Scale{
	onReady(hissie){
		console.log(`Logged in as ${hissie.user.username}#${hissie.user.discriminator}`);

		this.server = express();
		this.server.get("/", (_, res) => res.sendStatus(200));

		this.port = process.env.PORT || 8080;
		const rawServer = this.server.listen(port);
		process.on("beforeExit", rawServer.close());
		

		const addr = `${process.env.ADDRESS || 'http://localhost'}:${this.port}`;
		console.log(`Address: ${addr}`);

		
		this.interval = setInterval(() => {
			http.get(addr);
		}, 200000);
	}
};