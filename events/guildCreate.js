const { MessageEmbed } = require('discord.js-light');

const Logger = require('../utils/logger');
const { displayTimestamp } = require('../utils/functions');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    const { guildStatusColors: { created } } = this.client.config;

    const guildOwner = await this.client.users.fetch(guild.ownerID)
      .catch(e => Logger.error('GUILD_CREATE', e));

    const newServer = new MessageEmbed()
      .setTitle('Added')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild.name}\`
        **Members:** \`${guild.memberCount}\`
        **Created:** ${displayTimestamp(guild.createdAt, 'R')}
        **Owner:** ${guildOwner} \`[${guildOwner?.tag}]\`
      `)
      .setColor(created)
      .setTimestamp();

    const logs = this.client.production ? '602332466476482616' : '498627833233539086';
    await this.client.channels.forge(logs).send(newServer).catch(e => Logger.error('GUILD_CREATE', e));
  }
};
