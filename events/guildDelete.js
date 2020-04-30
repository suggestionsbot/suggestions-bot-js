const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {

    const { guildStatusColors: { deleted } } = this.client.config;

    let guildOwner;

    try {
      guildOwner = await this.client.users.fetch(guild.ownerID);
    } catch (error) {
      this.client.logger.error(error.stack);
    }

    const oldServer = new MessageEmbed()
      .setTitle('Removed')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild}\`
        **Members:** \`${guild.members.cache.size}\`
        **Joined:** \`${moment(this.client.user.joinedAt).fromNow()}\`
        **Owner:** ${guildOwner} \`[${guildOwner.tag}]\`
      `)
      .setColor(deleted)
      .setTimestamp();

    try {
      await this.client.settings.deleteGuild(guild);
    } catch (err) {
      this.client.logger.error(err.stack);
    }

    switch (process.env.NODE_ENV) {
    // 498627833233539086 = #server_logs / Nerd Cave Testing
    case 'development': {
      this.client.shard.broadcastEval(`this.channels.cache.get("498627833233539086").send({ embed: ${JSON.stringify(oldServer)} });`)
        .then(async channelArr => {
          const found = channelArr.find(c => c);
          if (!found) return this.client.logger.error('Could not find server logs channel');
        })
        .catch(err => this.client.logger.error(err));
      break;
    }
    // 602332466476482616 = #server_logs / Suggestions
    default: {
      this.client.shard.broadcastEval(`this.channels.cache.get("602332466476482616").send({ embed: ${JSON.stringify(oldServer)} });`)
        .then(async channelArr => {
          const found = channelArr.find(c => c);
          if (!found) return this.client.logger.error('Could not find server logs channel');
        })
        .catch(err => this.client.logger.error(err));
      break;
    }
    }
  }
};
