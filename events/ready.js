const { prefix, token } = require('../config.json');

module.exports = async client => {
    console.log(`Logged in as ${client.user.tag} (${client.user.id}) in ${client.guilds.size} server(s).`);

    client.user.setStatus('online');
    client.user.setActivity('your suggestions', { type: 'LISTENING' })
        .catch(console.error);
};