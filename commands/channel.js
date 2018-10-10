const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { maintenanceMode } = require('../utils/errors.js');
const { owner } = settings;

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    await message.delete().catch(O_o => {});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    let gSettings = await Settings.findOne({
        guildID: message.guild.id,
    }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    message.channel.send(`Current suggestions channel: ${gSettings.suggestionsChannel}`);
};

exports.help = {
    name: 'channel',
    aliases: [],
    description: 'View the current suggestions channel',
    usage: 'channel'
};