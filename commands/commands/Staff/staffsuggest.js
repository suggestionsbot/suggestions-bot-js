const { RichEmbed } = require('discord.js');
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

    const { embedColor } = this.client.config;

    await message.delete().catch(O_o => {});

    const sUser = message.member;
    const sChannel = message.guild.channels.find(c => c.name === settings.staffSuggestionsChannel) ||
      message.guild.channels.find(c => c.toString() === settings.staffSuggestionsChannel) ||
      message.guild.channels.get(settings.staffSuggestionsChannel);
    if (!sChannel) return this.client.errors.noStaffSuggestions(message.channel);

    if (!settings.staffRoles) return this.client.errors.noStaffRoles(message.channel);

    const embed = new RichEmbed()
      .setDescription(`Hey, ${sUser.user.tag}. Your suggestion has been added in the ${sChannel} channel to be voted on!`)
      .setColor(embedColor)
      .setAuthor(sUser.displayName)
      .setFooter(`User ID: ${sUser.id}`)
      .setTimestamp();

    const suggestion = args.join(' ');
    if (!suggestion) this.client.errors.noUsage(message.channel, this, settings);

    const sEmbed = new RichEmbed()
      .setDescription(`
      **Submitter**
      ${sUser.user.tag}

      **Suggestion**
      ${suggestion}
      `)
      .setThumbnail(sUser.avatarURL)
      .setColor(embedColor)
      .setFooter(`User ID: ${sUser.id}`)
      .setTimestamp();

    const sendMsgs = sChannel.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
    const reactions = sChannel.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
    if (!sendMsgs) return this.client.errors.noChannelPerms(message, sChannel, 'SEND_MESSAGES');
    if (!reactions) return this.client.errors.noChannelPerms(message, sChannel, 'ADD_REACTIONS');

    message.channel.send(embed).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

    this.client.logger.log(`New staff suggestion submitted by "${sUser.user.tag}" (${sUser.id}) in "${message.guild}" (${message.guild.id})`);

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
