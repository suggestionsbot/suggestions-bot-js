const { RichEmbed } = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const { owner, embedColor, discord } = require('../config');
const { noBotPerms, noPerms, maintenanceMode } = require('../utils/errors');
const { defaultEmojis, thumbsEmojis, arrowsEmojis, halloweenEmojis, impEmojis, christmasEmojis, jingleBellsEmojis } = require('../utils/voteEmojis');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    if(message.author.id !== owner) return;

    
};

exports.help = {
    name: 'beta',
    aliases: [],
    description: 'Used for development testing.',
    usage: 'beta'
};