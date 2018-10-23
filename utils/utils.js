const { prefix } = require('../config.js');
require('dotenv-flow').config();

module.exports.botPresence = (client) =>  {
    const userSize = client.users.size.toLocaleString();
    const cmdHelp = client.commands.get('help', 'help.name');

    if (process.env.NODE_ENV === 'production') {
        client.user.setStatus('online');
        client.user.setActivity(`${userSize} users | ${prefix + cmdHelp}`, { type: 'WATCHING' })
            .catch(console.error);
    } else {
        client.user.setStatus('dnd');
        client.user.setActivity('in code land...', { type: 'PLAYING' })
            .catch(console.error);
    }
};