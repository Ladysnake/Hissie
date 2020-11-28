/*jshint esversion: 6 */

const fs = require('fs');
const ytdl = require('ytdl-core');

function grabJson(path) {
    return JSON.parse(fs.readFileSync(path));
}

async function playAudio(message, url) {
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
        return message.channel.send('Please be in a voice channel first!');
	}
	
    message.member.voiceChannel.leave();
    const connection = await voiceChannel.join();
	const stream = ytdl(url, { filter: 'audioonly' });
	const dispatcher = connection.playStream(stream);

	dispatcher.on('end', () => {
		voiceChannel.leave();
	});
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function numberToDieImg(n) {
	const repeating = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/samsung/161/die-face-";
	return (n < 1 || n > 7) ? "" : `${repeating}${n}_268${n - 1}`;
}

module.exports = {
	grabJson,
	playAudio,
	randomNumber,
	numberToDieImg,
};