const moment = require('moment');
const fetch = require('node-fetch');
require('moment-duration-format');

const Router = require('../structures/Router');

module.exports = class ClientRouter extends Router {

  get services() {
    return {
      '/client'       : 'clientStats',
      '/guilds/:guildID': 'guildStats',
      '/guilds/:guildID/users/:userID': 'guildUser'
    };
  }

  clientStats(req, res, next) {
    res.json({
      users: this.client.users.size,
      guilds: this.client.guilds.size,
      channels: this.client.channels.size,
      uptime: moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]'),
      latency: this.client.ping.toFixed(4),
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      invite: this.client.config.invite,
      ...this.client.appInfo
    });
  }

  guildStats(req, res, next) {
    const { guildID } = req.params;
    const guild = this.client.guilds.get(guildID);
    if (!guild || !guild.available) return res.status(400).json({ message: 'This guild does not exist or isn\'t available!' });

    res.json({
      timestamp: Date.now(),
      ...guild
    });
  }

  async guildUser(req, res, next) {
    const { guildID, userID } = req.params;
    const guild = this.client.guilds.get(guildID);
    const member = guild.members.get(userID);
    if (!guild || !guild.available) return res.status(400).json({ message: 'This guild does not exist or isn\'t available!' });
    if (!member) return res.status(400).json({ message: 'This user does not exist in the guild!' });

    let lastSuggestion = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/recent`)
      .then(resp => resp.json());
    let suggestionsCount = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/count`)
      .then(resp => resp.json());
    let suggestionsACount = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/approved/count`)
      .then(resp => resp.json());
    let suggestionsRCount = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/rejected/count`)
      .then(resp => resp.json());

    if (lastSuggestion.code === 17) lastSuggestion = null;
    if (suggestionsCount.code === 17) suggestionsCount = null;
    if (suggestionsACount.code === 19) suggestionsACount = null;
    if (suggestionsRCount.code === 19) suggestionsRCount = null;

    const data = {
      userID: member.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      fullName: member.user.tag,
      roles: member.roles,
      roleCount: member.roles.size,
      permissions: member.permissions.bitfield,
      suggestions: {
        total: suggestionsCount ? suggestionsCount.count : suggestionsCount,
        approved: suggestionsACount ? suggestionsACount.count : suggestionsACount,
        rejected: suggestionsRCount ? suggestionsRCount.count : suggestionsRCount,
        lastSuggestion
      }
    };

    res.json({
      timestamp: Date.now(),
      ...data
    });
  }
};
