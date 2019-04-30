const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class SetTimezoneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'settimezone',
      category: 'Admin',
      description: 'Choose a timezone for submitting and viewing suggestions.',
      ownerOnly: true,
      botPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
      usage: 'settimezone <timezone>'
    });
  }

  async run(message, args, settings) {

    await message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsagE(message.channel, this, settings);


    return;
  }
};
