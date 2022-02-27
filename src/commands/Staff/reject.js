const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js-light');
const { stripIndent } = require('common-tags');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { validateSnowflake, suggestionMessageReactionFilter, buildErrorEmbed } = require('../../utils/functions');

module.exports = class RejectCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reject',
      category: 'Staff',
      description: 'Reject a submitted suggestion via the suggestion ID (sID) or message ID.',
      usage: 'reject <sID|message ID> [response]',
      aliases: ['deny'],
      staffOnly: true,
      guildOnly: true,
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS']
    });

    this.voteEmojis = require('../../utils/voteEmojis');
  }

  async run(message, args, settings) {

    message.delete().catch(O_o => {});

    const { discord, colors, logsPermissions } = this.client.config;
    let document;

    const id = args[0];
    if (!id) return this.client.errors.noUsage(message.channel, this, settings);

    const reply = args.slice(1).join(' ');
    if (!reply && settings.responseRequired) return this.client.errors.noRejectedResponse(message.channel);

    const errMessage = new Error(`\`${id}\` does not resolve to or return a valid suggestion!`);
    try {
      if ([7, 8].includes(id.length)) document = await this.client.mongodb.helpers.suggestions.getGlobalSuggestion(id);
      else if (validateSnowflake(id)) document = await this.client.mongodb.helpers.suggestions.getGuildSuggestionViaMessageID(message.guild, id);
      else return message.channel.send(buildErrorEmbed(errMessage, false));
    } catch (error) {
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`Error querying this suggestion: **${error.message}**`);
    }

    if (!document) return message.channel.send(buildErrorEmbed(errMessage, false));

    const {
      sID,
      userID,
      guildID,
      messageID,
      suggestion,
      status,
      results
    } = document;

    const submitter = await this.client.users.fetch(userID, false).catch(err => Logger.errorCmd(this, err));
    const guild = message.guild ? message.guild : this.client.guilds.cache.get(guildID);

    try {
      settings = await this.client.mongodb.helpers.settings.getGuild(guild);
    } catch (error) {
      Logger.errorCmd(this, error.stack);
      return message.channel.send(buildErrorEmbed(error));
    }

    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    if (!messageID) {
      return message.channel.send(`Oops! The message ID was not found for this suggestion.
        Please contact the developer via the Support Discord: ${discord}`);
    }

    const isDefault = [this.client.config.defaultSettings.suggestionsLogs, 'suggestions-logs'].includes(settings.suggestionsLogs);
    const willIgnoreLogs = isDefault && !settings.keepLogs;

    let suggestionsChannel,
      suggestionsLogs;
    try {
      suggestionsChannel = settings.suggestionsChannel && await message.guild.channels.fetch(settings.suggestionsChannel);
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      if (!willIgnoreLogs) {
        suggestionsLogs = settings.suggestionsLogs && await message.guild.channels.fetch(settings.suggestionsLogs);
        if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);
      }
    } catch (error) {
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      if (!willIgnoreLogs) return this.client.errors.noSuggestionsLogs(message.channel);
      Logger.errorCmd(this, error.stack);
      return message.channel.send(buildErrorEmbed(error));
    }


    try {
      await guild.members.fetch({ user: userID, cache: false });
    } catch (error) {
      message.channel.send(`**${submitter.tag}** is no longer in the guild, but their suggestion will still be approved.`)
        .then(msg => msg.delete({ timeout: 3000 }));
    }

    let sMessage,
      rejectedEmbed;
    try {
      sMessage = await suggestionsChannel.messages.fetch(messageID, false);
    } catch (err) {
      sMessage = false;
    }

    if (sMessage) {
      const embed = sMessage.embeds[0];

      rejectedEmbed = new MessageEmbed(embed)
        .setTitle('Suggestion Rejected')
        .setColor(colors.suggestion.rejected);
    }

    const dmEmbed = new MessageEmbed()
      .setAuthor(guild, guild.iconURL())
      .setDescription(stripIndent`Hey, ${submitter}. Your suggestion has been rejected by ${message.author}!
      
      Your suggestion sID (sID) for reference was **${sID}**.`)
      .setColor(colors.suggestion.rejected)
      .setFooter(`Guild ID: ${guild.id} | sID: ${id}`)
      .setTimestamp();

    if (reply) {
      dmEmbed
        .setDescription(stripIndent`Hey, ${submitter}. Your suggestion has been rejected by ${message.author}!
      
        **Staff Response:** ${reply}

        Your suggestion ID (sID) for reference was **${sID}**.`);
    }

    const [reacts, reactCount] = [
      status ? results.map(e => e.emoji) : sMessage.reactions.cache.filter(suggestionMessageReactionFilter).map(e => e.emoji.toString()),
      status ? results.map(e => e.count) : sMessage.reactions.cache.filter(suggestionMessageReactionFilter).map(e => e.count)
    ];

    const getResults = (view = false) => {
      const count = (idx) => status ? reactCount[idx] : reactCount[idx] - 1 || 0;

      if (view) {
        return reacts.map((r, i) => {
          return `${r}**: ${count(i)}**`;
        });
      } else {
        return reacts.map((r, i) => {
          return {
            emoji: r,
            count: count(i)
          };
        });
      }
    };

    const logsEmbed = new MessageEmbed()
      .setAuthor(guild, guild.iconURL())
      .setDescription(stripIndent`
        **Results**
        ${getResults(true).join('\n')}

        **Suggestion**
        ${escapeMarkdown(suggestion)}

        **Submitter**
        ${submitter}

        **Rejected By**
        ${message.author}
      `)
      .setColor(colors.suggestion.rejected)
      .setFooter(`sID: ${sID}`)
      .setTimestamp();

    if (reply) {
      logsEmbed
        .setDescription(stripIndent`
          **Results**
          ${getResults(true).join('\n')}

          **Suggestion**
          ${escapeMarkdown(suggestion)}

          **Submitter**
          ${submitter}

          **Rejected By**
          ${message.author}

          **Response**
          ${reply}
        `);
    }

    if (!willIgnoreLogs) {
      const missingPermissions = suggestionsLogs.permissionsFor(message.guild.me).missing(logsPermissions);
      if (missingPermissions.length > 0) return this.client.errors.noChannelPerms(message, suggestionsLogs, missingPermissions);
    }

    const rejectSuggestion = {
      query: [
        { guildID: guild.id },
        { sID }
      ],
      data: {
        status: 'rejected',
        statusUpdated: message.createdTimestamp,
        statusReply: reply,
        staffMemberID: message.author.id,
        results: getResults()
      }
    };

    try {
      // Will handle suggestion if there's no logs channel set/default value is set OR keepLogs is enabled and a valid logs channel is set
      if (sMessage && (willIgnoreLogs || (settings.keepLogs && suggestionsLogs))) {
        const logEmbed = new MessageEmbed(logsEmbed)
          .setTitle('Suggestion Rejected');
        await sMessage.edit(logEmbed);
        await sMessage.reactions.removeAll();
      }

      // Will handle suggestion if keepLogs is disabled and a valid suggestion logs channel is set
      if (!settings.keepLogs && suggestionsLogs) {
        if (sMessage) await sMessage.edit(rejectedEmbed).then(m => m.delete({ timeout: 5000 }));
        await suggestionsLogs.send(logsEmbed);
      }

      await this.client.mongodb.helpers.suggestions.handleGuildSuggestion(rejectSuggestion);
      await guild.members.fetch({ user: userID, cache: false });
      if (settings.dmResponses) submitter.send(dmEmbed);
      message.channel.send(`Suggestion **${sID}** has been rejected.`).then(m => m.delete({ timeout: 5000 }));
    } catch (error) {
      if (error.message === 'Unknown Member') return;
      if (error.message === 'Cannot send messages to this user') return;
      Logger.errorCmd(this, error.stack);
      message.delete({ timeout: 3000 }).catch(O_o=>{});
      return message.channel.send(buildErrorEmbed(error));
    }
  }
};
