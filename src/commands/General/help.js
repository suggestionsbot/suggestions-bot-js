const { oneLine } = require('common-tags');
const { MessageEmbed } = require('discord.js-light');
const Command = require('../../structures/Command');
const { validateChannel } = require('../../utils/functions');

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
    const { colors, discord, website, prefix: defPrefix, github } = this.client.config;
    let staffRoles,
      staffCheck,
      adminCheck;
    let { prefix, suggestionsChannel } = settings;
    const { staffRoles: roles } = settings;
    const configCmdName = this.client.commands.get('config').help.name;

    const ownerCheck = this.client.isOwner(message.author.id);

    if (message.guild) {
      suggestionsChannel = await validateChannel(message.guild.channels, suggestionsChannel);

      staffRoles = [];
      if (roles) staffRoles = roles.map(({ role }) => message.guild.roles.cache.get(role));

      staffCheck = message.member.hasPermission('MANAGE_GUILD') ||
        message.member.roles.cache.some(r => staffRoles.includes(r));

      adminCheck = message.member.hasPermission('MANAGE_GUILD');
    }

    if (!message.guild) prefix = defPrefix;

    const cmds = this.client.commands;
    const cmd = args[0];

    if (cmd) {

      const cmdObj = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
      if (!cmdObj) return;
      const cmdHelp = cmdObj.help;
      const cmdConf = cmdObj.conf;

      const cmdHelpEmbed = new MessageEmbed()
        .setTitle(`${cmdHelp.name} | Help Information`)
        .setDescription(cmdHelp.description)
        .addField('Category', `\`${cmdHelp.category}\``, true)
        .addField('Guild Only', `\`${cmdConf.guildOnly ? 'True' : 'False'}\``, true)
        .setColor(colors.main)
        .setFooter('<> = Required | [] = Optional')
        .setTimestamp();
      if (cmdHelp.usage !== null) cmdHelpEmbed.addField('Usage', `\`${prefix + cmdHelp.usage}\``, true);
      if (cmdConf.aliases.length) cmdHelpEmbed.addField('Aliases', `\`${cmdConf.aliases.join(', ')}\``, true);

      return message.channel.send(cmdHelpEmbed);
    }

    const helpEmbed = new MessageEmbed()
      .setTitle('Help Information')
      .setDescription(oneLine`
          View help information for ${this.client.user}.
          (Do ${`\`${prefix + this.help.usage}\``}
          for specific help information).`)
      .setColor(colors.main);

    if (message.guild) {
      helpEmbed
        .addField('📣 Current Prefix', `\`${prefix}\``)
        .addField('💬 Suggestions Channel', suggestionsChannel?.toString() ??
          (message.member.hasPermission('MANAGE_GUILD') && !suggestionsChannel ?
            `***Not set. Use*** \`${prefix + configCmdName} channel #channel_name\`` :
            '***Not set. Contact a server administrator.***'
          )
        )
        .addField('🤖 General Commands', this.mapRegularCommands(cmds).join(' | '));
      if (staffCheck) helpEmbed.addField('🗄 Staff Commands', this.mapCommands(cmds, 'Staff').join(' | '));
      if (adminCheck) helpEmbed.addField('🛡 Admin Commands', this.mapCommands(cmds, 'Admin').join(' | '));
      if (ownerCheck) helpEmbed.addField('🔒 Owner Commands', this.mapCommands(cmds, 'Bot Owner').join(' | '));
    } else {
      helpEmbed
        .addField('📣 Default Prefix', `\`${this.client.config.prefix}\``)
        .addField('🤖 General Commands', this.mapRegularCommands(cmds).join(' | '))
        .addField('🗄 Staff Commands', this.mapCommands(cmds, 'Staff').join(' | '))
        .addField('🛡 Admin Commands', this.mapCommands(cmds, 'Admin').join(' | '));
      if (ownerCheck) helpEmbed.addField('🔒 Owner Commands', this.mapCommands(cmds, 'Bot Owner').join(' | '));
    }
    helpEmbed.addField('ℹ Website', website);
    helpEmbed.addField('⚙ GitHub', github);
    helpEmbed.addField('❗ Found an issue?', `Please report any issues directly to the **Support Team** via the Support Discord: ${discord}`);

    message.channel.send(helpEmbed);
  }

  mapCommands(commands, category) {
    return commands
      .filter(c => c.help.category === category)
      .map(c => c.help.name)
      .sort()
      .map(name => `\`${name}\``);
  }

  mapRegularCommands(commands) {
    return commands
      .filter(c => !c.conf.adminOnly
        && !c.conf.ownerOnly
        && !c.conf.staffOnly
        && !c.conf.superSecretOnly
      )
      .map(c => `\`${c.help.name}\``)
      .sort();
  }
};
