const Command = require('../../base/Command');

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: 'beta',
            category: 'Admin',
            description: 'A beta command for testing.',
            enabled: true,
            ownerOnly: true
        });
    }

    async run(message, args) {

       

    }
};