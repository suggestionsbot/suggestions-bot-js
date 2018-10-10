const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { maintenanceMode } = require('../utils/errors.js');
const { owner } = settings;

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    message.channel.send(`Current prefix: \`${gSettings.prefix}\``);
};

exports.help = {
    name: 'prefix',
    aliases: [],
    description: 'View the current bot prefix',
    usage: 'prefix'
};