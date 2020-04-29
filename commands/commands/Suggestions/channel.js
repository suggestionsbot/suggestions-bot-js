const Command = require('../../Command');

module.exports = class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'channel',
      category: 'Suggestions',
      description: 'View the current suggestions in this guild.',
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    await message.delete().catch(O_o => {});

    const validation = message.guild.channels.cache.find(c => c.name === settings.suggestionsChannel) ||
            message.guild.channels.cache.find(c => c.toString() === settings.suggestionsChannel) ||
            message.guild.channels.cache.get(settings.suggestionsChannel);

    if (!validation) return message.channel.send('There is no suggestions channel set or I can\'t find the default one.');

    return message.channel.send(`Current suggestions channel: ${validation.toString()}`);
  }
};
