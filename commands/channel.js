const Settings = require('../models/settings');
const { maintenanceMode, noBotPerms } = require('../utils/errors');
const { owner } = require('../config');

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');
    if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');

    await message.delete().catch(O_o => {});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    let gSettings = await Settings.findOne({
        guildID: message.guild.id,
    }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    message.channel.send(`Current suggestions channel: ${gSettings.suggestionsChannel}`);
};

exports.help = {
    name: 'channel',
    aliases: [],
    description: 'View the current suggestions channel',
    usage: 'channel'
};