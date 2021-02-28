const { MessageEmbed } = require('discord.js-light');
const Command = require('../../Command');

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

    const changelog = this.client.lastChangelog;
    const changelogEmbed = new MessageEmbed()
      .setTitle(`${this.client.user.username}'s Changelog 🗄`)
      .setThumbnail(this.client.user.avatarURL())
      .setDescription(changelog.embeds[0].description)
      .addField('Date', changelog.embeds[0].fields[0].value)
      .setColor(embedColor);

    changelogEmbed.addField('More Information', `Please check our ${changelog.channel} channel at ${discord} for previous updates!`);

    return message.channel.send(changelogEmbed);
  }
};
