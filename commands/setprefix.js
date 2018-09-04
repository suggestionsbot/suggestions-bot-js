const Discord = require('discord.js');
const { noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;
    const cmdName = client.commands.get('setprefix', 'help.name');

    if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');

    const value = args[0];
    if (!value) return message.channel.send(`Incorrect command arguments: \`${guildConf.prefix + cmdName} <prefix>\``).then(m => m.delete(5000)).catch(err => console.log(err));

    client.settings.set(message.guild.id, value, 'prefix');

    message.channel.send(`Bot prefix has been changed to: \`${value}\``);
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'setprefix',
    description: 'Set a new prefix for the bot',
    usage: 'setprefix <prefix>'
}