const { MessageEmbed } = require('discord.js-light');

const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { displayTimestamp } = require('../../utils/functions');

module.exports = class MySuggestionsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'suggestions',
      category: 'Suggestions',
      description: 'View your own suggestions data or another user\'s data in this guild.',
      botPermissions: ['MANAGE_MESSAGES'],
      aliases: ['mysuggestions'],
      usage: 'suggestions [@User]',
      guildOnly: false
    });
  }

  async run(message, args) {

    const { embedColor } = this.client.config;

    await message.delete().catch(O_o => {});

    const getSubmitter = async userID => {
      return message.guild
        ? await message.guild.members.fetch({ user: userID, cache: false })
        : await this.client.users.fetch(userID, false);
    };

    const submitter = (message.guild ? message.mentions.members.first() : message.mentions.users.first()) ||
      args[0] && await getSubmitter(args[0]).catch(err => Logger.errorCmd(this, err)) ||
      message.author;

    console.log(submitter);

    const avatarURL = submitter.guild ? submitter.user.avatarURL() : submitter.avatarURL();

    let gSuggestions;
    try {
      if (message.guild) gSuggestions = await this.client.mongodb.helpers.suggestions.getGuildMemberSuggestions(message.guild, submitter);
      else gSuggestions = await this.client.mongodb.helpers.suggestions.getUserGlobalSuggestions(submitter);
    } catch (err) {
      Logger.errorCmd(this, err.stack);
      return message.channel.send(`Error querying the database for your suggestions: **${err.message}**.`);
    }

    gSuggestions = gSuggestions.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

    if (gSuggestions.length === 0) {
      return message.channel.send(`No suggestions data exists for **${submitter?.user?.tag ?? submitter?.tag}**${message.guild ? ' in this guild' : ''}!`)
        .then(msg => msg.delete({ timeout: 3000 }))
        .catch(err => Logger.errorCmd(this, err.stack));
    }

    const total = gSuggestions.length;
    const approved = gSuggestions.filter(s => s.status === 'approved').length;
    const rejected = gSuggestions.filter(s => s.status === 'rejected').length;

    const suggestions = [];
    if (total >= 1) suggestions.push(`Total: \`${total}\``);
    if (approved >= 1) suggestions.push(`Approved: \`${approved}\``);
    if (rejected >= 1) suggestions.push(`Rejected: \`${rejected}\``);

    const lastSuggestion = gSuggestions[0];

    let lastDate;
    if (lastSuggestion.time) lastDate = displayTimestamp(lastSuggestion.time);
    if (lastSuggestion.newTime) lastDate = displayTimestamp(lastSuggestion.newTime);

    const lastsID = lastSuggestion.sID;
    const lastSuggestionInfo = `\`${lastsID}\` (${lastDate})`;

    const embed = new MessageEmbed()
      .setColor(embedColor)
      .setThumbnail(avatarURL)
      .addField('User', `${submitter} \`[${submitter.id}]\``)
      .setTimestamp();

    if (message.guild) {
      embed
        .setAuthor(`${submitter.guild ? submitter.user.tag : submitter.tag} | ${message.guild}`, avatarURL)
        .addField('Created On', `<t:${message.guild.createdAt}>`)
        .addField('Joined', `<t:${submitter.joinedAt}>`);
    } else embed.setAuthor(`${submitter.tag} | Global Statistics`, avatarURL);


    if (gSuggestions.length >= 1) {
      embed.addField('Suggestions', suggestions.join('\n'));
      embed.addField('Last Suggestion (sID)', lastSuggestionInfo);
    }

    return message.channel.send(embed);
  }
};
