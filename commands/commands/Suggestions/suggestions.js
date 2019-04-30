const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

module.exports = class MySuggestionsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'suggestions',
      category: 'Suggestions',
      description: 'View your own suggestions data or another user\'s data in this guild.',
      botPermissions: ['MANAGE_MESSAGES'],
      aliases: ['mysuggestions'],
      usage: 'suggestions <@User>',
      guildOnly: false
    });
  }

  async run(message, args) {

    const { embedColor } = this.client.config;

    await message.delete().catch(O_o => {});

    const sUser = message.mentions.users.first() || this.client.users.get(args[0]) || message.author;

    let gSuggestions;
    try {
      if (message.guild) gSuggestions = await this.client.suggestions.getGuildMemberSuggestions(message.guild, sUser);
      else gSuggestions = await this.client.suggestions.getUserGlobalSuggestions(sUser);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error querying the database for your suggestions: **${err.message}**.`);
    }

    gSuggestions = gSuggestions.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

    if (gSuggestions.length === 0) {
      return message.channel.send(`No suggestions data exists for **${sUser.tag}**${message.guild ? ' in this guild' : ''}!`)
        .then(msg => msg.delete(3000))
        .catch(err => this.client.logger.error(err.stack));
    }

    const total = gSuggestions.length;
    const approved = gSuggestions.filter(s => s.status === 'approved').length;
    const rejected = gSuggestions.filter(s => s.status === 'rejected').length;

    const suggestions = [];
    if (total >= 1) suggestions.push(`Total: \`${total}\``);
    if (approved >= 1) suggestions.push(`Approved: \`${approved}\``);
    if (rejected >= 1) suggestions.push(`Rejected: \`${rejected}\``);

    const lastSuggestion = gSuggestions[0];

    let lastDate;
    if (lastSuggestion.time) lastDate = moment.utc(new Date(lastSuggestion.time)).format('MM/DD/YY');
    if (lastSuggestion.newTime) lastDate = moment.utc(new Date(lastSuggestion.newTime)).format('MM/DD/YY');

    const lastsID = lastSuggestion.sID;
    const lastSuggestionInfo = `\`${lastsID}\` (${lastDate})`;

    let createdOn,
      joinedOn;

    if (message.guild) {
      createdOn = moment.utc(message.guild.createdAt).format('MM/DD/YY @ h:mm A (z)');
      joinedOn = moment.utc(message.guild.members.get(sUser.id).joinedAt).format('MM/DD/YY @ h:mm A (z)');
    }

    const embed = new RichEmbed()
      .setColor(embedColor)
      .setThumbnail(sUser.avatarURL)
      .addField('User', `${sUser} \`[${sUser.id}]\``)
      .setTimestamp();

    if (message.guild) {
      embed
        .setAuthor(`${sUser.tag} | ${message.guild}`, sUser.avatarURL)
        .addField('Created On', createdOn)
        .addField('Joined', joinedOn);
    } else {
      embed.setAuthor(`${sUser.tag} | Global Statistics`, sUser.avatarURL);
    }

    if (gSuggestions.length >= 1) {
      embed.addField('Suggestions', suggestions.join('\n'));
      embed.addField('Last Suggestion (sID)', lastSuggestionInfo);
    }

    return message.channel.send(embed);
  }
};
