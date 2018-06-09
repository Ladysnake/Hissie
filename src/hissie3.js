const Discord = require('discord.js');
const fs = require('fs');

const hissie = new Discord.Client();

// Start corresponding bot
process.argv.forEach((val, index, array) => {
    if (index == 2 && (val == 'hissie' || val == 'sibila')) {
        hissie.login(JSON.parse(fs.readFileSync('data/config.json'))[val]['token']);
    }
});

// When fully logged in and launched
hissie.on('ready', () => {
    console.log(`Logged in as ${hissie.user.tag}!`);
});

// Message received
hissie.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('Pong!');
    }
});