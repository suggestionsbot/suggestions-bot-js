const { MessageEmbed } = require('discord.js-light');
const Command = require('../../structures/Command');
const { invite } = require('../../config');

module.exports = class VoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'vote',
      category: 'General',
      description: 'Vote for the bot on various Discord bot lists.',
      botPermissions: ['EMBED_LINKS'],
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args) {

    const { colors, voteSites, discord } = this.client.config;

    let i = 1;
    const sites = voteSites
      .filter(site => site.voting)
      .map(site => {
        return `**${i++})** [**${site.name}**](${site.link})`;
      }).join('\n');

    const voteEmbed = new MessageEmbed()
      .setTitle('Vote Information')
      .setDescription(`
                Vote for the ${this.client.user}'s bot on our vote sites list below!

                ${sites}

                Voting helps show your support for the bot and the developers. It's not
                required, but spreading the word and upping our presence is always much appreciated!

                For more information regarding voting, feel free to join our [Discord](${invite}).
            `)
      .setColor(colors.main);

    return message.channel.send(voteEmbed);
  }
};
