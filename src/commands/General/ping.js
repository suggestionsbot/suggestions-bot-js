const { stripIndents } = require('common-tags');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { buildErrorEmbed } = require('../../utils/functions');

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      category: 'General',
      description: 'View the latency of the bot and API.',
      usage: 'ping',
      aliases: ['pong'],
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args) {
    try {
      const msg = await message.channel.send('🏓 Ping!');
      const [shard, cluster] = [message.guild ? message.guild.shardID : 0, this.client.shard.id];
      return msg.edit(stripIndents`
        Pong!
        **Latency:** \`${msg.createdTimestamp - message.createdTimestamp}ms\`.
        **Cluster ${cluster} - Shard ${shard}:** \`${Math.round(this.client.ws.ping)}ms\`.
      `);
    } catch (e) {
      Logger.errorCmd(this, e);
      return message.channel.send(buildErrorEmbed(e));
    }
  }
};
