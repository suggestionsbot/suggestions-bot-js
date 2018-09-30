const Settings = require('../models/settings.js');
const Suggestion = require('../models/suggestions.js');
const Command = require('../models/commands.js');

module.exports = async (client, guild) => {

    await Settings.findOneAndDelete({ guildID: guild.id }, err => {
        if (err) console.log(err);
        
        console.log(`Settings data deleted for guild ${guild.name} (${guild.id})`);
    });

    await Suggestion.deleteMany({ guildID: guild.id }, err => {
        if (err) console.log(err);

        console.log(`Suggestions data deleted for guild ${guild.name} (${guild.id})`);
    });

    await Command.deleteMany({ guildID: guild.id }, err => {
        if (err) console.log(err);

        console.log(`Command data deleted for guild ${guild.name} (${guild.id})`);
    });
    

    await console.log(`${client.user.username} has left a guild: ${guild.name} (${guild.id})`);
};