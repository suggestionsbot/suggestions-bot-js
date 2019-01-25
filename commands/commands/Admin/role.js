const Command = require('../../Command');

module.exports = class RoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'role',
            category: 'Admin',
            description: 'Add or remove staff roles for managing suggestions.',
            usage: 'role <add/remove> <role>',
            aliases: ['staffrole'],
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args, settings) {

        await message.delete().catch(O_o => {});

        let { prefix, staffRoles } = settings;

        let usage = this.help.usage;
     
        let role = args.slice(1).join(' ');
        let staffRole = message.guild.roles.find(r => r.toString() === role) || message.guild.roles.find(r => r.name === role);

        if (!role) return message.channel.send(`Usage: \`${prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));
        if (!staffRole) return message.channel.send('This role doesn\'t exist in this guild!');

        let updateRole = {
            query: { guildID: message.guild.id },
            staffRoles: { role: staffRole.id },
            added: false
        };

        switch (args[0]) {
            case 'add':
                try {
                    for (let i = 0; i < staffRoles.length; i++) {
                        if (staffRoles[i].role === staffRole.id) {
                            return message.channel.send(`The role **${staffRole.name}** already exists in the database! Cancelling...`).then(m => m.delete(5000));
                        }
                    }

                    updateRole = Object.assign(updateRole, { added: true });
                    await this.client.settings.updateGuildStaffRoles(updateRole);
                    message.channel.send(`<:nerdSuccess:490708616056406017> Added **${staffRole.name}** to the staff roles.`).then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.stack);
                    return message.channel.send(`Error setting a staff role: **${err.message}**.`);
                }
                break;
            case 'remove':
                for (let i = 0; i < staffRoles.length; i++) {
                    if (staffRoles[i].role !== staffRole.id) {
                        return message.channel.send(`The role **${staffRole.name}** does not exist in the database! Cancelling...`).then(m => m.delete(5000));
                    }
                }
                
                try {
                    await this.client.settings.updateGuildStaffRoles(updateRole);
                    message.channel.send(`<:nerdSuccess:490708616056406017> Removed **${staffRole.name}** from the staff roles.`).then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.stack);
                    return message.channel.send(`Error removing a staff role: **${err.message}**`);
                }
                break;
            default:
                break;
        }
        return;
    }
};