const Discord = require('discord.js');
const config = require('../config.json');
let ORANGE = config.embedOrange;

exports.run = (client, message, args) => {
    const embed = new Discord.RichEmbed()
        .setTitle('Suggestions Bot')
        .setDescription('This is a private bot that allows user to submit new suggestions to a `#suggestions` channel.')
        .setColor(ORANGE)
        .setThumbnail('https://cdn.discordapp.com/app-icons/474051954998509571/2a0d63280cc2f2a3bcf0d71c993bcf11.png?size=512')
        .addField('Bot Author', '<@158063324699951104>')
        .addField('Discord', 'https://discord.gg/rFHHDez', false)
        .setFooter('© 2018 The Nerd Cave');

    message.channel.send(embed);
}