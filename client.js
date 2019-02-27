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

    /**
     * Grabs a single reply from the user that initiated the command. Must include a question or embed.
     * @example
     * async function getReply() {
     *      const name = awaitReply(message, "What is your name>");
     *      return message.channel.send(`Your name is ${name}!`);
     * }
     * @returns {String} - Returns a string representing the first collection message.
     * 
     * @param {Object} message - The message object.
     * @param {Object} channel - The channel object.
     * @param {?String} question - The question (optional).
     * @param {?Object} embed - The embed (optional).
     * @param {?Number} limit - The limit/timeout (optional).
     */
    async awaitReply(message, channel, question, embed, limit) {
        const filter = msg => msg.author.id === message.author.id;
        channel = channel || message.channel;

        await channel.send(question || '', embed || '');
        try {
            const collected = await channel.awaitMessages(filter, {
                max: 1,
                time: limit || 60000, // by default, limit 1 minutes
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