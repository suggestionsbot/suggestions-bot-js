const { RichEmbed } = require('discord.js');
const moment = require('moment');
const { botPresence } = require('../utils/utils');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild) {

        const { guildStatusColors: { deleted } } = this.client.config;

        const gOwner = guild.owner;
        const bot = guild.me;

        let oldServer = new RichEmbed()
            .setTitle('Removed')
            .setDescription(`
                **ID:** \`${guild.id}\`
                **Name:** \`${guild}\`
                **Members:** \`${guild.members.size}\`
                **Joined:** \`${moment(bot.joinedAt).fromNow()}\`
                **Owner:** ${gOwner.toString()} \`[${gOwner.user.tag}]\`
            `)
            .setColor(deleted)
            .setTimestamp();

        try {
            await this.client.settings.deleteGuild(guild);
        } catch (err) {
            this.client.logger.error(err.stack);
        }
        
        botPresence(this.client);
    
        switch (process.env.NODE_ENV) {
            // 345753533141876737 = Nerd Cave Testing
            case 'development': {
                const logGuild = this.client.guilds.get('345753533141876737');
                const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                await logChannel.send(oldServer);
                break;
            }
            // 480231440932667393 = Nerd Cave Development
            default: {
                const logGuild = this.client.guilds.get('480231440932667393');
                const logChannel = logGuild.channels.find(c => c.name === 'server_logs');
                await logChannel.send(oldServer);
                break;
            }
        }

    }
};