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
    return Suggestion
      .findOne({ $and: [{ guildID: guild.id || guild, sID: sID }] });
  }

  /**
     * Get a suggestion globally from the database (for administrative use).
     *
     * @param {String} sID - The unique suggestion ID.
     */
  async getGlobalSuggestion(sID) {
    return Suggestion
      .findOne({ sID: sID });
  }

  /**
     * Get all the suggestions of a specific guild from the database.
     *
     * @param {Object} guild - The guild object.
     */
  async getGuildSuggestions(guild) {
    return Suggestion
      .find({ guildID: guild.id });
  }

  /**
     * Get a specific guild member's suggestions from the database.
     *
     * @param {Object} guild - The guild object.
     * @param {Object} member - The member object.
     */
  async getGuildMemberSuggestions(guild, member) {
    return Suggestion
      .find({ $and: [{ guildID: guild.id, userID: member.id }] })
      .sort({ time: -1 });
  }

  /**
     * Get a specific user's global suggestions data from the database.
     *
     * @param {Object} user - The user object.
     */
  async getUserGlobalSuggestions(user) {
    return Suggestion
      .find({ userID: user.id })
      .sort({ _id: -1 });
  }

  /**
     * Check if a guild requirees a response or not when rejecting suggestions.
     *
     * @param {Object} guild - The guild object.
     */
  async isResponseRequired(guild) {
    const { responseRequired } = await this.client.settings.getGuild(guild);

    return !!responseRequired;
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
    return newSuggestion.save();
  }

  /**
     * Approve or reject a guild suggestion in the database.
     *
     * @param {Object} suggestion - The suggestion object.
     */
  async handleGuildSuggestion({ query, data }) {

    const guildSuggestion = await Suggestion.findOne({ $and: query });

    return guildSuggestion.updateOne(data);
  }

  /**
     * Add a new note to a guild suggestion in the database.
     *
     * @param {Object} suggestion - The suggestion object.
     */
  async addGuildSuggestionNote({ query, data }) {
    // let { query, note } = suggestion;
    const guildSuggestion = await Suggestion.findOne({ $and: query });

    return guildSuggestion.updateOne({ $push: updatedData });
  }

  /**
   * Update a suggestion with various other properties.
   *
   * @param {Object} suggestion - The suggestion object.
   */
  async updateGuildSuggestion({ query, data }) {
    const guildSuggestion = await Suggestion.findOne({ $and: query });
    return guildSuggestion.updateOne(data);
  }
};
