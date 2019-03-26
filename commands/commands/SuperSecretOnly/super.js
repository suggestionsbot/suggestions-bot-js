const Command = require('../../Command');
const crypto = require('crypto');

module.exports = class SuperCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'super',
            category: 'SuperSecretOnly',
            description: 'A "super" secret command!',
            superSecretOnly: true,
            guildOnly: false
        });
   }

   async run(message, args) {

        const hash = crypto.randomBytes(64).toString('hex');
        return message.channel.send(hash);
   }
};