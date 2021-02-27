const { MessageEmbed } = require('discord.js');
const permissions = require('./perms');
const { stripIndents } = require('common-tags');

class ErrorHandler {
  constructor(client) {
    this.client = client;
    this.colors = { red: '#FF4500' };
  }

  noPerms(message, perm) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(message.author + ', you lack certain permissions to do this action.')
      .setColor(this.colors.red)
      .addField('Permission', `\`${permissions[perm]} (${perm})\``);

    message.channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noSuggestionsPerms(message, roles) {
    const sorted = roles
      .sort((a, b) => a.position - b.position);

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('You lack certain staff roles to do this action.')
      .setColor(this.colors.red)
      .addField('Lowest Required Role', sorted[0].toString());

    message.channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noChannelPerms(message, channel, perms) {
    return message.channel.send(stripIndents`I am missing these permissions in the ${channel} channel! Make sure I have them: 
      ${perms.length > 1 ? perms.map(p => `\`${permissions[p]}\``).join(', ') : `\`${permissions[perms[0]]}\``}
    `).then(m => m.delete({ timeout: 5000 }));
  }

  noSuggestions(channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('A suggestions channel does not exist! Please create one or contact a server administrator.')
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noStaffSuggestions(channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('A staff suggestions channel does not exist! Please create one or contact a server administrator.')
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noSuggestionsLogs(channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('A suggestions logs channel does not exist! Please create one or contact a server administrator.')
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noUsage(channel, cmd, settings) {

    const { embedColor } = this.client.config;
    let { prefix } = this.client.config;
    if (channel.guild) prefix = settings.prefix;

    const embed = new MessageEmbed()
      .setTitle(`${cmd.help.name} | Help Information`)
      .setDescription(cmd.help.description)
      .addField('Category', `\`${cmd.help.category}\``, true)
      .addField('Usage', `\`${prefix + cmd.help.usage}\``, true)
      .setColor(embedColor)
      .setFooter('<> = Required | [] = Optional')
      .setTimestamp();

    if (cmd.conf.aliases.length) embed.addField('Aliases', `\`${cmd.conf.aliases.join(', ')}\``, true);

    return channel.send(embed)
      .then(m => m.delete({ timeout: 7500 }))
      .catch(e => this.client.logger.error(e.stack));
  }

  noSuggestion(channel, sid) {
    return channel.send(`Could not find the suggestion with the sID **${sid}** in the database.`)
      .then(m => m.delete({ timeout: 5000 }))
      .catch(e => this.client.logger.error(e));
  }

  suggestionToLong(channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('The suggestion is too long! Please shorten it.')
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  commandNotFound(command, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The command \`${command}\` was not found.`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  commandIsGuarded(command, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The command \`${command.help.name}\` is guarded and cannot be enabled/disabled!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noDisabledCommands(channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`There are no commands currently disabled for **${channel.guild}**!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  commandIsDisabled(command, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The command \`${command.help.name}\` is currently disabled!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  adminCommandIsDisabled(command, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The command \`${command.help.name}\` is currently disabled by the bot developer for maintenance!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  commandGuildOnly(command, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The command \`${command.help.name}\` can only be ran in a guild/server channel!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  channelNotFound(c, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The channel \`${c}\` was not found!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  roleNotFound(role, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The role \`${role}\` was not found!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  voteEmojiNotFound(id, channel) {
    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The emoji set ID \`${id}\` was not found!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  invalidResponseValue(channel) {
    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('The value must be `true` or `false`!')
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  userNotFound(user, channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The user \`${user}\` does not exist!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noStaffRoles(channel) {

    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('No staff roles exist! Please create them or contact a server administrator to handle suggestions.')
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  noRejectedResponse(channel) {
    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription('A response is required for rejecting this suggestion!')
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  userAlreadyBlacklisted(channel, user) {
    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`\`${user.tag}\` is already blacklisted! Cannot do this`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  userNoLongerBlacklisted(channel, user) {
    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`\`${user.tag}\` is no longer blacklisted! Cannot do this`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }

  invalidPrefixLength(channel, prefix) {
    const embed = new MessageEmbed()
      .setTitle('Error')
      .setDescription(`The prefix \`${prefix}\` is too long. It cannot be greater than **5** characters!`)
      .setColor(this.colors.red);

    channel.send(embed).then(m => m.delete({ timeout: 5000 })).catch(err => this.client.logger.error(err));
  }
}

module.exports = ErrorHandler;
