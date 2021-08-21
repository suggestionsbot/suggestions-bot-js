/* eslint-disable no-useless-escape */
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js-light');
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
    let sChannel;
    try {
      sChannel = suggestionsChannel && (
        suggestionsChannel === 'suggestions'
          ? await message.guild.channels.fetch({ cache: false }).then(res => res.find(c => c.name === 'suggestions'))
          : await message.guild.channels.fetch(suggestionsChannel)
      );
      if (!sChannel) return this.client.errors.noSuggestions(message.channel);
    } catch (e) {
      return this.client.errors.noSuggestions(message.channel);
    }

    // If the sID exists globally, this will force a new one to be generated
    do id = crypto.randomBytes(20).toString('hex').slice(12, 20);
    while (verifySuggestion);

    const embed = new MessageEmbed()
      .setDescription(stripIndent`
        **Submitter**
        ${escapeMarkdown(sUser.tag)}

        **Suggestion**
        ${suggestion}
      `)
      .setThumbnail(sUser.avatarURL())
      .setColor(embedColor)
      .setFooter(`User ID: ${sUser.id} | sID: ${id}`)
      .setTimestamp();

    if (imageCheck) embed.setImage(imageCheck[0]);

    const dmEmbed = new MessageEmbed()
      .setAuthor(message.guild, message.guild.iconURL())
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

    const missingPermissions = sChannel.permissionsFor(message.guild.me).missing(defaultPermissions);
    if (missingPermissions.length > 0) return this.client.errors.noChannelPerms(message, sChannel, missingPermissions);

    let m,
      mID;
    try {
      m = await sChannel.send(embed);
      mID = m.id;

      const foundSet = this.client.voteEmojis.find(filter) || this.client.voteEmojis.find(defaults);
      const emojiSet = foundSet.emojis;
      const fallbackSet = this.client.voteEmojis.find(fallback).emojis;

      for (const e of emojiSet) {
        const emojiIndex = emojiSet.indexOf(e);
        if (!m) m = await sChannel.messages.fetch(mID);

        if (foundSet.custom) {
          await m.react(message.guild.emojis.forge(e))
            .catch(() => m.react(fallbackSet[emojiIndex]));
        } else await m.react(e);
      }

      await message.react(this.client.emojis.forge(successEmoji));
      if (settings.dmResponses) await sUser.send(dmEmbed);
    } catch (error) {
      message.channel.send(oneLine`
        I could not DM you because you have DMs disabled from server members. However, for reference, your suggestion
        ID (sID) is **${id}**. Please wait for a staff member to approve/reject your suggestion.
      `);
    }

    try {
      if (!m) await sChannel.messages.fetch(mID);
    } catch (error) {
      this.client.logger.error(error.stack);
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
      await this.client.suggestions.submitGuildSuggestion(newSuggestion);
      await message.delete({ timeout: 5000 });
    } catch (error) {
      if (error.message === 'Unknown Message') return;
      this.client.logger.error(error.stack);
      return message.channel.send(`An error occurred: **${error.message}**`);
    }
  }
};
