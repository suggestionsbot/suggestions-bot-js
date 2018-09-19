const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { noPerms, maintenanceMode } = require('../utils/errors.js');
const { orange, owner } = require('../config.json');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);
    
    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return message.channel.send('I can\'t delete messages! Make sure I have this permission: Manage Messages`').then(msg => msg.delete(5000));

    await message.delete().catch(O_o => {});

    Settings.findOne({
        guildID: message.guild.id,
    }, (err, res) => {
        if (err) return console.log(err);

        const roles = res.staffRoles;

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

        let embed = new Discord.RichEmbed()
            .setColor(orange)
            .addField('Admins', adminPerms.join('\n'));

        for (let i = 0; i < 1; i++) {
            try {
                embed.addField('Staff Roles', staffRoles.join('\n'));
            } catch (err) {
                break;
            }
        }

        let perms = message.guild.me.permissions;
        if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: Embed Links`').then(msg => msg.delete(5000));

        return message.channel.send(embed);
    });
};

exports.conf = {
    aliases: ['viewroles', 'viewrole', 'staffroles'],
    status: 'true'
};

exports.help = {
    name: 'roles',
    description: 'View the current staff roles for the bot',
    usage: 'roles'
};