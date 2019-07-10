/* eslint-disable no-useless-escape */
const Command = require('../../Command');

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

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    try {
      await this.client.shard.broadcastEval(`
        const { Constants, RichEmbed, Guild, Emoji } = require('discord.js');
        const { embedColor, suggestionColors } = this.config;
        
        (async () => {
          const senderMessage = await this.channels.get('${message.channel.id}')
            .fetchMessage('${message.id}');
          if (!senderMessage) return false;

          let sID;
          try {
            sID = await this.suggestions.getGuildSuggestion(senderMessage.guild, "${args[0]}");
          } catch (err) {
            this.logger.error(err.stack);
            return senderMessage.channel.send('An error occurred: **' + err.message + '**.');
          }

          if (!sID) return this.errors.noSuggestion(senderMessage.channel, "${args[0]}");

          let submittedOn,
            updatedOn;

          if (sID.time) submittedOn = sID.time;
          if (sID.newTime) submittedOn = sID.newTime;

          if (sID.statusUpdated) updatedOn = sID.statusUpdated;
          if (sID.newStatusUpdated) updatedOn = sID.newStatusUpdated;

          const sUser = this.users.get(sID.userID);
          const sStaff = this.users.get(sID.staffMemberID);
          const sGuild = this.guilds.get(sID.guildID);

          const embed = new RichEmbed()
            .setAuthor(sGuild, sGuild.iconURL)
            .setTitle('Info for ' + sID.sID)
            .setFooter('User ID: ' + sUser.id + ' | sID: ' + sID.sID);

          const suggestion = sID.suggestion.cleanLineBreaks();

          let results,
            time;
          if (sID.time && !sID.newTime) time = sID.time;
          if (!sID.time && sID.newTime) time = sID.newTime;

          if (sID.results.length > 1) {
            results = sID.results
              .map(async r => {
                let e = this.findEmojiByString(r.emoji);
                if (e) {
                  const emoji = await this.rest.makeRequest('get', Constants.Endpoints.Guild(e.guild).toString(), true)
                    .then(raw => {
                      const guild = new Guild(this, raw)
                      const emoji = new Emoji(guild, e);
                      return emoji;
                    });

                  r.emoji = '<:' + emoji.name + ':' + emoji.id + '>';
                }

                return {
                  emoji: r.emoji,
                  count: r.count
                };
              });
          }

          const newResults = Array.from(results).map(async r => {
            const data = await r;
            return data.emoji + ' **: ' + data.count + '**' + \`
            \`;
          });
  
          const view = await Promise.all(newResults);
          const savedResults = await Promise.all(results);

          switch (sID.status) {
            case undefined: {
              embed.setDescription(\`
                **Submitter**
                \` + sUser + \`

                **Suggestion**
                \` + suggestion
              );
              embed.setColor(embedColor);
              embed.setTimestamp(submittedOn);
              senderMessage.channel.send(embed);
              break;
            }
            case 'approved': {
              embed.setDescription(\`
                **Submitter**
                \` + sUser + \`

                **Suggestion**
                \` + suggestion + \`

                **Approved By**
                \` + sStaff + \`

                **Results**
                \` + view.join(' ')
              );
              embed.setColor(suggestionColors.approved);
              embed.setTimestamp(updatedOn);
              senderMessage.channel.send(embed);
              break;
            }
            case 'rejected': {
              embed.setDescription(\`
                **Submitter**
                \` + sUser + \`

                **Suggestion**
                \` + suggestion + \`

                **Rejected By**
                \` + sStaff + \`

                **Results**
                \` + view.join(' ')
              );
              embed.setColor(suggestionColors.rejected);
              embed.setTimestamp(updatedOn);
              senderMessage.channel.send(embed);
              break;
            }
            default:
              break;
          }
        })();
      `);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    return;
  }
};
