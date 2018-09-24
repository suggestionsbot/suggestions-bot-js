const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { owner, orange, discord, docs } = require('../config.json');
const cmdSeconds = 5;

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    let cmds = Array.from(client.commands.keys());
    let newCmds = [];

    for (let i = 0; i < cmds.length; i++) {
        if (cmds[i] === 'maintenance') continue;
        if (cmds[i] === 'beta') continue;
        if (cmds[i] === 'eval') continue;
        if (cmds[i] === 'blacklist') continue;

        newCmds.push(cmds[i]);
    }

    const helpCmds = newCmds.map(el => {
        return '`' + el + '`';
    });

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        let channel = res.suggestionsChannel;
        let prefix = res.prefix;

        const suggestionsChannel = message.guild.channels.find(c => c.name === channel) || message.guild.channels.find(c => c.toString() === channel) || 'None';

        const helpEmbed = new Discord.RichEmbed()
            .setTitle('Help Information')
            .setDescription(`View help information for ${client.user}.`)
            .addField('Current Prefix', prefix)
            .addField('Suggestions Channel', suggestionsChannel)
            .addField('Bot Commands', helpCmds.join(' | '))
            .addField('Command Cooldown', `A ${cmdSeconds} second(s) cooldown is in place on bot commands except for users with the \`ADMINISTRATOR\` permission.`)
            .addField('Documentation', docs)
            .addField('Found an issue?', `Please report any issues to <@${owner}> via the Support Discord: ${discord}.`, false)
            .setColor(orange);

        let perms = message.guild.me.permissions;
        if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: `Embed Links`').then(msg => msg.delete(5000));
        
        let status = cmdStatus.get('status');
        if (status === 'off') await helpEmbed.addField('Maintenance', 'The bot is currently in maintenance . If you have further questions, please join the Support Discord. Otherwise, the maintenance period should not be that long.');

        await message.channel.send(helpEmbed);
    });
};

exports.conf = {
    aliases: ['h', 'halp'],
    status: 'true'
};

exports.help = {
    name: 'help',
    description: 'View all commands and where to receive bot support.',
    usage: 'help'
};