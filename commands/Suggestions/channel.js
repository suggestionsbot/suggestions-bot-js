const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

module.exports = class Channel extends Command {
    constructor(client) {
        super(client, {
            name: 'channel',
            category: 'Suggestions',
            description: 'View the current suggestions in this guild.'
        });
    }

    async run(message, args) {

        let perms = message.guild.me.permissions;
        if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');
        if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');

        await message.delete().catch(O_o => {});

        let gSettings = await this.client.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        let validation = message.guild.channels.find(c => c.name === gSettings.suggestionsChannel) || message.guild.channels.find(c => c.toString() === gSettings.suggestionsChannel) || message.guild.channels.get(c => c.id === gSettings.suggestionsChannel);
        if (!validation) return message.channel.send('There is no suggestions channel set or I can\'t find the default one.');

        return message.channel.send(`Current suggestions channel: ${validation.toString()}`);
    }
};