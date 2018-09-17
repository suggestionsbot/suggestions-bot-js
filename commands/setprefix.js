const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const cmdName = client.commands.get('setprefix', 'help.name');

        if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');
    
        const value = args[0];
        if (!value) return message.channel.send(`Incorrect command arguments: \`${res.prefix + cmdName} <prefix>\``).then(m => m.delete(5000)).catch(err => console.log(err));
    
        await Settings.findOneAndUpdate(
            { guildID: message.guild.id },
            { suggestionsChannel: value },
        ).catch(err => {
            console.log(err);
            message.channel.send('Error setting the bot prefix!');
        });
    
        await message.channel.send(`Bot prefix has been changed to: \`${value}\``);
    });
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: 'setprefix',
    description: 'Set a new prefix for the bot',
    usage: 'setprefix <prefix>'
}