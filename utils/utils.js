const { prefix } = require('../config.js');

const botPresence = async (client) =>  {

    const cmdHelpObj = await client.commands.get('help');
    const cmdHelp = cmdHelpObj.help.name;

    if (process.env.NODE_ENV === 'production') {
        client.user.setStatus('online');
        client.user.setActivity(`your suggestions | ${prefix + cmdHelp}`, { type: 'WATCHING' })
            .catch(err => {
                client.logger.error(err.stack);
            });
    } else {
        client.user.setStatus('dnd');
        client.user.setActivity('in code land...', { type: 'PLAYING' })
            .catch(err => {
                client.logger.error(err.stack);
            });
    }
};

module.exports = {
    botPresence,
};