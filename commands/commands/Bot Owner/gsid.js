const { Constants, MessageEmbed, Guild, GuildEmoji } = require('discord.js');
const { stripIndent } = require('common-tags');
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
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS']
    });
  }

  async run(message, args, settings) {

    const { embedColor, suggestionColors } = this.client.config;

    message.delete().catch(O_o => {});

    if (!args[0]) return this.client.errors.noUsage(message.channel, this, settings);

    let suggestion;
    try {
      suggestion = await this.client.suggestions.getGlobalSuggestion(args[0]);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**`);
    }

    if (!suggestion) return this.client.errors.noSuggestion(message.channel, args[0]);

    let updatedOn,
      sStaff;

    if (suggestion.statusUpdated) updatedOn = suggestion.statusUpdated;
    if (suggestion.newStatusUpdated) updatedOn = suggestion.newStatusUpdated;

    const sUser = await this.client.users.fetch(suggestion.userID).catch(err => this.client.logger.error(err));

    if (suggestion._doc.hasOwnProperty('staffMemberID')) {
      sStaff = await this.client.users.fetch(suggestion.staffMemberID).catch(err => this.client.logger.error(err));
    }

    const sGuild = await this.client.shard.broadcastEval(`this.guilds.cache.get('${suggestion.guildID}')`)
      .then(guildArray => {
        const found = guildArray.find(g => g);
        if (!found) return;
        return found;
      })
      .catch(error => {
        this.client.logger.error(error.stack);
        return message.channel.send(`An error occurred: **${error.message}**`);
      });

    const guildIconURL = `https://cdn.discordapp.com/icons/${sGuild.id}/${sGuild.icon}.png?size=1024`;

    const embed = new MessageEmbed()
      .setAuthor(sGuild.name, guildIconURL)
      .setTitle(`Info for ${suggestion.sID}`)
      .setFooter(`User ID: ${sUser.id} | sID: ${suggestion.sID}`);

    let view,
      time;
    if (suggestion.time && !suggestion.newTime) time = suggestion.time;
    if (!suggestion.time && suggestion.newTime) time = suggestion.newTime;
    if (!suggestion.time && !suggestion.newTime) time = suggestion._id.getTimestamp();

    if (suggestion.results.length > 1) {
      const results = suggestion.results.map(async r => {
        await this.client.shard.broadcastEval(`this.findEmojiByString.call(this, '${r.emoji}')`)
          .then(async emojiArray => {
            const found = emojiArray.find(e => e);
            if (!found) return r.emoji = r.emoji || '**N/A**';

            const emoji = await this.client.api.guilds(found.guild).get()
              .then(raw => {
                const guild = new Guild(this.client, raw);
                const gEmoji = new GuildEmoji(this.client, found, guild);
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

    switch (suggestion.status) {
    case undefined: {
      embed
        .setDescription(stripIndent`
          **Submitter**
          ${sUser}

          **Suggestion**
          ${suggestion.suggestion}
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
          ${suggestion.suggestion}

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
          ${suggestion.suggestion}

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
