const { Client, Collection, Constants, Guild, Emoji } = require('discord.js');
const Mongoose = require('../db/mongoose');

// Stores for handling various functions
const { Blacklists, Suggestions, Settings } = require('../db/helpers');

const { CommandLoader, EventLoader } = require('../loaders');

const ErrorHandler = require('../utils/errors');

const DashboardClient = require('../api');

module.exports = class SuggestionsClient extends Client {
  constructor(options) {
    super(options);

    this.config = require('../config.js');

    this.commands = new Collection();
    this.aliases = new Collection();

    this.logger = require('../utils/logger');

    this.wait = require('util').promisify(setTimeout);

    this.suggestions = new Suggestions(this);

    this.settings = new Settings(this);

    this.blacklists = new Blacklists(this);

    this.mongoose = new Mongoose(this);

    this.commandLoader = new CommandLoader(this);

    this.eventLoader = new EventLoader(this);

    this.errors = new ErrorHandler(this);

    this.dashboard = new DashboardClient(this);
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

  async clean(text) {
    if (text && text.constructor.name == 'Promise') text = await text;
    if (typeof text !== 'string') {
      text = require('util').inspect(text, {
        depth: 1
      });
    }

    text = text
      .replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203))
      .replace(this.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');

    return text;
  }

  // this method checks if the user ID is a bot owner or not
  isOwner(id) {
    if (id === this.config.owner) return true;
    else return false;
  }

  // Updates the presence depending on production or development
  async botPresence() {
    const { prefix } = this.config;
    const { help: { name: cmdName } } = await this.commands.get('help');

    if (process.env.NODE_ENV === 'production') {
      await this.user.setStatus('online');
      await this.user.setActivity(`your suggestions | ${prefix + cmdName}`, { type: 'WATCHING' });
    } else {
      await this.user.setStatus('dnd');
      await this.user.setActivity('in code land...', { type: 'PLAYING' });
    }
  }

  get voteEmojis() {
    const emojis = require('../utils/voteEmojis');
    return emojis;
  }

  findEmojiByID(id) {
    const temp = this.emojis.get(id);
    if (!temp) return null;

    // Clone the object because it is modified right after, so as to not affect the cache in client.emojis
    const emoji = Object.assign({}, temp);
    // Circular references can't be returned outside of eval, so change it to the id
    if (emoji.guild) emoji.guild = emoji.guild.id;
    // A new object will be constructed, so simulate raw data by adding this property back
    emoji.require_colons = emoji.requireColons;

    return emoji;
  }

  findEmojiByName(name) {
    const temp = this.emojis.find(e => e.name === name);
    if (!temp) return null;

    // Clone the object because it is modified right after, so as to not affect the cache in client.emojis
    const emoji = Object.assign({}, temp);
    // Circular references can't be returned outside of eval, so change it to the id
    if (emoji.guild) emoji.guild = emoji.guild.id;
    // A new object will be constructed, so simulate raw data by adding this property back
    emoji.require_colons = emoji.requireColons;

    return emoji;
  }

  findEmojiByString(string) {
    const temp = this.emojis.find(e => e.toString() === string);
    if (!temp) return null;

    // Clone the object because it is modified right after, so as to not affect the cache in client.emojis
    const emoji = Object.assign({}, temp);
    // Circular references can't be returned outside of eval, so change it to the id
    if (emoji.guild) emoji.guild = emoji.guild.id;
    // A new object will be constructed, so simulate raw data by adding this property back
    emoji.require_colons = emoji.requireColons;

    return emoji;
  }
};
