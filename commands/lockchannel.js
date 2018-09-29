const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { noSuggestions, noBotPerms, maintenanceMode } = require('../utils/errors.js');

exports.run = async (client, message, args) => [



];

exports.conf = {
    aliases: []
};

exports.help = {
    name: 'lockchannel',
    description: 'Lock the suggestions channel',
    usage: 'lockchannel <on/off>'
};