const Discord = require('discord.js');
const { orange } = require('../config.json');
const { noSuggestionsPerms } = require('../utils/errors.js');
const moment = require('moment');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    const guildConf = client.settings.get(message.guild.id);
    const cmdName = client.commands.get('staffsuggest', 'help.name');

    const suggestionsRole = message.guild.roles.find(r => r.name === guildConf.staffRole);
    if (!suggestionsRole) return message.channel.send('A staff role doesn\'t exist! Please create one or contact a server administrator to handle suggestions.').then(message => { message.delete(5000) }).catch(console.error);
    if (!message.member.roles.has(suggestionsRole.id)) return noSuggestionsPerms(message, guildConf.staffRole);

    const sUser = message.member;
    const staffSuggestionsChannel = message.guild.channels.find(c => c.name === guildConf.staffSuggestionsChannel) || message.guild.channels.find(c => c.toString() === guildConf.staffSuggestionsChannel);

    const embed = new Discord.RichEmbed()
        .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${staffSuggestionsChannel} channel to be voted on!`)
        .setColor(orange)
        .setAuthor(sUser.displayName)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    message.delete().catch(O_o => {});

    const suggestion = args.join(' ');
    if (!suggestion) return message.channel.send(`Usage: \`${guildConf.prefix + cmdName} <suggestion>\``).then(message => { message.delete(5000) }).catch(console.error);

    const submittedOn = moment(message.createdAt).tz('America/New_York').format('MM/DD/YY @ h:mm A (z)')

    const sEmbed = new Discord.RichEmbed()
        .setThumbnail(sUser.user.avatarURL)
        .setDescription(`
        **Submitter**
        ${sUser.user.tag}

        **Suggestion**
        ${suggestion}

        **Submitted**
        ${submittedOn}
        `)
        .setColor(orange)
        .setFooter(`User ID: ${sUser.id}`);

    let perms = message.guild.me.permissions;

    if (!perms.has(['EMBED_LINKS', 'ADD_REACTIONS'])) {
        message.channel.send(`I'm missing some permissions!
        
        \`EMBED_LINKS\`
        \`ADD_REACTIONS\``);
    } else {

        message.channel.send(embed).then(message => {
                message.delete(5000)
            })
            .catch(err => {
                console.log(err);
            });

        staffSuggestionsChannel.send(sEmbed)
            .then(async message => {
                await message.react(`✅`);
                await message.react(`❌`);
            })
            .catch(err => {
                console.log(err);
            });

        console.log(`A new staff suggestion has been created in:
            Author: ${sUser.user.tag} (ID: ${sUser.id})
            Suggestion: ${suggestion}
            Time: ${submittedOn}
            Channel: ${staffSuggestionsChannel.name}
            Guild: ${message.guild.name} (ID: ${message.guild.id})`);
    }
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'staffsuggest',
    description: 'Submit a new suggestion for staff members to vote',
    usage: 'staffsuggest <suggestion>'
};