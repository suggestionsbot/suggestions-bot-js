const Command = require('../../base/Command');
const { noBotPerms } = require('../../utils/errors');

module.exports = class Role extends Command {
    constructor(client) {
        super(client, {
            name: 'role',
            category: 'Admin',
            description: 'Add or remove staff roles for managing suggestions',
            usage: 'role <add/remove> <role>',
            aliases: ['staffrole'],
            adminOnly: true
        });
    }

    async run(message, args) {
        
    }
};