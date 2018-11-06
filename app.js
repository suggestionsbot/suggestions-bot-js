if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

const { Client, Collection } = require('discord.js');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const klaw = require('klaw');
const path = require('path');
const mongoose = require('mongoose');
const { stripIndents } = require('common-tags');
const Settings = require('./models/settings');
const Suggestion = require('./models/suggestions');
const Blacklist = require('./models/blacklist');
require('dotenv-flow').config();

class Suggestions extends Client {
    constructor(options) {
        super(options);

        this.config = require('./config.js');

        this.commands = new Collection();
        this.aliases = new Collection();

        this.logger = require('./utils/Logger');

        this.wait = require('util').promisify(setTimeout);
    }

    /* 
    COMMAND LOAD AND UNLOAD
  
    To simplify the loading and unloading of commands from multiple locations
    including the index.js load loop, and the reload function, these 2 ensure
    that unloading happens in a consistent manner across the board.
    */
    loadCommand(cmdPath, name) {
        try {
            const props = new (require(`${cmdPath}${path.sep}${name}`))(this);
            this.logger.log(`Loading Command: ${props.help.name}. 👌`, 'log');
            props.conf.location = path;
            if (props.init) props.init(this);
            this.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                this.aliases.set(alias, props.help.name);
            });
            return;
        } catch (e) {
            return `Unable to load command ${name}: ${e}`;   
        }
    }

    async unloadCommand(cmdPath, name) {
        let command;
        if (this.commands.has(name)) command = this.commands.get(name);
        else command = this.commands.get(this.aliases.get(name));

        if (!command) return `The command \`${name}\` doesn't seem to exist, nor is it an alias. Try again!`;

        if (command.shutdown) await command.shutdown(this);

        delete require.cache[require.resolve(`${cmdPath}${path.sep}${name}.js`)];
        return;
    }

    /* SETTINGS FUNCTIONS
    These functions are used by any and all location in the bot that wants to either
    read the current *complete* guild settings (default + overrides, merged) or that
    wants to change settings for a specific guild.
    */

    // getSettings merges the client defaults with the guild settings in MongoDB
    async getSettings(guild) {

        let gSettings = await Settings.findOne({ guildID: guild.id }).catch(err => this.logger.error(err));

        const guildData = gSettings || {};

        return guildData;
    }

    // writeSettings overrides, or adds, any configuration item that is different
    // than the defaults. This allows me to write fewer lines of code!
    async writeSettings(guild, newSettings) {

        let gSettings = await Settings.findOne({ guildID: guild.id }).catch(err => this.logger.error(err));

        const defaults = this.config.defaultSettings;
        let settings = gSettings;
        if (typeof settings != 'object') settings = {};
        for (const key in newSettings) {
            if (defaults[key] !== newSettings[key]) settings[key] = newSettings[key];
            else return;
        }
        return await Settings.findOneAndUpdate(settings).catch(err => this.logger.error(err));
    }

    // this method allows a single suggestion in a guild to be queried
    async getGuildSuggestion(guild, sID) {
        let gSuggestion = await Suggestion.findOne({ guildID: guild.id, sID: sID }).catch(err => this.logger.error(err));

        const guildSuggestion = gSuggestion || {};
        return guildSuggestion;
    }

    // this method allows for a single suggestion to be queried, regardless of the guild (for administrative use)
    async getGlobalSuggestion(sID) {
        let gSuggestion = await Suggestion.findOne({ sID: sID }).catch(err => this.logger.error(err));

        const globalSuggestion = gSuggestion || {};
        return globalSuggestion;
    }

    // this method gets a guild's blacklist from the database
    async getGuildBlacklist(guild) {
        let gBlacklist = await Blacklist.find({ guildID: guild.id }).catch(err => this.logger.error(err));

        const guildBlacklist = gBlacklist || {};
        return guildBlacklist;
    }

    // this method gets the global blacklist from the database
    async getGlobalBlacklist() {
        let gBlacklist = await Blacklist.find().catch(err => this.logger.error(err));

        const guildBlacklist = gBlacklist || {};
        return guildBlacklist;
    }

    // this method gets the guild's suggestions from the database
    async getGuildSuggestions(guild) {
        let gSuggestions = await Suggestion.find({ guildID: guild.id }).catch(err => this.logger.error(err));

        const guildSuggestions = gSuggestions || {};
        return guildSuggestions;
    }

    // this method gets the global suggestions from the database
    async getGlobalSuggestions() {
        let gSuggestions = await Suggestion.find().catch(err => this.logger.error(err));

        let globalSuggestions = gSuggestions || {};
        return globalSuggestions;
    }

    /*
    SINGLE-LINE AWAITMESSAGE
    A simple way to grab a single reply, from the user that initiated
    the command. Useful to get "precisions" on certain things...
    USAGE
    const response = await client.awaitReply(msg, "Favourite Color?");
    msg.reply(`Oh, I really love ${response} too!`);
    */
    async awaitReply(message, question, limit = 60000) {
        const filter = msg => msg.author.id = message.author.id;
        await message.channel.send(question);
        try {
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: limit,
                errors: ['time']
            });
            return collected.first().content;
        } catch (e) {
            return;
        }
    }

    /*
    MESSAGE CLEAN FUNCTION
    "Clean" removes @everyone pings, as well as tokens, and makes code blocks
    escaped so they're shown more easily. As a bonus it resolves promises
    and stringifies objects!
    This is mostly only used by the Eval and Exec commands.
    */

    async clean(client, text) {
        if (text && text.constructor.name == 'Promise') text = await text;
        if (typeof evaled !== 'string') text = require('util').inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(client.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');

        return text;
    }
}

