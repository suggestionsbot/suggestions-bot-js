const Discord = require('discord.js');
const { orange, discord, invite } = require('../config.json');

exports.run = async (client, message, args) => {
    
    const dmEmbed = new Discord.RichEmbed()
        .setAuthor('Bot Invite Information', client.user.avatarURL)
        .setDescription(`Hello ${message.author},
        
            **Before inviting, you need** \`MANAGE SERVER\` **or** \`ADMINISTRATOR\` **permissions to add bots to a server.** 
            
            **Bot Invite:**
            ${invite}

            **Support Server:**
            ${discord}
            `)
        .setColor(orange)
        .setTimestamp();

    let perms = message.guild.me.permissions;

    if (!perms.has(['EMBED_LINKS', 'ADD_REACTIONS'])) {
        message.channel.send(`I'm missing some permissions!
        
        \`ADD_REACTIONS\``);
    } else {
        await message.react('📧').then(message.delete(2500));
        await message.member.send(dmEmbed);
    }
}

exports.conf = {
    aliases: ['bot', 'botinvite']
}

exports.help = {
    name: 'invite',
    description: 'Receive a DM with information on inviting the bot to your server',
    help: 'invite'
}