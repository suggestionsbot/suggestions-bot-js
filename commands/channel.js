const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { maintenanceMode } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    Settings.findOne({
        guildID: message.guild.id,
    }, (err, res) => {
        if (err) return console.log(err);

        return message.channel.send(`Current suggestions channel: ${res.suggestionsChannel}`);
    });
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: 'channel',
    description: 'View the current suggestions channel',
    usage: 'channel'
}