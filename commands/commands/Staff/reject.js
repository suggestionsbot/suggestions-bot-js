const { Constants, RichEmbed, Guild, Emoji } = require('discord.js');
const { stripIndent } = require('common-tags');
const Command = require('../../Command');

module.exports = class RejectCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reject',
      category: 'Staff',
      description: 'Reject a submitted suggestion via the suggestion ID (sID).',
      usage: 'reject <sID> [response]',
      staffOnly: true,
      guildOnly: true,
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS']
    });

    this.voteEmojis = require('../../../utils/voteEmojis');
  }

  async run(message, args, settings) {

    message.delete().catch(O_o => {});

    const { discord, suggestionColors: { rejected } } = this.client.config;
    let sID;

    const id = args[0];
    if (!id) return this.client.errors.noUsage(message.channel, this, settings);

    const reply = args.slice(1).join(' ');

    try {
      sID = await this.client.suggestions.getGlobalSuggestion(id);
    } catch (error) {
      this.client.logger.error(error.stack);
      return message.channel.send(`Error querying this suggestion: **${error.message}**`);
    }

    if (!sID) return this.client.errors.noSuggestion(message.channel, id);

    const {
      userID,
      guildID,
      messageID,
      suggestion,
      status
    } = sID;

    if (status === 'rejected') {
      return message.channel.send(`sID **${id}** has already been rejected. Cannot do this action again.`)
        .then(msg => msg.delete(3000))
        .catch(err => this.logger.error(err.stack));
    }

    const submitter = await this.client.fetchUser(userID).catch(err => this.client.logger.error(err));
    const guild = message.guild ? message.guild : this.client.guilds.get(guildID);

    try {
      settings = await this.client.settings.getGuild(guild);
    } catch (error) {
      this.client.logger.error(error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }

    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    if (!messageID) {
      return message.channel.send(`Oops! The message ID was not found for this suggestion.
        Please contact the developer via the Support Discord: ${discord}`);
    }

    const suggestionsChannel = guild.channels.find(c => c.name === settings.suggestionsChannel) ||
      guild.channels.get(settings.suggestionsChannel);

    const suggestionsLogs = guild.channels.find(c => c.name === settings.suggestionsLogs) ||
      guild.channels.get(settings.suggestionsLogs);

    if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);

    if (!guild.member(userID)) {
      message.channel.send(`**${submitter.tag}** is no longer in the guild, but their suggestion will still be rejected.`)
        .then(msg => msg.delete(3000))
        .catch(err => this.logger.error(err.stack));
    }

    let sMessage;
    try {
      sMessage = await suggestionsChannel.fetchMessage(messageID);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send('The suggestion message was not found!')
        .then(m => m.delete(5000));
    }

    const embed = sMessage.embeds[0];

    const rejectedEmbed = new RichEmbed(embed)
      .setTitle('Suggestion Rejected')
      .setColor(rejected);

    const dmEmbed = new RichEmbed()
      .setAuthor(guild, guild.iconURL)
      .setDescription(stripIndent`Hey, ${submitter}. Your suggestion has been rejected by ${message.author}!
      
      Your suggestion ID (sID) for reference was **${id}**.`)
      .setColor(rejected)
      .setFooter(`Guild ID: ${guild.id} | sID: ${id}`)
      .setTimestamp();

    if (reply) {
      dmEmbed
        .setDescription(stripIndent`Hey, ${submitter}. Your suggestion has been rejected by ${message.author}!
      
        **Staff Response:** ${reply}

        Your suggestion ID (sID) for reference was **${id}**.`);
    }

    const reactions = embed.message.reactions;
    const reactName = reactions.map(e => e._emoji.name);
    const reactCount = reactions.map(e => e.count);

    const fallback = set => set.name === 'oldDefaults';
    const fallbackSet = this.client.voteEmojis.find(fallback).emojis;

    const results = reactName.map(async (r, c) => {
      const emojiIndex = reactName.indexOf(r);

      await this.client.shard.broadcastEval(`this.findEmojiByName.call(this, '${r}')`)
        .then(async emojiArray => {
          const found = emojiArray.find(e => e);
          if (!found) {
            r = fallbackSet[emojiIndex];
            return;
          }

          const emoji = await this.client.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
            .then(async raw => {
              const fGuild = new Guild(this.client, raw);
              const fEmoji = new Emoji(fGuild, found);
              return fEmoji;
            });

          r = `<:${emoji.name}:${emoji.id}>`;
        })
        .catch(error => {
          this.client.logger.error(error.stack);
          return message.channel.send(`An error occurred: **${error.message}**`);
        });

      return {
        emoji: r,
        count: reactCount[c] - 1 || 0
      };
    });

    const newResults = Array.from(results).map(async r => {
      const res = await r;
      return `${res.emoji}**: ${res.count}**`;
    });

    let view,
      savedResults;

    try {
      view = await Promise.all(newResults);
      savedResults = await Promise.all(results);
    } catch (error) {
      this.client.logger.error(error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }

    const logsEmbed = new RichEmbed()
      .setAuthor(guild, guild.iconURL)
      .setDescription(stripIndent`
        **Results**
        ${view.join('\n')}

        **Suggestion**
        ${suggestion}

        **Submitter**
        ${submitter}

        **Rejected By**
        ${message.author}
      `)
      .setColor(rejected)
      .setFooter(`sID: ${id}`)
      .setTimestamp();

    if (reply) {
      logsEmbed
        .setDescription(stripIndent`
          **Results**
          ${view.join('\n')}

          **Suggestion**
          ${suggestion}

          **Submitter**
          ${submitter}

          **Rejected By**
          ${message.author}

          **Response**
          ${reply}
        `);
    }

    const sendMsgs = suggestionsLogs.permissionsFor(this.client.user).has('SEND_MESSAGES', false);
    const addReactions = suggestionsLogs.permissionsFor(this.client.user).has('ADD_REACTIONS', false);
    const extReactions = suggestionsLogs.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS', false);
    if (!sendMsgs) return this.client.errors.noChannelPerms(message, suggestionsLogs, 'SEND_MESSAGES');
    if (!addReactions) return this.client.errors.noChannelPerms(message, suggestionsLogs, 'ADD_REACTIONS');
    if (!extReactions) return this.client.errors.noChannelPerms(message, suggestionsLogs, 'USE_EXTERNAL_EMOJIS');

    const rejectSuggestion = {
      query: [
        { guildID: guild.id },
        { sID: id }
      ],
      data: {
        status: 'rejected',
        statusUpdated: message.createdTimestamp,
        statusReply: reply,
        staffMemberID: message.author.id,
        results: savedResults
      }
    };

    try {
      message.channel.send(`Suggestion **${id}** has been rejected.`).then(m => m.delete(5000));
      sMessage.edit(rejectedEmbed).then(m => m.delete(5000));
      suggestionsLogs.send(logsEmbed);
      try {
        if ((settings.dmResponses === true) && guild.members.get(submitter.id)) submitter.send(dmEmbed);
      } catch (err) {
        message.channel.send(`**${submitter.tag}** has DMs disabled, but their suggestion will still be rejected.`);
      }

      await this.client.suggestions.handleGuildSuggestion(rejectSuggestion);
    } catch (error) {
      this.client.logger.error(error.stack);
      message.delete(3000).catch(O_o=>{});
      return message.channel.send(`An error occurred: **${error.message}**`);
    }

    return;
  }
};
