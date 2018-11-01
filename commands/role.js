const Settings = require('../models/settings');
const { noPerms, maintenanceMode, noBotPerms } = require('../utils/errors');
const { owner } = require('../config');

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');

    await message.delete().catch(O_o => {});

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner) {
        return maintenanceMode(message.channel);
    }

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const cmdName = client.commands.get('role', 'help.name');

    let admins = [];
    message.guild.members.forEach(collected => { if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id); });

    if (!admins.includes(message.member.id)) return noPerms(message, 'MANAGE_GUILD');

    function getRoleFromMention(mention) {

        if (!mention) return;

        if (mention.startsWith('<@&') && mention.endsWith('>')) {
            mention = mention.slice(3, -1);

            return message.guild.roles.get(mention).id;
        }
        return;
    }

    let role = getRoleFromMention(args.slice(1).join(' ')) || args.slice(1).join(' ');
    let staffRole = message.guild.roles.find(r => r.id === role) || message.guild.roles.find(r => r.name === role);

    if (!role) return message.channel.send(`Usage: \`${gSettings.prefix + cmdName} <add/remove> <role>\``).then(m => m.delete(5000)).catch(err => console.log(err));
    if (!staffRole) return message.channel.send('This role doesn\'t exist in this guild!');

    let value = { role: staffRole.id };
    switch (args[0]) {
        case 'add':
            await Settings.findOneAndUpdate(
                { guildID: message.guild.id }, 
                { $push: { staffRoles: value }
            }).catch(err => {
                console.log(err);
                return message.channel.send(`Error setting a staff role: **${err.message}**.`);
            });

            await message.channel.send(`<:nerdSuccess:490708616056406017> Added **${staffRole.name}** to the staff roles.`).then(msg => msg.delete(5000)).catch(console.error);
            break;
        case 'remove':
            await Settings.findOneAndUpdate(
                { guildID: message.guild.id },
                { $pull: { staffRoles: value }
            }).catch(err => {
                console.log(err);
                return message.channel.send(`Error removing a staff role: **${err.message}**`);
            });

            await message.channel.send(`<:nerdSuccess:490708616056406017> Removed **${staffRole.name}** from the staff roles.`).then(msg => msg.delete(5000)).catch(console.error);
            break;
        default:
    }
};

exports.help = {
    name: 'role',
    aliases: ['staffrole'],
    description: 'Add or remove staff roles for managing suggestions',
    usage: 'role <add/remove> <role>'
};