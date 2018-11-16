const { prefix } = require('../config.js');
require('dotenv-flow').config();

module.exports.botPresence = async (client) =>  {

    if (process.env.NODE_ENV === 'production') {

        // const excludedGuilds = {
        //     'Discord Bot List': client.guilds.get('345753533141876737').memberCount || 0,
        //     'Discord Bots': client.guilds.get('110373943822540800').memberCount || 0
        // };
    
        // const userSize = (client.users.size - sum(excludedGuilds)).toLocaleString();
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

function sum(obj) {
    let sum = 0;
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) sum += parseInt(obj[i]);
    }
    return sum;
}