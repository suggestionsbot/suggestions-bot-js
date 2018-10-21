const { RichEmbed } = require('discord.js');
const Settings = require('../models/settings');
const { embedColor, owner } = require('../config');
const { noSuggestionsPerms, maintenanceMode } = require('../utils/errors');
const moment = require('moment');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    const cmdName = client.commands.get('staffsuggest', 'help.name');

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const roles = gSettings.staffRoles;

    const staffRoles = roles.map(el => {
        return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
    });

    let admins = [];
    message.guild.members.forEach(collected => {
        if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) { admins.push(collected.id); }
    });

    if (!staffRoles) return message.channel.send('No staff roles exist! Please create them or contact a server administrator to handle suggestions.').then(msg =>  msg.delete(5000)).catch(err => console.log(err));

    if (!admins.includes(message.member.id) && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message.channel);

    const staffSuggestionsChannel = message.guild.channels.find(c => c.name === gSettings.staffSuggestionsChannel) || message.guild.channels.find(c => c.toString() === gSettings.staffSuggestionsChannel);

    const sUser = message.member;

    const embed = new RichEmbed()
        .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${staffSuggestionsChannel} channel to be voted on!`)
        .setColor(embedColor)
        .setAuthor(sUser.displayName)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    message.delete().catch(O_o => {});

    const suggestion = args.join(' ');
    if (!suggestion) return message.channel.send(`Usage: \`${gSettings.prefix + cmdName} <suggestion>\``).then(msg => msg.delete(5000)).catch(console.error);

    const submittedOn = moment.utc(message.createdAt).format('MM/DD/YY @ h:mm A (z)');

    const sEmbed = new RichEmbed()
        .setThumbnail(sUser.user.avatarURL)
        .setDescription(`
        **Submitter**
        ${sUser.user.tag}

        **Suggestion**
        ${suggestion}

        **Submitted**
        ${submittedOn}
        `)
        .setColor(embedColor)
        .setFooter(`User ID: ${sUser.id}`);

    let perms = message.guild.me.permissions;
    if (!perms.has('EMBED_LINKS')) return message.channel.send('I can\'t embed links! Make sure I have this permission: Embed Links`').then(msg => msg.delete(5000));
    if (!perms.has('ADD_REACTIONS')) return message.channel.send('I can\'t add reactions! Make sure I have this permission: Add Reactions`').then(msg => msg.delete(5000));

    const sendMsgs = staffSuggestionsChannel.permissionsFor(message.guild.me).has('SEND_MESSAGES', false);
    const reactions = staffSuggestionsChannel.permissionsFor(message.guild.me).has('ADD_REACTIONS', false);
    if (!sendMsgs) return message.channel.send(`I can't send messages in the ${staffSuggestionsChannel} channel! Make sure I have \`Send Messages\`.`);
    if (!reactions) return message.channel.send(`I can't add reactions in the ${staffSuggestionsChannel} channel! Make sure I have \`Add Reactions\`.`);

    message.channel.send(embed).then(msg => msg.delete(5000)).catch(err => console.log(err));

    staffSuggestionsChannel.send(sEmbed)
        .then(async msg => {
            await msg.react(`✅`);
            await msg.react(`❌`);
        })
        .catch(err => {
            console.log(err);
            message.channel.send(`An error occurred adding reactions to this suggestion: **${err.message}**.`);
        });

    console.log(`A new staff suggestion has been created:
        Author: ${sUser.user.tag} (ID: ${sUser.id})
        Suggestion: ${suggestion}
        Time: ${submittedOn}
        Channel: ${staffSuggestionsChannel.name}
        Guild: ${message.guild.name} (ID: ${message.guild.id})`);
};

exports.help = {
    name: 'staffsuggest',
    aliases: [],
    description: 'Submit a new suggestion for staff members to vote',
    usage: 'staffsuggest <suggestion>'
};