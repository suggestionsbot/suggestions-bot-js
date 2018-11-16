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

        const excludedGuilds = {
            'Discord Bot List': this.client.guilds.get('345753533141876737').memberCount || 0,
            'Discord Bots': this.client.guilds.get('110373943822540800').memberCount || 0
        };
        
        const botUptime = moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guildSize = this.client.guilds.size.toLocaleString();
        const userSize = (this.client.users.size - sum(excludedGuilds)).toLocaleString();
    
        const embed = new RichEmbed()
            .setAuthor(this.client.user.username, this.client.user.avatarURL)
            .setColor(embedColor)
            .addField('Guilds', guildSize, true)
            .addField('Users', userSize, true)
            .addField('Uptime', botUptime, true)
            .addField('Memory', `${Math.round(memUsage)} MB`, true)
            .addField('Discord.js', `v${discordVersion}`, true)
            .addField('Node', `${process.version}`, true)
            .setFooter(`Bot Version: v${version}`)
            .setTimestamp();

        message.channel.send(embed);
    }
};

function sum(obj) {
    let sum = 0;
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) sum += parseInt(obj[i]);
    }
    return sum;
}