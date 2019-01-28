const { RichEmbed, version: discordVersion } = require('discord.js');
const moment = require('moment');
const Command = require('../../Command');
const { version } = require('../../../package.json');
require('moment-duration-format');

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            category: 'General',
            description: 'View bot statistics.',
            botPermissions: ['EMBED_LINKS']
        });
    }

    async run(message, args) {

        let { embedColor } = this.client.config;

        let totalCommands = '';
        let totalSuggestions = '';
        
        try {
            let commands = await this.client.settings.getAllCommands();
            totalCommands = commands.length;
            
            let suggestions = await this.client.settings.getAllSuggestions();
            totalSuggestions = suggestions.length;
        } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error loading bot stats: **${err.message}**`);
        }
        
        const botUptime = moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guildSize = this.client.guilds.size.toLocaleString();
        const userSize = this.client.users.size.toLocaleString();
        const channelSize = this.client.channels.size.toLocaleString();

        const embed = new RichEmbed()
            .setAuthor(`${this.client.user.username} v${version}`, this.client.user.avatarURL)
            .setColor(embedColor)
            .addField('Guilds', guildSize, true)
            .addField('Users', userSize, true)
            .addField('Channels', channelSize, true)
            .addField('Suggestions', totalSuggestions, true)
            .addField('Commands', totalCommands, true)
            .addField('Uptime', botUptime, true)
            .addField('Memory', `${Math.round(memUsage)} MB`, true)
            .addField('Discord.js', `v${discordVersion}`, true)
            .addField('Node', `${process.version}`, true)
            .setTimestamp();

        return message.channel.send(embed);
    }
};