/*jshint esversion: 6 */

// Libs
const Discord = require('discord.js');
const express = require('express');
const lodash = require('lodash');
const google = require('google');
const http = require('http');
const request = require('request');
const ytdl = require('ytdl-core');

// Utils
const {grabJson, playAudio, randomNumber, numberToDieImg} = require('./utils');
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
    console.log(`Address: ${process.env.ADDRESS || 'http://localhost'}:${port}`);
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
        called = (message.mentions.users.some(user => user.id === hissie.user.id) || message.mentions.roles.some(role => message.guild.members.get(hissie.user.id).roles.array().includes(role)));

        // If called, setting user called state
        if (called) userStates.set(message.author, {state: 'called', time: new Date()});
        grabJson('data/answers.json').some(answer => {
            if (new RegExp(answer.regex, 'i').test(message.content)) {
                // If keyword correspondance and states are correct (including no state)
                let userState = '';
                if (userStates.get(message.author)) {
                    if (new Date() - userStates.get(message.author).time > 3600000) {
                        userStates.delete(message.author);
                        return false;
                    } else userState = userStates.get(message.author).state;
                }
                if (answer.states.includes(userState) || answer.states.length == 0) {
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
                            let exceptionReg = /.*(earth|food).*/igm;
                            for (let i = 0; i < 10; i++) {
                                if (response.links[i] != null && response.links[i].link != null && !safeReg.test(response.links[i].link) && !safeReg.test(response.links[i].title) && !safeReg.test(response.links[i].description)) {
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

            // Hissiemote
            case 'hissiemote':
                // Request hissiemote list from the Ladysnake server
                request('https://ladysnake.github.io/hissiemotes.json', (err, res, json) => {
                    if (err) console.log('error:', err); // Print the error if one occurred

                    const hissiemoteList = JSON.parse(json);
                    const emote = message.content.replace(':', '').replace('!', '');
                    const emb = new Discord.RichEmbed();
                    const displayName = message.member.displayName;

                    emb.setAuthor(displayName, message.author.avatarURL);
                    if (message.member.displayColor != 0) emb.setColor(message.member.displayColor);
                    if (message.guild.emojis.find('name', emote.trim())) {
                        emb.setImage(message.guild.emojis.find('name', emote.trim()).url.toString());
                        message.channel.send(emb);
                        message.delete();
                    } else if (hissiemoteList[emote]) {
                        emb.setImage(hissiemoteList[emote]);
                        message.channel.send(emb);
                        message.delete();
                    } else message.channel.send('No emote of that name.');
                });
                break;

            // Play audio
            case 'playAudio':
                if (message.member.voiceChannel) {
                    let url;
                
                    // If youtube link
                    if (message.content.match(/https:\/\/(www\.)?youtube\.com\/watch\?v/gmi)) {
                        url = message.content.replace(/.*play /gmi, '');
                        playAudio(message, url);
                    } else {
                        google(message.content.replace(/.*play /gmi, '').trim() + ' youtube', (err, response) => {
                            if (err) console.error(err);
                            // Test every link, see if it exists and if it's sfw
                            try {
                                for (let i = 0; i < 10; i++) {
                                    if (response.links[i].link != null) {
                                        url = response.links[i].link;
                                        message.channel.send('Playing '+url+' right now!');
                                        playAudio(message, url);
                                        break;
                                    }
                                }
                            } catch (exception) {
                                message.channel.send('Sorry, I couldn\'t find anything relevant, maybe try rewording?');
                                return;
                            }
                        });
                    }
                } else message.channel.send('You need to be in a voice channel first if you want me to play anything for you.');
                break;

            // Stop playing audio
            case 'stopAudio':
                if (message.member.voiceChannel) {
                    message.member.voiceChannel.leave();
                } else message.channel.send('Can\'t stop playing if I\'m not 🤷‍');
                break;
            
            // Get user profile picture
            case 'getUserAvatar':
                message.mentions.users.forEach(user => {
                    hissie.fetchUser(user.id).then(myUser => {
                        if (myUser.id != '425215396170432512') {
                            const myMember = message.channel.guild.member(myUser);
                            const emb = new Discord.RichEmbed();
                            emb.setAuthor(myMember.displayName, myUser.avatarURL);
                            if (myMember.displayColor != 0) emb.setColor(myMember.displayColor);
                            emb.setImage(myUser.avatarURL);
                            message.channel.send(emb);
                        }
                    });
                });

            // Roll a die
            case 'rollDie':
                message.channel.send({
                    'embed': {
                        "image": {
                            "url": numberToDieImg(randomNumber(1, 6))
                        },
                    }
                });
                break;

        }

        // If called on the channel but didn't answer, acknowledge
        if (called && !answered) {
            const answers = ['Yes ?', 'Hmmm ?', 'What is it ?', 'What can I help you with ?', 'I\'m here !'];  // yes this is hardcoded too
            message.channel.send(answers[Math.floor(Math.random()*answers.length)]);
            userStates.set(message.author, {state: 'called', time: new Date()});
        }
    }
});