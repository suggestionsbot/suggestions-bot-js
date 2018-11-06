const mongoose = require('mongoose');
const moment = require('moment');
const Blacklist = require('../models/blacklist');
const Command = require('../models/commands');
const { noPerms } = require('../utils/errors');
const cmdCooldown = new Set();
const cmdTime = 5;

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {

        if (!message.guild) return;

        let gSettings = await this.client.getSettings(message.guild);

        let admins = [];
        message.guild.members.forEach(collected => {
            if (collected.hasPermission('MANAGE_GUILD') && !collected.user.bot) {
                admins.push(collected.id);
            }
        });

        const roles = gSettings.staffRoles;
        if (!roles) return;

        const staffRoles = roles.map(el => {
            return message.guild.roles.find(r => r.name === el.role || r.id === el.role);
        });

        const guildConf = gSettings || this.client.config.defaultSettings;

        const prefixMention = new RegExp(`^<@!?${this.client.user.id}> `);
        const newPrefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : guildConf.prefix;

        if (message.author.bot) return;
        if (message.content.indexOf(newPrefix) !== 0) return;

        if (!message.channel.permissionsFor(message.guild.me).missing('SEND_MESSAGES')) return;

        if (cmdCooldown.has(message.author.id)) {
            await message.delete();
            return message.reply(`slow down there! You need to wait ${cmdTime} second(s) before issuing another command.`).then(msg => msg.delete(2500)).catch(err => console.log(err));
        }

        const args = message.content.slice(newPrefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (message.guild && !message.member) await message.guild.fetchMember(message.author);

        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if (!cmd) return;

        // update these to use the new methods in app.js
        let blacklisted = await Blacklist.findOne({
            $and: [
                { guildID: message.guild.id },
                { userID: message.author.id },
                { status: true }
            ]
        }).catch(err => console.log(err));
    
        let gBlacklisted = await Blacklist.findOne({
            $and: [
                { userID: message.author.id },
                { scope: 'global' },
                { status: true }
            ]
        }).catch(err => console.log(err));

        if (blacklisted) return this.client.logger.warn(`"${message.author.tag}" (${message.author.id}) in the guild "${message.guild.name}" (${message.guild.id}) tried to use the command "${cmd.help.name}", but is blacklisted from using bot commands in this guild, "${message.guild.name}" (${message.guild.id}).`);
        if (gBlacklisted) return this.client.logger.warn(`"${message.author.tag}" (${message.author.id}) in the guild "${message.guild.name}" (${message.guild.id}) tried to use the command "${cmd.help.name}", but is blacklisted from using bot commands globally.`);

        if (cmd && !cmd.conf.enabled) return message.channel.send('This command is currently disabled!').then(msg => msg.delete(3000)).catch(console.error);
        if (cmd && cmd.conf.ownerOnly && message.author.id !== this.client.config.owner) return;
        if (cmd && cmd.conf.adminOnly && !admins.includes(message.author.id)) return noPerms(message, 'MANAGE_GUILD');

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

            cmd.run(message, args);

            if (!admins.includes(message.author.id) && !message.member.roles.some(r => staffRoles.includes(r))) {
                await cmdCooldown.add(message.author.id);
            }

            await newCommand.save().catch(err => console.log(err));
            this.client.logger.log(`${message.member.user.tag} (${message.member.id}) ran command ${cmd.help.name}`, 'cmd');
        }

        setTimeout(() => {
            cmdCooldown.delete(message.author.id);
        }, cmdTime * 1000);
    }
};