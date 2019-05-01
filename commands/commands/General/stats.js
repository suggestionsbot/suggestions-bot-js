const { RichEmbed, version: discordVersion } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
const { version } = require('../../../package.json');
require('moment-duration-format');

module.exports = class StatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      category: 'General',
      description: 'View bot statistics.',
      botPermissions: ['EMBED_LINKS'],
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args) {

    const { embedColor } = this.client.config;

    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const shardID = this.client.shard.id;

    let guildSize,
      userSize,
      shardUptime;

    const promises = [
      this.client.shard.fetchClientValues('guilds.size'),
      this.client.shard.broadcastEval('this.guilds.reduce((prev, guild) => prev + guild.memberCount, 0)'),
      this.client.shard.fetchClientValues('uptime')
    ];

    try {
      const resolved = await Promise.all(promises);

      guildSize = (resolved[0].reduce((prev, count) => prev + count, 0)).toLocaleString();
      userSize = (resolved[1].reduce((prev, count) => prev + count, 0)).toLocaleString();
      shardUptime = moment.duration(resolved[2][this.client.shard.id]).format(' D [days], H [hrs], m [mins], s [secs]');
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    const embed = new RichEmbed()
      .setAuthor(`${this.client.user.username} v${version}`, this.client.user.avatarURL)
      .setColor(embedColor)
      .addField('Guilds', guildSize, true)
      .addField('Users', userSize, true)
      .addField('Uptime', shardUptime, true)
      .addField('Memory', `${Math.round(memUsage)} MB`, true)
      .addField('Discord.js', `v${discordVersion}`, true)
      .addField('Node', `${process.version}`, true)
      .setFooter(`Shard ${shardID === 0 ? 1 : shardID}`)
      .setTimestamp();

    return message.channel.send(embed);
  }
};
