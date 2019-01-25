const Command = require('../../Command');

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            category: 'General',
            description: 'View the current bot prefix in this guild.'
        });
    }

    async run(message, args, settings) {
        return message.channel.send(`Current prefix: \`${settings.prefix}\``);
    }
};