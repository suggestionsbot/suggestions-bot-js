const Discord = require('discord.js');
const { noPerms } = require('../utils/errors.js');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    const guildConf = client.settings.get(message.guild.id);
    const staffrole = client.commands.get('staffrole', 'help.name');
    
    if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');
    
    if (!guildConf.staffRole) {
        message.channel.send(`There is no staff role. Please set one using \`${guildConf.prefix + staffrole} <add> <role>\``).then(message => { message.delete(5000) }).catch(console.error);
    } else {
        message.channel.send(`The current staff role for suggestions is **${guildConf.staffRole}**.`).then(message => { message.delete(5000) }).catch(console.error);
    }

}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'viewrole',
    description: 'View the current staff role for the bot',
    usage: 'viewrole'
}