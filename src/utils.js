/*jshint esversion: 6 */

const fs = require('fs');
const ytdl = require('ytdl-core');

function grabJson(path) {
    return JSON.parse(fs.readFileSync(path));
}

function playAudio(message, url) {
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
        return message.channel.send('Please be in a voice channel first!');
    }
    message.member.voiceChannel.leave();
    return voiceChannel.join()
        .then(connection => {
            const stream = ytdl(url, { filter: 'audioonly' });
            const dispatcher = connection.playStream(stream);
            dispatcher.on('end', () => {
                voiceChannel.leave();
            });
        });
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function numberToDieImg(n) {
    const repeating = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-";
    switch (n) {
        case 1:
            return repeating + "1_2680.png";
        case 2:
            return repeating + "2_2681.png";
        case 3:
            return repeating + "3_2682.png";
        case 4:
            return repeating + "4_2683.png";
        case 5:
            return repeating + "5_2684.png";
        case 6:
            return repeating + "6_2685.png";
    
        default:
            break;
    }
}

module.exports = {grabJson, playAudio, randomNumber, numberToDieImg};