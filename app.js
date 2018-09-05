const fs = require('fs');
const Discord = require('discord.js');
const Enmap = require('enmap');
const Provider = require('enmap-sqlite');

const client = new Discord.Client({
    disableEveryone: true,
    messageCacheMaxSize: 500,
    messageCacheLifetime: 120,
    messageSweepInterval: 60
});

const { token, prefix, suggestionsChannel, dblToken } = require('./config.json');

client.commands = new Enmap();
client.aliases = new Enmap();

client.settings = new Enmap({provider: new Provider({name: 'settings'})});

defaultSettings = {
    prefix: prefix,
    suggestionsChannel: suggestionsChannel
}

const DBL = require('dblapi.js');
const dbl = new DBL(dblToken, client);

dbl.on('posted', () => {
    console.log('Server count posted to DiscordBots.org!');
});

dbl.on('error', e => {
    console.log(e);
});

fs.readdir('./events/', (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
        const evt = require(`./events/${file}`);
        let evtName = file.split('.')[0];
        console.log(`Loaded event '${evtName}'`)
        client.on(evtName, evt.bind(null, client));
    });
});

fs.readdir('./commands/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        let props = require(`./commands/${file}`);
        let cmdName = file.split('.')[0];
        console.log(`Loaded command '${cmdName}'`);
        client.commands.set(cmdName, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, cmdName);
        });
    });
});

client.login(token);