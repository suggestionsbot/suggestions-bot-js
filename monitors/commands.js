require('dotenv-flow').config();
const moment = require('moment');
const { oneLine } = require('common-tags');
const permissions = require('../utils/perms');

module.exports = class CommandHandler {
  constructor(client) {
    this.client = client;
  }

  async run(message) {

    let settings = {};
    const { superSecretUsers } = this.client.config;

    if (message.guild) {
      try {
        settings = await this.client.settings.getGuild(message.guild);
      } catch (err) {
        this.client.logger.error(err.stack);
      }
    }

    if (!message.guild) settings.prefix = this.client.config.prefix;

    const prefixMention = new RegExp(`^<@!?${this.client.user.id}> `);
    const newPrefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : settings.prefix;

    const getPrefix = new RegExp(`^<@!?${this.client.user.id}>( |)$`);
    if (message.content.match(getPrefix) && !message.author.bot) return message.channel.send(`My prefix in this guild is \`${settings.prefix}\``);

    if (message.author.bot) return;
    if (message.content.indexOf(newPrefix) !== 0) return;

    if (message.guild && !message.channel.permissionsFor(this.client.user).missing('SEND_MESSAGES')) return;

    const args = message.content.slice(newPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.guild && !message.member) await message.guild.members.fetch(message.author);

    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
    if (!cmd) return;

    const gBlacklisted = await this.client.blacklists.checkGlobalBlacklist(message.author);
    if (gBlacklisted) return this.client.emit('userBlacklisted', message.author, null, cmd, gBlacklisted.status);

    if (message.guild) {
      const blacklisted = await this.client.blacklists.checkGuildBlacklist(message.author, message.guild);
      if (blacklisted) return this.client.emit('userBlacklisted', message.author, message.guild, cmd);
    }

    const roles = settings.staffRoles;
    let staffRoles;
    if ((roles.length > 0) && message.guild) {
      staffRoles = message.guild.roles.cache
        .filter(role => roles.map(r => r.role).includes(role.id))
        .map(r => r);
    } else {
      staffRoles = [];
    }

    let staffCheck,
      adminCheck;

    if (message.guild) {
      if (staffRoles) staffCheck = message.member.roles.cache.some(r => staffRoles.map(sr => sr.id).includes(r.id));
      else staffCheck = message.member.hasPermission('MANAGE_GUILD');
      adminCheck = message.member.hasPermission('MANAGE_GUILD');
    }

    const superCheck = superSecretUsers.includes(message.author.id);
    const ownerCheck = this.client.isOwner(message.author.id);

    if (!cmd.conf.enabled) return this.client.errors.adminCommandIsDisabled(cmd, message.channel);
    if ((!message.guild && cmd.conf.guildOnly)) return this.client.errors.commandGuildOnly(cmd, message.channel);
    if (cmd.conf.superSecretOnly && !superCheck) return;

    if (message.guild) {
      if (cmd.conf.ownerOnly && !ownerCheck) return;
      if (cmd.conf.adminOnly && !adminCheck) return this.client.errors.noPerms(message, 'MANAGE_GUILD');
      if (cmd.conf.staffOnly && !staffCheck && !adminCheck) {
        if (staffRoles.length > 0) return this.client.errors.noSuggestionsPerms(message, staffRoles);
        else return this.client.errors.noPerms(message, 'MANAGE_GUILD');
      }
    }

    const newCommand = {
      guildID: message.guild ? message.guild.id : null,
      command: cmd.help.name,
      channel: message.guild ? message.channel.name : null,
      userID: message.author.id,
      newTime: message.createdTimestamp
    };

    if (message.guild) {
      // check bot permissions
      if (message.channel.type === 'text' && cmd.conf.botPermissions) {
        const missing = message.channel.permissionsFor(this.client.user).missing(cmd.conf.botPermissions);
        if (missing.length > 0) {
          this.client.emit('commandBlocked', cmd, `botPermissions: ${missing.join(', ')}`);
          if (missing.length === 1) return message.reply(`I need the \`${permissions[missing[0]]}\` permission for the \`${cmd.help.name}\` command to work.`).then(msg => msg.delete({ timeout: 5000 }));
          return message.reply(oneLine`
              I need the following permissions for the \`${cmd.help.name}\` command to work:
              ${missing.map(p => `\`${permissions[p]}\``).join(', ')}
          `);
        }
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

    // command inhibitor
    const { disabledCommands } = settings;
    let disabledCommand;
    if (message.guild && disabledCommands) disabledCommand = disabledCommands.find(c => c.command === cmd.help.name);

    try {
      if (throttle) throttle.usages++;
      if (disabledCommand) return this.client.errors.commandIsDisabled(cmd, message.channel);
      cmd.run(message, args, settings);
      if (process.env.NODE_ENV === 'production') await this.client.settings.newCommandUsage(newCommand);
    } catch (err) {
      return this.client.logger.error(err.stack);
    }
  }
};
