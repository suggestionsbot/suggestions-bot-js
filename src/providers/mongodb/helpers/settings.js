const mongoose = require('mongoose');

const { Blacklist, Command, Settings, Suggestion } = require('../models');
const Logger = require('../../../utils/logger');

module.exports = class SettingsHelpers {
  constructor(mongo) {
    this.mongo = mongo;
  }

  get guildSettings() {
    return this.mongo.client.guildSettings;
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
  async getGuild(guild, newGuild = false) {
    let data;
    const defaultData = {
      guildID: guild.id,
      ...this.mongo.client.config.defaultSettings
    };

    const inMap = this.guildSettings.has(guild.id);

    if (inMap)
      data = this.guildSettings.get(guild.id);
    else {
      let fetchedData = await Settings.findOne({ $or: this._guildQuery(guild) });
      if (newGuild) fetchedData = await this.createGuild(guild);
      if (fetchedData == null) return defaultData;
      this.guildSettings.set(guild.id, fetchedData);
      data = this.guildSettings.get(guild.id);
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
    const data = await this.getGuild(guild);
    let settings = data;
    // maybe check if settings object is empty, return an error?
    if (typeof settings != 'object') settings = {};
    for (const key in newSettings) {
      if (data[key] !== newSettings[key]) settings[key] = newSettings[key];
      else return;
    }

    if (!this.guildSettings.get(guild.id)) await this.getGuild(guild, true);

    const updated = await Settings
      .findOneAndUpdate({ $or: this._guildQuery(guild) }, settings, { new: true });

    this.guildSettings.set(guild.id, updated);

    const fetchedGuild = await this.mongo.client.shard.fetchGuild(guild.id);
    Logger.log(`Guild "${fetchedGuild.name}" (${fetchedGuild.id}) updated settings: ${Object.keys(newSettings)}`);

    return updated;
  }

  /**
     * Update a staff role of a guild in the database.
     *
     * @param {Object} guild - The guild object.
     * @param {Boolean} added - To check if the role should be removed or not.
     */
  async updateGuildStaffRoles(data, added = true) {
    const { guild, staffRoles } = data;
    const updatedData = { staffRoles };
    if (added) {
      if (!this.guildSettings.get(guild.id)) await this.getGuild(guild, true);
      const updated = await Settings.findOneAndUpdate({ $or: this._guildQuery(guild) }, { $push: updatedData }, { new: true });
      this.guildSettings.set(guild.id, updated);
    } else {
      if (!this.guildSettings.get(guild.id)) await this.getGuild(guild, true);
      const updated = await Settings.findOneAndUpdate({ $or: this._guildQuery(guild) }, { $pull: updatedData }, { new: true });
      this.guildSettings.set(guild.id, updated);
    }
  }

  /**
     * Update a guild's disabled commands
     *
     * @param {Object} guild - The guild object.
     * @param {Boolean} added - To check if the command should be disabled or not.
     */
  async updateGuildCommands(data, enabled = true) {
    const { guild, disabledCommands } = data;
    const updatedData = { disabledCommands };
    if (!enabled) {
      if (!this.guildSettings.get(guild.id)) await this.getGuild(guild, true);
      const updated = await Settings.findOneAndUpdate({ $or: this._guildQuery(guild) }, { $pull: updatedData }, { new: true });
      this.guildSettings.set(guild.id, updated);
    } else {
      if (!this.guildSettings.get(guild.id)) await this.getGuild(guild, true);
      const updated = await Settings.findOneAndUpdate({ $or: this._guildQuery(guild) }, { $push: updatedData }, { new: true });
      this.guildSettings.set(guild.id, updated);
    }
  }

  /**
     * Create new settings for a guild in the database.
     *
     * @param {Object} guild - The guild object.
     */
  async createGuild(guild) {
    const defaults = { _id: mongoose.Types.ObjectId() };
    const merged = Object.assign(defaults, { guildID: guild.id }); // make this into a global function

    const newSettings = new Settings(merged);
    const data = await newSettings.save();

    this.guildSettings.set(guild.id, data);

    const fetchedGuild = await this.mongo.client.shard.fetchGuild(guild.id);
    Logger.log(`Default settings saved for guild "${fetchedGuild.name}" (${fetchedGuild.id}).`);

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
    return newCommand.save();
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

    await Suggestion.deleteMany({
      $or: [
        { guildID: guild.id },
        { guildID: guild.guildID }
      ]
    });

    await Command.deleteMany({
      $or: [
        { guildID: guild.id },
        { guildID: guild.guildID }
      ]
    });

    await Blacklist.deleteMany({
      $or: [
        { guildID: guild.id },
        { guildID: guild.guildID }
      ]
    });

    this.guildSettings.delete(guild.id);
    Logger.log(`Blacklist data deleted for guild ${guild.name || guild.guildName} (${guild.id || guild.guildID})`);
    Logger.log(`${this.mongo.client.user.username} has left a guild: ${guild.name || guild.guildName } (${guild.id || guild.guildID})`);
  }

  /**
     * Get all documents in the blacklists collection.
     * @returns {Promise}
     */
  async getAllBlacklists() {
    return Blacklist.find({});
  }
};
