const Discord = require('discord.js');
const { orange, discord } = require('../config.json');

exports.run = (client, message, args) => {
    const embed = new Discord.RichEmbed()
        .setTitle('Suggestions Bot')
        .setDescription('This is a bot that allows a user to submit new suggestions to a `#suggestions` channel.')
        .setColor(orange)
        .setThumbnail('https://cdn.discordapp.com/app-icons/474051954998509571/2a0d63280cc2f2a3bcf0d71c993bcf11.png?size=512')
        .addField('Bot Author', '<@158063324699951104>')
        .addField('Support Discord', discord, false)
        .setFooter('© 2018 The Nerd Cave');

    message.channel.send(embed);
}

exports.help = {
    name: 'info',
    description: 'View bot information',
    usage: 'ban'
};