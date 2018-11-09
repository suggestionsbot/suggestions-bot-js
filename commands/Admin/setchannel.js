const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

module.exports = class SetChannel extends Command {
    constructor(client) {
        super(client, {
            name: 'setchannel',
            category: 'Admin',
            description: 'Set a new suggestions channel.',
            usage: 'setchannel <channel>',
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

        let verified = message.guild.channels.find(c => c.name === args[0]) || message.guild.channels.find(c => c.toString() === args[0]);
        if (!verified) return message.channel.send(`\`${args[0]}\` is not a channel!`).then(msg => msg.delete(5000)).catch(err => this.client.logger.error(err));

        await this.client.writeSettings(message.guild, { suggestionsChannel: verified.id }).catch(err => {
            this.client.logger.log(err);
            return message.channel.send(`Error setting the suggestions channel: **${err.message}**.`);
        });

        return await message.channel.send(`Suggestions channel has been changed to: ${verified.toString()}`);
    }
};