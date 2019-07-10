const moment = require('moment');
const Command = require('../../Command');
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
      guildOnly: false,
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS']
    });

    this.voteEmojis = require('../../../utils/voteEmojis');
  }

  async run(message, args, settings) {

    message.delete().catch(O_o => {});

    const id = args[0];
    if (!id) return this.client.errors.noUsage(message.channel, this, settings);

    const replyArgs = args.slice(1);
    for (let i = 0; i < replyArgs.length; i++) {
      replyArgs[i] = replyArgs[i].replace(/\n/g, '<br/>');
    }

    const reply = args.slice(1)
      .join(' ')
      .replace(/<br ?\/?>/g, '\n')
      .replace(/"/g, '\\"') || null;

    const cleanedReply = replyArgs
      .join(' ')
      .replace(/"/g, '\\"') || null;

    await this.client.shard.broadcastEval(`
      (async () => {
        const { Constants, RichEmbed, Guild, Emoji } = require('discord.js');

        const { rejected } = this.config.suggestionColors;

        let settings;
        const senderMessage = await this.channels.get('${message.channel.id}')
          .fetchMessage('${message.id}');
        if (!senderMessage) return false;

        let sID;
        try {
          sID = await this.suggestions.getGlobalSuggestion("${id}");
        } catch (err) {
          this.logger.error(err.stack);
          return senderMessage.channel.send('Error querying the database for this suggestion: **' + err.message + '**.');
        }

        if (!sID) return this.errors.noSuggestion(senderMessage.channel, "${id}");
        
        const {
          userID,
          guildID,
          messageID,
          suggestion,
          status
        } = sID;

        if (status === 'rejected') {
          return senderMessage.channel.send('sID **${id}** has already been rejected. Cannot do this action again.')
            .then(msg => msg.delete(3000))
            .catch(err => this.logger.error(err.stack));
        }

        const sUser = this.users.get(userID);
        const guild = this.guilds.get(guildID);
        if (!guild.members.get(sUser.id)) {
          message.channel.send('**' + sUser.tag + '** is no longer in the guild, but their suggestion will still be rejected.')
            .then(msg => msg.delete(3000));
        }

        try {
          settings = await this.settings.getGuild(guild);
        } catch (error) {
          this.logger.error(error.stack);
          return senderMessage.channel.send("An error occurred: **" + error.message + "**");
        }

        if (!settings.staffRoles) return this.errors.noStaffRoles(senderMessage.channel);

        if (("${cleanedReply}" === false) && (settings.responseRequired === true)) return this.errors.noRejectedResponse(senderMessage.channel);

        if (messageID === false) {
          return senderMessage.channel.send('Oops! The message ID was not found ' +
          'for this suggestion! Please contact the developer via the Support Discord: ' +
          this.config.discord
          );
        }

        const cleanedSuggestion = suggestion.cleanLineBreaks();

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

        const rejectedEmbed = new RichEmbed(embed)
          .setTitle('Suggestion Rejected')
          .setColor(rejected);

        const dmEmbed = new RichEmbed()
          .setAuthor(guild, guild.iconURL)
          .setDescription(
            'Hey ' + sUser.toString() + \`. Your suggestion has been rejected by ${message.author}!

            Your suggestion ID (sID) for reference was **${id}**.\`
          )
          .setColor(rejected)
          .setFooter(\`Guild ID: \` + guild.id + \` | sID: ${id}\`)
          .setTimestamp();

        const reactions = embed.message.reactions;
        const reactName = reactions.map(e => e._emoji.name);
        const reactCount = reactions.map(e => e.count);

        const results = reactName.map(async (r, c) => {
          const e = this.findEmojiByName(r);
          if (e) {
            const emoji = await this.rest.makeRequest('get', Constants.Endpoints.Guild(e.guild).toString(), true)
              .then(raw => {
                const guild = new Guild(this, raw)
                const emoji = new Emoji(guild, e);
                return emoji;
              });

            r = '<:' + emoji.name + ':' + emoji.id + '>';
          }

          return {
            emoji: r,
            count: reactCount[c] - 1 || 0
          };
        });

        const newResults = Array.from(results).map(async r => {
          const data = await r;
          return data.emoji + ' **: ' + data.count + '**' + \`
          \`;
        });

        const view = await Promise.all(newResults);
        const savedResults = await Promise.all(results);

        const logsEmbed = new RichEmbed()
          .setAuthor(guild.name, guild.iconURL)
          .setDescription(\`
            **Results:**
          \` + view.join(' ') + \`
            **Suggestion:**
            \` + cleanedSuggestion + \`

            **Submitter:**
            \` + sUser.toString() + \`
            
            **Rejected By:**
            ${message.author}
            \`
          )
          .setColor(rejected)
          .setFooter(\`sID: ${id}\`)
          .setTimestamp();

        if ("${cleanedReply}" !== null) {
          dmEmbed.setDescription(\`Hey, sUser. Your suggestion has been rejected by ${message.author}!
          
            Staff response: **${reply}**
                                
            Your suggestion ID (sID) for reference was **${id}**.
          \`);

          logsEmbed
            .setDescription(\`
              **Results:**
            \` + view.join(' ') + \`
              **Suggestion:**
              \` + cleanedSuggestion + \`

              **Submitter:**
              \` + sUser.toString() + \`
              
              **Rejected By:**
              ${message.author}

              **Response:**
              ${reply}
              \`
            );
        }

        const sendMsgs = suggestionsLogs.permissionsFor(guild.me).has('SEND_MESSAGES', false);
        const addReactions = suggestionsLogs.permissionsFor(guild.me).has('ADD_REACTIONS', false);
        const extReactions = suggestionsLogs.permissionsFor(senderMessage.guild.me).has('USE_EXTERNAL_EMOJIS', false);
        if (!sendMsgs) return this.errors.noChannelPerms(senderMessage, suggestionsLogs, 'SEND_MESSAGES');
        if (!addReactions) return this.errors.noChannelPerms(senderMessage, suggestionsLogs, 'ADD_REACTIONS');
        if (!extReactions) return this.errors.noChannelPerms(senderMessage, suggestionsLogs, 'USE_EXTERNAL_EMOJIS');

        const approveSuggestion = {
          query: [
            { guildID: guild.id },
            { sID: '${id}' }
          ],
          data: {
            status: 'rejected',
            statusUpdated: senderMessage.createdAt.getTime(),
            statusReply: "${cleanedReply}",
            staffMemberID: senderMessage.author.id,
            results: savedResults
          }
        };

        try {
          senderMessage.channel.send('Suggestion **${id}** has been rejected.').then(m => m.delete(5000));
          sMessage.edit(rejectedEmbed).then(m => m.delete(5000));
          suggestionsLogs.send(logsEmbed);
          try {
            if ((settings.dmResponses === true) && guild.members.get(sUser.id)) sUser.send(dmEmbed);
          } catch (err) {
            message.channel.send('**' + sUser.tag + '** has DMs disabled, but their suggestion will still be rejected.');
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
