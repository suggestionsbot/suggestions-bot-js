const Discord = require('discord.js');
const { orange } = require('../config.json');
const moment = require('moment');
require('moment-duration-format');

exports.run = (client, message, args) => {

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

    message.channel.send(embed);
}

exports.conf = {
    aliases: ['botstats', 'usage']
}

exports.help = {
    name: 'stats',
    description: 'View bot statistics',
    usage: 'stats'
};