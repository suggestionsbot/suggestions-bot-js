const { RichEmbed } = require('discord.js');
const { embedColor, discord, owner, docs } = require('../config');
const { noBotPerms } = require('../utils/errors');
const { version } = require('../package.json');

exports.run = (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('ADD_REACTIONS')) return noBotPerms(message, 'ADD_REACTIONS');
    if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');
    
    const embed = new RichEmbed()
        .setTitle(client.user.username)
        .setDescription('The only suggestions bot you\'ll ever need. Simple usage and management of suggestions for public and staff use.')
        .setColor(embedColor)
        .setThumbnail(client.user.avatarURL)
        .addField('Bot Author', `<@${owner}>`)
        .addField('Support Discord', discord)
        .addField('Documentation', docs)
        .addField('Bot Version', version)
        .setFooter('© 2018 The Nerd Cave');

    message.channel.send(embed);
};

exports.help = {
    name: 'info',
    aliases: ['botinfo', 'suggestions'],
    description: 'View bot information',
    usage: 'info'
};