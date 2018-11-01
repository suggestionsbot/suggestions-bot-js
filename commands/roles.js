const { RichEmbed } = require('discord.js');
const Settings = require('../models/settings');
const { noPerms, maintenanceMode, noBotPerms } = require('../utils/errors');
const { embedColor, owner } = require('../config');

exports.run = async (client, message, args) => {
    
    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');
    if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');

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

    let staffRoles = [];
    roles.forEach(role => {
        let gRole = message.guild.roles.find(r => r.id === role.role);
        if (!gRole) return;

        return staffRoles.push(gRole);
    });

    staffRoles.sort((a, b) => b.position - a.position);

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

    if (staffRoles.length >= 1) embed.addField('Staff Roles', staffRoles.join('\n'));

    message.channel.send(embed);
};

exports.help = {
    name: 'roles',
    aliases: ['viewroles', 'viewrole', 'staffroles'],
    description: 'View the current staff roles for the bot',
    usage: 'roles'
};