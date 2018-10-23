const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const Command = require('../models/commands');
const { botPresence } = require('../utils/utils');

module.exports = async (client, guild) => {

    const gOwner = guild.owner;
    const bot = await guild.members.get(client.user.id);

    let oldServer = new RichEmbed()
        .setTitle('Removed')
        .setDescription(`
            **ID:** \`${guild.id}\`
            **Name:** \`${guild}\`
            **Members:** \`${guild.members.size}\`
            **Joined:** \`${moment(bot.joinedAt).fromNow()}\`
            **Owner:** <@${gOwner.id}> \`[${gOwner.user.tag}]\`
        `)
        .setColor('#FF4500')
        .setTimestamp();

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
    
    console.log(`${client.user.username} has left a guild: ${guild.name} (${guild.id})`);

    botPresence(client);

    switch (process.env.NODE_ENV) {
        // 345753533141876737 = Nerd Cave Testing
        case 'development': {
            const logGuild = client.guilds.get('345753533141876737');
            const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
            await logChannel.send(oldServer);
            break;
        }
        // 480231440932667393 = Nerd Cave Development
        default: {
            const logGuild = client.guilds.get('480231440932667393');
            const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
            await logChannel.send(oldServer);
            break;
        }
    }
};