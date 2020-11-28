const { promisify } = require("util");
const google = promisify(require("google"));
const requestPromise = require("request-promise-native");
const { RichEmbed } = require("discord.js");
const Scale = require("./Scale");

const {
	grabJson,
	playAudio,
	randomNumber,
	numberToDieImg,
} = require("../utils");

const InteractionState = {
	CALLED: "called",
};

const now = () => new Date();

module.exports = class RichAnswers extends Scale{
	constructor(){
		super();
		
		this.userState = new Map();
		this.answers = grabJson("data/answers.json");
		this.genericAnswers = [
			"Yes ?",
			"Hmmm ?",
			"What is it ?",
			"What can I help you with ?",
			"I'm here !",
		];

		this.__ = {
			self: this,
			computeAction(message){
				const { self } = this;

				let action = "";
				const answered = self.answers.some(answer => {
					//TODO: make this less messy
					let answered = false;
		
					if (new RegExp(answer.regex, "i").test(message.content)) {
						// If keyword correspondance and states are correct (including no state)
						let userState = "";
						if (userStates.get(message.author)) {
							const lastState = self.userState.get(message.author);

							if (now() - lastState.time > 3600000) { //TODO: no magic numbers
								self.userState.delete(message.author);
								return false;
							}else{
								userState = lastState.state;
							}
						}
						if (answer.states.includes(userState) || answer.states.length == 0) {
							// If answers exists, sending a random one
							if (answer.answers.length != 0) {
								const index = Math.floor(Math.random() * answer.answers.length);
								const answer = answer.answers[index];
								message.channel.send(answer);
								answered = true;
							}
							// If action, executing it
							if (answer.action != "") {
								action = answer.action;
								answered = true;
							}

							// If resulting state, applying it
							if (answer.result != ""){
								userStates.set(message.author, {
									state: answer.result,
									time: now(),
								});
							}else if (answered){
								userStates.delete(message.author);
							}
						}
					}
					
					return answered;
				});

				return {
					action,
					answered,
				};
			},
		};
	}

	/**
	 * @inheritdoc
	 */
	async onMessage(hissie, message){
		const hissieRoles = message.guild
			.members.get(hissie.user.id)
			.roles.array();

		const wasCalled = message.mentions.users.some(user => user.id === hissie.user.id)
			|| message.mentions.roles.some(role => hissieRoles.includes(role));

		if(wasCalled){
			this.userState.set(message.author, {
				state: InteractionState.CALLED,
				time: now(),
			});
		}

		const { action, answered } = this.__.computeAction(message);

		if(!this[action])
			return;

		//TODO: Only do this if not already answered ?
		const hasAnswered = (await this[action](message, answered)) || answered;

		if (called && !hasAnswered) {
			const index = Math.floor(Math.random() * this.genericAnswers.length);
			const answer = this.genericAnswers[index];
			await message.channel.send(answer);
			userStates.set(message.author, {
				state: "called",
				time: now(),
			});
		}
	}

	/*******************************************************************************************\
	 * Actions
	\*******************************************************************************************/
	/**
	 * Google search action
	 * @param {import("discord.js").Message} message 
	 * @param {boolean} answered 
	 */
	async googleSearch(message, answered){
		const messageWords = message.content.split(/(\b|\s)+/g).map(word => word.toLowerCase());
		let inside = false;
		let search = "";
	
		// Takes the keywords to search
		messageWords.forEach(e => {
			if (e === "?")
				inside = false;

			if (inside)
				search += e;

			if (["is", "are"].includes(e))
				inside = true;
		});
	
		// Makes the search and returns the first valid result of the three links on top
		if (search !== "") {
			const response = await google(search.trim());

			// Test every link, see if it exists and if it"s sfw
			try {
				const safeReg = /(porn|hentai|xvideos|xhamster|doujin)/igm;
				const exceptionReg = /(earth|food)/igm; //TODO: use this???

				for (let i = 0; i < 10; i++) {
					const currentLink = response.links[i];
					const shouldSendLink = !!currentLink
						&& !!currentLink.link
						&& !safeReg.test(currentLink.link.link)
						&& !safeReg.test(currentLink.title)
						&& !safeReg.test(currentLink.description);

					if (shouldSendLink) {
						await message.channel.send(response.links[i].link);
					}
				}
			} catch (e) {
				await message.channel.send("Sorry, I couldn't find anything relevant, maybe try rewording?");
			}
		}
	}

	/**
	 * Hissiemote action
	 * @param {import("discord.js").Message} message 
	 * @param {boolean} answered 
	 */
	async hissiemote(message, answered){
		// Request hissiemote list from the Ladysnake server
		const json = await requestPromise("https://ladysnake.github.io/hissiemotes.json");
		const hissiemoteList = JSON.parse(json);
		const emote = message.content.replace(/:!/gi, "");
		const emb = new RichEmbed();
		const displayName = message.member.displayName;
		emb.setAuthor(displayName, message.author.avatarURL);

		if (!!message.member.displayColor)
			emb.setColor(message.member.displayColor);

		const emoji = message.guild.emojis.find("name", emote.trim());
		const emoticon = hissiemoteList[emote];

		if (!!emoji) {
			emb.setImage(emoji.url);
			await message.channel.send(emb);
			message.delete();
		} else if (!!emoticon) {
			emb.setImage(emoticon);
			await message.channel.send(emb);
			message.delete();
		} else
			await message.channel.send("No emote of that name.");
	}

	/**
	 * Play audio action
	 * @param {import("discord.js").Message} message 
	 * @param {boolean} answered 
	 */
	async playAudio(message, answered){
		if (message.member.voiceChannel) {
			let url = message.content.replace(/.*play /gmi, "");
		
			// If youtube link
			if (message.content.match(/https:\/\/(www\.)?youtube\.com\/watch\?v/gmi)) {
				url = message.content.replace(/.*play /gmi, "");
				playAudio(message, url);
			} else {
				url = url.trim();
				const response = await google(`${url} youtube`);

				// Test every link, see if it exists and if it's sfw
				try {
					for (let i = 0; i < 10; i++) {
						const currentLink = response.links[i];

						if (currentLink.link != null) {
							url = currentLink.link;
							await message.channel.send(`Playing ${url} right now!`);
							await playAudio(message, url);
							break;
						}
					}
				} catch (exception) {
					await message.channel.send('Sorry, I couldn\'t find anything relevant, maybe try rewording?');
					return;
				}
			}
		} else
			await message.channel.send('You need to be in a voice channel first if you want me to play anything for you.');
	}

	/**
	 * Stop audio action
	 * @param {import("discord.js").Message} message 
	 * @param {boolean} answered 
	 */
	async stopAudio(message, answered){
		if (message.member.voiceChannel) {
			await message.member.voiceChannel.leave();
		} else
			await message.channel.send("Can't stop playing if I'm not 🤷‍");
	}

	/**
	 * Get user profile picture action
	 * @param {import("discord.js").Message} message 
	 * @param {boolean} answered 
	 */
	async getUserAvatar(message, answered){
		for(const user of message.mentions.users){
			if(user.id === this.config.hissieId)
				continue;

			const member = message.channel.guild.member(user);
			const emb = new RichEmbed();
			emb.setAuthor(member.displayName, user.avatarURL);

			if(!!member.displayColor)
				emb.setColor(member.displayColor);

			emb.setImage(user.avatarURL);
			await message.channel.send(emb);
		}
	}

	/**
	 * Rolling die action
	 * @param {import("discord.js").Message} message 
	 * @param {boolean} answered 
	 */
	async rollDie(message, answered){
		await message.channel.send({
			embed: {
				image: {
					url: numberToDieImg(randomNumber(1, 6))
				},
			}
		});
	}
}