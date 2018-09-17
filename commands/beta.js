const Discord = require('discord.js');
const fs = require('fs');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js')
const {owner, orange} = require('../config.json');
const { noBotPerms, noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    if(message.author.id !== owner && message.author.id !== '275468644132192256') return;
            

    //message.channel.send('Ye, man. Nice perms ya have there.');




    //client.emit('guildCreate', message.guild);
    return;
}

exports.conf = {
    aliases: [],
    status: ''
}

exports.help = {
    name: 'beta',
    description: 'Used for development testing.',
    usage: 'beta'
};