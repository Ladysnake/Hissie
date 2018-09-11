// Libs
const Discord = require('discord.js');
const express = require('express');
const lodash = require('lodash');
const google = require('google');
const http = require('http');
const fs = require('fs');
const Imgur = require('imgur');
const Jimp = require("jimp");

// Utils
const grabJson = require('./utils/grabJson');
const Config = require('./utils/Config');

// Creating the bot and config, then logging in
require('dotenv').load();
const hissie = new Discord.Client();
const config = new Config(grabJson('data/config.json'));
const userStates = new Map();
hissie.login(process.env.HissieToken);

// When ready, setting up the rest needed
hissie.on('ready', () => {
    console.log(`Logged in as ${hissie.user.username}#${hissie.user.discriminator}`);

    // Setting as playing a random game
    const game = config.games[Math.floor(Math.random()*config.games.length)];
    hissie.user.setActivity(game);

    // Server
    const server = express();

    // Default route
    server.get('/', (request, response) => {
        response.sendStatus(200);
    });

    let port = process.env.PORT || 8080;
    server.listen(port);
    console.log(`Address: ${process.env.ADDRESS || 'http://localhost'}:${port}`)
    setInterval(() => {
        http.get(process.env.ADDRESS || 'http://localhost:'+port);
    }, 200000);
});

// On user joining the Ladysnake guild
hissie.on('guildMemberAdd', member => {
    if (hissie.user.presence.status != 'dnd' && member.guild.id == config.ladysnakeGuildId) {
        const messages = ['Welcome' , 'Greetings', 'Salutations']; // yes this is hardcoded I know
        member.guild.channels.get(config.ladysnakeGeneralId).send(messages[Math.floor(Math.random()*messages.length)]+' '+member.displayName+'! If you need anything, please ask.');
        member.guild.channels.get(config.ladysnakeConsoleId).send({
            'embed': {
                'title': 'Member server join',
                'description': `${member.displayName} joined the server.`,
                'author': {
                    'name': member.displayName,
                    'icon_url': member.user.displayAvatarURL
                },
                'color': member.displayColor != 0 ? member.displayColor : 0x4F545C
            }
        });
    }
});

// On user leaving the Ladysnake guild
hissie.on('guildMemberRemove', member => {
    if (hissie.user.presence.status != 'dnd' && member.guild.id == config.ladysnakeGuildId)
        member.guild.channels.get(config.ladysnakeConsoleId).send({
            'embed': {
                'title': 'Member server leave',
                'description': `${member.displayName} left the server.`,
                'author': {
                    'name': member.displayName,
                    'icon_url': member.user.displayAvatarURL
                },
                'color': member.displayColor != 0 ? member.displayColor : 0x4F545C
            }
        });
});
  
