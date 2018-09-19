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

const { prefix, suggestionsChannel, suggestionsLogs } = require('./config.json');

defaultSettings = {
    prefix: prefix,
    suggestionsChannel: suggestionsChannel,
    suggestionsLogs: suggestionsLogs
};

const n = {
    token: process.env.TOKEN,
    dblToken: process.env.DBLTOKEN,
    db : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME
    }
};

cmdStatus = {
    status: 'on',
    reason: ''
};

client.commands = new Enmap();
client.aliases = new Enmap();
cmdStatus = new Enmap(); 

const DBL = require('dblapi.js');
const dbl = new DBL(n.dblToken, client);

if (n.name === 'production') {

    dbl.on('posted', () => {
        console.log('Server count posted to DiscordBots.org!');
    });
    
    dbl.on('error', e => {
        console.log(e);
    });
}

const dbURI = `mongodb://${n.db.user}:${n.db.password}@${n.db.host}:${n.db.port}/${n.db.name}?authSource=admin`;
const dbURILog = `mongodb://${n.db.user}@${n.db.host}:${n.db.port}/${n.db.name}`;

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
        props.conf.aliases.forEach(alias => {
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

client.login(n.token);