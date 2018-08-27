module.exports = async client => {
    console.log(`Logged in as ${client.user.tag} (${client.user.id}) in ${client.guilds.size} server(s).`);

    client.user.setStatus('online');
    client.user.setActivity('your suggestions', { type: 'LISTENING' })
        .catch(console.error);

    client.guilds.forEach(guild => {
        // For this guild, check if enmap has its guild conf
        if (!client.settings.has(guild.id)) {
            // add it if it's not there
            client.settings.set(guild.id, defaultSettings);
        }
    });

    // const suggestions = client.channels.find(c => c.name === 'suggestions' && c.type === 'text');
    // suggestions.fetchMessages().then(m => {
    //     console.log(`Fetched ${m.filter(msgs => msgs.author.id === client.user.id).size} message(s) from ${client.guilds.size} server(s).`)
    // }).catch(console.error);
};