const { prefix } = require('../config.json');

module.exports = async client => {

    console.log(`Logged in as ${client.user.tag} (${client.user.id}) in ${client.guilds.size} server(s).`);

    const userSize = client.users.size.toLocaleString();
    const cmdHelp = client.commands.get('help', 'help.name');

    client.user.setStatus('online');
    client.user.setActivity(`${userSize} users | ${prefix + cmdHelp}`, { type: 'WATCHING' })
        .catch(console.error);

    client.guilds.forEach(guild => {
        // For this guild, check if enmap has its guild conf
        if (!client.settings.has(guild.id)) {
            // add it if it's not there
            client.settings.set(guild.id, defaultSettings);
        }
    });
};