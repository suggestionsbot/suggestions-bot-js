const Command = require('../../Command');

module.exports = class BetaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'beta',
            category: 'Bot Owner',
            description: 'A beta command for testing.',
            ownerOnly: true
        });
    }

    async run(message, args) {
    
    }
};