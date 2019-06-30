const Command = require('../../Command');

module.exports = class GSIDCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'gsid',
      category: 'Suggestions',
      description: 'View the information of a specific guild suggestion by their sID (globally for bot owners).',
      usage: 'gsid <sID>',
      ownerOnly: true,
      guildOnly: false,
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    try {
      await this.client.shard.broadcastEval(`
        const { RichEmbed } = require('discord.js');
        const { embedColor, suggestionColors } = this.config;
        
        (async () => {
          const senderMessage = await this.channels.get('${message.channel.id}')
            .fetchMessage('${message.id}');

          let sID;
          try {
            sID = await this.suggestions.getGlobalSuggestion('${args[0]}');
          } catch (err) {
            this.logger.error(err.stack);
            return senderMessage.channel.send('An error occurred: **' + err.message + '**.');
          }

          if (!sID) return this.errors.noSuggestion(senderMessage.channel, id);

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

          let results,
            time;
          if (sID.time && !sID.newTime) time = sID.time;
          if (!sID.time && sID.newTime) time = sID.newTime;

          if (sID.results.length > 1) results = sID.results
            .map(r => {
              return r.emoji + ' **' + r.count + \`**
              \`;
            });

          switch (sID.status) {
            case undefined: {
              embed.setDescription(\`
                **Submitter**
                \` + sUser + \`

                **Suggestion**
                \` + sID.suggestion
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
                \` + sID.suggestion + \`

                **Approved By**
                \` + sStaff + \`

                **Results**
                \` + results.join(' ')
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
                \` + sID.suggestion + \`

                **Rejected By**
                \` + sStaff + \`

                **Results**
                \` + results.join(' ')
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
