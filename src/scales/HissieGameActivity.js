const Scale = require("./Scale");

module.exports = class HissieGameActivity extends Scale{
	onReady(hissie){
		const { games } = this.config;
		const index = Math.floor(Math.random() * games.length);
		const game = games[index];
		hissie.user.setActivity(game);
	}
}