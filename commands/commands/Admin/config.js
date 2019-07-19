const { Constants, RichEmbed, Guild, Emoji  } = require('discord.js');
const { stripIndent } = require('common-tags');
const Command = require('../../Command');

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
      guarded: true
    });
  }

  async run(message, args, settings) {

    const { embedColor, docs, emojis: { success }, discord } = this.client.config;
    const { help: { usage, name } } = this;
    const confDocs = `${docs}/docs/configuration.html`;

    const setting = args[0],
      updated = args.slice(1).join(' ');

    updated.cleanDoubleQuotes();

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
      staffSuggestionsChannel
    } = settings;

    let roles = [];
    try {
      roles = message.guild.roles.filter(role => staffRoles.map(r => r.role).includes(role.id));

      suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) ||
        (message.guild.channels.get(suggestionsChannel)) ||
        '';

      suggestionsLogs = message.guild.channels.find(c => c.name === suggestionsLogs) ||
          message.guild.channels.get(suggestionsLogs) ||
          '';
          
      staffSuggestionsChannel = message.guild.channels.find(c => c.name === staffSuggestionsChannel) ||
        (message.guild.channels.find(c => c.id === staffSuggestionsChannel)) ||
        '';
        
    } catch (err) {
      this.client.logger.error(err.stack);
      return message.channel.send(err.message);
    }

    const configEmbed = new RichEmbed()
      .setAuthor(message.guild, message.guild.iconURL)
      .setColor(embedColor)
      .setFooter(`Guild: ${message.guild.id}`)
      .setTimestamp();

    const successEmoji = await this.client.shard.broadcastEval(`this.findEmojiByID.call(this, '${success}')`)
      .then(emojiArray => {
        const found = emojiArray.find(e => e);
        if (!found) return '✅';

        return this.client.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
          .then(raw => {
            const guild = new Guild(this.client, raw);
            const gEmoji = new Emoji(guild, found);
            return `<:${gEmoji.name}:${gEmoji.id}>`;
          });
      })
      .catch(error => {
        this.client.logger.error(error.stack);
        return message.channel.send(`An error occurred: **${error.message}**`);
      });

    switch (setting) {
    case 'prefix': {
      configEmbed.setAuthor(`${message.guild} | Prefix`, message.guild.iconURL);

      if (updated) {
        try {
          await this.client.settings.updateGuild(message.guild, { prefix: updated });
          configEmbed.setDescription(`${successEmoji} Prefix has been updated to: \`${updated}\``);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      configEmbed.setDescription(`Current prefix: \`${prefix}\``);
      configEmbed.addField('More Information', `[Link](${confDocs}#prefix)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'channel': {
      configEmbed.setAuthor(`${message.guild} | Suggestions Channel`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.channels.find(c => c.name === updated) ||
          message.guild.channels.get(updated) ||
          message.mentions.channels.first();
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.settings.updateGuild(message.guild, { suggestionsChannel: verified.id });
          configEmbed.setDescription(`${successEmoji} Suggestions channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      if (!suggestionsChannel) return this.client.errors.noSuggestions(message.channel);
      configEmbed.setDescription(`Current suggestions channel: ${suggestionsChannel}`);
      configEmbed.addField('More Information', `[Link](${confDocs}#suggestions-channel)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'logs': {
      configEmbed.setAuthor(`${message.guild} | Suggestion Logs Channel`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.channels.find(c => c.name === updated) ||
          message.guild.channels.get(updated) ||
          message.mentions.channels.first();
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.settings.updateGuild(message.guild, { suggestionsLogs: verified.id });
          configEmbed.setDescription(`${successEmoji} Suggestion logs channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      if (!suggestionsLogs) return this.client.errors.noSuggestionsLogs(message.channel);
      configEmbed.setDescription(`Current suggestions logs channel: ${suggestionsLogs}`);
      configEmbed.addField('More Information', `[Link](${confDocs}#suggestions-logs-channel)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'staffchannel': {
      configEmbed.setAuthor(`${message.guild} | Suggestions Staff Channel`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.channels.find(c => c.name === updated) ||
          message.guild.channels.get(updated) ||
          message.mentions.channels.first();
        if (!verified) return this.client.errors.channelNotFound(updated, message.channel);

        try {
          await this.client.settings.updateGuild(message.guild, { staffSuggestionsChannel: verified.id });
          configEmbed.setDescription(`${successEmoji} Suggestions staff channel has been updated to: ${verified}`);

          return message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (err) {
          this.client.logger.error(err);
          return message.channel.send(`An error occurred: **${err.message}**`);
        }
      }

      if (!staffSuggestionsChannel) return this.client.errors.noStaffSuggestions(message.channel);
      configEmbed.setDescription(`Current staff suggestions channel: ${staffSuggestionsChannel}`);
      configEmbed.addField('More Information', `[Link](${confDocs}#staff-suggestions-channel)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'roles': {
      configEmbed.setAuthor(`${message.guild} | Staff Roles`, message.guild.iconURL);

      if (updated) {
        const verified = message.guild.roles.find(c => c.name === updated) ||
          message.guild.roles.channels.get(updated) ||
          message.mentions.roles.first();
        if (!verified) return this.client.errors.roleNotFound(updated, message.channel);

        const filter = r => r.role === verified.id;
        const sRole = staffRoles.find(filter);
        const updateRole = {
          query: { guildID: message.guild.id },
          staffRoles: { role: verified.id }
        };

        if (sRole) {
          try {
            configEmbed.setDescription(`${successEmoji} Removed **${verified.name}** from the staff roles.`);
            await this.client.settings.updateGuildStaffRoles(updateRole, false);
            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (error) {
            this.client.logger.error(error.stack);
            return message.channel.send(`An error occurred: **${error.message}**`);
          }
        } else {
          try {
            configEmbed.setDescription(`${successEmoji} Added **${verified.name}** to the staff roles.`);
            await this.client.settings.updateGuildStaffRoles(updateRole, true);
            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (error) {
            this.client.logger.error(error.stack);
            return message.channel.send(`An error occurred: **${error.message}**`);
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
      configEmbed.addField('More Information', `[Link](${confDocs}#staff-roles)`);

      message.channel.send(configEmbed);
      break;
    }
    case 'emojis': {
      if (!voteEmojis) voteEmojis = 'defaultEmojis';
      configEmbed.setAuthor(`${message.guild} | Vote Emojis`, message.guild.iconURL);

      const setID = parseInt(updated);

      if (updated) {
        const filter = set => set.id === setID;
        const foundSet = this.client.voteEmojis.find(filter);
        if (!foundSet) return this.client.errors.voteEmojiNotFound(updated, channel);
        
        const emojis = foundSet.emojis.map(async e => {
          if (foundSet.custom) {
            return this.client.shard.broadcastEval(`this.findEmojiByID.call(this, '${e}')`)
              .then(async emojiArray => {
                const found = emojiArray.find(e => e);
                if (!found) return '**N/A**';

                const emoji = await this.client.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
                  .then(raw => {
                    const guild = new Guild(this.client, raw)
                    const gEmoji = new Emoji(guild, found);
                    return gEmoji;
                  });

                return `<:${emoji.name}:${emoji.id}>`;
              })
              .catch(error => {
                this.client.logger.error(error.stack);
                return message.channel.send(`An error occurred: **${error.message}**`);
              });
          } else {
            return e;
          }
        });

        try {
          const emojiSet = await Promise.all(emojis);
          await this.client.settings.updateGuild(message.guild, { voteEmojis: foundSet.name });
          configEmbed.setDescription(`${successEmoji} The default vote emojis have been changed to ${emojiSet.join(' ')}`);
          message.channel.send(configEmbed).then(m => m.delete(5000));
        } catch (error) {
          this.client.logger.error(error.stack);
          return message.channel.send(`An error occurred: **${error.message}**`);
        }

        return;
      }

      const emojiSets = this.client.voteEmojis.map(async set => {
        let emojiSet = set.emojis;

        if (set.custom) {
          emojiSet = emojiSet.map(async e => {
            return this.client.shard.broadcastEval(`this.findEmojiByID.call(this, '${e}')`)
              .then(async emojiArray => {
                const found = emojiArray.find(e => e);
                if (!found) return '**N/A**';

                const emoji = await this.client.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
                  .then(raw => {
                    const guild = new Guild(this.client, raw)
                    const gEmoji = new Emoji(guild, found);
                    return gEmoji;
                  });

                return `<:${emoji.name}:${emoji.id}>`;
              })
              .catch(error => {
                this.client.logger.error(error.stack);
                return message.channel.send(`An error occurred: **${error.message}**`);
              });
          });
        }

        const emojiSetView = await Promise.all(emojiSet);

        if (voteEmojis === set.name) return `\`${set.id}\`: ${emojiSetView.join(' ')} ***(Currently Using)***`;
        else return `\`${set.id}\`: ${emojiSetView.join(' ')}`;
      });

      const mainView = await Promise.all(emojiSets);
      
      configEmbed.setDescription(stripIndent`
        **Voting Emojis**
        Choose from **${this.client.voteEmojis.length}** different emoji sets to be used for voting in your guild.

        ${mainView.join('\n\n')}

        You can do \`${settings.prefix + name} emojis [id]\` to set the desired emojis.

        Submit new emoji set suggestions any time by joining our Discord server: ${discord}
      `);
      configEmbed.addField('More Information', `[Link](${confDocs}#vote-emojis)`);
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
            configEmbed.setDescription(`${successEmoji} Responses required set to \`true\`. This means a response **is required** when using the \`reject\` command.`);
            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`Error setting required responses: **${err.message}**.`);
          }
          break;
        case 'false':
          try {
            await this.client.settings.updateGuild(message.guild, { responseRequired: false });
            configEmbed.setDescription(`${successEmoji} Responses required set to \`false\`. This means a response **is not required** when using the \`reject\` command.`);
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
      configEmbed.addField('More Information', `[Link](${confDocs}#rejection-responses)`);
      message.channel.send(configEmbed);
      break;
    }
    case 'commands': {
      configEmbed.setAuthor(`${message.guild} | Disabled Commands`, message.guild.iconURL);

      if (updated) {
        const cmd = this.client.commands.get(updated);
        if (!cmd) return this.client.errors.commandNotFound(updated, message.channel);
        if (cmd.conf.guarded) return this.client.errors.commandIsGuarded(cmd, message.channel);
        if (cmd.conf.ownerOnly || cmd.conf.superSecretOnly) return;

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
            configEmbed.setDescription(`${successEmoji} Enabled the **${cmd.help.name}** command.`);
            await this.client.settings.updateGuildCommands(enabledCommand, false);
            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
          }
        } else {
          try {
            configEmbed.setDescription(`${successEmoji} Disabled the **${cmd.help.name}** command.`);
            await this.client.settings.updateGuildCommands(disabledCommand, true);
            message.channel.send(configEmbed).then(m => m.delete(5000));
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
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
    case 'dmResponses': {
      configEmbed.setAuthor(`${message.guild} | DM Responses`, message.guild.iconURL);

      if (updated) {
        switch (updated) {
        case 'true': {
          try {
            await this.client.settings.updateGuild(message.guild, { dmResponses: true });
            configEmbed.setDescription(stripIndent`
                ${successEmoji} DM responses have been enabled. The bot will DM users when these actions happen:
                  
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
            configEmbed.setDescription(stripIndent`
                ${successEmoji} DM responses have been disabled. The bot will *not* DM users when these actions happen:
                  
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
      configEmbed.addField('More Information', `[Link](${confDocs}#dm-responses)`);
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
        .addField('DM Responses', `\`${prefix + name} dmResponses\``, true);

      message.channel.send(configEmbed);
      break;
    }
    }

    return;
  }
};
