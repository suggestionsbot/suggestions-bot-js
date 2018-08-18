const Discord = require('discord.js');
const { orange, prefix } = require('../config.json');

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
        .setColor(orange)
        .setAuthor(sUser.displayName)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    message.delete().catch(O_o=>{});

    const suggestion = args.join(' ');
    if (!suggestion) return message.channel.send('Incorrect command arguments:' + '`' + `${prefix}` + 'suggest <suggestion>' + '`')
        .then(message => {
            message.delete(3000)
        })
        .catch(error => {
            console.error;
        });

    const sEmbed = new Discord.RichEmbed()
        .setTitle(sUser.displayName)
        .setDescription(suggestion)
        .setColor(orange)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    suggestionsChannel.send(sEmbed)
        .then(async function (message) {
            await message.react(`✅`);
            await message.react(`❌`);
        })
        //.then(botmessage => reactionrem(message, botmessage, true))
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