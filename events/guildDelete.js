const { MessageEmbed } = require('discord.js-light');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {

    const { guildStatusColors: { deleted } } = this.client.config;

    const guildOwner = await this.client.users.fetch(guild.ownerID, false, true)
      .catch(e => this.client.logger.error(e));

    const oldServer = new MessageEmbed()
      .setTitle('Removed')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild}\`
        **Members:** \`${guild.memberCount}\`
        **Joined:** \`${moment(this.client.user.joinedAt).fromNow()}\`
        **Owner:** ${guildOwner?.toString() ?? `<@${guild.ownerID}>`} \`[${guildOwner?.tag ?? 'N/A'}]\`
      `)
      .setColor(deleted)
      .setTimestamp();

    try {
      await this.client.settings.deleteGuild(guild);
      const logs = this.client.production ? '602332466476482616' : '498627833233539086';
      await this.client.channels.forge(logs).send(oldServer).catch(e => this.client.logger.error(e));
    } catch (err) {
      this.client.logger.error(err.stack);
    }
  }
};
