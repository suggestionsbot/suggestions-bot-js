const Command = require('../../Command');

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            category: 'General',
            description: 'View the current bot prefix in this guild.'
        });
    }

    async run(message, args) {

        let gSettings = {};
        try {
            gSettings = await this.client.settings.getSettings(message.guild);
            return message.channel.send(`Current prefix: \`${gSettings.prefix}\``);
        } catch (err) {
            this.client.logger.error(err.stack);
            message.channel.send(err.message);
        }
    }
};