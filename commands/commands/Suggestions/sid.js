const { Constants, RichEmbed, Guild, Emoji } = require('discord.js');
const { stripIndent } = require('common-tags');
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

    const { embedColor, suggestionColors } = this.client.config;

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    let sID;
    try {
      sID = await this.client.suggestions.getGuildSuggestion(message.guild, args[0]);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    if (!sID) return this.client.errors.noSuggestion(message.channel, args[0]);

    let updatedOn,
      sStaff;

    if (sID.statusUpdated) updatedOn = sID.statusUpdated;
    if (sID.newStatusUpdated) updatedOn = sID.newStatusUpdated;

    const sUser = this.client.users.get(sID.userID);
    // const sStaff = this.client.users.get(sID.staffMemberID);
    if (sID.hasOwnProperty('staffMemberID')) {
      sStaff = this.client.users.get(sID.staffMemberID) ||
        await this.client.fetchUser(sID.staffMemberID);
    }


    const embed = new RichEmbed()
      .setAuthor(message.guild, message.guild.iconURL)
      .setTitle(`Info for ${sID.sID}`)
      .setFooter(`User ID: ${sUser.id} | sID: ${sID.sID}`);

    let view,
      time;
    if (sID.time && !sID.newTime) time = sID.time;
    if (!sID.time && sID.newTime) time = sID.newTime;

    if (sID.results.length > 1) {
      const results = sID.results.map(async r => {
        await this.client.shard.broadcastEval(`this.findEmojiByString.call(this, '${r.emoji}')`)
          .then(async emojiArray => {
            const found = emojiArray.find(e => e);
            if (!found) return r.emoji = r.emoji || '**N/A**';

            const emoji = await this.client.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
              .then(raw => {
                const guild = new Guild(this.client, raw);
                const gEmoji = new Emoji(guild, found);
                return gEmoji;
              });

            r.emoji = `<:${emoji.name}:${emoji.id}>`;
          })
          .catch(error => {
            this.client.logger.error(error.stack);
            return message.channel.send(`An error occurred: **${error.message}**`);
          });

        return {
          emoji: r.emoji,
          count: r.count
        };
      });

      const newResults = results.map(async r => {
        const data = await r;
        return `${data.emoji}**: ${data.count}**`;
      });

      view = await Promise.all(newResults);
    }

    switch (sID.status) {
    case undefined: {
      embed
        .setDescription(stripIndent`
          **Submitter**
          ${sUser}

          **Suggestion**
          ${sID.suggestion}
        `)
        .setColor(embedColor)
        .setTimestamp(time);
      message.channel.send(embed);
      break;
    }
    case 'approved': {
      embed
        .setDescription(stripIndent`
          **Submitter**
          ${sUser}

          **Suggestion**
          ${sID.suggestion}

          **Approved By**
          ${sStaff}

          **Results**
          ${view.join('\n')}
        `)
        .setColor(suggestionColors.approved)
        .setTimestamp(updatedOn);
      message.channel.send(embed);
      break;
    }
    case 'rejected': {
      embed
        .setDescription(stripIndent`
          **Submitter**
          ${sUser}

          **Suggestion**
          ${sID.suggestion}

          **Rejected By**
          ${sStaff}

          **Results**
          ${view.join('\n')}
        `)
        .setColor(suggestionColors.rejected)
        .setTimestamp(updatedOn);
      message.channel.send(embed);
      break;
    }
    default:
      break;
    }

    return;
  }
};
