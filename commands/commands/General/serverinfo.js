const { RichEmbed } = require('discord.js');
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

    const icon = message.guild.icon;
    const id = message.guild.id;
    const srvIcon = `https://cdn.discordapp.com/icons/${id}/${icon}.png?size=2048`;

    const bot = message.guild.me;

    const createdOn = moment.utc(message.guild.createdAt).format('MM/DD/YY @ h:mm A (z)');
    const joinedOn = moment.utc(bot.joinedAt).format('MM/DD/YY @ h:mm A (z)');

    const gSuggestions = await this.client.suggestions.getGuildSuggestions(message.guild).catch(err => {
      this.client.logger.error(err);
      return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
    });
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
    if (lastSuggestion.time) lastDate = moment.utc(new Date(lastSuggestion.time)).format('MM/DD/YY');
    if (lastSuggestion.newTime) lastDate = moment.utc(new Date(lastSuggestion.newTime)).format('MM/DD/YY');

    const lastsID = lastSuggestion.sID;
    const lastSuggestionInfo = `${lastsID} (${lastDate})`;

    const serverEmbed = new RichEmbed()
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
      serverEmbed.addField('Suggestions', suggestions.join('\n'));
      serverEmbed.addField('Last Suggestion (sID)', lastSuggestionInfo);
    }

    return message.channel.send(serverEmbed);
  }
};
