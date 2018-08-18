const Discord = require('discord.js');
const client = new Discord.Client();
const { owner, orange, prefix, discord } = require('../config.json');
const cmdSeconds = 5;

exports.run = async (client, message, args) => {

    const msg = await message.channel.send("Seeking help?");

    const helpEmbed = new Discord.RichEmbed()
        .setTitle('Help Commands')
        .setDescription(`View all the commands for ${client.user}.`)
        .addField('User Commands', '`' + `${prefix}suggest` + '` |' + '`' + `${prefix}ping` + '` |' + '`' +  `${prefix}help` + '` |' + '`' +  `${prefix}info` + '`')
        //.addField('Bot Owner Commands', '`' + `${prefix}` + 'beta`', false)
        .addField('Command Cooldown', `A ${cmdSeconds} second(s) cooldown is in place except on bot commands for users with the ` + '`' + 'ADMINISTRATOR' + '`' + ' permission.')
        .addField('Found an issue?', `Please report any issues to <@${owner}> via the Support Discord: ${discord}.`, false)
        .setColor(orange);

        msg.edit(helpEmbed);

}