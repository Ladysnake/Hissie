import { Client as DiscordClient } from "discord.js"
import { loadAllScales } from "@scales"

const bot = new DiscordClient();
console.log("> Before load");
loadAllScales(bot);
console.log("> After load");