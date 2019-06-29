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
      botPermissions: ['MANAGE_MESSAGES'],
      enabled: true
    });
  }

  async run(message, args, settings) {

    message.delete().catch(O_o => {});

    const id = args[0];
    const reply = args.slice(1).join(' ');
    if (!id) return this.client.errors.noUsage(message.channel, this, settings);

    await this.client.shard.broadcastEval(`
      (async () => {
        const { RichEmbed } = require('discord.js');

        const { approved } = this.config.suggestionColors;

        let settings;
        const senderMessage = await this.channels.get('${message.channel.id}')
            .fetchMessage('${message.id}');

        let sID;
        try {
          sID = await this.suggestions.getGlobalSuggestion('${id}');
        } catch (err) {
          this.logger.error(err.stack);
          return senderMessage.channel.send('Error querying the database for this suggestion: **' + err.message + '**.');
        }

        if (!sID) return this.errors.noSuggestion(senderMessage.channel, id);
        const {
          userID,
          guildID,
          messageID,
          suggestion,
          status
        } = sID;

        if (status === 'approved') {
          return senderMessage.channel.send('sID **${id}** has already been approved. Cannot do this action again.')
            .then(msg => msg.delete(3000))
            .catch(err => this.logger.error(err.stack));
        }

        const sUser = this.users.get(userID);
        const guild = this.guilds.get(guildID);
        if (!guild.members.get(sUser.id)) {
          message.channel.send('**' + sUser.tag + '** is no longer in the guild, but their suggestion will still be approved.')
            .then(msg => msg.delete(3000));
        }

        try {
          settings = await this.settings.getGuild(guild);
        } catch (error) {
          this.logger.error(error.stack);
          return senderMessage.channel.send("An error occurred: **" + error.message + "**");
        }

        if (!settings.staffRoles) this.logger.log('does not exist yo');

        if (!settings.staffRoles) return this.errors.noStaffRoles(senderMessage.channel);

        const reply = "${reply}" || null;

        if (messageID === false) {
          return senderMessage.channel.send('Oops! The message ID was not found ' +
          'for this suggestion! Please contact the developer via the Support Discord: ' +
          this.config.discord
          );
        }

        const suggestionsChannel = guild.channels.find(c => c.name === settings.suggestionsChannel) ||
          guild.channels.get(settings.suggestionsChannel);

        const suggestionsLogs = guild.channels.find(c => c.name === settings.suggestionsLogs) ||
          guild.channels.get(settings.suggestionsLogs);\
    
        if (!suggestionsLogs) return this.errors.noSuggestionsLogs(senderMessage.channel);

        let sMessage;
        try {
          sMessage = await suggestionsChannel.fetchMessage(messageID);
        } catch (err) {
          this.client.logger.error(err.stack);
          return message.channel.send('The suggestion message was not found!')
            .then(m => m.delete(5000));
        }

        const embed = sMessage.embeds[0];

        const approvedEmbed = new RichEmbed(embed)
          .setTitle('Suggestion Approved')
          .setColor(approved);

        const dmEmbed = new RichEmbed()
          .setAuthor(guild, guild.iconURL)
          .setDescription(
            'Hey ' + sUser.toString() + \`. Your suggestion has been approve by ${message.author}!

            Your suggestion ID (sID) for reference was **${id}**.\`
          )
          .setColor(approved)
          .setFooter(\`Guild ID: \` + guild.id + \` | sID: ${id}\`)
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

        const nerdSuccess = this.emojis.find(e => e.name === 'nerdSuccess');
        const nerdError = this.emojis.find(e => e.name === 'nerdError');

        const nerdApprove = this.emojis.find(e => e.name === 'nerdApprove');
        const nerdDisapprove = this.emojis.find(e => e.name === 'nerdDisapprove');

        results.forEach(result => {
          if (result.emoji === 'nerdSuccess') result.emoji = nerdSuccess.toString();
          if (result.emoji === 'nerdError') result.emoji = nerdError.toString();
          if (result.emoji === 'nerdApprove') result.emoji = nerdApprove.toString();
          if (result.emoji === 'nerdDisapprove') result.emoji = nerdDisapprove.toString();
        });

        const newResults = Array.from(results);
        const view = newResults.map(r => {
          return r.emoji + ' **: ' + r.count + '**' + \`
          \`;
        }).join(' ');

        const logsEmbed = new RichEmbed()
          .setAuthor(guild.name, guild.iconURL)
          .setDescription(\`
            **Results:**
          \` + view + \`
            **Suggestion:**
          \` + suggestion + \`

            **Submitter:**
            \` + sUser.toString() + \`
            
            **Approved By:**
            ${message.author}
            \`
          )
          .setColor(approved)
          .setFooter(\`sID: ${id}\`)
          .setTimestamp();

        if (reply !== null) {
          dmEmbed.setDescription(\`Hey, sUser. Your suggestion has been approved by ${message.author}!
          
            Staff response: **\` + reply + \`**
                                
            Your suggestion ID (sID) for reference was **${id}**.
          \`);

          logsEmbed
            .setDescription(\`
              **Results:**
            \` + view + \`
              **Suggestion:**
              \` + suggestion + \`

              **Submitter:**
              \` + sUser.toString() + \`
              
              **Approved By:**
              ${message.author}

              **Response:**
              \` + reply
            );
        }

        const sendMsgs = suggestionsLogs.permissionsFor(guild.me).has('SEND_MESSAGES', false);
        const addReactions = suggestionsLogs.permissionsFor(guild.me).has('ADD_REACTIONS', false);
        if (!sendMsgs) return senderMessage.channel.send("I can't send messages in the " + suggestionsLogs.toString() + "channel! Make sure I have the \`Send Messages\` permission.");
        if (!addReactions) return senderMessage.channel.send("I can't add reactions in the " + suggestionsLogs.toString() + "channel! Make sure I have the \`Add Reactions\` permission.");

        const approveSuggestion = {
          query: [
            { guildID: guild.id },
            { sID: '${id}' }
          ],
          data: {
            status: 'approved',
            statusUpdated: senderMessage.createdAt.getTime(),
            statusReply: reply,
            staffMemberID: senderMessage.author.id,
            results
          }
        };

        try {
          senderMessage.channel.send('Suggestion **${id}** has been approved.').then(m => m.delete(5000));
          sMessage.edit(approvedEmbed).then(m => m.delete(5000));
          suggestionsLogs.send(logsEmbed);
          try {
            if ((settings.dmResponses === true) && guild.members.get(sUser.id)) sUser.send(dmEmbed);
          } catch (err) {
            message.channel.send('**' + sUser.tag + '** has DMs disabled, but their suggestion will still be approved.');
          }

          await this.suggestions.handleGuildSuggestion(approveSuggestion);
        } catch (err) {
          this.logger.error(err.stack);
          senderMessage.delete(3000).catch(O_o => {});
          senderMessage.channel.send('An error occurred: **' + err.message + '**');
        }
      })();
    `);

    return;
  }
};
