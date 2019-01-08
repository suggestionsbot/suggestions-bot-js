const { RichEmbed } = require('discord.js');
const moment = require('moment');
const Settings = require('../models/settings');
const Suggestion = require('../models/suggestions');
const Command = require('../models/commands');
const Blacklist = require('../models/blacklist');
const { botPresence } = require('../utils/utils');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild) {

        const gOwner = guild.owner;
        const bot = await guild.members.get(this.client.user.id);
    
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
            if (err) this.client.logger.error(err.stack);
            
            this.client.logger.log(`Settings data deleted for guild ${guild.name} (${guild.id})`);
        });
    
        await Suggestion.deleteMany({ guildID: guild.id }, err => {
            if (err) this.client.logger.error(err.stack);
    
            this.client.logger.log(`Suggestions data deleted for guild ${guild.name} (${guild.id})`);
        });
    
        await Command.deleteMany({ guildID: guild.id }, err => {
            if (err) this.client.logger.error(err.stack);
    
            this.client.logger.log(`Command data deleted for guild ${guild.name} (${guild.id})`);
        });

        await Blacklist.deleteMany({ guildID: guild.id }, err => {
            if (err) this.client.logger.error(err.stack);
        });
        
        this.client.logger.log(`${this.client.user.username} has left a guild: ${guild.name} (${guild.id})`);
    
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