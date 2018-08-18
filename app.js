const Discord = require('discord.js');
const client = new Discord.Client({disableEveryone: true});
//const fs = require('fs');
const { prefix, token } = require('./config.json');

const cmdCooldown = new Set();
const cmdSeconds = 5;

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
    console.log(`Logged in as ${client.user.tag} (${client.user.id}) in ${client.guilds.size} server(s).`);

    client.user.setStatus('online');
    client.user.setActivity('your suggestions', { type: 'LISTENING' })
        .catch(console.error);
});

client.on('message', async message => {

    const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    const newPrefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : prefix;

    if (message.author.bot) return;
    if (message.content.indexOf(newPrefix) !== 0) return;

    if (cmdCooldown.has(message.author.id)) {
        message.reply(`slow down there! You need to wait ${cmdSeconds} second(s) before issuing another command. `)
        .then(message => {
            message.delete(1500)
        })
        .catch(error => {
            console.error;
        });
        return message.delete();
    }

    if(!message.member.hasPermission('ADMINISTRATOR')) {
        cmdCooldown.add(message.author.id);   
    }

    const args = message.content.slice(newPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        const commandFile = require(`./commands/${command}.js`);
        commandFile.run(client, message, args);
    } catch (err) {
        console.err;
    }
    setTimeout(() => {
        cmdCooldown.delete(message.author.id);
    }, cmdSeconds * 1000);
});

client.login(token);