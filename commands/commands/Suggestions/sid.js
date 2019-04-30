const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

module.exports = class SIDCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sid',
      category: 'Suggestions',
      description: 'View the information of a specific guild suggestion by their sID.',
      usage: 'sid <sID>',
      botPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(message, args, settings) {

    const { embedColor, suggestionColors } = this.client.config;

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    let sID;
    try {
      sID = await this.client.suggestions.getGuildSuggestion(message.guild, args[0]);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error querying the database for this suggestion: **${err.message}**.`);
    }

    if (!sID) return this.client.errors.noSuggestion(message.channel, args[0]);

    let submittedOn,
      updatedOn;

    if (sID.time) submittedOn = moment(new Date(sID.time)).utc().format('MM/DD/YY @ h:mm A (z)');
    if (sID.newTime) submittedOn = moment(new Date(sID.newTime)).utc().format('MM/DD/YY @ h:mm A (z)');

    if (sID.statusUpdated) updatedOn = moment.utc(new Date(sID.statusUpdated)).format('MM/DD/YY @ h:mm A (z)');
    if (sID.newStatusUpdated) updatedOn = moment.utc(new Date(sID.newStatusUpdated)).format('MM/DD/YY @ h:mm A (z)');

    const sUser = this.client.users.get(sID.userID);
    const sStaff = this.client.users.get(sID.staffMemberUserID);

    const embed = new RichEmbed()
      .setAuthor(message.guild, message.guild.iconURL)
      .setTitle(`Info for sID ${sID.sID}`)
      .setFooter(`User ID: ${sUser.id} | sID ${sID.sID}`);

    let nResults = [];
    if (sID.newResults && sID.newResults.length > 1) nResults = sID.newResults.map(r => `${r.emoji} **${r.count}**`);

    switch (sID.status) {
    case undefined:
      embed.setDescription(`
                **Submitter**
                ${sUser}
        
                **Suggestion**
                ${sID.suggestion}
    
                **Submitted**
                ${submittedOn}`);
      embed.setColor(embedColor);
      message.channel.send(embed);
      break;
    case 'approved':
      embed.setDescription(`
                **Submitter**
                ${sUser}

                **Suggestion**
                ${sID.suggestion}

                **Submitted**
                ${submittedOn}

                **Approved**
                ${updatedOn}

                **Approved By**
                ${sStaff}

                **Results**
                ${nResults.join('\n') || sID.results}
            
                `);
      embed.setColor(suggestionColors.approved);
      message.channel.send(embed);
      break;
    case 'rejected':
      embed.setDescription(`
                **Submitter**
                ${sUser}

                **Suggestion**
                ${sID.suggestion}

                **Submitted**
                ${submittedOn}

                **Rejected**
                ${updatedOn}

                **Rejected By**
                ${sStaff}

                **Results**
                ${nResults.join('\n') || sID.results}

                `);
      embed.setColor(suggestionColors.rejected);
      message.channel.send(embed);
      break;
    default:
    }
    return;
  }
};
