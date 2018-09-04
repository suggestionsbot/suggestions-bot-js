const Discord = require('discord.js');
//const reactionrem = require('@the-nerd-cave/discord.js-remove-on-reaction');
const { orange } = require('../config.json');
const moment = require('moment');
const { noSuggestions, noBotPerms } = require('../utils/errors.js');
require('moment-duration-format');
require('moment-timezone');

exports.run = (client, message, args) => {

    const guildConf = client.settings.get(message.guild.id) || defaultSettings;
    const cmdName = client.commands.get('suggest', 'help.name');

    const sUser = message.member;
    const suggestionsChannel = message.guild.channels.find(c => c.name === guildConf.suggestionsChannel) ||  message.guild.channels.find(c => c.toString() === guildConf.suggestionsChannel);
    if (!suggestionsChannel) return noSuggestions(message.channel);

    //if (!message.guild.me.hasPermission('EMBED_LINKS')) return noBotPerms(message , 'EMBED_LINKS');

    const embed = new Discord.RichEmbed()
        .setDescription(`Hey, ${sUser}. Your suggestion has been added in the ${suggestionsChannel} channel to be voted on!`)
        .setColor(orange)
        .setAuthor(sUser.displayName)
        .setFooter(`User ID: ${sUser.id}`)
        .setTimestamp();

    message.delete().catch(O_o=>{});

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

        suggestionsChannel.send(sEmbed)
            .then(async function (message) {
                await message.react(`✅`);
                await message.react(`❌`);
            })
            //.then(botmessage => reactionrem(message, botmessage, true))
            .catch(err => {
                console.log(err);
            });


        console.log(`A new suggestion has been created in:
            Author: ${sUser.user.tag} (ID: ${sUser.id})
            Suggestion: ${suggestion}
            Time: ${submittedOn}
            Channel: ${suggestionsChannel.name}
            Guild: ${message.guild.name} (ID: ${message.guild.id})`);
    }
}

exports.conf = {
    aliases: []
}

exports.help = {
    name: 'suggest',
    description: 'Submit a new suggestion',
    usage: 'suggest <suggestion>'
};