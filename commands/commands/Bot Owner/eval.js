const hastebin = require('hastebin-gen');
const Command = require('../../Command');

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            category: 'Bot Owner',
            description: 'Run raw Javascript code via the bot.',
            usage: 'eval <code>',
            ownerOnly: true,
            guildOnly: false
        });
    }

    async run(message, args, settings) {

        const code = args.join(' ');
        if (!code) return this.client.errors.noUsage(message.channel, this, settings);

        try {
            const evaled = eval(code);
            const clean = await this.client.clean(evaled);
            // 6 graves, and 2 characters for "js"
            const MAX_CHARS = 3 + 2 + clean.length + 3;
            if (MAX_CHARS > 2000) {
                const haste = await hastebin(Buffer.from(clean), 'js');
                return message.channel.send('Output exceeded 2000 characters. DMing you the Hastebin.')
                    .then(msg => {
                        message.author.send(`<${haste}>`);
                        msg.react('📧').then(() => msg.delete(5000));
                    })
                    .catch(err => this.client.logger.error(err.stack));
            }
            return message.channel.send(clean, { code: 'js' });
        } catch (err) {
            message.channel.send(await this.client.clean(err), { code: 'bash' });
        }
    }
};