const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');
const Settings = require('../../models/settings');

module.exports = class SetPrefix extends Command {
    constructor(client) {
        super(client, {
            name: 'setprefix',
            category: 'Admin',
            description: 'Set a new prefix for the bot.',
            usage: 'setprefix <prefix>',
            adminOnly: true
        });
    }

    async run(message, args) {
        
        const usage = this.help.usage;

        let perms = message.guild.me.permissions;
        if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

        await message.delete().catch(O_o => {});

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        if (!args[0]) return message.channel.send(`Usage: \`${gSettings.prefix + usage}\``).then(m => m.delete(5000)).catch(err => this.client.logger.error(err));

        await this.client.writeSettings(message.guild, { prefix: args[0] }).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error setting the bot prefix: **${err.message}**.`);
        });

        // await Settings.findOneAndUpdate({ guildID: message.guild.id }, { prefix: args[0] }).catch(console.error);

        return await message.channel.send(`Bot prefix has been changed to: \`${args[0]}\``);
    }
};