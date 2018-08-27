const Discord = require('discord.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Sorry! Only users with the `ADMINISTRATOR` permission may change the bot prefix!').then(m => m.delete(2000)).catch(err => console.log(err));

    const cmdName = client.commands.get('setprefix', 'help.name');
    const value = args[0];
    if (!value) return message.channel.send('Incorrect command arguments: `' + `${guildConf.prefix + cmdName}` + ' <prefix>`').then(m => m.delete(2000)).catch(err => console.log(err));

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