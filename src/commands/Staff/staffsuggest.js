const { MessageEmbed } = require('discord.js-light');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { buildErrorEmbed } = require('../../utils/functions');

module.exports = class StaffSuggestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'staffsuggest',
      category: 'Staff',
      description: 'Submit a new suggestion for staff members to vote.',
      usage: 'staffsuggest <suggestion>',
      staffOnly: true,
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS']
    });
  }

  async run(message, args, settings) {

    const { colors, staffChannelPermissions } = this.client.config;

    await message.delete().catch(O_o => {});

    const sUser = message.author;

    let suggestionsChannel;
    try {
      suggestionsChannel = settings.staffSuggestionsChannel && await message.guild.channels.fetch(settings.staffSuggestionsChannel);
      if (!suggestionsChannel) return this.client.errors.noStaffSuggestions(message.channel);
    } catch (error) {
      if (!suggestionsChannel) return this.client.errors.noStaffSuggestions(message.channel);
      Logger.errorCmd(this, error.stack);
      return message.channel.send(buildErrorEmbed(error));
    }


    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    const embed = new MessageEmbed()
      .setAuthor(sUser.tag, sUser.displayAvatarURL())
      .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${suggestionsChannel} channel to be voted on!`)
      .setColor(colors.main)
      .setFooter(`User ID: ${sUser.id}`)
      .setTimestamp();

    const suggestion = args.join(' ');
    if (!suggestion) this.client.errors.noUsage(message.channel, this, settings);

    const sEmbed = new MessageEmbed()
      .setDescription(`
      **Submitter**
      ${sUser.tag}

      **Suggestion**
      ${suggestion}
      `)
      .setThumbnail(sUser.avatarURL())
      .setColor(colors.main)
      .setFooter(`User ID: ${sUser.id}`)
      .setTimestamp();

    const missingPermissions = suggestionsChannel.permissionsFor(message.guild.me).missing(staffChannelPermissions);
    if (missingPermissions.length > 0) return this.client.errors.noChannelPerms(message, suggestionsChannel, missingPermissions);

    message.channel.send(embed).then(msg => msg.delete({ timeout: 5000 })).catch(err => Logger.errorCmd(this, err.stack));

    return suggestionsChannel.send(sEmbed)
      .then(async msg => {
        await msg.react('✅');
        await msg.react('❌');
      })
      .catch(err => {
        Logger.errorCmd(this, err.stack);
        return message.channel.send(buildErrorEmbed(err));
      });
  }
};
