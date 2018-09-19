const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { noPerms, maintenanceMode } = require('../utils/errors.js');
const { owner } = require('../config.json');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    await message.delete().catch(O_o => {});

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const cmdName = client.commands.get('setlogs', 'help.name');

        if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');
    
        const value = args[0];
        if (!value) return message.channel.send(`Usage: \`${res.prefix + cmdName} <name>\``).then(m => m.delete(5000)).catch(err => console.log(err));
    
        await Settings.findOneAndUpdate(
            { guildID: message.guild.id },
            { suggestionsLogs: value },
        ).catch(err => {
            console.log(err);
            message.channel.send('Error setting the logs channel!');
        });
    
        await message.channel.send(`Suggestions logs channel has been changed to: ${value}`);
    });
};

exports.conf = {
    aliases: [],
    status: 'true'
};

exports.help = {
    name: 'setlogs',
    description: 'Set a logs channel for suggestion results',
    usage: 'setlogs <name>'
};