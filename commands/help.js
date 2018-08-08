const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
let OWNER = config.owner;
let ORANGE = config.embedOrange;

exports.run = (client, message, args) => {

    const helpEmbed = new Discord.RichEmbed()
        .setTitle('Help Commands')
        .setDescription(`View all the commands for ${client.user}.`)
        .addField('User Commands', '`,suggest` | `,info` | `,ping` | `,help`')
        .addField('Bot Owner Commands', '`,beta`', false)
        .addField('Found an issue?', `Please report any issues to <@${OWNER}>.`, false)
        .setColor(ORANGE);

        message.channel.send(helpEmbed);

}