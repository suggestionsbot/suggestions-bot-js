const Discord = require('discord.js');
const { noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id);
    const cmdName = client.commands.get('setstaffchannel', 'help.name');

    if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');

    const value = args[0];
    if (!value) return message.channel.send(`Usage: \`${guildConf.prefix + cmdName} <name>\``).then(m => m.delete(5000)).catch(err => console.log(err));

    client.settings.set(message.guild.id, value, 'staffSuggestionsChannel');

    message.channel.send(`Staff suggestions channel has been changed to: ${value}`);
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'setstaffchannel',
    description: 'Set a new staff suggestions channel',
    usage: 'setstaffchannel <name>'
}