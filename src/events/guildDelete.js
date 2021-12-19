const { MessageEmbed } = require('discord.js-light');

const Event = require('../structures/Event');
const Logger = require('../utils/logger');
const { displayTimestamp } = require('../utils/functions');

module.exports = class extends Event {
  constructor(client, name) {
    super(client, name);
  }

  async run(guild) {

    const { guildStatusColors: { deleted } } = this.client.config;

    const guildOwner = await this.client.users.fetch(guild.ownerID, false, true)
      .catch(e => Logger.error('GUILD_DELETE', e));

    const oldServer = new MessageEmbed()
      .setTitle('Removed')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild}\`
        **Members:** \`${guild.memberCount}\`
        **Joined:** ${displayTimestamp(guild.me.joinedAt, 'R')}
        **Owner:** ${this.client.users.forge(guild.ownerID)} \`[${guildOwner?.tag ?? 'N/A'}]\`
      `)
      .setColor(deleted)
      .setTimestamp();

    try {
      await this.client.settings.deleteGuild(guild);
      const logs = this.client.production ? '602332466476482616' : '498627833233539086';
      await this.client.channels.forge(logs).send(oldServer).catch(e => Logger.error('GUILD_DELETE', e));
    } catch (err) {
      Logger.error('GUILD_DELETE', err.stack);
    }
  }
};
