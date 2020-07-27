const { MessageEmbed } = require('discord.js');
const Command = require('../../Command');
require('moment-duration-format');
require('moment-timezone');

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

    const { embedColor, staffChannelPermissions } = this.client.config;

    await message.delete().catch(O_o => {});

    const sUser = message.author;
    const sChannel = message.guild.channels.cache.find(c => c.name === settings.staffSuggestionsChannel) ||
      message.guild.channels.cache.find(c => c.toString() === settings.staffSuggestionsChannel) ||
      message.guild.channels.cache.get(settings.staffSuggestionsChannel);
    if (!sChannel) return this.client.errors.noStaffSuggestions(message.channel);

    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    const embed = new MessageEmbed()
      .setAuthor(sUser.tag, sUser.displayAvatarURL())
      .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${sChannel} channel to be voted on!`)
      .setColor(embedColor)
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
      .setColor(embedColor)
      .setFooter(`User ID: ${sUser.id}`)
      .setTimestamp();

    const missingPermissions = sChannel.permissionsFor(this.client.user).missing(staffChannelPermissions);
    if (missingPermissions.length > 0) return this.client.errors.noChannelPerms(message, sChannel, missingPermissions);

    message.channel.send(embed).then(msg => msg.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err.stack));

    this.client.logger.log(`New staff suggestion submitted by "${sUser.tag}" (${sUser.id}) in "${message.guild}" (${message.guild.id})`);

    return sChannel.send(sEmbed)
      .then(async msg => {
        await msg.react('✅');
        await msg.react('❌');
      })
      .catch(err => {
        this.client.logger.error(err.stack);
        return message.channel.send(`An error occurred adding reactions to this suggestion: **${err.message}**.`);
      });
  }
};
