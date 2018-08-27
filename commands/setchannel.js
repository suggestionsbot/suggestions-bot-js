const Discord = require('discord.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Sorry! Only users with the `ADMINISTRATOR` permission may change the suggestions channel!').then(m => m.delete(2000)).catch(err => console.log(err));

    const cmdName = client.commands.get('setchannel', 'help.name');
    const value = args[0];
    if (!value) return message.channel.send('Incorrect command arguments: `' + `${guildConf.prefix + cmdName}` + ' <name>`').then(m => m.delete(2000)).catch(err => console.log(err));

    client.settings.set(message.guild.id, value, 'suggestionsChannel');

    message.channel.send(`Suggestions channel has been changed to: \`${value}\``);
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'setchannel',
    description: 'Set a new suggestions channel',
    usage: 'setchannel <name>'
}