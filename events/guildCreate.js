const { MessageEmbed } = require('discord.js-light');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    const { guildStatusColors: { created } } = this.client.config;

    const guildOwner = await this.client.users.fetch(guild.ownerID)
      .catch(e => this.client.logger.error(e));

    const newServer = new MessageEmbed()
      .setTitle('Added')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild.name}\`
        **Members:** \`${guild.memberCount}\`
        **Created:** \`${moment(guild.createdAt).fromNow()}\`
        **Owner:** ${guildOwner} \`[${guildOwner?.tag}]\`
      `)
      .setColor(created)
      .setTimestamp();

    const logs = process.env.NODE_ENV === 'production' ? '602332466476482616' : '498627833233539086';
    await this.client.channels.forge(logs).send(newServer).catch(e => this.client.logger.error(e));
  }
};
