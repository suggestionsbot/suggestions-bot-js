const { CommandHandler } = require('../monitors');

module.exports = class {
    constructor(client) {
        this.client = client;
        this.commands = new CommandHandler(this.client);
    }

    async run(message) {
    
        if (!message.guild) return;
        if (!message.channel.permissionsFor(this.client.user).missing('SEND_MESSAGES')) return;
        if (message.guild && !message.member) await message.guild.fetchMember(message.author);
        
        this.commands.run(message);
    }
};