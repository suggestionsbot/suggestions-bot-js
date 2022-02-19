const { MessageEmbed  } = require('discord.js-light');
const { stripIndent } = require('common-tags');
const Command = require('../../structures/Command');
const Logger = require('../../utils/logger');
const { buildErrorEmbed, getDefaultSuggestionsChannel } = require('../../utils/functions');

module.exports = class ConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'config',
      category: 'Admin',
      description: 'View and change various configurable options of the bot.',
      aliases: ['conf', 'settings'],
      usage: 'config [setting] [value]',
      adminOnly: true,
      botPermissions: ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS'],
      guarded: true,
      throttling: {
        usages: 3,
        duration: 60
      }
    });
  }

  async run(message, args, settings) {

    const { colors, docs, emojis: { success: successEmoji } } = this.client.config;
    const { help: { usage, name } } = this;
    const confDocs = `${docs}/docs/configuration.html`;
    const success = this.client.emojis.forge(successEmoji)

    const setting = args[0],
      updated = args.slice(1).join(' ');

    const {
      prefix,
      staffRoles,
      responseRequired,
      disabledCommands,
      dmResponses
    } = settings;

    let {
      voteEmojis,
      suggestionsLogs,
      suggestionsChannel,
      staffSuggestionsChannel,
      keepLogs
    } = settings;

    const configEmbed = new MessageEmbed()
      .setAuthor(message.guild, message.guild.iconURL())
      .setColor(colors.main)
      .setFooter(`Guild: ${message.guild.id}`)
      .setTimestamp();

    switch (setting.toLowerCase()) {
    case 'prefix': {
      configEmbed.setAuthor(`${message.guild} | Prefix`, message.guild.iconURL());

      if (updated) {
        try {
          if (updated.length > 5) return this.client.errors.invalidPrefixLength(message.channel, updated);
          await this.client.mongodb.helpers.settings.updateGuild(message.guild, { prefix: updated });
          configEmbed.setDescription(`${success} Prefix has been updated to: \`${updated}\``);

          return message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
        } catch (err) {
          Logger.errorCmd(this, err.stack);
          return message.channel.send(buildErrorEmbed(err));
        }
      }

      configEmbed.setDescription(`Current prefix: \`${prefix}\``);
      configEmbed.addField('More Information', `[Link](${confDocs}#prefix)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'channel': {
      configEmbed.setAuthor(`${message.guild} | Suggestions Channel`, message.guild.iconURL());

      if (updated) {
        const channels = await message.guild.channels.fetch({ cache: false })
        const verified = channels.find(c => c.name === updated) ||
          channels.get(updated) ||
          message.mentions.channels.first();
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.mongodb.helpers.settings.updateGuild(message.guild, { suggestionsChannel: verified.id });
          configEmbed.setDescription(`${success} Suggestions channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
        } catch (err) {
          Logger.errorCmd(this, err);
          return message.channel.send(buildErrorEmbed(err));
        }
      }

      const isDefault = suggestionsChannel === 'suggestions'
      suggestionsChannel = isDefault
        ? await message.guild.channels.fetch({ cache: false }).then(res => res.find(c => c.name === 'suggestions'))
        : message.guild.channels.forge(suggestionsChannel)
      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      configEmbed.setDescription(`Current suggestions channel: ${suggestionsChannel}`);
      configEmbed.addField('More Information', `[Link](${confDocs}#suggestions-channel)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'log':
    case 'logs': {
      configEmbed.setAuthor(`${message.guild} | Suggestion Logs Channel`, message.guild.iconURL());

      if (updated) {
        const channels = await message.guild.channels.fetch({ cache: false })
        const verified = channels.find(c => c.name === updated) ||
          channels.get(updated) ||
          message.mentions.channels.first();
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.mongodb.helpers.settings.updateGuild(message.guild, { suggestionsLogs: verified.id });
          configEmbed.setDescription(`${success} Suggestion logs channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
        } catch (err) {
          Logger.errorCmd(this, err);
          return message.channel.send(buildErrorEmbed(err));
        }
      }

      const isDefault = [this.client.config.defaultSettings.suggestionsLogs, "suggestions-logs"].includes(suggestionsLogs);
      suggestionsLogs = isDefault
          ? await message.guild.channels.fetch({ cache: false }).then(res => res.find(c => c.name === this.client.config.suggestionLogs))
          : message.guild.channels.forge(suggestionsLogs);
      if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);
      configEmbed.setDescription(`Current suggestions logs channel: ${suggestionsLogs}`);
      configEmbed.addField('More Information', `[Link](${confDocs}#suggestions-logs-channel)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'staffchannel': {
      configEmbed.setAuthor(`${message.guild} | Suggestions Staff Channel`, message.guild.iconURL());

      if (updated) {
        const channels = await message.guild.channels.fetch({ cache: false })
        const verified = channels.find(c => c.name === updated) ||
          channels.get(updated) ||
          message.mentions.channels.first();
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.mongodb.helpers.settings.updateGuild(message.guild, { staffSuggestionsChannel: verified.id });
          configEmbed.setDescription(`${success} Suggestions staff channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
        } catch (err) {
          Logger.errorCmd(this, err);
          return message.channel.send(buildErrorEmbed(err));
        }
      }

      if (!staffSuggestionsChannel) return this.client.errors.noStaffSuggestions(message.channel);
      configEmbed.setDescription(`Current staff suggestions channel: ${message.guild.channels.forge(staffSuggestionsChannel)}`);
      configEmbed.addField('More Information', `[Link](${confDocs}#staff-suggestions-channel)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'role':
    case 'roles': {
      configEmbed.setAuthor(`${message.guild} | Staff Roles`, message.guild.iconURL());

      if (updated) {
        const roles = await message.guild.roles.fetch({ cache: false })
        const verified = roles.find(c => c.name === updated) ||
          roles.get(updated) ||
          message.mentions.roles.first();
        if (!verified) return this.client.errors.roleNotFound(updated, message.channel);

        const filter = r => r.role === verified.id;
        const sRole = staffRoles.find(filter);
        const updateRole = {
          guild: message.guild,
          staffRoles: { role: verified.id }
        };

        if (sRole) {
          try {
            configEmbed.setDescription(`${success} Removed **${verified.name}** from the staff roles.`);
            await this.client.mongodb.helpers.settings.updateGuildStaffRoles(updateRole, false);
            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (error) {
            Logger.errorCmd(this, error.stack);
            return message.channel.send(buildErrorEmbed(error));
          }
        } else {
          try {
            configEmbed.setDescription(`${success} Added **${verified.name}** to the staff roles.`);
            await this.client.mongodb.helpers.settings.updateGuildStaffRoles(updateRole, true);
            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (error) {
            Logger.errorCmd(this, error.stack);
            return message.channel.send(buildErrorEmbed(error));
          }
        }

        return;
      }

      const roles = message.guild.roles.cache.filter(role => staffRoles.map(r => r.role).includes(role.id));
      const viewRoles = roles
        .sort((a, b) => b.position - a.position)
        .map(r => r.toString())
        .join('\n');

      configEmbed
        .setDescription(`Add/remove a staff role by doing \`${prefix + name} roles [role]\``)

      configEmbed.addField('Staff Roles', viewRoles || 'No roles set.');
      configEmbed.addField('More Information', `[Link](${confDocs}#staff-roles)`);

      message.channel.send(configEmbed);
      break;
    }
    case 'emoji':
    case 'emojis': {
      if (!voteEmojis) voteEmojis = 'defaultEmojis';
      configEmbed.setAuthor(`${message.guild} | Vote Emojis`, message.guild.iconURL());

      const setID = parseInt(updated);

      if (updated) {
        const filter = set => set.id === setID;
        const foundSet = this.client.voteEmojis.find(filter);
        if (!foundSet) return this.client.errors.voteEmojiNotFound(updated, message.channel);

        try {
          const emojiSet = foundSet.emojis.map(e => foundSet.custom ? this.client.emojis.forge(e) : e).join(' ')
          await this.client.mongodb.helpers.settings.updateGuild(message.guild, { voteEmojis: foundSet.name });
          configEmbed.setDescription(`${success} The default vote emojis have been changed to ${emojiSet}`);
          message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
        } catch (error) {
          Logger.errorCmd(this, error.stack);
          return message.channel.send(buildErrorEmbed(error));
        }

        return;
      }

      const emojiSets = this.client.voteEmojis.map(set => {
        const emojiSet = set.emojis.map(e => set.custom ? this.client.emojis.forge(e) : e).join(' ');
        if (voteEmojis === set.name) return `\`${set.id}\`: ${emojiSet} ***(Currently Using)***`;
        else return `\`${set.id}\`: ${emojiSet}`;
      });

      const mainView = await Promise.all(emojiSets);

      configEmbed.setDescription(stripIndent`
        **Voting Emojis**
        Choose from **${this.client.voteEmojis.length}** different emoji sets to be used for voting in your guild.

        ${mainView.join('\n\n')}

        You can do \`${settings.prefix + name} emojis [id]\` to set the desired emojis.
      `);
      configEmbed.addField('More Information', `[Link](${confDocs}#vote-emojis)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'responses': {
      configEmbed.setAuthor(`${message.guild} | Suggestion Responses`, message.guild.iconURL());

      if (updated) {
        switch (updated) {
        case 'true':
          try {
            await this.client.mongodb.helpers.settings.updateGuild(message.guild, { responseRequired: true });
            configEmbed.setDescription(`${success} Responses required set to \`true\`. This means a response **is required** when using the \`reject\` command.`);
            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (err) {
            Logger.errorCmd(this, err.stack);
            return message.channel.send(`Error setting required responses: **${err.message}**.`);
          }
          break;
        case 'false':
          try {
            await this.client.mongodb.helpers.settings.updateGuild(message.guild, { responseRequired: false });
            configEmbed.setDescription(`${success} Responses required set to \`false\`. This means a response **is not required** when using the \`reject\` command.`);
            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (err) {
            Logger.errorCmd(this, err.stack);
            return message.channel.send(`Error setting required responses: **${err.message}**.`);
          }
          break;
        default:
          this.client.errors.invalidResponseValue(message.channel);
          break;
        }
        return;
      }

      configEmbed.setDescription(`Rejection responses are currently **${responseRequired ? 'required' : 'not required'}**.`);
      configEmbed.addField('More Information', `[Link](${confDocs}#rejection-responses)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'commands': {
      configEmbed.setAuthor(`${message.guild} | Disabled Commands`, message.guild.iconURL());

      if (updated) {
        const cmd = this.client.commands.get(updated);
        if (!cmd) return this.client.errors.commandNotFound(updated, message.channel);
        if (cmd.conf.guarded) return this.client.errors.commandIsGuarded(cmd, message.channel);
        if (cmd.conf.ownerOnly || cmd.conf.superSecretOnly) return;

        const disabledCommand = {
          guild: message.guild,
          disabledCommands: {
            command: cmd.help.name,
            added: Date.now(),
            addedByUsername: message.author.tag,
            addedByUserID: message.author.id
          }
        };

        const enabledCommand = {
          guild: message.guild,
          disabledCommands: { command: cmd.help.name }
        };

        const foundCmd = disabledCommands.find(c => c.command === cmd.help.name);
        if (foundCmd) {
          try {
            configEmbed.setDescription(`${success} Enabled the **${cmd.help.name}** command.`);
            await this.client.mongodb.helpers.settings.updateGuildCommands(enabledCommand, false);
            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (err) {
            Logger.errorCmd(this, err.stack);
            return message.channel.send(buildErrorEmbed(err));
          }
        } else {
          try {
            configEmbed.setDescription(`${success} Disabled the **${cmd.help.name}** command.`);
            await this.client.mongodb.helpers.settings.updateGuildCommands(disabledCommand, true);
            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (err) {
            Logger.errorCmd(this, err.stack);
            return message.channel.send(buildErrorEmbed(err));
          }
        }
        return;
      }

      if (!disabledCommands || disabledCommands.length < 1) return this.client.errors.noDisabledCommands(message.channel);

      configEmbed.setDescription(disabledCommands.map(c => `\`${c.command}\``).join(' | '));
      configEmbed.addField('More Information', `[Link](${confDocs}#disabled-commands)`);

      message.channel.send(configEmbed);
      break;
    }
    case 'dmresponses': {
      configEmbed.setAuthor(`${message.guild} | DM Responses`, message.guild.iconURL());

      if (updated) {
        switch (updated) {
        case 'true': {
          try {
            await this.client.mongodb.helpers.settings.updateGuild(message.guild, { dmResponses: true });
            configEmbed.setDescription(stripIndent`
                ${success} DM responses have been **enabled**. The bot will DM users when these actions happen:
                  
                  - Suggestion submitted
                  - Suggestion approved
                  - Suggestion rejected
                  - Suggestion note added
              `);

            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (err) {
            Logger.errorCmd(this, err.stack);
            return message.channel.send(buildErrorEmbed(err));
          }
          break;
        }
        case 'false': {
          try {
            await this.client.mongodb.helpers.settings.updateGuild(message.guild, { dmResponses: false });
            configEmbed.setDescription(stripIndent`
                ${success} DM responses have been **disabled**. The bot will *not* DM users when these actions happen:
                  
                  - Suggestion submitted
                  - Suggestion approved
                  - Suggestion rejected
                  - Suggestion note added
              `);

            message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
          } catch (err) {
            Logger.errorCmd(this, err.stack);
            return message.channel.send(buildErrorEmbed(err));
          }
          break;
        }
        default: {
          this.client.errors.invalidResponseValue(message.channel);
          break;
        }
        }
        return;
      }

      configEmbed.setDescription(`DM responses are currently **${dmResponses ? 'enabled' : 'disabled' }**.`);
      configEmbed.addField('More Information', `[Link](${confDocs}#dm-responses)`);
      message.channel.send(configEmbed);
      break;
    }
      case 'keeplog':
      case 'keeplogs': {
      let sChannel;
      try {
        if (!suggestionsChannel || (suggestionsChannel === this.client.config.suggestionsChannel)) {
          const channel = await getDefaultSuggestionsChannel(message.guild)
          if (!channel) return this.client.errors.noSuggestions(message.channel)

          const updated = await this.client.mongodb.helpers.settings.updateGuild(message.guild, { suggestionsChannel: channel.id })
          sChannel = channel;
          keepLogs = updated.keepLogs;
        } else {
          sChannel = suggestionsChannel && await message.guild.channels.fetch(suggestionsChannel)
          if (!sChannel) return this.client.errors.noSuggestions(message.channel)
        }
      } catch (err) {
        Logger.errorCmd(this, err.stack);
        return message.channel.send(buildErrorEmbed(err));
      }

      configEmbed.setAuthor(`${message.guild} | Keep Logs`, message.guild.iconURL());

      if (updated) {
        try {
          if (!['true', 'false'].includes(updated.toLowerCase()))
            return this.client.errors.invalidResponseValue(message.channel)

          const status = updated.toLowerCase() === 'true';
          await this.client.mongodb.helpers.settings.updateGuild(message.guild, { keepLogs: status });
          configEmbed.setDescription(`
            Approved/rejected suggestions **will ${status ? '' : 'no longer'}** be kept in ${sChannel}.
          `);

          return message.channel.send(configEmbed).then(m => m.delete({ timeout: 5000 }));
        } catch (err) {
          Logger.errorCmd(this, err.stack);
          return message.channel.send(buildErrorEmbed(err));
        }
      }

      configEmbed.setDescription(`Approved/rejected suggestions currently **are ${keepLogs ? '' : 'not'}** kept in ${sChannel}.`)
      configEmbed.addField('More Information', `[Link](${confDocs}#keep-logs)`);
      message.channel.send(configEmbed);

      break;
    }
    default: {
      configEmbed
        .setDescription(stripIndent`
          To view more information on a specific configuration option: \`${prefix + name} [setting]\`.
          
          For updating a specific configuration option: \`${prefix + usage}\`

          [More Information](${confDocs})
        `)
        .addField('Prefix', `\`${prefix + name} prefix\``, true)
        .addField('Suggestions Channel', `\`${prefix + name} channel\``, true)
        .addField('Suggestions Logs', `\`${prefix + name} logs\``, true)
        .addField('Staff Suggestions Channel', `\`${prefix + name} staffchannel\``, true)
        .addField('Staff Roles', `\`${prefix + name} roles\``, true)
        .addField('Vote Emojis', `\`${prefix + name} emojis\``, true)
        .addField('Rejection Responses', `\`${prefix + name} responses\``, true)
        .addField('Disabled Commands', `\`${prefix + name} commands\``, true)
        .addField('DM Responses', `\`${prefix + name} dmResponses\``, true)
        .addField('Keep Logs', `\`${prefix + name} keepLogs\``, true);

      message.channel.send(configEmbed);
      break;
    }
    }
  }
};
