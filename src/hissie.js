// Libs
const Discord = require('discord.js');
const express = require('express');
const lodash = require('lodash');

// Utils
const grabJson = require('./utils/grabJson');
const Config = require('./utils/Config');

// Creating the bot and config, then logging in
const hissie = new Discord.Client();
const config = new Config(grabJson('data/config.json'));
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
        const messages = ['Welcome' , 'Greetings', 'Salutations']; // yes this is hardcoded too I know
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

        // If ladysnake registered user, autoclaiming rewards
        if (grabJson('data/ladyrewards/registeredUsers.json')[member.id]) {
            ladyrewardsAutoclaim(member.guild.id, member.id);
            member.user.send(`I see you are a LadyRewards registered user and joined a Lasynake partner Discord server, therefore, I claimed the rewards concerning the ${member.guild.name} server automatically. Enjoy!`);
        }
    }
});

// On user leaving the Ladysnake guild
hissie.on('guildMemberRemove', member => {
    if (grabJson('data/ladyrewards/partners.json')[member.guild.id] && grabJson('data/ladyrewards/registeredUsers.json')[member.id])
        ladyrewardsUnclaim(member.guild.id, member.id)

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
        var title = '';
        var desc = '';
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