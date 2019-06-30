const { RichEmbed } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    const { guildStatusColors: { created } } = this.client.config;

    const gOwner = guild.owner;

    const newServer = new RichEmbed()
      .setTitle('Added')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild.name}\`
        **Members:** \`${guild.members.size}\`
        **Created:** \`${moment(guild.createdAt).fromNow()}\`
        **Owner:** ${guild.owner} \`[${guild.owner.user.tag}]\`
      `)
      .setColor(created)
      .setTimestamp();

    const newSettings = { guildID: guild.id };

    try {
      await this.client.settings.createGuild(newSettings);
    } catch (err) {
      return this.client.logger.error(err.stack);
    }

    switch (process.env.NODE_ENV) {
      // 345753533141876737 = Nerd Cave Testing
      case 'development': {
        const logGuild = this.client.guilds.get('345753533141876737');
        const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
        logChannel.send(newServer);
        break;
      }
      // 480231440932667393 = Nerd Cave Development
      default: {
        const logGuild = this.client.guilds.get('480231440932667393');
        const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
        logChannel.send(newServer);
        break;
      }
    }
  }
};
