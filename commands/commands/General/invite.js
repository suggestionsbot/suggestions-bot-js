const { MessageEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class InviteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      category: 'General',
      description: 'Receive a DM with information on inviting the bot to your server.',
      aliases: ['botinvite'],
      botPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args) {

    const { embedColor, discord, invite, website } = this.client.config;

    const dmEmbed = new MessageEmbed()
      .setAuthor('Bot Invite Information', this.client.user.avatarURL())
      .setDescription(`Hello ${message.author},
        
          **Before inviting, you need** \`MANAGE SERVER\` **or** \`ADMINISTRATOR\` **permissions to add bots to a server.** 
      
          **Bot Invite:**
          ${invite}

          **Website:**
          ${website}

          **Support Server:**
          ${discord}
      `)
      .setColor(embedColor)
      .setTimestamp();

    if (message.guild) await message.react('📧').then(() => message.delete({ timeout: 2500 }));
    await message.author.send(dmEmbed).catch(err => {
      this.client.logger.error(err);
      return message.reply('you have DMs disabled! I could not send you the invite link. Enable them to receive the bot invite link.');
    });

  }
};
