const Settings = require('../models/settings.js');

module.exports = async (client, guild) => {

    Settings.findOneAndDelete({guildID: guild.id}, err => {
        if (err) console.log(err);
        
        console.log(`Settings deleted for guild ${guild.name} (${guild.id})`);
    })

    await console.log(`${client.user.username} has left a guild: ${guild.name} (${guild.id})`);
};