const { oneLine } = require('common-tags');
const { prefix } = require('../config.js');
require('dotenv-flow').config();

const botPresence = async (client) =>  {

    if (process.env.NODE_ENV === 'production') {

        const cmdHelpObj = await client.commands.get('help', 'help.name');
        const cmdHelp = cmdHelpObj.help.name;

        client.user.setStatus('online');
        client.user.setActivity(`your suggestions | ${prefix + cmdHelp}`, { type: 'WATCHING' })
            .catch(console.error);
    } else {
        client.user.setStatus('dnd');
        client.user.setActivity('in code land...', { type: 'PLAYING' })
            .catch(console.error);
    }
};

module.exports = {
    botPresence,
};