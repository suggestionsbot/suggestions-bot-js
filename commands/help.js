const Discord = require('discord.js');
const { owner, orange, prefix, discord } = require('../config.json');
const cmdSeconds = 5;

exports.run = async (client, message, args) => {

    const cmds = Array.from(client.commands.keys());
        
    const newCmds = cmds.map(function(el) {
        return '`' + prefix + el + '`';
    });

    const msg = await message.channel.send("Seeking help?");

    const helpEmbed = new Discord.RichEmbed()
        .setTitle('Help Commands')
        .setDescription(`View all the commands for ${client.user}.`)
        .addField('User Commands', newCmds.join(' | '))
        .addField('Command Cooldown', `A ${cmdSeconds} second(s) cooldown is in place on bot commands except for users with the ` + '`' + 'ADMINISTRATOR' + '`' + ' permission.')
        .addField('Found an issue?', `Please report any issues to <@${owner}> via the Support Discord: ${discord}.`, false)
        .setColor(orange);

        msg.edit(helpEmbed);

}

exports.help = {
    name: 'help',
    description: 'View all commands and where to receive bot support.',
    usage: 'help'
};