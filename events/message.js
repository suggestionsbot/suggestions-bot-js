const { CommandHandler } = require('../monitors');

module.exports = class {
    constructor(client) {
        this.client = client;
        this.commands = new CommandHandler(this.client);
    }

    async run(message) {
    
        this.commands.run(message);
    }
};