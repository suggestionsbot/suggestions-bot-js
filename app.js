if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

const { Client, Collection } = require('discord.js');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const klaw = require('klaw');
const path = require('path');
const { oneLine } = require('common-tags');
const ErrorHandler = require('./utils/handlers');
const Mongoose = require('./utils/mongoose');

// Stores for handling various functions
const { BlacklistsStore, SuggestionsStore, SettingsStore } = require('./stores');

require('dotenv-flow').config();

class Suggestions extends Client {
    constructor(options) {
        super(options);

        this.config = require('./config.js');

        this.commands = new Collection();
        this.aliases = new Collection();

        this.logger = require('./utils/logger');

        this.wait = require('util').promisify(setTimeout);

        this.suggestions = new SuggestionsStore(this);

        this.settings = new SettingsStore(this);

        this.blacklists = new BlacklistsStore(this);

        this.mongoose = new Mongoose(this);
    }

    /* 
    COMMAND LOAD AND UNLOAD
  
    To simplify the loading and unloading of commands from multiple locations
    including the index.js load loop, and the reload function, these 2 ensure
    that unloading happens in a consistent manner across the board.
    */
    loadCommand(cmdPath, cmdName) {
        try {
            const props = new (require(`${cmdPath}${path.sep}${cmdName}`))(this);
            this.logger.log(`Loading Command: ${props.help.name}. 👌`, 'log');
            props.conf.location = cmdPath;
            if (props.init) props.init(this);
            this.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                this.aliases.set(alias, props.help.name);
            });
            return;
        } catch (e) {
            return `Unable to load command ${cmdName}: ${e}`;   
        }
    }

    async unloadCommand(cmdPath, cmdName) {
        let command;
        if (this.commands.has(cmdName)) command = this.commands.get(cmdName);
        else command = this.commands.get(this.aliases.get(cmdName));

        if (!command) return `The command \`${cmdName}\` doesn't seem to exist, nor is it an alias. Try again!`;

        if (command.shutdown) await command.shutdown(this);

        delete require.cache[require.resolve(`${cmdPath}${path.sep}${cmdName}.js`)];
        return;
    }
    
    // this method checks if an object is empty
    async isEmpty(obj) {
        for (let key in obj) return false;
        return true;
    }

    /*
    SINGLE-LINE AWAITMESSAGE
    A simple way to grab a single reply, from the user that initiated
    the command. Useful to get "precisions" on certain things...
    USAGE
    const response = await client.awaitReply(msg, "Favourite Color?");
    msg.reply(`Oh, I really love ${response} too!`);
    */
    async awaitReply(message, question, embed, limit = 60000) {
        const filter = msg => msg.author.id = message.author.id;
        await message.channel.send(question, embed || '');
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

    // this method checks if the user ID is a bot owner or not
    isOwner(id) {
        if (id === client.config.owner) return true;
        else return false;
    }
}

const client = new Suggestions();

(async () => {
    klaw('./commands/commands').on('data', (item) => {
        const cmdFile = path.parse(item.path);
        if (!cmdFile.ext || cmdFile.ext !== '.js') return;
        const response = client.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
        if (response) client.logger.error(response);
    });

    const evtFiles = await readdir('./events/');
    client.logger.log(`Loading a total of ${evtFiles.length} events.`, 'log');
    evtFiles.forEach(file => {
        const evtName = file.split('.')[0];
        client.logger.log(`Loading Event: ${evtName}. 👌`);
        const event = new (require(`./events/${file}`))(client);
        client.on(evtName, (...args) => event.run(...args));
        delete require.cache[require.resolve(`./events/${file}`)];
    });

    client.login();
    client.mongodose.init(); // initialize connection to the database
})();

client.on('disconnect', () => client.logger.warn('Bot is disconnecting...'));
client.on('reconnecting', () => client.logger.log('Bot reconnecting...', 'log'));
client.on('error', e => client.logger.error(e.stack));
client.on('warn', info => client.logger.warn(info));
client.on('commandBlocked', (cmd, reason) => {
    client.logger.warn(oneLine `
            Command ${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}
            blocked; ${reason}
        `);
});
client.on('userBlacklisted', (user, guild, cmd, global = false) => {
    if (global) {
        client.logger.warn(oneLine `
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the 
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands globally.
        `);
    } else {
        client.logger.warn(oneLine `
            User "${user ? `${user.tag} (${user.id})` : ''}"
             in the 
            Guild "${guild ? `${guild.name} (${guild.id})` : ''}"
             tried to use the
            Command "${cmd ? `${cmd.help.category}:${cmd.help.name}` : ''}",
             but is blacklisted from using bot commands in the guild.
        `);
    }
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
    client.logger.error(`Uncaught Exception: \n ${msg}`);
    // Always best practice to let the code crash on uncaught exceptions. 
    // Because you should be catching them anyway.
  process.exit(1);
});

process.on('unhandledRejection', err => {
    let msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
	client.logger.error(`Unhandled Rejection: \n ${msg}`);
});