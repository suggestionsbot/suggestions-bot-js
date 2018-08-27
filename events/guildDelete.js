module.exports = async (client, guild) => {

    // Removing an element uses `delete(key)`
    client.settings.delete(guild.id);

};