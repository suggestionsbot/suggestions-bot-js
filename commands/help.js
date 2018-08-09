const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
let OWNER = config.owner;
let ORANGE = config.embedOrange;
let PREFIX = config.prefix;

exports.run = (client, message, args) => {

    const helpEmbed = new Discord.RichEmbed()
        .setTitle('Help Commands')
        .setDescription(`View all the commands for ${client.user}.`)
        .addField('User Commands', '`' + `${PREFIX}` + 'suggest` | ' + '`' + `${PREFIX}` + 'info` | ' + '`' + `${PREFIX}` + 'ping` | ' + '`' + `${PREFIX}` + 'help`')
        .addField('Bot Owner Commands', '`' + `${PREFIX}` + 'beta`', false)
        .addField('Found an issue?', `Please report any issues to <@${OWNER}>.`, false)
        .setColor(ORANGE);

        message.channel.send(helpEmbed);

}