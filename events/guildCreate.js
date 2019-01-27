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

        const { defaultSettings: { prefix, suggestionsChannel, suggestionsLogs} } = this.client.config;
        const { guildStatusColors: { created } } = this.client.config;

        const gOwner = guild.owner;

        let newServer = new RichEmbed()
            .setTitle('Added')
            .setDescription(`
            **ID:** \`${guild.id}\`
            **Name:** \`${guild.name}\`
            **Members:** \`${guild.members.size}\`
            **Created:** \`${moment(guild.createdAt).fromNow()}\`
            **Owner:** ${gOwner.toString()} \`[${gOwner.user.tag}]\`
            `)
            .setColor(created)
            .setTimestamp();

        const newSettings = {
            guildID: guild.id,
            guildName: guild.name,
            guildOwnerID: guild.ownerID,
            prefix: prefix,
            suggestionsChannel: suggestionsChannel,
            suggestionsLogs: suggestionsLogs
        };

        try {
            await this.client.settings.createGuildSettings(newSettings);
        } catch (err) {
            return this.client.logger.error(err.stack);
        }
        
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