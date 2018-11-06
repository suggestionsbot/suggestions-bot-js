const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

module.exports = class SetLogs extends Command {
    constructor(client) {
        super(client, {
            name: 'setlogs',
            category: 'Admin',
            description: 'Set a logs channel for suggestion results.',
            usage: 'setlogs <channel>',
            adminOnly: true
        });
    }

    async run(message, args) {
        
        
    }
};