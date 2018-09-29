const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const { owner, prefix, orange } = require('../config.json');
const Blacklist = require('../models/blacklist.js');

exports.run = async (client, message, args) => {

    if (message.author.id !== owner) return;

    await message.delete().catch(O_o=>{});

    let cmdName = client.commands.get('blacklist', 'help.name');

    Blacklist.find(
        async (err, res) => {
            if (err) return console.log(err);

            let caseNum = res.length + 1;

            let blEmbed = new Discord.RichEmbed()
                .setTimestamp();

            if (!args[0]) {
                
                let status = {
                    true: 'True',
                    false: 'False'
                };

                for (let i = 0; i < res.length; i++) {
                    try {
                        if (res[i].status === false || res.length === 0) return message.channel.send('There are no currently active blacklisted users!').then(msg => msg.delete(5000)).catch(console.error);
                        let caseNum = res[i].case;
                        let caseUser = `${res[i].username} (${res[i].userID})`;
                        let caseReason = res[i].reason;
                        let caseIssuer = `${res[i].issuerUsername} (${res[i].issuerID})`;
                        let caseStatus = status[res[i].status];
                        await blEmbed.addField(`Case #${caseNum}`, `**User:** ${caseUser}\n **Reason:** ${caseReason}\n **Issuer:** ${caseIssuer}\n **Status:** ${caseStatus}`);
                    } catch (err) {
                        break;
                    }
                }

                await blEmbed.setTitle(`${client.user.username} | Blacklisted User`);
                await blEmbed.setDescription(`These users are currently blacklisted from using any of the bot commands. Use \`${prefix + cmdName} help\` for command information.`);
                await blEmbed.setColor(orange);
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
                    userID: blUser,
                    reason: reason,
                    issuerID: message.author.id,
                    issuerUsername: message.member.user.tag,
                    time: moment(Date.now()),
                    status: true,
                    case: caseNum
                });

                await newBlacklist.save().then(res => console.log('New Blacklist: \n ', res)).catch(err => console.log(err));
                await console.log(`${message.member.user.tag} ("${message.author.id}" has issued a blacklist to the user ${blUser}. [${moment(message.createdAt)}]`);
                await blEmbed.setTitle(`${client.user.username} | Blacklisted User Added`);
                await blEmbed.setColor('#00e640');
                await blEmbed.addField('User ID', `${blUser}`, true);
                await blEmbed.addField('Reason', reason, true);
                await blEmbed.addField('Issuer', `${message.member.user.tag} (${message.author.id})`);

                return message.channel.send(blEmbed).then(msg => msg.delete(5000)).catch(console.error);
            }

            if (args[0] === 'remove') {

                Blacklist.findOneAndUpdate(
                    { $and: [
                        { userID: blUser },
                        { status: true }
                    ]},
                    { $set: { status: false } }
                )
                .sort({ case: -1 })
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
        }
    );
};

exports.conf = {
    aliases: []
};

exports.help = {
    name: "blacklist",
    description: "Add or remove a user from the bot blacklist",
    usage: "blacklist <add/remove> <user ID>"
};