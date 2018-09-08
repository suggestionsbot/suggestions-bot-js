const Discord = require('discord.js');
const { noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id);
    const cmdName = client.commands.get('staffrole', 'help.name');
    
    if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');

    let role = args.slice(1).join(' ');
    let staffRole = message.guild.roles.find(r => r.name === role);
    
    if (!role) return message.channel.send(`Usage: \`${guildConf.prefix + cmdName} <add/remove> <role>\``).then(m => m.delete(5000)).catch(err => console.log(err));
    if (!staffRole) return message.channel.send('This role doesn\'t exist in this guild!');

    let i = 1;
    switch (args[0]) {
        case 'add':
            if (!client.settings.has(message.guild.id, 'staffRole')) {
                client.settings.set(message.guild.id, role, 'staffRole');
                message.channel.send(`Added **${role}**.`).then(message => { message.delete(5000) }).catch(console.error);
            } else {
                message.channel.send('A staff role already exists!').then(message => { message.delete(5000) }).catch(console.error);
            }
            break;
        case 'remove':
            if (!client.settings.has(message.guild.id, 'staffRole')) {
                message.channel.send('No staff role to remove!').then(message => { message.delete(5000) }).catch(console.error);
            } else {
                client.settings.delete(message.guild.id, 'staffRole');
                message.channel.send(`Removed **${role}**.`).then(message => { message.delete(5000) }).catch(console.error);
            }
            break;
        default:
    }

}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'staffrole',
    description: 'Add or remove a bot staff role for managing suggestions',
    usage: 'staffrole <add/remove> <role>'
}