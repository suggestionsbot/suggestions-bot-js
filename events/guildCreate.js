const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const moment = require('moment');
const Settings = require('../models/settings');
const { botPresence } = require('../utils/utils');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild) {

        const { prefix, suggestionsChannel, suggestionsLogs } = this.client.config.defaultSettings;

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
            prefix: prefix,
            suggestionsChannel: suggestionsChannel,
            suggestionsLogs: suggestionsLogs
        });

        await newSettings.save().then(this.client.logger.log(`Default settings saved for guild ${guild.name} (${guild.id})`)).catch(err => this.client.logger.error(err));
        this.client.logger.log(`${this.client.user.username} has joined a new guild: ${guild.name} (${guild.id})`);

        botPresence(this.client);

        switch (process.env.NODE_ENV) {
            // 345753533141876737 = Nerd Cave Testing
            case 'development': {
                const logGuild = this.client.guilds.get('345753533141876737');
                const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                logChannel.send(newServer);
                break;
            }
            // 480231440932667393 = Nerd Cave Development
            default: {
                const logGuild = this.client.guilds.get('480231440932667393');
                const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                logChannel.send(newServer);
                break;
            }
        }
    }
};