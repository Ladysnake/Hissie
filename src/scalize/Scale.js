import { Client as DiscordClient } from "discord.js"
import { assertMethodImplemented, assertInstanceOf } from "@scalize/tools"
import { MessageToolbox } from "@scalize/MessageToolbox"

/**
 * A class that represents a base Scale
 */
class Scale{
    /**
     * @param {object} scaleData - The scale's data
     */
    constructor(scaleData){
        assertMethodImplemented(scaleData.install, "The module must come with an 'install' method");

        this.scale = scaleData;
    }

    /**
     * Instantiate a Scale from its data
     * @param {object} scaleData - The scale's data
     */
    static from(scaleData){
        return new this(scaleData);
    }

    /**
     * Install this scale for the given bot
     * @param {DiscordClient} bot - The bot for which we install this scale
     * @param {MessageToolbox} messageToolbox - The bot's message toolbox
     */
    installFor(bot, messageToolbox){
        assertInstanceOf(bot, DiscordClient, "The 'bot' used to install a 'Scale' must be a 'Discord.Client'");
        assertInstanceOf(messageToolbox, MessageToolbox, "The 'messageToolbox' used to install a 'Scale' must be a 'MessageToolbox'");
        this.scale.install(bot, messageToolbox);
    }
}

export { Scale }

/*
eg.

import { Client } form "discord.js"

const bot = new Client();
bot.login("PINGAS");

Scale.from({
    install(hissie){
        hissie.on("error", console.error);
    }
}).installFor(bot);
*/