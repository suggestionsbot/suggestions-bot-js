const { RichEmbed } = require('discord.js');
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

    const { embedColor } = this.client.config;
    const { help: { usage, name } } = this;

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
        const verified = message.guild.channels.find(c => c.name === updated) ||
          message.guild.channels.get(updated) ||
          message.mentions.channels.first();
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
        const verified = message.guild.channels.find(c => c.name === updated) ||
          message.guild.channels.get(updated) ||
          message.mentions.channels.first();
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
        const verified = message.guild.channels.find(c => c.name === updated) ||
          message.guild.channels.get(updated) ||
          message.mentions.channels.first();
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
        const verified = message.guild.roles.find(c => c.name === updated) ||
          message.roles.channels.get(updated) ||
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
            await this.client.settings.updateGuildStaffRoles(updateRole, false);
            await this.client.shard.broadcastEval(`
              const { Constants, RichEmbed, Guild, Emoji  } = require('discord.js');
              const { embedColor, emojis: { success } } = this.config;

              (async () => {
                let emoji;
                const e = this.findEmojiByID(success);
                if (e) {
                  const data = await this.rest.makeRequest('get', Constants.Endpoints.Guild(e.guild).toString(), true)
                    .then(raw => {
                      const guild = new Guild(this, raw)
                      const emoji = new Emoji(guild, e);
                      return emoji;
                    });

                  emoji = '<:' + data.name + ':' + data.id + '>';
                } else {
                  emoji = '✅';
                }

                const guild = this.guilds.get('${message.guild.id}');
                const channel = this.channels.get('${message.channel.id}');
                const msg = await channel.fetchMessages('${message.id}');

                const configEmbed = new RichEmbed()
                  .setAuthor(guild, guild.iconURL)
                  .setColor(embedColor)
                  .setFooter('Guild: ' + guild.id)
                  .setTimestamp();

                configEmbed.setAuthor(guild + '| Staff Roles', guild.iconURL);
                configEmbed.setDescription(emoji + ' Removed **${verified.name}** from the staff roles.');
                return channel.send(configEmbed).then(m => m.delete(5000));
              })();
            `);
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
          }
        } else {
          try {
            await this.client.settings.updateGuildStaffRoles(updateRole, true);
            await this.client.shard.broadcastEval(`
              const { Constants, RichEmbed, Guild, Emoji  } = require('discord.js');
              const { embedColor, emojis: { success } } = this.config;

              (async () => {
                let emoji;
                const e = this.findEmojiByID(success);
                if (e) {
                  const data = await this.rest.makeRequest('get', Constants.Endpoints.Guild(e.guild).toString(), true)
                    .then(raw => {
                      const guild = new Guild(this, raw)
                      const emoji = new Emoji(guild, e);
                      return emoji;
                    });

                  emoji = '<:' + data.name + ':' + data.id + '>';
                } else {
                  emoji = '✅';
                }

                const guild = this.guilds.get('${message.guild.id}');
                const channel = this.channels.get('${message.channel.id}');
                const msg = await channel.fetchMessages('${message.id}');

                const configEmbed = new RichEmbed()
                  .setAuthor(guild, guild.iconURL)
                  .setColor(embedColor)
                  .setFooter('Guild: ' + guild.id)
                  .setTimestamp();

                configEmbed.setAuthor(guild + '| Staff Roles', guild.iconURL);
                configEmbed.setDescription(emoji + ' Added **${verified.name}** to the staff roles.');
                return channel.send(configEmbed).then(m => m.delete(5000));
              })();
            `);
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
      if (!voteEmojis) voteEmojis = 'defaultEmojis';
      configEmbed.setAuthor(`${message.guild} | Vote Emojis`, message.guild.iconURL);

      const setID = parseInt(updated);

      await this.client.shard.broadcastEval(`
        const { Constants, RichEmbed, Guild, Emoji } = require('discord.js');
        const { embedColor, discord } = this.config;

        (async () => {
          const guild = this.guilds.get('${message.guild.id}');
          if (!guild) return false;
          const channel = this.channels.get('${message.channel.id}');
          const msg = await channel.fetchMessages('${message.id}');

          const configEmbed = new RichEmbed()
            .setAuthor(guild, guild.iconURL)
            .setColor(embedColor)
            .setFooter('Guild: ' + guild.id)
            .setTimestamp();

          configEmbed.setAuthor(guild + '| Vote Emojis', guild.iconURL);

          if ('${updated}' !== '') {
            const filter = set => set.id === ${setID};
            const foundSet = this.voteEmojis.find(filter);
            if (!foundSet) return this.errors.voteEmojiNotFound('${updated}', channel);
            const emojis = foundSet.emojis.map(async e => {
              const found = this.findEmojiByID(e);
              if (found) {
                const emoji = await this.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
                  .then(raw => {
                    const guild = new Guild(this, raw)
                    const emoji = new Emoji(guild, found);
                    return emoji;
                  });

                return '<:' + emoji.name + ':' + emoji.id + '>';
              } else {
                return e;
              }
            });

            const emojiSet = await Promise.all(emojis);

            try {
              await this.settings.updateGuild(guild, { voteEmojis: foundSet.name });
              configEmbed.setDescription('The default vote emojis have been changed to ' + emojiSet.join(' '));
    
              return channel.send(configEmbed).then(m => m.delete(5000));
            } catch (err) {
              this.logger.error(err.stack);
              return channel.send('An error occurred: **' + err.message + '**');
            }
          }

          let voteEmojis = '${voteEmojis}';
          const filter = set => set.name === voteEmojis;
          const foundSet = this.voteEmojis.find(filter);
          if (!voteEmojis || !foundSet) voteEmojis = 'defaultEmojis';

          const emojiSets = this.voteEmojis.map(async set => {
            let emojiSet = set.emojis,
              view = '';
            
            if (set.custom) {
              emojiSet = emojiSet.map(async e => {
                const found = this.findEmojiByID(e);
                if (found) {
                  const emoji = await this.rest.makeRequest('get', Constants.Endpoints.Guild(found.guild).toString(), true)
                    .then(raw => {
                      const guild = new Guild(this, raw)
                      const emoji = new Emoji(guild, found);
                      return emoji;
                    });

                  return '<:' + emoji.name + ':' + emoji.id + '>';
                } else {
                  return e;
                }
              });
            }

            const emojiSetView = await Promise.all(emojiSet);

            if (voteEmojis === set.name) {
              return '\`' + set.id + '\`:' + emojiSetView.join(' ') + '***(Currently Using)***' + \`
              
              \`;
            } else {
              return '\`' + set.id + '\`:' + emojiSetView.join(' ') + \`

              \`;
            }
          });

          const mainView = await Promise.all(emojiSets);

          configEmbed.setDescription(\`
           **Voting Emojis**
           Choose from \` + this.voteEmojis.length + \` different emoji sets to be used for voting in your guild.
           
           \` +
           mainView.join(' ') + \`You can do \` + '\`${prefix + name} emojis [id]\`' + \` to set the desired emojis.

           Submit new emoji set suggestions any time by joining our Dicord server: \` + discord
          );
          
          return channel.send(configEmbed);
        })();
      `);
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
            await this.client.shard.broadcastEval(`
              const { RichEmbed } = require('discord.js');
              const { embedColor } = this.config;

              (async () => {
                const emoji = this.emojis.get('578409088157876255');
                if (!emoji) return false;
                const guild = this.guilds.get('${message.guild.id}');
                const channel = this.channels.get('${message.channel.id}');
                const msg = await channel.fetchMessages('${message.id}');

                const configEmbed = new RichEmbed()
                  .setAuthor(guild, guild.iconURL)
                  .setColor(embedColor)
                  .setFooter('Guild: ' + guild.id)
                  .setTimestamp();

                configEmbed.setAuthor(guild + '| Disabled Commands', guild.iconURL);
                configEmbed.setDescription(emoji + ' Enabled the **${cmd.help.name}** command.');
                return channel.send(configEmbed).then(m => m.delete(5000));
              })();
            `);
          } catch (err) {
            this.client.logger.error(err.stack);
            return message.channel.send(`An error occurred: **${err.message}**`);
          }
        } else {
          try {
            await this.client.settings.updateGuildCommands(disabledCommand, true);
            await this.client.shard.broadcastEval(`
              const { RichEmbed } = require('discord.js');
              const { embedColor } = this.config;

              (async () => {
                const emoji = this.emojis.get('578409088157876255');
                if (!emoji) return false;
                const guild = this.guilds.get('${message.guild.id}');
                const channel = this.channels.get('${message.channel.id}');
                const msg = await channel.fetchMessages('${message.id}');

                const configEmbed = new RichEmbed()
                  .setAuthor(guild, guild.iconURL)
                  .setColor(embedColor)
                  .setFooter('Guild: ' + guild.id)
                  .setTimestamp();

                configEmbed.setAuthor(guild + '| Disabled Commands', guild.iconURL);
                configEmbed.setDescription(emoji + ' Disabled the **${cmd.help.name}** command.');
                return channel.send(configEmbed).then(m => m.delete(5000));
              })();
            `);
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