const client = new Suggestions();

const init = async () => {

    klaw('./commands').on('data', (item) => {
        const cmdFile = path.parse(item.path);
        if (!cmdFile.ext || cmdFile.ext !== '.js') return;
        const response = client.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
        if (response) client.logger.error(response);
    });

    const evtFiles = await readdir('./events/');
    client.logger.log(`Loading a total of ${evtFiles.length} events.`, 'log');
    evtFiles.forEach(file => {
        const evtName = file.split('.')[0];
        client.logger.log(`Loading Event: ${evtName}`);
        const event = new (require(`./events/${file}`))(client);
        client.on(evtName, (...args) => event.run(...args));
        delete require.cache[require.resolve(`./events/${file}`)];
    });

    client.login();
};

init();

client.on('disconnect', () => client.logger.warn('Bot is disconnecting...'))
    .on('reconnecting', () => client.logger.log('Bot reconnecting...', 'log'))
    .on('error', e => client.logger.error(e))
    .on('warn', info => client.logger.warn(info));

const dbOtions = {
    useNewUrlParser: true,
    autoIndex: false,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    poolSize: 5,
    connectTimeoutMS: 10000,
    family: 4
};

mongoose.connect(client.config.dbURI, dbOtions);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

mongoose.connection.on('connected', () => {
    client.logger.log('Mongoose connection successfully open at ' + client.config.dbURILog);
});

mongoose.connection.on('err', err => {
    client.logger.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
    client.logger.log('Mongoose connection disconnected');
});


/* MISCELLANEOUS NON-CRITICAL FUNCTIONS */

// EXTENDING NATIVE TYPES IS BAD PRACTICE. Why? Because if JavaScript adds this
// later, this conflicts with native code. Also, if some other lib you use does
// this, a conflict also occurs. KNOWING THIS however, the following methods
// are, we feel, very useful in code. 

// <String>.toPropercase() returns a proper-cased string such as: 
// "Mary had a little lamb".toProperCase() returns "Mary Had A Little Lamb"
String.prototype.toProperCase = function () {
    return this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// <Array>.random() returns a single random element from an array
// [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5.
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};

// These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
process.on('uncaughtException', (err) => {
    const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', msg);
    // Always best practice to let the code crash on uncaught exceptions. 
    // Because you should be catching them anyway.
  process.exit(1);
});

process.on('unhandledRejection', error => {
	client.logger.error(stripIndents`Unhandled Rejection: ${error}`);
});