const { RichEmbed } = require('discord.js');
const Settings = require('../models/settings');
const { owner, embedColor, discord, docs } = require('../config');
const { noBotPerms } = require('../utils/errors');
const cmdSeconds = '5';

exports.run = async (client, message, args) => {

    let perms = message.guild.me.permissions;
    if (!perms.has('MANAGE_MESSAGES')) return noBotPerms(message, 'MANAGE_MESSAGES');
    if (!perms.has('EMBED_LINKS')) return noBotPerms(message, 'EMBED_LINKS');

    let cmds = Array.from(client.commands.keys());
    let newCmds = [];

    let cmdName = client.commands.get('help', 'help.name');

    cmds.forEach(cmd => {
        if (cmd === 'maintenance') return;
        if (cmd === 'beta') return;
        if (cmd === 'eval') return;
        if (cmd === 'gblacklist') return;
        if (cmd === 'lockchannel') return;
        if (cmd === 'gsid') return;

        newCmds.push(cmd);
    });

    let cmd = args[0];
    if (cmd) {

        let cmdObj = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
        if (!cmdObj) return;
        let cmdHelp = cmdObj.help;

        let cmdHelpEmbed = new RichEmbed()
            .setTitle(`${cmdHelp.name} | Help Information`)
            .setDescription(cmdHelp.description)
            .addField('Usage', `\`${cmdHelp.usage}\``, true)
            .setColor(embedColor);

        if (cmdHelp.aliases.length) cmdHelpEmbed.addField('Aliases', `\`${cmdHelp.aliases.join(',')}\``, true);

        return message.channel.send(cmdHelpEmbed);
    }

    const helpCmds = newCmds.map(el => {
        return '`' + el + '`';
    });

    let gSettings = await Settings.findOne({ guildID: message.guild.id }).catch(err => {
        console.log(err);
        return message.channel.send(`Error querying the database for this guild's information: **${err.message}**.`);
    });

    let channel = gSettings.suggestionsChannel;
    let prefix = gSettings.prefix;

    const suggestionsChannel = message.guild.channels.find(c => c.name === channel) || message.guild.channels.find(c => c.toString() === channel) || 'None';

    const helpEmbed = new RichEmbed()
        .setTitle('Help Information')
        .setDescription(`View help information for ${client.user}. \n (Do \`${prefix + cmdName} <command>\` for specific help information).`)
        .addField('Current Prefix', prefix)
        .addField('Suggestions Channel', suggestionsChannel)
        .addField('Bot Commands', helpCmds.join(' | '))
        .addField('Command Cooldown', `A ${cmdSeconds} second(s) cooldown is in place on bot commands except for users with the \`MANAGE_GUILD\` permission or users with a bot staff role.`)
        .addField('Documentation', docs)
        .addField('Found an issue?', `Please report any issues to <@${owner}> via the Support Discord: ${discord}.`, false)
        .setColor(embedColor);

    let status = cmdStatus.get('status');
    if (status === 'off') await helpEmbed.addField('Maintenance', 'The bot is currently in maintenance . If you have further questions, please join the Support Discord. Otherwise, the maintenance period should not be that long.');

    await message.channel.send(helpEmbed);
};

exports.help = {
    name: 'help',
    aliases: ['h', 'halp'],
    description: 'View all commands and where to receive bot support.',
    usage: 'help'
};