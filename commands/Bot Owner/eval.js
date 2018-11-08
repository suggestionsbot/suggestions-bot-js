const Command = require('../../base/Command');

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            category: 'Bot Owner',
            description: 'Run raw Javascript code via the bot.',
            usage: 'eval <code>',
            ownerOnly: true
        });
    }

    async run(message, args) {

        const cmdUsage = this.help.usage;
        const prefix = await this.client.getSettings(message.guild).then(res => res.prefix);
        const code = args.join(' ');
        if (!code) return message.channel.send(`Usage: \`${prefix + cmdUsage}\``).then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));

        try {
            const evaled = eval(code);
            const clean = await this.client.clean(this.client, evaled);
            // 6 graves, and 2 characters for "js"
            const MAX_CHARS = 3 + 2 + clean.length + 3;
            if (MAX_CHARS > 2000) message.channel.send('Output exceeded 2000 characters. Sending as a file.', { files: [{ attachment: Buffer.from(clean), name: 'output.txt.' }] });
            return message.channel.send(clean, { code: 'js' });
        } catch (err) {
            message.channel.send(await this.client.clean(this.client, err), { code: 'xl' });
        }
    }
};