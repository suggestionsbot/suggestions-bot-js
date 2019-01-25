const Command = require('../../Command');

module.exports = class SetStaffChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setstaffchannel',
            category: 'Admin',
            description: 'Set a new staff suggestions channel.',
            usage: 'setstaffchannel <channel>',
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args, settings) {

        const usage = this.help.usage;

        await message.delete().catch(O_o => {});

        if (!args[0]) return message.channel.send(`Usage: \`${settings.prefix + usage}\``).then(m => m.delete(5000)).catch(err => this.client.logger.error(err.stack));

        let verified = message.guild.channels.find(c => c.name === args[0]) || message.guild.channels.find(c => c.toString() === args[0]);
        if (!verified) return message.channel.send(`\`${args[0]}\` is not a channel!`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err.stack));

        await this.client.settings.writeSettings(message.guild, { staffSuggestionsChannel: verified.id }).catch(err => {
            this.client.logger.log(err);
            return message.channel.send(`Error setting the staff suggestions channel: **${err.message}**.`);
        });

        return await message.channel.send(`Staff suggestions channel has been changed to: ${verified.toString()}`);
    }
};