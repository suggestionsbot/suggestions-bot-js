require('dotenv-flow').config();
const mongoose = require('mongoose');
// const cachegoose = require('cachegoose');
const _ = require('lodash');

const { oneLine } = require('common-tags');
const { Blacklist, Command, Settings, Suggestion } = require('../models');

// cachegoose(mongoose, {
//   engine: 'redis',
//   port: process.env.REDIS_PORT,
//   host: process.env.REDIS_HOSTNAME,
//   password: process.env.REDIS_PASSWORD
// });

module.exports = class SettingsHelpers {
  constructor(client) {
    this.client = client;
  }

  _guildQuery(guild) {
    return [
      { guildID: guild.id },
      { guildID: guild }
    ];
  }

  /**
     * Get a guild's settings from the database.
     *
     * @param {Object} guild - The guild object.
     */
  async getGuild(guild) {
    let data = await Settings.findOne({ $or: this._guildQuery(guild) });
      // we're going to keep it as 0 because guild settings don't always change
      // .cache(0, guild.id);

    if (data == null) {
      data = {
        guildID: guild.id,
        ...this.client.config.defaultSettings
      };
    }

    return data;
  }

  /**
     * Update a guild's settings in the database.
     *
     * @param {Object} guild - The guild object.
     * @param {Object} newSettings - The settings object to be updated.
     */
  async updateGuild(guild, newSettings) {
    // let data = await Settings.findOne({ $or: this._guildQuery(guild) });
    let data = await this.getGuild(guild);
    // if (!data) data = await this.createGuild({ guildID: guild.id });
    const { guildID } = data;

    let settings = data;
    // maybe check if settings object is empty, return an error?
    if (typeof settings != 'object') settings = {};
    for (const key in newSettings) {
      if (data[key] !== newSettings[key]) settings[key] = newSettings[key];
      else return;
    }

    const dataCheck = await Settings.findOne({ $or: this._guildQuery(guild) });
    if (!dataCheck) data = await this.createGuild({ guildID: guild.id });

    const updated = await Settings
      .findOneAndUpdate({ $or: this._guildQuery(guild) }, settings);

    // clear the cache for updated settings to show
    // cachegoose.clearCache(guild.id);

    await this.client.shard.broadcastEval(`this.guilds.get('${guildID}')`)
      .then(guildArray => {
        const found = guildArray.find(g => g);
        if (!found) return false;

        this.client.logger.log(oneLine`
          Guild "${found.name}" (${found.id}) updated settings: ${Object.keys(newSettings)}
        `);
      });

    return updated;
  }

  /**
     * Update a staff role of a guild in the database.
     *
     * @param {Object} guild - The guild object.
     * @param {Boolean} added - To check if the role should be removed or not.
     */
  async updateGuildStaffRoles(guild, added = true) {
    const { query, staffRoles } = guild;
    const guildSettings = await Settings.findOne(query);
    const updatedData = { staffRoles };
    if (added) return await guildSettings.updateOne({ $push: updatedData });
    else return await guildSettings.updateOne({ $pull: updatedData });
  }

  /**
     * Update a guild's disabled commands
     *
     * @param {Object} guild - The guild object.
     * @param {Boolean} added - To check if the command should be disabled or not.
     */
  async updateGuildCommands(guild, added = true) {
    const { query, disabledCommands } = guild;
    const guildSettings = await Settings.findOne(query);
    const updatedData = { disabledCommands };
    if (added) return await guildSettings.updateOne({ $push: updatedData });
    else return await guildSettings.updateOne({ $pull: updatedData });
  }

  /**
     * Create new settings for a guild in the database.
     *
     * @param {Object} guild - The guild object.
     */
  async createGuild(guild) {
    const defaults = { _id: mongoose.Types.ObjectId() };
    const merged = Object.assign(defaults, guild); // make this into a global function

    const newSettings = await new Settings(merged);
    const data = await newSettings.save();
    const { guildID } = data;

    await this.client.shard.broadcastEval(`this.guilds.get('${guildID}')`)
      .then(guildArray => {
        const found = guildArray.find(g => g);
        if (!found) return false;

        this.client.logger.log(oneLine`
          Default settings saved for guild "${found.name}" (${found.id}).
        `);
      });

    return data;
  }

  /**
     * Update the usage for a specific command in the database.
     *
     * @param {Object} command - The command object.
     * @returns {Promise} - The promise object of the new command.
     */
  async newCommandUsage(command) {
    const defaults = { _id: mongoose.Types.ObjectId() };
    const merged = Object.assign(defaults, command);

    const newCommand = await new Command(merged);
    const data = await newCommand.save();

    const cUser = await this.client.fetchUser(data.userID);
    this.client.logger.log(`"${cUser.tag}" (${cUser.id}) ran the command "${data.command}"`, 'cmd');

    return data;
  }

  /**
     * Remove a guild's data from the database.
     *
     * @param {Object} guild - The guild object.
     */
  async deleteGuild(guild) {
    await Settings.findOneAndDelete({
      $or: [
        { guildID: guild.id },
        { guildID: guild.guildID }
      ]
    });
    // cachegoose.clearCache(guild.id || guild.guildName);
    this.client.logger.log(`Settings data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);

    await Suggestion.deleteMany({
      $or: [
        { guildID: guild.id },
        { guildID: guild.guildID }
      ]
    });
    this.client.logger.log(`Suggestions data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);

    await Command.deleteMany({
      $or: [
        { guildID: guild.id },
        { guildID: guild.guildID }
      ]
    });
    this.client.logger.log(`Command data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);

    await Blacklist.deleteMany({
      $or: [
        { guildID: guild.id },
        { guildID: guild.guildID }
      ]
    });
    this.client.logger.log(`Blacklist data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);

    this.client.logger.log(`${this.client.user.username} has left a guild: ${guild.name || guild.guildName } (${guild.id || guild.guildID})`);
  }

  /**
     * Get all documents in the settings collection
     * @returns {Promise}
     */
  async getAllSettings() {
    return await Settings.find({});
  }

  /**
     * Get all documents in the commands collection.
     * @returns {Promise}
     */
  async getAllCommands() {
    return await Command.find({});
  }

  /**
     * Get all documents in the suggestions collection.
     * @returns {Promise}
     */
  async getAllSuggestions() {
    return await Suggestion.find({});
  }

  /**
     * Get all documents in the blacklists collection.
     * @returns {Promise}
     */
  async getAllBlacklists() {
    return await Blacklist.find({});
  }
};
