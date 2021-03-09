const { Client, Collection } = require('discord.js-light');
const { Poster } = require('dbots');
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

    this.eventLoader.init();

    this.commandLoader.init();

    this.votePoster = new Poster({
      client: this,
      apiKeys: {
        discordbotsgg: process.env.BOTSGG,
        topgg: process.env.TOPGGTOKEN,
        discordbotlist: process.env.DBL2TOKEN,
        spacebotslist: process.env.BLSTOKEN,
        botsfordiscord: process.env.BFDTOKEN
      },
      clientLibrary: 'discord.js',
      clientID: this.user.id,
      serverCount: () => this.shard.fetchClientValues('guilds.cache.size')
        .then(res => res.filter(Boolean).reduce((prev, count) => prev + count, 0)),
      userCount: () => this.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0')
        .then(res => res.filter(Boolean).reduce((prev, count) => prev + count, 0))
    });

    this.lastChangelog = null;

    this.fetchLastChangelog().catch(e => this.logger.error(e));
  }

  async fetchLastChangelog() {
    const channelID = process.env.NODE_ENV === 'production' ? '602326597613256734' : '504074783604998154';

    this.lastChangelog = await this.channels.fetch(channelID)
      .then(channel => channel.messages.fetch({ limit: 1 }))
      .then(res => res.first());
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
    return this.config.owners.includes(id);
  }

  // this method checks if the user ID has the "MANAGE_GUILD" permission or "ADMINISTRATOR" permission
  isAdmin(member) {
    return member.hasPermission(['ADMINISTRATOR', 'MANAGE_GUILD']);
  }

  async isStaff(guild, user) {
    const member = await guild.members.fetch({ user: user.id, cache: false }).catch(() => {
      return false;
    });

    let staffCheck;
    const adminCheck = this.isAdmin(member) || this.isOwner(member.id);
    const staffRoles = guild.settings.get(guild.id).staffRoles;
    if (staffRoles) staffCheck = member.roles.cache.some(r => staffRoles.map(sr => sr.id).includes(r.id)) || adminCheck;
    else staffCheck = adminCheck;

    return staffCheck;
  }

  async isSupport(user) {
    const id = process.env.NODE_ENV === 'production' ? '601219766258106399' : '345753533141876737';
    return this.guilds.forge(id).members.fetch({ user: user.id, cache: false }).then(member => {
      return member.roles.cache.some(r => this.config.supportRoles.includes(r.id)) || this.isOwner(member.id)
    }).catch(() => { return this.isOwner(user.id) || false; });
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
};
