const moment = require('moment');
const { oneLine } = require('common-tags');
const { noPerms, noSuggestionsPerms } = require('../utils/errors');
const permissions = require('../utils/perms');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {

        if (!message.guild) return;

        let settings = {};

        try {
            settings = await this.client.settings.getSettings(message.guild);
        } catch (err) {
            this.client.logger.error(err.stack);
        }

        let guildConf = settings;

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

        const blacklisted = await this.client.blacklists.checkGuildBlacklist(message.guild, message.author);
        const gBlacklisted = await this.client.blacklists.checkGlobalBlacklist(message.author);

        if (blacklisted) return this.client.emit('userBlacklisted', message.author, message.guild, cmd);
        if (gBlacklisted) return this.client.emit('userBlacklisted', message.author, message.guild, cmd, gBlacklisted.status);

        let roles = guildConf.staffRoles;
        let staffRoles = [];
        if (roles) staffRoles = roles.map(role => message.guild.roles.find(r => r.name === role.role || r.id === role.role));

        const superSecretUsers = [
            '214719690855940109', // Lukasz
            '245385436669804547', // Kyle
            '158063324699951104' // Anthony
        ];

        if (!cmd.conf.enabled) return message.channel.send('This command is currently disabled!').then(msg => msg.delete(3000)).catch(err => this.client.logger.error(err.stack));
        if (cmd.conf.ownerOnly && !this.client.isOwner(message.author.id)) return;
        if (cmd.conf.adminOnly && !message.member.hasPermission('MANAGE_GUILD')) return noPerms(message, 'MANAGE_GUILD');
        if (cmd.conf.staffOnly && !message.member.hasPermission('MANAGE_GUILD') && !message.member.roles.some(r => staffRoles.includes(r))) return noSuggestionsPerms(message);
        if (cmd.conf.superSecretOnly && !superSecretUsers.includes(message.author.id)) return;


        const newCommand = {
            guildID: message.guild.id,
            guildName: message.guild.name,
            guildOwnerID: message.guild.ownerID,
            command: cmd.help.name,
            channel: message.channel.name,
            username: message.author.tag,
            userID: message.author.id,
            time: moment(Date.now())
        };

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

        try {
            if (throttle) throttle.usages++;
            cmd.run(message, args, settings);
            await this.client.settings.newCommandUsage(newCommand);
        } catch (err) {
            return this.client.logger.error(err.stack);
        }
    }
};