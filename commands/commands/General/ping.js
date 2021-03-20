const { oneLine } = require('common-tags');
const Command = require('../../Command');

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
      return msg.edit(oneLine`
        Pong!
        **Latency:** \`${msg.createdTimestamp - message.createdTimestamp}ms\`.
        **Shard ${shard} - Cluster ${cluster}:** \`${Math.round(this.client.ws.ping)}ms\`.
      `);
    } catch (e) {
      this.client.logger.error(e);
      return message.channel.send(`Error running this command: **${e.message}**.`);
    }
  }
};
