const mongoose = require('mongoose');
const Settings = require('../models/settings.js');

module.exports = async (client, guild) => {

    const newSettings = new Settings({
        _id: mongoose.Types.ObjectId(),
        guildID: guild.id,
        guildName: guild.name,
        guildOwnerID: guild.ownerID,
        prefix: defaultSettings.prefix,
        suggestionsChannel:  defaultSettings.suggestionsChannel,
        suggestionsLogs: defaultSettings.suggestionsLogs
    });

    await console.log(`${client.user.username} has joined a new guild: ${guild.name} (${guild.id})`); 
    await newSettings.save().then(console.log(`Default settings saved for guild ${guild.name} (${guild.id})`)).catch(err => console.log(err));

};