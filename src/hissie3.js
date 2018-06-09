const Discord = require('discord.js');
const fs = require('fs');
const readline = require('readline');

const hissie = new Discord.Client();
var mode = 'normal';

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


// Normal automatic mode
if (mode == 'normal') {

    // Message received
    hissie.on('message', msg => {
        if (msg.content === 'ping') {
            msg.reply('Pong!');
        }
    });

}


// Bot control mode
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