const { RichEmbed } = require('discord.js');
const Command = require('../../Command');
const { version } = require('../../../package.json');

module.exports = class ChangelogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'changelog',
      category: 'General',
      description: 'View the recent changelog for the bot',
      aliases: ['changes', 'updates', 'changelogs'],
      botPermissions: ['EMBED_LINKS'],
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args) {

    const { embedColor, discord } = this.client.config;

    this.client.shard.broadcastEval('this.channels.get("602326597613256734")')
      .then(async channelArr => {
        const found = channelArr.find(c => c);
        if (!found) return message.channel.send('The official changelog channel was not found!');

        await found.fetchMessages().catch(error => {
          this.client.logger.error(error.message);
          return message.channel.send(`An error occurred: **${error.message}&+**`);
        });

        const m = found.lastMessage;
        if (!m) return message.channel.send('No previous changelogs were found in the official changelog channel!');

        const changelogEmbed = new RichEmbed()
          .setTitle(`${this.client.user.username}'s Changelog 🗄`)
          .setThumbnail(this.client.user.avatarURL)
          .setDescription(m.embeds[0].description)
          .addField('Date', m.embeds[0].fields[0].value)
          .setColor(embedColor);

        changelogEmbed.addField('More Information', `Please check our ${found || `#${found.name}`} channel at ${discord} for previous updates!`);

        return message.channel.send(changelogEmbed);
      })
      .catch(error => {
        this.client.logger.error(error.message);
        return message.channel.send(`An error occurred: **${error.message}**`);
      });

    return;
  }
};
