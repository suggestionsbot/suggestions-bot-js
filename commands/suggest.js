const Discord = require('discord.js');
const crypto = require('crypto');
const { orange } = require('../config.json');
const moment = require('moment');
const { noSuggestions, noBotPerms } = require('../utils/errors.js');
require('moment-duration-format');
require('moment-timezone');

exports.run = async (client, message, args) => {

    
    const guildConf = client.settings.get(message.guild.id) || defaultSettings;
    const cmdName = client.commands.get('suggest', 'help.name');

    const sUser = message.member;
    const suggestionsChannel = message.guild.channels.find(c => c.name === guildConf.suggestionsChannel) ||  message.guild.channels.find(c => c.toString() === guildConf.suggestionsChannel);
    if (!suggestionsChannel) return noSuggestions(message.channel);

    const id = crypto.randomBytes(20).toString('hex').slice(12,20);

    const dmEmbed = new Discord.RichEmbed()
        .setDescription(`Hey, ${sUser}. Your suggestion has been sent to the ${suggestionsChannel} channel to be voted on!
        
        Please wait until it gets approved or rejected by a staff member.
        
        Your suggestion ID (sID) for reference is **${id}**.
        `)
        .setColor(orange)
        .setTimestamp();

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
        .setFooter(`User ID: ${sUser.id} | sID: ${id}`);

    let perms = message.guild.me.permissions;

    if (!perms.has(['EMBED_LINKS', 'ADD_REACTIONS'])) {
        message.channel.send(`I'm missing some permissions!
        
        \`EMBED_LINKS\`
        \`ADD_REACTIONS\``);
    } else {

        sUser.send(dmEmbed);

        suggestionsChannel.send(sEmbed)
            .then(async message => {
                await message.react(`✅`);
                await message.react(`❌`);
            })
            .catch(err => {
                console.log(err);
            });

        client.suggestions.set(message.guild.id, {submitter: sUser.id, suggestion: suggestion, sID: id});


        console.log(`A new suggestion has been created in:
            Author: ${sUser.user.tag} (ID: ${sUser.id})
            Suggestion: ${suggestion} (ID: ${id})
            Time: ${submittedOn}
            Channel: ${suggestionsChannel.name}
            Guild: ${message.guild.name} (ID: ${message.guild.id})`);

        await message.react('✉');
        await message.delete(3000).catch(O_o=>{});
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