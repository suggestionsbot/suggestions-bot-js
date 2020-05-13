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
      const ping = await this.client.shard.fetchClientValues('ws.ping');

      const msg = await message.channel.send('🏓 Ping!');
      return msg.edit(oneLine`
        Pong! 
        Latency is \`${msg.createdTimestamp - message.createdTimestamp}ms\`.
        API Latency is \`${Math.round(ping[message.guild ? message.guild.shardID : this.client.shard.ids[0]])}ms\`.
      `);
    } catch (e) {
      this.client.logger.error(e);
      return message.channel.send(`Error running this command: **${e.message}**.`);
    }
  }
};
