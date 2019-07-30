/* eslint-disable no-useless-escape */
const { Constants, RichEmbed, Guild, Emoji, Util: { escapeMarkdown } } = require('discord.js');
const { oneLine, stripIndent } = require('common-tags');
const crypto = require('crypto');
require('moment-duration-format');
require('moment-timezone');

const Command = require('../../Command');

module.exports = class SuggestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'suggest',
      category: 'Suggestions',
      description: 'Submit a new suggestion',
      usage: 'suggest <suggestion>',
      throttling: {
        usages: 3,
        duration: 60
      },
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS']
    });
  }

  async run(message, args, settings) {

    const { embedColor, emojis: { success } } = this.client.config;
    const { suggestionsChannel, voteEmojis: emojis } = settings;
    const suggestion = args.join(' ');

    if (!suggestion) return this.client.errors.noUsage(message.channel, this, settings);

    const imageCheck = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.exec(suggestion);

    let id = crypto.randomBytes(20).toString('hex').slice(12, 20);

    let verifySuggestion;
    try {
      verifySuggestion = await this.client.suggestions.getGlobalSuggestion(id);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
    }

    const sUser = message.author;
    const sChannel = message.guild.channels.find(c => c.name === suggestionsChannel) ||
      message.guild.channels.get(suggestionsChannel);
    if (!sChannel) return this.client.errors.noSuggestions(message.channel);

    // If the sID exists globally, this will force a new one to be generated
    do {
      id = crypto.randomBytes(20).toString('hex').slice(12, 20);
    } while (verifySuggestion);

    const embed = new RichEmbed()
      .setDescription(stripIndent`
        **Submitter**
        ${escapeMarkdown(sUser.tag)}

        **Suggestion**
        ${suggestion}
      `)
      .setThumbnail(sUser.avatarURL)
      .setColor(embedColor)
      .setFooter(`User ID: ${sUser.id} | sID: ${id}`)
      .setTimestamp();

    if (imageCheck) embed.setImage(imageCheck[0]);

    const dmEmbed = new RichEmbed()
      .setAuthor(message.guild, message.guild.iconURL)
      .setDescription(stripIndent`Hey, ${sUser}. Your suggestion has been sent to the ${sChannel} channel to be voted on!
        
      Please wait until it gets approved or rejected by a staff member.

      Your suggestion ID (sID) for reference is **${id}**.
      `)
      .setColor(embedColor)
      .setFooter(`Guild ID: ${message.guild.id} | sID: ${id}`)
      .setTimestamp();

    const filter = set => set.name === emojis;
    const defaults = set => set.name === 'defaultEmojis';
    const fallback = set => set.name === 'oldDefaults';

    const sendMsgs = sChannel.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
    const reactions = sChannel.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
    const extReactions = sChannel.permissionsFor(message.guild.me).has('USE_EXTERNAL_EMOJIS', false);
    if (!sendMsgs) return this.client.errors.nosChannelPerms(message, sChannel, 'SEND_MESSAGES');
    if (!reactions) return this.client.errors.nosChannelPerms(message, sChannel, 'ADD_REACTIONS');
    if (!extReactions) return this.client.errors.nosChannelPerms(message, sChannel, 'USE_EXTERNAL_EMOJIS');

    const m = await sChannel.send(embed);

    const foundSet = this.client.voteEmojis.find(filter) || this.client.voteEmojis.find(defaults);
    const emojiSet = foundSet.emojis;
    const fallbackSet = this.client.voteEmojis.find(fallback).emojis;

    for (const emoji of emojiSet) {
      const emojiIndex = emojiSet.indexOf(emoji);

      if (foundSet.custom) {
        this.client.shard.broadcastEval(`this.findEmojiByID.call(this, '${emoji}')`)
          .then(async emojiArray => {
            const found = emojiArray.find(e => e);
            if (!found) await m.react(fallbackSet[emojiIndex]);

            return this.client.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
              .then(async raw => {
                const guild = new Guild(this.client, raw);
                const gEmoji = new Emoji(guild, found);
                return await m.react(gEmoji);
              });
          })
          .catch(error => {
            this.client.logger.error(error.stack);
            return message.channel.send(`An error occurred: **${error.message}**`);
          });
      } else {
        await m.react(emoji);
      }
    }

    this.client.shard.broadcastEval(`this.findEmojiByID.call(this, '${success}')`)
      .then(async emojiArray => {
        const found = emojiArray.find(e => e);
        if (!found) return message.react('✅').then(() => message.delete(3000));

        return this.client.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
          .then(async raw => {
            const guild = new Guild(this.client, raw);
            const gEmoji = new Emoji(guild, found);
            return await message.react(gEmoji).then(() => message.delete(3000));
          });
      })
      .catch(error => {
        this.client.logger.error(error.stack);
        return message.channel.send(`An error occurred: **${error.message}**`);
      });

    try {
      if (settings.dmResponses && message.guild.members.get(sUser.id)) sUser.send(dmEmbed);
    } catch (error) {
      message.channel.send(oneLine`
        I could not DM you because you have DMs disabled from server members. However, for reference, your suggestion
        ID (sID) is **${id}**. Please wait for a staff member to approve/reject your suggestion.
      `);
    }

    const newSuggestion = {
      guildID: message.guild.id,
      userID: message.author.id,
      messageID: m.id,
      suggestion,
      sID: id,
      time: m.createdTimestamp
    };

    try {
      await this.client.suggestions.submitGuildSuggestion(newSuggestion);
    } catch (error) {
      this.client.logger.error(error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }

    if (!settings.fetchedMessages) {
      const messages = await sChannel.fetchMessages();
      const filtered = messages
        .filter(msg => msg.embeds.length >= 1 && msg.author.id === this.client.user.id);

      for (const msg of filtered.array()) {
        const footer = msg.embeds[0].footer.text.split('sID:');
        const sID = footer[1].trim();

        const data = await this.client.suggestions.getGuildSuggestion(msg.guild.id, sID);
        if (!data) break;

        const updateSuggestion = {
          query: [
            { guildID: m.guild.id },
            { sID: sID }
          ],
          data: { messageID: m.id }
        };

        try {
          await this.client.suggestions.updateGuildSuggestion(updateSuggestion);
        } catch (error) {
          this.client.logger.error(error.stack);
          return message.channel.send(`An error occurred: **${error.message}**`);
        }
      }

      try {
        await this.client.settings.updateGuild(message.guild, { fetchedMessages: true });
      } catch (error) {
        this.client.logger.error(error.stack);
        return message.channel.send(`An error occurred: **${error.message}**`);
      }
    }

    return;
  }
};
