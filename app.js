const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({disableEveryone: true});
const fs = require('fs');
var TOKEN = config.token;
var PREFIX = config.prefix;

/*
fs.readdir('./events/', (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        
        client.on(eventName, (...args) => eventFunction.run(client, ...args));
    });
})
*/

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})`);

    client.user.setStatus('online');
    client.user.setActivity(',suggest', { type: 'PLAYING' })
        .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error);
});

client.on('message', message => {

    if (message.author.bot) return;
    if (message.content.indexOf(PREFIX) !== 0) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        let commandFile = require(`./commands/${command}.js`);
        commandFile.run(client, message, args);
    } catch (err) {
        console.err;
    }
});

client.login(TOKEN);