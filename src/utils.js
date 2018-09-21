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
    return voiceChannel.join()
        .then(connection => {
            const stream = ytdl(url, { filter: 'audioonly' });
            const dispatcher = connection.playStream(stream);
            dispatcher.on('end', () => {
                voiceChannel.leave();
            });
        });
}

module.exports = {grabJson, playAudio}