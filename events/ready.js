const { RichEmbed } = require('discord.js');
const { ver } = require('../config.js');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const Command = require('../models/commands');
const { botPresence } = require('../utils/utils');
const { version } = require('../package.json');
require('dotenv-flow').config();

const versions = {
    production: 'Production',
    development: 'Development'
};

module.exports = async client => {

    await console.log(`Logged in as ${client.user.tag} (${client.user.id}) in ${client.guilds.size} server(s).`);
    await cmdStatus.set('status', 'on');
    await console.log(`Commands status set to ${cmdStatus.get('status')}.`);
    await console.log(`${versions[ver]} version of the bot loaded.`);
    await console.log(`Version ${version} of the bot loaded.`);

    botPresence(client);

    // If the bot was invited to a guild while it was offline, the "ready" event will
    // be emitted (ONLY IN PRODUCTION)
    if (process.env.NODE_ENV === 'development') {
        client.guilds.forEach(async g => {
            let gSettings = await Settings.findOne({ guildID: g.id }).catch(console.error);
            
            if (!gSettings && g) await client.emit('guildCreate', g);
            
        });

        // Need to figure out a more efficient way of doing this I feel. Emitting the
        // "guildDelete" event doesn't seem the best way to do things because the guild
        // doesn't actually exist!
        let gSettings = await Settings.find().catch(console.error);
        gSettings.map(async e => {
            let g = client.guilds.get(e.guildID);
            if (!g) {
                await Settings.findOneAndDelete({ guildID: e.guildID }, err => {
                    if (err) console.log(err);
                    
                    console.log(`Settings data deleted for guild ${e.guildName} (${e.guildID})`);
                });
            
                await Suggestion.deleteMany({ guildID: e.guildID }, err => {
                    if (err) console.log(err);
            
                    console.log(`Suggestions data deleted for guild ${e.guildName} (${e.guildID})`);
                });
            
                await Command.deleteMany({ guildID: e.guildID }, err => {
                    if (err) console.log(err);
            
                    console.log(`Command data deleted for guild ${e.guildName} (${e.guildID})`);
            
                });

                console.log(`${client.user.username} has left a guild (bot was offline): ${e.guildName} (${e.guildID})`);

                botPresence(client);

                let oldServer = new RichEmbed()
                    .setTitle('Removed')
                    .setDescription(`
                        **ID:** \`${e.guildID}\`
                        **Name:** \`${e.guildName}\`
                        **Owner:** <@${e.guildOwnerID}>
                    `)
                    .setColor('#FF4500')
                    .setTimestamp();

                switch (process.env.NODE_ENV) {
                    // 345753533141876737 = Nerd Cave Testing
                    case 'development': {
                        const logGuild = client.guilds.get('345753533141876737');
                        const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                        logChannel.send(oldServer);
                        break;
                    }
                    // 480231440932667393 = Nerd Cave Development
                    default: {
                        const logGuild = client.guilds.get('480231440932667393');
                        const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                        logChannel.send(oldServer);
                        break;
                    }
                }
            }
        });
    }
};