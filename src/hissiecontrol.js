const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

bot = 'hissie'
channel = '#general'

process.stdout.write(`(${bot})[${channel}] > `)

rl.on('line', (input) => {
    console.log(`Received: ${input}`);
    process.stdout.write(`(${bot})[${channel}] > `)
});