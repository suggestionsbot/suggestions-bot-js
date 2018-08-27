module.exports = async (client, guild) => {

    // Adding a new row to the collection uses `set(key, value)`
    client.settings.set(guild.id, defaultSettings);

};