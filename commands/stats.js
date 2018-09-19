const Discord = require('discord.js');
const { orange } = require('../config.json');
const moment = require('moment');
require('moment-duration-format');

exports.run = (client, message, args) => {

    let status = cmdStatus.get('status');
    const botUptime = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const guildSize = client.guilds.size.toLocaleString();
    const userSize = client.users.size.toLocaleString();

    const embed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor(orange)
        .addField('Guilds', guildSize, true)
        .addField('Users', userSize, true)
        .addField('Uptime', botUptime, true)
        .addField('Memory', `${Math.round(memUsage)} MB`, true)
        .addField('Discord.js', `v${Discord.version}`, true)
        .addField('Node', `${process.version}`, true)
        .setTimestamp();

    if (status === 'off') {
        embed.setFooter('Maintenance Mode Active');
        embed.setColor('#d64541');
    }

    let perms = message.guild.me.permissions;
    if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: Embed Links`').then(msg => msg.delete(5000));

    message.channel.send(embed);
};

exports.conf = {
    aliases: ['botstats', 'usage'],
    status: 'true'
};

exports.help = {
    name: 'stats',
    description: 'View bot statistics',
    usage: 'stats'
};