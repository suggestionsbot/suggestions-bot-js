const Command = require('../../Command');
const Settings = require('../../../models/settings');

module.exports = class Role extends Command {
    constructor(client) {
        super(client, {
            name: 'role',
            category: 'Admin',
            description: 'Add or remove staff roles for managing suggestions',
            usage: 'role <add/remove> <role>',
            aliases: ['staffrole'],
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args) {

        await message.delete().catch(O_o => {});

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        let usage = this.help.usage;
     
        let role = args.slice(1).join(' ');
        let staffRole = message.guild.roles.find(r => r.toString() === role) || message.guild.roles.find(r => r.name === role);

        if (!role) return message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
        if (!staffRole) return message.channel.send('This role doesn\'t exist in this guild!');

        let value = { role: staffRole.id };
        // update these to use the new methods in app.js
        switch (args[0]) {
            case 'add':
                await Settings.findOneAndUpdate(
                    { guildID: message.guild.id }, 
                    { $push: { staffRoles: value }
                }).catch(err => {
                    this.client.logger.error(err);
                    return message.channel.send(`Error setting a staff role: **${err.message}**.`);
                });

                await message.channel.send(`<:nerdSuccess:490708616056406017> Added **${staffRole.name}** to the staff roles.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
                break;
            case 'remove':
                await Settings.findOneAndUpdate(
                    { guildID: message.guild.id },
                    { $pull: { staffRoles: value }
                }).catch(err => {
                    this.client.logger.error(err);
                    return message.channel.send(`Error removing a staff role: **${err.message}**`);
                });
    
                await message.channel.send(`<:nerdSuccess:490708616056406017> Removed **${staffRole.name}** from the staff roles.`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));
                break;
            default:
        }
        return;
    }
};