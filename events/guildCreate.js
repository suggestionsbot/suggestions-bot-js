const { MessageEmbed, TextChannel, Guild } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    const { guildStatusColors: { created } } = this.client.config;
    let guildOwner;

    try {
      guildOwner = await this.client.shard.fetchUser(guild.ownerID);
    } catch (error) {
      this.client.logger.error(error.stack);
    }

    const newServer = new MessageEmbed()
      .setTitle('Added')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild.name}\`
        **Members:** \`${guild.members.cache.size}\`
        **Created:** \`${moment(guild.createdAt).fromNow()}\`
        **Owner:** <@${guildOwner.id}> \`[${guildOwner.tag}]\`
      `)
      .setColor(created)
      .setTimestamp();

    const logs = process.env.NODE_ENV === 'production' ? '602332466476482616' : '498627833233539086';
    await this.client.channels.forge(logs).send(newServer).catch(e => this.client.logger.error(e));
  }
};
