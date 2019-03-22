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
    message.member.voiceChannel.leave()
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
    switch (n) {
        case 1:
            return "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-1_2680.png";
        case 2:
            return "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-2_2681.png";
        case 3:
            return "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-3_2682.png";
        case 4:
            return "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-4_2683.png";
        case 5:
            return "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-5_2684.png";
        case 6:
            return "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-6_2685.png";
    
        default:
            break;
    }
}

module.exports = {grabJson, playAudio, randomNumber, numberToDieImg}