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
    let staffRoles,
      staffCheck,
      adminCheck;
    let { prefix, suggestionsChannel } = settings;
    const { staffRoles: roles } = settings;
    const configCmdName = this.client.commands.get('config').help.name;

    const botOwner = this.client.users.get(owner);
    const ownerCheck = this.client.isOwner(message.author.id);

    if (message.guild) {
      suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) ||
        message.guild.channels.find(c => c.toString() === suggestionsChannel) ||
        message.guild.channels.get(suggestionsChannel) || '';

      staffRoles = [];
      if (roles) staffRoles = roles.map(({ role }) => message.guild.roles.get(role));

      staffCheck = message.member.hasPermission('MANAGE_GUILD') ||
        message.member.roles.some(r => staffRoles.includes(r));

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
            `***Not set. Use*** \`${prefix + configCmdName} <channel> <channel_name>\`` :
            '***Not set. Contact a server administrator.***'))
        .addField('🤖 General Commands', this.mapCommands(cmds, 'General').join(' | '));
      if (staffCheck) helpEmbed.addField('🗄 Staff Commands', this.mapCommands(cmds, 'Staff').join(' | '));
      if (adminCheck) helpEmbed.addField('🛡 Admin Commands', this.mapCommands(cmds, 'Admin').join(' | '));
      if (ownerCheck) helpEmbed.addField('🔒 Owner Commands', this.mapCommands(cmds, 'Bot Owner').join(' | '));
    } else {
      helpEmbed.addField('📣 Default Prefix', `\`${this.client.config.prefix}\``)
        .addField('🤖 General Commands', this.mapCommands(cmds, 'General').join(' | '))
        .addField('🗄 Staff Commands', this.mapCommands(cmds, 'Staff').join(' | '))
        .addField('🛡 Admin Commands', this.mapCommands(cmds, 'Admin').join(' | '));
      if (ownerCheck) helpEmbed.addField('🔒 Owner Commands', this.mapCommands(cmds, 'Bot Owner').join(' | '));
    }
    helpEmbed.addField('ℹ Website', website);
    helpEmbed.addField('❗ Found an issue?', `Please report any issues to ${botOwner} via the Support Discord: ${discord}`);

    message.channel.send(helpEmbed);
  }

  mapCommands(commands, category) {
    return commands
      .filter(c => c.help.category === category)
      .map(c => c.help.name)
      .sort()
      .map(name => `\`${name}\``);
  }
};
