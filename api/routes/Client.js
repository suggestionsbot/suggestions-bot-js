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

  async clientStats(req, res, next) {
    let userSize,
      guildSize,
      shardUptime,
      shardLatency;

    const promises = [
      this.client.shard.fetchClientValues('guilds.size'),
      this.client.shard.fetchClientValues('users.size'),
      this.client.shard.fetchClientValues('uptime'),
      this.client.shard.fetchClientValues('ping')
    ];

    try {
      const resolved = await Promise.all(promises);

      guildSize = resolved[0];
      userSize = resolved[1];
      shardUptime = resolved[2];
      shardLatency = resolved[3];
    } catch (err) {
      this.client.logger.error(err);
    }

    res.json({
      users: userSize,
      guilds: guildSize,
      uptime: shardUptime,
      latency: shardLatency,
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      invite: this.client.config.invite,
      ...this.client.appInfo
    });
  }

  async guildStats(req, res, next) {
    const { guildID } = req.params;

    let guild;
    try {
      guild = await this.client.shard.broadcastEval(`this.guilds.get('${guildID}')`);
      if (!guild[0] || !guild[0].available) return res.status(200).json({ message: 'This guild does not exist or isn\'t available!' });
    } catch (err) {
      this.client.logger.error(err);
    }

    res.json({
      timestamp: Date.now(),
      ...guild[0]
    });
  }

  async guildUser(req, res, next) {
    const { guildID, userID } = req.params;

    let guild,
      member,
      lastSuggestion,
      suggestionsCount,
      suggestionsACount,
      suggestionsRCount;

    try {
      // const guild = this.client.guilds.get(guildID);
      // const member = guild.members.get(userID);
      guild = await this.client.shard.broadcastEval(`this.guilds.get('${guildID}')`);
      member = await this.client.shard.broadcastEval(`this.guilds.get('${guildID}').members.get('${userID}')`);

      if (!guild[0] || !guild[0].available) return res.status(400).json({ message: 'This guild does not exist or isn\'t available!' });
      if (!member[0]) return res.status(400).json({ message: 'This user does not exist in the guild!' });

      // this.client.logger.log(member[0]);

      guild = guild[0];
      member = member[0];

      // lastSuggestion = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/recent`)
      //   .then(resp => resp.json());
      // suggestionsCount = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/count`)
      //   .then(resp => resp.json());
      // suggestionsACount = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/approved/count`)
      //   .then(resp => resp.json());
      // suggestionsRCount = await fetch(`http://localhost:3000/v1/guilds/${guildID}/users/${userID}/rejected/count`)
      //   .then(resp => resp.json());

      // if (lastSuggestion.code === 17) lastSuggestion = null;
      // if (suggestionsCount.code === 17) suggestionsCount = null;
      // if (suggestionsACount.code === 19) suggestionsACount = null;
      // if (suggestionsRCount.code === 19) suggestionsRCount = null;
    } catch (err) {
      this.client.logger.error(err);
    }
    const data = {
      userID: member.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      fullName: member.user.tag,
      roles: member._roles,
      roleCount: member._roles.length
      // permissions: member.permissions.bitfield
      // suggestions: {
      //   total: suggestionsCount ? suggestionsCount.count : suggestionsCount,
      //   approved: suggestionsACount ? suggestionsACount.count : suggestionsACount,
      //   rejected: suggestionsRCount ? suggestionsRCount.count : suggestionsRCount,
      //   lastSuggestion
      // }
    };

    res.json({
      timestamp: Date.now(),
      ...data
    });
  }
};
