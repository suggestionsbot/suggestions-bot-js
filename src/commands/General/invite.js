const { MessageEmbed } = require('discord.js-light');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');

module.exports = class InviteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      category: 'General',
      description: 'Receive a DM with information on inviting the bot to your server.',
      usage: 'invite [here]',
      aliases: ['botinvite'],
      botPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args, settings) {

    const { embedColor, discord, invite, website, github } = this.client.config;

    const dmEmbed = new MessageEmbed()
      .setAuthor('Bot Invite Information', this.client.user.avatarURL())
      .setDescription(`Hello ${message.author},
        
          **Before inviting, you need the** \`MANAGE SERVER\` **or** \`ADMINISTRATOR\` **permissions to add bots to a server.** 
      
          **Bot Invite:**
          ${invite}

          **Website:**
          ${website}
          
          **GitHub:**
          ${github}

          **Support Server:**
          ${discord}
      `)
      .setColor(embedColor)
      .setTimestamp();

    try {
      if (message.guild && args[0] !== 'here') {
        await message.author.send(dmEmbed);
        await message.react('📧').then(() => message.delete({ timeout: 2500 }));
      } else return await message.channel.send(dmEmbed);

    } catch (e) {
      const usage = `${settings.prefix}${this.help.name} here`;
      if (e.code === 50007) return message.reply(`you have DMs disabled! Either enable them so I can message you or run \`${usage}\`.`);
      Logger.errorCmd(this, e);
    }
  }
};
