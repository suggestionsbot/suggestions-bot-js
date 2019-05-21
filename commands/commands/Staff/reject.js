const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
const { stripIndents } = require('common-tags');
require('moment-duration-format');
require('moment-timezone');
moment.suppressDeprecationWarnings = true;

module.exports = class RejectCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reject',
      category: 'Staff',
      description: 'Reject a submitted suggestion via the suggestion ID (sID).',
      usage: 'reject <sID> [response]',
      staffOnly: true,
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    const { rejected } = this.client.config.suggestionColors;

    message.delete().catch(O_o => {});

    const id = args[0];
    const reply = args.slice(1).join(' ');
    if (!id) return this.client.errors.noUsage(message.channel, this, settings);

    let sID,
      guild = message.guild;
    try {
      sID = await this.client.suggestions.getGlobalSuggestion(id);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error querying the database for this suggestions: **${err.message}**.`);
    }

    if (!sID) return this.client.errors.noSuggestion(message.channel, id);

    if (!message.guild) {
      try {
        guild = await this.client.shard.broadcastEval(`this.guilds.get('${sID.guildID}');`);
        guild = guild[0];
        settings = await this.client.settings.getGuild(sID.guildID);
      } catch (err) {
        this.client.logger.error(err.message);
        return message.channel.send(`An error occurred: **${err.message}**`);
      }
    }

    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    const suggestionsChannel = guild.channels.find(c => c.name === settings.suggestionsChannel) ||
      (guild.channels.get(settings.suggestionsChannel));

    const suggestionsLogs = guild.channels.find(c => c.name === settings.suggestionsLogs) ||
      (guild.channels.get(settings.suggestionsLogs));

    if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);

    const {
      userID,
      messageID,
      suggestion,
      status
    } = sID;

    if (status === 'rejected') {
      return message.channel.send(`sID **${id}** has already been rejected. Cannot do this action again.`)
        .then(msg => msg.delete(3000))
        .catch(err => this.client.logger.error(err.stack));
    }

    const sUser = this.client.users.get(userID);
    if (!guild.members.get(sUser.id)) {
      message.channel.send(`**${sUser.tag}** is no longer in the guild, but their suggestion will still be rejected.`)
        .then(msg => msg.delete(3000))
        .catch(err => this.client.logger.error(err.stack));
    }

    if (sID.messageID) {
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
        .setDescription(stripIndents`Hey, ${sUser}. Your suggestion has been rejected by ${message.author}!
                            
        Your suggestion ID (sID) for reference was **${id}**.
        `)
        .setColor(rejected)
        .setFooter(`Guild ID: ${guild.id} | sID: ${id}`)
        .setTimestamp();

      const reactions = embed.message.reactions;
      const reactName = reactions.map(e => e._emoji.name);
      const reactCount = reactions.map(e => e.count);

      const results = reactName.map((r, c) => {
        return {
          emoji: r,
          count: reactCount[c] - 1 || 0
        };
      });

      const nerdSuccess = this.client.emojis.find(e => e.name === 'nerdSuccess');
      const nerdError = this.client.emojis.find(e => e.name === 'nerdError');

      const nerdApprove = this.client.emojis.find(e => e.name === 'nerdApprove');
      const nerdDisapprove = this.client.emojis.find(e => e.name === 'nerdDisapprove');

      results.forEach(result => {
        if (result.emoji === 'nerdSuccess') result.emoji = nerdSuccess.toString();
        if (result.emoji === 'nerdError') result.emoji = nerdError.toString();
        if (result.emoji === 'nerdApprove') result.emoji = nerdApprove.toString();
        if (result.emoji === 'nerdDisapprove') result.emoji = nerdDisapprove.toString();
      });

      const newResults = Array.from(results);
      const view = newResults.map(r => {
        return `${r.emoji} **: ${r.count}**`;
      }).join('\n');

      const logsEmbed = new RichEmbed()
        .setAuthor(guild.name, guild.iconURL)
        .setDescription(`
          **Results:**
          ${view}

          **Suggestion:**
          ${suggestion}

          **Submitter:**
          ${sUser}

          **Rejected By:**
          ${message.author}
        `)
        .setColor(rejected)
        .setFooter(`sID: ${id}`)
        .setTimestamp();

      if (reply) {
        dmEmbed.setDescription(`Hey, ${sUser}. Your suggestion has been rejected by ${message.author}.
        
          Staff response: **${reply}**
                              
          Your suggestion ID (sID) for reference was **${id}**.
        `);

        logsEmbed.setDescription(`
          **Results:**
          ${view}
          
          **Suggestion:**
          ${suggestion}
              
          **Submitter:**
          ${sUser}

          **Rejected By:**
          ${message.author}

          **Response:**
          ${reply}
        `);
      }

      const sendMsgs = suggestionsLogs.permissionsFor(guild.me).has('SEND_MESSAGES', false);
      const addReactions = suggestionsLogs.permissionsFor(guild.me).has('ADD_REACTIONS', false);
      if (!sendMsgs) return message.channel.send(`I can't send messages in the ${suggestionsLogs} channel! Make sure I have \`Send Messages\`.`);
      if (!addReactions) return message.channel.send(`I can't add reactions in the ${suggestionsLogs} channel! Make sure I have \`Add Reactions\`.`);

      const rejectSuggestion = {
        query: [
          { guildID: guild.id },
          { sID: id }
        ],
        data: {
          status: 'rejected',
          statusUpdated: message.createdAt.getTime(),
          statusReply: reply || null,
          staffMemberID: message.author.id,
          // newResults
          results
        }
      };

      try {
        message.channel.send(`Suggestion **${id}** has been rejected.`).then(m => m.delete(5000));
        sMessage.edit(rejectedEmbed).then(m => m.delete(5000));
        suggestionsLogs.send(logsEmbed);
        try {
          if (settings.dmResponses && guild.members.get(sUser.id)) sUser.send(dmEmbed);
        } catch (err) {
          message.channel.send(`**${sUser.tag}** has DMs disabled, but their suggestion will still be rejected.`);
        }

        await this.client.suggestions.handleGuildSuggestion(rejectSuggestion);
      } catch (err) {
        this.client.logger.error(err.stack);
        message.delete(3000).catch(O_o => {});
        message.channel.send(`An error occured: **${err.message}**`);
      }

    } else {
      let fetchedMessages;
      try {
        fetchedMessages = await suggestionsChannel.fetchMessages({ limit: 100 });
      } catch (err) {
        this.client.logger.error(err.stack);
        return message.channel.send(`There was an error fetching messages from the ${suggestionsChannel}: **${err.message}**.`);
      }

      fetchedMessages.forEach(async msg => {
        const embed = msg.embeds[0];
        if (!embed) return;

        const approvedEmbed = new RichEmbed(embed)
          .setTitle('Suggestion Rejected')
          .setColor(rejected);

        const dmEmbed = new RichEmbed()
          .setAuthor(guild, guild.iconURL)
          .setDescription(stripIndents`Hey, ${sUser}. Your suggestion has been approved by ${message.author}!
                              
          Your suggestion ID (sID) for reference was **${id}**.
          `)
          .setColor(rejected)
          .setFooter(`Guild ID: ${guild.id} | sID: ${id}`)
          .setTimestamp();

        const reactions = embed.message.reactions;
        const reactName = reactions.map(e => e._emoji.name);
        const reactCount = reactions.map(e => e.count);

        const results = reactName.map((r, c) => {
          return {
            emoji: r,
            count: reactCount[c] - 1 || 0
          };
        });

        const nerdSuccess = this.client.emojis.find(e => e.name === 'nerdSuccess');
        const nerdError = this.client.emojis.find(e => e.name === 'nerdError');

        const nerdApprove = this.client.emojis.find(e => e.name === 'nerdApprove');
        const nerdDisapprove = this.client.emojis.find(e => e.name === 'nerdDisapprove');

        results.forEach(result => {
          if (result.emoji === 'nerdSuccess') result.emoji = nerdSuccess.toString();
          if (result.emoji === 'nerdError') result.emoji = nerdError.toString();
          if (result.emoji === 'nerdApprove') result.emoji = nerdApprove.toString();
          if (result.emoji === 'nerdDisapprove') result.emoji = nerdDisapprove.toString();
        });

        const newResults = Array.from(results);
        const view = newResults.map(r => {
          return `${r.emoji} **: ${r.count}**`;
        }).join('\n');

        const logsEmbed = new RichEmbed()
          .setAuthor(guild.name, guild.iconURL)
          .setDescription(`
            **Results:**
            ${view}

            **Suggestion:**
            ${suggestion}

            **Submitter:**
            ${sUser}

            **Approved By:**
            ${message.author}
          `)
          .setColor(rejected)
          .setFooter(`sID: ${id}`)
          .setTimestamp();

        if (reply) {
          dmEmbed.setDescription(`Hey, ${sUser}. Your suggestion has been rejected by ${message.author}!
          
            Staff response: **${reply}**
                                
            Your suggestion ID (sID) for reference was **${id}**.
          `);

          logsEmbed.setDescription(`
            **Results:**
            ${view}
            
            **Suggestion:**
            ${suggestion}
                
            **Submitter:**
            ${sUser}

            **Rejcted By:**
            ${message.author}

            **Response:**
            ${reply}
          `);
        }

        const footer = embed.footer.text;
        if (footer.includes(id)) {
          const sendMsgs = suggestionsLogs.permissionsFor(guild.me).has('SEND_MESSAGES', false);
          const addReactions = suggestionsLogs.permissionsFor(guild.me).has('ADD_REACTIONS', false);
          if (!sendMsgs) return message.channel.send(`I can't send messages in the ${suggestionsLogs} channel! Make sure I have \`Send Messages\`.`);
          if (!addReactions) return message.channel.send(`I can't add reactions in the ${suggestionsLogs} channel! Make sure I have \`Add Reactions\`.`);

          const rejectSuggestion = {
            query: [
              { guildID: guild.id },
              { sID: id }
            ],
            data: {
              status: 'rejected',
              statusUpdated: message.createdAt.getTime(),
              statusReply: reply || null,
              staffMemberID: message.author.id,
              // newResults,
              results
            }
          };

          try {
            const sMessage = await suggestionsChannel.fetchMessage(embed.message.id);
            message.channel.send(`Suggestion **${id}** has been rejected.`).then(m => m.delete(5000));
            sMessage.edit(approvedEmbed).then(m => m.delete(5000));
            suggestionsLogs.send(logsEmbed);
            try {
              if (settings.dmResponses && guild.members.get(sUser.id)) sUser.send(dmEmbed);
            } catch (err) {
              message.channel.send(`**${sUser.tag}** has DMs disabled, but their suggestion will still be rejected.`);
            }

            await this.client.suggestions.handleGuildSuggestion(rejectSuggestion);
          } catch (err) {
            this.client.logger.error(err.stack);
            message.delete(3000).catch(O_o => {});
            message.channel.send(`An error occurred: **${err.message}**`);
          }
        }
        return;
      });
    }

    return;
  }
};
