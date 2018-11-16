const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class Roles extends Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            category: 'Admin',
            description: 'View the current staff roles for the bot.',
            aliases: ['staffroles', 'viewroles', 'viewrole'],
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(message, args) {

        const { embedColor } = this.client.config;

        await message.delete().catch(O_o => {});

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        const { staffRoles } = gSettings;

        let roles = message.guild.roles.filter(role => staffRoles.map(role => role.role).includes(role.id));

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