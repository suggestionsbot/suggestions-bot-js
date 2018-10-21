const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const moment = require('moment');
const Settings = require('../models/settings');
const { defaultSettings } = require('../config');
const { botPresence } = require('../utils/utils');

module.exports = async (client, guild) => {

    const gOwnerID = guild.ownerID;

    function gOwner(mID) {
        if (!mID) return;

        let obj = guild.members.find(m => m.id === mID);
        return `${obj.user.username}#${obj.user.discriminator}`;
    }

    let newServer = new RichEmbed()
        .setTitle('Added')
        .setDescription(`
            **ID:** \`${guild.id}\`
            **Name:** \`${guild.name}\`
            **Members:** \`${guild.members.size}\`
            **Created:** \`${moment(guild.createdAt).fromNow()}\`
            **Owner:** <@${gOwnerID}> \`[${gOwner(gOwnerID)}]\`
        `)
        .setColor('#2ecc71')
        .setTimestamp();

    const newSettings = new Settings({
        _id: mongoose.Types.ObjectId(),
        guildID: guild.id,
        guildName: guild.name,
        guildOwnerID: guild.ownerID,
        prefix: defaultSettings.prefix,
        suggestionsChannel:  defaultSettings.suggestionsChannel,
        suggestionsLogs: defaultSettings.suggestionsLogs
    });

    await newSettings.save().then(console.log(`Default settings saved for guild ${guild.name} (${guild.id})`)).catch(err => console.log(err));
    console.log(`${client.user.username} has joined a new guild: ${guild.name} (${guild.id})`); 

    botPresence(client);

    switch (process.env.NODE_ENV) {
        // 345753533141876737 = Nerd Cave Testing
        case 'development': {
            const logGuild = client.guilds.get('345753533141876737');
            const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
            logChannel.send(newServer);
            break;
        }
        // 480231440932667393 = Nerd Cave Development
        default: {
            const logGuild = client.guilds.get('480231440932667393');
            const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
            logChannel.send(newServer);
            break;
        }
    }
};