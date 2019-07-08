/* eslint-disable no-useless-escape */
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
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS']
    });
    this.voteEmojis = require('../../../utils/voteEmojis');
  }

  async run(message, args, settings) {

    const { embedColor, emojis: { success } } = this.client.config;

    let id = crypto.randomBytes(20).toString('hex').slice(12, 20);

    let verifySuggestion;
    try {
      verifySuggestion = await this.client.suggestions.getGlobalSuggestion(id);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`Error querying the database for this guild's suggestions: **${err.message}**.`);
    }

    const { suggestionsChannel } = settings;

    const sUser = message.author;
    const sChannel = message.guild.channels.find(c => c.name === suggestionsChannel) ||
      message.guild.channels.find(c => c.toString() === suggestionsChannel) ||
      message.guild.channels.get(suggestionsChannel);
    if (!sChannel) return this.client.errors.noSuggestions(message.channel);

    const emojis = settings.voteEmojis;

    // If the sID exists globally, this will force a new one to be generated
    if (verifySuggestion) id = crypto.randomBytes(20).toString('hex').slice(12, 20);

    const suggestion = args
      .join(' ')
      .replace(/<br ?\/?>/g, '\n')
      .replace(/"/g, '\\"');
    if (!suggestion) return this.client.errors.noUsage(message.channel, this, settings);

    const suggestionArgs = args;
    for (let i = 0; i < suggestionArgs.length; i++) {
      suggestionArgs[i] = suggestionArgs[i].replace(/\n/g, '<br/>');
    }

    const cleanedSuggestion = suggestionArgs
      .join(' ')
      .replace(/"/g, '\\"');

    try {

      await this.client.shard.broadcastEval(`
        (async () => {
          const { Constants, RichEmbed, Guild, Emoji } = require('discord.js');
          const { stripIndents } = require('common-tags');

          const senderMessage = await this.channels.get('${message.channel.id}')
            .fetchMessage('${message.id}');
          if (!senderMessage) return false;
          const sUser = this.users.get('${message.author.id}');

          const imageCheck = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.exec("${cleanedSuggestion}");

          const sEmbed = new RichEmbed()
            .setThumbnail('${sUser.avatarURL}')
            .setDescription(stripIndents\`
              **Submitter**
              ${sUser.tag}

              **Suggestion**
              ${suggestion}
              \`)
            .setColor('${embedColor}')
            .setFooter('User ID: ${sUser.id} | sID: ${id}')
            .setTimestamp();

          const dmEmbed = new RichEmbed()
            .setAuthor(senderMessage.guild, senderMessage.guild.iconURL)
            .setDescription(stripIndents\`Hey, ${sUser}. Your suggestion has been sent to the ${sChannel} channel to be voted on!
                  
                Please wait until it gets approved or rejected by a staff member.
            
                Your suggestion ID (sID) for reference is **${id}**.
            \`)
            .setColor('${embedColor}')
            .setFooter(\`Guild ID: ${message.guild.id} | sID: ${id}\`)
            .setTimestamp();

          if (imageCheck) sEmbed.setImage(imageCheck[0]);

          const filter = set => set.name === '${emojis}';
          const defaults = set => set.name === 'defaultEmojis';
          const fallback = set => set.name === 'oldDefaults';

          const channel = this.channels.get('${sChannel.id}');
          const sendMsgs = channel.permissionsFor(senderMessage.guild.me).has('SEND_MESSAGES', false);
          const reactions = channel.permissionsFor(senderMessage.guild.me).has('ADD_REACTIONS', false);
          if (!sendMsgs) return this.errors.noChannelPerms(senderMessage, channel, 'SEND_MESSAGES');
          if (!reactions) return this.errors.noChannelPerms(senderMessage, channel, 'ADD_REACTIONS');

          const m = await channel.send(sEmbed);

          const foundSet = this.voteEmojis.find(filter) || this.voteEmojis.find(defaults);
          const emojiSet = foundSet.emojis;
          const fallbackSet = this.voteEmojis.find(fallback).emojis;  

          for (const emoji of emojiSet) {
            const e = this.findEmojiByID(emoji);
            if (e) {
              await this.rest.makeRequest('get', Constants.Endpoints.Guild(e.guild).toString(), true)
                .then(async raw => {
                  const guild = new Guild(this, raw)
                  const emoji = new Emoji(guild, e);
                  return await m.react(emoji);
                });
            } else {
              await m.react(fallbackSet[i]);
            }
          }

          const newSuggestion = {
            guildID: senderMessage.guild.id,
            userID: senderMessage.author.id,
            messageID: m.id,
            suggestion: "${cleanedSuggestion}",
            sID: '${id}',
            time: m.createdAt.getTime()
          };

          try {
            if ((${settings.dmResponses} === true) &&
              senderMessage.guild.members.get(sUser.id)
            ) {
              sUser.send(dmEmbed);
            }
          } catch (err) {
            this.logger.error(err.stack);
            senderMessage.channel.send(stripIndents\`✅
              An error occurred DMing you your suggestion information: **err.message**. Please make sure you are able to receive messages from server members.
      
              For reference, your suggestion ID (sID) is **${id}**. Please wait for staff member to approve/reject your suggestion.\`
            );
          }

          await this.suggestions.submitGuildSuggestion(newSuggestion);
          if (${settings.dmResponses} === true) {
            senderMessage.react('✉');
          } {
            // senderMessage.react(successEmoji);
            const e = this.findEmojiByName('${success}');
            if (e) {
              const emoji = await this.rest.makeRequest('get', Constants.Endpoints.Guild(e.guild).toString(), true)
              .then(raw => {
                const guild = new Guild(this, raw)
                const emoji = new Emoji(guild, e);
                return senderMessage.react(emoji);
              });
            } else {
              senderMessage.react('✅');
            }
          }
          senderMessage.delete(3000).catch(O_o=>{});

          if (${settings.fetchedMessages} === false) {
            const messages = await channel.fetchMessages();
            const filtered = messages
              .filter(m => m.embeds.length >= 1 && m.author.id === this.user.id);

            for (const m of filtered.array()) {
              const footer = m.embeds[0].footer.text.split('sID:');
              const sID = footer[1].trim();

              const suggestion = await this.suggestions
                .getGuildSuggestion(m.guild.id, sID);
              if (!suggestion || suggestion.messageID) break;

              const updateSuggestion = {
                query: [
                  { guildID: m.guild.id },
                  { sID: sID }
                ],
                data: { messageID: m.id }
              };

              await this.suggestions.updateGuildSuggestion(updateSuggestion);
            }

            await this.settings.updateGuild(senderMessage.guild.id, { fetchedMessages: true });
          }

          return;
        })();
      `);
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(`An error occurred: **${err.message}**.`);
    }

    return;
  }
};
