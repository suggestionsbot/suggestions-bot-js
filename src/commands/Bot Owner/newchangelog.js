const { MessageEmbed } = require('discord.js-light');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { buildErrorEmbed } = require('../../utils/functions');

module.exports = class NewChangelogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'newchangelog',
      category: 'Bot Owner',
      description: 'Add a new changelog update.',
      usage: 'newchangelog <message>',
      ownerOnly: true
    });
  }

  async run(message, args) {
    message.delete().catch(O_o=>{});

    const changes = args.join(' ');
    if (!changes) return this.client.errors.noUsage(message.channel, this);

    const channel = this.client.lastChangelog.channel;

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setDescription(changes)
      .addField('Date', new Date().toLocaleDateString())
      .setColor(this.client.config.colors.main);

    try {
      const confirmation = await this.client.awaitReply(
        message,
        message.channel,
        'Is this what you want? If so, type `submit` to submit this changelog.',
        embed
      );
      if (confirmation === 'submit') {
        this.client.lastChangelog = await channel.send(embed);
        return this.client.lastChangelog;
      }
    } catch (err) {
      Logger.errorCmd(this, err.message);
      return message.channel.send(buildErrorEmbed(err));
    }
  }
};
