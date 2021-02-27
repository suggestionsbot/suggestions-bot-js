const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

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
        duration: 60
      },
      guarded: true
    });
  }

  async run(message, args) {

    const { embedColor } = this.client.config;

    const srvIcon = message.guild.iconURL({ format: 'png', size: 2048, dynamic: true });

    const createdOn = moment.utc(message.guild.createdAt).format('MM/DD/YY @ h:mm A (z)');
    const joinedOn = moment.utc(message.guild.me.joinedAt).format('MM/DD/YY @ h:mm A (z)');

    let gSuggestions;

    try {
      gSuggestions = await this.client.suggestions.getGuildSuggestions(message.guild);
    } catch (error) {
      this.client.logger.error(error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }

    const serverEmbed = new MessageEmbed()
      .setTitle(message.guild)
      .setThumbnail(srvIcon)
      .setColor(embedColor)
      .setThumbnail(srvIcon)
      .addField('Owner', `${message.guild.owner} \`[${message.guild.ownerID}]\``)
      .addField('Created On', createdOn)
      .addField('Joined', joinedOn)
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
      if (lastSuggestion.time && !lastSuggestion.newTime) {
        // lastDate = moment.utc(new Date(lastSuggestion.time)).format('MM/DD/YY');
        lastDate = new Date(lastSuggestion.time).toLocaleDateString();
      }
      if (lastSuggestion.newTime && !lastSuggestion.time) {
        // lastDate = moment.utc(new Date(lastSuggestion.newTime)).format('MM/DD/YY');
        lastDate = new Date(lastSuggestion.newTime).toLocaleDateString();
      }
      if (!lastSuggestion.time && !lastSuggestion.newTime) {
        lastDate = new Date(lastSuggestion._id.getTimestamp()).toLocaleDateString();
      }

      const lastsID = lastSuggestion.sID;
      const lastSuggestionInfo = `\`${lastsID}\` (${lastDate})`;

      serverEmbed.addField('Suggestions', suggestions.join('\n'));
      serverEmbed.addField('Last Suggestion (sID)', lastSuggestionInfo);
    }

    return message.channel.send(serverEmbed);
  }
};
