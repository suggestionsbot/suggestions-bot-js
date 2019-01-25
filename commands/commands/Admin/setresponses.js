const Command = require('../../Command');

module.exports = class SetResponsesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setresponses',
            category: 'Admin',
            description: 'Set if a response is required or not for rejecting suggestions.',
            adminOnly: true,
            botPermissions: ['MANAGE_MESSAGES'],
            usage: 'setresponses <true/false>'
        });
    }

    async run(message, args, settings) {
        
        const usage = this.help.usage;

        await message.delete().catch(O_o => {});

        if (!args[0]) return message.channel.send(`Usage: \`${settings.prefix + usage}\``).then(m => m.delete(5000)).catch(err => this.client.logger.error(err.stack));

        switch(args[0]) {
            case 'true':
                try {
                    await this.client.settings.writeSettings(message.guild, { responseRequired: true });
                    message.channel.send('Responses required set to `true`. This means a response **is required** when using the `reject` command.').then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.stack);
                    return message.channel.send(`Error setting required responses: **${err.message}**.`);
                }
                break;
            case 'false':
                try {
                    await this.client.settings.writeSettings(message.guild, { responseRequired: false });
                    message.channel.send('Responses required set to `false`. This means a response **is not required** when using the `reject` command.').then(msg => msg.delete(5000));
                } catch (err) {
                    this.client.logger.error(err.stack);
                    return message.channel.send(`Error setting required responses: **${err.message}**.`);
                }
                break;
            default:
        }
    }
};