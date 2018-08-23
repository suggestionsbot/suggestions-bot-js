const fs = require('fs');
const Discord = require('discord.js');
const Enmap = require('enmap');

const client = new Discord.Client({
    disableEveryone: true,
    messageCacheMaxSize: 500,
    messageCacheLifetime: 120,
    messageSweepInterval: 60
});

const { token } = require('./config.json');

fs.readdir('./events/', (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
        const evt = require(`./events/${file}`);
        let evtName = file.split('.')[0];
        console.log(`Loaded event '${evtName}'`)
        client.on(evtName, evt.bind(null, client));
    });
});

client.commands = new Enmap();

fs.readdir('./commands/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        let props = require(`./commands/${file}`);
        let cmdName = file.split('.')[0];
        console.log(`Loaded command '${cmdName}'`);
        client.commands.set(cmdName, props);
    });
});

client.login(token);