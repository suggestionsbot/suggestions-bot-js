const Discord = require('discord.js');

module.exports = (client, warn) => {
    client.logger.log(JSON.stringify(warn), 'warn');
};