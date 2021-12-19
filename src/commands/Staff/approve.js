const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js-light');
const { stripIndent } = require('common-tags');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { validateSnowflake } = require('../../utils/functions');

module.exports = class ApproveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'approve',
      category: 'Staff',
      description: 'Approve a submitted suggestion via the suggestion ID (sID) or message ID.',
      usage: 'approve <sID|message ID> [response]',
      aliases: ['accept'],
      staffOnly: true,
      guildOnly: true,
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS']
    });
  }

  async run(message, args, settings) {

    message.delete().catch(O_o => {});

    const { discord, suggestionColors: { approved }, logsPermissions } = this.client.config;
    let document;

    const id = args[0];
    if (!id) return this.client.errors.noUsage(message.channel, this, settings);

    const reply = args.slice(1).join(' ');

    try {
      if ([7, 8].includes(id.length)) document = await this.client.suggestions.getGlobalSuggestion(id);
      else if (validateSnowflake(id)) document = await this.client.suggestions.getGuildSuggestionViaMessageID(message.guild, id);
      else return message.channel.send(`\`${id}\` does not resolve to or return a valid suggestion!`);
    } catch (error) {
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`Error querying this suggestion: **${error.message}**`);
    }

    const {
      sID,
      userID,
      guildID,
      messageID,
      suggestion,
      status
    } = document;

    if (status === 'approved') {
      return message.channel.send(`sID **${sID}** has already been approved. Cannot do this action again.`)
        .then(msg => msg.delete({ timeout: 3000 }))
        .catch(err => this.logger.error(err.stack));
    }

    const submitter = await this.client.users.fetch(userID, false).catch(err => Logger.errorCmd(this, err));
    const guild = message.guild ? message.guild : this.client.guilds.cache.get(guildID);

    try {
      settings = await this.client.settings.getGuild(guild);
    } catch (error) {
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }

    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    if (!messageID) {
      return message.channel.send(`Oops! The message ID was not found for this suggestion.
        Please contact the developer via the Support Discord: ${discord}`);
    }

    let suggestionsChannel,
      suggestionsLogs;
    try {
      suggestionsChannel = settings.suggestionsChannel && await message.guild.channels.fetch(settings.suggestionsChannel);
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      suggestionsLogs = settings.suggestionsLogs && await message.guild.channels.fetch(settings.suggestionsLogs);
      if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);
    } catch (error) {
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }


    try {
      await guild.members.fetch({ user: userID, cache: false });
    } catch (error) {
      message.channel.send(`**${submitter.tag}** is no longer in the guild, but their suggestion will still be approved.`)
        .then(msg => msg.delete({ timeout: 3000 }));
    }

    let sMessage;
    try {
      sMessage = await suggestionsChannel.messages.fetch(messageID, false);
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send('The suggestion message was not found!')
        .then(m => m.delete({ timeout: 5000 }));
    }

    const embed = sMessage.embeds[0];

    const approvedEmbed = new MessageEmbed(embed)
      .setTitle('Suggestion Approved')
      .setColor(approved);

    const dmEmbed = new MessageEmbed()
      .setAuthor(guild, guild.iconURL())
      .setDescription(stripIndent`Hey, ${submitter}. Your suggestion has been approved by ${message.author}!
      
      Your suggestion ID (sID) for reference was **${sID}**.`)
      .setColor(approved)
      .setFooter(`Guild ID: ${guild.id} | sID: ${id}`)
      .setTimestamp();

    if (reply) {
      dmEmbed
        .setDescription(stripIndent`Hey, ${submitter}. Your suggestion has been approved by ${message.author}!
      
        **Staff Response:** ${reply}

        Your suggestion ID (sID) for reference was **${sID}**.`);
    }

    const [reacts, reactCount] = [
      sMessage.reactions.cache.map(e => e.emoji.toString()),
      sMessage.reactions.cache.map(e => e.count)
    ];

    const getResults = (view = false) => {
      const count = (idx) => reactCount[idx] - 1 || 0;

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

        **Approved By**
        ${message.author}
      `)
      .setColor(approved)
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

          **Approved By**
          ${message.author}

          **Response:**
          ${reply}
        `);
    }

    const missingPermissions = suggestionsLogs.permissionsFor(message.guild.me).missing(logsPermissions);
    if (missingPermissions.length > 0) return this.client.errors.noChannelPerms(message, suggestionsLogs, missingPermissions);

    const approveSuggestion = {
      query: [
        { guildID: guild.id },
        { sID }
      ],
      data: {
        status: 'approved',
        statusUpdated: message.createdTimestamp,
        statusReply: reply,
        staffMemberID: message.author.id,
        results: getResults()
      }
    };

    try {
      message.channel.send(`Suggestion **${sID}** has been approved.`).then(m => m.delete({ timeout: 5000 }));
      sMessage.edit(approvedEmbed).then(m => m.delete({ timeout: 5000 }));
      suggestionsLogs.send(logsEmbed);
      await this.client.suggestions.handleGuildSuggestion(approveSuggestion);
      await guild.members.fetch({ user: userID, cache: false });
      if (settings.dmResponses) submitter.send(dmEmbed);
    } catch (error) {
      if (error.message === 'Unknown Member') return;
      if (error.message === 'Cannot send messages to this user') return;
      Logger.errorCmd(this, error.stack);
      message.delete({ timeout: 3000 }).catch(O_o=>{});
      return message.channel.send(`An error occurred: **${error.message}**`);
    }
  }
};
