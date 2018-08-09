const Discord = require('discord.js');
const reactionrem = require('@the-nerd-cave/discord.js-remove-on-reaction');
const config = require('../config.json');
let ORANGE = config.embedOrange;
let PREFIX = config.prefix;

exports.run = (client, message, args) => {

    const sUser = message.member;
    const suggestionsChannel = message.guild.channels.find('name', 'suggestions');
    if (!suggestionsChannel) return message.channel.send('A suggestions channel does not exist! Please create one or contact a server administrator.')
        .then(message => {
            message.delete(3000)
        })
        .catch(error => {
            console.error;
        });

    const embed = new Discord.RichEmbed()
        .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${suggestionsChannel} channel to be voted on!`)
        .setColor(ORANGE)
        .setAuthor(sUser.displayName)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    message.delete().catch(O_o=>{});

    const suggestion = args.join(' ');
    if (!suggestion) return message.channel.send('Incorrect command arguments:' + '`' + `${PREFIX}` + 'suggest <suggestion>' + '`')
        .then(message => {
            message.delete(3000)
        })
        .catch(error => {
            console.error;
        });

    const sEmbed = new Discord.RichEmbed()
        .setTitle(sUser.displayName)
        .setDescription(suggestion)
        .setColor(ORANGE)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    suggestionsChannel.send(sEmbed)
        .then(botmessage => reactionrem(message, botmessage, true))
        .catch(error => {
            console.error
        });

    message.channel.send(embed)
        .then(message => {
            message.delete(5000)
        })
        .catch(error => {
            console.error;
        });
}