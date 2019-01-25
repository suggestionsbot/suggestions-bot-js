const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class SetTimezoneCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'settimezone',
            category: 'Admin',
            description: 'Choose a timezone for submitting and viewing suggestions.',
            ownerOnly: true,
            botPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
            usage: 'settimezone <timezone>'
        });
    }

    async run(message, args, settings) {
        
        const usage = this.help.usage;

        await message.delete().catch(O_o => {});

        if (!args[0]) return message.channel.send(`Usage: \`${settings.prefix + usage}\``).then(m => m.delete(5000)).catch(err => this.client.logger.error(err.stack));


        return;
    }
};