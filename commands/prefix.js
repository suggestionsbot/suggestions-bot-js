Discord = require('discord.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;

    message.channel.send(`Current prefix: \`${guildConf.prefix}\``);
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'prefix',
    description: 'View the current bot prefix',
    usage: 'prefix'
}