import { Client as DiscordClient } from "discord.js"
import { assertMethodImplemented, assertInstanceOf } from "@modular/tools"

/**
 * A class that represents a base BotModule
 */
class BotModule{
    /**
     * @param {object} moduleData - The module's data
     */
    constructor(moduleData){
        assertMethodImplemented(moduleData.install, "The module must come with an 'install' method");

        this.module = moduleData;
    }

    /**
     * Instantiate a BotModule from its data
     * @param {object} moduleData - The module's data
     */
    static from(moduleData){
        return new BotModule(moduleData);
    }

    /**
     * Install this module for the given bot
     * @param {DiscordClient} bot - The bot for which we install this module
     */
    installFor(bot){
        assertInstanceOf(bot, DiscordClient, "The 'bot' used to install a 'CoreModule' must be a 'Discord.Client'");
        this.module.install(bot);
    }
}

export { BotModule }

/*
eg.

import { Client } form "discord.js"

const bot = new Client();
bot.login("PINGAS");

BotModule.from({
    install(hissie){
        hissie.on("error", console.error);
    }
}).installFor(bot);
*/