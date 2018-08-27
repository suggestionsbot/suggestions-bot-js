const Discord = require('discord.js');
const { yellow, discord, invite } = require('../config.json');

exports.run = (client, message, args) => {
    
    const dmEmbed = new Discord.RichEmbed()
        .setAuthor('Bot Invite Information', client.user.avatarURL)
        .setDescription(`Hello ${message.author},
        
            **Before inviting, you need** ` + '`MANAGE SERVER` **or** `ADMINISTRATOR` **permissions to add bots to a server.** \n' + 
            `
            **Bot Invite:**
            ${invite}

            **Support Server:**
            ${discord}
            `)
        .setColor(yellow)
        .setTimestamp();

    message.react('📧').then(message.delete(2500)).catch(err => console.log(err));    
    message.member.send(dmEmbed);
}

exports.conf = {
    aliases: ['bot', 'botinvite']
}

exports.help = {
    name: 'invite',
    description: 'Receive a DM with information on inviting the bot to your server',
    help: 'invite'
}