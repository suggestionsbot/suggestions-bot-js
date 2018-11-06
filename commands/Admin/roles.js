const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

module.exports = class Roles extends Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            category: 'Admin',
            description: 'View the current staff roles for the bot.',
            aliases: ['staffroles', 'viewroles', 'viewrole'],
            adminOnly: true
        });
    }

    async run(message, args) {
        
    }
};