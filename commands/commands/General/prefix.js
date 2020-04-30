const Command = require('../../Command');

module.exports = class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      category: 'General',
      description: 'View the current bot prefix in this guild or the global prefix in DMs.',
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args, settings) {
    return message.channel.send(`Current prefix: \`${message.guild ? settings.prefix : this.client.config.prefix}\``);
  }
};
