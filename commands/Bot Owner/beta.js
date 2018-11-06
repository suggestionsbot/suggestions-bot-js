const Command = require('../../base/Command');
const { stripIndents } = require('common-tags');

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: 'beta',
            category: 'Bot Owner',
            description: 'A beta command for testing.',
            enabled: true,
            ownerOnly: true
        });
    }

    async run(message, args) {

    }
};