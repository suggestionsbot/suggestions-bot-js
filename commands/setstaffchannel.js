const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const cmdName = client.commands.get('setstaffchannel', 'help.name');

        if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');
    
        const value = args[0];
        if (!value) return message.channel.send(`Usage: \`${res.prefix + cmdName} <name>\``).then(m => m.delete(5000)).catch(err => console.log(err));
    
        await Settings.findOneAndUpdate(
            { guildID: message.guild.id },
            { staffSuggestionsChannel: value },
        ).catch(err => {
            console.log(err);
            message.channel.send('Error setting the staff suggestions channel!');
        });
    
        await message.channel.send(`Staff suggestions channel has been changed to: ${value}`);
    });
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: 'setstaffchannel',
    description: 'Set a new staff suggestions channel',
    usage: 'setstaffchannel <name>'
}