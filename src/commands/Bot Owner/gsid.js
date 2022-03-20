const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js-light');
const { stripIndent } = require('common-tags');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { buildErrorEmbed, escapeSuggestionId } = require('../../utils/functions');

module.exports = class GSIDCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'gsid',
      category: 'Suggestions',
      description: 'View the information of a specific guild suggestion by their sID (globally for bot owners).',
      usage: 'gsid <sID>',
      ownerOnly: true,
      guildOnly: false,
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS']
    });
  }

  async run(message, args, settings) {

    const { colors } = this.client.config;

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    const escapedId = escapeSuggestionId(args[0]);
    let suggestion;
    try {
      suggestion = await this.client.mongodb.helpers.suggestions.getGlobalSuggestion(escapedId);
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(buildErrorEmbed(err));
    }

    if (!suggestion) return this.client.errors.noSuggestion(message.channel, args[0]);

    let updatedOn,
      sStaff;

    if (suggestion.statusUpdated) updatedOn = suggestion.statusUpdated;
    if (suggestion.newStatusUpdated) updatedOn = suggestion.newStatusUpdated;

    const sUser = await this.client.users.fetch(suggestion.userID, false).catch(err => Logger.errorCmd(this, err));

    if (Object.prototype.hasOwnProperty.call(suggestion._doc, 'staffMemberID'))
      sStaff = await this.client.users.fetch(suggestion.staffMemberID, false).catch(err => Logger.errorCmd(this, err));

    const sGuild = await this.client.shard.fetchGuild(suggestion.guildID);

    const embed = new MessageEmbed()
      .setAuthor(sGuild.name, sGuild.iconURL)
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
          .setColor(colors.main)
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
          .setColor(colors.suggestion.approved)
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
          .setColor(colors.suggestion.rejected)
          .setTimestamp(updatedOn);
        message.channel.send(embed);
        break;
      }
      default:
        break;
    }
  }
};
