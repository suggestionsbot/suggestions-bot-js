const { RichEmbed } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {

    const { guildStatusColors: { deleted } } = this.client.config;

    const oldServer = new RichEmbed()
      .setTitle('Removed')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild}\`
        **Members:** \`${guild.members.size}\`
        **Joined:** \`${moment(guild.me.joinedAt).fromNow()}\`
        **Owner:** ${guild.owner} \`[${guild.owner.user.tag}]\`
      `)
      .setColor(deleted)
      .setTimestamp();

    try {
      await this.client.settings.deleteGuild(guild);
    } catch (err) {
      this.client.logger.error(err.stack);
    }

    switch (process.env.NODE_ENV) {
    // 498627833233539086 = #server logs / Nerd Cave Testing
    case 'development': {
      this.client.shard.broadcastEval(`this.channels.get("498627833233539086").send({ embed: ${JSON.stringify(oldServer)} });`)
        .then(async channelArr => {
          const found = channelArr.find(c => c);
          if (!found) return this.client.logger.error('Could not find server logs channel');
        })
        .catch(err => this.client.logger.error(err));
      break;
    }
    // 602332466476482616 = #server logs / Nerd Cave Development
    default: {
      this.client.shard.broadcastEval(`this.channels.get("602332466476482616").send({ embed: ${JSON.stringify(oldServer)} });`)
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
