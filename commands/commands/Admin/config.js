const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class ConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'config',
      category: 'Admin',
      description: 'View a text-based version of the bot configuration for the guild.',
      aliases: ['conf', 'settings'],
      usage: 'config [setting] [value]',
      adminOnly: true,
      botPermissions: ['MANAGE_MESSAGES'],
      guarded: true
    });
    this.voteEmojis = require('../../../utils/voteEmojis');
  }

  async run(message, args, settings) {

    const { embedColor, discord } = this.client.config;
    const { help: { usage, name } } = this;

    const setting = args[0],
      updated = args[1];

    const {
      prefix,
      staffRoles,
      voteEmojis,
      responseRequired,
      disabledCommands,
      dmResponses
    } = settings;

    let {
      suggestionsLogs,
      suggestionsChannel,
      staffSuggestionsChannel
    } = settings;

    let roles = [];
    try {
      roles = message.guild.roles.filter(role => staffRoles.map(r => r.role).includes(role.id));
      suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) || (message.guild.channels.find(c => c.toString() === suggestionsChannel)) || (message.guild.channels.get(suggestionsChannel)) || '';
      suggestionsLogs = message.guild.channels.find(c => c.name === suggestionsLogs) || message.guild.channels.find(c => c.toString() === suggestionsLogs) || message.guild.channels.get(suggestionsLogs) || '';
      staffSuggestionsChannel = message.guild.channels.find(c => c.name === staffSuggestionsChannel) || (message.guild.channels.find(c => c.toString() === staffSuggestionsChannel)) || (message.guild.channels.find(c => c.id === staffSuggestionsChannel)) || '';
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(err.message);
    }

    const configEmbed = new RichEmbed()
      .setAuthor(message.guild, message.guild.iconURL)
      .setColor(embedColor)
      .setFooter(`Guild: ${message.guild.id}`)
      .setTimestamp();

    switch (setting) {
    case 'prefix': {
      configEmbed.setAuthor(`${message.guild} | Prefix`, message.guild.iconURL);

      if (updated) {
        try {
          await this.client.settings.updateGuild(message.guild, { prefix: updated });
          configEmbed.setDescription(`Prefix has been updated to: \`${updated}\``);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      configEmbed.setDescription(`Current prefix: \`${prefix}\``);
      message.channel.send(configEmbed);
      break;
    }
    case 'channel': {
      configEmbed.setAuthor(`${message.guild} | Suggestions Channel`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.channels.find(c => c.name === updated) || message.guild.channels.find(c => c.toString() === updated);
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.settings.updateGuild(message.guild, { suggestionsChannel: verified.id });
          configEmbed.setDescription(`Suggestions channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      configEmbed.setDescription(`Current suggestions channel: ${suggestionsChannel}`);
      message.channel.send(configEmbed);
      break;
    }
    case 'logs': {
      configEmbed.setAuthor(`${message.guild} | Suggestion Logs Channel`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.channels.find(c => c.name === updated) || message.guild.channels.find(c => c.toString() === updated);
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.settings.updateGuild(message.guild, { suggestionsLogs: verified.id });
          configEmbed.setDescription(`Suggestion logs channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);
      configEmbed.setDescription(`Current suggestions logs channel: ${suggestionsLogs}`);
      message.channel.send(configEmbed);
      break;
    }
    case 'staffchannel': {
      configEmbed.setAuthor(`${message.guild} | Suggestions Staff Channel`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.channels.find(c => c.name === updated) || message.guild.channels.find(c => c.toString() === updated);
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.settings.updateGuild(message.guild, { staffSuggestionsChannel: verified.id });
          configEmbed.setDescription(`Suggestions staff channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      if (!staffSuggestionsChannel) return this.client.errors.noStaffSuggestions(message.channel);
      configEmbed.setDescription(`Current staff suggestions channel: ${staffSuggestionsChannel}`);
      message.channel.send(configEmbed);
      break;
    }
    case 'roles': {
      configEmbed.setAuthor(`${message.guild} | Staff Roles`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.roles.find(r => r.name === updated) || message.guild.roles.find(r => r.toString() === updated);
        if (!verified) return this.client.errors.roleNotFound(updated, message.channel);

        const filter = r => r.role === verified.id;
        const sRole = staffRoles.find(filter);
        const updateRole = {
          query: { guildID: message.guild.id },
          staffRoles: { role: verified.id }
        };

        if (sRole) {
          try {
            await this.client.settings.updateGuildStaffRoles(updateRole, false);
            configEmbed.setDescription(`<:nerdSuccess:490708616056406017> Removed **${verified.name}** from the staff roles.`);

            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
          }
        } else {
          try {
            await this.client.settings.updateGuildStaffRoles(updateRole, true);
            configEmbed.setDescription(`<:nerdSuccess:490708616056406017> Added **${verified.name}** to the staff roles.`);

            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
          }
        }

        return;
      }

      const viewRoles = roles
        .sort((a, b) => b.position - a.position)
        .map(r => r.toString())
        .join('\n') || null;

      const admins = message.guild.members
        .filter(m => !m.user.bot && m.hasPermission('MANAGE_GUILD'))
        .map(m => m.toString())
        .join('\n');

      configEmbed
        .setDescription(`Add/remove a staff role by doing \`${prefix + name} roles [role]\``)
        .addField('Admins', admins);

      if (staffRoles.length >= 1) configEmbed.addField('Staff Roles', viewRoles);

      message.channel.send(configEmbed);
      break;
    }
    case 'emojis': {
      configEmbed.setAuthor(`${message.guild} | Vote Emojis`, message.guild.iconURL);

      const vEmojis = this.voteEmojis(this.client);
      const setID = parseInt(updated);

      if (updated) {
        const filter = set => set.id === setID;
        const foundSet = vEmojis.find(filter);
        const emojiSet = foundSet.emojis;

        if (!foundSet) return this.client.errors.voteEmojiNotFound(updated, message.channel);

        try {
          await this.client.settings.updateGuild(message.guild, { voteEmojis: foundSet.name });
          configEmbed.setDescription(`The default vote emojis have been changed to ${emojiSet.join(' ')}.`);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err.stack);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      let view = '';
      const emojiSets = [];
      vEmojis.forEach(set => {

        const emojiSet = set.emojis;

        view = `\`${set.id}\`: ${emojiSet[0] ? emojiSet.join(' ') : 'Not found'}`;
        if (settings.voteEmojis === set.name) {
          view = `\`${set.id}\`: ${emojiSet[0] ? emojiSet.join(' ') : 'Not found'} ***(Currently Using)***`;
        }

        emojiSets.push(view);
      });

      if (!voteEmojis) {
        const str = emojiSets[0].concat(' ', '***(Currently Using)***');
        emojiSets[0] = str;
      }

      configEmbed.setDescription(`
                    **Voting Emojis**
                    Choose from ${vEmojis.length} different emoji sets to be used for voting in your guild.

                    ${emojiSets.join('\n\n')}

                    You can do \`${prefix + name} emojis [id]\` to set the desired emojis.
                    Submit new emoji set suggestions any time by joining our Discord server: ${discord}
                    `);

      message.channel.send(configEmbed);
      break;
    }
    case 'responses': {
      configEmbed.setAuthor(`${message.guild} | Suggestion Responses`, message.guild.iconURL);

      if (updated) {
        switch (updated) {
        case 'true':
          try {
            await this.client.settings.updateGuild(message.guild, { responseRequired: true });
            configEmbed.setDescription('Responses required set to `true`. This means a response **is required** when using the `reject` command.');
            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error setting required responses: **${err.message}**.`);
          }
          break;
        case 'false':
          try {
            await this.client.settings.updateGuild(message.guild, { responseRequired: false });
            configEmbed.setDescription('Responses required set to `false`. This means a response **is not required** when using the `reject` command.');
            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
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
      message.channel.send(configEmbed);
      break;
    }
    case 'commands': {
      configEmbed.setAuthor(`${message.guild} | Disabled Commands`, message.guild.iconURL);

      if (updated) {
        const cmd = this.client.commands.get(updated);
        if (!cmd) return this.client.errors.commandNotFound(updated, message.channel);
        if (cmd.conf.guarded) return this.client.errors.commandIsGuarded(cmd, message.channel);
        if (cmd.conf.ownerOnly || cmd.conf.superSecretOnly) return this.client.errors.commandNotFound(cmd, message.channel);

        const disabledCommand = {
          query: { guildID: message.guild.id },
          disabledCommands: {
            command: cmd.help.name,
            added: Date.now(),
            addedByUsername: message.author.tag,
            addedByUserID: message.author.id
          }
        };

        const enabledCommand = {
          query: { guildID: message.guild.id },
          disabledCommands: { command: cmd.help.name }
        };

        const foundCmd = disabledCommands.find(c => c.command === cmd.help.name);
        if (foundCmd) {
          try {
            await this.client.settings.updateGuildCommands(enabledCommand, false);
            configEmbed.setDescription(`<:nerdSuccess:490708616056406017> Enabled the **${cmd.help.name}** command.`);

            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
          }
        } else {
          try {
            await this.client.settings.updateGuildCommands(disabledCommand, true);
            configEmbed.setDescription(`<:nerdSuccess:490708616056406017> Disabled the **${cmd.help.name}** command.`);

            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
          }
        }
        return;
      }

      if (!disabledCommands || disabledCommands.length < 1) return this.client.errors.noDisabledCommands(message.channel);

      configEmbed
        .setDescription(disabledCommands.map(c => `\`${c.command}\``).join(' | '));

      message.channel.send(configEmbed);
      break;
    }
    case 'dmResponses': {
      configEmbed.setAuthor(`${message.guild} | DM Responses`, message.guild.iconURL);

      if (updated) {
        switch (updated) {
        case 'true': {
          try {
            await this.client.settings.updateGuild(message.guild, { dmResponses: true });
            configEmbed
              .setDescription(`
                                    DM responses have been enabled. The bot will DM users when these actions happen:
                                    
                                    - Suggestion submitted
                                    - Suggestion approved
                                    - Suggestion rejected
                                    - Suggestion note added
                                `);

            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**.`);
          }
          break;
        }
        case 'false': {
          try {
            await this.client.settings.updateGuild(message.guild, { dmResponses: false });
            configEmbed
              .setDescription(`
                                    DM responses have been disabled. The bot will *not* DM users when these actions happen:
                                    
                                    - Suggestion submitted
                                    - Suggestion approved
                                    - Suggestion rejected
                                    - Suggestion note added
                                `);

            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**.`);
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

      message.channel.send(configEmbed);
      break;
    }
    default: {
      configEmbed
        .setDescription(`
                    To view more information on a specific configuration option: \`${prefix + name} [setting]\`.
                    
                    For updating a specific configuration option: \`${prefix + usage}\`
                    `)
        .addField('Prefix', `\`${prefix + name} prefix\``, true)
        .addField('Suggestions Channel', `\`${prefix + name} channel\``, true)
        .addField('Suggestions Logs', `\`${prefix + name} logs\``, true)
        .addField('Staff Suggestions Channel', `\`${prefix + name} staffchannel\``, true)
        .addField('Staff Roles', `\`${prefix + name} roles\``, true)
        .addField('Vote Emojis', `\`${prefix + name} emojis\``, true)
        .addField('Rejection Responses', `\`${prefix + name} responses\``, true)
        .addField('Disabled Commands', `\`${prefix + name} commands\``, true)
        .addField('DM Responses', `\`${prefix + name} dmResponses\``, true);

      message.channel.send(configEmbed);
      break;
    }
    }

    return;
  }
};
