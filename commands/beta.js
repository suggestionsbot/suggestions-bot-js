const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const { owner, orange } = require('../config.json');
const { noBotPerms, noPerms, maintenanceMode } = require('../utils/errors.js');
const { defaultEmojis, thumbsEmojis, arrowsEmojis } = require('../utils/voteEmojis');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    if(message.author.id !== owner) return;

    

};

exports.conf = {
    aliases: [],
    status: 'true'
};

exports.help = {
    name: 'beta',
    description: 'Used for development testing.',
    usage: 'beta'
};