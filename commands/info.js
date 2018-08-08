const Discord = require('discord.js');
const config = require('../config.json');
let ORANGE = config.embedOrange;

exports.run = (client, message, args) => {
    const embed = new Discord.RichEmbed()
        .setTitle('Suggestions Bot')
        .setDescription('This is a private bot that allows user to submit new suggestions to a `#suggestions` channel.')
        .setColor(ORANGE)
        .setThumbnail('https://i.imgur.com/7UZVqf8.png')
        .addField('Bot Author', '<@158063324699951104>')
        .addField('Discord', 'https://discord.gg/rFHHDez', false)
        .setFooter('© 2018 The Nerd Cave');

    message.channel.send(embed);
}