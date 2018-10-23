const { RichEmbed } = require('discord.js');
const Settings = require('../models/settings');
const { noPerms, maintenanceMode } = require('../utils/errors');
const { embedColor, owner } = require('../config');

exports.run = async (client, message, args) => {
    
    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));
    if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: Embed Links`').then(msg => msg.delete(5000));

    await message.delete().catch(O_o => {});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const roles = gSettings.staffRoles;

    const staffRoles = roles.map(el => {
        return '<@&' + el.role + '>';
    });

    let adminPerms;
    let admins = [];
    message.guild.members.forEach(collected => {
        if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) {

            admins.push(collected.id);

            return adminPerms = admins.map(el => {
                return '<@' + el + '>';
            });
        }
    });

    if (!admins.includes(message.member.id)) return noPerms(message, 'MANAGE_GUILD');

    let embed = new RichEmbed()
        .setColor(embedColor)
        .addField('Admins', adminPerms.join('\n'));

    for (let i = 0; i < 1; i++) {
        try {
            embed.addField('Staff Roles', staffRoles.join('\n'));
        } catch (err) {
            break;
        }
    }

    message.channel.send(embed);
};

exports.help = {
    name: 'roles',
    aliases: ['viewroles', 'viewrole', 'staffroles'],
    description: 'View the current staff roles for the bot',
    usage: 'roles'
};