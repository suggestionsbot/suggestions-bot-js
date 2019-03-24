const { CommandHandler } = require('../monitors');

module.exports = class {
    constructor(client) {
        this.client = client;
        this.commands = new CommandHandler(this.client);
    }

    async run(message) {
    
        if (!message.author) return;
        this.commands.run(message);
    }
};