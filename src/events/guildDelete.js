const { MessageEmbed } = require('discord.js-light');

const Event = require('../structures/Event');
const Logger = require('../utils/logger');
const { displayTimestamp } = require('../utils/functions');

module.exports = class extends Event {
  constructor(client, name) {
    super(client, name);
  }

  async run(guild) {
    const { guildStatusColors: { deleted }, serverLogs } = this.client.config;

    const oldServer = new MessageEmbed()
      .setTitle('Removed')
      .setDescription(`
        **ID:** \`${guild.id}\`
        **Name:** \`${guild}\`
        **Members:** \`${guild.memberCount}\`
        **Joined:** ${displayTimestamp(guild.me.joinedAt, 'R')}
        **Owner:** ${this.client.users.forge(guild.ownerId)}
      `)
      .setColor(deleted)
      .setTimestamp();

    try {
      await this.client.mongodb.helpers.settings.deleteGuild(guild);
      await this.client.channels.forge(serverLogs).send({ embeds: [oldServer] }).catch(e => Logger.error('GUILD_DELETE', e));
    } catch (err) {
      Logger.error('GUILD_DELETE', err.stack);
    }
  }
};
