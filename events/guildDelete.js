module.exports = async (client, guild) => {

    // Removing an element uses `delete(key)`
    client.settings.delete(guild.id);
    client.suggestions.delete(guild.id);

};