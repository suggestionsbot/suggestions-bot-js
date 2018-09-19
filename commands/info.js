const Discord = require('discord.js');
const { orange, discord, owner, docs } = require('../config.json');

exports.run = (client, message, args) => {
    
    const embed = new Discord.RichEmbed()
        .setTitle(client.user.username)
        .setDescription('This is a bot that allows a user to submit new suggestions in your discord.')
        .setColor(orange)
        .setThumbnail(client.user.avatarURL)
        .addField('Bot Author', `<@${owner}>`)
        .addField('Support Discord', discord)
        .addField('Documentation', docs)
        .setFooter('© 2018 The Nerd Cave');

    let perms = message.guild.me.permissions;
    if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: `Embed Links`').then(msg => msg.delete(5000));
    if (!perms.has('ADD_REACTIONS')) return message.channel.send('I can\'t add reactions! Make sure I have this permission: `Add Reactions`').then(msg => msg.delete(5000));

    message.channel.send(embed);
};

exports.conf = {
    aliases: ['botinfo', 'suggestions'],
    status: 'true'
};

exports.help = {
    name: 'info',
    description: 'View bot information',
    usage: 'info'
};