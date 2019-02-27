const Command = require('../../Command');
const { noBotPerms } = require('../../../utils/errors');

module.exports = class SetPrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setprefix',
            category: 'Admin',
            description: 'Set a new prefix for the bot.',
            usage: 'setprefix <prefix>',
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args, settings) {
        
        const usage = this.help.usage;

        await message.delete().catch(O_o => {});

        if (!args[0]) return message.channel.send(`Usage: \`${settings.prefix + usage}\``).then(m => m.delete(5000)).catch(err => this.client.logger.error(err.stack));

        await this.client.settings.updateGuild(message.guild, { prefix: args[0] }).catch(err => {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error setting the bot prefix: **${err.message}**.`);
        });

        return await message.channel.send(`Bot prefix has been changed to: \`${args[0]}\``);
    }
};