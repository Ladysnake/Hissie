// Libs
import Discord from "discord.js"
import express from "express"
import lodash from "lodash"
import google from "google"

// Utils
import grabJson from "@js/utils/grabJson"
import Config from "@js/utils/Config"

// Creating the bot and config, then logging in
const hissie = new Discord.Client();
const config = new Config(grabJson('data/config.json'));
const userStates = new Map();
hissie.login(config.token);

// When ready, setting up the rest needed
hissie.on('ready', () => {
    console.log(`Logged in as ${hissie.user.username}#${hissie.user.discriminator}`);

    // Setting as playing a random game
    const game = config.games[Math.floor(Math.random()*config.games.length)];
    hissie.user.setActivity(game);

    // Server
    const server = express();

    // Default route
    server.get("/", (request, response) => {
        response.sendStatus(200);
    });

    server.listen(process.env.PORT);
    setInterval(() => {
        http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
    }, 200000);
});

// On user joining the Ladysnake guild
hissie.on('guildMemberAdd', member => {
    if (hissie.user.presence.status != 'dnd' && member.guild.id == config.ladysnakeGuildId) {
        const messages = ['Welcome' , 'Greetings', 'Salutations']; // yes this is hardcoded I know
        member.guild.channels.find('id', config.ladysnakeGeneralId).send(messages[Math.floor(Math.random()*messages.length)]+' '+member.displayName+'! If you need anything, please ask.');
        member.guild.channels.find('id', config.ladysnakeConsoleId).send({
            "embed": {
                "title": "Member server join",
                "description": `${member.displayName} joined the server.`,
                "author": {
                    "name": member.displayName,
                    "icon_url": member.user.displayAvatarURL
                },
                "color": member.displayColor != 0 ? member.displayColor : 0x4F545C
            }
        });
    }
});

// On user leaving the Ladysnake guild
hissie.on('guildMemberRemove', member => {
    if (hissie.user.presence.status != 'dnd' && member.guild.id == config.ladysnakeGuildId)
        member.guild.channels.find('id', config.ladysnakeConsoleId).send({
            "embed": {
                "title": "Member server leave",
                "description": `${member.displayName} left the server.`,
                "author": {
                    "name": member.displayName,
                    "icon_url": member.user.displayAvatarURL
                },
                "color": member.displayColor != 0 ? member.displayColor : 0x4F545C
            }
        });
});
  
// On Ladysnake discord member change (role, nickname, etc...)
hissie.on('guildMemberUpdate', (oldMember, newMember) => {
    if (hissie.user.presence.status != 'dnd' && newMember.guild.id == config.ladysnakeGuildId) {
        // Nickname change?
        if (oldMember.displayName !== newMember.displayName)
            newMember.guild.channels.find('id', config.ladysnakeConsoleId).send({
                "embed": {
                    "title": "Member nickname change",
                    "description": 'Before: ``'+oldMember.displayName+'``\nAfter: ``'+newMember.displayName+'``',
                    "author": {
                        "name": newMember.displayName,
                        "icon_url": newMember.user.displayAvatarURL
                    },
                    "color": newMember.displayColor != 0 ? newMember.displayColor : 0x4F545C
                }
            });
    
        // Role changes?
        const removedRoles = lodash.difference(oldMember.roles.array(), newMember.roles.array());
        const addedRoles = lodash.difference(newMember.roles.array(), oldMember.roles.array());
        let title = '';
        let desc = '';
        if (addedRoles.length != 0) {
            title = 'Member role addition';
            desc = 'Added role: ``'+addedRoles[0].name+'``';
        } else if (removedRoles.length != 0) {
            title = 'Member role removal';
            desc = 'Removed role: ``'+removedRoles[0].name+'``';
        }
        if (title !== '' && desc !== '')
            newMember.guild.channels.find('id', config.ladysnakeConsoleId).send({
                "embed": {
                    "title": title,
                    "description": desc,
                    "author": {
                        "name": newMember.displayName,
                        "icon_url": newMember.user.displayAvatarURL
                    },
                    "color": newMember.displayColor != 0 ? newMember.displayColor : 0x4F545C
                }
            });
    }
});

// On message receive
hissie.on('message', message => {
    // If not DM, and Hissie is not in DnD or the sender
    if (message.channel.type != 'dm' && hissie.user.presence.status != 'dnd' && message.author !== hissie.user) {
        let called = answered = false;
        let action = "";
        
        // If tagged or role she has is tagged, detects she's called
        called = (message.mentions.members.exists('user', hissie.user) || message.mentions.roles.some(role => message.guild.members.find('id', hissie.user.id).roles.array().includes(role)))

        // If called, setting user called state
        if (called) userStates.set(message.author, 'called');

        grabJson('data/answers.json').some(answer => {
            console.log(message.content)
            console.log(answer.regex)
            if (new RegExp(answer.regex, 'i').test(message.content)) {
                // If keyword correspondance and states are correct (including no state)
                if (answer.states.includes(userStates.get(message.author)) || answer.states.length == 0) {
                    // If answers exists, sending a random one
                    if (answer.answers.length != 0) {
                        message.channel.send(answer.answers[Math.floor(Math.random()*answer.answers.length)]);
                        answered = true;
                    }
                    // If action, executing it
                    if (answer.action != '') {
                        action = answer.action;
                        answered = true;
                    }
                    // If resulting state, applying it
                    if (answer.result != '')
                        userStates.set(message.author, answer.result);
                    else if (answered) userStates.delete(message.author);
                }
            }
            return answered;
        });

        // Actions
        switch (action) {
            // Google search
            case "googleSearch":
                const messageWords = message.content.split(/(\b|\s)+/g).map(word => word.toLowerCase());
                let inside;
                let search = '';
            
                // Takes the keywords to search
                messageWords.forEach(e => {
                    if (e == '?') inside = false;
                    if (inside) search += e;
                    if (e == 'is' || e == 'are') inside = true;
                });
            
                // Makes the search and returns the first valid result of the three links on top
                if (search != '') {
                    google(search.trim(), (err, response) => {
                        if (err) console.error(err);
                        if (response.links[0] != null && response.links[1] != null && response.links[2] != null) {
                            if (response.links[0].link != null) message.channel.send(response.links[0].link);
                            else if (response.links[1].link != null) message.channel.send(response.links[1].link);
                            else if (response.links[2].link != null) message.channel.send(response.links[2].link);
                        }
                    });
                } else {
                    message.channel.send()
                }
        }

        // If called on the channel but didn't answer, acknowledge
        if (called && !answered) {
            const answers = ['Yes ?', 'Hmmm ?', 'What is it ?', 'What can I help you with ?', 'I\'m here !'];  // yes this is hardcoded too
            message.channel.send(answers[Math.floor(Math.random()*answers.length)]);
            userStates.set(message.author, 'called');
        }
    }
});