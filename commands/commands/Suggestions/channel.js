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

    const isDefault = settings.suggestionsChannel === 'suggestions';
    const validation = settings.suggestionsChannel && (
      settings.suggestionsChannel === 'suggestions'
        ? await message.guild.channels.fetch({ cache: false })
          .then(res => res.find(c => c.name === 'suggestions'))
        : await message.guild.channels.fetch(settings.suggestionsChannel)
    );

    if (!validation) return message.channel.send('There is no suggestions channel set or I can\'t find the default one.');

    return message.channel.send(`Current suggestions channel: ${validation.toString()}${isDefault ? ' *(config default)*' : ''}`);
  }
};
