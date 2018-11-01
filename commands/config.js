const { stripIndents } = require('common-tags');
const Settings = require('../models/settings');
const { noPerms, maintenanceMode, noBotPerms } = require('../utils/errors');
const { owner } = require('../config');

const notSet = {
    undefined: 'Not set'
};

const emojiSets = {
    defaultEmojis: 'Default',
    thumbsEmojis: 'Thumbs',
    arrowsEmojis: 'Arrows',
    christmasEmojis: 'Christmas',
    jingleBellsEmojis: 'Bells'
};

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    await message.delete().catch(O_o => {});

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    let admins = [];
    message.guild.members.forEach(collected => { if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id); });

    if (!admins.includes(message.member.id) && message.author.id !== owner) return noPerms(message, 'MANAGE_GUILD');

    let guildID = gSettings.guildID;
    let guildName = gSettings.guildName;
    let guildOwnerID = gSettings.guildOwnerID;
    let prefix = gSettings.prefix;
    let suggestionsChannel = message.guild.channels.find(c => c.name === gSettings.suggestionsChannel) || message.guild.channels.find(c => c.toString() === gSettings.suggestionsChannel);
    let staffSuggestionsChannel = message.guild.channels.find(c => c.name === gSettings.staffSuggestionsChannel) || message.guild.channels.find(c => c.toString() === gSettings.staffSuggestionsChannel) || '';
    let staffRoles = gSettings.staffRoles;
    let voteEmojis = gSettings.voteEmojis;

    let guildOwner = message.guild.members.get(guildOwnerID);

    let roles = [];
    if (staffRoles.length >= 1) {
        staffRoles.forEach(role => {
            let gRole = message.guild.roles.find(r => r.id === role.role);
            if (!gRole) return;
    
            return roles.push(gRole);
        });
    }

    let config = stripIndents`
    • Guild Name: ${guildName} (${guildID})
    • Guild Owner: ${guildOwner.user.tag} (${guildOwner.id})
    • Prefix: ${prefix}
    • Suggestions: ${suggestionsChannel.name || 'Not Set'}
    • Staff Suggestions: ${staffSuggestionsChannel.name || 'Not Set'}
    • Staff Roles: ${roles.map(role => role.name).join(', ') || 'Not Set'}
    • Vote Emojis: ${voteEmojis || 'Not Set'}
    `;

    message.channel.send(`\`\`\`${config}\`\`\``);
};

exports.help = {
    name: 'config',
    aliases: ['conf', 'viewconf', 'viewconfig', 'settings'],
    description: 'View a text-based version of the bot configuration in your guild.',
    usage: 'config'
};