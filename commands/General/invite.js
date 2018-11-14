const { RichEmbed } = require('discord.js');
const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            category: 'General',
            description: 'Receive a DM with information on inviting the bot to your server.',
            aliases: ['bot', 'botinvite']
        });
    }

    async run(message, args) {
        
        let perms = message.guild.me.permissions;
        if (!perms.has('ADD_REACTIONS')) return noBotPerms(message, 'ADD_REACTIONS');
        if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');

        let { embedColor, discord, invite, docs } = this.client.config;
        
        const dmEmbed = new RichEmbed()
            .setAuthor('Bot Invite Information', this.client.user.avatarURL)
            .setDescription(`Hello ${message.author},
        
                **Before inviting, you need** \`MANAGE SERVER\` **or** \`ADMINISTRATOR\` **permissions to add bots to a server.** 
            
                **Bot Invite:**
                ${invite}

                **Documentation:**
                ${docs}

                **Support Server:**
                ${discord}
            `)
            .setColor(embedColor)
            .setTimestamp();

        await message.react('📧').then(message.delete(2500));
        await message.member.send(dmEmbed).catch(err => {
        this.client.logger.error(err);
        return message.reply('you have DMs disabled! I could not send you the invite link. Enable them to receive the bot invite link.');
    });

    }
};