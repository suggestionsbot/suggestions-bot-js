const Command = require('../../Command');

module.exports = class SetChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setchannel',
      category: 'Admin',
      description: 'Set a new suggestions channel.',
      usage: 'setchannel <channel>',
      adminOnly: true,
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    await message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    const verified = message.guild.channels.find(c => c.name === args[0]) || message.guild.channels.find(c => c.toString() === args[0]);
    if (!verified) return message.channel.send(`\`${args[0]}\` is not a channel!`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

    await this.client.settings.updateGuild(message.guild, { suggestionsChannel: verified.id }).catch(err => {
      this.client.logger.log(err);
      return message.channel.send(`Error setting the suggestions channel: **${err.message}**.`);
    });

    return await message.channel.send(`Suggestions channel has been changed to: ${verified.toString()}`);
  }
};
