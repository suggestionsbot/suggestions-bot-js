const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js-light');
const { stripIndent } = require('common-tags');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');

module.exports = class SIDCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sid',
      category: 'Suggestions',
      description: 'View the information of a specific guild suggestion by their sID.',
      usage: 'sid <sID>',
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS']
    });
  }

  async run(message, args, settings) {

    const { embedColor, suggestionColors } = this.client.config;

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    let suggestion;
    try {
      suggestion = await this.client.suggestions.getGuildSuggestion(message.guild, args[0]);
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    if (!suggestion) return this.client.errors.noSuggestion(message.channel, args[0]);

    let updatedOn,
      sStaff;

    if (suggestion.statusUpdated) updatedOn = suggestion.statusUpdated;
    if (suggestion.newStatusUpdated) updatedOn = suggestion.newStatusUpdated;

    const sUser = await this.client.users.fetch(suggestion.userID, false).catch(err => Logger.errorCmd(this, err));
    if (Object.prototype.hasOwnProperty.call(suggestion._doc, 'staffMemberID'))
      sStaff = await this.client.users.fetch(suggestion.staffMemberID, false).catch(err => Logger.errorCmd(this, err));

    const embed = new MessageEmbed()
      .setAuthor(message.guild, message.guild.iconURL())
      .setTitle(`Info for ${suggestion.sID}`)
      .setFooter(`User ID: ${sUser.id} | sID: ${suggestion.sID}`);

    let time;
    if (suggestion.time && !suggestion.newTime) time = suggestion.time;
    if (!suggestion.time && suggestion.newTime) time = suggestion.newTime;
    if (!suggestion.time && !suggestion.newTime) time = suggestion._id.getTimestamp();

    const view = suggestion.results.length > 1 && suggestion.results.map((r) => {
      return `${r.emoji}**: ${r.count}**`;
    });

    switch (suggestion.status) {
      case undefined: {
        embed
          .setDescription(stripIndent`
          **Submitter**
          ${sUser}

          **Suggestion**
          ${escapeMarkdown(suggestion.suggestion)}
        `)
          .setColor(embedColor)
          .setTimestamp(time);
        message.channel.send(embed);
        break;
      }
      case 'approved': {
        embed
          .setDescription(stripIndent`
          **Submitter**
          ${sUser}

          **Suggestion**
          ${escapeMarkdown(suggestion.suggestion)}

          **Approved By**
          ${sStaff}

          **Results**
          ${view.join('\n')}
        `)
          .setColor(suggestionColors.approved)
          .setTimestamp(updatedOn);
        message.channel.send(embed);
        break;
      }
      case 'rejected': {
        embed
          .setDescription(stripIndent`
          **Submitter**
          ${sUser}

          **Suggestion**
          ${escapeMarkdown(suggestion.suggestion)}

          **Rejected By**
          ${sStaff}

          **Results**
          ${view.join('\n')}
        `)
          .setColor(suggestionColors.rejected)
          .setTimestamp(updatedOn);
        message.channel.send(embed);
        break;
      }
      default:
        break;
    }
  }
};
