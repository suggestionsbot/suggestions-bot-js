const mongoose = require('mongoose');
const { oneLine } = require('common-tags');
const { Suggestion } = require('../models');

module.exports = class SuggestionsHelpers {
  constructor(client) {
    this.client = client;
  }

  /**
     * Get a guild suggestion from the database.
     *
     * @param {Object} guild - The guild object.
     * @param {String} sID - The unique suggestion ID.
     */
  async getGuildSuggestion(guild, sID) {
    const data = await Suggestion
      .findOne({ $and: [{ guildID: guild.id || guild, sID: sID }] });

    return data;
  }

  /**
     * Get a suggestion globally from the database (for administrative use).
     *
     * @param {String} sID - The unique suggestion ID.
     */
  async getGlobalSuggestion(sID) {
    const data = await Suggestion
      .findOne({ sID: sID });

    return data;
  }

  /**
     * Get all the suggestions of a specific guild from the database.
     *
     * @param {Object} guild - The guild object.
     */
  async getGuildSuggestions(guild) {
    const data = await Suggestion
      .find({ guildID: guild.id });

    return data;
  }

  /**
     * Get a specific guild member's suggestions from the database.
     *
     * @param {Object} guild - The guild object.
     * @param {Object} member - The member object.
     */
  async getGuildMemberSuggestions(guild, member) {
    const data = await Suggestion
      .find({ $and: [{ guildID: guild.id, userID: member.id }] })
      .sort({ time: -1 });

    return data;
  }

  /**
     * Get a specific user's global suggestions data from the database.
     *
     * @param {Object} user - The user object.
     */
  async getUserGlobalSuggestions(user) {
    const data = await Suggestion
      .find({ userID: user.id })
      .sort({ _id: -1 });

    return data;
  }

  /**
     * Check if a guild requirees a response or not when rejecting suggestions.
     *
     * @param {Object} guild - The guild object.
     */
  async isResponseRequired(guild) {
    const { responseRequired } = await this.client.settings.getGuild(guild);

    if (responseRequired) return true;
    else return false;
  }

  /**
     * Create a new guild suggestion in the database.
     *
     * @param {Object} suggestion - The suggestion object.
     */
  async submitGuildSuggestion(suggestion) {
    const defaults = { _id: mongoose.Types.ObjectId() };
    const merged = Object.assign(defaults, suggestion);

    const newSuggestion = await new Suggestion(merged);
    const data = await newSuggestion.save();
    const { userID, guildID } = data;

    const fetchedUser = await this.client.shard.fetchUser(userID);
    const fetchedGuild = await this.client.shard.fetchGuild(guildID);

    this.client.logger.log(oneLine`
      New suggestion submitted by "${fetchedUser.tag}" (${fetchedUser.id}) in the guild
      "${fetchedGuild.name}" (${fetchedGuild.id}).
    `);

    return data;
  }

  /**
     * Approve or reject a guild suggestion in the database.
     *
     * @param {Object} suggestion - The suggestion object.
     */
  async handleGuildSuggestion({ query, data }) {

    const guildSuggestion = await Suggestion.findOne({ $and: query });
    const { sID, guildID } = guildSuggestion;

    const updated = await guildSuggestion.updateOne(data);

    const fetchedGuild = await this.client.shard.fetchGuild(guildID);
    this.client.logger.log(oneLine`
      sID "${sID}" has been ${data.status} in the guild "${fetchedGuild.name}" (${fetchedGuild.id}) 
      ${data.statusReply ? `with the response ${data.statusReply}` : ''}.
    `);

    return updated;
  }

  /**
     * Add a new note to a guild suggestion in the database.
     *
     * @param {Object} suggestion - The suggestion object.
     */
  async addGuildSuggestionNote({ query, data }) {
    // let { query, note } = suggestion;
    const { staffMemberID } = data;
    const guildSuggestion = await Suggestion.findOne({ $and: query });
    const { guildID, sID } = guildSuggestion;
    const updatedData = { notes: data };

    const fetchedUser = await this.client.shard.fetchUser(staffMemberID)
    const fetchedGuild = await this.client.shard.fetchGuild(guildID);

    const updated = await guildSuggestion.updateOne({ $push: updatedData });
    this.client.logger.log(oneLine`
      sID "${sID}" had a note added by "${fetchedUser.tag}" (${fetchedUser.id}) in the guild 
      "${fetchedGuild.name}" (${fetchedGuild.id}).
    `);

    return updated;
  }

  /**
   * Update a suggestion with various other properties.
   *
   * @param {Object} suggestion - The suggestion object.
   */
  async updateGuildSuggestion({ query, data }) {
    const guildSuggestion = await Suggestion.findOne({ $and: query });
    const updated = await guildSuggestion.updateOne(data);
    this.client.logger.log(`${guildSuggestion.sID} has been updated.`);
    return updated;
  }
};
