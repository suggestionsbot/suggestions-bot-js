Discord = require('discord.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;

    message.channel.send(`Current suggestions channel for ${client.user} in **${message.guild.name}**: \`${guildConf.suggestionsChannel}\``);
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'channel',
    description: 'View the current suggestions channel',
    usage: 'channel'
}