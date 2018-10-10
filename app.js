const fs = require('fs');
const Discord = require('discord.js');
const Enmap = require('enmap');
const mongoose = require('mongoose');
require('dotenv-flow').config();

const client = new Discord.Client({
    disableEveryone: true,
    messageCacheMaxSize: 500,
    messageCacheLifetime: 120,
    messageSweepInterval: 60
});

settings = {
    token: process.env.TOKEN,
    dblToken: process.env.DBLTOKEN,
    db : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME
    },
    prefix: process.env.PREFIX,
    suggestionsChannel: process.env.SUGGESTIONSCHANNEL,
    suggestionsLogs: process.env.SUGGESTIONSLOGS,
    owner: process.env.OWNER,
    embedColor: process.env.DEFAULT_COLOR,
    discord: process.env.DISCORD,
    docs: process.env.DOCS,
    invite: process.env.INVITE,
    ver: process.env.VER
};

defaultSettings = {
    prefix: settings.prefix,
    suggestionsChannel: settings.suggestionsChannel,
    suggestionsLogs: settings.suggestionsLogs
};

cmdStatus = {
    status: 'on',
    reason: ''
};

client.commands = new Enmap();
client.aliases = new Enmap();
cmdStatus = new Enmap(); 

if (settings.ver === 'production') {

    const DBL = require('dblapi.js');
    const dbl = new DBL(settings.dblToken, client);

    dbl.on('posted', () => {
        console.log('Server count posted to DiscordBots.org!');
    });
    
    dbl.on('error', e => {
        console.log(e);
    });
}

const dbURI = `mongodb://${settings.db.user}:${settings.db.password}@${settings.db.host}:${settings.db.port}/${settings.db.name}?authSource=admin`;
const dbURILog = `mongodb://${settings.db.user}@${settings.db.host}:${settings.db.port}/${settings.db.name}`;

const dbOtions = {
    useNewUrlParser: true,
    autoIndex: false,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    poolSize: 5,
    connectTimeoutMS: 10000,
    family: 4
};

mongoose.connect(dbURI, dbOtions);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

mongoose.connection.on('connected', () => {
    console.log('Mongoose connection successfully open at ' + dbURILog);
});

mongoose.connection.on('err', err => {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected');
});

fs.readdir('./events/', async (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const evt = require(`./events/${file}`);
        let evtName = file.split('.')[0];
        console.log(`Loaded event '${evtName}'`);
        client.on(evtName, evt.bind(null, client));
    });
});

fs.readdir('./commands/', async (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        let props = require(`./commands/${file}`);
        let cmdName = file.split('.')[0];
        console.log(`Loaded command '${cmdName}'`);
        client.commands.set(cmdName, props);
        props.help.aliases.forEach(alias => {
            client.aliases.set(alias, cmdName);
        });
    });
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongose connection disconnected through app termination');
        process.exit(0);
    });
    console.log('Bot shutting down...');
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

client.login(settings.token);