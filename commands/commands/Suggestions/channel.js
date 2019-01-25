const Command = require('../../Command');
const { noBotPerms } = require('../../../utils/errors');

module.exports = class ChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'channel',
            category: 'Suggestions',
            description: 'View the current suggestions in this guild.',
            botPermissions: ['MANAGE_MESSAGES']
        });
    }

    async run(message, args, settings) {

        await message.delete().catch(O_o => {});

        let validation = message.guild.channels.find(c => c.name === settings.suggestionsChannel) || message.guild.channels.find(c => c.toString() === settings.suggestionsChannel) || message.guild.channels.get(settings.suggestionsChannel);
        if (!validation) return message.channel.send('There is no suggestions channel set or I can\'t find the default one.');

        return message.channel.send(`Current suggestions channel: ${validation.toString()}`);
    }
};