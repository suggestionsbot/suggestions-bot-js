const { MessageEmbed } = require('discord.js-light');

const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { displayTimestamp, buildErrorEmbed } = require('../../utils/functions');

module.exports = class GuildInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'serverinfo',
      category: 'General',
      description: 'Display guild information regarding the bot.',
      botPermissions: ['EMBED_LINKS'],
      aliases: ['guildinfo'],
      throttling: {
        usages: 3,
        duration: 180
      },
      guarded: true
    });
  }

  async run(message, args) {

    const { colors } = this.client.config;

    const srvIcon = message.guild.iconURL({ format: 'png', size: 2048, dynamic: true });

    let gSuggestions;

    try {
      gSuggestions = await this.client.mongodb.helpers.suggestions.getGuildSuggestions(message.guild);
    } catch (error) {
      Logger.errorCmd(this, error.stack);
      return message.channel.send(buildErrorEmbed(error));
    }

    const serverEmbed = new MessageEmbed()
      .setTitle(message.guild)
      .setThumbnail(srvIcon)
      .setColor(colors.main)
      .setThumbnail(srvIcon)
      .addField('Owner', `${message.guild.owner} \`[${message.guild.ownerID}]\``)
      .addField('Created On', displayTimestamp(message.guild.createdAt))
      .addField('Joined', displayTimestamp(message.guild.me.joinedAt))
      .setFooter(`ID: ${message.guild.id}`)
      .setTimestamp();

    if (gSuggestions.length >= 1) {
      const sortedSuggestions = gSuggestions.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

      let approved = 0;
      let rejected = 0;
      for (const i in gSuggestions) {
        if (gSuggestions[i].status === 'approved') approved++;
        if (gSuggestions[i].status === 'rejected') rejected++;
      }

      const suggestions = [];
      if (gSuggestions.length >= 1) suggestions.push(`Total: \`${gSuggestions.length}\``);
      if (approved >= 1) suggestions.push(`Approved: \`${approved}\``);
      if (rejected >= 1) suggestions.push(`Rejected: \`${rejected}\``);

      const lastSuggestion = sortedSuggestions[0];

      let lastDate;
      if (lastSuggestion.time && !lastSuggestion.newTime)
        lastDate = lastSuggestion.time;

      if (lastSuggestion.newTime && !lastSuggestion.time)
        lastDate = lastSuggestion.newTime;

      if (!lastSuggestion.time && !lastSuggestion.newTime)
        lastDate = lastSuggestion._id.getTimestamp();


      const lastsID = lastSuggestion.sID;
      const lastSuggestionInfo = `\`${lastsID}\` (${displayTimestamp(lastDate)})`;

      serverEmbed.addField('Suggestions', suggestions.join('\n'));
      serverEmbed.addField('Last Suggestion (sID)', lastSuggestionInfo);
    }

    return message.channel.send(serverEmbed);
  }
};