// On Ladysnake discord member change (role, nickname, etc...)
hissie.on('guildMemberUpdate', (oldMember, newMember) => {
    if (hissie.user.presence.status != 'dnd' && newMember.guild.id == config.ladysnakeGuildId) {
        // Nickname change?
        if (oldMember.displayName !== newMember.displayName)
            newMember.guild.channels.get(config.ladysnakeConsoleId).send({
                'embed': {
                    'title': 'Member nickname change',
                    'description': 'Before: ``'+oldMember.displayName+'``\nAfter: ``'+newMember.displayName+'``',
                    'author': {
                        'name': newMember.displayName,
                        'icon_url': newMember.user.displayAvatarURL
                    },
                    'color': newMember.displayColor != 0 ? newMember.displayColor : 0x4F545C
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
            newMember.guild.channels.get(config.ladysnakeConsoleId).send({
                'embed': {
                    'title': title,
                    'description': desc,
                    'author': {
                        'name': newMember.displayName,
                        'icon_url': newMember.user.displayAvatarURL
                    },
                    'color': newMember.displayColor != 0 ? newMember.displayColor : 0x4F545C
                }
            });
    }
});

// On message receive
hissie.on('message', message => {
    // If not DM, and Hissie is not in DnD or the sender
    if (message.channel.type != 'dm' && hissie.user.presence.status != 'dnd' && message.author !== hissie.user) {
        let called = false;
        let answered = false;
        let action = '';
        
        // If tagged or role she has is tagged, detects she's called
        called = (message.mentions.users.some(user => user.id === hissie.user.id) || message.mentions.roles.some(role => message.guild.members.get(hissie.user.id).roles.array().includes(role)))

        // If called, setting user called state
        if (message.member.permissions.has("ADMINISTRATOR")) userStates.set(message.author, {state: 'admin', time: new Date()});
        if (called) userStates.set(message.author, {state: 'called', time: new Date()});

        grabJson('data/answers.json').some(answer => {
            if (new RegExp(answer.regex, 'i').test(message.content)) {
                // If keyword correspondance and states are correct (including no state)
                if (userStates.get(message.author)) {
                    if (new Date() - userStates.get(message.author).time > 3600000) {
                        userStates.delete(message.author);
                        return false;
                    }
                    if (answer.states.includes(userStates.get(message.author).state) || answer.states.length == 0) {
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
                        if (answer.result != '') userStates.set(message.author, {state: answer.result, time: new Date()});
                        else if (answered) userStates.delete(message.author);
                    }
                }
            }
            return answered;
        });

        // Actions
        switch (action) {
            // Google search
            case 'googleSearch':
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
                        // Test every link, see if it exists and if it's sfw
                        try {
                            let safeReg = /.*(porn|hentai|xvideos|xhamster|doujin).*/igm;
                            for (var i = 0; i < 10; i++) {
                                if (response.links[i] != null && !safeReg.test(response.links[i].link) && !safeReg.test(response.links[i].title) && !safeReg.test(response.links[i].description)) {
                                    message.channel.send(response.links[i].link);
                                    return;
                                }
                            }
                        } catch (exception) {
                            message.channel.send('Sorry, I couldn\'t find anything relevant, maybe try rewording?');
                        }
                    });
                }
                break;

            // Hissiemotes
            // Addition (attachment)
            case 'hissiemoteAddAttachment':
                var emoteName;
                // Attachments
                if (message.attachments.array()[0] != null) {
                    url = message.attachments.array()[0].url.toString();
                    if (message.attachments.array()[0].filename.match(/\.gif$/i)) {
                        if (message.attachments.array()[0].height > 150) {
                            message.channel.send('Sorry, but your gif is too tall and I can\t resize gifs myself. But you can use https://ezgif.com/resize (make it so the height is at most 150px).')
                            break;
                        }
                    }
                    emoteName = message.attachments.array()[0].filename.replace(/\.(png|jpg)$/i, '');
                }
                // Simple emote name
                if (emoteName.match(/.*\..*/g)) {
                    message.channel.send('Unsupported format or name.');
                    return;
                }
                emotes = grabJson('data/hissiemotes.json');
                // If emote exists, aborting
                if (emotes[emoteName]) {
                    message.channel.send("An emote of this name already exists.");
                    return;
                } else {
                    Imgur.setCredentials(process.env.HissieImgurLogin, config.HissieImgurPassword, config.HissieImgurToken);
                    Jimp.read(message.attachments.array()[0].url, (err, img) => {
                        if (err) throw err;
                        img.resize(Jimp.AUTO, 150).getBase64(Jimp.AUTO, (exception, base64) => {
                            if (exception) throw exception
                            Imgur.uploadBase64(base64.replace(/^data:.+base64,/i, '')).then(json => {
                                console.log(json.data.link)
                                emotes[emoteName] = json.data.link;
                                console.log(emotes)
                                fs.writeFile("data/hissiemotes.json", JSON.stringify(emotes, null, 4), 'utf8', err => {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    console.log("The hissiemote file was saved!");
                                });
                                message.channel.send({
                                    "embed": {
                                        "title": "Hissiemote added",
                                        "description": '``'+emoteName+'``',
                                        "author": {
                                            "name": message.author.username+'#'+message.author.discriminator,
                                            "icon_url": message.author.displayAvatarURL
                                        },
                                        "color": message.member.displayColor != 0 ? message.member.displayColor : 0x4F545C,
                                        "thumbnail": {
                                            "url": json.data.link
                                        }
                                    }
                                });
                            })
                            .catch(function (err) {
                                console.error(err.message);
                            });
                        });
                    });
                }
                break;
            // Addition (link)
            case 'hissiemoteAddLink':
                message.channel.send('Adding hissiemote (link)');
                break;
            // Deletion
            case 'hissiemoteDelete':
                message.channel.send('Deleting hissiemote');
                break;
            // Renaming
            case 'hissiemoteRename':
                message.channel.send('Removing hissiemote');
                break;
        }

        // If called on the channel but didn't answer, acknowledge
        if (called && !answered) {
            const answers = ['Yes ?', 'Hmmm ?', 'What is it ?', 'What can I help you with ?', 'I\'m here !'];  // yes this is hardcoded too
            message.channel.send(answers[Math.floor(Math.random()*answers.length)]);
            userStates.set(message.author, {state: 'called', time: new Date()})
        }
    }
});