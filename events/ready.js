const { prefix, ver } = settings;
require('dotenv-flow').config();

const versions = {
    production: 'Production',
    development: 'Development'
};

module.exports = async client => {

    await console.log(`Logged in as ${client.user.tag} (${client.user.id}) in ${client.guilds.size} server(s).`);
    await cmdStatus.set('status', 'on');
    await console.log(`Commands status set to ${cmdStatus.get('status')}`);
    await console.log(`${versions[ver]} version of the bot loaded.`);

    const userSize = client.users.size.toLocaleString();
    const cmdHelp = client.commands.get('help', 'help.name');

    client.user.setStatus('online');
    client.user.setActivity(`${userSize} users | ${prefix + cmdHelp}`, { type: 'WATCHING' })
        .catch(console.error);
};