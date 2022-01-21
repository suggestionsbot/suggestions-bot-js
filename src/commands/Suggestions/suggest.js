/* eslint-disable no-useless-escape */
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js-light');
const { oneLine, stripIndent } = require('common-tags');
const crypto = require('crypto');
const Logger = require('../../utils/logger');

const Command = require('../../structures/Command');
const { getDefaultSuggestionsChannel, messageDelete, cacheChannel, getChannelAndCache } = require('../../utils/functions');

module.exports = class SuggestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'suggest',
      category: 'Suggestions',
      description: 'Submit a new suggestion.',
      usage: 'suggest <suggestion>',
      throttling: {
        usages: 3,
        duration: 60
      },
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS']
    });
  }

  async run(message, args, settings) {
    const { embedColor, emojis: { success: successEmoji }, defaultPermissions } = this.client.config;
    const { suggestionsChannel, voteEmojis: emojis } = settings;
    const suggestion = args.join(' ');

    if (!suggestion) return this.client.errors.noUsage(message.channel, this, settings);

    const imageCheck = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gifv?|png|webp|bmp|tiff?)/.exec(suggestion);

    const id = crypto.randomBytes(20).toString('hex').slice(33, 40);

    const sUser = message.author;
    let sChannel;
    try {
      if (!suggestionsChannel || (suggestionsChannel === this.client.config.suggestionsChannel)) {
        const channel = await getDefaultSuggestionsChannel(message.guild);
        if (!channel) return this.client.errors.noSuggestions(message.channel);

        await this.client.mongodb.helpers.settings.updateGuild(message.guild, { suggestionsChannel: channel.id });
        await cacheChannel(this.client, channel.id, message.guild);
        sChannel = channel;
      } else {
        sChannel = suggestionsChannel && await getChannelAndCache(this.client, settings.suggestionsChannel, message.guild);
        if (!sChannel) return this.client.errors.noSuggestions(message.channel);
      }
    } catch (e) {
      return this.client.errors.noSuggestions(message.channel);
    }

    const embed = new MessageEmbed()
      .setDescription(stripIndent`
        **Submitter**
        ${escapeMarkdown(sUser.tag)}

        **Suggestion**
        ${suggestion}
      `)
      .setThumbnail(sUser.avatarURL())
      .setColor(embedColor)
      .setFooter({ text: `User ID: ${sUser.id} | sID: ${id}` })
      .setTimestamp();

    if (imageCheck) embed.setImage(imageCheck[0]);

    const dmEmbed = new MessageEmbed()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
      .setDescription(stripIndent`Hey, ${sUser}. Your suggestion has been sent to the ${sChannel} channel to be voted on!
        
      Please wait until it gets approved or rejected by a staff member.

      Your suggestion ID (sID) for reference is **${id}**.
      `)
      .setColor(embedColor)
      .setFooter({ text: `Guild ID: ${message.guild.id} | sID: ${id}` })
      .setTimestamp();

    const filter = set => set.name === emojis;
    const defaults = set => set.name === 'defaultEmojis';
    const fallback = set => set.name === 'oldDefaults';

    const missingPermissions = sChannel.permissionsFor(message.guild.me).missing(defaultPermissions);
    if (missingPermissions.length > 0) return this.client.errors.noChannelPerms(message, sChannel, missingPermissions);

    let m,
      mID;
    try {
      m = await sChannel.send({ embeds: [embed] });
      mID = m.id;

      const foundSet = this.client.voteEmojis.find(filter) || this.client.voteEmojis.find(defaults);
      const emojiSet = foundSet.emojis;
      const fallbackSet = this.client.voteEmojis.find(fallback).emojis;

      for (const e of emojiSet) {
        const emojiIndex = emojiSet.indexOf(e);
        if (!m) m = await sChannel.messages.fetch(mID);

        if (foundSet.custom) {
          await m.react(message.guild.emojis.resolve(e))
            .catch(() => m.react(fallbackSet[emojiIndex]));
        } else await m.react(e);
      }
    } catch (error) {
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }

    try {
      if (settings.dmResponses) await sUser.send({ embeds: [dmEmbed] });
      await message.react(this.client.emojis.resolve(successEmoji));
    } catch (error) {
      message.channel.send(oneLine`
        I could not DM you because you have DMs disabled from server members. However, for reference, your suggestion
        ID (sID) is **${id}**. Please wait for a staff member to approve/reject your suggestion.
      `);
    }

    try {
      if (!m) await sChannel.messages.fetch(mID);
    } catch (error) {
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
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
      await this.client.mongodb.helpers.suggestions.submitGuildSuggestion(newSuggestion);
      await messageDelete(message, 5000);
    } catch (error) {
      if (error.message === 'Unknown Message') return;
      Logger.errorCmd(this, error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }
  }
};
