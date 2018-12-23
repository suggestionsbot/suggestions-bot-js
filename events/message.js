const mongoose = require('mongoose');
const moment = require('moment');
const { oneLine } = require('common-tags');
const Blacklist = require('../models/blacklist');
const Command = require('../models/commands');
const { noPerms, noSuggestionsPerms } = require('../utils/errors');
const permissions = require('../utils/perms');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {

        if (!message.guild) return;

        let gSettings = {};

        try {
            gSettings = await this.client.getSettings(message.guild);
        } catch (err) {
            this.client.logger.error(err);
        }

        let guildConf = gSettings;

        const prefixMention = new RegExp(`^<@!?${this.client.user.id}> `);
        const newPrefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : guildConf.prefix;

        const getPrefix = new RegExp(`^<@!?${this.client.user.id}>( |)$`);
        if (message.content.match(getPrefix)) return message.channel.send(`My prefix in this guild is \`${guildConf.prefix}\``);

        if (message.author.bot) return;
        if (message.content.indexOf(newPrefix) !== 0) return;

        if (!message.channel.permissionsFor(this.client.user).missing('SEND_MESSAGES')) return;

        const args = message.content.slice(newPrefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (message.guild && !message.member) await message.guild.fetchMember(message.author);

        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if (!cmd) return;

        // update these to use the new methods in app.js?
        let blacklisted = await Blacklist.findOne({
            $and: [
                { guildID: message.guild.id },
                { userID: message.author.id },
                { status: true }
            ]
        }).catch(err => this.client.logger.error(err));
    
        let gBlacklisted = await Blacklist.findOne({
            $and: [
                { userID: message.author.id },
                { scope: 'global' },
                { status: true }
            ]
        }).catch(err => this.client.logger.error(err));

        if (blacklisted) return this.client.logger.warn(`"${message.author.tag}" (${message.author.id}) in the guild "${message.guild.name}" (${message.guild.id}) tried to use the command "${cmd.help.name}", but is blacklisted from using bot commands in this guild, "${message.guild.name}" (${message.guild.id}).`);
        if (gBlacklisted) return this.client.logger.warn(`"${message.author.tag}" (${message.author.id}) in the guild "${message.guild.name}" (${message.guild.id}) tried to use the command "${cmd.help.name}", but is blacklisted from using bot commands globally.`);

        let roles = guildConf.staffRoles;
        let staffRoles = [];
        if (roles) staffRoles = roles.map(role => message.guild.roles.find(r => r.name === role.role || r.id === role.role));

        if (!cmd.conf.enabled) return message.channel.send('This command is currently disabled!').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err));
        if (cmd.conf.ownerOnly && message.author.id !== this.client.config.owner) return;
        if (cmd.conf.adminOnly && !message.member.hasPermission('MANAGE_GUILD')) return noPerms(message, 'MANAGE_GUILD');
        if (cmd.conf.staffOnly && !message.member.hasPermission('MANAGE_GUILD') && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message);

        const newCommand = await new Command({
            _id: mongoose.Types.ObjectId(),
            guildID: message.guild.id,
            guildName: message.guild.name,
            guildOwnerID: message.guild.ownerID,
            command: cmd.help.name,
            channel: message.channel.name,
            username: message.author.tag,
            userID: message.author.id,
            time: moment(Date.now())
        });

        // check bot permissions
        if (message.channel.type === 'text' && cmd.conf.botPermissions) {
            const missing = message.channel.permissionsFor(this.client.user).missing(cmd.conf.botPermissions);
            if (missing.length > 0) {
                this.client.emit('commandBlocked', cmd, `botPermissions: ${missing.join(', ')}`);
                if (missing.length === 1) return message.reply(`I need the \`${permissions[missing[0]]}\` permission for the \`${cmd.help.name}\` command to work.`).then(msg => msg.delete(5000));
                return message.reply(oneLine`
                    I need the following permissions for the \`${cmd.help.name}\` command to work:
                    ${missing.map(p => `\`${permissions[p]}\``).join(', ')}
                `);
            }
        }

        // rate limiting
        const throttle = cmd.throttle(message.author.id);
        if (throttle && throttle.usages + 1 > cmd.conf.throttling.usages) {
            const remaining = (throttle.start + (cmd.conf.throttling.duration * 1000) - Date.now()) / 1000;
            this.client.emit('commandBlocked', cmd, 'throttling');
            return message.reply(
                `You may not use the \`${cmd.help.name}\` command again for another ${remaining.toFixed(1)} seconds.`
            );
        }

        if (throttle) throttle.usages++;
        cmd.run(message, args);

        await newCommand.save().catch(err => this.client.logger.error(err));
        this.client.logger.log(`${message.author.tag} (${message.author.id}) ran command ${cmd.help.name}`, 'cmd');
    }
};