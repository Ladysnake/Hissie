const Scale = require("./Scale");

module.exports = class UserManagement extends Scale{
	constructor(){
		this.messages = [
			"Welcome",
			"Greetings",
			"Salutations",
		];

		this.defaultColor = 0x4F545C;
	}

	/**
	 * 
	 * @param {import("discord.js").Guild} ladysnake 
	 * @param {import("discord.js").GuildMember} member 
	 * @param {string} title 
	 * @param {string} description 
	 */
	sendEmbed(ladysnake, member, title, description){
		return ladysnake.send({
			embed: {
				title,
				description,
				author: {
					name: member.displayName,
					icon_url: member.user.displayAvatarURL,
				},
				color: member.displayColor || this.defaultColor,
			}
		});
	}

	shouldProcess(hissie, member){
		return hissie.user.presence.status !== "dnd"
		&& member.guild.id === this.config.ladysnakeGuildId;
	}

	/**
	 * @inheritdoc
	 */
	async onJoin(hissie, member){
		const { ladysnakeGeneralId, ladysnakeConsoleId } = this.config;
		if (this.shouldProcess(hissie, member)) {
			const { guild: { channels } } = member;
			const ladysnake = channels.get(ladysnakeConsoleId);

			const index = Math.floor(Math.random() * this.messages.length);
			const message = this.messages[index];

			await channels.get(ladysnakeGeneralId).send(`${message} ${member.displayName}! If you need anything, please ask.`);
			await this.sendEmbed(ladysnake, member, "Member server join", `${member.displayName} joined the server`);
		}
	}

	
	/**
	 * @inheritdoc
	 */
	async onLeave(hissie, member){
		const { ladysnakeConsoleId } = this.config;

		if (this.shouldProcess(hissie, member)){
			const ladysnake = member.guild.channels.get(ladysnakeConsoleId);
			
			await this.sendEmbed(ladysnake, member, "Member server leave", `${member.displayName} left the server.`);
		}
	}

	/**
	 * @inheritdoc
	 */
	async onMemberUpdate(hissie, oldMember, newMember){
		const { ladysnakeConsoleId } = config;

		if (this.shouldProcess(hissie, newMember)) {
			const ladysnake = newMember.guild.channels.get(ladysnakeConsoleId);

			// Nickname change?
			if (oldMember.displayName !== newMember.displayName){
				this.sendEmbed(
					ladysnake,
					newMember,
					"Member nickname change",
					`Before : \`\`${oldMember.displayName}\`\`\nAfter: \`\`${newMember.displayName}\`\``
				);
			}
		
			// Role changes?
			const removedRoles = lodash.difference(oldMember.roles.array(), newMember.roles.array());
			const addedRoles = lodash.difference(newMember.roles.array(), oldMember.roles.array());
			const [title, desc] = (() => {
				if(addedRoles.length > 0)
					return [
						"Member role addition",
						`Added role: \`\`${addedRoles[0].name}\`\``,
					];
				else if(removedRoles.length > 0)
					return [
						"Member role removal",
						`Removed role: \`\`${removedRoles[0].name}\`\``,
					];
				else
					return ["", ""];
			})();

			if (title !== '' && desc !== '')
				this.sendEmbed(ladysnake, newMember, title, desc);
		}
	}
}