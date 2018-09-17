const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { maintenanceMode } = require('../utils/errors.js');
const { owner } = require('../config.json');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    Settings.findOne({
        guildID: message.guild.id,
    }, (err, res) => {
        if (err) return console.log(err);

        return message.channel.send(`Current prefix: \`${res.prefix}\``);
    });
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: 'prefix',
    description: 'View the current bot prefix',
    usage: 'prefix'
}