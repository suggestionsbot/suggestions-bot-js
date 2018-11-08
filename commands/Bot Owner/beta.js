const Command = require('../../base/Command');

module.exports = class Beta extends Command {
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