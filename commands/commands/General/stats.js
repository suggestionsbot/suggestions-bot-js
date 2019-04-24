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
            botPermissions: ['EMBED_LINKS'],
            guildOnly: false,
            guarded: true
        });
    }

    async run(message, args) {

        let { embedColor } = this.client.config;
        
        const botUptime = moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guildSize = this.client.guilds.size.toLocaleString();
        const userSize = this.client.users.size.toLocaleString();

        // const guildSize = await this.client.shard.fetchClientValues('guilds.size')
        //     .then(res => res.reduce((prev, count) => prev + count, 0));

        // const userSize = await this.client.shard.broadcastEval('this.guilds.reduce((prev, guild) => prev + guild.memberCount, 0)')
        //     .then(res => res.reduce((prev, count) => prev + count, 0));


        const embed = new RichEmbed()
            .setAuthor(`${this.client.user.username} v${version}`, this.client.user.avatarURL)
            .setColor(embedColor)
            .addField('Guilds', guildSize, true)
            .addField('Users', userSize, true)
            .addField('Uptime', botUptime, true)
            .addField('Memory', `${Math.round(memUsage)} MB`, true)
            .addField('Discord.js', `v${discordVersion}`, true)
            .addField('Node', `${process.version}`, true)
            .setTimestamp();

        return message.channel.send(embed);
    }
};