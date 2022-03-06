const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { buildErrorEmbed } = require('../../utils/functions');

module.exports = class RestartCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      category: 'Support',
      description: 'Restart a single cluster or all clusters.',
      usage: 'restart [clusterID]',
      supportOnly: true,
      guildOnly: false
    });
  }

  async run(message, args) {
    try {
      const clusters = Array.from(Array(this.client.shard.clusterCount).keys());
      if (args[0] && isNaN(args[0])) return message.channel.send('Please provide a valid number!');
      if (args[0] && !clusters.includes(+args[0])) return message.channel.send(`Please provide a valid cluster ID: \`${clusters.join(', ')}\` .`);
      if (args[0]) await this.client.shard.restart(+args[0]);
      else await this.client.shard.respawnAll();

      await message.channel.send({
        embed: {
          color: this.client.config.colors.main,
          description: `Restarting ${args[0] ? `cluster **${args[0]}**` : 'all clusters'}.`,
          footer: { text: `ID: ${message.author.id}` },
          timestamp: Date.now()
        }
      });
    } catch (e) {
      Logger.errorCmd(this, e);
      return message.channel.send(buildErrorEmbed(e));
    }
  }
};
