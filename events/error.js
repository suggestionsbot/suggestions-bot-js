const Discord = require('discord.js');

module.exports = (client, error) => {
    client.logger.log(`An error event was sent by Discord.js: \n${JSON.stringify(error)}`, 'error');
};