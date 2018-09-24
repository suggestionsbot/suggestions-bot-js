const fs = require('fs');
const { prefix } = require('../config.json');
require('dotenv-flow').config();

module.exports = async client => {

    await console.log(`Logged in as ${client.user.tag} (${client.user.id}) in ${client.guilds.size} server(s).`);
    await cmdStatus.set('status', 'on');
    await console.log(`Commands status set to ${cmdStatus.get('status')}`);
    await console.log(`${process.env.VER} version of the bot loaded.`);

    const userSize = client.users.size.toLocaleString();
    const cmdHelp = client.commands.get('help', 'help.name');

    client.user.setStatus('online');
    client.user.setActivity(`${userSize} users | ${prefix + cmdHelp}`, { type: 'WATCHING' })
        .catch(console.error);

    client.setInterval(() => {
        fs.readFile('./blacklisted.json', 'utf-8', (err, data) => { if (err) return console.log(err); });
    }, 1500);
};