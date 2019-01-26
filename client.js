const { Client, Collection } = require('discord.js');
const Mongoose = require('./utils/mongoose');

// Stores for handling various functions
const { BlacklistsStore, SuggestionsStore, SettingsStore } = require('./stores');

const {  CommandHandler, EventHandler } = require('./utils/handlers');

module.exports = class Suggestions extends Client {
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

        this.commandHandler = new CommandHandler(this);

        this.eventHandler = new EventHandler(this);
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
        if (typeof evaled !== 'string') {
            text = require('util').inspect(text, {
                depth: 1
            });
        }

        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(client.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');

        return text;
    }

    // this method checks if the user ID is a bot owner or not
    isOwner(id) {
        if (id === this.config.owner) return true;
        else return false;
    }
};