import { Client as DiscordClient } from "discord.js"
import { loadAllModules } from "@modules"

const bot = new DiscordClient();
console.log("> Before load");
loadAllModules(bot);
console.log("> After load");