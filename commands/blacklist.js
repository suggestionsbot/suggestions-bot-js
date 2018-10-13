const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const { owner, prefix, embedColor } = require('../config.js');
const Settings = require('../models/settings.js');
const Blacklist = require('../models/blacklist.js');
const { noPerms, noSuggestionsPerms, maintenanceMode } = require('../utils/errors.js');

const blStatus = {
    true: 'True',
    false: 'False'
};

exports.run = async (client, message, args) => {

    await message.delete().catch(O_o=>{});

    let cmdName = client.commands.get('blacklist', 'help.name');

    let gSettings = await Settings.findOne({
        guildID: message.guild.id,
    }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    const roles = gSettings.staffRoles;

    const staffRoles = roles.map(el => {
        return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
    });

    let admins = [];
    message.guild.members.forEach(collected => { if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) return admins.push(collected.id); });

    if (!admins.includes(message.member.id) && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message.channel);

    let status = cmdStatus.get('status');
    if (status === 'off' && message.author.id !== owner)  return maintenanceMode(message.channel);

    let gBlacklist = await Blacklist.find().catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for the bot's blacklist information: **${err.message}**.`);
    });

    let caseNum = gBlacklist.length + 1;

    let blEmbed = new Discord.RichEmbed().setTimestamp();

    if (!args[0]) {

        let active =  0;
        for (let i = 0; i < gBlacklist.length; i++) {
            try {
                if (gBlacklist[i].status === false) continue;
                let caseNum = gBlacklist[i].case;
                let caseUser = `${gBlacklist[i].userID}`;
                let caseReason = gBlacklist[i].reason;
                let caseIssuer = `${gBlacklist[i].issuerUsername} (${gBlacklist[i].issuerID})`;
                let caseStatus = blStatus[gBlacklist[i].status];
                await blEmbed.addField(`Case #${caseNum}`, `**User:** ${caseUser}\n **Reason:** ${caseReason}\n **Issuer:** ${caseIssuer}\n **Status:** ${caseStatus}`);
                active++;
            } catch (err) {
                break;
            }
        }

        await blEmbed.setTitle(`${client.user.username} | Blacklisted User`);
        await blEmbed.setDescription(`These users are currently blacklisted from using any of the bot commands. Use \`${prefix + cmdName} help\` for command information.`);
        await blEmbed.setColor(embedColor);

        if (gBlacklist.length === 0) return message.channel.send('There are no blacklisted users!').then(msg => msg.delete(5000)).catch(console.error);
        if (active === 0) return message.channel.send('There are currently no active blacklisted users.').then(msg => msg.delete(5000)).catch(console.error);

        return message.channel.send(blEmbed);
    }

    if (args[0] === 'help') return message.channel.send(`Usage: \`${prefix + cmdName} <add/remove> <user ID> <reason>\``).then(msg => msg.delete(5000).catch(console.error));

    let blacklisted = args[1];
    let reason = args.slice(2).join(' ');
    const userIDCheck = /^\d+$/;
    if (!userIDCheck.test(blacklisted)) return message.channel.send('You must supply a user ID.').then(msg => msg.delete(3000)).catch(console.error);
    const blUser = blacklisted.match(userIDCheck)[0];

    if (args[0] === 'add') {
        if (!reason) return message.channel.send('Please provide a reason!').then(msg => msg.delete(5000)).catch(console.error);

        const newBlacklist = await new Blacklist({
            _id: mongoose.Types.ObjectId(),
            guildID: message.guild.id,
            guildName: message.guild.name,
            userID: blUser,
            reason: reason,
            issuerID: message.author.id,
            issuerUsername: message.member.user.tag,
            time: moment(Date.now()),
            status: true,
            case: caseNum
        });

        await newBlacklist.save().then(res => console.log('New Blacklist: \n ', res)).catch(err => console.log(err));
        await console.log(`${message.member.user.tag} ("${message.author.id}") has issued a blacklist to the user ${blUser}. [${moment(message.createdAt)}]`);
        await blEmbed.setTitle(`${client.user.username} | Blacklisted User Added`);
        await blEmbed.setColor('#00e640');
        await blEmbed.addField('User ID', `${blUser}`, true);
        await blEmbed.addField('Reason', reason, true);
        await blEmbed.addField('Issuer', `${message.member.user.tag} (${message.author.id})`);

        return message.channel.send(blEmbed).then(msg => msg.delete(5000)).catch(console.error);
    }

    if (args[0] === 'remove') {

        Blacklist.findOneAndUpdate({
                $and: [
                    { userID: blUser },
                    { status: true }
                ]},
                 { $set: { status: false }
            })
            .sort({
                case: -1
            })
            .then(async () => {
                await console.log(`${message.member.user.tag} ("${message.author.id}") has issued an unblacklist for the user ${blUser}.`);

                await blEmbed.setTitle(`${client.user.username} | Blacklisted User Removed`);
                await blEmbed.setColor('#d64541');
                await blEmbed.addField('User ID', `${blUser}`, true);
                await blEmbed.addField('Issuer', `${message.member.user.tag} (${message.author.id})`);

                await message.channel.send(blEmbed).then(msg => msg.delete(5000)).catch(console.error);
            })
            .catch(err => console.log(err));
    }
};

exports.help = {
    name: "blacklist",
    aliases: [],
    description: "Add or remove a user from the bot blacklist",
    usage: "blacklist <add/remove> <user ID>"
};