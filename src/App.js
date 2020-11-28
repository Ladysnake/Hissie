const { Client } = require("discord.js");
const Scale = require("./scales/Scale");

module.exports = class App{
	/**
	 * Create a new app from the given discord API token
	 * @param {string} token - The discord API token
	 * @returns {App}
	 */
	static from(token){
		return new this(token);
	}

	/**
	 * @param {string} token - The discord API token
	 */
	constructor(token){
		/**
		 * @type {Config}
		 */
		this.config = new Config(grabJson("../data/config.json"));

		/**
		 * @type {Client}
		 */
		this.client = new Client();

		/**
		 * @type {Scale[]}
		 */
		this.scales = [];

		this.__ = {
			self: this,
			shouldProcessMember(hissie, member){
				return hissie.user.presence.status !== "dnd"
					&& member.guild.id === this.self.config.ladysnakeGuildId;
			},
			shouldProcessMessage(hissie, message){
				const { channel, author } = message;
				const { user } = hissie;
				return channel.type !== "dm"
					&& user.presence.status !== "dnd"
					&& author.id !== user
			},
		};
	}

	/**
	 * Add the given scale to the list of scales
	 * @param {Scale} scale 
	 * @returns {App}
	 */
	addScale(scale){
		this.scales.push(scale);
		return this;
	}

	/**
	 * Add several scales to the list of scales
	 * @param {Scale[]} scales 
	 * @returns {App}
	 */
	addScales(scales){
		this.scales.push(...scales);
		return this;
	}

	/**
	 * Add several simple scales to the list of scales
	 * @param {Function} scaleClasses - The list of scale classes to instantiate and add
	 */
	addSimpleScales(scaleClasses){
		return this.addScales(scaleClasses.map(scaleClass => new scaleClass()));
	}

	async run(){
		const { client, scales } = this;
		await client.login(token);

		client.on("ready", async () => {
			for(const scale of scales)
				await scale.onReady(client);
		});

		client.on("guildMemberAdd", async member => {
			if(!this.__.shouldProcessMember(client, member))
				return;

			for(const scale of scales)
				await scale.onJoin(client, member);
		});

		client.on("guildMemberRemove", async member => {
			if(!this.__.shouldProcessMember(client, member))
				return;

			for(const scale of scales)
				await scale.onLeave(client, member);
		});

		client.on("guildMemberUpdate", async (oldMember, newMember) => {
			if(!this.__.shouldProcessMember(client, newMember))
				return;

			for(const scale of scales)
				await scale.onMemberUpdate(client, oldMember, newMember);
		});

		client.on("message", async message => {
			if(!this.__.shouldProcessMessage(client, message))
				return;

			for(const scale of scales){
				await scale.onMessage(client, message);
			}
		});
	}
}