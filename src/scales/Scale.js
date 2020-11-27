/**
 * @template T
 * @typedef {Promise<T>|T} PromiseOr<T>
 */

module.exports = class Scale{
	static create(...args){
		return new this(...args);
	}

	/**
	 * Hook for the ready event
	 * @param {import("discord.js").Client} hissie
	 * @returns {PromiseOr<any>}
	 */
	onReady(hissie){}
	
	/**
	 * Hook for the guildMemberAdd event
	 * @param {import("discord.js").Client} hissie 
	 * @param {import("discord.js").GuildMember} member 
	 * @returns {PromiseOr<any>}
	 */
	onJoin(hissie, member){}

	/**
	 * Hook for the guildMemberRemove event
	 * @param {import("discord.js").Client} hissie 
	 * @param {import("discord.js").GuildMember} member 
	 * @returns {PromiseOr<any>}
	 */
	onLeave(hissie, member){}

	/**
	 * Hook for the guildMemberUpdate event
	 * @param {import("discord.js").Client} hissie 
	 * @param {import("discord.js").GuildMember} oldMember 
	 * @param {import("discord.js").GuildMember} newMember 
	 * @returns {PromiseOr<any>}
	 */
	onMemberUpdate(hissie, oldMember, newMember){}

	/**
	 * Hook for the message event
	 * @param {import("discord.js").Client} hissie 
	 * @param {import("discord.js").Message} message 
	 * @returns {PromiseOr<any>}
	 */
	onMessage(hissie, message){}
}