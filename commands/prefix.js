const Settings = require('../models/settings');
const { maintenanceMode } = require('../utils/errors');
const { owner } = require('../config');

exports.run = async (client, message, args) => {

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