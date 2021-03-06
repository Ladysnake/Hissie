const { Client } = require("discord.js");
const Scale = require("./scales/Scale");
const Config = require("./utils/Config");
const { grabJson } = require("./utils");

module.exports = class Hissie{
	/**
	 * Create a new app from the given discord API token
	 * @param {string} token - The discord API token
	 * @returns {Hissie}
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
		this.config = new Config(grabJson("data/config.json"));

		/**
		 * @type {Client}
		 */
		this.client = new Client();

		/**
		 * @type {Scale[]}
		 */
		this.scales = [];

		/**
		 * @type {string}
		 */
		this.token = token;

		this.__ = {
			self: this,
			/**
			 * @param {import("discord.js").Client} hissie
			 * @param {import("discord.js").GuildMember} member
			 * @returns {boolean}
			 */
			shouldProcessMember(hissie, member){
				return hissie.user.presence.status !== "dnd"
					&& member.guild.id === this.self.config.ladysnakeGuildId;
			},
			/**
			 * @param {import("discord.js").Client} hissie
			 * @param {import("discord.js").Message} message
			 * @returns {boolean}
			 */
			shouldProcessMessage(hissie, message){
				const { channel, author } = message;
				const { user } = hissie;
				return channel.type !== "dm"
					&& user.presence.status !== "dnd"
					&& author.id !== user
			},
		};

		process.on("beforeExit", this.onExit.bind(this));
	}

	/**
	 * @param {number} code
	 */
	onExit(code){
		this.client.destroy();
	}

	/**
	 * Add the given scale to the list of scales
	 * @param {Scale} scale
	 * @returns {Hissie}
	 */
	addScale(scale){
		this.scales.push(scale);
		return this;
	}

	/**
	 * Add several scales to the list of scales
	 * @param {Scale[]} scales
	 * @returns {Hissie}
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
		const { client, scales, token } = this;
		// client.channels.find(c => c.name === "hissie-frenzy");

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


		await client.login(token);
	}
}