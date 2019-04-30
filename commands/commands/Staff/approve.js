const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');
moment.suppressDeprecationWarnings = true;

module.exports = class ApproveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'approve',
      category: 'Staff',
      description: 'Approve a submitted suggestion via the suggestion ID (sID).',
      usage: 'approve <sID> [response]',
      staffOnly: true,
      guildOnly: false,
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    const { approved } = this.client.config.suggestionColors;

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

    if (!sID._id) return this.client.errors.noSuggestion(message.channel, id);

    if (!message.guild) {
      try {
        guild = this.client.guilds.get(sID.guildID);
        settings = await this.client.settings.getGuild(sID.guildID);
      } catch (err) {
        this.client.logger.error(err.message);
        return message.channel.send(`An error occurred: **${err.message}**`);
      }
    }

    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    const suggestionsChannel = guild.channels.find(c => c.name === settings.suggestionsChannel) ||
            (guild.channels.find(c => c.toString() === settings.suggestionsChannel)) ||
            (guild.channels.get(settings.suggestionsChannel));

    const suggestionsLogs = guild.channels.find(c => c.name === settings.suggestionsLogs) ||
            (guild.channels.find(c => c.toString() === settings.suggestionsLogs)) ||
            (guild.channels.get(settings.suggestionsLogs));

    if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);

    const {
      userID,
      username,
      suggestion,
      status
    } = sID;

    if (status === 'approved') {
      return message.channel.send(`sID **${id}** has already been approved. Cannot do this action again.`)
        .then(msg => msg.delete(3000))
        .catch(err => this.client.logger.error(err.stack));
    }

    const sUser = this.client.users.get(userID);
    if (!message.guild.members.get(sUser.id)) {
      message.channel.send(`**${username}** is no longer in the guild, but their suggestion will still be approved.`)
        .then(msg => msg.delete(3000))
        .catch(err => this.client.logger.error(err.stack));
    }

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
        .setTitle('Suggestion Approved')
        .setColor(approved);

      const dmEmbed = new RichEmbed()
        .setAuthor(guild, guild.iconURL)
        .setDescription(`Hey, ${sUser}. Your suggestion has been approved by ${message.author}!
                            
                Your suggestion ID (sID) for reference was **${id}**.
                `)
        .setColor(approved)
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

      const nerdSuccess = this.client.guilds.get('345753533141876737').emojis.find(e => e.name === 'nerdSuccess');
      const nerdError = this.client.guilds.get('345753533141876737').emojis.find(e => e.name === 'nerdError');

      results.forEach(result => {
        if (result.emoji === 'nerdSuccess') result.emoji = nerdSuccess.toString();
        if (result.emoji === 'nerdError') result.emoji = nerdError.toString();
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
        .setColor(approved)
        .setFooter(`sID: ${id}`)
        .setTimestamp();

      if (reply) {
        dmEmbed.setDescription(`Hey, ${sUser}. Your suggestion has been approved by ${message.author}!
        
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
        
                **Approved By:**
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

        const approveSuggestion = {
          query: [
            { guildID: guild.id },
            { sID: id }
          ],
          data: {
            status: 'approved',
            newStatusUpdated: message.createdAt.getTime(),
            statusReply: reply || null,
            staffMemberID: message.author.id,
            newResults
          }
        };

        try {
          const sMessage = await suggestionsChannel.fetchMessage(embed.message.id);
          message.channel.send(`Suggestion **${id}** has been approved.`).then(m => m.delete(5000));
          sMessage.edit(approvedEmbed).then(m => m.delete(5000));
          suggestionsLogs.send(logsEmbed);
          try {
            if (settings.dmResponses) sUser.send(dmEmbed);
          } catch (err) {
            message.channel.send(`**${sUser.tag}** has DMs disabled, but their suggestion will still be approved.`);
          }

          await this.client.suggestions.handleGuildSuggestion(approveSuggestion);
        } catch (err) {
          this.client.logger.error(err.stack);
          message.delete(3000).catch(O_o => {});
          message.channel.send(`Error updating this suggestion in the database: **${err.message}**`);
        }
      }
      return;
    });
    return;
  }
};
