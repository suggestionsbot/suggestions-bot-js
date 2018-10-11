const moment = require('moment');
const mongoose = require('mongoose');
const Settings = require('../models/settings.js');
const Blacklist = require('../models/blacklist.js');
const Command = require('../models/commands.js');
const { defaultSettings } = require('../config.js');
const cmdCooldown = new Set();
const cmdTime = '5';

module.exports = async (client, message) => {

    if(!message.guild) return;

    let gSettings = await Settings.findOne({
        guildID: message.guild.id,
    }).catch(err => console.log(err));

    let admins = [];
    message.guild.members.forEach(collected => {
        if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) { admins.push(collected.id); }
    });

    const roles = gSettings.staffRoles;

    if (!roles) return;
    
    const staffRoles = roles.map(el => {
        return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
    });

    const guildConf = gSettings || defaultSettings;

    const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    const newPrefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : guildConf.prefix;

    if (message.author.bot) return;
    if (message.content.indexOf(newPrefix) !== 0) return;

    if (cmdCooldown.has(message.author.id)) {
        await message.delete();
        return message.reply(`slow down there! You need to wait ${cmdTime} second(s) before issuing another command.`).then(msg => msg.delete(2500)).catch(err => console.log(err));
    }

    const args = message.content.slice(newPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;

    let blacklisted = await Blacklist.findOne({
        $and: [
            { userID: message.author.id },
            { status: true }
        ]
    }).catch(err => console.log(err));

    if (blacklisted) return console.log(`"${message.author.tag}" (${message.author.id}) in the guild "${message.guild.name}" (${message.guild.id}) tried to use the command "${cmd.help.name}", but is blacklisted. [${moment(message.createdAt)}]`);

    if (cmd && !cmdCooldown.has(message.author.id)) {
        const newCommand = await new Command({
            _id: mongoose.Types.ObjectId(),
            guildID: message.guild.id,
            guildName: message.guild.name,
            guildOwnerID: message.guild.ownerID,
            command: cmd.help.name,
            channel: message.channel.name,
            username: message.member.user.tag,
            userID: message.member.id,
            time: moment(Date.now())
        });

        cmd.run(client, message, args);

        if (!admins.includes(message.author.id) && !message.member.roles.some(r => staffRoles.includes(r))) {
            await cmdCooldown.add(message.author.id);
        }
        await newCommand.save().catch(err => console.log(err));
    }

    setTimeout(() => {
        cmdCooldown.delete(message.author.id);
    }, cmdTime * 1000);
};