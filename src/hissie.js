const Discord = require('discord.js');
const fs = require('fs');
const readline = require('readline');

const hissie = new Discord.Client();
var mode = 'normal';

//////////////////
// BOT STARTUP //
////////////////
// Command line arguments
process.argv.forEach((val, index, array) => {
    // Bot to start
    if (val == 'bot=hissie' || val == 'bot=sibila') {
        hissie.login(JSON.parse(fs.readFileSync('data/config.json'))[val.replace('bot=', '')]['token']);
    }

    // Bot mode
    if (val == 'mode=normal' || val == 'mode=control') {
        mode = val.replace('mode=', '')
    }
});

// When fully logged in and launched
hissie.on('ready', () => {
    console.log(`Logged in as ${hissie.user.tag}, ${mode} mode.`);
});


//////////////////
// NORMAL MODE //
////////////////
if (mode == 'normal') {

    // Message received
    hissie.on('message', msg => {
        if (msg.content === 'ping') {
            msg.reply('Pong!');
        }
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

}


///////////////////////
// BOT CONTROL MODE //
/////////////////////
if (mode == 'control') {
    
    // Initialize control mode
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var guild;
    var channel;

    // Command line input
    rl.on('line', (input) => {
        // List guilds the bot is on
        if (input.match(/\?guilds/gm)) {
            hissie.guilds.forEach(guild => {
                console.log(guild.name);
            });
        
        // List channels the guild the bot is on has
        } else if (input.match(/\?channels/gm)) {
            guild.channels.forEach(channel => {
                console.log('#'+channel.name);
            });
        
        // Switch guild
        } else if (input.match(/guild=.*/gm)) {
            tmp = hissie.guilds.find('name', input.replace('guild=', ''))
            if (tmp != null) {
                guild = tmp;
                console.log(`Switched to guild ${guild.name}`);
            } else console.log('Invalid guild, could not switch');
        
        // Switch channel
        } else if (input.match(/channel=.*/gm)) {
            tmp = guild.channels.find('name', input.replace('channel=', ''))
            if (tmp != null) {
                channel = tmp;
                console.log(`Switched to channel #${channel.name}`);
            } else console.log('Invalid channel, could not switch');

        // Send message to selected guild and channel
        } else if (input != '') {
            if (typeof guild !== 'undefined' && typeof channel !== 'undefined') channel.send(input);
            else console.log('Guild or channel undefined, could not send message')
        }

        if (typeof guild !== 'undefined' && typeof channel !== 'undefined')
            process.stdout.write(`(${hissie.user.username}) [${guild.name}][#${channel.name}] < `);
    });

}