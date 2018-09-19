const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { noPerms, maintenanceMode } = require('../utils/errors.js');
const { owner } = require('../config.json');

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    await message.delete().catch(O_o => {});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    Settings.findOne({
        guildID: message.guild.id,
    }, async (err, res) => {
        if (err) return console.log(err);

        const cmdName = client.commands.get('role', 'help.name');
    
        if (!message.member.hasPermission('ADMINISTRATOR')) return noPerms(message, 'ADMINISTRATOR');
    
        function getRoleFromMention(mention) {
            if (!mention) return;
    
            if (mention.startsWith('<@&') && mention.endsWith('>')) {
                mention = mention.slice(3, -1);
    
                return message.guild.roles.get(mention).id;
            }
    
            return;
        }
    
        let role = getRoleFromMention(args.slice(1).join(' ')) || args.slice(1).join(' ');
        let staffRole = message.guild.roles.find(r => r.id === role) || message.guild.roles.find(r => r.name === role);
        
        if (!role) return message.channel.send(`Usage: \`${res.prefix + cmdName} <add/remove> <role>\``).then(m => m.delete(5000)).catch(err => console.log(err));
        if (!staffRole) return message.channel.send('This role doesn\'t exist in this guild!');
    
        let value = { role: staffRole.id};
        switch (args[0]) {
            case 'add':
                await Settings.findOneAndUpdate(
                    { guildID: message.guild.id },
                    { $push: { staffRoles: value }},
                ), err => {
                    if (err) return console.log(err);
                    message.channel.send('Error setting a staff role!');
                };
    
                await message.channel.send(`<:nerdSuccess:490708616056406017> Added **${staffRole.name}** to the staff roles.`).then(message => { message.delete(5000); }).catch(console.error);
    
                break;
            case 'remove':
                await Settings.findOneAndUpdate(
                    { guildID: message.guild.id },
                    { $pull: { staffRoles: value }},
                ), err => {
                    if (err) return console.log(err);
                    message.channel.send('Error removing a staff role!');
                };
    
                await message.channel.send(`<:nerdSuccess:490708616056406017> Removed **${staffRole.name}** from the staff roles.`).then(message => { message.delete(5000); }).catch(console.error);
    
                break;
            default:
        }
    });
};

exports.conf = {
    aliases: ['staffrole'],
    status: 'true'
};

exports.help = {
    name: 'role',
    description: 'Add or remove staff roles for managing suggestions',
    usage: 'role <add/remove> <role>'
};