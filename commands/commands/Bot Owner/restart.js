const Command = require('../../Command');

module.exports = class RestartCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      category: 'Bot Owner',
      description: 'Restart a single cluster or all clusters.',
      usage: 'restart [clusterID]',
      supportOnly: true,
      guildOnly: false
    });
  }

  async run(message, args) {
    try {
      if (args[0] && isNaN(args[0])) return message.channel.send('Please provide a cluster ID!');
      if (args[0]) await this.client.shard.restart(+args[0]);
      else await this.client.shard.respawnAll();

      await message.channel.send({
        embed: {
          color: this.client.config.embedColor,
          description: `Restarted ${args[0] ? `cluster **${args[0]}**` : 'all clusters'}.`,
          footer: { text: `ID: ${message.author.id}` },
          timestamp: Date.now()
        }
      });
    } catch (e) {
      this.client.logger.error(e);
      return message.channel.send(`An error has occurred: **${e.message}**`);
    }
  }
};