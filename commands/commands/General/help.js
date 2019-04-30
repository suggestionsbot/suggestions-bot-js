const { oneLine } = require('common-tags');
const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      category: 'General',
      description: 'View bot commands and where to receive bot support.',
      usage: 'help [command]',
      aliases:  ['h', 'halp'],
      botPermissions: ['EMBED_LINKS'],
      guildOnly: false,
      guarded: true
    });
  }

  async run(message, args, settings) {
    const { owner, embedColor, discord, website, prefix: defPrefix } = this.client.config;
    let staffRoles;
    let { prefix, suggestionsChannel } = settings;
    const { staffRoles: roles } = settings;

    if (message.guild) {
      suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) ||
                message.guild.channels.find(c => c.toString() === suggestionsChannel) ||
                message.guild.channels.get(suggestionsChannel) || '';

      staffRoles = [];
      if (roles) staffRoles = roles.map(role => message.guild.roles.find(r => r.name === role.role || r.id === role.role));
    }

    if (!message.guild) prefix = defPrefix;

    const cmdSetChannel = await this.client.commands.get('setchannel');
    const setChannelUsage = cmdSetChannel.help.usage;

    const cmds = this.client.commands;
    const cmd = args[0];

    if (cmd) {

      const cmdObj = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
      if (!cmdObj) return;
      const cmdHelp = cmdObj.help;
      const cmdConf = cmdObj.conf;

      const cmdHelpEmbed = new RichEmbed()
        .setTitle(`${cmdHelp.name} | Help Information`)
        .setDescription(cmdHelp.description)
        .addField('Category', `\`${cmdHelp.category}\``, true)
        .setColor(embedColor)
        .setFooter('<> = Required | [] = Optional')
        .setTimestamp();
      if (cmdHelp.usage !== null) cmdHelpEmbed.addField('Usage', `\`${prefix + cmdHelp.usage}\``, true);
      if (cmdConf.aliases.length) cmdHelpEmbed.addField('Aliases', `\`${cmdConf.aliases.join(', ')}\``, true);

      return message.channel.send(cmdHelpEmbed);
    }

    const generalCmds = cmds
      .filter(c => c.conf.ownerOnly === false && c.conf.adminOnly === false && c.conf.staffOnly === false && c.conf.superSecretOnly === false)
      .map(c => c.help.name)
      .sort()
      .map(c => '`' + c + '`');

    const staffCmds = cmds
      .filter(c => c.conf.staffOnly === true)
      .map(c => c.help.name)
      .sort()
      .map(c => '`' + c + '`');

    const adminCmds = cmds
      .filter(c => c.conf.adminOnly === true)
      .map(c => c.help.name)
      .sort()
      .map(c => '`' + c + '`');

    const ownerCmds = cmds
      .filter(c => c.conf.ownerOnly === true)
      .map(c => c.help.name)
      .sort()
      .map(c => '`' + c + '`');

    const helpEmbed = new RichEmbed()
      .setTitle('Help Information')
      .setDescription(oneLine`
          View help information for ${this.client.user}.
          (Do ${`\`${prefix + this.help.usage}\``}
          for specific help information).
      `)
      .setColor(embedColor);

    if (message.guild) {
      helpEmbed
        .addField('📣 Current Prefix', `\`${prefix}\``)
        .addField('💬 Suggestions Channel', suggestionsChannel.toString() ||
          (message.member.hasPermission('MANAGE_GUILD') && !suggestionsChannel ?
            `***Not set. Use*** \`${prefix + setChannelUsage}\`` :
            '***Not set. Contact a server administrator.***'))
        .addField('🤖 General Commands', generalCmds.join(' | '));
      if (message.member.hasPermission('MANAGE_GUILD') || message.member.roles.some(r => staffRoles.includes(r))) helpEmbed.addField('🗄 Staff Commands', staffCmds.join(' | '));
      if (message.member.hasPermission('MANAGE_GUILD')) helpEmbed.addField('🛡 Admin Commands', adminCmds.join(' | '));
      if (this.client.isOwner(message.author.id)) helpEmbed.addField('🔒 Owner Commands', ownerCmds.join(' | '));
    } else {
      helpEmbed.addField('📣 Default Prefix', `\`${this.client.config.prefix}\``)
        .addField('🤖 General Commands', generalCmds.join(' | '))
        .addField('🗄 Staff Commands', staffCmds.join(' | '))
        .addField('🛡 Admin Commands', adminCmds.join(' | '));
      if (this.client.isOwner(message.author.id)) helpEmbed.addField('🔒 Owner Commands', ownerCmds.join(' | '));
    }
    helpEmbed.addField('ℹ Website', website);
    helpEmbed.addField('❗ Found an issue?', `Please report any issues to <@${owner}> via the Support Discord: ${discord}`);

    message.channel.send(helpEmbed);
  }
};
