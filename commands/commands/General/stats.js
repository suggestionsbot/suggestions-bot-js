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
        
        let userSize = this.client.users.size;
        let channelSize = this.client.channels.size;

        if (process.env.NODE_ENV === 'production') {
            let excludedGuilds = [
                {
                    name: 'Discord Bot List',
                    users: this.client.guilds.get('345753533141876737').members.size || 0,
                    channels: this.client.guilds.get('345753533141876737').channels.size || 0
                },
                {
                    name: 'Discord Bots',
                    users: this.client.guilds.get('110373943822540800').members.size || 0,
                    channels: this.client.guilds.get('110373943822540800').channels.size || 0,
                },
                {
                    name: 'Discord Bot List (2)',
                    users: this.client.guilds.get('450100127256936458').members.size || 0,
                    channels: this.client.guilds.get('450100127256936458').channels.size || 0,
                },
                {
                    name: 'Divine Discord Bot List',
                    users: this.client.guilds.get('454933217666007052').members.size || 0,
                    channels: this.client.guilds.get('454933217666007052').channels.size || 0,
                },
                {
                    name: 'Bots For Discord',
                    users: this.client.guilds.get('374071874222686211').members.size || 0,
                    channels: this.client.guilds.get('374071874222686211').channels.size || 0,
                }
            ];

            userSize = (this.client.users.size - sumUsers(excludedGuilds)).toLocaleString();
            channelSize = (this.client.channels.size - sumChannels(excludedGuilds)).toLocaleString();
        }
        
        const botUptime = moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guildSize = this.client.guilds.size.toLocaleString();
    
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

        message.channel.send(embed);
    }
};

function sumChannels(arr) {
    let sum = 0;

    arr.forEach(obj => {
        if (obj.hasOwnProperty('channels')) sum += parseInt(obj.channels);
    });

    return sum;
}

function sumUsers(arr) {
    let sum = 0;

    arr.forEach(obj => {
        if (obj.hasOwnProperty('users')) sum += parseInt(obj.users);
    });

    return sum;
}