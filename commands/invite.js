const Discord = require('discord.js');
const { orange, discord, invite, docs } = require('../config.json');

exports.run = async (client, message, args) => {
    
    const dmEmbed = new Discord.RichEmbed()
        .setAuthor('Bot Invite Information', client.user.avatarURL)
        .setDescription(`Hello ${message.author},
        
            **Before inviting, you need** \`MANAGE SERVER\` **or** \`ADMINISTRATOR\` **permissions to add bots to a server.** 
            
            **Bot Invite:**
            ${invite}

            **Documentation:**
            ${docs}

            **Support Server:**
            ${discord}
            `)
        .setColor(orange)
        .setTimestamp();

    let perms = message.guild.me.permissions;
    if (!perms.has('ADD_REACTIONS')) return message.channel.send('I can\'t add reactions! Make sure I have this permission: `Add Reactions`').then(msg => msg.delete(5000));
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    await message.react('📧').then(message.delete(2500));
    await message.member.send(dmEmbed);
};

exports.conf = {
    aliases: ['bot', 'botinvite'],
    status: 'true'
};

exports.help = {
    name: 'invite',
    description: 'Receive a DM with information on inviting the bot to your server',
    help: 'invite'
};