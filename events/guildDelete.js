const { MessageEmbed, Guild, TextChannel } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {

    const { guildStatusColors: { deleted } } = this.client.config;

    let guildOwner;

    try {
      guildOwner = await this.client.shard.fetchUser(guild.ownerID);
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
        **Owner:** <@${guildOwner.id}> \`[${guildOwner.tag}]\`
      `)
      .setColor(deleted)
      .setTimestamp();

    try {
      await this.client.settings.deleteGuild(guild);
      const logs = process.env.NODE_ENV === 'production' ? '602332466476482616' : '498627833233539086';
      await this.client.channels.forge(logs).send(oldServer).catch(e => this.client.logger.error(e));
    } catch (err) {
      this.client.logger.error(err.stack);
    }
  }
};
