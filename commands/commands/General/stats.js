const { MessageEmbed, version: discordVersion } = require('discord.js-light');

const Command = require('../../Command');
const Logger = require('../../../utils/logger');
const { version } = require('../../../package.json');
const { displayUptime } = require('../../../utils/functions');

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
    let guildSize,
      userSize,
      memUsage;

    const promises = [
      this.client.shard.fetchClientValues('guilds.cache.size'),
      this.client.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)'),
      this.client.shard.broadcastEval('(process.memoryUsage().heapUsed / 1024 / 1024)')
    ];


    try {
      const resolved = await Promise.all(promises);

      guildSize = (resolved[0].filter(Boolean).reduce((prev, count) => prev + count, 0)).toLocaleString();
      userSize = (resolved[1].filter(Boolean).reduce((prev, count) => prev + count, 0)).toLocaleString();
      memUsage = resolved[2].filter(Boolean).reduce((prev, count) => prev + count, 0).toFixed(2).toLocaleString();
    } catch (err) {
      Logger.errorCmd(this, err);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    const embed = new MessageEmbed()
      .setAuthor(`${this.client.user.username} v${version}`, this.client.user.avatarURL())
      .setColor(this.client.config.embedColor)
      .addField('Guilds', guildSize, true)
      .addField('Users', userSize, true)
      .addField('Uptime', displayUptime(this.client.uptime), true)
      .addField('Memory', `${Math.round(memUsage)} MB`, true)
      .addField('Discord.js', `v${discordVersion}`, true)
      .addField('Node', `${process.version}`, true)
      .setFooter(`PID ${process.pid} | Cluster ${this.client.shard.id} | Shard ${message.guild?.shardID ?? 0}`)
      .setTimestamp();

    return message.channel.send(embed);
  }
};
