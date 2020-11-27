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
		 * @type {Client}
		 */
		this.client = new Client();

		/**
		 * @type {Scale[]}
		 */
		this.scales = [];
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
			for(const scale of scales)
				await scale.onJoin(client, member);
		});

		client.on("guildMemberRemove", async member => {
			for(const scale of scales)
				await scale.onLeave(client, member);
		});

		client.on("guildMemberUpdate", async (oldMember, newMember) => {
			for(const scale of scales)
				await scale.onMemberUpdate(client, oldMember, newMember);
		});

		client.on("message", async message => {
			for(const scale of scales)
				await scale.onMessage(client, message);
		});
	}
}