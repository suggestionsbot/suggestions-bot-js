const Command = require('../../Command');
const { noBotPerms } = require('../../../utils/errors');

module.exports = class SetPrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setprefix',
      category: 'Admin',
      description: 'Set a new prefix for the bot.',
      usage: 'setprefix <prefix>',
      adminOnly: true,
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    await message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    await this.client.settings.updateGuild(message.guild, { prefix: args[0] }).catch(err => {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error setting the bot prefix: **${err.message}**.`);
    });

    return await message.channel.send(`Bot prefix has been changed to: \`${args[0]}\``);
  }
};
