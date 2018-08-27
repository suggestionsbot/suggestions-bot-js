const Discord = require('discord.js');
const { owner, orange, discord } = require('../config.json');
const cmdSeconds = 5;

exports.run = async (client, message, args) => {

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;

    const cmds = Array.from(client.commands.keys());
        
    const newCmds = cmds.map(function(el) {
        return '`' + el + '`';
    });

    channelName = message.guild.channels.find(c => c.name === guildConf.suggestionsChannel);

    const helpEmbed = new Discord.RichEmbed()
        .setTitle('Help Information')
        .setDescription(`View help information for ${client.user}.`)
        .addField('Current Prefix', guildConf.prefix)
        .addField('Suggestions Channel', `<#${channelName.id}>`)
        .addField('Bot Commands', newCmds.join(' | '))
        .addField('Command Cooldown', `A ${cmdSeconds} second(s) cooldown is in place on bot commands except for users with the \`ADMINISTRATOR\` permission.`)
        .addField('Found an issue?', `Please report any issues to <@${owner}> via the Support Discord: ${discord}.`, false)
        .setColor(orange);

    message.channel.send(helpEmbed);

}

exports.conf = {
    aliases: ['h', 'halp']
}

exports.help = {
    name: 'help',
    description: 'View all commands and where to receive bot support.',
    usage: 'help'
};