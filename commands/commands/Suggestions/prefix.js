const Command = require('../../Command');

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            category: 'Suggestions',
            description: 'View the current bot prefix in this guild.'
        });
    }

    async run(message, args) {

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        return message.channel.send(`Current prefix: \`${gSettings.prefix}\``);
    }
};