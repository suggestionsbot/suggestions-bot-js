const Discord = require('discord.js');
//const reactionrem = require('@the-nerd-cave/discord.js-remove-on-reaction');
const { orange, prefix } = require('../config.json');
const moment = require('moment');
require('moment-duration-format');
require('moment-timezone');

exports.run = (client, message, args) => {

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;

    const sUser = message.member;
    const suggestionsChannel = message.guild.channels.find(channel => channel.name === guildConf.suggestionsChannel);
    if (!suggestionsChannel) return message.channel.send('A suggestions channel does not exist! Please create one or contact a server administrator.').then(message => { message.delete(3000) }).catch(console.error);

    const embed = new Discord.RichEmbed()
        .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${suggestionsChannel} channel to be voted on!`)
        .setColor(orange)
        .setAuthor(sUser.displayName)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    message.delete().catch(O_o=>{});

    const suggestion = args.join(' ');
    if (!suggestion) return message.channel.send(`Incorrect command arguments: \`${guildConf.prefix} suggest <suggestion>\``).then(message => { message.delete(3000) }).catch(console.error);

    const submittedOn = moment(message.createdAt).tz('America/New_York').format('MMM Do YY hh:mm:ss z')

    const sEmbed = new Discord.RichEmbed()
        //.setAuthor(sUser.user.tag)
        //.setTitle(sUser.displayName)
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
        .setFooter(`User ID: ${sUser.id}`)
        //.setTimestamp();

    suggestionsChannel.send(sEmbed)
        .then(async function (message) {
            await message.react(`✅`);
            await message.react(`❌`);
        })
        //.then(botmessage => reactionrem(message, botmessage, true))
        .catch(error => {
            console.log(error);
        });


    message.channel.send(embed).then(message => { message.delete(5000) }).catch(console.error);
    console.log(`A new suggestion has been created in:
        Author: ${sUser.user.tag} (${sUser.id})
        Suggestion: ${suggestion}
        Time: ${submittedOn}
        Channel: ${suggestionsChannel.name}
        Guild: ${message.guild.name} (${message.guild.id})`);
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'suggest',
    description: 'Submit a new suggestion',
    usage: 'suggest <suggestion>'
};