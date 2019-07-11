const mongoose = require('mongoose');
const { Blacklist } = require('../models');

module.exports = class BlacklistsHelpers {
  constructor(client) {
    this.client = client;
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
    const data = await newBlacklist.save();

    await this.client.shard.broadcastEval(`
      const issued = this.users.get('${data.userID}');
      const issuer = this.users.get('${data.issuerID}');
      if (!issued || !issuer) false;

      this.logger.log('"' + issuer.tag + '" (' + issuer.id + ') has issued a ' + '${data.scope}' === 'global' ? 
        'global blacklist' : 'blacklist' + 'to the user "' + issued.tag + '" (' + issued.id + ').');
    `);

    // if (user.scope === 'global') {
    //   this.client.logger.log(`"${data.issuerUsername}" (${data.issuerID}) has issued a global blacklist for the user "${data.userID}".`);
    // } else {
    //   this.client.logger.log(`"${data.issuerUsername}" (${data.issuerID}) has issued a blacklist for the user "${data.userID}".`);
    // }
    return data;
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

    const updated = await guildMemberBlacklist.updateOne(data);

    await this.client.shard.broadcastEval(`
      const issued = this.users.get('${guildMemberBlacklist.userID}');
      const issuer = this.users.get('${guildMemberBlacklist.issuerID}');

      this.logger.log('"' + issuer.tag + '" (' + issuer.id + ') has issued a ' + '${guildMemberBlacklist.scope}' === 'global' ? 
        'global unblacklist' : 'unblacklist' + 'on the user "' + issued.tag + '" (' + issued.id + ').');
    `);
    // if (scope === 'global') {
    //   this.client.logger.log(`"${issuerUsername}" (${issuerID}) has issued a global unblacklist for the user "${userID}".`);
    // } else {
    //   this.client.logger.log(`"${issuerUsername}" (${issuerID}) has issued an unblacklist for the user "${userID}".`);
    // }

    return updated;
  }
};
