const Discord = require('discord.js');
const {owner, orange} = require('../config.json');
const moment = require('moment');
require('moment-duration-format');

exports.run = (client, message, args) => {

    const botUptime = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const guildSize = client.guilds.size.toLocaleString();
    const channelSize = client.channels.size.toLocaleString();
    const userSize = client.users.size.toLocaleString();

    const embed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor(orange)
        .addField('Servers', guildSize)
        .addField('Users', userSize)
        .addField('Channels', channelSize)
        .addField('Uptime', botUptime)
        .addField('Memory Usage', `${Math.round(memUsage)}%`)
        .addField('Discord.js', `v${Discord.version}`)
        .addField('Node', `${process.version}`)
        .setTimestamp();

    message.channel.send(embed);
}