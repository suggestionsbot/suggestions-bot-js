const { RichEmbed } = require('discord.js');
const Command = require('../../Command');

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            category: 'General',
            description: 'View bot commands and where to receive bot support.',
            aliases:  ['h', 'halp'],
            botPermissions: ['EMBED_LINKS']
        });
    }

    async run(message, args) {
        let { owner, embedColor, discord, docs } = this.client.config;
        let gSettings = await this.client.settings.getSettings(message.guild).catch(err => {
            this.client.logger.error(err);
            return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
        });

        let {
            prefix,
            staffRoles: roles,
            suggestionsChannel
        } = gSettings;

        suggestionsChannel = message.guild.channels.find(c => c.name === suggestionsChannel) || message.guild.channels.find(c => c.toString() === suggestionsChannel) || message.guild.channels.get(suggestionsChannel) || '';

        let staffRoles = [];
        if (roles) staffRoles = roles.map(role => message.guild.roles.find(r => r.name === role.role || r.id === role.role));

        let cmdName = this.help.name;
        let cmdSetChannel = await this.client.commands.get('setchannel');
        let setChannelUsage = cmdSetChannel.help.usage;

        let cmds = this.client.commands;
        let cmd = args[0];

        if (cmd) {

            let cmdObj = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
            if (!cmdObj) return;
            let cmdHelp = cmdObj.help;
            let cmdConf = cmdObj.conf;
    
            let cmdHelpEmbed = new RichEmbed()
                .setTitle(`${cmdHelp.name} | Help Information`)
                .setDescription(cmdHelp.description)
                .addField('Category', `\`${cmdHelp.category}\``, true)
                .setColor(embedColor)
                .setFooter('<> = Required | [] = Optional')
                .setTimestamp();
            if (cmdHelp.usage !== null) cmdHelpEmbed.addField('Usage', `\`${cmdHelp.usage}\``, true);
            if (cmdConf.aliases.length) cmdHelpEmbed.addField('Aliases', `\`${cmdConf.aliases.join(', ')}\``, true);

            return message.channel.send(cmdHelpEmbed);
        }

        const generalCmds = cmds.filter(cmd => cmd.conf.ownerOnly === false && cmd.conf.adminOnly === false && cmd.conf.staffOnly === false).map(cmd => cmd.help.name).sort().map(cmd => '`'+ cmd + '`');
        const staffCmds = cmds.filter(cmd => cmd.conf.staffOnly === true).map(cmd => cmd.help.name).sort().map(cmd => '`'+ cmd + '`');
        const adminCmds = cmds.filter(cmd => cmd.conf.adminOnly === true).map(cmd => cmd.help.name).sort().map(cmd => '`'+ cmd + '`');
        const ownerCmds = cmds.filter(cmd => cmd.conf.ownerOnly === true).map(cmd => cmd.help.name).sort().map(cmd => '`'+ cmd + '`');

        const helpEmbed = new RichEmbed()
            .setTitle('Help Information')
            .setDescription(`View help information for ${this.client.user}. \n (Do \`${prefix + cmdName} <command>)\` for specific help information).`)
            .addField('📣 Current Prefix', prefix)
            .addField('💬 Suggestions Channel', suggestionsChannel.toString() || (message.member.hasPermission('MANAGE_GUILD') && !suggestionsChannel ? `***Not set. Use*** \`${prefix + setChannelUsage}\`` : '***Not set. Contact a server administrator.***'))
            .addField('🤖 General Commands', generalCmds.join(' | '));
            if (message.member.hasPermission('MANAGE_GUILD') || message.member.roles.some(r => staffRoles.includes(r))) helpEmbed.addField('🗄 Staff Commands', staffCmds.join(' | '));
            if (message.member.hasPermission('MANAGE_GUILD')) helpEmbed.addField('🛡 Admin Commands', adminCmds.join(' | '));
            if (this.client.isOwner(message.author.id)) helpEmbed.addField('🔒 Owner Commands', ownerCmds.join(' | '));
            helpEmbed.addField('🔖 Documentation', docs)
            .addField('❗ Found an issue?', `Please report any issues to <@${owner}> via the Support Discord: ${discord}.`)
            .setColor(embedColor);

        await message.channel.send(helpEmbed);

    }
};