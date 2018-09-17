const Discord = require('discord.js');
const Settings = require('../models/settings.js');
const { noPerms, maintenanceMode } = require('../utils/errors.js');
const { orange, owner } = require('../config.json');

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o => {});

    Settings.findOne({
        guildID: message.guild.id,
    }, (err, res) => {
        if (err) return console.log(err);

        const roles = res.staffRoles;

        const staffRoles = roles.map(el => {
            return '<@&' + el.role + '>';
        });

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
            .addField('Admins', adminPerms.join('\n'))
            //.addField('Staff Roles', staffRoles.join(' '));

            for (let i = 0; i < 1; i++) {
                try {
                    embed.addField('Staff Roles', staffRoles.join('\n'));
                } catch (err) {
                    break;
                }
            }

        return message.channel.send(embed);
    });
}

exports.conf = {
    aliases: ['viewroles', 'viewrole', 'staffroles'],
    status: ''
}

exports.help = {
    name: 'roles',
    description: 'View the current staff roles for the bot',
    usage: 'roles'
}