const { MessageEmbed, TextChannel, Guild, Constants } = require('discord.js');
const Command = require('../../Command');
const { version } = require('../../../package.json');
require('dotenv-flow').config();

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

    const channelID = process.env.NODE_ENV === 'production' ? '602326597613256734' : '504074783604998154';
    this.client.shard.broadcastEval(`this.channels.cache.get('${channelID}')`)
      .then(async channelArr => {
        const found = channelArr.find(c => c);
        if (!found) return message.channel.send('The official changelog channel was not found!');

        return this.client.api.guilds(found.guild).get()
          .then(async raw => {
            const guild = new Guild(this.client, raw);
            const channel = new TextChannel(guild, found);

            if (channel.messages.cache.size === 0) {
              await channel.messages.fetch().catch(error => {
                this.client.logger.error(error.message);
                return message.channel.send(`An error occurred: **${error.message}&+**`);
              });
            }

            const m = channel.messages.cache.filter(msg => msg.embeds.length >= 1).first();

            const changelogEmbed = new MessageEmbed()
              .setTitle(`${this.client.user.username}'s Changelog 🗄`)
              .setThumbnail(this.client.user.avatarURL())
              .setDescription(m.embeds[0].description)
              .addField('Date', m.embeds[0].fields[0].value)
              .setColor(embedColor);

            changelogEmbed.addField('More Information', `Please check our ${channel || `#${channel.name}`} channel at ${discord} for previous updates!`);

            return message.channel.send(changelogEmbed);
          });
      })
      .catch(error => {
        this.client.logger.error(error.message);
        return message.channel.send(`An error occurred: **${error.message}**`);
      });

    return;
  }
};
