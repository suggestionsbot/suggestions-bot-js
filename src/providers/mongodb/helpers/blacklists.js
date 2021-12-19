const mongoose = require('mongoose');

const { Blacklist } = require('../models');

module.exports = class BlacklistsHelpers {
  constructor(mongo) {
    this.mongo = mongo;
  }

  /**
   * Get the length of all blacklists.
   */
  async getTotalBlacklists() {
    const data = await Blacklist.find({});
    return data.length;
  }

  /**
     * Get any blacklists in the database from a guild.
     *
     * @param {Object} guild - The guild object.
     */
  async getGuildBlacklists(guild) {
    const data = await Blacklist
      .find({ $and: [
        { guildID: guild.id },
        { scope: 'guild' }
      ] });

    for (const bl of data) if (!bl.scope) bl.scope = 'guild';

    return data;
  }

  /**
     * Get all global blacklists from the database.
     */
  async getGlobalBlacklists() {
    const data = await Blacklist.find({ scope: 'global' });

    return data;
  }

  /**
     * Get a guild-specific blacklisted user if present in the database.
     * @param {Object} user - The user object.
     * @param {Object} guild - The guild object.
     */
  async checkGuildBlacklist(user, guild) {
    const data = await Blacklist.findOne({
      $and: [
        { guildID: guild.id },
        { userID: user.id },
        { status: true }
      ]
    });

    return data;
  }

  /**
   * Get a recent guild-specific blacklisted user if present in the database.
   * @param {Object} user - The user object.
   * @param {Object} guild - The guild object.
   * @param {Boolean} global - If the blacklist search should be global or not
   */
  async checkRecentBlacklist(user, guild, global = false) {
    let data;

    if (global) {
      data = await Blacklist
        .findOne({
          $and: [
            { guildID: guild.id },
            { userID: user.id },
            { scope: 'global' }
          ]
        })
        .sort({ case: -1 });
    } else {
      data = await Blacklist
        .findOne({
          $and: [
            { guildID: guild.id },
            { userID: user.id }
          ]
        })
        .sort({ case: -1 });
    }

    return data;
  }

  /**
     * Get a globally blacklist user if present in the database.
     *
     * @param {Object} user - The user object.
     */
  async checkGlobalBlacklist(user) {
    const data = await Blacklist.findOne({
      $and: [
        { userID: user.id },
        { scope: 'global' },
        { status: true }
      ]
    });

    return data;
  }

  /**
     * Add a new user blacklist in the database.
     *
     * @param {Object} user - The user object.
     */
  async addUserBlacklist(user) {
    const defaults = { _id: mongoose.Types.ObjectId() };
    const merged = Object.assign(defaults, user);

    const newBlacklist = await new Blacklist(merged);
    return newBlacklist.save();
  }
  /**
     * Update a blacklisted user's status to false in the database.
     *
     * @param {Object} user - The user object.
     */
  async removeUserBlacklist(user) {
    const { query, data } = user;
    const guildMemberBlacklist = await Blacklist
      .findOne({ $and: query })
      .sort({ case: -1 });

    return guildMemberBlacklist.updateOne(data);
  }
};
