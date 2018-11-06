const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

module.exports = class SetVotes extends Command {
    constructor(client) {
        super(client, {
            name: 'setvots',
            category: 'Admin',
            description: 'Set custom emojis to use when voting.',
            usage: 'setvotes <id>',
            adminOnly: true
        });
    }

    async run(message, args) {
        
    }
};