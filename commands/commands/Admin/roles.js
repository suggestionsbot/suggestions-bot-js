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

    const roles = message.guild.roles.filter(role => staffRoles.map(role => role.role).includes(role.id));
    const viewRoles = roles
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .join('\n') || null;

    const admins = message.guild.members
      .filter(m => !m.user.bot && m.hasPermission('MANAGE_GUILD'))
      .map(m => m.toString())
      .join('\n');

    const embed = new RichEmbed()
      .setColor(embedColor)
      .addField('Admins', admins);

    if (staffRoles.length >= 1) embed.addField('Staff Roles', viewRoles);

    return message.channel.send(embed);
  }
};
