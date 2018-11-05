const { RichEmbed, version: discordVersion } = require('discord.js');
const moment = require('moment');
const Command = require('../../base/Command');
const { version } = require('../../package.json');
const { noBotPerms } = require('../../utils/errors');
require('moment-duration-format');

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            category: 'General',
            description: 'View bot statistics.'
        });
    }

    async run(message, args) {

        let perms = message.guild.me.permissions;
        if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');

        let { embedColor } = this.client.config;
        
        const botUptime = moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guildSize = this.client.guilds.size.toLocaleString();
        const userSize = this.client.users.size.toLocaleString();
    
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