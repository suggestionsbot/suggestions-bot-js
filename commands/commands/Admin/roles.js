const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class RolesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            category: 'Admin',
            description: 'View the current staff roles and guild admins for the bot.',
            aliases: ['staffroles', 'viewroles', 'viewrole'],
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(message, args, settings) {

        const { embedColor } = this.client.config;

        await message.delete().catch(O_o => {});

        const { staffRoles } = settings;

        let roles = message.guild.roles.filter(role => staffRoles.map(role => role.role).includes(role.id));
        roles.sort((a, b) => b.position - a.position);

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

        let embed = new RichEmbed()
            .setColor(embedColor)
            .addField('Admins', adminPerms.join('\n'));

        if (staffRoles.length >= 1) embed.addField('Staff Roles', roles.map(r => r.toString()).join('\n'));

        return message.channel.send(embed);
    }
};