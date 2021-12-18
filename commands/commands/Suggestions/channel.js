const Command = require('../../Command');
const { validateChannel } = require('../../../utils/functions');

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

    const validation = await validateChannel(message.guild.channels, settings.suggestionsChannel);
    if (!validation) return message.channel.send('There is no suggestions channel set or I can\'t find the default one.');

    return message.channel.send(`Current suggestions channel: ${validation.toString()}`);
  }
};
